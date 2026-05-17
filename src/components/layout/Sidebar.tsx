"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Wallet,
  ArrowRightLeft,
  Settings,
  User,
  FileText,
  TrendingUp,
  Newspaper,
  ChevronDown,
  ChevronRight,
  PanelLeftClose,
  PanelLeft,
  Home,
} from "lucide-react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import type { User as NextAuthUser } from "next-auth";
import { SidebarAdCard, NavBannerAd } from "@/components/ads/AdUnit";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const portfolioSubNav = [
  { name: "Dashboard", href: "/portfolioManager", icon: LayoutDashboard },
  { name: "Holdings", href: "/portfolioManager/holdings", icon: Wallet },
  { name: "Transactions", href: "/portfolioManager/transactions", icon: ArrowRightLeft },
];

export function Sidebar({ user }: { user?: NextAuthUser }) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [portfolioOpen, setPortfolioOpen] = useState(
    pathname?.startsWith("/portfolioManager") ?? false
  );

  // Auto-collapse on mobile/tablet (< 1024px), expand on desktop
  useEffect(() => {
    let lastWidth = window.innerWidth;
    
    const handleResize = () => {
      const currentWidth = window.innerWidth;
      // Only toggle collapse if width actually changes (ignores mobile scroll address bar resize)
      if (currentWidth !== lastWidth) {
        if (currentWidth < 1024 && lastWidth >= 1024) {
          setCollapsed(true);
        } else if (currentWidth >= 1024 && lastWidth < 1024) {
          setCollapsed(false);
        }
        lastWidth = currentWidth;
      }
    };

    // Initial check on mount
    if (window.innerWidth < 1024) {
      setCollapsed(true);
    }

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const isActive = (href: string) => pathname === href;
  const isToolActive = (prefix: string) => pathname?.startsWith(prefix);

  const linkClass = (active: boolean) =>
    cn(
      active
        ? "bg-zinc-100 text-zinc-900 dark:bg-zinc-800 dark:text-zinc-50"
        : "text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800/50 dark:hover:text-zinc-50",
      "group flex items-center rounded-md px-3 py-2 text-sm font-medium transition-colors"
    );

  const iconClass = (active: boolean) =>
    cn(
      active ? "text-zinc-900 dark:text-zinc-50" : "text-zinc-400 group-hover:text-zinc-500 dark:text-zinc-500",
      "shrink-0",
      collapsed ? "w-6 h-6" : "mr-3 h-5 w-5"
    );

  return (
    <div
      className={cn(
        "flex flex-col border-r border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950 transition-all duration-300",
        collapsed ? "w-[72px]" : "w-64"
      )}
    >
      {/* Logo + collapse toggle */}
      <div className="flex h-16 shrink-0 items-center justify-between px-4">
        {!collapsed && (
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-zinc-900 dark:bg-zinc-50 flex items-center justify-center">
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-white dark:text-zinc-900"
              >
                <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
              </svg>
            </div>
            <span className="text-lg font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
              StockRecord
            </span>
          </Link>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="p-1.5 rounded-md text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? (
            <PanelLeft className="w-5 h-5" />
          ) : (
            <PanelLeftClose className="w-5 h-5" />
          )}
        </button>
      </div>

      {/* Nav banner ad — between logo and navigation */}
      {!collapsed && <NavBannerAd />}

      {/* Navigation */}
      <div className="flex flex-1 flex-col overflow-y-auto px-4 py-4">
        <nav className="flex-1 space-y-1">
          {/* ── Home ── */}
          <Link
            href="/"
            className={linkClass(pathname === "/")}
          >
            <Home className={iconClass(pathname === "/")} />
            {!collapsed && "Home"}
          </Link>

          {/* ── Portfolio Manager (with sub-items) ── */}
          <button
            onClick={() => setPortfolioOpen(!portfolioOpen)}
            className={cn(
              linkClass(isToolActive("/portfolioManager") ?? false),
              "w-full justify-between"
            )}
          >
            <span className="flex items-center">
              <Wallet className={iconClass(isToolActive("/portfolioManager") ?? false)} />
              {!collapsed && "Portfolio Manager"}
            </span>
            {!collapsed &&
              (portfolioOpen ? (
                <ChevronDown className="w-4 h-4 text-zinc-400" />
              ) : (
                <ChevronRight className="w-4 h-4 text-zinc-400" />
              ))}
          </button>

          {/* Sub-items */}
          {portfolioOpen && !collapsed && (
            <div className="ml-4 pl-4 border-l border-zinc-200 dark:border-zinc-800 space-y-1">
              {portfolioSubNav.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className={linkClass(isActive(item.href))}
                >
                  <item.icon className={iconClass(isActive(item.href))} />
                  {item.name}
                </Link>
              ))}
            </div>
          )}

          {/* ── SendNues ── */}
          <Link
            href="/sendNues"
            className={linkClass(isToolActive("/sendNues") ?? false)}
          >
            <Newspaper
              className={iconClass(isToolActive("/sendNues") ?? false)}
            />
            {!collapsed && (
              <span className="flex items-center gap-2">
                Send Nues
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 font-semibold leading-none">
                  New
                </span>
              </span>
            )}
          </Link>

          {/* ── Report Summarizer ── */}
          <Link
            href="/reportSummarizer"
            className={linkClass(isToolActive("/reportSummarizer") ?? false)}
          >
            <FileText
              className={iconClass(isToolActive("/reportSummarizer") ?? false)}
            />
            {!collapsed && (
              <span className="flex items-center gap-2">
                Report Summarizer
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-violet-100 dark:bg-violet-900/30 text-violet-600 dark:text-violet-400 font-semibold leading-none">
                  New
                </span>
              </span>
            )}
          </Link>

          {/* ── Pattern Recognizer ── */}
          <Link
            href="/patternRecognizer"
            className={linkClass(isToolActive("/patternRecognizer") ?? false)}
          >
            <TrendingUp
              className={iconClass(isToolActive("/patternRecognizer") ?? false)}
            />
            {!collapsed && (
              <span className="flex items-center gap-2">
                Pattern Recognizer
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400 font-semibold leading-none">
                  Soon
                </span>
              </span>
            )}
          </Link>
        </nav>

        {/* Sidebar ad card — between nav and settings */}
        {!collapsed && <SidebarAdCard />}

        {/* Bottom section */}
        <div className="mt-4">
          <div className="space-y-1">
            <Link
              href="/settings"
              className={linkClass(isActive("/settings"))}
            >
              <Settings className={iconClass(isActive("/settings"))} />
              {!collapsed && "Settings"}
            </Link>
          </div>

          {user && (
            <div className="mt-4 pt-4 border-t border-zinc-200 dark:border-zinc-800">
              {!collapsed && (
                <div className="flex items-center px-3 mb-2 mt-2">
                  <div className="flex-shrink-0">
                    {user.image ? (
                      /* eslint-disable-next-line @next/next/no-img-element */
                      <img
                        className="h-8 w-8 rounded-full"
                        src={user.image}
                        alt={user.name || "User avatar"}
                      />
                    ) : (
                      <div className="h-8 w-8 rounded-full bg-zinc-200 dark:bg-zinc-800 flex items-center justify-center">
                        <User className="h-4 w-4 text-zinc-500" />
                      </div>
                    )}
                  </div>
                  <div className="ml-3 truncate">
                    <p className="text-sm font-medium text-zinc-900 dark:text-zinc-50 truncate">
                      {user.name}
                    </p>
                    <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400 truncate">
                      {user.email}
                    </p>
                  </div>
                </div>
              )}
              {collapsed && (
                <div className="flex justify-center">
                  {user.image ? (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img
                      className="h-8 w-8 rounded-full"
                      src={user.image}
                      alt={user.name || "User avatar"}
                    />
                  ) : (
                    <div className="h-8 w-8 rounded-full bg-zinc-200 dark:bg-zinc-800 flex items-center justify-center">
                      <User className="h-4 w-4 text-zinc-500" />
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
