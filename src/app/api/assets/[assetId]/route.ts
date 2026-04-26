import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"

// DELETE /api/assets/[assetId]
export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ assetId: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { assetId } = await params

    const asset = await prisma.asset.findUnique({
      where: { id: assetId },
      include: { portfolio: true },
    })

    if (!asset || asset.portfolio.userId !== session.user.id) {
      return NextResponse.json({ error: "Asset not found" }, { status: 404 })
    }

    // Allow deletion of any asset — all transactions cascade-delete via schema
    await prisma.asset.delete({ where: { id: assetId } })

    return new NextResponse(null, { status: 204 })
  } catch (error) {
    console.error("[ASSET_DELETE]", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
