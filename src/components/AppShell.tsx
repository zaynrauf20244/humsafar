"use client";

import { Suspense, useEffect, type ReactNode } from "react";
import { usePathname } from "next/navigation";
import { AppNav } from "@/components/AppNav";
import { InstallAppBanner } from "@/components/InstallAppBanner";
import { MobileTabBar } from "@/components/MobileTabBar";
import { PwaRegister } from "@/components/PwaRegister";
import { OfflineBanner, SosButton, useToast } from "@/components/ui";
import { dir } from "@/lib/i18n";
import { useHumSafar } from "@/lib/store";

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const { locale, hydrated, me, triggerSos, setLocale } = useHumSafar();
  const { show } = useToast();
  const direction = hydrated ? dir(locale) : "ltr";
  const hideChrome =
    pathname.startsWith("/splash") ||
    pathname.startsWith("/intro") ||
    pathname.startsWith("/login") ||
    pathname.startsWith("/join");

  useEffect(() => {
    if (!hydrated) return;
    if (sessionStorage.getItem("humsafar-en-fix") !== "1") {
      setLocale("en");
      sessionStorage.setItem("humsafar-en-fix", "1");
    }
  }, [hydrated, setLocale]);

  useEffect(() => {
    document.documentElement.lang = locale;
    document.documentElement.dir = direction;
    if (me?.darkMode) {
      document.documentElement.style.setProperty("--mist", "#0f1a17");
      document.documentElement.style.setProperty("--surface", "#162420");
      document.documentElement.style.setProperty("--ink", "#eef3f1");
      document.documentElement.style.setProperty("--line", "#2a3d38");
      document.documentElement.style.setProperty("--muted", "#9aada6");
    } else {
      document.documentElement.style.removeProperty("--mist");
      document.documentElement.style.removeProperty("--surface");
      document.documentElement.style.removeProperty("--ink");
      document.documentElement.style.removeProperty("--line");
      document.documentElement.style.removeProperty("--muted");
    }
  }, [locale, direction, me?.darkMode]);

  const marketing =
    pathname.startsWith("/login") || pathname.startsWith("/join");

  return (
    <div
      className={`app-shell relative flex min-h-dvh flex-col ${marketing ? "app-shell-marketing" : ""}`}
      dir={direction}
      lang={locale}
    >
      <PwaRegister />
      <OfflineBanner />
      {!hideChrome ? (
        <Suspense fallback={<div className="h-14" />}>
          <AppNav />
        </Suspense>
      ) : null}
      <div className="page-wide flex flex-1 flex-col">{children}</div>
      {!hideChrome ? <InstallAppBanner /> : null}
      <Suspense fallback={null}>
        <MobileTabBar />
      </Suspense>
      {me && me.role !== "admin" ? (
        <SosButton
          onTrigger={() => {
            show(triggerSos());
          }}
        />
      ) : null}
    </div>
  );
}
