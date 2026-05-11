import { notFound } from "next/navigation"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import PortfolioDetailClient from "./PortfolioDetailClient"

export default async function PortfolioPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session?.user?.id) return notFound()

  const { id } = await params

  const portfolio = await prisma.portfolio.findUnique({
    where: { id },
    include: {
      assets: {
        orderBy: { createdAt: 'desc' },
        include: {
          transactions: { orderBy: { date: 'desc' } }
        }
      }
    }
  })

  // Ensure authorization
  if (!portfolio || portfolio.userId !== session.user.id) {
    return notFound()
  }

  return <PortfolioDetailClient portfolio={portfolio} />
}
