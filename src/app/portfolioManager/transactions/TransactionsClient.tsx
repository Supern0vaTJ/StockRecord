"use client"
import { useState } from "react"
import { motion, Variants } from "framer-motion"
import { Filter, ArrowRightLeft } from "lucide-react"
import Link from "next/link"
import { CsvDownloadDropdown } from "@/components/dashboard/CsvDownloadDropdown"
import { exportToCsv } from "@/lib/exportToCsv"

export function TransactionsClient({ initialPortfolios }: { initialPortfolios: any[] }) {
  const [portfolios] = useState(initialPortfolios)
  const [filterPortfolioId, setFilterPortfolioId] = useState("ALL")

  const container: Variants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.1 } }
  }

  const item: Variants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
  }

  const globalTransactions: any[] = [];

  portfolios.forEach(p => {
    const matchesFilter = filterPortfolioId === "ALL" || filterPortfolioId === p.id;
    if (!matchesFilter) return;

    p.assets?.forEach((a: any) => {
      let qty = 0;
      let avgPrice = 0;
      const sortedTxs = [...(a.transactions || [])].sort((t1, t2) => { const diff = new Date(t1.date).getTime() - new Date(t2.date).getTime(); return diff !== 0 ? diff : t1.id.localeCompare(t2.id); });
      sortedTxs.forEach((t: any) => {
        if (t.type === "BUY") {
          qty += t.quantity;
          avgPrice = (qty === t.quantity) ? t.price : ((qty - t.quantity) * avgPrice + t.quantity * t.price) / qty;
          globalTransactions.push({
            ...t,
            portfolioName: p.name,
            portfolioId: p.id,
            symbol: a.symbol,
            assetName: a.name,
            profit: 0
          });
        } else if (t.type === "SELL") {
          const profit = (t.price - avgPrice) * t.quantity;
          globalTransactions.push({
            ...t,
            portfolioName: p.name,
            portfolioId: p.id,
            symbol: a.symbol,
            assetName: a.name,
            profit
          });
          qty -= t.quantity;
        }
      });
    });
  });

  // Sort descending by date
  globalTransactions.sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const handleDownload = (targetId: string | "ALL") => {
    const filtered = globalTransactions.filter(tx => targetId === "ALL" || tx.portfolioId === targetId);
    if (filtered.length === 0) {
      alert("No transactions to download for this selection.");
      return;
    }
    
    const exportData = filtered.map(tx => ({
      "Date": new Date(tx.date).toLocaleString(),
      "Portfolio Name": tx.portfolioName,
      "Symbol": tx.symbol,
      "Asset Name": tx.assetName,
      "Type": tx.type,
      "Quantity": tx.quantity,
      "Execution Price (₹)": tx.price,
      "Realized P&L (₹)": tx.type === "SELL" ? tx.profit : 0
    }));

    exportData.reverse();
    const filename = targetId === "ALL" ? "Global_Transactions.csv" : `${portfolios.find(p => p.id === targetId)?.name}_Transactions.csv`;
    exportToCsv(filename, exportData);
  }

  return (
    <div className="space-y-8 relative">
      <div className="absolute top-0 left-0 w-full h-[500px] bg-gradient-to-br from-indigo-500/10 via-rose-500/10 to-transparent blur-[100px] -z-10 pointer-events-none rounded-full" />

      {/* Header & Global Actions */}
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-zinc-900 to-zinc-500 dark:from-white dark:to-zinc-500">
            Global Trade History
          </h1>
          <p className="mt-2 text-zinc-500 dark:text-zinc-400 font-medium">A chronological ledger accounting for every execution mapping to your structured portfolios.</p>
        </div>
        
        <div className="flex flex-wrap items-center gap-4">
          <CsvDownloadDropdown label="Download Transactions" portfolios={portfolios} onDownload={handleDownload} />
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
        {globalTransactions.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 rounded-3xl border-2 border-dashed border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50 text-center">
            <ArrowRightLeft className="w-8 h-8 text-zinc-400 mb-4" />
            <h3 className="text-xl font-semibold text-zinc-900 dark:text-white">No transactions recorded.</h3>
          </div>
        ) : (
          <div className="bg-white/70 dark:bg-zinc-900/70 backdrop-blur-xl border border-white/50 dark:border-zinc-700/50 shadow-xl shadow-zinc-200/50 dark:shadow-black/20 rounded-3xl overflow-hidden overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[700px]">
              <thead>
                <tr className="border-b border-zinc-200 dark:border-zinc-800 text-sm font-semibold text-zinc-500 dark:text-zinc-400 bg-zinc-50 dark:bg-zinc-800/20">
                  <th className="p-4 pl-6">Execution Date</th>
                  <th className="p-4">Portfolio Origin</th>
                  <th className="p-4">Instrument</th>
                  <th className="p-4">Direction</th>
                  <th className="p-4 text-right">Volume</th>
                  <th className="p-4 text-right">Filled Price (₹)</th>
                  <th className="p-4 pr-6 text-right">Settled P&L</th>
                </tr>
              </thead>
              <tbody>
                {globalTransactions.map((tx, i) => (
                  <motion.tr variants={item} key={`${tx.id}-${i}`} className="border-b border-zinc-100 dark:border-zinc-800/50 hover:bg-white dark:hover:bg-zinc-800/50 transition-colors text-sm">
                    <td className="p-4 pl-6 text-zinc-500 font-medium whitespace-nowrap">
                      {new Date(tx.date).toLocaleDateString()}
                    </td>
                    <td className="p-4 font-medium text-zinc-600 dark:text-zinc-300">
                      <Link href={`/portfolioManager/portfolios/${tx.portfolioId}`} className="hover:text-indigo-600 dark:hover:text-indigo-400 hover:underline">{tx.portfolioName}</Link>
                    </td>
                    <td className="p-4">
                      <div className="font-bold text-zinc-900 dark:text-white">{tx.symbol}</div>
                      <div className="text-xs text-zinc-500 truncate max-w-[150px]">{tx.assetName}</div>
                    </td>
                    <td className="p-4">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] uppercase font-bold tracking-wider ${tx.type === "BUY" ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-500/20 dark:text-emerald-400" : "bg-red-100 text-red-800 dark:bg-red-500/20 dark:text-red-400"}`}>
                        {tx.type}
                      </span>
                    </td>
                    <td className="p-4 text-right font-medium text-zinc-700 dark:text-zinc-200">{tx.quantity}</td>
                    <td className="p-4 text-right font-medium text-zinc-800 dark:text-zinc-200">
                      ₹{tx.price.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}
                    </td>
                    <td className={`p-4 pr-6 text-right font-bold ${tx.type === "BUY" ? "text-zinc-400 dark:text-zinc-600" : tx.profit >= 0 ? "text-emerald-500" : "text-red-500"}`}>
                      {tx.type === "BUY" ? "—" : `${tx.profit >= 0 ? "+" : "-"}₹${Math.abs(tx.profit).toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}`}
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
