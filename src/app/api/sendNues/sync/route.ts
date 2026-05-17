import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import yahooFinance from "yahoo-finance2";
import { summarizeNews } from "@/lib/gemini";

export async function POST() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // 1. Get all unique tickers from the user's portfolios
    const assets = await prisma.asset.findMany({
      where: {
        portfolio: {
          userId: session.user.id
        }
      },
      select: {
        symbol: true
      }
    });

    const uniqueSymbols = Array.from(new Set(assets.map(a => a.symbol)));

    if (uniqueSymbols.length === 0) {
      return NextResponse.json({ message: "No assets found in portfolio" });
    }

    let totalNewSignals = 0;

    // 2. For each ticker, fetch news and process
    for (const symbol of uniqueSymbols) {
      try {
        // Search for news related to the ticker
        const searchResults = await yahooFinance.search(symbol) as any;
        const newsItems: any[] = searchResults?.news || [];

        for (const item of newsItems.slice(0, 3)) { // Limit to top 3 news items per ticker to avoid rate limits
          const newsUrl = item.link;
          const newsTitle = item.title;
          const publishedAt = new Date(item.pubDate || Date.now());

          // Check if this news already exists in our DB
          const existing = await prisma.newsSignal.findFirst({
            where: {
              symbol,
              title: newsTitle
            }
          });

          if (existing) continue;

          // 3. Summarize using Gemini
          const contentForAI = item.publisher + ": " + (item.title || "");
          const aiResult = await summarizeNews(newsTitle, contentForAI);

          // 4. Save to DB
          await prisma.newsSignal.create({
            data: {
              symbol,
              title: newsTitle,
              summary: aiResult.summary,
              fullContent: item.title, // In a real app, we'd scrape the full content if possible
              url: newsUrl,
              source: item.publisher,
              publishedAt,
              sentiment: aiResult.sentiment,
              category: aiResult.category
            }
          });

          totalNewSignals++;
        }
      } catch (err) {
        console.error(`Error processing news for ${symbol}:`, err);
      }
    }

    return NextResponse.json({ 
      message: "Sync completed", 
      newSignals: totalNewSignals 
    });
  } catch (error) {
    console.error("Sync error:", error);
    return NextResponse.json({ error: "Failed to sync news" }, { status: 500 });
  }
}
