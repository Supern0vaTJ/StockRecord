"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Pencil, Trash2 } from "lucide-react"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/Dialog"
import { Input } from "@/components/ui/Input"

export function EditPortfolioDialog({
  portfolio,
  children,
}: {
  portfolio: { id: string; name: string }
  children: React.ReactNode
}) {
  const [open, setOpen] = useState(false)
  const [name, setName] = useState(portfolio.name)
  const [loading, setLoading] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [error, setError] = useState("")
  const [confirmDelete, setConfirmDelete] = useState(false)
  const router = useRouter()

  async function onSave(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim()) return
    setError("")
    setLoading(true)
    try {
      const res = await fetch(`/api/portfolios/${portfolio.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim() }),
      })
      if (res.ok) {
        setOpen(false)
        router.refresh()
      } else {
        const data = await res.json()
        setError(data.error || "Failed to update portfolio")
      }
    } catch {
      setError("An unexpected error occurred")
    } finally {
      setLoading(false)
    }
  }

  async function onDelete() {
    setError("")
    setDeleting(true)
    try {
      const res = await fetch(`/api/portfolios/${portfolio.id}`, {
        method: "DELETE",
      })
      if (res.ok || res.status === 204) {
        setOpen(false)
        router.refresh()
      } else {
        const data = await res.json()
        setError(data.error || "Failed to delete portfolio")
      }
    } catch {
      setError("An unexpected error occurred")
    } finally {
      setDeleting(false)
      setConfirmDelete(false)
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        setOpen(v)
        if (!v) {
          setConfirmDelete(false)
          setError("")
          setName(portfolio.name)
        }
      }}
    >
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[420px] overflow-hidden bg-white/90 dark:bg-zinc-900/90 backdrop-blur-2xl border border-white/20 dark:border-white/10 shadow-2xl rounded-3xl">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 to-purple-500">
            Edit Portfolio
          </DialogTitle>
          <DialogDescription>Rename or remove this portfolio and all its assets.</DialogDescription>
        </DialogHeader>

        <form onSubmit={onSave} className="space-y-4 mt-4">
          <div className="space-y-2">
            <label htmlFor="edit-name" className="text-sm font-medium text-zinc-900 dark:text-zinc-300">
              Portfolio Name
            </label>
            <Input
              id="edit-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={loading || deleting}
              required
              autoFocus
              className="bg-zinc-50/50 dark:bg-zinc-950/50 rounded-xl border-zinc-200 dark:border-zinc-800"
            />
          </div>

          {error && <p className="text-sm text-red-500 font-medium">{error}</p>}

          <DialogFooter className="pt-2 flex flex-col gap-2">
            <button
              type="submit"
              disabled={loading || deleting || !name.trim()}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-6 py-2.5 text-sm font-semibold text-white shadow-md hover:bg-indigo-500 disabled:opacity-50 disabled:pointer-events-none w-full transition-colors"
            >
              <Pencil className="w-4 h-4" />
              {loading ? "Saving..." : "Save Changes"}
            </button>

            {!confirmDelete ? (
              <button
                type="button"
                onClick={() => setConfirmDelete(true)}
                disabled={loading || deleting}
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-red-200 dark:border-red-900 text-red-600 dark:text-red-400 px-6 py-2.5 text-sm font-semibold hover:bg-red-50 dark:hover:bg-red-950/30 disabled:opacity-50 disabled:pointer-events-none w-full transition-colors"
              >
                <Trash2 className="w-4 h-4" />
                Delete Portfolio
              </button>
            ) : (
              <div className="rounded-2xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900 p-4 space-y-3">
                <p className="text-sm text-red-700 dark:text-red-300 font-medium text-center">
                  This will permanently delete <strong>{portfolio.name}</strong> and all its assets &amp; transactions. This cannot be undone.
                </p>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setConfirmDelete(false)}
                    className="flex-1 rounded-xl border border-zinc-200 dark:border-zinc-700 text-sm font-semibold py-2 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={onDelete}
                    disabled={deleting}
                    className="flex-1 rounded-xl bg-red-600 text-white text-sm font-semibold py-2 hover:bg-red-500 disabled:opacity-50 disabled:pointer-events-none transition-colors"
                  >
                    {deleting ? "Deleting..." : "Yes, Delete"}
                  </button>
                </div>
              </div>
            )}
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
