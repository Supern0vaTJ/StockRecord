import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import DashboardClient from "./DashboardClient"

export default async function DashboardPage() {
  const session = await auth()
  
  const portfolios = session?.user?.id 
    ? await prisma.portfolio.findMany({
        where: { userId: session.user.id },
        include: {
          assets: {
            include: { transactions: { orderBy: { date: 'desc' } } }
          }
        },
        orderBy: { createdAt: "desc" }
      })
    : []

  return <DashboardClient initialPortfolios={portfolios} />
}
