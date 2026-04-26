import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

// POST /api/transactions
export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { assetId, type, quantity, price, date } = body;

    if (!assetId || !type || quantity === undefined || price === undefined) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 },
      );
    }

    if (quantity <= 0 || price < 0) {
      return NextResponse.json(
        { error: "Invalid quantity or price" },
        { status: 400 },
      );
    }

    if (type !== "BUY" && type !== "SELL") {
      return NextResponse.json(
        { error: "Invalid transaction type" },
        { status: 400 },
      );
    }

    const asset = await prisma.asset.findUnique({
      where: { id: assetId },
      include: { portfolio: true },
    });

    if (!asset || asset.portfolio.userId !== session.user.id) {
      return NextResponse.json({ error: "Asset not found" }, { status: 404 });
    }

    if (type === "SELL" && asset.quantity < quantity) {
      return NextResponse.json(
        { error: "Insufficient quantity to sell" },
        { status: 400 },
      );
    }

    let newQuantity = asset.quantity;
    let newAveragePrice = asset.averagePrice;

    if (type === "BUY") {
      const totalCost = asset.quantity * asset.averagePrice + quantity * price;
      newQuantity += quantity;
      newAveragePrice = totalCost / newQuantity;
    } else if (type === "SELL") {
      newQuantity -= quantity;
      if (newQuantity === 0) {
        newAveragePrice = 0;
      }
    }

    // Use Prisma transaction to ensure Atomicity
    const [transaction, updatedAsset] = await prisma.$transaction([
      prisma.transaction.create({
        data: {
          assetId,
          type,
          quantity,
          price,
          date: date ? new Date(date) : undefined,
        },
      }),
      prisma.asset.update({
        where: { id: assetId },
        data: {
          quantity: newQuantity,
          averagePrice: newAveragePrice,
        },
      }),
    ]);

    return NextResponse.json({ transaction, asset: updatedAsset });
  } catch (error) {
    console.error("[TRANSACTIONS_POST]", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
