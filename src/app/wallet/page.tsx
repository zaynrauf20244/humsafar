"use client";

import { useState } from "react";
import { Button, Card, ScreenStates, useToast } from "@/components/ui";
import { useHumSafar } from "@/lib/store";

export default function WalletPage() {
  const { me, walletTx, topUpWallet, settings } = useHumSafar();
  const { show } = useToast();
  const [amount, setAmount] = useState(200);
  const [method, setMethod] = useState<"JazzCash" | "Easypaisa">("JazzCash");
  const mine = walletTx.filter((x) => x.userId === me?.id);

  if (!me) return null;

  return (
    <main className="page max-w-lg space-y-4">
      <div>
        <h1 className="font-display text-26 font-bold">Wallet</h1>
        <p className="mt-1 text-14 text-muted">
          Seat cash goes to the car owner. HumSafar booking fee is separate.
        </p>
      </div>

      <Card className="commute-hero !p-5">
        <p className="relative z-[1] text-14 text-white/75">Balance</p>
        <p className="relative z-[1] mt-1 font-display text-32 font-extrabold">
          Rs {me.walletBalance}
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
          <span className="field-label">
            Minimum Rs {settings.minTopup}
          </span>
          <input
            className="input"
            type="number"
            min={settings.minTopup}
            value={amount}
            onChange={(e) => setAmount(Number(e.target.value))}
          />
        </label>
        <Button
          className="w-full"
          onClick={() => {
            const r = topUpWallet(amount, method);
            show(r.ok ? `${method} added` : r.error || "");
          }}
        >
          Add money
        </Button>
      </Card>

      <h2 className="font-display text-20 font-bold">History</h2>
      <ScreenStates empty={mine.length === 0} emptyTitle="No history yet">
        <div className="space-y-2">
          {mine.map((tx) => (
            <Card key={tx.id} className="flex items-center justify-between !py-3">
              <div>
                <p className="font-semibold">{tx.note}</p>
                <p className="text-12 text-muted">{tx.type}</p>
              </div>
              <p
                className={`font-bold ${tx.amount >= 0 ? "text-teal" : "text-red"}`}
              >
                {tx.amount >= 0 ? "+" : ""}
                {tx.amount}
              </p>
            </Card>
          ))}
        </div>
      </ScreenStates>
    </main>
  );
}
