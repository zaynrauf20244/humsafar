"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { FormEvent, Suspense, useEffect, useMemo, useState } from "react";
import { BackupBanner } from "@/components/BackupBanner";
import { memberName, useSaath, WEEKDAYS } from "@/lib/store";

function CirclePageInner() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const {
    circles,
    hydrated,
    profile,
    sendChat,
    cantDriveToday,
    applyDriveCredits,
    applyRideCost,
  } = useSaath();
  const [message, setMessage] = useState("");
  const [copied, setCopied] = useState(false);

  const circle = useMemo(
    () => circles.find((c) => c.id === params.id) ?? null,
    [circles, params.id],
  );

  useEffect(() => {
    if (hydrated && !circle) router.replace("/match");
  }, [hydrated, circle, router]);

  if (!hydrated || !circle) {
    return (
      <main className="page flex flex-1 items-center justify-center">
        <p className="text-muted">Loading your Saath…</p>
      </main>
    );
  }

  const todayDriver = memberName(circle, circle.todayDriverId);
  const isDriver = profile?.role === "driver";
  const circleId = circle.id;
  const inviteText = `${circle.routeFrom} → ${circle.routeTo} ${circle.departureWindow} Circle — join my Saath. We need 2 more commuters.`;

  function onSend(e: FormEvent) {
    e.preventDefault();
    sendChat(circleId, message);
    setMessage("");
  }

  async function shareCircle() {
    try {
      await navigator.clipboard.writeText(inviteText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  }

  return (
    <main className="page">
      <div className="md:mb-2">
        <p className="label-caps text-accent">My Circle</p>
        <h1 className="mt-2 font-display text-[1.75rem] font-semibold text-ink md:text-3xl">
          {circle.name}
        </h1>
        <p className="mt-1 text-sm text-muted">
          {circle.routeFrom} → {circle.routeTo}
        </p>
      </div>

      <div className="mt-5 grid gap-3 md:grid-cols-2 md:gap-5">
        <div className="space-y-3">
          <section className="rounded-[12px] bg-ink p-5 text-white">
            <p className="label-caps text-white/50">Today&apos;s assignment</p>
            <p className="mt-2 font-display text-xl font-semibold">
              {todayDriver} drives
            </p>
            <p className="mt-1 text-sm text-white/55">{circle.departureWindow}</p>
            <div className="mt-4 flex flex-wrap gap-2">
              {isDriver && (
                <button
                  type="button"
                  className="rounded-[8px] bg-danger px-3 py-2 text-sm font-semibold text-white"
                  onClick={() => cantDriveToday(circle.id)}
                >
                  Can&apos;t drive today
                </button>
              )}
              {isDriver ? (
                <button
                  type="button"
                  className="rounded-[8px] bg-accent px-3 py-2 text-sm font-semibold text-white"
                  onClick={() => applyDriveCredits(3)}
                >
                  Complete drive (+30)
                </button>
              ) : (
                <button
                  type="button"
                  className="rounded-[8px] bg-white/12 px-3 py-2 text-sm font-semibold"
                  onClick={applyRideCost}
                >
                  Rode today (−10)
                </button>
              )}
            </div>
          </section>

          {profile?.role === "driver" && profile.driver && (
            <section className="surface p-4">
              <p className="text-xs font-bold uppercase tracking-wider text-muted">
                Your vehicle
              </p>
              <p className="mt-1 font-semibold text-ink">
                {profile.driver.vehicleMake} {profile.driver.vehicleModel} ·{" "}
                {profile.driver.vehicleColor}
              </p>
              <p className="text-sm text-muted">
                {profile.driver.plateNumber} · {profile.driver.seats} seats
              </p>
            </section>
          )}

          <section className="surface p-4">
            <h2 className="font-display text-lg font-semibold text-ink">
              Driver rotation
            </h2>
            <ol className="mt-3 grid grid-cols-5 gap-1.5">
              {WEEKDAYS.map((day, i) => {
                const driverId = circle.rotation[i] ?? circle.rotation[0];
                return (
                  <li
                    key={day}
                    className="rounded-xl bg-bg px-1 py-2.5 text-center"
                  >
                    <p className="text-[10px] font-bold uppercase text-accent">
                      {day}
                    </p>
                    <p className="mt-1 text-[11px] font-bold text-ink">
                      {memberName(circle, driverId).split(" ")[0]}
                    </p>
                  </li>
                );
              })}
            </ol>
          </section>

          <section className="surface p-4">
            <h2 className="font-display text-lg font-semibold text-ink">
              Members
            </h2>
            <ul className="mt-3 space-y-3">
              {circle.members.map((m) => (
                <li
                  key={m.id}
                  className="flex items-center justify-between gap-2"
                >
                  <div>
                    <p className="text-sm font-semibold text-ink">
                      {m.name}
                      {m.isYou ? " (you)" : ""}
                    </p>
                    <p className="text-xs text-muted">
                      {m.role === "car_owner"
                        ? `${m.carModel ?? "Car"} · driver`
                        : "Passenger"}{" "}
                      · ★ {m.rating.toFixed(1)}
                    </p>
                  </div>
                  <span className="text-xs font-bold text-accent">
                    {m.credits} cr
                  </span>
                </li>
              ))}
            </ul>
          </section>
        </div>

        <div className="space-y-3">
          <section className="surface overflow-hidden md:min-h-[420px] md:flex md:flex-col">
            <div className="border-b border-line px-4 py-3">
              <h2 className="font-display text-lg font-semibold text-ink">
                Chat
              </h2>
            </div>
            <div className="max-h-56 space-y-2 overflow-y-auto px-4 py-3 md:max-h-none md:flex-1">
              {circle.chat.map((msg) => (
                <div
                  key={msg.id}
                  className={`rounded-xl px-3 py-2 text-sm ${
                    msg.system
                      ? "bg-accent-soft text-accent-deep"
                      : msg.author === (profile?.name || "You")
                        ? "ml-6 bg-ink text-white"
                        : "mr-6 bg-bg text-ink"
                  }`}
                >
                  {!msg.system && (
                    <p className="text-[10px] font-bold opacity-60">
                      {msg.author}
                    </p>
                  )}
                  <p>{msg.text}</p>
                </div>
              ))}
            </div>
            <form
              onSubmit={onSend}
              className="flex gap-2 border-t border-line p-3"
            >
              <input
                className="input-field flex-1 !py-2.5"
                placeholder="Message…"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
              />
              <button type="submit" className="btn-ink !px-4 !py-2.5">
                Send
              </button>
            </form>
          </section>

          <section className="rounded-[12px] border border-dashed border-accent/40 bg-accent-soft/40 p-4">
            <h2 className="font-display text-lg font-semibold text-ink">
              Need 2 more people
            </h2>
            <p className="mt-1 text-sm text-muted">
              Share your Circle invite with colleagues.
            </p>
            <button
              type="button"
              className="btn-primary mt-3"
              onClick={shareCircle}
            >
              {copied ? "Copied!" : "Share invite"}
            </button>
            <Link
              href="/credits"
              className="mt-3 block text-sm font-semibold text-accent"
            >
              View credits
            </Link>
          </section>
        </div>
      </div>

      <BackupBanner />
    </main>
  );
}

export default function CirclePage() {
  return (
    <Suspense
      fallback={
        <main className="page flex flex-1 items-center justify-center">
          <p className="text-muted">Loading…</p>
        </main>
      }
    >
      <CirclePageInner />
    </Suspense>
  );
}
