"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/Dialog"
import { Input } from "@/components/ui/Input"
import { Pencil } from "lucide-react"

interface EditTransactionDialogProps {
  transaction: {
    id: string
    type: string
    quantity: number
    price: number
    date: string
  }
  symbol: string
}

function toDateInputValue(dateStr: string) {
  return new Date(dateStr).toISOString().slice(0, 10)
}

export function EditTransactionDialog({ transaction, symbol }: EditTransactionDialogProps) {
  const [open, setOpen] = useState(false)
  const [quantity, setQuantity] = useState(transaction.quantity.toString())
  const [price, setPrice] = useState(transaction.price.toString())
  const [date, setDate] = useState(toDateInputValue(transaction.date))
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
      const res = await fetch(`/api/transactions/${transaction.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ quantity: qty, price: prc, date: date || undefined }),
      })

      if (res.ok) {
        setOpen(false)
        router.refresh()
      } else {
        const data = await res.json()
        setError(data.error || "Failed to update transaction")
      }
    } catch (err) {
      console.error(err)
      setError("An unexpected error occurred")
    } finally {
      setLoading(false)
    }
  }

  function onOpenChange(val: boolean) {
    if (!val) {
      // Reset to original values on close
      setQuantity(transaction.quantity.toString())
      setPrice(transaction.price.toString())
      setDate(toDateInputValue(transaction.date))
      setError("")
    }
    setOpen(val)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <button
          title="Edit transaction"
          className="inline-flex items-center gap-1 p-1.5 rounded-lg text-zinc-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
        >
          <Pencil className="w-3.5 h-3.5" />
        </button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[400px] bg-white/90 dark:bg-zinc-900/90 backdrop-blur-2xl border border-white/20 dark:border-white/10 shadow-2xl rounded-3xl">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 to-violet-500">
            Edit Transaction
          </DialogTitle>
          <DialogDescription>
            Editing{" "}
            <span className={`font-semibold ${transaction.type === "BUY" ? "text-emerald-500" : "text-red-500"}`}>
              {transaction.type}
            </span>{" "}
            for <span className="font-semibold text-zinc-800 dark:text-zinc-200">{symbol}</span>.
            Transaction type cannot be changed.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={onSubmit} className="space-y-4 mt-2">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label htmlFor="edit-quantity" className="text-sm font-medium text-zinc-900 dark:text-zinc-300">
                Quantity
              </label>
              <Input
                id="edit-quantity"
                type="number"
                step="any"
                min="0.0001"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                disabled={loading}
                required
                className="bg-zinc-50/50 dark:bg-zinc-950/50 rounded-xl"
                autoFocus
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="edit-price" className="text-sm font-medium text-zinc-900 dark:text-zinc-300">
                Price per unit (₹)
              </label>
              <Input
                id="edit-price"
                type="number"
                step="any"
                min="0"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                disabled={loading}
                required
                className="bg-zinc-50/50 dark:bg-zinc-950/50 rounded-xl"
              />
            </div>
          </div>
          <div className="space-y-2">
            <label htmlFor="edit-date" className="text-sm font-medium text-zinc-900 dark:text-zinc-300">
              Trade Date
            </label>
            <Input
              id="edit-date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              disabled={loading}
              required
              className="bg-zinc-50/50 dark:bg-zinc-950/50 rounded-xl"
            />
          </div>
          {error && <p className="text-sm text-red-500 font-medium">{error}</p>}
          <DialogFooter className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center justify-center rounded-xl px-8 py-2.5 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-500 shadow-md transition-colors disabled:opacity-50 disabled:pointer-events-none w-full"
            >
              {loading ? "Saving..." : "Save Changes"}
            </button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
