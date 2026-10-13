"use client";

import { Card } from "@/components/ui";
import { useI18n } from "@/lib/i18n";

export default function PrivacyPage() {
  const { t } = useI18n();
  return (
    <main className="page max-w-lg space-y-4">
      <h1 className="font-display text-26 font-bold">{t("privacy")}</h1>
      <Card className="space-y-3 text-14 leading-relaxed text-muted">
        <p>
          CNIC and licence photos are stored privately — only admins can view
          them.
        </p>
        <p>Phone numbers stay hidden in chat.</p>
        <p>
          Before account deletion we show any wallet balance; some legal data
          may be kept for a period.
        </p>
        <p>We never store card data — payment gateways handle that.</p>
      </Card>
    </main>
  );
}
