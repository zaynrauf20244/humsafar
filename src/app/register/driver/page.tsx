"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState, type ReactNode } from "react";
import { useSaath } from "@/lib/store";
import type { CircleCategory, Weekday } from "@/lib/types";

const DAYS: Weekday[] = ["M", "T", "W", "Th", "F"];
const DAY_LABEL: Record<Weekday, string> = {
  M: "M",
  T: "T",
  W: "W",
  Th: "T",
  F: "F",
};

const CATEGORIES: { id: CircleCategory; label: string }[] = [
  { id: "public", label: "Public" },
  { id: "office", label: "Office" },
  { id: "women", label: "Women" },
  { id: "university", label: "Uni" },
  { id: "society", label: "Society" },
];

export default function DriverRegisterPage() {
  const router = useRouter();
  const { setProfileAndMatch } = useSaath();
  const [step, setStep] = useState(0);

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [cnic, setCnic] = useState("");
  const [licenseNumber, setLicenseNumber] = useState("");

  const [vehicleMake, setVehicleMake] = useState("Toyota");
  const [vehicleModel, setVehicleModel] = useState("Corolla");
  const [vehicleColor, setVehicleColor] = useState("White");
  const [plateNumber, setPlateNumber] = useState("");
  const [seats, setSeats] = useState(3);

  const [home, setHome] = useState("Bahria Town");
  const [office, setOffice] = useState("Gulberg");
  const [arriveBy, setArriveBy] = useState("09:00");
  const [days, setDays] = useState<Weekday[]>(["M", "T", "W", "Th", "F"]);
  const [category, setCategory] = useState<CircleCategory>("public");

  function toggleDay(day: Weekday) {
    setDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day],
    );
  }

  function next() {
    setStep((s) => Math.min(2, s + 1));
  }

  function back() {
    setStep((s) => Math.max(0, s - 1));
  }

  function finish(e: FormEvent) {
    e.preventDefault();
    setProfileAndMatch({
      role: "driver",
      name: name.trim() || "Driver",
      phone: phone.trim(),
      home: home.trim(),
      office: office.trim(),
      arriveBy,
      days,
      category,
      driver: {
        phone: phone.trim(),
        cnic: cnic.trim(),
        licenseNumber: licenseNumber.trim(),
        vehicleMake: vehicleMake.trim(),
        vehicleModel: vehicleModel.trim(),
        vehicleColor: vehicleColor.trim(),
        plateNumber: plateNumber.trim(),
        seats,
      },
    });
    router.push("/match");
  }

  return (
    <main className="page page-narrow flex flex-1 flex-col md:py-10">
      <div className="mb-6 flex items-center justify-between">
        <Link href="/" className="text-sm font-semibold text-muted">
          ← Back
        </Link>
        <div className="flex items-center gap-1.5">
          {[0, 1, 2].map((i) => (
            <span key={i} className={`step-dot ${step === i ? "active" : ""}`} />
          ))}
        </div>
      </div>

      <p className="label-caps text-accent">Driver registration</p>
      <h1 className="mt-2 font-display text-[1.75rem] font-semibold text-ink">
        {step === 0 && "Identity verification"}
        {step === 1 && "Vehicle details"}
        {step === 2 && "Commute profile"}
      </h1>
      <p className="mt-1.5 text-sm text-muted">
        {step === 0 && "CNIC and driving licence for Circle trust & safety."}
        {step === 1 && "Offer seats only on trips you already make."}
        {step === 2 && "We match you with a recurring corridor Circle."}
      </p>

      <form
        onSubmit={step === 2 ? finish : (e) => { e.preventDefault(); next(); }}
        className="mt-6 flex flex-1 flex-col gap-4"
      >
        {step === 0 && (
          <>
            <Field label="Full name">
              <input
                className="input-field"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ali Khan"
                required
              />
            </Field>
            <Field label="Phone">
              <input
                className="input-field"
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="03XX XXXXXXX"
                required
              />
            </Field>
            <Field label="CNIC">
              <input
                className="input-field"
                value={cnic}
                onChange={(e) => setCnic(e.target.value)}
                placeholder="xxxxx-xxxxxxx-x"
                required
              />
            </Field>
            <Field label="Driving licence no.">
              <input
                className="input-field"
                value={licenseNumber}
                onChange={(e) => setLicenseNumber(e.target.value)}
                placeholder="Licence number"
                required
              />
            </Field>
          </>
        )}

        {step === 1 && (
          <>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Make">
                <input
                  className="input-field"
                  value={vehicleMake}
                  onChange={(e) => setVehicleMake(e.target.value)}
                  required
                />
              </Field>
              <Field label="Model">
                <input
                  className="input-field"
                  value={vehicleModel}
                  onChange={(e) => setVehicleModel(e.target.value)}
                  required
                />
              </Field>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Color">
                <input
                  className="input-field"
                  value={vehicleColor}
                  onChange={(e) => setVehicleColor(e.target.value)}
                  required
                />
              </Field>
              <Field label="Free seats">
                <input
                  className="input-field"
                  type="number"
                  min={1}
                  max={6}
                  value={seats}
                  onChange={(e) => setSeats(Number(e.target.value))}
                  required
                />
              </Field>
            </div>
            <Field label="Number plate">
              <input
                className="input-field"
                value={plateNumber}
                onChange={(e) => setPlateNumber(e.target.value)}
                placeholder="LES-1234"
                required
              />
            </Field>
            <div className="rounded-[10px] border border-line bg-bg px-4 py-3 text-sm text-muted">
              Document verification is simulated in this demo. Your profile will
              proceed to Circle matching.
            </div>
          </>
        )}

        {step === 2 && (
          <>
            <Field label="Home">
              <input
                className="input-field"
                value={home}
                onChange={(e) => setHome(e.target.value)}
                required
              />
            </Field>
            <Field label="Office / destination">
              <input
                className="input-field"
                value={office}
                onChange={(e) => setOffice(e.target.value)}
                required
              />
            </Field>
            <Field label="Arrive by">
              <input
                className="input-field"
                type="time"
                value={arriveBy}
                onChange={(e) => setArriveBy(e.target.value)}
                required
              />
            </Field>
            <div>
              <span className="mb-2 block text-sm font-semibold text-ink-soft">
                Days
              </span>
              <div className="flex gap-2">
                {DAYS.map((day) => (
                  <button
                    key={day}
                    type="button"
                    className={`day-chip ${days.includes(day) ? "active" : ""}`}
                    onClick={() => toggleDay(day)}
                  >
                    {DAY_LABEL[day]}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <span className="mb-2 block text-sm font-semibold text-ink-soft">
                Circle type
              </span>
              <div className="flex flex-wrap gap-2">
                {CATEGORIES.map((c) => (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => setCategory(c.id)}
                    className={`rounded-xl px-3 py-2 text-sm font-semibold ${
                      category === c.id
                        ? "bg-ink text-white"
                        : "bg-surface text-muted ring-1 ring-line"
                    }`}
                  >
                    {c.label}
                  </button>
                ))}
              </div>
            </div>
          </>
        )}

        <div className="mt-auto flex gap-2 pt-4">
          {step > 0 && (
            <button type="button" className="btn-secondary flex-1" onClick={back}>
              Back
            </button>
          )}
          <button type="submit" className="btn-primary flex-[2]">
            {step === 2 ? "Find My Circle" : "Continue"}
          </button>
        </div>
      </form>
    </main>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-semibold text-ink-soft">
        {label}
      </span>
      {children}
    </label>
  );
}
