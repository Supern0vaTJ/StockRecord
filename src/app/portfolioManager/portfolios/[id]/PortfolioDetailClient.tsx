"use client"
import { useState, useEffect, useMemo } from "react"
import { motion, Variants } from "framer-motion"
import { Plus, ArrowLeft, History, Trash2, AlertTriangle } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { AddAssetDialog } from "@/components/dashboard/AddAssetDialog"
import { TransactionDialog } from "@/components/dashboard/TransactionDialog"
import { LocalTransactionDialog } from "@/components/dashboard/LocalTransactionDialog"

// ── Confirm-delete inline pill ──────────────────────────────────────────────
function DeleteAssetButton({ assetId, label = "Delete" }: { assetId: string; label?: string }) {
  const router = useRouter()
  const [confirming, setConfirming] = useState(false)
  const [deleting, setDeleting] = useState(false)

  async function handleDelete() {
    setDeleting(true)
    try {
      const res = await fetch(`/api/assets/${assetId}`, { method: "DELETE" })
      if (res.ok || res.status === 204) router.refresh()
    } finally {
      setDeleting(false)
      setConfirming(false)
    }
  }

  if (confirming) {
    return (
      <span className="inline-flex items-center gap-1 text-xs">
        <span className="text-red-600 dark:text-red-400 font-semibold mr-1">Sure?</span>
        <button
          onClick={handleDelete}
          disabled={deleting}
          className="px-2 py-1 rounded-md bg-red-600 text-white text-xs font-semibold hover:bg-red-500 disabled:opacity-50 transition-colors"
        >
          {deleting ? "..." : "Yes"}
        </button>
        <button
          onClick={() => setConfirming(false)}
          className="px-2 py-1 rounded-md border border-zinc-300 dark:border-zinc-700 text-xs font-semibold hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
        >
          No
        </button>
      </span>
    )
  }

  return (
    <button
      onClick={() => setConfirming(true)}
      className="inline-flex items-center gap-1.5 text-sm font-semibold rounded-lg bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 px-3 py-1.5 hover:bg-red-100 dark:hover:bg-red-500/20 transition-colors"
    >
      <Trash2 className="w-3.5 h-3.5" />
      {label}
    </button>
  )
}

