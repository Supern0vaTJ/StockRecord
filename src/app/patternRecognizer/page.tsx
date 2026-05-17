"use client";

import { motion } from "framer-motion";
import { TrendingUp, Clock } from "lucide-react";

export default function PatternRecognizerPage() {
  return (
    <div className="space-y-8">
      {/* Header — matches Send Nues / Report Summarizer / Portfolio Dashboard style */}
      <div>
        <div className="flex items-center gap-3 mb-1">
          <div className="p-2 rounded-xl bg-zinc-900 dark:bg-zinc-50 text-white dark:text-zinc-900">
            <TrendingUp className="w-5 h-5" />
          </div>
          <h1 className="text-2xl font-black text-zinc-900 dark:text-white tracking-tight">
            Pattern <span className="text-zinc-500 dark:text-zinc-400">Recognizer</span>
          </h1>
        </div>
        <p className="text-sm text-zinc-500 dark:text-zinc-400 ml-12">
          YOLO-based AI chart pattern detection on candlestick charts for smarter trade decisions.
        </p>
      </div>

      {/* Coming Soon card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.97 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="rounded-3xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-12 flex flex-col items-center text-center gap-6"
      >
        <div className="w-20 h-20 rounded-3xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center">
          <TrendingUp className="w-10 h-10 text-zinc-400" />
        </div>

        <div>
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-300 text-xs font-bold mb-4">
            <Clock className="w-3.5 h-3.5" />
            Under Construction
          </div>
          <p className="text-zinc-900 dark:text-white font-bold text-xl mb-2">Coming Soon</p>
          <p className="text-zinc-500 dark:text-zinc-400 text-sm max-w-md leading-relaxed">
            This tool will use YOLO-based AI models to automatically detect chart patterns on
            candlestick charts — head & shoulders, cup & handle, triangles, and more — helping you
            make smarter trade decisions.
          </p>
        </div>
      </motion.div>
    </div>
  );
}
