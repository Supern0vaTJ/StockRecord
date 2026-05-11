"use client";

import { motion } from "framer-motion";
import { TrendingUp, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function PatternRecognizerPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-50 dark:bg-zinc-950 p-6">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="text-center max-w-lg"
      >
        <div className="w-20 h-20 rounded-3xl bg-zinc-900 dark:bg-zinc-50 flex items-center justify-center mx-auto mb-8 shadow-xl">
          <TrendingUp className="w-10 h-10 text-white dark:text-zinc-900" />
        </div>
        <h1 className="text-4xl font-bold text-zinc-900 dark:text-white mb-4">Pattern Recognizer</h1>
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-300 text-sm font-semibold mb-6">
          🚧 Under Construction
        </div>
        <p className="text-zinc-500 dark:text-zinc-400 text-lg leading-relaxed mb-8">
          This tool will use YOLO-based AI models to automatically detect chart patterns on candlestick charts, helping you make smarter trade decisions. Coming soon!
        </p>
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-6 py-3 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 rounded-full font-semibold hover:bg-zinc-800 dark:hover:bg-zinc-100 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Home
        </Link>
      </motion.div>
    </div>
  );
}
