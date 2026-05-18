import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

// ─────────────────────────────────────────────
// NSE Symbol → BSE Scrip Code mapping (Nifty 50 + common large caps)
// ─────────────────────────────────────────────
const BSE_SCRIP_MAP: Record<string, string> = {
  "RELIANCE.NS": "500325",
  "TCS.NS": "532540",
  "HDFCBANK.NS": "500180",
  "INFY.NS": "500209",
  "ICICIBANK.NS": "532174",
  "HINDUNILVR.NS": "500696",
  "BHARTIARTL.NS": "532454",
  "ITC.NS": "500875",
  "KOTAKBANK.NS": "500247",
  "LT.NS": "500510",
  "SBIN.NS": "500112",
  "AXISBANK.NS": "532215",
  "ASIANPAINT.NS": "500820",
  "MARUTI.NS": "532500",
  "BAJFINANCE.NS": "500034",
  "TITAN.NS": "500114",
  "SUNPHARMA.NS": "524715",
  "WIPRO.NS": "507685",
  "ULTRACEMCO.NS": "532538",
  "BAJAJFINSV.NS": "532978",
  "NESTLEIND.NS": "500790",
  "POWERGRID.NS": "532898",
  "NTPC.NS": "532555",
  "ONGC.NS": "500312",
  "TECHM.NS": "532755",
  "HCLTECH.NS": "532281",
  "DIVISLAB.NS": "532488",
  "DRREDDY.NS": "500124",
  "TATAMOTORS.NS": "500570",
  "TATASTEEL.NS": "500470",
  "JSWSTEEL.NS": "500228",
  "ADANIENT.NS": "512599",
  "ADANIPORTS.NS": "532921",
  "COALINDIA.NS": "533278",
  "BPCL.NS": "500547",
  "GRASIM.NS": "500300",
  "CIPLA.NS": "500087",
  "EICHERMOT.NS": "505200",
  "HEROMOTOCO.NS": "500182",
  "BAJAJ-AUTO.NS": "532977",
  "M&M.NS": "500520",
  "APOLLOHOSP.NS": "508869",
  "BRITANNIA.NS": "500825",
  "INDUSINDBK.NS": "532187",
  "SHRIRAMFIN.NS": "511218",
  "TATACONSUM.NS": "500800",
  "SBILIFE.NS": "540719",
  "HDFCLIFE.NS": "540777",
  "LTIM.NS": "540005",
};

// Simple in-memory cache (15 minutes)
let feedCache: { data: FeedItem[]; ts: number } | null = null;
const CACHE_TTL = 15 * 60 * 1000; // 15 minutes

export interface FeedItem {
  id: string;
  symbol: string;          // NSE symbol e.g. "RELIANCE.NS"
  companyName: string;
  title: string;
  summary: string;
  category: "Earnings" | "Corporate Action" | "Dividend" | "Board Meeting" | "Market News";
  source: "BSE" | "NSE" | "Yahoo";
  url?: string;
  publishedAt: string;     // ISO string
  isPersonalized: boolean; // true = from user's portfolio
}

// ─────────────────────────────────────────────
// BSE Fetcher
// ─────────────────────────────────────────────
async function fetchBSEAnnouncements(scripCodes: string[]): Promise<FeedItem[]> {
  const items: FeedItem[] = [];

  try {
    // BSE Corporate Announcements — all categories, last 30 days
    const url =
      "https://api.bseindia.com/BseIndiaAPI/api/AnnSubCategoryGetData/w?pageno=1&strCat=-1&strPrevDate=&strScrip=&strSearch=P&strToDate=&strType=C&subcategory=-1";

    const res = await fetch(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120 Safari/537.36",
        Referer: "https://www.bseindia.com/",
        Accept: "application/json",
      },
      next: { revalidate: 900 }, // 15 min Next.js cache
    });

    if (!res.ok) throw new Error(`BSE returned ${res.status}`);

    const json = await res.json();
    const announcements: any[] = json?.Table || [];

    // Build reverse map: scripCode → NSE symbol
    const reverseMap: Record<string, string> = {};
    for (const [nse, bse] of Object.entries(BSE_SCRIP_MAP)) {
      reverseMap[bse] = nse;
    }

    for (const ann of announcements.slice(0, 200)) {
      const scripCode = String(ann.SCRIP_CD || "");
      const nseSymbol = reverseMap[scripCode];

      // Determine if this is from user's portfolio
      const isPersonalized = scripCodes.includes(scripCode);

      // Skip if not in portfolio AND not a major company
      if (!isPersonalized && !nseSymbol) continue;

      const rawCategory = (ann.CATEGORYNAME || "").toLowerCase();
      let category: FeedItem["category"] = "Corporate Action";
      if (rawCategory.includes("result") || rawCategory.includes("earning")) category = "Earnings";
      else if (rawCategory.includes("dividend")) category = "Dividend";
      else if (rawCategory.includes("board")) category = "Board Meeting";

      items.push({
        id: `bse-${ann.NEWSID || scripCode + ann.DT_TM}`,
        symbol: nseSymbol || `BSE:${scripCode}`,
        companyName: ann.SLONGNAME || ann.SNAME || "Unknown",
        title: ann.HEADLINE || ann.NEWSSUB || "Corporate Announcement",
        summary: ann.NEWSSUB || ann.HEADLINE || "",
        category,
        source: "BSE",
        url: ann.ATTACHMENTNAME
          ? `https://www.bseindia.com/xml-data/corpfiling/AttachLive/${ann.ATTACHMENTNAME}`
          : `https://www.bseindia.com/corporates/ann.html?scrip=${scripCode}`,
        publishedAt: ann.DT_TM
          ? new Date(ann.DT_TM).toISOString()
          : new Date().toISOString(),
        isPersonalized,
      });
    }
  } catch (err) {
    console.error("BSE fetch error:", err);
  }

  return items;
}

