"use client";

import { useEffect } from "react";

export function PwaRegister() {
  useEffect(() => {
    if (typeof window === "undefined" || !("serviceWorker" in navigator)) return;

    let cancelled = false;

    (async () => {
      try {
        // Drop stale caches that were serving old Roman-Urdu UI
        if ("caches" in window) {
          const keys = await caches.keys();
          await Promise.all(keys.map((k) => caches.delete(k)));
        }
        const regs = await navigator.serviceWorker.getRegistrations();
        await Promise.all(regs.map((r) => r.unregister()));
        if (cancelled) return;
        await navigator.serviceWorker.register("/sw.js");
      } catch {
        /* ignore in demo */
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  return null;
}
