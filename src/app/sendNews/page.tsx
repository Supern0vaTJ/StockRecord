"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Newspaper,
  RefreshCw,
  ExternalLink,
  Bell,
  TrendingUp,
  Calendar,
  Banknote,
  LayoutGrid,
  AlertCircle,
  Loader2,
  CheckCircle2,
  Clock,
  Star,
} from "lucide-react";

interface FeedItem {
  id: string;
  symbol: string;
  companyName: string;
  title: string;
  summary: string;
  category: "Earnings" | "Corporate Action" | "Dividend" | "Board Meeting" | "Market News";
  source: "BSE" | "NSE" | "Yahoo";
  url?: string;
  publishedAt: string;
  isPersonalized: boolean;
}

type TabKey = "all" | "earnings" | "corporate" | "dividend";

const TABS: { key: TabKey; label: string; icon: React.ElementType; categories: FeedItem["category"][] }[] = [
  { key: "all", label: "All", icon: LayoutGrid, categories: [] },
  { key: "earnings", label: "Earnings", icon: TrendingUp, categories: ["Earnings", "Board Meeting"] },
  { key: "corporate", label: "Corporate Actions", icon: CheckCircle2, categories: ["Corporate Action"] },
  { key: "dividend", label: "Dividends", icon: Banknote, categories: ["Dividend"] },
];

const SOURCE_COLORS: Record<FeedItem["source"], string> = {
  BSE: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
  NSE: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  Yahoo: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
};

const CATEGORY_COLORS: Record<FeedItem["category"], string> = {
  Earnings: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
  "Board Meeting": "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
  "Corporate Action": "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400",
  Dividend: "bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-400",
  "Market News": "bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-400",
};

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

function NewsCard({ item }: { item: FeedItem }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className={`relative rounded-2xl border bg-white dark:bg-zinc-900 p-5 flex flex-col gap-3 transition-shadow hover:shadow-md ${
        item.isPersonalized
          ? "border-indigo-200 dark:border-indigo-800/60"
          : "border-zinc-200 dark:border-zinc-800"
      }`}
    >
      {/* Personalized badge */}
      {item.isPersonalized && (
        <span className="absolute top-3 right-3 flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-600 text-white">
          <Star className="w-2.5 h-2.5" /> Your stock
        </span>
      )}

      {/* Header */}
      <div className="flex items-start gap-3 pr-20">
        <div className="w-10 h-10 rounded-xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center shrink-0">
          <span className="text-xs font-black text-zinc-600 dark:text-zinc-300">
            {item.companyName.slice(0, 2).toUpperCase()}
          </span>
        </div>
        <div className="min-w-0">
          <p className="text-xs font-bold text-zinc-500 dark:text-zinc-400">{item.symbol}</p>
          <p className="font-bold text-zinc-900 dark:text-white text-sm leading-snug mt-0.5 line-clamp-2">
            {item.title}
          </p>
        </div>
      </div>

      {/* Summary */}
      {item.summary && item.summary !== item.title && (
        <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed line-clamp-2">
          {item.summary}
        </p>
      )}

      {/* Footer */}
      <div className="flex items-center gap-2 flex-wrap mt-auto pt-1">
        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${CATEGORY_COLORS[item.category]}`}>
          {item.category}
        </span>
        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${SOURCE_COLORS[item.source]}`}>
          {item.source}
        </span>
        <span className="ml-auto flex items-center gap-1 text-[11px] text-zinc-400">
          <Clock className="w-3 h-3" />
          {timeAgo(item.publishedAt)}
        </span>
        {item.url && (
          <a
            href={item.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 text-[11px] font-bold text-indigo-600 dark:text-indigo-400 hover:underline"
            onClick={(e) => e.stopPropagation()}
          >
            View <ExternalLink className="w-3 h-3" />
          </a>
        )}
      </div>
    </motion.div>
  );
}

