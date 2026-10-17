"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { AuthPictureSlider } from "@/components/AuthPictureSlider";
import { LiveModeBadge } from "@/components/LiveModeBadge";
import { COMMUTE_TYPES, type CommuteType } from "@/lib/commute-types";
import { COMMUTE_IMAGES } from "@/lib/commute-media";
import {
  DEMO_OTP,
  formatCnic,
  formatPkPhone,
  normalizeCnic,
} from "@/lib/seed";
import { homeModeForUser, useHumSafar } from "@/lib/store";
import type { UserRole, VehicleKind } from "@/lib/types";

type SignupPersona = {
  id: string;
  role: Exclude<UserRole, "admin">;
  kind: VehicleKind | null;
  label: string;
  hint: string;
};

const ROLE_OPTIONS: SignupPersona[] = [
  {
    id: "passenger",
    role: "passenger",
    kind: null,
    label: "Passenger",
    hint: "Find a seat",
  },
  {
    id: "car_owner",
    role: "driver",
    kind: "car",
    label: "Car owner",
    hint: "Offer car seats",
  },
  {
    id: "bike_owner",
    role: "driver",
    kind: "bike",
    label: "Bike owner",
    hint: "Offer bike rides",
  },
  {
    id: "both",
    role: "both",
    kind: "car",
    label: "Both",
    hint: "Some days each",
  },
];

const DEMOS = [
  {
    phone: "03001234567",
    cnic: "3520212345671",
    label: "Car owner",
  },
  {
    phone: "03001112233",
    cnic: "3520211223345",
    label: "Bike owner",
  },
  {
    phone: "03009876543",
    cnic: "3520299887763",
    label: "Passenger",
  },
];

const TYPES: CommuteType[] = [
  "office",
  "university",
  "women",
  "society",
  "school",
  "intercity",
  "airport",
  "event",
];

const STEPS = [
  {
    title: "Phone + CNIC",
    body: "Sign in or sign up with your mobile and CNIC — so every seat is verified.",
  },
  {
    title: "Pick your commute",
    body: "Office, uni, women-only, society, school, inter-city, airport, or events.",
  },
  {
    title: "Passenger finds · Owners offer",
    body: "Car or bike — match with someone already going your way.",
  },
  {
    title: "Ride together",
    body: "Meet at the stop, share the cost, and go. Rate your HumSafar after.",
  },
];

type AuthMode = "signin" | "signup";

function otpErrorMessage(code?: string) {
  switch (code) {
    case "otpLocked":
      return "Too many tries. Wait 15 minutes.";
    case "invalidPhone":
      return "Enter a valid Pakistani number (03XXXXXXXXX)";
    case "invalidCnic":
      return "Enter a valid 13-digit CNIC";
    case "phoneExists":
      return "This phone is already registered. Use Sign in.";
    case "cnicExists":
      return "This CNIC is already registered. Use Sign in.";
    case "noAccount":
      return "No account found. Use Sign up.";
    case "cnicMismatch":
      return "CNIC doesn’t match this phone number.";
    case "banned":
      return "This account is suspended.";
    case "otpExpired":
      return "Code expired. Send again.";
    default:
      return "That code didn’t match.";
  }
}

