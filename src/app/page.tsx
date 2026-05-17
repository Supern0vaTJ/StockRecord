"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Wallet,
  FileText,
  TrendingUp,
  ArrowRight,
  BarChart3,
  Shield,
  Zap,
  Newspaper,
  Globe,
  ExternalLink,
  Clock,
} from "lucide-react";
import { AdUnit } from "@/components/ads/AdUnit";

interface NewsArticle {
  title: string;
  description: string;
  url: string;
  image: string | null;
  publishedAt: string;
  source: { name: string; url: string };
}

const tools = [
  {
    name: "Portfolio Manager",
    description:
      "Track your NSE/BSE holdings, manage transactions, and monitor real-time portfolio performance with live market data.",
    icon: Wallet,
    href: "/portfolioManager",
    color: "from-zinc-700 to-zinc-900 dark:from-zinc-200 dark:to-white",
    iconColor: "text-white dark:text-zinc-900",
    available: true,
  },
  {
    name: "Send Nues",
    description:
      "Get curated, AI-summarized market signals — earnings, corporate actions, and price-moving news — tailored to your watchlist.",
    icon: Newspaper,
    href: "/sendNues",
    color: "from-indigo-500 to-indigo-700 dark:from-indigo-400 dark:to-indigo-200",
    iconColor: "text-white dark:text-zinc-900",
    available: true,
  },
  {
    name: "Report Summarizer",
    description:
      "Paste any PDF URL or upload a document — annual reports, research notes, government filings — and get a tight AI summary of the key facts in seconds.",
    icon: FileText,
    href: "/reportSummarizer",
    color: "from-violet-500 to-violet-700 dark:from-violet-400 dark:to-violet-200",
    iconColor: "text-white dark:text-zinc-900",
    available: true,
  },
  {
    name: "Pattern Recognizer",
    description:
      "Automatically detect chart patterns using YOLO-based AI models on candlestick charts for smarter trade decisions.",
    icon: TrendingUp,
    href: "/patternRecognizer",
    color: "from-zinc-500 to-zinc-700 dark:from-zinc-400 dark:to-zinc-200",
    iconColor: "text-white dark:text-zinc-900",
    available: false,
  },
];

const features = [
  {
    icon: BarChart3,
    title: "Live Market Data",
    description: "Real-time stock quotes from NSE/BSE via Yahoo Finance integration.",
  },
  {
    icon: Shield,
    title: "Secure & Private",
    description: "Your portfolio data is encrypted and accessible only to you.",
  },
  {
    icon: Zap,
    title: "AI-Powered Tools",
    description: "Leverage machine learning for chart analysis and report generation.",
  },
];

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.15 } },
};

const item = {
  hidden: { opacity: 0, y: 30 },
  show: { opacity: 1, y: 0, transition: { type: "spring" as const, stiffness: 200, damping: 20 } },
};

function timeAgo(dateString: string) {
  const now = new Date();
  const date = new Date(dateString);
  const diffMs = now.getTime() - date.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHr = Math.floor(diffMin / 60);
  if (diffHr < 24) return `${diffHr}h ago`;
  const diffDay = Math.floor(diffHr / 24);
  return `${diffDay}d ago`;
}

function NewsCard({ article }: { article: NewsArticle }) {
  return (
    <a
      href={article.url}
      target="_blank"
      rel="noopener noreferrer"
      className="group flex flex-col rounded-2xl bg-white dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 hover:shadow-lg transition-all duration-200 overflow-hidden"
    >
      {/* Image — full width on top */}
      {article.image && (
        <div className="w-full h-40 overflow-hidden bg-zinc-100 dark:bg-zinc-800">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={article.image}
            alt=""
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            onError={(e) => { (e.target as HTMLImageElement).parentElement!.style.display = "none"; }}
          />
        </div>
      )}

      {/* Text content below image */}
      <div className="flex flex-col flex-1 p-4">
        <h4 className="text-sm font-semibold text-zinc-900 dark:text-white leading-snug line-clamp-2 group-hover:text-zinc-600 dark:group-hover:text-zinc-300 transition-colors">
          {article.title}
        </h4>
        <p className="text-xs text-zinc-500 dark:text-zinc-400 line-clamp-2 mt-1.5 leading-relaxed">
          {article.description}
        </p>
        <div className="flex items-center gap-3 mt-auto pt-3 text-xs text-zinc-400 dark:text-zinc-500">
          <span className="font-medium truncate">{article.source.name}</span>
          <span className="flex items-center gap-1 shrink-0">
            <Clock className="w-3 h-3" />
            {timeAgo(article.publishedAt)}
          </span>
          <ExternalLink className="w-3 h-3 ml-auto shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>
      </div>
    </a>
  );
}

