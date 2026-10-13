"use client";

import { useRouter } from "next/navigation";
import type { ReactNode } from "react";
import { Bell, Camera, MapPin } from "lucide-react";
import { Button, Card } from "@/components/ui";
import { useI18n } from "@/lib/i18n";
import { useHumSafar } from "@/lib/store";

export default function OnboardingPage() {
  const { t, setLocale, locale } = useOnboard();
  const router = useRouter();

  return (
    <main className="page max-w-lg space-y-4 py-8">
      <p className="label-caps">{t("permissionsWhy")}</p>
      <h1 className="font-display text-26 font-bold">{t("chooseLang")}</h1>

      <div className="flex gap-2">
        <Button
          variant={locale === "ur" ? "primary" : "secondary"}
          className="flex-1"
          onClick={() => setLocale("ur")}
        >
          {t("urdu")}
        </Button>
        <Button
          variant={locale === "en" ? "primary" : "secondary"}
          className="flex-1"
          onClick={() => setLocale("en")}
        >
          {t("english")}
        </Button>
      </div>

      <Card className="space-y-4">
        <Perm
          icon={<MapPin className="size-6 text-teal" />}
          title="Location"
          body={t("locationWhy")}
        />
        <Perm
          icon={<Bell className="size-6 text-teal" />}
          title="Notifications"
          body={t("notifWhy")}
        />
        <Perm
          icon={<Camera className="size-6 text-teal" />}
          title="Camera"
          body={t("cameraWhy")}
        />
      </Card>

      <p className="text-14 text-muted">{t("costShareLegal")}</p>

      <Button className="w-full" onClick={() => router.push("/login")}>
        {t("continue")}
      </Button>
    </main>
  );
}

function useOnboard() {
  const { locale, setLocale } = useHumSafar();
  const { t } = useI18n();
  return { t, locale, setLocale };
}

function Perm({
  icon,
  title,
  body,
}: {
  icon: ReactNode;
  title: string;
  body: string;
}) {
  return (
    <div className="flex gap-3">
      <div className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-teal-soft">
        {icon}
      </div>
      <div>
        <p className="text-16 font-bold text-ink">{title}</p>
        <p className="text-14 text-muted">{body}</p>
      </div>
    </div>
  );
}
