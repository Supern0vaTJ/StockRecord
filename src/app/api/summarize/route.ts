import { NextResponse } from "next/server";
import Groq from "groq-sdk";
import { GoogleGenerativeAI } from "@google/generative-ai";

// ---------- Provider Setup ----------
const groqKey = process.env.GROQ_API_KEY;
const geminiKey = process.env.GEMINI_API_KEY;

const groq = groqKey ? new Groq({ apiKey: groqKey }) : null;
const genAI = geminiKey ? new GoogleGenerativeAI(geminiKey) : null;

const SUMMARIZE_PROMPT = `You are a senior financial analyst covering Indian equity markets. Your job is to extract only the most critical numbers and decisions from a financial document and present them in a tight, data-dense paragraph — no fluff.

Rules (follow strictly):
1. Maximum 15 sentences. Aim for 8–12 for most documents.
2. Lead with: company name, document type, and reporting period.
3. Prioritise hard numbers: Revenue, Net Profit, EBITDA, EPS, margins, YoY or QoQ growth/decline. Include every significant metric stated in the document.
4. Mention key strategic moves, acquisitions, guidance, or order books ONLY if they are explicitly stated and materially significant.
5. Include 1 sentence on risks or concerns if clearly stated.
6. End with exactly one sentence labelled "Investor Takeaway:" giving a clear signal — Positive, Neutral, or Cautionary — with a one-line rationale.
7. Express all monetary values in Indian format (₹ Crore or ₹ Lakh Crore).
8. Write in concise flowing sentences — NO bullet points, NO headings, NO repetition.
9. Do NOT fabricate or guess any numbers. Only report what is explicitly stated in the document.`;

// ---------- PDF Text Extraction (local, no API needed) ----------
async function extractTextFromPDF(buffer: ArrayBuffer): Promise<string> {
  // ⚠️ IMPORTANT: import the internal lib file directly.
  // pdf-parse@1.1.1 runs a test on the main entry that tries to open
  // "test/data/05-versions-space.pdf" relative to CWD, which fails in Next.js.
  // Importing the lib file directly bypasses that broken initialization.
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const pdfParse = require('pdf-parse/lib/pdf-parse.js');

  const parserFn = typeof pdfParse === 'function' ? pdfParse : pdfParse.default;

  if (typeof parserFn !== 'function') {
    throw new Error(`pdf-parse is not a function. Got: ${typeof parserFn}`);
  }

  const data = await parserFn(Buffer.from(buffer));
  return data.text;
}

// ---------- AI Providers ----------
async function summarizeWithGroq(text: string): Promise<string> {
  if (!groq) throw new Error("Groq not configured");

  // Groq has a context limit — truncate to ~28k chars (~7k tokens)
  const truncated = text.slice(0, 28000);

  const completion = await groq.chat.completions.create({
    model: "llama-3.3-70b-versatile",
    messages: [
      { role: "system", content: SUMMARIZE_PROMPT },
      { role: "user", content: `Here is the document content to summarize:\n\n${truncated}` },
    ],
    temperature: 0.3,
    max_tokens: 2048,
  });

  return completion.choices[0]?.message?.content || "No summary generated.";
}

async function summarizeWithGemini(text: string): Promise<string> {
  if (!genAI) throw new Error("Gemini not configured");

  const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
  const truncated = text.slice(0, 40000);

  const result = await model.generateContent([
    { text: `${SUMMARIZE_PROMPT}\n\nDocument Content:\n${truncated}` },
  ]);

  return result.response.text();
}

// Tries Groq first, then Gemini as fallback
async function summarizeText(text: string): Promise<{ summary: string; provider: string }> {
  // Try Groq first (faster, more generous free limits)
  if (groq) {
    try {
      const summary = await summarizeWithGroq(text);
      return { summary, provider: "Groq (Llama 3.3 70B)" };
    } catch (err: any) {
      console.warn("Groq failed, falling back to Gemini:", err.message);
    }
  }

  // Fallback to Gemini
  if (genAI) {
    try {
      const summary = await summarizeWithGemini(text);
      return { summary, provider: "Gemini 2.0 Flash" };
    } catch (err: any) {
      console.warn("Gemini also failed:", err.message);
      throw err;
    }
  }

  throw new Error("No AI provider configured. Please add GROQ_API_KEY or GEMINI_API_KEY to your .env.local file.");
}

// ---------- API Route ----------
export async function POST(req: Request) {
  if (!groq && !genAI) {
    return NextResponse.json(
      { error: "No AI provider configured. Add GROQ_API_KEY or GEMINI_API_KEY to .env.local." },
      { status: 500 }
    );
  }

  try {
    const contentType = req.headers.get("content-type") || "";

    if (contentType.includes("application/json")) {
      // --- URL Mode ---
      const { url } = await req.json();
      if (!url) {
        return NextResponse.json({ error: "No URL provided." }, { status: 400 });
      }

      const fetchRes = await fetch(url, {
        headers: { "User-Agent": "Mozilla/5.0 (StockRecord/1.0)" },
      });
      if (!fetchRes.ok) {
        return NextResponse.json(
          { error: `Could not fetch the URL. Status: ${fetchRes.status}` },
          { status: 400 }
        );
      }

      const urlContentType = fetchRes.headers.get("content-type") || "";
      let documentText: string;

      if (urlContentType.includes("application/pdf")) {
        const buffer = await fetchRes.arrayBuffer();
        documentText = await extractTextFromPDF(buffer);
      } else {
        const html = await fetchRes.text();
        documentText = html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ");
      }

      if (!documentText || documentText.trim().length < 50) {
        return NextResponse.json(
          { error: "Could not extract meaningful text from this document." },
          { status: 400 }
        );
      }

      const result = await summarizeText(documentText);
      return NextResponse.json({ summary: result.summary, provider: result.provider });

    } else if (contentType.includes("multipart/form-data")) {
      // --- PDF File Upload Mode ---
      const formData = await req.formData();
      const file = formData.get("file") as File | null;

      if (!file) {
        return NextResponse.json({ error: "No file uploaded." }, { status: 400 });
      }
      if (file.type !== "application/pdf") {
        return NextResponse.json({ error: "Only PDF files are supported." }, { status: 400 });
      }
      if (file.size > 20 * 1024 * 1024) {
        return NextResponse.json(
          { error: "File too large. Please upload a PDF smaller than 20MB." },
          { status: 400 }
        );
      }

      const buffer = await file.arrayBuffer();
      const documentText = await extractTextFromPDF(buffer);

      if (!documentText || documentText.trim().length < 50) {
        return NextResponse.json(
          { error: "Could not extract meaningful text from this PDF. It might be scanned/image-based." },
          { status: 400 }
        );
      }

      const result = await summarizeText(documentText);
      return NextResponse.json({
        summary: result.summary,
        provider: result.provider,
        fileName: file.name,
        fileSize: file.size,
      });

    } else {
      return NextResponse.json({ error: "Unsupported content type." }, { status: 400 });
    }
  } catch (error: any) {
    console.error("Summarize API error:", error);

    const is429 = error?.message?.includes("429") || error?.message?.includes("quota") || error?.message?.includes("rate");
    if (is429) {
      return NextResponse.json(
        { error: "AI rate limit reached. Please wait about 1 minute and try again." },
        { status: 429 }
      );
    }

    return NextResponse.json(
      { error: error?.message || "Failed to generate summary." },
      { status: 500 }
    );
  }
}