function NewsSection({
  title,
  icon: Icon,
  articles,
  loading,
}: {
  title: string;
  icon: typeof Newspaper;
  articles: NewsArticle[];
  loading: boolean;
}) {
  const [showAll, setShowAll] = useState(false);
  const displayArticles = showAll ? articles : articles.slice(0, 6);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
    >
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2.5 rounded-xl bg-zinc-100 dark:bg-zinc-800">
          <Icon className="w-5 h-5 text-zinc-600 dark:text-zinc-300" />
        </div>
        <h3 className="text-xl font-bold text-zinc-900 dark:text-white">{title}</h3>
        <span className="ml-auto text-xs font-medium text-zinc-400 dark:text-zinc-500">
          Top {articles.length} articles
        </span>
      </div>

      {loading ? (
        <div className="grid gap-3 sm:grid-cols-2">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="h-28 rounded-2xl bg-zinc-100 dark:bg-zinc-800 animate-pulse"
            />
          ))}
        </div>
      ) : articles.length === 0 ? (
        <div className="py-16 text-center rounded-2xl border-2 border-dashed border-zinc-200 dark:border-zinc-800">
          <p className="text-zinc-500 dark:text-zinc-400">
            No news available. Add your{" "}
            <code className="text-xs bg-zinc-100 dark:bg-zinc-800 px-1.5 py-0.5 rounded">GNEWS_API_KEY</code>{" "}
            to <code className="text-xs bg-zinc-100 dark:bg-zinc-800 px-1.5 py-0.5 rounded">.env.local</code> to enable news.
          </p>
        </div>
      ) : (
        <>
          <div className="grid gap-3 sm:grid-cols-2">
            {displayArticles.map((article, i) => (
              <NewsCard key={i} article={article} />
            ))}
          </div>
          {articles.length > 6 && (
            <button
              onClick={() => setShowAll(!showAll)}
              className="mt-4 mx-auto block text-sm font-semibold text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors"
            >
              {showAll ? "Show Less" : `Show All ${articles.length} Articles`}
            </button>
          )}
        </>
      )}
    </motion.div>
  );
}

