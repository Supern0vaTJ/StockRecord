"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/Dialog"
import { Input } from "@/components/ui/Input"

export function AddAssetDialog({ portfolioId, children }: { portfolioId: string, children: React.ReactNode }) {
  const [open, setOpen] = useState(false)
  const [symbol, setSymbol] = useState("")
  const [name, setName] = useState("")
  const [type, setType] = useState("EQUITY")
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!symbol || !name) return
    setLoading(true)
    
    try {
      const res = await fetch(`/api/portfolios/${portfolioId}/assets`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ symbol: symbol.toUpperCase(), name, type })
      })

      if (res.ok) {
        setOpen(false)
        setSymbol("")
        setName("")
        setType("EQUITY")
        router.refresh()
      } else {
        console.error("Failed to add asset", await res.text())
      }
    } catch (err) {
      console.error(err)
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
          <DialogTitle className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-indigo-500">Track New Asset</DialogTitle>
          <DialogDescription>
            Enter the details of the equity, mutual fund, or crypto you want to track.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={onSubmit} className="space-y-4 mt-4">
          <div className="space-y-2">
            <label htmlFor="symbol" className="text-sm font-medium leading-none text-zinc-900 dark:text-zinc-300">Symbol (Ticker)</label>
            <Input id="symbol" placeholder="e.g. AAPL" value={symbol} onChange={(e) => setSymbol(e.target.value)} disabled={loading} required className="bg-zinc-50/50 dark:bg-zinc-950/50 backdrop-blur-sm border-zinc-200 dark:border-zinc-800 rounded-xl" autoFocus />
          </div>
          <div className="space-y-2">
            <label htmlFor="name" className="text-sm font-medium leading-none text-zinc-900 dark:text-zinc-300">Name</label>
            <Input id="name" placeholder="e.g. Apple Inc." value={name} onChange={(e) => setName(e.target.value)} disabled={loading} required className="bg-zinc-50/50 dark:bg-zinc-950/50 backdrop-blur-sm border-zinc-200 dark:border-zinc-800 rounded-xl" />
          </div>
          <div className="space-y-2">
            <label htmlFor="type" className="text-sm font-medium leading-none text-zinc-900 dark:text-zinc-300">Asset Type</label>
            <select
              id="type"
              value={type}
              onChange={(e) => setType(e.target.value)}
              disabled={loading}
              className="flex h-10 w-full items-center justify-between rounded-xl border border-zinc-200 bg-zinc-50/50 px-3 py-2 text-sm ring-offset-white placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-zinc-950 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:border-zinc-800 dark:bg-zinc-950/50 dark:ring-offset-zinc-950 dark:placeholder:text-zinc-400 dark:focus:ring-zinc-300"
            >
              <option value="EQUITY">Equity (Stock)</option>
              <option value="MUTUAL_FUND">Mutual Fund</option>
              <option value="CRYPTO">Crypto</option>
            </select>
          </div>
          <DialogFooter className="pt-4">
            <button type="submit" disabled={loading || !symbol || !name} className="inline-flex items-center justify-center rounded-xl bg-indigo-600 px-8 py-2.5 text-sm font-semibold text-white shadow-md transition-colors hover:bg-indigo-500 disabled:opacity-50 disabled:pointer-events-none w-full">
              {loading ? "Adding..." : "Add Asset"}
            </button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
