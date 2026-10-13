"use client";

import Link from "next/link";
import {
  Avatar,
  Badge,
  Button,
  Card,
  VerifiedMark,
} from "@/components/ui";
import { useI18n } from "@/lib/i18n";
import { formatPkPhone } from "@/lib/seed";
import { useHumSafar } from "@/lib/store";

export default function ProfilePage() {
  const { me, logout } = useHumSafar();
  const { t } = useI18n();

  if (!me) {
    return (
      <main className="page">
        <p className="text-muted">Login required</p>
        <Link href="/login" className="btn btn-primary mt-4 inline-flex">
          {t("login")}
        </Link>
      </main>
    );
  }

  return (
    <main className="page max-w-lg space-y-4">
      <h1 className="font-display text-26 font-bold">{t("profile")}</h1>

      <Card className="space-y-4">
        <div className="flex items-center gap-3">
          <Avatar name={me.name} size={56} />
          <div>
            <p className="font-display text-20 font-bold">{me.name}</p>
            <p className="text-14 text-muted">{formatPkPhone(me.phone)}</p>
            {me.cnicStatus === "approved" ? (
              <VerifiedMark />
            ) : (
              <Badge tone="marigold">{t("pendingVerify")}</Badge>
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 text-14">
          <Info label={t("gender")} value={me.gender} />
          <Info label={t("age")} value={String(me.age || "—")} />
          <Info label={t("cnic")} value={me.cnic} />
          <Info label="Role" value={me.role} />
          <Info label={t("rating")} value={`★ ${me.rating}`} />
          <Info label={t("wallet")} value={`Rs ${me.walletBalance}`} />
        </div>

        {me.vehicle ? (
          <div className="rounded-2xl bg-mist p-3 text-14">
            <p className="font-bold">{t("vehicle")}</p>
            <p>
              {me.vehicle.make} {me.vehicle.model} ({me.vehicle.year}) ·{" "}
              {me.vehicle.color}
            </p>
            <p>
              {t("plate")}: {me.vehicle.plate} · {me.vehicle.seats} seats
            </p>
            {me.licence ? (
              <p className="mt-1 text-muted">
                {t("licence")} expiry: {me.licence.expiry}
              </p>
            ) : null}
          </div>
        ) : null}

        <div>
          <p className="field-label">{t("emergency")}</p>
          {me.emergencyContacts.length === 0 ? (
            <p className="text-14 text-muted">Add in settings</p>
          ) : (
            me.emergencyContacts.map((c) => (
              <p key={c.phone} className="text-14">
                {c.name}: {c.phone} {c.tested ? "· tested" : ""}
              </p>
            ))
          )}
        </div>
      </Card>

      <div className="grid gap-2">
        <Link href="/settings" className="btn btn-secondary w-full">
          {t("settings")}
        </Link>
        <Link href="/join" className="btn btn-secondary w-full">
          {t("vehicle")} / verify
        </Link>
        <Button variant="ghost" className="w-full" onClick={logout}>
          {t("logout")}
        </Button>
      </div>
    </main>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-mist px-3 py-2">
      <p className="text-12 text-muted">{label}</p>
      <p className="font-semibold capitalize">{value}</p>
    </div>
  );
}
