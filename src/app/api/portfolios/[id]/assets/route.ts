import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"

// GET /api/portfolios/[id]/assets
export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id: portfolioId } = await params

    const portfolio = await prisma.portfolio.findUnique({ where: { id: portfolioId } })
    if (!portfolio || portfolio.userId !== session.user.id) {
      return NextResponse.json({ error: "Portfolio not found" }, { status: 404 })
    }

    const assets = await prisma.asset.findMany({
      where: { portfolioId },
      orderBy: { symbol: "asc" },
    })

    return NextResponse.json(assets)
  } catch (error) {
    console.error("[ASSETS_GET]", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}

// POST /api/portfolios/[id]/assets
export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id: portfolioId } = await params
    const body = await req.json()
    const { symbol, name, type } = body

    if (!symbol || !name || !type) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const portfolio = await prisma.portfolio.findUnique({ where: { id: portfolioId } })
    if (!portfolio || portfolio.userId !== session.user.id) {
      return NextResponse.json({ error: "Portfolio not found" }, { status: 404 })
    }

    const existingAsset = await prisma.asset.findUnique({
      where: {
        portfolioId_symbol: {
          portfolioId,
          symbol,
        }
      }
    })

    if (existingAsset) {
      return NextResponse.json({ error: "Asset is already added to this portfolio" }, { status: 400 })
    }

    const asset = await prisma.asset.create({
      data: {
        portfolioId,
        symbol,
        name,
        type,
      },
    })

    return NextResponse.json(asset)
  } catch (error) {
    console.error("[ASSETS_POST]", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