export default function HomePage() {
  const [indianNews, setIndianNews] = useState<NewsArticle[]>([]);
  const [worldNews, setWorldNews] = useState<NewsArticle[]>([]);
  const [newsLoading, setNewsLoading] = useState(true);

  useEffect(() => {
    async function fetchNews() {
      try {
        const [indianRes, worldRes] = await Promise.all([
          fetch("/api/news?category=indian"),
          fetch("/api/news?category=world"),
        ]);
        const [indian, world] = await Promise.all([
          indianRes.json(),
          worldRes.json(),
        ]);
        setIndianNews(indian);
        setWorldNews(world);
      } catch (err) {
        console.error("Failed to fetch news:", err);
      } finally {
        setNewsLoading(false);
      }
    }
    fetchNews();
  }, []);

  return (
    <div className="min-h-screen bg-white dark:bg-zinc-950">
      {/* Navigation Bar */}
      <nav className="sticky top-0 z-50 backdrop-blur-xl bg-white/80 dark:bg-zinc-950/80 border-b border-zinc-200 dark:border-zinc-800">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 shrink-0">
            <div className="w-10 h-10 rounded-xl bg-zinc-900 dark:bg-zinc-50 flex items-center justify-center shadow-lg">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white dark:text-zinc-900">
                <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
              </svg>
            </div>
            <span className="text-xl font-bold text-zinc-900 dark:text-zinc-50 tracking-tight">
              StockRecord
            </span>
          </Link>

          {/* Nav bar ad — between logo and links */}
          <div className="hidden lg:block mx-4 flex-shrink overflow-hidden rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50 max-w-[300px]">
            <AdUnit
              slot="nav_banner_homepage"
              format="horizontal"
              responsive={false}
              style={{ display: "inline-block", width: "280px", height: "50px" }}
            />
          </div>

          <div className="flex items-center gap-6 shrink-0">
            <Link href="/portfolioManager" className="text-sm font-medium text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white transition-colors hidden sm:block">
              Portfolio Manager
            </Link>
            <Link href="/sendNues" className="text-sm font-medium text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 dark:hover:text-indigo-300 transition-colors hidden md:block font-semibold">
              SendNues
            </Link>
            <Link href="/reportSummarizer" className="text-sm font-medium text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white transition-colors hidden md:block">
              Report Summarizer
            </Link>
            <Link href="/patternRecognizer" className="text-sm font-medium text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white transition-colors hidden md:block">
              Pattern Recognizer
            </Link>
            <Link
              href="/login"
              className="px-5 py-2 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 rounded-full text-sm font-semibold hover:bg-zinc-800 dark:hover:bg-zinc-100 transition-colors shadow-lg shadow-zinc-900/10 dark:shadow-white/10"
            >
              Sign In
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(0,0,0,0.03),_transparent_60%)] dark:bg-[radial-gradient(ellipse_at_top,_rgba(255,255,255,0.03),_transparent_60%)]" />
        <div className="max-w-7xl mx-auto px-6 py-24 md:py-32 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: "easeOut" }}
            className="text-center max-w-3xl mx-auto"
          >
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-300 text-sm font-medium mb-8">
              <Zap className="w-4 h-4" />
              AI-Powered Indian Stock Market Tools
            </div>
            <h1 className="text-5xl md:text-7xl font-extrabold text-zinc-900 dark:text-white tracking-tight leading-tight">
              Manage Your{" "}
              <span className="bg-gradient-to-r from-zinc-600 to-zinc-900 dark:from-zinc-400 dark:to-white bg-clip-text text-transparent">
                Portfolio
              </span>{" "}
              Intelligently
            </h1>
            <p className="mt-6 text-lg md:text-xl text-zinc-500 dark:text-zinc-400 max-w-2xl mx-auto leading-relaxed">
              StockRecord is your all-in-one platform for tracking Indian stock
              investments, analyzing chart patterns with AI, and generating
              performance reports — all in one place.
            </p>
            <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/portfolioManager"
                className="group flex items-center gap-2 px-8 py-3.5 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 rounded-full font-semibold text-base shadow-xl shadow-zinc-900/20 dark:shadow-white/20 hover:shadow-2xl transition-all"
              >
                Get Started
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                href="#tools"
                className="px-8 py-3.5 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-white rounded-full font-semibold text-base hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors"
              >
                Explore Tools
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Tools Section */}
      <section id="tools" className="py-24 relative">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-zinc-900 dark:text-white">
              Powerful Tools for Smart Investors
            </h2>
            <p className="mt-4 text-zinc-500 dark:text-zinc-400 text-lg max-w-xl mx-auto">
              A suite of purpose-built tools designed for the Indian stock market.
            </p>
          </motion.div>

          <motion.div
            variants={container}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            className="grid gap-8 md:grid-cols-3"
          >
            {tools.map((tool) => (
              <motion.div key={tool.name} variants={item}>
                <Link
                  href={tool.href}
                  className="group block h-full p-8 rounded-3xl bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 hover:shadow-xl transition-all duration-300"
                >
                  <div
                    className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${tool.color} flex items-center justify-center mb-6 shadow-lg group-hover:scale-110 transition-transform duration-300`}
                  >
                    <tool.icon className={`w-7 h-7 ${tool.iconColor}`} />
                  </div>
                  <h3 className="text-xl font-bold text-zinc-900 dark:text-white mb-3">
                    {tool.name}
                    {!tool.available && (
                      <span className="ml-2 inline-flex px-2 py-0.5 rounded-full bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-500 dark:text-zinc-400 text-xs font-medium">
                        Coming Soon
                      </span>
                    )}
                  </h3>
                  <p className="text-zinc-500 dark:text-zinc-400 leading-relaxed">
                    {tool.description}
                  </p>
                  <div className="mt-6 flex items-center text-sm font-semibold text-zinc-600 dark:text-zinc-300 group-hover:text-zinc-900 dark:group-hover:text-white transition-colors">
                    {tool.available ? "Open Tool" : "Learn More"}
                    <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                  </div>
                </Link>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* News Section */}
      <section id="news" className="py-24 bg-zinc-50 dark:bg-zinc-900/30">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-zinc-900 dark:text-white">
              Market News & Updates
            </h2>
            <p className="mt-4 text-zinc-500 dark:text-zinc-400 text-lg max-w-xl mx-auto">
              Stay informed with the latest developments in Indian and global markets.
            </p>
          </motion.div>

          <div className="grid gap-16 lg:grid-cols-2">
            {/* Indian Market News */}
            <NewsSection
              title="Indian Market News"
              icon={Newspaper}
              articles={indianNews}
              loading={newsLoading}
            />

            {/* World Market News */}
            <NewsSection
              title="World Market News"
              icon={Globe}
              articles={worldNews}
              loading={newsLoading}
            />
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div
            variants={container}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            className="grid gap-8 md:grid-cols-3"
          >
            {features.map((feature) => (
              <motion.div
                key={feature.title}
                variants={item}
                className="text-center p-8"
              >
                <div className="w-12 h-12 rounded-2xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center mx-auto mb-5">
                  <feature.icon className="w-6 h-6 text-zinc-600 dark:text-zinc-300" />
                </div>
                <h3 className="text-lg font-bold text-zinc-900 dark:text-white mb-2">
                  {feature.title}
                </h3>
                <p className="text-zinc-500 dark:text-zinc-400 text-sm leading-relaxed">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Bottom ad banner — above footer */}
      <div className="max-w-7xl mx-auto px-6 py-6">
        <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50 overflow-hidden">
          <AdUnit
            slot="homepage_bottom_banner"
            format="horizontal"
            responsive={true}
            style={{ display: "block", minHeight: "90px" }}
          />
          <p className="text-[9px] text-zinc-400 text-center py-1">Sponsored</p>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950">
        <div className="max-w-7xl mx-auto px-6 py-12">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-zinc-900 dark:bg-zinc-50 flex items-center justify-center">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white dark:text-zinc-900">
                  <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
                </svg>
              </div>
              <span className="text-sm font-semibold text-zinc-900 dark:text-white">StockRecord</span>
            </div>
            <div className="flex items-center gap-6 text-sm text-zinc-500 dark:text-zinc-400">
              <Link href="/portfolioManager" className="hover:text-zinc-900 dark:hover:text-white transition-colors">Portfolio Manager</Link>
              <Link href="/reportSummarizer" className="hover:text-zinc-900 dark:hover:text-white transition-colors">Report Summarizer</Link>
              <Link href="/patternRecognizer" className="hover:text-zinc-900 dark:hover:text-white transition-colors">Pattern Recognizer</Link>
            </div>
          </div>

          <div className="mt-8 pt-8 border-t border-zinc-100 dark:border-zinc-800">
            <p className="text-xs text-zinc-400 dark:text-zinc-500 text-center leading-relaxed max-w-2xl mx-auto">
              <strong className="text-zinc-500 dark:text-zinc-400">Disclaimer:</strong> This website is not an investment advisory tool. It is provided solely for educational purposes and personal portfolio management. The information presented here should not be considered as financial advice. Always consult a qualified financial advisor before making investment decisions.
            </p>
            <p className="text-xs text-zinc-400 dark:text-zinc-500 text-center mt-4">
              © {new Date().getFullYear()} StudioSupern0va_TJ. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
