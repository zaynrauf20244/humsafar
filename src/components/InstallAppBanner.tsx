"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

export function InstallAppBanner() {
  const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(
    null,
  );
  const [isStandalone, setIsStandalone] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const standalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      // iOS Safari
      Boolean(
        "standalone" in window.navigator &&
          (window.navigator as Navigator & { standalone?: boolean }).standalone,
      );
    setIsStandalone(standalone);
    setIsMobile(window.matchMedia("(max-width: 767px)").matches);
    setDismissed(sessionStorage.getItem("humsafar-install-dismissed") === "1");

    const onBip = (e: Event) => {
      e.preventDefault();
      setDeferred(e as BeforeInstallPromptEvent);
    };
    window.addEventListener("beforeinstallprompt", onBip);
    return () => window.removeEventListener("beforeinstallprompt", onBip);
  }, []);

  if (isStandalone || dismissed || !isMobile) return null;

  async function install() {
    if (!deferred) return;
    await deferred.prompt();
    await deferred.userChoice;
    setDeferred(null);
  }

  function dismiss() {
    sessionStorage.setItem("humsafar-install-dismissed", "1");
    setDismissed(true);
  }

  return (
    <div
      className="fixed inset-x-0 z-[55] px-3 md:hidden"
      style={{ bottom: "calc(4.25rem + var(--safe-bottom))" }}
    >
      <div className="mx-auto flex max-w-lg items-start gap-3 rounded-[14px] border border-line bg-surface p-3 shadow-md">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[10px] bg-accent text-sm font-bold text-white">
          S
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-ink">Install HumSafar app</p>
          <p className="mt-0.5 text-xs text-muted">
            Phone pe home screen se kholo — mobile app jaisa.
          </p>
          <div className="mt-2 flex flex-wrap gap-2">
            {deferred ? (
              <button
                type="button"
                className="btn-primary !px-3 !py-1.5 text-xs"
                onClick={install}
              >
                Install
              </button>
            ) : (
              <Link
                href="/get-app"
                className="btn-primary !px-3 !py-1.5 text-xs"
              >
                How to install
              </Link>
            )}
            <button
              type="button"
              className="rounded-[8px] px-2 py-1.5 text-xs font-semibold text-muted"
              onClick={dismiss}
            >
              Not now
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
