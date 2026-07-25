"use client"
import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Download, ChevronDown } from "lucide-react"

interface CsvDownloadDropdownProps {
  label: string
  portfolios: any[]
  onDownload: (portfolioId: string | "ALL") => void
}

export function CsvDownloadDropdown({ label, portfolios, onDownload }: CsvDownloadDropdownProps) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div className="relative inline-block text-left">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-4 py-2 bg-white/60 dark:bg-zinc-900/60 backdrop-blur-md rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm text-sm font-semibold text-zinc-800 dark:text-zinc-200 hover:bg-white dark:hover:bg-zinc-800 transition-colors"
      >
        <Download className="w-4 h-4 text-indigo-500" />
        {label}
        <ChevronDown className={`w-4 h-4 text-zinc-500 transition-transform ${isOpen ? "rotate-180" : ""}`} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              transition={{ duration: 0.15 }}
              className="absolute right-0 mt-2 w-48 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-lg z-50 overflow-hidden py-1"
            >
              <button
                onClick={() => {
                  onDownload("ALL")
                  setIsOpen(false)
                }}
                className="w-full text-left px-4 py-2 text-sm font-semibold text-zinc-800 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
              >
                All Portfolios (Global)
              </button>
              <div className="h-px bg-zinc-200 dark:bg-zinc-800 my-1" />
              {portfolios.map(p => (
                <button
                  key={p.id}
                  onClick={() => {
                    onDownload(p.id)
                    setIsOpen(false)
                  }}
                  className="w-full text-left px-4 py-2 text-sm font-medium text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors truncate"
                >
                  {p.name}
                </button>
              ))}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}
