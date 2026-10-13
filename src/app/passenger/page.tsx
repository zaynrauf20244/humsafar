"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useHumSafar } from "@/lib/store";

/** Passenger search lives on Home — keep route for old links */
export default function PassengerRedirect() {
  const router = useRouter();
  const { setActiveRole, me } = useHumSafar();
  useEffect(() => {
    if (me?.role === "both") setActiveRole("passenger");
    router.replace("/");
  }, [router, me, setActiveRole]);
  return <main className="page">…</main>;
}
