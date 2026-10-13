"use client";

import { Card } from "@/components/ui";
import { useI18n } from "@/lib/i18n";

export default function TermsPage() {
  const { t } = useI18n();
  return (
    <main className="page max-w-lg space-y-4">
      <h1 className="font-display text-26 font-bold">{t("terms")}</h1>
      <Card className="space-y-3 text-14 leading-relaxed text-muted">
        <p>{t("costShareLegal")}</p>
        <p>
          Users share rides at their own responsibility. CNIC verification,
          hidden chat, and SOS are for safety — this is not a taxi licence.
        </p>
        <p>
          Lawyer review recommended: cost sharing, vehicle insurance, payment
          licensing.
        </p>
      </Card>
    </main>
  );
}
