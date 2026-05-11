import { NextResponse } from "next/server";

export interface NewsArticle {
  title: string;
  description: string;
  url: string;
  image: string | null;
  publishedAt: string;
  source: { name: string; url: string };
}

const GNEWS_BASE = "https://gnews.io/api/v4";

// In-memory cache to avoid hitting the 100/day limit
let indianCache: { data: NewsArticle[]; timestamp: number } | null = null;
let worldCache: { data: NewsArticle[]; timestamp: number } | null = null;
const CACHE_DURATION = 30 * 60 * 1000; // 30 minutes

function mapArticles(data: any): NewsArticle[] {
  return (data.articles || []).map((a: any) => ({
    title: a.title,
    description: a.description,
    url: a.url,
    image: a.image,
    publishedAt: a.publishedAt,
    source: a.source,
  }));
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const category = searchParams.get("category") || "indian";
  const now = Date.now();
  const apiKey = process.env.GNEWS_API_KEY;

  if (!apiKey || apiKey === "your_gnews_api_key_here") {
    return NextResponse.json([]);
  }

  try {
    if (category === "indian") {
      if (indianCache && now - indianCache.timestamp < CACHE_DURATION) {
        return NextResponse.json(indianCache.data);
      }

      // Search for Indian stock market news
      const params = new URLSearchParams({
        q: "stock market",
        lang: "en",
        country: "in",
        max: "20",
        apikey: apiKey,
      });

      const res = await fetch(`${GNEWS_BASE}/search?${params.toString()}`);
      if (!res.ok) {
        console.error("GNews Indian error:", res.status, await res.text());
        return NextResponse.json([]);
      }

      const data = await res.json();
      const articles = mapArticles(data);
      indianCache = { data: articles, timestamp: now };
      return NextResponse.json(articles);
    } else {
      if (worldCache && now - worldCache.timestamp < CACHE_DURATION) {
        return NextResponse.json(worldCache.data);
      }

      // Use top-headlines with business topic for world news (more reliable)
      const params = new URLSearchParams({
        topic: "business",
        lang: "en",
        max: "20",
        apikey: apiKey,
      });

      const res = await fetch(`${GNEWS_BASE}/top-headlines?${params.toString()}`);
      if (!res.ok) {
        console.error("GNews World error:", res.status, await res.text());
        return NextResponse.json([]);
      }

      const data = await res.json();
      const articles = mapArticles(data);
      worldCache = { data: articles, timestamp: now };
      return NextResponse.json(articles);
    }
  } catch (error) {
    console.error("News fetch error:", error);
    return NextResponse.json([], { status: 500 });
  }
}
