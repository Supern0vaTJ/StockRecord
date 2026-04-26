import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { HoldingsClient } from "./HoldingsClient"
import { redirect } from "next/navigation"

export default async function HoldingsPage() {
  const session = await auth()

  if (!session?.user?.id) {
    redirect("/login")
  }

  const portfolios = await prisma.portfolio.findMany({
    where: { userId: session.user.id },
    include: {
      assets: {
        include: { transactions: { orderBy: { date: 'desc' } } }
      }
    },
    orderBy: { createdAt: "desc" }
  })

  return <HoldingsClient initialPortfolios={portfolios} />
}
