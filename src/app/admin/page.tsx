"use client";

import { useState } from "react";
import {
  Badge,
  Button,
  Card,
  EmptyState,
  useToast,
} from "@/components/ui";
import { useI18n } from "@/lib/i18n";
import { DEMO_OTP } from "@/lib/seed";
import { useHumSafar } from "@/lib/store";

export default function AdminPage() {
  const {
    me,
    users,
    bookings,
    complaints,
    sosAlerts,
    walletTx,
    settings,
    adminStepOk,
    setAdminStepOk,
    setCnicStatus,
    resolveComplaint,
    setSettings,
    banUser,
    unblockUser,
    adjustWallet,
  } = useHumSafar();
  const { t } = useI18n();
  const { show } = useToast();
  const [stepCode, setStepCode] = useState("");
  const [tab, setTab] = useState<
    "dash" | "verify" | "users" | "rides" | "sos" | "wallet" | "settings"
  >("dash");
  const [rejectReason, setRejectReason] = useState("");
  const [adjUser, setAdjUser] = useState("");
  const [adjAmt, setAdjAmt] = useState(0);
  const [adjNote, setAdjNote] = useState("");

  if (!me || me.role !== "admin") {
    return (
      <main className="page">
        <EmptyState
          title="Admin access"
          body={`Login 03000000000 · OTP ${DEMO_OTP}`}
        />
      </main>
    );
  }

  if (!adminStepOk) {
    return (
      <main className="auth-shell">
        <Card className="auth-card space-y-4">
          <h1 className="font-display text-26 font-bold">2-step admin</h1>
          <p className="text-14 text-muted">
            Extra code: 999999 (demo). Every action is logged.
          </p>
          <input
            className="input tracking-widest"
            value={stepCode}
            onChange={(e) => setStepCode(e.target.value)}
            placeholder="999999"
          />
          <Button
            className="w-full"
            onClick={() => {
              if (stepCode === "999999") setAdminStepOk(true);
              else show("Wrong code");
            }}
          >
            Enter
          </Button>
        </Card>
      </main>
    );
  }

  const pending = users.filter(
    (u) => u.role !== "admin" && u.cnicStatus === "pending"
  );
  const completed = bookings.filter((b) => b.status === "completed");
  const feeTotal = completed.reduce((s, b) => s + b.platformFee, 0);
  const liveSos = sosAlerts.filter((s) => s.status === "live");

  const tabs = [
    ["dash", t("dashboard")],
    ["verify", t("verification")],
    ["users", t("users")],
    ["rides", t("myRides")],
    ["sos", "SOS"],
    ["wallet", t("wallet")],
    ["settings", t("settings")],
  ] as const;

  return (
    <main className="page space-y-4">
      <div>
        <p className="label-caps">{t("admin")}</p>
        <h1 className="font-display text-26 font-bold">{t("dashboard")}</h1>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-1">
        {tabs.map(([id, label]) => (
          <button
            key={id}
            type="button"
            className={`chip whitespace-nowrap ${tab === id ? "active" : ""}`}
            onClick={() => setTab(id)}
          >
            {label}
          </button>
        ))}
      </div>

      {tab === "dash" ? (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <Stat label="Today's rides" value={bookings.length} />
          <Stat label="Pending verify" value={pending.length} />
          <Stat label="Live SOS" value={liveSos.length} />
          <Stat label="Wallet fees" value={`Rs ${feeTotal}`} />
        </div>
      ) : null}

      {tab === "verify" ? (
        <div className="space-y-3">
          {pending.length === 0 ? (
            <p className="text-muted">Verification queue is empty</p>
          ) : null}
          {pending.map((u) => (
            <Card key={u.id} className="space-y-3">
              <div>
                <p className="font-bold">{u.name}</p>
                <p className="text-14 text-muted">
                  {u.phone} · {u.cnic} · {u.gender} · {u.age}
                </p>
                {u.vehicle ? (
                  <p className="text-14">
                    {u.vehicle.make} {u.vehicle.model} · {u.vehicle.plate}
                  </p>
                ) : null}
              </div>
              <input
                className="input"
                placeholder={t("reason")}
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
              />
              <div className="flex gap-2">
                <Button
                  onClick={() => {
                    setCnicStatus(u.id, "approved");
                    show(t("approve"));
                  }}
                >
                  {t("approve")}
                </Button>
                <Button
                  variant="danger"
                  onClick={() => {
                    setCnicStatus(u.id, "rejected", rejectReason || "Docs unclear");
                    show(t("rejectBtn"));
                  }}
                >
                  {t("rejectBtn")}
                </Button>
              </div>
            </Card>
          ))}
        </div>
      ) : null}

      {tab === "users" ? (
        <div className="overflow-x-auto card !p-0">
          <table className="table-pro">
            <thead>
              <tr>
                <th>Name</th>
                <th>Role</th>
                <th>Status</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {users
                .filter((u) => u.role !== "admin")
                .map((u) => (
                  <tr key={u.id}>
                    <td>
                      <p className="font-semibold">{u.name}</p>
                      <p className="text-12 text-muted">{u.phone}</p>
                    </td>
                    <td>{u.role}</td>
                    <td>
                      <Badge tone={u.banned ? "red" : "teal"}>
                        {u.banned ? "banned" : u.cnicStatus}
                      </Badge>
                    </td>
                    <td className="space-x-2">
                      {u.banned ? (
                        <button
                          type="button"
                          className="text-14 font-bold text-teal"
                          onClick={() => unblockUser(u.id)}
                        >
                          {t("unban")}
                        </button>
                      ) : (
                        <button
                          type="button"
                          className="text-14 font-bold text-red"
                          onClick={() => banUser(u.id)}
                        >
                          {t("ban")}
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      ) : null}

      {tab === "rides" ? (
        <div className="space-y-2">
          {bookings.length === 0 ? (
            <p className="text-muted">No rides</p>
          ) : (
            bookings.map((b) => (
              <Card key={b.id} className="flex justify-between gap-3 !py-3">
                <div>
                  <p className="font-semibold">
                    {b.pickup} → {b.drop}
                  </p>
                  <p className="text-12 text-muted">
                    {b.status} · Rs {b.rate} · fee {b.platformFee}
                  </p>
                </div>
                <Badge tone="mist">{b.status}</Badge>
              </Card>
            ))
          )}
          <h3 className="pt-2 font-bold">{t("complaints")}</h3>
          {complaints.map((c) => (
            <Card key={c.id} className="space-y-2">
              <p className="text-14">{c.text}</p>
              <Badge tone="marigold">{c.status}</Badge>
              <div className="flex gap-2">
                <Button
                  variant="secondary"
                  onClick={() => resolveComplaint(c.id, "in_progress")}
                >
                  In progress
                </Button>
                <Button onClick={() => resolveComplaint(c.id, "resolved")}>
                  Resolve
                </Button>
              </div>
            </Card>
          ))}
        </div>
      ) : null}

      {tab === "sos" ? (
        <div className="space-y-2">
          {liveSos.length === 0 ? (
            <p className="text-muted">No live SOS</p>
          ) : (
            liveSos.map((s) => (
              <Card key={s.id} className="border-red">
                <Badge tone="red">LIVE</Badge>
                <p className="mt-2 font-bold">{s.location}</p>
                <p className="text-14 text-muted">
                  User {s.userId} · {new Date(s.at).toLocaleString()}
                </p>
              </Card>
            ))
          )}
        </div>
      ) : null}

      {tab === "wallet" ? (
        <div className="space-y-3">
          <Card className="space-y-3">
            <h3 className="font-bold">{t("adjustWallet")}</h3>
            <input
              className="input"
              placeholder="User id"
              value={adjUser}
              onChange={(e) => setAdjUser(e.target.value)}
            />
            <input
              className="input"
              type="number"
              placeholder="Amount (+/-)"
              value={adjAmt}
              onChange={(e) => setAdjAmt(Number(e.target.value))}
            />
            <input
              className="input"
              placeholder={t("reason")}
              value={adjNote}
              onChange={(e) => setAdjNote(e.target.value)}
            />
            <Button
              onClick={() => {
                if (!adjNote.trim()) {
                  show("Reason required");
                  return;
                }
                adjustWallet(adjUser, adjAmt, adjNote);
                show("Adjusted");
              }}
            >
              Save
            </Button>
          </Card>
          {walletTx.slice(0, 20).map((tx) => (
            <Card key={tx.id} className="flex justify-between !py-3">
              <div>
                <p className="font-semibold">{tx.note}</p>
                <p className="text-12 text-muted">
                  {tx.userId} · {tx.type}
                </p>
              </div>
              <p className="font-bold">{tx.amount}</p>
            </Card>
          ))}
        </div>
      ) : null}

      {tab === "settings" ? (
        <Card className="space-y-3">
          <Field
            label="Per km"
            value={settings.perKm}
            onChange={(n) => setSettings({ perKm: n })}
          />
          <Field
            label="Fee %"
            value={settings.feePercent}
            onChange={(n) => setSettings({ feePercent: n })}
          />
          <Field
            label="Min rate"
            value={settings.minRate}
            onChange={(n) => setSettings({ minRate: n })}
          />
          <Field
            label="Max rate"
            value={settings.maxRate}
            onChange={(n) => setSettings({ maxRate: n })}
          />
          <Field
            label="Signup bonus"
            value={settings.signupBonus}
            onChange={(n) => setSettings({ signupBonus: n })}
          />
          <Button onClick={() => show("Saved")}>{t("save")}</Button>
          <p className="text-12 text-muted">
            Broadcast / CSV reports — demo UI ready for backend hookup
          </p>
          <Button variant="secondary">{t("broadcast")}</Button>
          <Button variant="secondary">{t("reports")} (CSV)</Button>
        </Card>
      ) : null}
    </main>
  );
}

function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="stat-card">
      <p className="stat-label">{label}</p>
      <p className="stat-value">{value}</p>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number;
  onChange: (n: number) => void;
}) {
  return (
    <label className="block">
      <span className="field-label">{label}</span>
      <input
        className="input"
        type="number"
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
      />
    </label>
  );
}
