"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Button, Card, ScreenStates, useToast } from "@/components/ui";
import { useHumSafar } from "@/lib/store";
import type { WalletTxType } from "@/lib/types";

function typeLabel(type: WalletTxType) {
  switch (type) {
    case "topup":
      return "Top-up";
    case "fee":
      return "Booking fee";
    case "bonus":
      return "Bonus";
    case "adjustment":
      return "Admin adjust";
    case "refund":
      return "Refund";
    default:
      return type;
  }
}

function formatWhen(iso: string) {
  try {
    return new Date(iso).toLocaleString(undefined, {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return iso;
  }
}

export default function WalletPage() {
  const { me, walletTx, topUpWallet, settings, hydrated } = useHumSafar();
  const { show } = useToast();
  const [amount, setAmount] = useState(200);
  const [method, setMethod] = useState<"JazzCash" | "Easypaisa">("JazzCash");

  const mine = useMemo(
    () =>
      walletTx
        .filter((x) => x.userId === me?.id)
        .slice()
        .sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        ),
    [walletTx, me?.id]
  );

  if (!hydrated) {
    return (
      <main className="page">
        <p className="text-muted">Loading…</p>
      </main>
    );
  }

  if (!me) {
    return (
      <main className="page">
        <Link href="/login" className="btn btn-primary">
          Login
        </Link>
      </main>
    );
  }

  return (
    <main className="page max-w-lg space-y-4">
      <div>
        <p className="label-caps">Your money</p>
        <h1 className="font-display text-26 font-bold">Credits</h1>
        <p className="mt-1 text-14 text-muted">
          See your balance and every credit / debit. Seat cash still goes to the
          owner — HumSafar fee uses credits.
        </p>
      </div>

      <Card className="commute-hero !p-5">
        <p className="relative z-[1] text-14 text-white/75">Available credits</p>
        <p className="relative z-[1] mt-1 font-display text-32 font-extrabold text-white">
          Rs {me.walletBalance.toLocaleString()}
        </p>
        <p className="relative z-[1] mt-2 text-12 text-white/70">
          {mine.length} transaction{mine.length === 1 ? "" : "s"} in history
        </p>
      </Card>

      <Card className="space-y-3">
        <h2 className="font-display text-20 font-bold">Add money</h2>
        <div className="flex gap-2">
          <Button
            variant={method === "JazzCash" ? "primary" : "secondary"}
            className="flex-1"
            onClick={() => setMethod("JazzCash")}
          >
            JazzCash
          </Button>
          <Button
            variant={method === "Easypaisa" ? "primary" : "secondary"}
            className="flex-1"
            onClick={() => setMethod("Easypaisa")}
          >
            Easypaisa
          </Button>
        </div>
        <label className="block">
          <span className="field-label">Amount · min Rs {settings.minTopup}</span>
          <input
            className="input"
            type="number"
            min={settings.minTopup}
            value={amount}
            onChange={(e) => setAmount(Number(e.target.value))}
          />
        </label>
        <div className="flex flex-wrap gap-2">
          {[200, 500, 1000].map((n) => (
            <button
              key={n}
              type="button"
              className="chip"
              onClick={() => setAmount(n)}
            >
              Rs {n}
            </button>
          ))}
        </div>
        <Button
          className="w-full"
          onClick={() => {
            const r = topUpWallet(amount, method);
            show(r.ok ? `Added Rs ${amount} via ${method}` : r.error || "");
          }}
        >
          Add Rs {amount} credits
        </Button>
      </Card>

      <div>
        <h2 className="font-display text-20 font-bold">Credit history</h2>
        <p className="mt-1 text-14 text-muted">Newest first</p>
      </div>
      <ScreenStates
        empty={mine.length === 0}
        emptyTitle="No history yet"
        emptyBody="Top-ups, booking fees, bonuses, and admin adjusts show here."
      >
        <div className="space-y-2">
          {mine.map((tx) => (
            <Card
              key={tx.id}
              className="flex items-start justify-between gap-3 !py-3"
            >
              <div className="min-w-0">
                <p className="font-semibold">{tx.note}</p>
                <p className="text-12 text-muted">
                  {typeLabel(tx.type)} · {formatWhen(tx.createdAt)}
                </p>
              </div>
              <p
                className={`shrink-0 font-bold tabular-nums ${
                  tx.amount >= 0 ? "text-teal" : "text-red"
                }`}
              >
                {tx.amount >= 0 ? "+" : "−"}Rs {Math.abs(tx.amount)}
              </p>
            </Card>
          ))}
        </div>
      </ScreenStates>
    </main>
  );
}
