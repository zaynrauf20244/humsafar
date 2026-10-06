"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useSaath } from "@/lib/store";

const CATEGORY_LABEL: Record<string, string> = {
  office: "Office",
  women: "Women",
  university: "University",
  society: "Society",
  friends: "Friends",
  public: "Public",
};

export default function MatchPage() {
  const router = useRouter();
  const { profile, circles, joinCircle, hydrated, joinedCircleId } = useSaath();

  useEffect(() => {
    if (hydrated && !profile) router.replace("/");
  }, [hydrated, profile, router]);

  if (!hydrated || !profile) {
    return (
      <main className="page flex flex-1 items-center justify-center">
        <p className="text-muted">Finding your people…</p>
      </main>
    );
  }

  return (
    <main className="page">
      <p className="animate-rise label-caps text-accent">
        {profile.role === "driver" ? "Driver matches" : "Passenger matches"}
      </p>
      <h1 className="animate-rise-delay-1 mt-2 font-display text-[1.75rem] font-semibold text-ink md:text-3xl">
        Recommended Circles
      </h1>
      <p className="animate-rise-delay-2 mt-1 text-sm text-muted">
        {profile.home} → {profile.office} · {profile.arriveBy}
      </p>

      <div className="mt-6 grid gap-3 md:grid-cols-2 lg:grid-cols-3">
        {circles.map((circle, i) => (
          <article
            key={circle.id}
            className={`surface animate-rise flex flex-col p-5 ${
              i === 1 ? "animate-rise-delay-1" : i === 2 ? "animate-rise-delay-2" : ""
            }`}
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-accent">
                  {CATEGORY_LABEL[circle.category]}
                </p>
                <h2 className="mt-1 font-display text-lg font-semibold text-ink">
                  {circle.name}
                </h2>
              </div>
              <div className="rounded-[6px] border border-line bg-bg px-2 py-1 text-sm font-semibold text-accent">
                {circle.matchScore}%
              </div>
            </div>

            <p className="mt-3 text-sm text-ink-soft">
              {circle.routeFrom} → {circle.routeTo}
            </p>
            <p className="mt-0.5 text-sm text-muted">
              {circle.departureWindow}
            </p>

            <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs font-medium text-muted">
              <span>{circle.members.length} people</span>
              <span>{circle.carsAvailable} cars</span>
              <span>±{circle.avgPickupDeviationMin} min</span>
              <span>★ {circle.rating.toFixed(1)}</span>
            </div>

            <ul className="mt-3 flex flex-wrap gap-1.5">
              {circle.members.slice(0, 5).map((m) => (
                <li
                  key={m.id}
                  className="rounded-lg bg-bg px-2.5 py-1 text-xs font-medium text-ink-soft"
                >
                  {m.name}
                  {m.carModel ? ` · ${m.carModel}` : ""}
                </li>
              ))}
            </ul>

            <div className="mt-auto pt-4">
              {joinedCircleId === circle.id ? (
                <Link href={`/circle/${circle.id}`} className="btn-ink w-full">
                  Open My Circle
                </Link>
              ) : (
                <button
                  type="button"
                  className="btn-primary w-full"
                  onClick={() => {
                    joinCircle(circle.id);
                    router.push(`/circle/${circle.id}`);
                  }}
                >
                  Join Circle
                </button>
              )}
            </div>
          </article>
        ))}
      </div>
    </main>
  );
}
