"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/Dialog"

export function LocalTransactionDialog({ portfolio, children }: { portfolio: any, children: React.ReactNode }) {
  const [open, setOpen] = useState(false)

  const transactions: any[] = []
  
  portfolio.assets?.forEach((a: any) => {
    a.transactions?.forEach((t: any) => {
      const profit = t.type === "SELL" ? (t.price - a.averagePrice) * t.quantity : 0;
      transactions.push({
        id: t.id,
        date: t.date,
        symbol: a.symbol,
        type: t.type,
        quantity: t.quantity,
        price: t.price,
        profit
      })
    })
  })

  transactions.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <div className="cursor-pointer">{children}</div>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[700px] overflow-hidden bg-white/90 dark:bg-zinc-950/90 backdrop-blur-2xl border border-white/20 dark:border-white/10 shadow-2xl rounded-3xl max-h-[85vh] flex flex-col p-0">
        <div className="p-6 pb-2 border-b border-zinc-200 dark:border-zinc-800">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-indigo-500">Transaction History ({portfolio.name})</DialogTitle>
            <DialogDescription>
              Chronological ledger of all Buys and Sells executed within this portfolio (in ₹).
            </DialogDescription>
          </DialogHeader>
        </div>
        
        <div className="p-6 overflow-y-auto">
          {transactions.length === 0 ? (
            <div className="text-center py-10 text-zinc-500">No transactions recorded yet.</div>
          ) : (
            <div className="w-full">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-zinc-200 dark:border-zinc-800 text-xs text-zinc-500">
                    <th className="pb-3 border-b font-medium">Date</th>
                    <th className="pb-3 border-b font-medium">Asset</th>
                    <th className="pb-3 border-b font-medium">Type</th>
                    <th className="pb-3 border-b font-medium text-right">Quantity</th>
                    <th className="pb-3 border-b font-medium text-right">Exec Price</th>
                    <th className="pb-3 border-b font-medium text-right">Realized P/L</th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.map((tx) => (
                    <tr key={tx.id} className="border-b border-zinc-100 dark:border-zinc-800/50 hover:bg-zinc-50 dark:hover:bg-zinc-800/20 transition-colors text-sm">
                      <td className="py-4 text-zinc-600 dark:text-zinc-400">
                         {new Date(tx.date).toLocaleDateString()}
                       </td>
                      <td className="py-4 font-bold text-zinc-900 dark:text-white">{tx.symbol}</td>
                      <td className="py-4 font-medium">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] uppercase font-bold tracking-wider ${tx.type === "BUY" ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-500/20 dark:text-emerald-400" : "bg-red-100 text-red-800 dark:bg-red-500/20 dark:text-red-400"}`}>
                          {tx.type}
                        </span>
                      </td>
                      <td className="py-4 text-right">{tx.quantity}</td>
                      <td className="py-4 text-right font-medium">₹{tx.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                      <td className={`py-4 text-right font-bold ${tx.type === "BUY" ? "text-zinc-400 dark:text-zinc-600" : tx.profit >= 0 ? "text-emerald-500" : "text-red-500"}`}>
                        {tx.type === "BUY" ? "-" : `${tx.profit >= 0 ? "+" : "-"}₹${Math.abs(tx.profit).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
