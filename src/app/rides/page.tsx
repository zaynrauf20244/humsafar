"use client";

import Link from "next/link";
import { useState } from "react";
import {
  Button,
  Card,
  RatingStars,
  ScreenStates,
  useToast,
} from "@/components/ui";
import { useI18n } from "@/lib/i18n";
import { useHumSafar, useUser } from "@/lib/store";

export default function RidesPage() {
  const {
    me,
    bookings,
    markArrived,
    completeRide,
    shareLocation,
    cancelBooking,
    rateUser,
  } = useHumSafar();
  const { t } = useI18n();
  const { show } = useToast();
  const [err, setErr] = useState(false);
  const mine =
    me?.role === "admin"
      ? []
      : bookings.filter(
          (b) => b.driverId === me?.id || b.passengerId === me?.id
        );

  return (
    <main className="page space-y-4">
      <h1 className="font-display text-26 font-bold">{t("myRides")}</h1>
      <ScreenStates
        error={err}
        onRetry={() => setErr(false)}
        empty={!err && mine.length === 0}
        emptyTitle={t("emptyRides")}
        emptyBody={t("emptyRidesBody")}
        emptyAction={
          <Link href="/" className="btn btn-primary">
            {t("home")}
          </Link>
        }
      >
        <div className="space-y-3">
          {mine.map((b) => (
            <RideCard
              key={b.id}
              bookingId={b.id}
              onArrive={() => {
                markArrived(b.id);
                shareLocation(b.id);
                show(t("shareLocation"));
              }}
              onComplete={(cash) => {
                completeRide(b.id, cash);
                show(cash ? t("yes") : t("no"));
              }}
              onCancel={() => {
                cancelBooking(b.id, "Changed plans");
                show(t("cancel"));
              }}
              onRate={(userId, stars) => {
                rateUser(b.id, userId, stars);
                show(t("rating"));
              }}
            />
          ))}
        </div>
      </ScreenStates>
    </main>
  );
}

function RideCard({
  bookingId,
  onArrive,
  onComplete,
  onCancel,
  onRate,
}: {
  bookingId: string;
  onArrive: () => void;
  onComplete: (cash: boolean) => void;
  onCancel: () => void;
  onRate: (userId: string, stars: number) => void;
}) {
  const { bookings, me } = useHumSafar();
  const b = bookings.find((x) => x.id === bookingId);
  const { t } = useI18n();
  const [stars, setStars] = useState(5);
  const otherId =
    me?.id === b?.driverId ? b?.passengerId : b?.driverId;
  const other = useUser(otherId);
  if (!b || !me) return null;
  const iAmDriver = me.id === b.driverId;

  return (
    <Card className="space-y-3 animate-rise">
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="font-bold">
            {b.pickup} → {b.drop}
          </p>
          <p className="text-14 text-muted">
            {other?.name} · Rs {b.rate} · {b.status}
          </p>
        </div>
        <span className="badge badge-mist">{b.status}</span>
      </div>

      {(b.status === "accepted" || b.status === "ongoing") && (
        <div className="rounded-2xl bg-mist p-3">
          <p className="text-12 text-muted">{t("pickupCode")}</p>
          <p className="font-display text-32 font-bold tracking-widest">
            {b.pickupCode}
          </p>
          <p className="mt-1 text-12 text-muted">
            {t("plate")}:{" "}
            {iAmDriver
              ? me.vehicle?.plate
              : other?.vehicle?.plate || "—"}
          </p>
        </div>
      )}

      <div className="flex flex-wrap gap-2">
        {iAmDriver && b.status === "accepted" ? (
          <Button onClick={onArrive}>{t("arrived")}</Button>
        ) : null}
        {iAmDriver && (b.status === "accepted" || b.status === "ongoing") ? (
          <>
            <Button onClick={() => onComplete(true)}>
              {t("cashAsk")} {t("yes")}
            </Button>
            <Button variant="danger" onClick={() => onComplete(false)}>
              {t("no")}
            </Button>
          </>
        ) : null}
        {b.status === "requested" && !iAmDriver ? (
          <Button variant="secondary" onClick={onCancel}>
            {t("cancel")}
          </Button>
        ) : null}
        <Link href={`/chat/${b.chatId}`} className="btn btn-secondary">
          {t("chat")}
        </Link>
      </div>

      {b.status === "completed" ? (
        <div className="space-y-2 border-t border-line pt-3">
          <p className="text-14 font-semibold">{t("rating")}</p>
          <RatingStars value={stars} onChange={setStars} />
          <div className="flex flex-wrap gap-2">
            {["On time", "Clean car", "Polite"].map((tag) => (
              <span key={tag} className="chip">
                {tag}
              </span>
            ))}
          </div>
          <Button
            variant="secondary"
            onClick={() => otherId && onRate(otherId, stars)}
          >
            {t("save")}
          </Button>
          <p className="text-12 text-muted">{t("safeAsk")}</p>
        </div>
      ) : null}
    </Card>
  );
}
