"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/Dialog"

export function SoldAssetsDialog({ portfolios, children }: { portfolios: any[], children: React.ReactNode }) {
  const [open, setOpen] = useState(false)

  const soldTransactions: any[] = []
  
  portfolios?.forEach(p => {
    p.assets?.forEach((a: any) => {
      a.transactions?.forEach((t: any) => {
        if (t.type === "SELL") {
          soldTransactions.push({
            id: t.id,
            date: t.date,
            portfolioName: p.name,
            symbol: a.symbol,
            assetName: a.name,
            quantity: t.quantity,
            price: t.price,
            costBasis: a.averagePrice,
            profit: (t.price - a.averagePrice) * t.quantity
          })
        }
      })
    })
  })

  soldTransactions.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <div className="cursor-pointer">
          {children}
        </div>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[800px] overflow-hidden bg-white/90 dark:bg-zinc-950/90 backdrop-blur-2xl border border-white/20 dark:border-white/10 shadow-2xl rounded-3xl max-h-[85vh] flex flex-col p-0">
        <div className="p-6 pb-2 border-b border-zinc-200 dark:border-zinc-800">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-red-500 to-orange-500">Sold Assets History</DialogTitle>
            <DialogDescription>
              Detailed breakdown of all your sold assets across all portfolios, highlighting your realized profit and loss (in ₹).
            </DialogDescription>
          </DialogHeader>
        </div>
        
        <div className="p-6 overflow-y-auto">
          {soldTransactions.length === 0 ? (
            <div className="text-center py-10 text-zinc-500">No sold assets found.</div>
          ) : (
            <div className="w-full">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-zinc-200 dark:border-zinc-800 text-xs text-zinc-500">
                    <th className="pb-3 border-b font-medium">Date</th>
                    <th className="pb-3 border-b font-medium">Portfolio</th>
                    <th className="pb-3 border-b font-medium">Asset</th>
                    <th className="pb-3 border-b font-medium text-right">Sold Qty</th>
                    <th className="pb-3 border-b font-medium text-right">Sell Price</th>
                    <th className="pb-3 border-b font-medium text-right">Net P/L</th>
                  </tr>
                </thead>
                <tbody>
                  {soldTransactions.map((tx) => (
                    <tr key={tx.id} className="border-b border-zinc-100 dark:border-zinc-800/50 hover:bg-zinc-50 dark:hover:bg-zinc-800/20 transition-colors text-sm">
                      <td className="py-4 text-zinc-600 dark:text-zinc-400">
                         {new Date(tx.date).toLocaleDateString()}
                      </td>
                      <td className="py-4 font-medium text-zinc-800 dark:text-zinc-200">{tx.portfolioName}</td>
                      <td className="py-4 font-bold text-zinc-900 dark:text-white">{tx.symbol}</td>
                      <td className="py-4 text-right">{tx.quantity}</td>
                      <td className="py-4 text-right font-medium">₹{tx.price.toLocaleString()}</td>
                      <td className={`py-4 text-right font-bold ${tx.profit >= 0 ? "text-emerald-500" : "text-red-500"}`}>
                        {tx.profit >= 0 ? "+" : "-"}₹{Math.abs(tx.profit).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
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
