"use client"
import { useState, useEffect, useMemo } from "react"
import { motion, Variants } from "framer-motion"
import { Filter, Wallet } from "lucide-react"
import Link from "next/link"

export function HoldingsClient({ initialPortfolios }: { initialPortfolios: any[] }) {
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

  const globalHoldings: any[] = [];
  const allSymbols = new Set<string>();

  portfolios.forEach(p => {
    const matchesFilter = filterPortfolioId === "ALL" || filterPortfolioId === p.id;
    if (!matchesFilter) return;

    p.assets?.forEach((a: any) => {
      if (a.quantity > 0) {
        const currentPrice = livePrices[a.symbol] || a.averagePrice;
        allSymbols.add(a.symbol);

        globalHoldings.push({
          ...a,
          portfolioName: p.name,
          portfolioId: p.id,
          livePrice: currentPrice,
          totalUnrealized: (currentPrice - a.averagePrice) * a.quantity,
        });
      }
    });
  });

  // Stable memoized key to use as useEffect dependency
  const symbolsKey = useMemo(() => Array.from(allSymbols).sort().join(","), [allSymbols])

  // Fetch Quotes whenever the symbol set changes
  useEffect(() => {
    if (!symbolsKey) return
    fetch(`/api/quotes?symbols=${symbolsKey}`)
      .then(res => res.json())
      .then(data => { if (!data.error) setLivePrices(data) })
      .catch(err => console.error(err))
  }, [symbolsKey])

  return (
    <div className="space-y-8 relative">
      <div className="absolute top-0 left-0 w-full h-[500px] bg-gradient-to-br from-blue-500/10 via-emerald-500/10 to-transparent blur-[100px] -z-10 pointer-events-none rounded-full" />

      {/* Header & Global Actions */}
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-zinc-900 to-zinc-500 dark:from-white dark:to-zinc-500">
            Global Holdings
          </h1>
          <p className="mt-2 text-zinc-500 dark:text-zinc-400 font-medium">All active positions mapped across your filtered environments.</p>
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
        </div>
      </motion.div>

      <motion.div variants={container} initial="hidden" animate="show" className="pt-4">
        {globalHoldings.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 rounded-3xl border-2 border-dashed border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50 text-center">
            <Wallet className="w-8 h-8 text-zinc-400 mb-4" />
            <h3 className="text-xl font-semibold text-zinc-900 dark:text-white">No active holdings matching this filter.</h3>
          </div>
        ) : (
          <div className="bg-white/70 dark:bg-zinc-900/70 backdrop-blur-xl border border-white/50 dark:border-zinc-700/50 shadow-xl shadow-zinc-200/50 dark:shadow-black/20 rounded-3xl overflow-hidden overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[700px]">
              <thead>
                <tr className="border-b border-zinc-200 dark:border-zinc-800 text-sm font-semibold text-zinc-500 dark:text-zinc-400 bg-zinc-50 dark:bg-zinc-800/20">
                  <th className="p-4 pl-6">Portfolio Source</th>
                  <th className="p-4">Symbol / Name</th>
                  <th className="p-4 text-right">Quantity</th>
                  <th className="p-4 text-right">Avg Cost</th>
                  <th className="p-4 text-right">Live Traded Price (₹)</th>
                  <th className="p-4 pr-6 text-right">Unrealized P&L</th>
                </tr>
              </thead>
              <tbody>
                {globalHoldings.map((asset, i) => (
                  <motion.tr variants={item} key={`${asset.id}-${i}`} className="border-b border-zinc-100 dark:border-zinc-800/50 hover:bg-white dark:hover:bg-zinc-800/50 transition-colors">
                    <td className="p-4 pl-6 text-sm font-medium text-zinc-600 dark:text-zinc-300">
                        <Link href={`/portfolios/${asset.portfolioId}`} className="hover:text-indigo-600 dark:hover:text-indigo-400 hover:underline">{asset.portfolioName}</Link>
                    </td>
                    <td className="p-4">
                      <div className="font-bold text-zinc-900 dark:text-white">{asset.symbol}</div>
                      <div className="text-xs text-zinc-500">{asset.name || asset.type}</div>
                    </td>
                    <td className="p-4 text-right font-semibold">{asset.quantity}</td>
                    <td className="p-4 text-right">₹{asset.averagePrice.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</td>
                    <td className="p-4 text-right font-medium text-blue-600 dark:text-blue-400">
                      {livePrices[asset.symbol] ? `₹${livePrices[asset.symbol].toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}` : "Loading..."}
                    </td>
                    <td className={`p-4 pr-6 text-right font-bold ${asset.totalUnrealized >= 0 ? "text-emerald-500" : "text-red-500"}`}>
                        {asset.totalUnrealized >= 0 ? "+" : "-"}₹{Math.abs(asset.totalUnrealized).toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </motion.div>
    </div>
  )
}
