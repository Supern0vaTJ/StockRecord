"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Wallet, ArrowRightLeft, Settings, User } from "lucide-react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import type { User as NextAuthUser } from "next-auth";
import { signOut } from "next-auth/react";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const navigation = [
  { name: "Dashboard", href: "/", icon: LayoutDashboard },
  { name: "Holdings", href: "/holdings", icon: Wallet },
  { name: "Transactions", href: "/transactions", icon: ArrowRightLeft },
];

export function Sidebar({ user }: { user?: NextAuthUser }) {
  const pathname = usePathname();

  return (
    <div className="flex w-64 flex-col border-r border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950">
      <div className="flex h-16 shrink-0 items-center px-6">
        <span className="text-lg font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
          PortfolioManager
        </span>
      </div>
      <div className="flex flex-1 flex-col overflow-y-auto px-4 py-4">
        <nav className="flex-1 space-y-1">
          {navigation.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  isActive
                    ? "bg-zinc-100 text-zinc-900 dark:bg-zinc-800 dark:text-zinc-50"
                    : "text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800/50 dark:hover:text-zinc-50",
                  "group flex items-center rounded-md px-3 py-2 text-sm font-medium transition-colors"
                )}
              >
                <item.icon
                  className={cn(
                    isActive ? "text-zinc-900 dark:text-zinc-50" : "text-zinc-400 group-hover:text-zinc-500 dark:text-zinc-500",
                    "mr-3 h-5 w-5 shrink-0"
                  )}
                  aria-hidden="true"
                />
                {item.name}
              </Link>
            );
          })}
        </nav>
        <div className="mt-8">
          <div className="space-y-1">
            <Link
              href="/settings"
              className="group flex items-center rounded-md px-3 py-2 text-sm font-medium text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800/50 dark:hover:text-zinc-50 transition-colors"
            >
              <Settings className="mr-3 h-5 w-5 shrink-0 text-zinc-400 group-hover:text-zinc-500 dark:text-zinc-500" />
              Settings
            </Link>
          </div>
          
          {user && (
            <div className="mt-4 pt-4 border-t border-zinc-200 dark:border-zinc-800">
              <div className="flex items-center px-3 mb-4 mt-2">
                <div className="flex-shrink-0">
                  {user.image ? (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img className="h-8 w-8 rounded-full" src={user.image} alt={user.name || "User avatar"} />
                  ) : (
                    <div className="h-8 w-8 rounded-full bg-zinc-200 dark:bg-zinc-800 flex items-center justify-center">
                      <User className="h-4 w-4 text-zinc-500" />
                    </div>
                  )}
                </div>
                <div className="ml-3 truncate">
                  <p className="text-sm font-medium text-zinc-900 dark:text-zinc-50 truncate">{user.name}</p>
                  <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400 truncate">{user.email}</p>
                </div>
              </div>
              <button
                onClick={() => signOut({ callbackUrl: "/login" })}
                className="w-full text-left group flex items-center rounded-md px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/30 transition-colors"
              >
                Sign Out
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
