"use client";

import { useHumSafar } from "@/lib/store";

export function LiveModeBadge({ className = "" }: { className?: string }) {
  const { hydrated, liveMode } = useHumSafar();
  if (!hydrated) return null;

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-12 font-bold ${
        liveMode
          ? "bg-teal-soft text-teal-deep"
          : "bg-[var(--uber-soft,#f3f3f3)] text-[var(--uber-mute,#5e5e5e)]"
      } ${className}`}
      title={
        liveMode
          ? "Connected to Supabase — shared live data"
          : "localStorage demo — set NEXT_PUBLIC_SUPABASE_* for live"
      }
    >
      <span
        className={`size-1.5 rounded-full ${liveMode ? "bg-teal" : "bg-[#999]"}`}
      />
      {liveMode ? "Live" : "Local demo"}
    </span>
  );
}
