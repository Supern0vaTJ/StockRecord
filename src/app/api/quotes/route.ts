import { NextResponse } from "next/server";
import yahooFinance from "yahoo-finance2";
import { auth } from "@/auth";

// GET /api/quotes?symbols=RELIANCE.NS,TCS.NS
export async function GET(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const symbolsParam = searchParams.get("symbols");

    if (!symbolsParam) {
      return NextResponse.json({ error: "Missing symbols" }, { status: 400 });
    }

    const symbols = symbolsParam.split(",").map((s) => s.trim());

    // Fetch quotes using yahoo-finance2
    const quotes = await yahooFinance.quote(symbols) as any;

    // Map to a friendlier dictionary format { "RELIANCE.NS": 2500 }
    const prices: Record<string, number> = {};
    if (Array.isArray(quotes)) {
      quotes.forEach((q) => {
        prices[q.symbol] = q.regularMarketPrice || 0;
      });
    } else if (quotes && quotes.symbol) {
      prices[quotes.symbol] = quotes.regularMarketPrice || 0;
    }

    return NextResponse.json(prices);
  } catch (error) {
    console.error("[API_QUOTES_GET]", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
