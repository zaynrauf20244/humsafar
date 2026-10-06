"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { useSaath } from "@/lib/store";
import type { CircleCategory, Weekday } from "@/lib/types";

const DAYS: Weekday[] = ["M", "T", "W", "Th", "F"];
const DAY_LABEL: Record<Weekday, string> = {
  M: "M",
  T: "T",
  W: "W",
  Th: "T",
  F: "F",
};

const CATEGORIES: { id: CircleCategory; label: string }[] = [
  { id: "public", label: "Public" },
  { id: "office", label: "Office" },
  { id: "women", label: "Women" },
  { id: "university", label: "Uni" },
  { id: "society", label: "Society" },
];

export default function PassengerRegisterPage() {
  const router = useRouter();
  const { setProfileAndMatch } = useSaath();

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [home, setHome] = useState("Bahria Town");
  const [office, setOffice] = useState("Gulberg");
  const [arriveBy, setArriveBy] = useState("09:00");
  const [days, setDays] = useState<Weekday[]>(["M", "T", "W", "Th", "F"]);
  const [category, setCategory] = useState<CircleCategory>("public");

  function toggleDay(day: Weekday) {
    setDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day],
    );
  }

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    setProfileAndMatch({
      role: "passenger",
      name: name.trim() || "Passenger",
      phone: phone.trim(),
      home: home.trim(),
      office: office.trim(),
      arriveBy,
      days,
      category,
    });
    router.push("/match");
  }

  return (
    <main className="page page-narrow flex flex-1 flex-col md:py-10">
      <Link href="/" className="mb-6 text-sm font-semibold text-muted">
        ← Back
      </Link>

      <p className="label-caps text-accent">Passenger registration</p>
      <h1 className="mt-2 font-display text-[1.75rem] font-semibold text-ink">
        Commute profile
      </h1>
      <p className="mt-1.5 text-sm text-muted">
        Join a verified recurring Circle on your route — not a new driver every day.
      </p>

      <form onSubmit={onSubmit} className="mt-6 flex flex-1 flex-col gap-4">
        <label className="block">
          <span className="mb-1.5 block text-sm font-semibold text-ink-soft">
            Full name
          </span>
          <input
            className="input-field"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Hamza"
            required
          />
        </label>

        <label className="block">
          <span className="mb-1.5 block text-sm font-semibold text-ink-soft">
            Phone
          </span>
          <input
            className="input-field"
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="03XX XXXXXXX"
            required
          />
        </label>

        <label className="block">
          <span className="mb-1.5 block text-sm font-semibold text-ink-soft">
            Home
          </span>
          <input
            className="input-field"
            value={home}
            onChange={(e) => setHome(e.target.value)}
            required
          />
        </label>

        <label className="block">
          <span className="mb-1.5 block text-sm font-semibold text-ink-soft">
            Office
          </span>
          <input
            className="input-field"
            value={office}
            onChange={(e) => setOffice(e.target.value)}
            required
          />
        </label>

        <label className="block">
          <span className="mb-1.5 block text-sm font-semibold text-ink-soft">
            Arrive by
          </span>
          <input
            className="input-field"
            type="time"
            value={arriveBy}
            onChange={(e) => setArriveBy(e.target.value)}
            required
          />
        </label>

        <div>
          <span className="mb-2 block text-sm font-semibold text-ink-soft">
            Days
          </span>
          <div className="flex gap-2">
            {DAYS.map((day) => (
              <button
                key={day}
                type="button"
                className={`day-chip ${days.includes(day) ? "active" : ""}`}
                onClick={() => toggleDay(day)}
              >
                {DAY_LABEL[day]}
              </button>
            ))}
          </div>
        </div>

        <div>
          <span className="mb-2 block text-sm font-semibold text-ink-soft">
            Prefer Circle type
          </span>
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map((c) => (
              <button
                key={c.id}
                type="button"
                onClick={() => setCategory(c.id)}
                className={`rounded-xl px-3 py-2 text-sm font-semibold ${
                  category === c.id
                    ? "bg-ink text-white"
                    : "bg-surface text-muted ring-1 ring-line"
                }`}
              >
                {c.label}
              </button>
            ))}
          </div>
        </div>

        <button type="submit" className="btn-primary mt-auto w-full">
          Find My Circle
        </button>
      </form>
    </main>
  );
}
