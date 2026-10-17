"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { AuthPictureSlider } from "@/components/AuthPictureSlider";
import { Button, Card, Chip, Stepper, useToast } from "@/components/ui";
import type { CommuteType } from "@/lib/commute-types";
import { formatCnic } from "@/lib/seed";
import { personaLabel } from "@/lib/roles";
import { homeModeForUser, useHumSafar } from "@/lib/store";
import type { Gender, UserRole, VehicleKind } from "@/lib/types";

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

export default function JoinPage() {
  const {
    pendingPhone,
    pendingCnic,
    pendingRole,
    pendingVehicleKind,
    setPendingRole,
    setPendingVehicleKind,
    completeProfile,
    saveVehicle,
    me,
    hydrated,
  } = useHumSafar();
  const router = useRouter();
  const { show } = useToast();
  const roleFromSignup =
    pendingRole === "driver" ||
    pendingRole === "passenger" ||
    pendingRole === "both";
  const [step, setStep] = useState(roleFromSignup ? 2 : 1);
  const [role, setRole] = useState<UserRole>(
    roleFromSignup ? pendingRole! : "passenger"
  );
  const [vehicleKind, setVehicleKind] = useState<VehicleKind>(
    pendingVehicleKind === "bike" ? "bike" : "car"
  );
  const [name, setName] = useState("");
  const [gender, setGender] = useState<Gender>("male");
  const [age, setAge] = useState(22);
  const [emergency, setEmergency] = useState("");
  const [selfieOk, setSelfieOk] = useState(false);
  const [error, setError] = useState("");
  const [commuteType, setCommuteType] = useState<CommuteType>("office");
  const cnic = pendingCnic || "";

  const [make, setMake] = useState(
    pendingVehicleKind === "bike" ? "Honda" : "Honda"
  );
  const [model, setModel] = useState(
    pendingVehicleKind === "bike" ? "CG 125" : "City"
  );
  const [year, setYear] = useState(2020);
  const [color, setColor] = useState(
    pendingVehicleKind === "bike" ? "Black" : "White"
  );
  const [plate, setPlate] = useState("");
  const [seats, setSeats] = useState(pendingVehicleKind === "bike" ? 1 : 3);
  const [licenceExpiry, setLicenceExpiry] = useState("2027-12-01");

  const onType = useCallback((id: CommuteType) => setCommuteType(id), []);

  useEffect(() => {
    if (!hydrated) return;
    const t = new URLSearchParams(window.location.search).get(
      "type"
    ) as CommuteType | null;
    if (t && TYPES.includes(t)) setCommuteType(t);
    if (me)
      router.replace(`/?type=${commuteType}&mode=${homeModeForUser(me)}`);
    else if (!pendingPhone || !pendingCnic) router.replace("/login");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hydrated, me, pendingPhone, pendingCnic, router]);

  useEffect(() => {
    if (!roleFromSignup || !pendingRole) return;
    setRole(pendingRole);
    setStep(2);
  }, [roleFromSignup, pendingRole]);

  useEffect(() => {
    if (pendingVehicleKind !== "bike" && pendingVehicleKind !== "car") return;
    setVehicleKind(pendingVehicleKind);
    if (pendingVehicleKind === "bike") {
      setModel("CG 125");
      setColor("Black");
      setSeats(1);
    }
  }, [pendingVehicleKind]);

  function nextProfile() {
    setError("");
    if (!cnic) {
      setError("CNIC missing — go back to Sign up");
      return;
    }
    if (!name.trim()) {
      setError("What’s your name?");
      return;
    }
    if (!selfieOk) {
      setError("We need a quick live selfie");
      return;
    }
    if (age < 18) {
      setError("You need to be 18 or older");
      return;
    }
    setPendingRole(role);
    const res = completeProfile({
      name,
      gender,
      age,
      cnic,
      role,
      emergencyPhone: emergency || undefined,
      photo: selfieOk ? "selfie-live" : undefined,
    });
    if (!res.ok) {
      setError(res.error || "Something went wrong");
      return;
    }
    show("Welcome to HumSafar");
    if (role === "driver" || role === "both") setStep(3);
    else
      router.replace(
        `/?type=${commuteType}&mode=${homeModeForUser({ role, activeRole: "passenger" })}`
      );
  }

  function finishVehicle() {
    saveVehicle(
      {
        kind: vehicleKind,
        make,
        model,
        year,
        color,
        plate,
        seats: vehicleKind === "bike" ? 1 : seats,
        status: "pending",
      },
      "licence-live.jpg",
      licenceExpiry
    );
    router.replace(
      `/?type=${commuteType}&mode=${homeModeForUser({
        role,
        activeRole: role === "passenger" ? "passenger" : "driver",
      })}`
    );
  }

  const needsVehicle = role === "driver" || role === "both";
  const totalSteps = roleFromSignup
    ? needsVehicle
      ? 2
      : 1
    : needsVehicle
      ? 3
      : 2;
  const displayStep = roleFromSignup ? step - 1 : step;

  return (
    <main className="uber-landing !min-h-0">
      <div className="uber-wrap py-6 md:py-10">
        <div className="auth-split">
          <div className="hidden md:block">
            <AuthPictureSlider value={commuteType} onChange={onType} />
          </div>

          <div className="mx-auto w-full max-w-md space-y-4">
            <div className="md:hidden max-w-[280px]">
              <AuthPictureSlider value={commuteType} onChange={onType} />
            </div>

            <Stepper step={displayStep} total={totalSteps} />

            {step === 1 && !roleFromSignup ? (
              <div className="space-y-3 animate-rise">
                <h1 className="uber-h2 !text-[28px]">How will you use HumSafar?</h1>
                <p className="text-14 text-[var(--uber-mute)]">
                  You can change this later.
                </p>
                {(
                  [
                    [
                      "passenger",
                      null,
                      "I’m a passenger",
                      "Find a car or bike seat on your road",
                    ],
                    [
                      "driver",
                      "car",
                      "I’m a car owner",
                      "Offer empty car seats on your commute",
                    ],
                    [
                      "driver",
                      "bike",
                      "I’m a bike owner",
                      "Offer a bike ride on your commute",
                    ],
                    [
                      "both",
                      "car",
                      "I do both",
                      "Offer some days, find a seat on others",
                    ],
                  ] as const
                ).map(([id, kind, label, hint]) => (
                  <button
                    key={`${id}-${kind || "none"}`}
                    type="button"
                    onClick={() => {
                      setRole(id);
                      setPendingRole(id);
                      const vk = kind === "bike" ? "bike" : kind === "car" ? "car" : null;
                      setPendingVehicleKind(vk);
                      if (vk) setVehicleKind(vk);
                      setStep(2);
                    }}
                    className="w-full rounded-2xl border border-[var(--uber-line)] bg-[var(--uber-soft)] p-5 text-start transition hover:border-black"
                  >
                    <p className="text-18 font-bold">{label}</p>
                    <p className="mt-1 text-14 text-[var(--uber-mute)]">{hint}</p>
                  </button>
                ))}
              </div>
            ) : null}

            {step === 2 ? (
              <Card className="space-y-4 animate-rise !shadow-none">
                <div>
                  <h1 className="uber-h2 !text-[28px]">A bit about you</h1>
                  <p className="mt-1 text-14 text-[var(--uber-mute)]">
                    Keeps everyone safer on the road.
                    {role !== "admin" ? (
                      <>
                        {" "}
                        Signing up as{" "}
                        <span className="font-semibold text-black">
                          {personaLabel(
                            role,
                            role === "passenger" ? null : vehicleKind
                          )}
                        </span>
                        .
                      </>
                    ) : null}
                  </p>
                </div>
                <label className="block">
                  <span className="field-label">Full name</span>
                  <input
                    className="uber-input"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="As on your CNIC"
                  />
                </label>
                <div>
                  <span className="field-label">Gender</span>
                  <div className="flex flex-wrap gap-2">
                    {(
                      [
                        ["male", "Male"],
                        ["female", "Female"],
                        ["other", "Other"],
                      ] as const
                    ).map(([g, label]) => (
                      <Chip
                        key={g}
                        active={gender === g}
                        onClick={() => setGender(g)}
                      >
                        {label}
                      </Chip>
                    ))}
                  </div>
                </div>
                <label className="block">
                  <span className="field-label">Age</span>
                  <input
                    className="uber-input"
                    type="number"
                    min={18}
                    value={age}
                    onChange={(e) => setAge(Number(e.target.value))}
                  />
                </label>
                <label className="block">
                  <span className="field-label">CNIC (verified at sign up)</span>
                  <input
                    className="uber-input opacity-80"
                    value={formatCnic(cnic)}
                    readOnly
                  />
                  <p className="mt-1 text-12 text-[var(--uber-mute)]">
                    Locked to this account for security.
                  </p>
                </label>
                <label className="block">
                  <span className="field-label">Emergency contact (optional)</span>
                  <input
                    className="uber-input"
                    value={emergency}
                    onChange={(e) => setEmergency(e.target.value)}
                    placeholder="03XXXXXXXXX"
                  />
                </label>
                <div className="rounded-2xl bg-[var(--uber-soft)] p-4">
                  <p className="font-bold">Live selfie</p>
                  <p className="mt-1 text-14 text-[var(--uber-mute)]">
                    Gallery photos aren’t allowed — just a quick camera check.
                  </p>
                  <Button
                    variant={selfieOk ? "primary" : "secondary"}
                    className="mt-3 w-full !rounded-full"
                    onClick={() => setSelfieOk(true)}
                  >
                    {selfieOk ? "Selfie done" : "Take selfie (demo)"}
                  </Button>
                </div>
                {error ? (
                  <p className="text-14 font-semibold text-red">{error}</p>
                ) : null}
                <button type="button" className="uber-cta" onClick={nextProfile}>
                  Continue
                </button>
                <Button
                  variant="ghost"
                  className="w-full"
                  onClick={() =>
                    roleFromSignup
                      ? router.push("/login")
                      : setStep(1)
                  }
                >
                  {roleFromSignup ? "Change role on sign up" : "Back"}
                </Button>
              </Card>
            ) : null}

            {step === 3 ? (
              <Card className="space-y-3 animate-rise !shadow-none">
                <div>
                  <h1 className="uber-h2 !text-[28px]">
                    {vehicleKind === "bike" ? "Your bike" : "Your car"}
                  </h1>
                  <p className="mt-1 text-14 text-[var(--uber-mute)]">
                    Admin will approve your{" "}
                    {vehicleKind === "bike" ? "bike" : "car"} before you can
                    offer seats.
                  </p>
                </div>
                {!pendingVehicleKind ? (
                  <div className="flex gap-2">
                    {(
                      [
                        ["car", "Car"],
                        ["bike", "Bike"],
                      ] as const
                    ).map(([k, label]) => (
                      <Chip
                        key={k}
                        active={vehicleKind === k}
                        onClick={() => {
                          setVehicleKind(k);
                          setPendingVehicleKind(k);
                          setSeats(k === "bike" ? 1 : 3);
                        }}
                      >
                        {label}
                      </Chip>
                    ))}
                  </div>
                ) : null}
                <div className="grid grid-cols-2 gap-3">
                  <Field label="Make" value={make} set={setMake} />
                  <Field label="Model" value={model} set={setModel} />
                  <Field
                    label="Year"
                    value={String(year)}
                    set={(v) => setYear(Number(v))}
                  />
                  <Field label="Color" value={color} set={setColor} />
                </div>
                <Field label="Number plate" value={plate} set={setPlate} />
                {vehicleKind === "bike" ? (
                  <p className="text-14 text-muted">Bike rides · 1 passenger seat</p>
                ) : (
                  <label className="block">
                    <span className="field-label">Empty seats (1–4)</span>
                    <input
                      className="uber-input"
                      type="number"
                      min={1}
                      max={4}
                      value={seats}
                      onChange={(e) => setSeats(Number(e.target.value))}
                    />
                  </label>
                )}
                <label className="block">
                  <span className="field-label">Licence expiry</span>
                  <input
                    className="uber-input"
                    type="date"
                    value={licenceExpiry}
                    onChange={(e) => setLicenceExpiry(e.target.value)}
                  />
                </label>
                <button type="button" className="uber-cta" onClick={finishVehicle}>
                  Finish
                </button>
              </Card>
            ) : null}
          </div>
        </div>
      </div>
    </main>
  );
}

function Field({
  label,
  value,
  set,
}: {
  label: string;
  value: string;
  set: (v: string) => void;
}) {
  return (
    <label className="block">
      <span className="field-label">{label}</span>
      <input
        className="uber-input"
        value={value}
        onChange={(e) => set(e.target.value)}
      />
    </label>
  );
}