export default function SendNewsPage() {
  const [activeTab, setActiveTab] = useState<TabKey>("all");
  const [items, setItems] = useState<FeedItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [isCached, setIsCached] = useState(false);

  const fetchFeed = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/sendNews/feed");
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to load feed.");
      }
      const data = await res.json();
      setItems(data.items || []);
      setIsCached(data.cached);
      setLastUpdated(new Date());
    } catch (err: any) {
      setError(err.message || "Something went wrong.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchFeed();
  }, []);

  const filtered = activeTab === "all"
    ? items
    : items.filter((item) => {
        const tab = TABS.find((t) => t.key === activeTab);
        return tab?.categories.includes(item.category);
      });

  const portfolioItems = filtered.filter((i) => i.isPersonalized);
  const marketItems = filtered.filter((i) => !i.isPersonalized);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <div className="p-2 rounded-xl bg-indigo-600 text-white">
              <Newspaper className="w-5 h-5" />
            </div>
            <h1 className="text-2xl font-black text-zinc-900 dark:text-white tracking-tight">
              Send <span className="text-indigo-600 dark:text-indigo-400">News</span>
            </h1>
          </div>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 ml-12">
            Corporate actions, earnings &amp; market-moving events — personalised to your portfolio.
          </p>
        </div>
        <div className="flex items-center gap-3 ml-12 sm:ml-0">
          {lastUpdated && (
            <span className="text-xs text-zinc-400 flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {isCached ? "Cached · " : "Live · "}
              {lastUpdated.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}
            </span>
          )}
          <button
            onClick={fetchFeed}
            disabled={isLoading}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 text-sm font-bold hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} />
            Refresh
          </button>
          <button className="flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 text-white text-sm font-bold hover:bg-indigo-700 transition-colors">
            <Bell className="w-4 h-4" />
            Alerts <span className="text-[10px] opacity-70">Soon</span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1.5 p-1.5 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl w-fit flex-wrap">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all ${
              activeTab === tab.key
                ? "bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 shadow"
                : "text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white"
            }`}
          >
            <tab.icon className="w-3.5 h-3.5" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Error */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="flex items-center gap-3 px-4 py-3 rounded-2xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/60 text-red-700 dark:text-red-400"
          >
            <AlertCircle className="w-5 h-5 shrink-0" />
            <p className="text-sm font-medium">{error}</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Loading */}
      {isLoading && (
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <div className="relative w-14 h-14">
            <div className="absolute inset-0 rounded-full border-4 border-indigo-100 dark:border-indigo-900/30" />
            <div className="absolute inset-0 rounded-full border-4 border-t-indigo-600 animate-spin" />
            <div className="absolute inset-0 flex items-center justify-center">
              <Newspaper className="w-5 h-5 text-indigo-600" />
            </div>
          </div>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 font-medium">
            Fetching latest corporate actions…
          </p>
        </div>
      )}

      {/* Feed */}
      {!isLoading && !error && (
        <div className="space-y-8">
          {/* Portfolio section */}
          {portfolioItems.length > 0 && (
            <section>
              <div className="flex items-center gap-2 mb-4">
                <Star className="w-4 h-4 text-indigo-600" />
                <h2 className="text-sm font-bold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider">
                  Your Portfolio ({portfolioItems.length})
                </h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {portfolioItems.map((item) => (
                  <NewsCard key={item.id} item={item} />
                ))}
              </div>
            </section>
          )}

          {/* Market section */}
          {marketItems.length > 0 && (
            <section>
              <div className="flex items-center gap-2 mb-4">
                <Calendar className="w-4 h-4 text-zinc-500" />
                <h2 className="text-sm font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                  Market Wide ({marketItems.length})
                </h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {marketItems.map((item) => (
                  <NewsCard key={item.id} item={item} />
                ))}
              </div>
            </section>
          )}

          {/* Empty state */}
          {filtered.length === 0 && (
            <div className="flex flex-col items-center justify-center py-20 gap-4 text-center">
              <div className="w-16 h-16 rounded-2xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center">
                <Newspaper className="w-8 h-8 text-zinc-400" />
              </div>
              <div>
                <p className="font-bold text-zinc-900 dark:text-white">No events found</p>
                <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
                  {activeTab === "all"
                    ? "Add stocks to your portfolio to see personalized corporate actions."
                    : `No ${TABS.find((t) => t.key === activeTab)?.label} events right now.`}
                </p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* WhatsApp Coming Soon banner */}
      <div className="rounded-2xl border border-dashed border-green-300 dark:border-green-700 bg-green-50/50 dark:bg-green-900/10 p-4 flex items-center gap-4">
        <div className="w-10 h-10 rounded-xl bg-green-600 flex items-center justify-center shrink-0">
          <Bell className="w-5 h-5 text-white" />
        </div>
        <div>
          <p className="font-bold text-green-800 dark:text-green-300 text-sm">
            WhatsApp Alerts — Coming Soon
          </p>
          <p className="text-xs text-green-700 dark:text-green-400 mt-0.5">
            Get instant WhatsApp notifications for earnings results, dividends, and corporate actions from your portfolio.
          </p>
        </div>
        <span className="ml-auto text-xs font-bold px-3 py-1 rounded-full bg-green-200 dark:bg-green-900 text-green-800 dark:text-green-300 shrink-0">
          Phase 2
        </span>
      </div>
    </div>
  );
}
