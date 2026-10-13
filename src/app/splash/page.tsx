"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useHumSafar } from "@/lib/store";

export default function SplashPage() {
  const router = useRouter();
  const { hydrated, introDone, me } = useHumSafar();

  useEffect(() => {
    if (!hydrated) return;
    const t = window.setTimeout(() => {
      if (me?.role === "admin") router.replace("/admin");
      else if (me) router.replace("/");
      else if (!introDone) router.replace("/intro");
      else router.replace("/login");
    }, 700);
    return () => window.clearTimeout(t);
  }, [hydrated, introDone, me, router]);

  return (
    <div className="flex min-h-[80dvh] flex-col items-center justify-center">
      <div className="animate-rise text-center">
        <span className="brand-mark mx-auto !size-16 !text-26">H</span>
        <h1 className="mt-5 font-display text-32 font-extrabold">HumSafar</h1>
        <p className="mt-2 text-16 text-muted">Find your HumSafar</p>
      </div>
    </div>
  );
}
