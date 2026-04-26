import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"

// GET /api/portfolios
export async function GET() {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const portfolios = await prisma.portfolio.findMany({
      where: { userId: session.user.id },
      include: {
        assets: {
          select: {
            id: true,
            symbol: true,
            name: true,
            type: true,
            quantity: true,
            averagePrice: true,
          }
        }
      },
      orderBy: { createdAt: "desc" },
    })

    return NextResponse.json(portfolios)
  } catch (error) {
    console.error("[PORTFOLIOS_GET]", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}

// POST /api/portfolios
export async function POST(req: Request) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await req.json()
    const { name } = body

    if (!name) {
      return NextResponse.json({ error: "Portfolio name is required" }, { status: 400 })
    }

    const portfolio = await prisma.portfolio.create({
      data: {
        name,
        userId: session.user.id,
      },
    })

    return NextResponse.json(portfolio)
  } catch (error) {
    console.error("[PORTFOLIOS_POST]", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
