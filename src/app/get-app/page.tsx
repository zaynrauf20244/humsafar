"use client";

import { Button, Card } from "@/components/ui";
import { useI18n } from "@/lib/i18n";

export default function GetAppPage() {
  const { t } = useI18n();
  return (
    <main className="page max-w-lg space-y-4">
      <h1 className="font-display text-26 font-bold">{t("getApp")}</h1>
      <Card className="space-y-3">
        <p className="text-16 text-muted">
          Add HumSafar to your home screen to use it like an app — light enough for
          slow connections.
        </p>
        <Button
          className="w-full"
          onClick={() => {
            window.alert("Use your browser menu: Install / Add to Home Screen");
          }}
        >
          Install
        </Button>
      </Card>
    </main>
  );
}
