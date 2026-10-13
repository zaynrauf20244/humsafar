"use client";

import { Card } from "@/components/ui";
import { useI18n } from "@/lib/i18n";

const faqs = [
  {
    q: "Is this a taxi?",
    a: "No — it's cost sharing. Ride with someone already going your way.",
  },
  {
    q: "How does payment work?",
    a: "Passengers pay the driver in cash. The app fee is deducted from the driver's wallet.",
  },
  {
    q: "How does Girls only work?",
    a: "Plum badge plus the label “Girls only”. Only verified women drivers.",
  },
  {
    q: "SOS?",
    a: "Hold for 3 seconds — alerts emergency contacts and admin.",
  },
];

export default function HelpPage() {
  const { t } = useI18n();
  return (
    <main className="page max-w-lg space-y-4">
      <h1 className="font-display text-26 font-bold">{t("help")}</h1>
      {faqs.map((f) => (
        <Card key={f.q}>
          <p className="font-bold">{f.q}</p>
          <p className="mt-1 text-14 text-muted">{f.a}</p>
        </Card>
      ))}
    </main>
  );
}
