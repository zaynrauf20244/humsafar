"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { Button } from "@/components/ui";
import { useI18n } from "@/lib/i18n";
import { useHumSafar } from "@/lib/store";

export default function DriverSetupPage() {
  const router = useRouter();
  const { me, saveVehicle } = useHumSafar();
  const { t } = useI18n();
  const [make, setMake] = useState(me?.vehicle?.make ?? "Toyota");
  const [model, setModel] = useState(me?.vehicle?.model ?? "Corolla");
  const [year, setYear] = useState(me?.vehicle?.year ?? 2020);
  const [color, setColor] = useState(me?.vehicle?.color ?? "White");
  const [plate, setPlate] = useState(me?.vehicle?.plate ?? "");
  const [seats, setSeats] = useState(me?.vehicle?.seats ?? 3);
  const [licence, setLicence] = useState(me?.licence?.fileName ?? "");
  const [expiry, setExpiry] = useState(me?.licence?.expiry ?? "2027-12-01");

  if (!me) {
    return (
      <main className="page">
        <p className="text-muted">Login required</p>
      </main>
    );
  }

  function submit(e: FormEvent) {
    e.preventDefault();
    saveVehicle(
      { make, model, year, color, plate, seats },
      licence || "licence-upload.jpg",
      expiry
    );
    router.push("/");
  }

  return (
    <main className="page max-w-lg space-y-4">
      <h1 className="font-display text-26 font-bold">
        {t("vehicle")} & {t("licence")}
      </h1>
      <form onSubmit={submit} className="card space-y-3 p-4">
        <div className="grid grid-cols-2 gap-3">
          <input
            className="input"
            placeholder="Make"
            value={make}
            onChange={(e) => setMake(e.target.value)}
            required
          />
          <input
            className="input"
            placeholder="Model"
            value={model}
            onChange={(e) => setModel(e.target.value)}
            required
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <input
            className="input"
            type="number"
            value={year}
            onChange={(e) => setYear(Number(e.target.value))}
            required
          />
          <input
            className="input"
            placeholder="Color"
            value={color}
            onChange={(e) => setColor(e.target.value)}
            required
          />
        </div>
        <input
          className="input"
          placeholder={t("plate")}
          value={plate}
          onChange={(e) => setPlate(e.target.value)}
          required
        />
        <input
          className="input"
          type="number"
          min={1}
          max={4}
          value={seats}
          onChange={(e) => setSeats(Number(e.target.value))}
          required
        />
        <input
          className="input"
          type="date"
          value={expiry}
          onChange={(e) => setExpiry(e.target.value)}
          required
        />
        <input
          type="file"
          accept="image/*"
          onChange={(e) =>
            setLicence(e.target.files?.[0]?.name ?? "licence.jpg")
          }
        />
        <Button type="submit" className="w-full">
          {t("continue")}
        </Button>
      </form>
    </main>
  );
}
