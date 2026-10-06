"use client";

import { useSaath } from "@/lib/store";

export function BackupBanner() {
  const { backupOffer, acceptBackup, dismissBackup } = useSaath();
  if (!backupOffer) return null;

  return (
    <div
      className="fixed inset-x-0 bottom-0 z-[60] p-4"
      style={{ paddingBottom: "calc(4.25rem + var(--safe-bottom))" }}
    >
      <div className="mx-auto w-full max-w-lg rounded-[12px] border border-line bg-surface p-5 shadow-lg shadow-ink/10 md:max-w-md">
        <p className="label-caps text-accent">Coverage alert</p>
        <h3 className="mt-2 font-display text-lg font-semibold text-ink">
          Backup driver available
        </h3>
        <p className="mt-2 text-sm text-muted">
          {backupOffer.driverName} · Pickup {backupOffer.pickupTime}
        </p>
        <div className="mt-4 flex gap-2">
          <button type="button" className="btn-primary flex-1" onClick={acceptBackup}>
            Accept
          </button>
          <button
            type="button"
            className="btn-secondary flex-1"
            onClick={dismissBackup}
          >
            Dismiss
          </button>
        </div>
      </div>
    </div>
  );
}
