"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useHumSafar } from "@/lib/store";

export default function DriverRedirect() {
  const router = useRouter();
  const { setActiveRole, me } = useHumSafar();
  useEffect(() => {
    if (me?.role === "both") setActiveRole("driver");
    router.replace("/");
  }, [router, me, setActiveRole]);
  return <main className="page">…</main>;
}
