"use client";

import { Suspense, type ReactNode } from "react";
import { AppNav } from "@/components/AppNav";
import { MobileTabBar } from "@/components/MobileTabBar";

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="app-shell relative flex min-h-dvh flex-col">
      <Suspense fallback={<div className="h-14" />}>
        <AppNav />
      </Suspense>
      <div className="page-wide flex flex-1 flex-col">{children}</div>
      <Suspense fallback={null}>
        <MobileTabBar />
      </Suspense>
    </div>
  );
}
