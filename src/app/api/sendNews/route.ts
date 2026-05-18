import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // 1. Get user's tickers
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

    const userSymbols = Array.from(new Set(assets.map(a => a.symbol)));

    if (userSymbols.length === 0) {
      return NextResponse.json([]);
    }

    // 2. Get news signals for these tickers
    const signals = await prisma.newsSignal.findMany({
      where: {
        symbol: {
          in: userSymbols
        }
      },
      orderBy: {
        publishedAt: "desc"
      },
      take: 50
    });

    return NextResponse.json(signals);
  } catch (error) {
    console.error("Fetch news signals error:", error);
    return NextResponse.json({ error: "Failed to fetch news signals" }, { status: 500 });
  }
}
