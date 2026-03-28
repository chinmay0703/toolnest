"use client";

import { useEffect, useRef } from "react";

interface AdSlotProps {
  position: "top" | "middle" | "bottom" | "sidebar";
  className?: string;
}

const formatMap: Record<AdSlotProps["position"], string> = {
  top: "horizontal",
  bottom: "horizontal",
  middle: "rectangle",
  sidebar: "vertical",
};

export function AdSlot({ position, className = "" }: AdSlotProps) {
  const adRef = useRef<HTMLDivElement>(null);
  const pushed = useRef(false);

  useEffect(() => {
    if (pushed.current) return;
    try {
      if (typeof window !== "undefined" && (window as any).adsbygoogle) {
        (window as any).adsbygoogle.push({});
        pushed.current = true;
      }
    } catch (e) {
      // AdSense not loaded yet - that's fine
    }
  }, []);

  return (
    <div className={`w-full my-6 flex justify-center ${className}`} ref={adRef}>
      <ins
        className="adsbygoogle"
        style={{ display: "block" }}
        data-ad-client="ca-pub-4135912405031647"
        data-ad-slot="auto"
        data-ad-format={formatMap[position]}
        data-full-width-responsive="true"
      />
    </div>
  );
}
