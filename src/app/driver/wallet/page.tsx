"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function DriverWalletRedirect() {
  const router = useRouter();
  useEffect(() => {
    router.replace("/wallet");
  }, [router]);
  return <main className="page">…</main>;
}
