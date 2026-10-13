"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { Button, Card, Switch, useToast } from "@/components/ui";
import { useI18n } from "@/lib/i18n";
import { useHumSafar } from "@/lib/store";

export default function SettingsPage() {
  const { me, locale, setLocale, updateMe, logout } = useHumSafar();
  const { t } = useI18n();
  const { show } = useToast();

  if (!me) {
    return (
      <main className="page">
        <Link href="/login" className="btn btn-primary">
          {t("login")}
        </Link>
      </main>
    );
  }

  return (
    <main className="page max-w-lg space-y-4">
      <h1 className="font-display text-26 font-bold">{t("settings")}</h1>

      <Card className="space-y-4">
        <Row label={t("language")}>
          <div className="flex gap-2">
            <Button
              variant={locale === "ur" ? "primary" : "secondary"}
              className="!min-h-11"
              onClick={() => setLocale("ur")}
            >
              {t("urdu")}
            </Button>
            <Button
              variant={locale === "en" ? "primary" : "secondary"}
              className="!min-h-11"
              onClick={() => setLocale("en")}
            >
              {t("english")}
            </Button>
          </div>
        </Row>
        <Row label={t("darkMode")}>
          <Switch
            on={!!me.darkMode}
            onChange={(on) => updateMe({ darkMode: on })}
          />
        </Row>
        <Row label={t("notifications")}>
          <Switch
            on={me.notifyPush !== false}
            onChange={(on) => updateMe({ notifyPush: on })}
          />
        </Row>
        <Row label="Quiet hours at night">
          <Switch
            on={!!me.notifyQuietHours}
            onChange={(on) => updateMe({ notifyQuietHours: on })}
          />
        </Row>
        <p className="text-12 text-muted">
          Safety notifications cannot be turned off
        </p>
      </Card>

      <Card className="space-y-2">
        <p className="font-bold">{t("blocked")}</p>
        {me.blockedUserIds.length === 0 ? (
          <p className="text-14 text-muted">None</p>
        ) : (
          me.blockedUserIds.map((id) => (
            <p key={id} className="text-14">
              {id}
            </p>
          ))
        )}
      </Card>

      <Card className="space-y-3">
        <Link href="/help" className="btn btn-secondary w-full">
          {t("help")} / FAQ
        </Link>
        <a
          href="https://wa.me/923001234567"
          className="btn btn-secondary w-full"
          target="_blank"
          rel="noreferrer"
        >
          WhatsApp {t("support")}
        </a>
        <Link href="/terms" className="btn btn-ghost w-full">
          {t("terms")}
        </Link>
        <Link href="/privacy" className="btn btn-ghost w-full">
          {t("privacy")}
        </Link>
        <p className="text-12 text-muted">
          {t("version")}: 0.1.0 · {t("costShareLegal")}
        </p>
        <Button
          variant="danger"
          className="w-full"
          onClick={() => {
            if (me.walletBalance > 0) {
              show(`Clear wallet balance first (Rs ${me.walletBalance})`);
              return;
            }
            show("Account delete request (demo)");
            logout();
          }}
        >
          {t("deleteAccount")}
        </Button>
      </Card>
    </main>
  );
}

function Row({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <div className="flex items-center justify-between gap-3">
      <p className="text-16 font-semibold">{label}</p>
      {children}
    </div>
  );
}
