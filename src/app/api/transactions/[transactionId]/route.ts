import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

// PATCH /api/transactions/[transactionId]
export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ transactionId: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { transactionId } = await params;
    const body = await req.json();
    const { quantity, price, date } = body;

    if (quantity === undefined || price === undefined) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }
    if (quantity <= 0 || price < 0) {
      return NextResponse.json({ error: "Invalid quantity or price" }, { status: 400 });
    }

    // Fetch the transaction along with its asset and all sibling transactions
    const transaction = await prisma.transaction.findUnique({
      where: { id: transactionId },
      include: {
        asset: {
          include: {
            portfolio: true,
            transactions: true,
          },
        },
      },
    });

    if (!transaction || transaction.asset.portfolio.userId !== session.user.id) {
      return NextResponse.json({ error: "Transaction not found" }, { status: 404 });
    }

    // Build the updated transaction list (replace edited one in-memory)
    const updatedTransactions = transaction.asset.transactions.map((t) => {
      if (t.id === transactionId) {
        return { ...t, quantity, price, date: date ? new Date(date) : t.date };
      }
      return t;
    });

    // Sort by date then id (stable tiebreaker)
    updatedTransactions.sort((a, b) => {
      const diff = new Date(a.date).getTime() - new Date(b.date).getTime();
      return diff !== 0 ? diff : a.id.localeCompare(b.id);
    });

    // Replay all transactions to recalculate asset state
    let newQuantity = 0;
    let newAveragePrice = 0;

    for (const t of updatedTransactions) {
      if (t.type === "BUY") {
        const totalCost = newQuantity * newAveragePrice + t.quantity * t.price;
        newQuantity += t.quantity;
        newAveragePrice = newQuantity > 0 ? totalCost / newQuantity : 0;
      } else if (t.type === "SELL") {
        newQuantity -= t.quantity;
        if (newQuantity <= 0) {
          newQuantity = 0;
          newAveragePrice = 0;
        }
      }
    }

    // Validate the replay didn't result in negative quantity
    if (newQuantity < 0) {
      return NextResponse.json(
        { error: "Edit would result in negative holdings. Check quantities." },
        { status: 400 }
      );
    }

    // Atomically update transaction + asset
    const [updatedTransaction, updatedAsset] = await prisma.$transaction([
      prisma.transaction.update({
        where: { id: transactionId },
        data: {
          quantity,
          price,
          date: date ? new Date(date) : undefined,
        },
      }),
      prisma.asset.update({
        where: { id: transaction.assetId },
        data: {
          quantity: newQuantity,
          averagePrice: newAveragePrice,
        },
      }),
    ]);

    return NextResponse.json({ transaction: updatedTransaction, asset: updatedAsset });
  } catch (error) {
    console.error("[TRANSACTION_PATCH]", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
