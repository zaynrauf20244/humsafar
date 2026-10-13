"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Building2,
  Bus,
  GraduationCap,
  Home,
  Plane,
  School,
  Ticket,
  Venus,
} from "lucide-react";
import { Card } from "@/components/ui";
import { COMMUTE_TYPES, type CommuteType } from "@/lib/commute-types";
import { useHumSafar } from "@/lib/store";

const ICONS: Record<CommuteType, typeof Building2> = {
  office: Building2,
  university: GraduationCap,
  women: Venus,
  society: Home,
  school: School,
  intercity: Bus,
  airport: Plane,
  event: Ticket,
};

export default function CirclesPage() {
  const { routes, me } = useHumSafar();
  const router = useRouter();

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
    <main className="page space-y-5">
      <div>
        <p className="label-caps">HumSafar circles</p>
        <h1 className="mt-1 font-display text-26 font-extrabold">
          How do you commute?
        </h1>
        <p className="mt-2 text-16 text-muted">
          Eight ways people already travel together — pick one to find or offer
          a seat.
        </p>
      </div>

      <div className="space-y-3">
        {COMMUTE_TYPES.map((c) => {
          const Icon = ICONS[c.id];
          const count = routes.filter(
            (r) => r.active && r.commuteType === c.id && r.seatsLeft > 0
          ).length;
          return (
            <button
              key={c.id}
              type="button"
              className="card w-full space-y-2 p-4 text-start transition active:scale-[0.99]"
              onClick={() =>
                router.push(`/?type=${c.id}&mode=find`)
              }
            >
              <div className="flex items-start gap-3">
                <span
                  className={`flex size-11 shrink-0 items-center justify-center rounded-xl ${
                    c.id === "women" ? "bg-plum-soft text-plum" : "bg-teal-soft text-teal"
                  }`}
                >
                  <Icon className="size-5" />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <h2 className="font-display text-18 font-bold">{c.title}</h2>
                    <span className="badge badge-mist shrink-0">
                      {count} open
                    </span>
                  </div>
                  <p className="mt-1 text-14 text-muted">{c.blurb}</p>
                  <p className="mt-2 text-12 font-semibold text-teal">
                    {c.examples.join(" · ")}
                  </p>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      <Card className="bg-mist !shadow-none">
        <p className="text-14 text-muted">
          Later: permanent Circles with driver rotation. Right now you can
          offer or find a seat in any of these types.
        </p>
      </Card>
    </main>
  );
}