// ─────────────────────────────────────────────
// NSE Fetcher (event calendar — earnings dates)
// ─────────────────────────────────────────────
async function fetchNSEEvents(userSymbols: string[]): Promise<FeedItem[]> {
  const items: FeedItem[] = [];

  try {
    // Step 1: Get session cookie from NSE homepage
    const homeRes = await fetch("https://www.nseindia.com", {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120 Safari/537.36",
        Accept: "text/html",
      },
    });

    const cookies = homeRes.headers.get("set-cookie") || "";

    // Step 2: Fetch event calendar with session cookie
    const eventRes = await fetch(
      "https://www.nseindia.com/api/event-calendar",
      {
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120 Safari/537.36",
          Accept: "application/json",
          Referer: "https://www.nseindia.com/",
          Cookie: cookies,
        },
      }
    );

    if (!eventRes.ok) throw new Error(`NSE returned ${eventRes.status}`);

    const events: any[] = await eventRes.json();

    for (const ev of events.slice(0, 100)) {
      const rawSymbol = `${ev.symbol}.NS`;
      const isPersonalized = userSymbols.includes(rawSymbol);

      if (!isPersonalized && !userSymbols.includes(rawSymbol)) {
        // Only include user's stocks from NSE calendar
        if (!isPersonalized) continue;
      }

      const purpose = (ev.purpose || "").toLowerCase();
      let category: FeedItem["category"] = "Board Meeting";
      if (purpose.includes("result") || purpose.includes("earning"))
        category = "Earnings";
      else if (purpose.includes("dividend")) category = "Dividend";

      items.push({
        id: `nse-${ev.symbol}-${ev.date}`,
        symbol: rawSymbol,
        companyName: ev.company || ev.symbol,
        title: `${ev.company || ev.symbol}: ${ev.purpose || "Board Meeting"}`,
        summary: `Board meeting on ${new Date(ev.date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })} — ${ev.purpose || "Purpose not specified"}`,
        category,
        source: "NSE",
        url: `https://www.nseindia.com/get-quotes/equity?symbol=${ev.symbol}`,
        publishedAt: new Date(ev.date).toISOString(),
        isPersonalized,
      });
    }
  } catch (err) {
    console.error("NSE fetch error:", err);
  }

  return items;
}

// ─────────────────────────────────────────────
// Main Route
// ─────────────────────────────────────────────
export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Return cached data if fresh
  if (feedCache && Date.now() - feedCache.ts < CACHE_TTL) {
    return NextResponse.json({ items: feedCache.data, cached: true });
  }

  // Get user's portfolio symbols
  const assets = await prisma.asset.findMany({
    where: { portfolio: { userId: session.user.id } },
    select: { symbol: true },
  });
  const userSymbols = [...new Set(assets.map((a) => a.symbol))];

  // Convert NSE symbols → BSE scrip codes for the user's stocks
  const userScripCodes = userSymbols
    .map((s) => BSE_SCRIP_MAP[s])
    .filter(Boolean);

  // Fetch from BSE + NSE in parallel
  const [bseItems, nseItems] = await Promise.allSettled([
    fetchBSEAnnouncements(userScripCodes),
    fetchNSEEvents(userSymbols),
  ]);

  const allItems: FeedItem[] = [
    ...(bseItems.status === "fulfilled" ? bseItems.value : []),
    ...(nseItems.status === "fulfilled" ? nseItems.value : []),
  ];

  // Sort: personalized first, then by date descending
  allItems.sort((a, b) => {
    if (a.isPersonalized !== b.isPersonalized) {
      return a.isPersonalized ? -1 : 1;
    }
    return new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime();
  });

  feedCache = { data: allItems, ts: Date.now() };

  return NextResponse.json({ items: allItems, cached: false, userSymbols });
}
