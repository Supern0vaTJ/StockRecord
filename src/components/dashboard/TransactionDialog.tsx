"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/Dialog"
import { Input } from "@/components/ui/Input"

function todayISO() {
  return new Date().toISOString().slice(0, 10)
}

export function TransactionDialog({ asset, children }: { asset: any, children: React.ReactNode }) {
  const [open, setOpen] = useState(false)
  const [type, setType] = useState("BUY")
  const [quantity, setQuantity] = useState("")
  const [price, setPrice] = useState("")
  const [date, setDate] = useState(todayISO)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const router = useRouter()

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError("")
    const qty = parseFloat(quantity)
    const prc = parseFloat(price)
    
    if (isNaN(qty) || isNaN(prc) || qty <= 0 || prc < 0) {
      setError("Please enter valid positive numbers")
      return
    }

    setLoading(true)
    try {
      const res = await fetch(`/api/transactions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          assetId: asset.id, 
          type, 
          quantity: qty, 
          price: prc,
          date: date || undefined
        })
      })

      if (res.ok) {
        setOpen(false)
        setQuantity("")
        setPrice("")
        setDate(todayISO())
        router.refresh()
      } else {
        const data = await res.json()
        setError(data.error || "Failed to submit transaction")
      }
    } catch (err) {
      console.error(err)
      setError("An unexpected error occurred")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] overflow-hidden bg-white/90 dark:bg-zinc-900/90 backdrop-blur-2xl border border-white/20 dark:border-white/10 shadow-2xl rounded-3xl">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-emerald-500 to-teal-500">
            Trade {asset.symbol}
          </DialogTitle>
          <DialogDescription>
            Record a buy or sell transaction for {asset.name}.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={onSubmit} className="space-y-4 mt-4">
          <div className="flex gap-4 p-1 bg-zinc-100/50 dark:bg-zinc-800/50 backdrop-blur-md rounded-xl">
            <button type="button" onClick={() => setType("BUY")} className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all ${type === "BUY" ? "bg-white dark:bg-zinc-700 shadow-sm text-emerald-600 dark:text-emerald-400" : "text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"}`}>Buy</button>
            <button type="button" onClick={() => setType("SELL")} className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all ${type === "SELL" ? "bg-white dark:bg-zinc-700 shadow-sm text-red-600 dark:text-red-400" : "text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"}`}>Sell</button>
          </div>
          <div className="grid grid-cols-2 gap-4">
             <div className="space-y-2">
               <label htmlFor="quantity" className="text-sm font-medium text-zinc-900 dark:text-zinc-300">Quantity</label>
               <Input id="quantity" type="number" step="any" min="0" placeholder="e.g. 10.5" value={quantity} onChange={(e) => setQuantity(e.target.value)} disabled={loading} required className="bg-zinc-50/50 dark:bg-zinc-950/50 rounded-xl" autoFocus />
             </div>
             <div className="space-y-2">
               <label htmlFor="price" className="text-sm font-medium text-zinc-900 dark:text-zinc-300">Price per unit (₹)</label>
               <Input id="price" type="number" step="any" min="0" placeholder="e.g. 150.00" value={price} onChange={(e) => setPrice(e.target.value)} disabled={loading} required className="bg-zinc-50/50 dark:bg-zinc-950/50 rounded-xl" />
             </div>
          </div>
          <div className="space-y-2">
            <label htmlFor="tradeDate" className="text-sm font-medium text-zinc-900 dark:text-zinc-300">Trade Date</label>
            <Input id="tradeDate" type="date" value={date} onChange={(e) => setDate(e.target.value)} disabled={loading} required className="bg-zinc-50/50 dark:bg-zinc-950/50 rounded-xl" />
          </div>
          {error && <p className="text-sm text-red-500 font-medium">{error}</p>}
          <DialogFooter className="pt-4">
            <button type="submit" disabled={loading || !quantity || !price} className={`inline-flex items-center justify-center rounded-xl px-8 py-2.5 text-sm font-semibold text-white shadow-md transition-colors disabled:opacity-50 disabled:pointer-events-none w-full ${type === "BUY" ? "bg-emerald-600 hover:bg-emerald-500" : "bg-red-600 hover:bg-red-500"}`}>
              {loading ? "Processing..." : `Confirm ${type}`}
            </button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