export default function LoginPage() {
  const {
    requestOtp,
    verifyOtp,
    setPendingRole,
    setPendingVehicleKind,
    pendingPhone,
    otp,
    me,
    hydrated,
    introDone,
    setIntroDone,
    locale,
    setLocale,
  } = useHumSafar();
  const router = useRouter();
  const [mode, setMode] = useState<AuthMode>("signin");
  const [phone, setPhone] = useState("");
  const [cnic, setCnic] = useState("");
  const [personaId, setPersonaId] = useState("passenger");
  const persona =
    ROLE_OPTIONS.find((p) => p.id === personaId) || ROLE_OPTIONS[0];
  const [code, setCode] = useState("");
  const [terms, setTerms] = useState(true);
  const [error, setError] = useState("");
  const [step, setStep] = useState<"details" | "otp">("details");
  const [secLeft, setSecLeft] = useState(0);
  const [commuteType, setCommuteType] = useState<CommuteType>("office");

  const onType = useCallback((id: CommuteType) => setCommuteType(id), []);

  useEffect(() => {
    if (!hydrated) return;
    const t = new URLSearchParams(window.location.search).get(
      "type"
    ) as CommuteType | null;
    if (t && TYPES.includes(t)) setCommuteType(t);
    if (!introDone) setIntroDone();
  }, [hydrated, introDone, setIntroDone]);

  useEffect(() => {
    if (!hydrated || !me) return;
    router.replace(
      me.role === "admin"
        ? "/admin"
        : `/?type=${commuteType}&mode=${homeModeForUser(me)}`
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hydrated, me, router]);

  useEffect(() => {
    if (!otp.sentAt) return;
    const tick = () => {
      const left = Math.max(
        0,
        60 - Math.floor((Date.now() - (otp.sentAt || 0)) / 1000)
      );
      setSecLeft(left);
    };
    tick();
    const id = window.setInterval(tick, 1000);
    return () => window.clearInterval(id);
  }, [otp.sentAt]);

  function send(nextPhone = phone, nextCnic = cnic, nextMode = mode) {
    setError("");
    if (!terms) {
      setError("Please accept Terms & Privacy");
      return;
    }
    if (nextMode === "signup" && !persona.role) {
      setError("Choose Passenger, Car owner, or Bike owner");
      return;
    }
    const res = requestOtp(nextPhone, {
      intent: nextMode,
      cnic: nextCnic,
    });
    if (!res.ok) {
      setError(otpErrorMessage(res.error));
      return;
    }
    if (nextMode === "signup") {
      setPendingRole(persona.role);
      setPendingVehicleKind(persona.kind);
    } else {
      setPendingRole(null);
      setPendingVehicleKind(null);
    }
    setPhone(nextPhone);
    setCnic(normalizeCnic(nextCnic));
    setMode(nextMode);
    setStep("otp");
    setCode("");
  }

  function verify() {
    setError("");
    const res = verifyOtp(code.trim());
    if (!res.ok) {
      setError(otpErrorMessage(res.error));
      return;
    }
    if (res.needsProfile) {
      router.push(`/join?type=${commuteType}`);
      return;
    }
    // No mode= — home picks Offer for car owners, Find for riders
    router.push(`/?type=${commuteType}`);
  }

  return (
    <main className="uber-landing">
      <header className="uber-nav">
        <div className="uber-wrap uber-nav-inner">
          <Link href="/login" className="uber-logo">
            <span className="uber-logo-mark">H</span>
            HumSafar
          </Link>
          <div className="uber-nav-actions">
            <LiveModeBadge />
            <button
              type="button"
              className="uber-pill-ghost"
              onClick={() => setLocale(locale === "en" ? "ur" : "en")}
            >
              {locale === "en" ? "اردو" : "EN"}
            </button>
            <a href="#start" className="uber-pill-dark">
              Sign in
            </a>
          </div>
        </div>
      </header>

      <section className="uber-hero uber-wrap" id="start">
        <div className="uber-hero-copy">
          <h1 className="uber-display">
            Find a seat.
            <br />
            Hop in, and go.
          </h1>
          <p className="uber-lead">
            Verified with phone + CNIC — people already going your way, not a
            taxi.
          </p>

          <div className="uber-form-card">
            <div className="uber-form-tabs" role="tablist">
              <button
                type="button"
                className={`uber-form-tab ${mode === "signin" ? "active" : ""}`}
                role="tab"
                aria-selected={mode === "signin"}
                onClick={() => {
                  setMode("signin");
                  setError("");
                  setStep("details");
                }}
              >
                Sign in
              </button>
              <button
                type="button"
                className={`uber-form-tab ${mode === "signup" ? "active" : ""}`}
                role="tab"
                aria-selected={mode === "signup"}
                onClick={() => {
                  setMode("signup");
                  setError("");
                  setStep("details");
                }}
              >
                Sign up
              </button>
            </div>

            {step === "details" ? (
              <div className="space-y-3">
                <p className="text-12 text-[var(--uber-mute)]">
                  {mode === "signin"
                    ? "Phone and CNIC must match your HumSafar account."
                    : "New accounts need a unique phone and CNIC for verification."}
                </p>

                <label className="block">
                  <span className="field-label !mb-1.5">Mobile number</span>
                  <div className="uber-phone-row">
                    <span className="uber-phone-code">+92</span>
                    <input
                      className="uber-input"
                      inputMode="numeric"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="3XX XXXXXXX"
                      autoComplete="tel"
                    />
                  </div>
                </label>

                <label className="block">
                  <span className="field-label !mb-1.5">CNIC (13 digits)</span>
                  <input
                    className="uber-input tracking-wide"
                    inputMode="numeric"
                    value={formatCnic(cnic)}
                    onChange={(e) => setCnic(normalizeCnic(e.target.value))}
                    placeholder="xxxxx-xxxxxxx-x"
                    autoComplete="off"
                  />
                </label>

                {mode === "signup" ? (
                  <div>
                    <span className="field-label !mb-1.5">
                      How will you use HumSafar?
                    </span>
                    <div className="grid grid-cols-2 gap-2">
                      {ROLE_OPTIONS.map((opt) => (
                        <button
                          key={opt.id}
                          type="button"
                          className={`rounded-xl border px-2 py-3 text-center transition ${
                            personaId === opt.id
                              ? "border-black bg-black text-white"
                              : "border-[var(--uber-line)] bg-[var(--uber-soft)] text-black"
                          }`}
                          onClick={() => setPersonaId(opt.id)}
                        >
                          <p className="text-13 font-bold leading-tight">
                            {opt.label}
                          </p>
                          <p
                            className={`mt-0.5 text-[11px] leading-tight ${
                              personaId === opt.id
                                ? "text-white/70"
                                : "text-[var(--uber-mute)]"
                            }`}
                          >
                            {opt.hint}
                          </p>
                        </button>
                      ))}
                    </div>
                  </div>
                ) : null}

                <label className="flex items-start gap-2 text-14 text-[var(--uber-mute)]">
                  <input
                    type="checkbox"
                    className="mt-1 size-4 accent-black"
                    checked={terms}
                    onChange={(e) => setTerms(e.target.checked)}
                  />
                  <span>
                    I agree to{" "}
                    <Link href="/terms" className="font-semibold underline">
                      Terms
                    </Link>{" "}
                    &{" "}
                    <Link href="/privacy" className="font-semibold underline">
                      Privacy
                    </Link>
                  </span>
                </label>

                {error ? (
                  <p className="text-14 font-semibold text-red">{error}</p>
                ) : null}

                <button
                  type="button"
                  className="uber-cta"
                  onClick={() => send()}
                >
                  {mode === "signin" ? "Send code" : "Create account"}
                </button>

                {mode === "signin" ? (
                  <div className="space-y-2 pt-1">
                    <div className="flex flex-wrap gap-2">
                      {DEMOS.map((d) => (
                        <button
                          key={d.phone}
                          type="button"
                          className="uber-pill-ghost !min-h-10"
                          onClick={() => {
                            setTerms(true);
                            setPhone(d.phone);
                            setCnic(d.cnic);
                            send(d.phone, d.cnic, "signin");
                            setCode(DEMO_OTP);
                          }}
                        >
                          Demo: {d.label}
                        </button>
                      ))}
                    </div>
                    <p className="text-12 text-[var(--uber-mute)]">
                      Demo code {DEMO_OTP}
                    </p>
                  </div>
                ) : (
                  <p className="text-12 text-[var(--uber-mute)]">
                    After OTP you’ll finish name and selfie. CNIC stays locked
                    to this account.
                  </p>
                )}
              </div>
            ) : (
              <div className="space-y-3">
                <p className="text-14 text-[var(--uber-mute)]">
                  Code sent to{" "}
                  <span className="font-bold text-black">
                    {pendingPhone ? formatPkPhone(pendingPhone) : ""}
                  </span>
                </p>
                <p className="text-12 text-[var(--uber-mute)]">
                  CNIC {formatCnic(cnic)} ·{" "}
                  {mode === "signup"
                    ? `Sign up · ${persona.label}`
                    : "Sign in"}
                </p>
                <input
                  className="uber-input text-center text-26 tracking-[0.35em]"
                  inputMode="numeric"
                  maxLength={6}
                  value={code}
                  onChange={(e) =>
                    setCode(e.target.value.replace(/\D/g, "").slice(0, 6))
                  }
                  autoFocus
                />
                {error ? (
                  <p className="text-14 font-semibold text-red">{error}</p>
                ) : null}
                <button
                  type="button"
                  className="uber-cta"
                  onClick={verify}
                  disabled={code.length < 6}
                >
                  {mode === "signup" ? "Continue to profile" : "Sign in"}
                </button>
                <div className="flex justify-between text-14">
                  <button
                    type="button"
                    className="min-h-11 font-semibold disabled:opacity-40"
                    disabled={secLeft > 0}
                    onClick={() => send()}
                  >
                    {secLeft > 0 ? `Resend ${secLeft}s` : "Resend"}
                  </button>
                  <button
                    type="button"
                    className="min-h-11 font-semibold text-[var(--uber-mute)]"
                    onClick={() => setStep("details")}
                  >
                    Edit details
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="uber-hero-media">
          <AuthPictureSlider value={commuteType} onChange={onType} />
        </div>
      </section>

      <section className="uber-section uber-wrap">
        <h2 className="uber-h2">How to find a HumSafar</h2>
        <ol className="uber-steps">
          {STEPS.map((s, i) => (
            <li key={s.title} className="uber-step">
              <span className="uber-step-num">{i + 1}</span>
              <div>
                <h3>{s.title}</h3>
                <p>{s.body}</p>
              </div>
            </li>
          ))}
        </ol>
      </section>

      <section className="uber-section uber-wrap">
        <h2 className="uber-h2">Ways to commute with HumSafar</h2>
        <p className="uber-section-lead">
          Eight everyday roads — pick one that matches your trip.
        </p>
        <div className="uber-ways">
          {COMMUTE_TYPES.map((c) => {
            const img = COMMUTE_IMAGES[c.id];
            return (
              <button
                key={c.id}
                type="button"
                className={`uber-way ${commuteType === c.id ? "active" : ""}`}
                onClick={() => {
                  setCommuteType(c.id);
                  window.scrollTo({ top: 0, behavior: "smooth" });
                }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={img.src} alt="" className="uber-way-img" />
                <div className="uber-way-body">
                  <h3>{c.short}</h3>
                  <p>{c.heroLine}</p>
                </div>
              </button>
            );
          })}
        </div>
      </section>

      <section className="uber-section uber-wrap uber-offer" id="offer-block">
        <div className="uber-offer-media">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={COMMUTE_IMAGES.office.src}
            alt="Offer empty seats on your commute"
          />
        </div>
        <div className="uber-offer-copy">
          <h2 className="uber-h2">Car or bike owner? Share empty seats.</h2>
          <p className="uber-section-lead">
            Already going to work or campus? Offer seats on your car or bike,
            set your own price, and keep company on the road.
          </p>
          <a href="#start" className="uber-pill-dark inline-flex">
            Get started
          </a>
        </div>
      </section>

      <footer className="uber-footer">
        <div className="uber-wrap uber-footer-inner">
          <p className="uber-logo">
            <span className="uber-logo-mark">H</span>
            HumSafar
          </p>
          <p className="text-14 text-white/60">
            People already going your way.
          </p>
        </div>
      </footer>
    </main>
  );
}
