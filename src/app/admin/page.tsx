"use client";

import Link from "next/link";
import { useState } from "react";
import { Badge, Button, Card, useToast } from "@/components/ui";
import { useI18n } from "@/lib/i18n";
import {
  ADMIN_PHONE,
  DEMO_OTP,
  formatCnic,
  normalizeCnic,
} from "@/lib/seed";
import { personaLabel, vehicleKindOf } from "@/lib/roles";
import { useHumSafar } from "@/lib/store";
import type { User } from "@/lib/types";

const ADMIN_CNIC = "0000000000000";

function roleLabel(u: Pick<User, "role" | "vehicle" | "preferredVehicleKind">) {
  return personaLabel(u.role, vehicleKindOf(u));
}

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
    setVehicleStatus,
    resolveComplaint,
    setSettings,
    banUser,
    unblockUser,
    adjustWallet,
    requestOtp,
    verifyOtp,
    logout,
    hydrated,
  } = useHumSafar();
  const { t } = useI18n();
  const { show } = useToast();
  const [stepCode, setStepCode] = useState("");
  const [tab, setTab] = useState<
    "dash" | "verify" | "users" | "rides" | "sos" | "settings"
  >("dash");
  const [rejectReason, setRejectReason] = useState("");
  const [adjUser, setAdjUser] = useState("");
  const [adjAmt, setAdjAmt] = useState(100);
  const [adjNote, setAdjNote] = useState("Admin top-up");

  const [phone, setPhone] = useState(ADMIN_PHONE);
  const [cnic, setCnic] = useState(ADMIN_CNIC);
  const [otp, setOtp] = useState("");
  const [authStep, setAuthStep] = useState<"details" | "otp">("details");
  const [authError, setAuthError] = useState("");

  if (!hydrated) {
    return (
      <main className="page">
        <p className="text-muted">Loading…</p>
      </main>
    );
  }

  if (!me || me.role !== "admin") {
    function sendAdminOtp(nextPhone = phone, nextCnic = cnic) {
      setAuthError("");
      if (me && me.role !== "admin") {
        logout();
      }
      setPhone(nextPhone);
      setCnic(nextCnic);
      const res = requestOtp(nextPhone, { intent: "signin", cnic: nextCnic });
      if (!res.ok) {
        setAuthError(
          res.error === "cnicMismatch"
            ? "CNIC doesn’t match admin account"
            : res.error === "noAccount"
              ? "Admin account missing — run npm run seed:live"
              : res.error || "Could not send code"
        );
        return;
      }
      setAuthStep("otp");
      setOtp(DEMO_OTP);
    }

    function verifyAdminOtp() {
      setAuthError("");
      const res = verifyOtp(otp.trim());
      if (!res.ok) {
        setAuthError("OTP wrong or expired");
        return;
      }
      show("Admin signed in — enter 2-step code");
    }

    return (
      <main className="auth-shell">
        <Card className="auth-card max-w-md space-y-4">
          <div>
            <p className="label-caps">HumSafar</p>
            <h1 className="font-display text-26 font-bold">Admin login</h1>
            <p className="mt-1 text-14 text-muted">
              Staff only. Phone + CNIC + OTP, then a second code.
            </p>
          </div>

          {me && me.role !== "admin" ? (
            <p className="rounded-xl bg-red-soft p-3 text-14 text-red">
              You’re signed in as {me.name} ({roleLabel(me)}). Sign out to use
              admin.
            </p>
          ) : null}

          {authStep === "details" ? (
            <>
              <label className="block">
                <span className="field-label">Phone</span>
                <input
                  className="input"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="03000000000"
                />
              </label>
              <label className="block">
                <span className="field-label">CNIC</span>
                <input
                  className="input tracking-wide"
                  value={formatCnic(cnic)}
                  onChange={(e) => setCnic(normalizeCnic(e.target.value))}
                  placeholder="00000-0000000-0"
                />
              </label>
              {authError ? (
                <p className="text-14 font-semibold text-red">{authError}</p>
              ) : null}
              <Button className="w-full" onClick={sendAdminOtp}>
                {me && me.role !== "admin" ? "Sign out & send code" : "Send code"}
              </Button>
              <button
                type="button"
                className="w-full text-14 font-semibold text-teal"
                onClick={() => sendAdminOtp(ADMIN_PHONE, ADMIN_CNIC)}
              >
                Use demo admin
              </button>
            </>
          ) : (
            <>
              <label className="block">
                <span className="field-label">OTP</span>
                <input
                  className="input text-center tracking-[0.35em] text-26"
                  inputMode="numeric"
                  maxLength={6}
                  value={otp}
                  onChange={(e) =>
                    setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))
                  }
                  autoFocus
                />
              </label>
              <p className="text-12 text-muted">Demo OTP {DEMO_OTP}</p>
              {authError ? (
                <p className="text-14 font-semibold text-red">{authError}</p>
              ) : null}
              <Button
                className="w-full"
                onClick={verifyAdminOtp}
                disabled={otp.length < 6}
              >
                Continue
              </Button>
              <button
                type="button"
                className="w-full text-14 font-semibold text-muted"
                onClick={() => setAuthStep("details")}
              >
                Back
              </button>
            </>
          )}

          <Link href="/login" className="block text-center text-14 text-muted">
            ← Back to app login
          </Link>
        </Card>
      </main>
    );
  }

  if (!adminStepOk) {
    return (
      <main className="auth-shell">
        <Card className="auth-card space-y-4">
          <h1 className="font-display text-26 font-bold">2-step admin</h1>
          <p className="text-14 text-muted">
            Extra code: <strong>999999</strong> (demo).
          </p>
          <input
            className="input tracking-widest"
            value={stepCode}
            onChange={(e) => setStepCode(e.target.value)}
            placeholder="999999"
            autoFocus
          />
          <Button
            className="w-full"
            onClick={() => {
              if (stepCode === "999999") {
                setAdminStepOk(true);
                show("Admin unlocked");
              } else show("Wrong code");
            }}
          >
            Enter panel
          </Button>
          <Button variant="ghost" className="w-full" onClick={() => logout()}>
            Sign out
          </Button>
        </Card>
      </main>
    );
  }

  const pendingCnic = users.filter(
    (u) => u.role !== "admin" && u.cnicStatus === "pending"
  );
  const pendingVehicles = users.filter(
    (u) =>
      u.role !== "admin" &&
      u.vehicle &&
      (u.vehicle.status ?? "approved") === "pending"
  );
  const pending = pendingCnic.length + pendingVehicles.length;
  const completed = bookings.filter((b) => b.status === "completed");
  const feeTotal = completed.reduce((s, b) => s + b.platformFee, 0);
  const liveSos = sosAlerts.filter((s) => s.status === "live");

  const tabs = [
    ["dash", t("dashboard")],
    ["verify", t("verification")],
    ["users", "Users & wallet"],
    ["rides", t("myRides")],
    ["sos", "SOS"],
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
          <Stat label="Pending verify" value={pending} />
          <Stat label="Live SOS" value={liveSos.length} />
          <Stat label="Wallet fees" value={`Rs ${feeTotal}`} />
        </div>
      ) : null}

      {tab === "verify" ? (
        <div className="space-y-6">
          <section className="space-y-3">
            <h2 className="font-display text-18 font-bold">CNIC</h2>
            {pendingCnic.length === 0 ? (
              <p className="text-muted">No pending CNICs</p>
            ) : null}
            {pendingCnic.map((u) => (
              <Card key={`cnic-${u.id}`} className="space-y-3">
                <div>
                  <p className="font-bold">{u.name}</p>
                  <p className="text-14 text-muted">
                    {u.phone} · {u.cnic} · {roleLabel(u)} · {u.gender} ·{" "}
                    {u.age}
                  </p>
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
                      setCnicStatus(
                        u.id,
                        "rejected",
                        rejectReason || "Docs unclear"
                      );
                      show(t("rejectBtn"));
                    }}
                  >
                    {t("rejectBtn")}
                  </Button>
                </div>
              </Card>
            ))}
          </section>

          <section className="space-y-3">
            <h2 className="font-display text-18 font-bold">
              Vehicles (car / bike)
            </h2>
            {pendingVehicles.length === 0 ? (
              <p className="text-muted">No pending vehicles</p>
            ) : null}
            {pendingVehicles.map((u) => {
              const v = u.vehicle!;
              return (
                <Card key={`veh-${u.id}`} className="space-y-3">
                  <div>
                    <p className="font-bold">{u.name}</p>
                    <p className="text-14 text-muted">
                      {u.phone} · {roleLabel(u)}
                    </p>
                    <p className="mt-1 text-14 font-semibold">
                      {v.kind === "bike" ? "Bike" : "Car"} · {v.make} {v.model}{" "}
                      ({v.year}) · {v.color}
                    </p>
                    <p className="text-14">
                      Plate {v.plate} · seats {v.seats}
                      {u.licence ? ` · licence exp ${u.licence.expiry}` : ""}
                    </p>
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
                        setVehicleStatus(u.id, "approved");
                        show("Vehicle approved");
                      }}
                    >
                      {t("approve")}
                    </Button>
                    <Button
                      variant="danger"
                      onClick={() => {
                        setVehicleStatus(
                          u.id,
                          "rejected",
                          rejectReason || "Vehicle docs unclear"
                        );
                        show(t("rejectBtn"));
                      }}
                    >
                      {t("rejectBtn")}
                    </Button>
                  </div>
                </Card>
              );
            })}
          </section>
        </div>
      ) : null}

      {tab === "users" ? (
        <div className="space-y-4">
          <div className="overflow-x-auto card !p-0">
            <table className="table-pro">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>CNIC</th>
                  <th>Role</th>
                  <th>Wallet</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users
                  .filter((u) => u.role !== "admin")
                  .map((u) => (
                    <tr
                      key={u.id}
                      className={adjUser === u.id ? "bg-teal-soft/40" : ""}
                    >
                      <td>
                        <p className="font-semibold">{u.name}</p>
                        <p className="text-12 text-muted">{u.phone}</p>
                      </td>
                      <td className="whitespace-nowrap font-mono text-13 tracking-wide">
                        {formatCnic(u.cnic)}
                      </td>
                      <td>{roleLabel(u)}</td>
                      <td className="font-bold whitespace-nowrap">
                        Rs {u.walletBalance}
                      </td>
                      <td>
                        <Badge tone={u.banned ? "red" : "teal"}>
                          {u.banned ? "banned" : u.cnicStatus}
                        </Badge>
                      </td>
                      <td>
                        <div className="flex flex-wrap items-center gap-2">
                          <button
                            type="button"
                            className="text-14 font-bold text-teal"
                            onClick={() => {
                              setAdjUser(u.id);
                              setAdjAmt(100);
                              setAdjNote(`Adjust ${u.name}`);
                            }}
                          >
                            Adjust
                          </button>
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
                        </div>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>

          <Card className="space-y-3">
            <h3 className="font-bold">Adjust wallet</h3>
            <p className="text-14 text-muted">
              {adjUser
                ? `Selected: ${users.find((u) => u.id === adjUser)?.name || adjUser}`
                : "Tap Adjust on a user above"}
            </p>
            <div className="grid gap-3 sm:grid-cols-2">
              <label className="block">
                <span className="field-label">Amount (+ credit / − debit)</span>
                <input
                  className="input"
                  type="number"
                  value={adjAmt}
                  onChange={(e) => setAdjAmt(Number(e.target.value))}
                />
              </label>
              <label className="block">
                <span className="field-label">{t("reason")}</span>
                <input
                  className="input"
                  value={adjNote}
                  onChange={(e) => setAdjNote(e.target.value)}
                  placeholder="Reason required"
                />
              </label>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button
                variant="secondary"
                onClick={() => setAdjAmt(Math.abs(adjAmt) || 100)}
              >
                + Credit
              </Button>
              <Button
                variant="secondary"
                onClick={() => setAdjAmt(-Math.abs(adjAmt || 100))}
              >
                − Debit
              </Button>
              <Button
                onClick={() => {
                  if (!adjUser) {
                    show("Select a user first");
                    return;
                  }
                  if (!adjNote.trim()) {
                    show("Reason required");
                    return;
                  }
                  if (!adjAmt) {
                    show("Enter amount");
                    return;
                  }
                  adjustWallet(adjUser, adjAmt, adjNote);
                  show(
                    `Wallet ${adjAmt > 0 ? "credited" : "debited"} Rs ${Math.abs(adjAmt)}`
                  );
                }}
              >
                Save
              </Button>
            </div>
          </Card>

          <div>
            <h3 className="mb-2 font-bold">Recent wallet activity</h3>
            <div className="space-y-2">
              {walletTx.length === 0 ? (
                <p className="text-muted">No transactions yet</p>
              ) : (
                walletTx.slice(0, 20).map((tx) => {
                  const who = users.find((u) => u.id === tx.userId);
                  return (
                    <Card key={tx.id} className="flex justify-between !py-3">
                      <div>
                        <p className="font-semibold">{tx.note}</p>
                        <p className="text-12 text-muted">
                          {who?.name || tx.userId} · {tx.type}
                        </p>
                      </div>
                      <p
                        className={`font-bold ${tx.amount < 0 ? "text-red" : "text-teal"}`}
                      >
                        {tx.amount > 0 ? "+" : ""}
                        {tx.amount}
                      </p>
                    </Card>
                  );
                })
              )}
            </div>
          </div>
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

      {tab === "settings" ? (
        <Card className="space-y-3">
          <Field
            label="Suggest per km"
            value={settings.perKm}
            onChange={(n) => setSettings({ perKm: n })}
          />
          <p className="text-12 text-muted !-mt-1">
            Owners see this as a suggestion only — they can set any seat price.
          </p>
          <Field
            label="Fee %"
            value={settings.feePercent}
            onChange={(n) => setSettings({ feePercent: n })}
          />
          <Field
            label="Suggest band floor (Rs)"
            value={settings.minRate}
            onChange={(n) => setSettings({ minRate: n })}
          />
          <Field
            label="Suggest band ceiling (Rs)"
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
