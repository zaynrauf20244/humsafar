"use client";

import Link from "next/link";
import { useSaath } from "@/lib/store";

export default function CreditsPage() {
  const {
    credits,
    applyDriveCredits,
    applyRideCost,
    joinedCircleId,
    resetApp,
    hydrated,
    profile,
  } = useSaath();

  return (
    <main className="page">
      <p className="label-caps text-accent">Account</p>
      <h1 className="mt-2 font-display text-[1.75rem] font-semibold text-ink md:text-3xl">
        Commute credits
      </h1>
      <p className="mt-1.5 text-sm text-muted">
        Fair rotation accounting — not a taxi earnings model.
      </p>

      <div className="mt-6 grid gap-4 md:grid-cols-[1fr_1.2fr]">
      <div className="rounded-[12px] border border-line bg-surface p-5 md:p-6">
        <p className="text-sm text-muted">Available balance</p>
        <p className="mt-1 font-display text-4xl font-semibold text-ink">
          {hydrated ? credits : "—"}
        </p>
        <p className="mt-1 text-sm font-medium text-accent">credits</p>
        {profile && (
          <p className="mt-3 text-xs capitalize text-muted">
            Signed in as {profile.role}
          </p>
        )}
      </div>

      <div className="space-y-3">
        <div className="surface p-4">
          <p className="font-semibold text-ink">Drive 3 riders</p>
          <p className="text-sm text-muted">+30 credits</p>
          <button
            type="button"
            className="btn-primary mt-3"
            onClick={() => applyDriveCredits(3)}
          >
            Simulate drive
          </button>
        </div>
        <div className="surface p-4">
          <p className="font-semibold text-ink">Ride as passenger</p>
          <p className="text-sm text-muted">−10 credits</p>
          <button type="button" className="btn-ink mt-3" onClick={applyRideCost}>
            Simulate ride
          </button>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="surface p-4">
            <p className="text-xs font-bold text-accent">Buy credits</p>
            <p className="mt-1 font-display text-lg font-semibold">100 cr</p>
            <p className="text-xs text-muted">Rs 1,500</p>
          </div>
          <div className="surface p-4">
            <p className="text-xs font-bold text-accent">Commuter</p>
            <p className="mt-1 font-display text-lg font-semibold">Rs 2,999</p>
            <p className="text-xs text-muted">/ month</p>
          </div>
        </div>
      </div>
      </div>

      <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
        {joinedCircleId ? (
          <Link href={`/circle/${joinedCircleId}`} className="btn-primary text-center">
            Back to My Circle
          </Link>
        ) : (
          <Link href="/" className="btn-primary text-center">
            Choose Driver or Passenger
          </Link>
        )}
        <button
          type="button"
          className="text-sm font-medium text-muted underline"
          onClick={resetApp}
        >
          Reset demo
        </button>
      </div>
    </main>
  );
}
