"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/Dialog"
import { Input } from "@/components/ui/Input"

export function AddPortfolioDialog({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false)
  const [name, setName] = useState("")
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!name) return
    setLoading(true)
    
    try {
      const res = await fetch("/api/portfolios", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name })
      })

      if (res.ok) {
        setOpen(false)
        setName("")
        router.refresh()
      } else {
        console.error("Failed to create portfolio", await res.text())
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
          <DialogTitle className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 to-purple-500">Create Portfolio</DialogTitle>
          <DialogDescription>
            Give your new portfolio a name to start tracking assets.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={onSubmit} className="space-y-6 mt-4">
          <div className="space-y-2">
            <label htmlFor="name" className="text-sm font-medium leading-none text-zinc-900 dark:text-zinc-300">
              Portfolio Name
            </label>
            <Input
              id="name"
              placeholder="e.g. Retirement, Tech Stocks..."
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="bg-zinc-50/50 dark:bg-zinc-950/50 backdrop-blur-sm border-zinc-200 dark:border-zinc-800 rounded-xl"
              disabled={loading}
              autoFocus
            />
          </div>
          <DialogFooter>
            <button
              type="submit"
              disabled={loading || !name}
              className="inline-flex items-center justify-center rounded-xl bg-zinc-900 dark:bg-white px-8 py-2.5 text-sm font-semibold text-white dark:text-zinc-900 shadow-md transition-colors hover:bg-zinc-800 dark:hover:bg-zinc-100 disabled:opacity-50 disabled:pointer-events-none w-full"
            >
              {loading ? "Creating..." : "Create Portfolio"}
            </button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