// ── Main Component ───────────────────────────────────────────────────────────
export default function PortfolioDetailClient({ portfolio }: { portfolio: any }) {
  const container: Variants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.08 } },
  }
  const item: Variants = {
    hidden: { opacity: 0, y: 16 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } },
  }

  // ── Segment assets into three buckets ──────────────────────────────────────
  const activeAssets = (portfolio.assets ?? []).filter((a: any) => a.quantity > 0)
  const newAssets    = (portfolio.assets ?? []).filter((a: any) => a.quantity === 0 && (!a.transactions || a.transactions.length === 0))
  const soldAssets   = (portfolio.assets ?? []).filter((a: any) => a.quantity === 0 && a.transactions?.length > 0)

  // ── Live prices ─────────────────────────────────────────────────────────────
  const [livePrices, setLivePrices] = useState<Record<string, number>>({})
  const symbolsKey = useMemo(
    () => activeAssets.map((a: any) => a.symbol).sort().join(","),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [activeAssets.length]
  )
  useEffect(() => {
    if (!symbolsKey) return
    fetch(`/api/quotes?symbols=${symbolsKey}`)
      .then(r => r.json())
      .then(d => { if (!d.error) setLivePrices(d) })
      .catch(console.error)
  }, [symbolsKey])

  // ── Aggregate metrics ───────────────────────────────────────────────────────
  let totalCostBasis = 0
  let realizedProfit = 0
  let totalMarketValue = 0

  ;(portfolio.assets ?? []).forEach((a: any) => {
    if (a.quantity > 0) {
      totalCostBasis += a.quantity * a.averagePrice
      totalMarketValue += a.quantity * (livePrices[a.symbol] ?? a.averagePrice)
    }
    a.transactions?.forEach((t: any) => {
      if (t.type === "SELL") realizedProfit += (t.price - a.averagePrice) * t.quantity
    })
  })

  // ── Table header helper ─────────────────────────────────────────────────────
  const Th = ({ children, right }: { children: React.ReactNode; right?: boolean }) => (
    <th className={`p-4 font-medium text-zinc-500 dark:text-zinc-400 ${right ? "text-right" : ""} first:pl-6 last:pr-6`}>
      {children}
    </th>
  )

  return (
    <div className="space-y-10 relative">
      <div className="absolute top-0 left-0 w-full h-[500px] bg-gradient-to-br from-blue-500/10 via-indigo-500/10 to-transparent blur-[100px] -z-10 pointer-events-none rounded-full" />

      {/* Back link */}
      <Link href="/portfolioManager" className="inline-flex items-center text-sm font-medium text-zinc-500 hover:text-zinc-900 dark:hover:text-white transition-colors">
        <ArrowLeft className="w-4 h-4 mr-2" /> Back to Dashboard
      </Link>

      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-zinc-900 to-zinc-500 dark:from-white dark:to-zinc-500">
            {portfolio.name}
          </h1>
          <p className="mt-2 text-zinc-500 dark:text-zinc-400 font-medium">Manage assets and track performance.</p>
        </div>
        <AddAssetDialog portfolioId={portfolio.id}>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="flex items-center gap-2 px-5 py-2.5 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 rounded-full font-semibold shadow-lg shadow-zinc-900/20 dark:shadow-white/20 hover:shadow-xl transition-all"
          >
            <Plus className="w-5 h-5" />
            <span>Add Asset</span>
          </motion.button>
        </AddAssetDialog>
      </motion.div>

      {/* Summary Cards */}
      <motion.div variants={container} initial="hidden" animate="show" className="grid gap-6 md:grid-cols-3">
        {/* Cost Basis */}
        <motion.div variants={item} className="relative overflow-hidden rounded-3xl bg-white/60 dark:bg-zinc-900/60 backdrop-blur-2xl border border-zinc-200/50 dark:border-zinc-800/50 p-6 shadow-xl">
          <h3 className="text-sm font-medium text-zinc-500 dark:text-zinc-400">Total Cost Basis</h3>
          <div className="mt-4">
            <span className="text-3xl font-bold text-zinc-900 dark:text-white">
              ₹{totalCostBasis.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          </div>
        </motion.div>

        {/* Live Market Value */}
        <motion.div variants={item} className="relative overflow-hidden rounded-3xl bg-white/60 dark:bg-zinc-900/60 backdrop-blur-2xl border border-blue-200/50 dark:border-blue-800/50 p-6 shadow-xl shadow-blue-200/20 dark:shadow-black/40">
          <h3 className="text-sm font-medium text-blue-600 dark:text-blue-400">Total Live Market Value</h3>
          <div className="mt-4">
            <span className="text-3xl font-bold text-blue-700 dark:text-blue-400">
              ₹{totalMarketValue.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          </div>
          <p className={`mt-2 text-sm font-medium ${totalMarketValue >= totalCostBasis ? "text-emerald-500" : "text-red-500"}`}>
            {totalMarketValue >= totalCostBasis ? "+" : "-"}₹{Math.abs(totalMarketValue - totalCostBasis).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} unrealized
          </p>
        </motion.div>

        {/* Realized P&L — clickable to show history */}
        <LocalTransactionDialog portfolio={portfolio}>
          <motion.div variants={item} className="h-full relative overflow-hidden group rounded-3xl bg-white/60 dark:bg-zinc-900/60 backdrop-blur-2xl border border-zinc-200/50 dark:border-zinc-800/50 p-6 shadow-xl hover:bg-white dark:hover:bg-zinc-800/80 transition-all duration-300 cursor-pointer">
            <div className="absolute top-0 right-0 p-4 opacity-50 group-hover:opacity-100 transition-opacity">
              <div className={`p-3 rounded-2xl ${realizedProfit < 0 ? "bg-red-500/10 text-red-500" : "bg-emerald-500/10 text-emerald-500"}`}>
                <History className="w-6 h-6" />
              </div>
            </div>
            <h3 className="text-sm font-medium text-zinc-500 dark:text-zinc-400">Realized Total P&L</h3>
            <div className="mt-4">
              <span className={`text-3xl font-bold ${realizedProfit < 0 ? "text-red-500" : "text-emerald-500"}`}>
                {realizedProfit >= 0 ? "+" : "-"}₹{Math.abs(realizedProfit).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            </div>
            <p className="mt-2 text-sm font-medium text-zinc-500">Click to view trade history</p>
          </motion.div>
        </LocalTransactionDialog>
      </motion.div>

      {/* ── SECTION 1: Active Holdings ─────────────────────────────────────── */}
      <motion.div variants={container} initial="hidden" animate="show">
        <h2 className="text-2xl font-bold text-zinc-900 dark:text-white mb-6">Active Holdings</h2>

        {activeAssets.length === 0 ? (
          <motion.div variants={item} className="flex flex-col items-center justify-center py-16 rounded-3xl border-2 border-dashed border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50 text-center">
            <h3 className="text-xl font-semibold text-zinc-900 dark:text-white">No active holdings</h3>
            <p className="mt-2 text-zinc-500 max-w-sm text-sm">Add an asset above, then record a Buy transaction to see it here.</p>
          </motion.div>
        ) : (
          <div className="bg-white/70 dark:bg-zinc-900/70 backdrop-blur-xl border border-white/50 dark:border-zinc-700/50 shadow-xl rounded-3xl overflow-hidden overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[720px]">
              <thead>
                <tr className="border-b border-zinc-200 dark:border-zinc-800 text-sm bg-zinc-50/80 dark:bg-zinc-800/20">
                  <Th>Symbol / Name</Th>
                  <Th>Type</Th>
                  <Th right>Qty</Th>
                  <Th right>Avg Cost</Th>
                  <Th right>LTP (₹)</Th>
                  <Th right>Unrealized P&L</Th>
                  <Th right>Actions</Th>
                </tr>
              </thead>
              <tbody>
                {activeAssets.map((asset: any) => {
                  const lp = livePrices[asset.symbol] ?? asset.averagePrice
                  const delta = lp - asset.averagePrice
                  const unrealized = delta * asset.quantity
                  const pct = (delta / asset.averagePrice) * 100 || 0
                  return (
                    <motion.tr variants={item} key={asset.id} className="border-b border-zinc-100 dark:border-zinc-800/50 last:border-0 hover:bg-zinc-50 dark:hover:bg-zinc-800/30 transition-colors">
                      <td className="p-4 pl-6">
                        <div className="font-bold text-zinc-900 dark:text-white">{asset.symbol}</div>
                        <div className="text-sm text-zinc-500">{asset.name}</div>
                      </td>
                      <td className="p-4">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-200">
                          {asset.type}
                        </span>
                      </td>
                      <td className="p-4 text-right font-semibold">{asset.quantity}</td>
                      <td className="p-4 text-right font-medium">
                        ₹{asset.averagePrice.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </td>
                      <td className="p-4 text-right font-medium text-blue-600 dark:text-blue-400">
                        {livePrices[asset.symbol] !== undefined
                          ? `₹${lp.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
                          : <span className="text-zinc-400 text-xs animate-pulse">Fetching…</span>}
                      </td>
                      <td className={`p-4 text-right font-bold ${unrealized >= 0 ? "text-emerald-500" : "text-red-500"}`}>
                        <div className="text-sm">{unrealized >= 0 ? "+" : "-"}₹{Math.abs(unrealized).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
                        <div className="text-[10px] font-medium opacity-70">{unrealized >= 0 ? "+" : ""}{pct.toFixed(2)}%</div>
                      </td>
                      <td className="p-4 pr-6 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <TransactionDialog asset={asset}>
                            <button className="text-sm font-semibold rounded-lg bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 px-3 py-1.5 hover:bg-indigo-100 dark:hover:bg-indigo-500/20 transition-colors">
                              Trade
                            </button>
                          </TransactionDialog>
                          <DeleteAssetButton assetId={asset.id} label="Delete" />
                        </div>
                      </td>
                    </motion.tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </motion.div>

      {/* ── SECTION 2: New Assets (qty=0, no transactions yet) ─────────────── */}
      {newAssets.length > 0 && (
        <motion.div variants={container} initial="hidden" animate="show">
          <div className="flex items-center gap-3 mb-4">
            <h2 className="text-xl font-bold text-zinc-900 dark:text-white">Pending Assets</h2>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 dark:bg-amber-500/20 dark:text-amber-400">
              <AlertTriangle className="w-3 h-3" />
              No transactions yet
            </span>
          </div>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-5">
            These assets were added but have no buy/sell transactions recorded. Add a <strong>Buy</strong> transaction to move them into Active Holdings.
          </p>
          <div className="bg-white/70 dark:bg-zinc-900/70 backdrop-blur-xl border border-amber-200/60 dark:border-amber-800/40 shadow-xl rounded-3xl overflow-hidden overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[560px]">
              <thead>
                <tr className="border-b border-zinc-200 dark:border-zinc-800 text-sm bg-amber-50/60 dark:bg-amber-900/10">
                  <Th>Symbol / Name</Th>
                  <Th>Type</Th>
                  <Th right>Actions</Th>
                </tr>
              </thead>
              <tbody>
                {newAssets.map((asset: any) => (
                  <motion.tr variants={item} key={asset.id} className="border-b border-zinc-100 dark:border-zinc-800/50 last:border-0 hover:bg-zinc-50 dark:hover:bg-zinc-800/30 transition-colors">
                    <td className="p-4 pl-6">
                      <div className="font-bold text-zinc-900 dark:text-white">{asset.symbol}</div>
                      <div className="text-sm text-zinc-500">{asset.name}</div>
                    </td>
                    <td className="p-4">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-200">
                        {asset.type}
                      </span>
                    </td>
                    <td className="p-4 pr-6 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <TransactionDialog asset={asset}>
                          <button className="text-sm font-semibold rounded-lg bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 px-3 py-1.5 hover:bg-emerald-100 dark:hover:bg-emerald-500/20 transition-colors">
                            Add Buy
                          </button>
                        </TransactionDialog>
                        <DeleteAssetButton assetId={asset.id} label="Delete" />
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      )}

      {/* ── SECTION 3: Exited Positions (qty=0, has transactions) ──────────── */}
      {soldAssets.length > 0 && (
        <motion.div variants={container} initial="hidden" animate="show">
          <h2 className="text-xl font-bold text-zinc-900 dark:text-white mb-2">Exited Positions</h2>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-5">
            Fully sold holdings — transaction history is preserved. You may remove them to declutter.
          </p>
          <div className="bg-white/70 dark:bg-zinc-900/70 backdrop-blur-xl border border-white/50 dark:border-zinc-700/50 shadow-xl rounded-3xl overflow-hidden overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[580px]">
              <thead>
                <tr className="border-b border-zinc-200 dark:border-zinc-800 text-sm bg-zinc-50/80 dark:bg-zinc-800/20">
                  <Th>Symbol / Name</Th>
                  <Th>Type</Th>
                  <Th right>Trades</Th>
                  <Th right>Realized P&L</Th>
                  <Th right>Actions</Th>
                </tr>
              </thead>
              <tbody>
                {soldAssets.map((asset: any) => {
                  const realized = (asset.transactions ?? [])
                    .filter((t: any) => t.type === "SELL")
                    .reduce((s: number, t: any) => s + (t.price - asset.averagePrice) * t.quantity, 0)
                  return (
                    <motion.tr variants={item} key={asset.id} className="border-b border-zinc-100 dark:border-zinc-800/50 last:border-0 hover:bg-zinc-50 dark:hover:bg-zinc-800/30 transition-colors">
                      <td className="p-4 pl-6">
                        <div className="font-bold text-zinc-900 dark:text-white">{asset.symbol}</div>
                        <div className="text-sm text-zinc-500">{asset.name}</div>
                      </td>
                      <td className="p-4">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-200">
                          {asset.type}
                        </span>
                      </td>
                      <td className="p-4 text-right text-sm font-medium text-zinc-500">
                        {asset.transactions?.length ?? 0}
                      </td>
                      <td className={`p-4 text-right font-bold ${realized >= 0 ? "text-emerald-500" : "text-red-500"}`}>
                        {realized >= 0 ? "+" : "-"}₹{Math.abs(realized).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </td>
                      <td className="p-4 pr-6 text-right">
                        <DeleteAssetButton assetId={asset.id} label="Remove" />
                      </td>
                    </motion.tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </motion.div>
      )}

      {/* Empty state — no assets at all */}
      {(portfolio.assets ?? []).length === 0 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center justify-center py-24 rounded-3xl border-2 border-dashed border-zinc-200 dark:border-zinc-800 text-center">
          <h3 className="text-xl font-semibold text-zinc-900 dark:text-white">This portfolio is empty</h3>
          <p className="mt-2 text-zinc-500 text-sm">Click "Add Asset" to start tracking NSE/BSE stocks.</p>
        </motion.div>
      )}
    </div>
  )
}
