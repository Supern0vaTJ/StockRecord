"use client";

import { useEffect, useRef } from "react";

interface AdUnitProps {
  slot: string;
  format?: "auto" | "fluid" | "rectangle" | "vertical" | "horizontal";
  responsive?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

export function AdUnit({
  slot,
  format = "auto",
  responsive = true,
  className = "",
  style,
}: AdUnitProps) {
  const adRef = useRef<HTMLModElement>(null);

  useEffect(() => {
    try {
      if (typeof window !== "undefined" && adRef.current) {
        // @ts-expect-error — adsbygoogle is injected by Google
        (window.adsbygoogle = window.adsbygoogle || []).push({});
      }
    } catch (e) {
      console.error("AdSense error:", e);
    }
  }, []);

  return (
    <div className={className}>
      <ins
        ref={adRef}
        className="adsbygoogle"
        style={style || { display: "block" }}
        data-ad-client="ca-pub-2219049693352927"
        data-ad-slot={slot}
        data-ad-format={format}
        data-full-width-responsive={responsive ? "true" : "false"}
      />
    </div>
  );
}

// Sidebar ad card — fits between nav items
export function SidebarAdCard() {
  return (
    <div className="mx-1 my-2 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50 overflow-hidden">
      <div className="p-1">
        <AdUnit
          slot="sidebar_ad"
          format="rectangle"
          responsive={false}
          style={{ display: "inline-block", width: "100%", minHeight: "200px" }}
        />
      </div>
      <p className="text-[9px] text-zinc-400 text-center pb-1">Sponsored</p>
    </div>
  );
}

// Inline banner ad for navigation area
export function NavBannerAd() {
  return (
    <div className="mx-1 my-1 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50 overflow-hidden">
      <AdUnit
        slot="nav_banner_ad"
        format="horizontal"
        responsive={false}
        style={{ display: "inline-block", width: "100%", minHeight: "60px" }}
      />
    </div>
  );
}
