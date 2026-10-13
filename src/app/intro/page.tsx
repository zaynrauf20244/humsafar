"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button, Stepper } from "@/components/ui";
import { useHumSafar } from "@/lib/store";

const slides = [
  {
    title: "Find your HumSafar",
    body: "Not a taxi. People already going your way — every day.",
  },
  {
    title: "Offer a seat",
    body: "Share empty seats on a ride you already take. You set the price.",
  },
  {
    title: "Eight ways to commute",
    body: "Office, uni, women-only, society, school, inter-city, airport, events.",
  },
];

export default function IntroPage() {
  const { setIntroDone, locale, setLocale } = useHumSafar();
  const router = useRouter();
  const [step, setStep] = useState(0);

  function finish() {
    setIntroDone();
    router.replace("/login");
  }

  return (
    <main className="page flex min-h-[85dvh] flex-col justify-between py-8">
      <div className="flex items-center justify-between">
        <Stepper step={step + 1} total={3} />
        <button
          type="button"
          className="min-h-11 text-14 font-semibold text-muted"
          onClick={finish}
        >
          Skip
        </button>
      </div>

      <div className="animate-rise py-10 text-center">
        <div className="mx-auto mb-8 flex size-16 items-center justify-center rounded-2xl bg-teal font-display text-26 font-extrabold text-white">
          H
        </div>
        <h1 className="font-display text-32 font-bold text-ink">
          {slides[step].title}
        </h1>
        <p className="mx-auto mt-3 max-w-sm text-16 text-muted">
          {slides[step].body}
        </p>
      </div>

      <div className="space-y-3">
        {step === 0 ? (
          <div className="flex gap-2">
            <Button
              variant={locale === "en" ? "primary" : "secondary"}
              className="flex-1"
              onClick={() => setLocale("en")}
            >
              English
            </Button>
            <Button
              variant={locale === "ur" ? "primary" : "secondary"}
              className="flex-1"
              onClick={() => setLocale("ur")}
            >
              اردو
            </Button>
          </div>
        ) : null}
        <Button
          className="w-full"
          onClick={() => {
            if (step < 2) setStep(step + 1);
            else finish();
          }}
        >
          {step < 2 ? "Next" : "Continue to login"}
        </Button>
      </div>
    </main>
  );
}
