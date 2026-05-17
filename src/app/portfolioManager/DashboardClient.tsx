"use client"
import { useState, useEffect, useMemo } from "react"
import { motion, Variants } from "framer-motion"
import { Plus, ArrowUpRight, TrendingUp, Wallet, Activity, Briefcase, History, Filter, Pencil } from "lucide-react"
import { AddPortfolioDialog } from "@/components/dashboard/AddPortfolioDialog"
import { EditPortfolioDialog } from "@/components/dashboard/EditPortfolioDialog"
import { SoldAssetsDialog } from "@/components/dashboard/SoldAssetsDialog"
import Link from "next/link"

export default function DashboardClient({ initialPortfolios }: { initialPortfolios: any[] }) {
  const [portfolios] = useState(initialPortfolios)
  const [filterPortfolioId, setFilterPortfolioId] = useState("ALL")
  const [livePrices, setLivePrices] = useState<Record<string, number>>({})

  const container: Variants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.1 } }
  }

  const item: Variants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
  }

  // Memoize filtered portfolios to avoid recalculation on every render
  const filteredPortfolios = useMemo(
    () => portfolios.filter(p => filterPortfolioId === "ALL" || p.id === filterPortfolioId),
    [portfolios, filterPortfolioId]
  )

  // Collect all unique symbols from active (qty > 0) assets across filtered portfolios
  const allSymbols = useMemo(() => {
    const s = new Set<string>()
    filteredPortfolios.forEach(p => {
      p.assets?.forEach((a: any) => { if (a.quantity > 0) s.add(a.symbol) })
    })
    return s
  }, [filteredPortfolios])

  // Derived filtered metrics
  let totalCostBasis = 0
  let totalLiveValue = 0
  let activeAssetCount = 0
  let globalNetProfit = 0

  filteredPortfolios.forEach(p => {
    p.assets?.forEach((a: any) => {
      a.transactions?.forEach((t: any) => {
        if (t.type === "SELL") {
          globalNetProfit += ((t.price - a.averagePrice) * t.quantity)
        }
      })
      if (a.quantity > 0) {
        totalCostBasis += (a.quantity * a.averagePrice)
        activeAssetCount++
        const currentPrice = livePrices[a.symbol] || a.averagePrice
        totalLiveValue += (a.quantity * currentPrice)
      }
    })
  })

  // Fetch Quotes whenever the symbol set changes
  const symbolsKey = useMemo(() => Array.from(allSymbols).sort().join(","), [allSymbols])
  useEffect(() => {
    if (!symbolsKey) return
    fetch(`/api/quotes?symbols=${symbolsKey}`)
      .then(res => res.json())
      .then(data => { if (!data.error) setLivePrices(data) })
      .catch(err => console.error(err))
  }, [symbolsKey])

  const totalUnrealizedValue = totalLiveValue - totalCostBasis
  const formattedTotalValue = `₹${totalLiveValue.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
  const formattedNetProfit = `${globalNetProfit >= 0 ? "+" : "-"}₹${Math.abs(globalNetProfit).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`

  return (
    <div className="space-y-8 relative">
      <div className="absolute top-0 left-0 w-full h-[500px] bg-gradient-to-br from-indigo-500/20 via-purple-500/20 to-fuchsia-500/20 blur-[100px] -z-10 pointer-events-none rounded-full" />

      {/* Header & Global Actions */}
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <div className="p-2 rounded-xl bg-zinc-900 dark:bg-zinc-50 text-white dark:text-zinc-900">
              <Briefcase className="w-5 h-5" />
            </div>
            <h1 className="text-2xl font-black text-zinc-900 dark:text-white tracking-tight">
              Portfolio <span className="text-indigo-600 dark:text-indigo-400">Dashboard</span>
            </h1>
          </div>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 ml-12">Keep track of your NSE/BSE investments seamlessly.</p>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 bg-white/60 dark:bg-zinc-900/60 backdrop-blur-md rounded-2xl border border-zinc-200 dark:border-zinc-800 px-3 py-1.5 shadow-sm">
            <Filter className="w-4 h-4 text-zinc-500" />
            <select
              value={filterPortfolioId}
              onChange={(e) => setFilterPortfolioId(e.target.value)}
              className="bg-transparent border-none focus:ring-0 text-sm font-semibold text-zinc-800 dark:text-zinc-200 cursor-pointer outline-none w-[160px] truncate"
            >
              <option value="ALL">All Portfolios</option>
              {portfolios.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
          </div>
          
          <AddPortfolioDialog>
            <motion.button 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex items-center gap-2 px-5 py-2.5 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 rounded-full font-semibold shadow-lg shadow-zinc-900/20 dark:shadow-white/20 transition-all hover:shadow-xl shrink-0"
            >
              <Plus className="w-5 h-5" />
              <span className="hidden sm:inline">New Portfolio</span>
            </motion.button>
          </AddPortfolioDialog>
        </div>
      </motion.div>

      {/* Metrics Row */}
      <motion.div variants={container} initial="hidden" animate="show" className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {[
          {
            title: "Total Live Value",
            value: formattedTotalValue,
            extra: `Cost Basis: ₹${totalCostBasis.toLocaleString("en-IN", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`,
            trend: `${totalUnrealizedValue >= 0 ? "+" : "-"}₹${Math.abs(totalUnrealizedValue).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} unrealized`,
            icon: Wallet,
            color: "text-blue-500",
            bg: "bg-blue-500/10",
            isDialog: false,
          },
          {
            title: "Sold Assets P&L",
            value: formattedNetProfit,
            trend: "Click to review global sales",
            icon: History,
            color: globalNetProfit < 0 ? "text-red-500" : "text-emerald-500",
            bg: globalNetProfit < 0 ? "bg-red-500/10" : "bg-emerald-500/10",
            isDialog: true,
          },
          {
            title: "Unrealized Gain/Loss",
            value: `${totalUnrealizedValue >= 0 ? "+" : "-"}₹${Math.abs(totalUnrealizedValue).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
            trend: totalCostBasis > 0 ? `${((totalUnrealizedValue / totalCostBasis) * 100).toFixed(2)}% return` : "No holdings",
            icon: TrendingUp,
            color: totalUnrealizedValue >= 0 ? "text-purple-500" : "text-red-500",
            bg: totalUnrealizedValue >= 0 ? "bg-purple-500/10" : "bg-red-500/10",
            isDialog: false,
          },
          {
            title: "Active Holdings",
            value: activeAssetCount.toString(),
            trend: `Across ${filteredPortfolios.length} portfolio${filteredPortfolios.length !== 1 ? "s" : ""}`,
            icon: Activity,
            color: "text-orange-500",
            bg: "bg-orange-500/10",
            isDialog: false,
          },
        ].map((metric, i) => {
          
          const CardContent = (
            <motion.div key={i} variants={item} className="h-full relative overflow-hidden group rounded-3xl bg-white/60 dark:bg-zinc-900/60 backdrop-blur-2xl border border-zinc-200/50 dark:border-zinc-800/50 p-6 shadow-xl shadow-zinc-200/20 dark:shadow-black/40 hover:bg-white dark:hover:bg-zinc-800/80 transition-all duration-300">
              <div className="absolute top-0 right-0 p-4 opacity-50 group-hover:opacity-100 transition-opacity">
                <div className={`p-3 rounded-2xl ${metric.bg} ${metric.color}`}>
                  <metric.icon className="w-6 h-6" />
                </div>
              </div>
              <h3 className="text-sm font-medium text-zinc-500 dark:text-zinc-400">{metric.title}</h3>
              <div className="mt-4 flex items-baseline gap-2">
                <span className={`text-3xl font-bold ${["Sold Assets P&L", "Unrealized Gain/Loss"].includes(metric.title) ? metric.color : "text-zinc-900 dark:text-white"}`}>{metric.value}</span>
              </div>
              {metric.extra && <div className="mt-1 text-sm font-semibold text-zinc-600 dark:text-zinc-400">{metric.extra}</div>}
              <p className={`mt-1 text-sm font-medium ${["Sold Assets P&L", "Unrealized Gain/Loss"].includes(metric.title) ? metric.color : (metric.title === "Total Live Value" && totalUnrealizedValue < 0) ? "text-red-500" : "text-emerald-500"}`}>
                {metric.trend}
              </p>
            </motion.div>
          )

          if (metric.isDialog) {
            return (
              <SoldAssetsDialog key={i} portfolios={portfolios}>
                {CardContent}
              </SoldAssetsDialog>
            )
          }

          return CardContent
        })}
      </motion.div>

      {/* OVERVIEW GRID */}
      <motion.div variants={container} initial="hidden" animate="show" className="mt-12">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-zinc-900 dark:text-white">Your Portfolios</h2>
          <span className="text-sm text-zinc-500 dark:text-zinc-400">{filteredPortfolios.length} portfolio{filteredPortfolios.length !== 1 ? "s" : ""}</span>
        </div>

        {filteredPortfolios.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 rounded-3xl border-2 border-dashed border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50 text-center">
            <Briefcase className="w-8 h-8 text-zinc-400 mb-4" />
            <h3 className="text-xl font-semibold text-zinc-900 dark:text-white">No portfolios yet</h3>
            <p className="mt-2 text-sm text-zinc-500">Click "New Portfolio" to create your first one.</p>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredPortfolios.map((portfolio) => {
              const pActiveAssets = portfolio.assets?.filter((a: any) => a.quantity > 0) || []
              
              // Portfolio-level cost basis and live value
              let pCost = 0
              let pLiveValue = 0
              let pRealizedPnl = 0
              pActiveAssets.forEach((a: any) => {
                pCost += a.quantity * a.averagePrice
                const lp = livePrices[a.symbol] || a.averagePrice
                pLiveValue += a.quantity * lp
              })
              portfolio.assets?.forEach((a: any) => {
                a.transactions?.forEach((t: any) => {
                  if (t.type === "SELL") pRealizedPnl += (t.price - a.averagePrice) * t.quantity
                })
              })
              const pUnrealized = pLiveValue - pCost

              return (
                <motion.div variants={item} key={portfolio.id} className="group relative rounded-3xl bg-white/70 dark:bg-zinc-900/70 backdrop-blur-xl border border-white/50 dark:border-zinc-700/50 p-6 shadow-xl shadow-zinc-200/50 dark:shadow-black/50 overflow-hidden hover:shadow-2xl transition-all duration-300">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-indigo-500/20 to-purple-500/20 blur-2xl -z-10 group-hover:scale-150 transition-transform duration-500" />
                  
                  {/* Header row with title + edit button */}
                  <div className="flex items-start justify-between gap-2 mb-4">
                    <Link href={`/portfolioManager/portfolios/${portfolio.id}`} className="flex-1 min-w-0">
                      <h3 className="text-xl font-bold text-zinc-900 dark:text-white group-hover:text-indigo-500 transition-colors truncate">{portfolio.name}</h3>
                      <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-0.5">{pActiveAssets.length} active holding{pActiveAssets.length !== 1 ? "s" : ""}</p>
                    </Link>
                    <EditPortfolioDialog portfolio={portfolio}>
                      <button className="shrink-0 p-2 rounded-xl text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors opacity-0 group-hover:opacity-100">
                        <Pencil className="w-4 h-4" />
                      </button>
                    </EditPortfolioDialog>
                  </div>

                  {/* Stats */}
                  <div className="grid grid-cols-2 gap-3 mb-4">
                    <div className="rounded-2xl bg-zinc-50 dark:bg-zinc-800/60 p-3">
                      <p className="text-[10px] font-semibold uppercase tracking-wider text-zinc-400 mb-1">Cost Basis</p>
                      <p className="text-sm font-bold text-zinc-800 dark:text-zinc-100">₹{pCost.toLocaleString("en-IN", { maximumFractionDigits: 0 })}</p>
                    </div>
                    <div className="rounded-2xl bg-zinc-50 dark:bg-zinc-800/60 p-3">
                      <p className="text-[10px] font-semibold uppercase tracking-wider text-zinc-400 mb-1">Live Value</p>
                      <p className="text-sm font-bold text-blue-600 dark:text-blue-400">₹{pLiveValue.toLocaleString("en-IN", { maximumFractionDigits: 0 })}</p>
                    </div>
                    <div className="rounded-2xl bg-zinc-50 dark:bg-zinc-800/60 p-3">
                      <p className="text-[10px] font-semibold uppercase tracking-wider text-zinc-400 mb-1">Unrealized</p>
                      <p className={`text-sm font-bold ${pUnrealized >= 0 ? "text-emerald-500" : "text-red-500"}`}>
                        {pUnrealized >= 0 ? "+" : "-"}₹{Math.abs(pUnrealized).toLocaleString("en-IN", { maximumFractionDigits: 0 })}
                      </p>
                    </div>
                    <div className="rounded-2xl bg-zinc-50 dark:bg-zinc-800/60 p-3">
                      <p className="text-[10px] font-semibold uppercase tracking-wider text-zinc-400 mb-1">Realized P&L</p>
                      <p className={`text-sm font-bold ${pRealizedPnl >= 0 ? "text-emerald-500" : "text-red-500"}`}>
                        {pRealizedPnl >= 0 ? "+" : "-"}₹{Math.abs(pRealizedPnl).toLocaleString("en-IN", { maximumFractionDigits: 0 })}
                      </p>
                    </div>
                  </div>

                  {/* View link */}
                  <Link href={`/portfolioManager/portfolios/${portfolio.id}`} className="flex items-center justify-end text-sm font-semibold text-zinc-500 dark:text-zinc-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors group/link">
                    View Details
                    <ArrowUpRight className="w-4 h-4 ml-1 translate-y-0.5 group-hover/link:-translate-y-0.5 group-hover/link:translate-x-0.5 transition-transform" />
                  </Link>
                </motion.div>
              )
            })}
          </div>
        )}
      </motion.div>
    </div>
  )
}
