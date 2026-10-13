"use client";

import Link from "next/link";
import { use } from "react";
import { Badge, Button, Card } from "@/components/ui";
import { useI18n } from "@/lib/i18n";
import { useHumSafar, useUser } from "@/lib/store";

export function RideDetail({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { bookings, me } = useHumSafar();
  const { t } = useI18n();
  const b = bookings.find((x) => x.id === id);
  const otherId =
    me?.id === b?.driverId ? b?.passengerId : b?.driverId;
  const other = useUser(otherId);

  if (!b) {
    return (
      <main className="page">
        <p className="text-muted">{t("emptyRides")}</p>
      </main>
    );
  }

  return (
    <main className="page max-w-lg space-y-4">
      <h1 className="font-display text-26 font-bold">{t("myRides")}</h1>
      <Card className="space-y-3">
        <div className="flex justify-between">
          <p className="font-bold">
            {b.pickup} → {b.drop}
          </p>
          <Badge tone="mist">{b.status}</Badge>
        </div>
        <p className="text-14 text-muted">
          {other?.name} · Rs {b.rate} · {t("pickupCode")} {b.pickupCode}
        </p>
        <p className="text-14">{t("cashPay")}</p>
        <div className="flex gap-2">
          <Link href={`/chat/${b.chatId}`} className="btn btn-primary flex-1">
            {t("chat")}
          </Link>
          <Link href="/rides" className="btn btn-secondary flex-1">
            {t("myRides")}
          </Link>
        </div>
        <Button
          variant="secondary"
          className="w-full"
          onClick={() => {
            if (navigator.share) {
              navigator.share({
                title: "HumSafar trip",
                text: `Live trip share (demo): ${b.pickup} → ${b.drop}`,
                url: window.location.href,
              });
            }
          }}
        >
          Trip share link
        </Button>
      </Card>
    </main>
  );
}
