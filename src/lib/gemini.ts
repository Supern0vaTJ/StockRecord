import { GoogleGenerativeAI } from "@google/generative-ai";

const apiKey = process.env.GEMINI_API_KEY;
const genAI = apiKey ? new GoogleGenerativeAI(apiKey) : null;

export async function summarizeNews(title: string, content: string) {
  if (!genAI) {
    return {
      summary: content.slice(0, 150) + "...",
      sentiment: "neutral",
      category: "Market Sentiment"
    };
  }

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

    const prompt = `
      You are a professional financial analyst. Analyze the following Indian stock market news article.
      
      Title: ${title}
      Content: ${content}
      
      Please provide:
      1. A concise 2-sentence summary for a retail investor.
      2. Sentiment: Exactly one of "positive", "neutral", or "negative".
      3. Category: Exactly one of "Earnings", "Acquisition", "Regulatory", "Product Launch", or "Market Sentiment".
      
      Return the result as a clean JSON object with keys: "summary", "sentiment", "category".
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    // Extract JSON from the response (sometimes Gemini wraps it in ```json)
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    
    throw new Error("Could not parse AI response");
  } catch (error) {
    console.error("Gemini summarization error:", error);
    return {
      summary: content.slice(0, 150) + "...",
      sentiment: "neutral",
      category: "Market Sentiment"
    };
  }
}
