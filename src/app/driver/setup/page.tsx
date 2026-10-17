"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useMemo, useState } from "react";
import { Badge, Button, useToast } from "@/components/ui";
import { vehicleKindOf, vehicleVerifyStatus } from "@/lib/roles";
import { useHumSafar } from "@/lib/store";
import type { VehicleKind } from "@/lib/types";

export default function DriverSetupPage() {
  const router = useRouter();
  const { me, saveVehicle, pendingVehicleKind } = useHumSafar();
  const { show } = useToast();

  const kind: VehicleKind = useMemo(() => {
    if (me?.vehicle?.kind === "bike" || me?.vehicle?.kind === "car") {
      return me.vehicle.kind;
    }
    if (me?.preferredVehicleKind === "bike" || pendingVehicleKind === "bike") {
      return "bike";
    }
    if (me?.preferredVehicleKind === "car" || pendingVehicleKind === "car") {
      return "car";
    }
    return vehicleKindOf(me);
  }, [me, pendingVehicleKind]);

  const [make, setMake] = useState(
    me?.vehicle?.make ?? (kind === "bike" ? "Honda" : "Toyota")
  );
  const [model, setModel] = useState(
    me?.vehicle?.model ?? (kind === "bike" ? "CG 125" : "Corolla")
  );
  const [year, setYear] = useState(me?.vehicle?.year ?? 2020);
  const [color, setColor] = useState(me?.vehicle?.color ?? "White");
  const [plate, setPlate] = useState(me?.vehicle?.plate ?? "");
  const [seats, setSeats] = useState(
    kind === "bike" ? 1 : me?.vehicle?.seats ?? 3
  );
  const [licence, setLicence] = useState(me?.licence?.fileName ?? "");
  const [expiry, setExpiry] = useState(me?.licence?.expiry ?? "2027-12-01");

  if (!me) {
    return (
      <main className="page">
        <p className="text-muted">Login required</p>
      </main>
    );
  }

  if (me.role === "passenger") {
    return (
      <main className="page max-w-lg space-y-3">
        <h1 className="font-display text-26 font-bold">Owners only</h1>
        <p className="text-14 text-muted">
          Sign up as Car owner or Bike owner to register a vehicle.
        </p>
        <Button className="w-full" onClick={() => router.push("/")}>
          Back home
        </Button>
      </main>
    );
  }

  const status = vehicleVerifyStatus(me);
  const label = kind === "bike" ? "bike" : "car";

  function submit(e: FormEvent) {
    e.preventDefault();
    if (!plate.trim()) {
      show("Plate number required");
      return;
    }
    saveVehicle(
      {
        kind,
        make: make.trim(),
        model: model.trim(),
        year,
        color: color.trim(),
        plate: plate.trim().toUpperCase(),
        seats: kind === "bike" ? 1 : seats,
        status: "pending",
      },
      licence || "licence-upload.jpg",
      expiry
    );
    show("Submitted — waiting for admin approval");
    router.push("/?mode=offer");
  }

  return (
    <main className="page max-w-lg space-y-4">
      <div>
        <p className="text-12 font-bold uppercase tracking-wide text-sun">
          {kind === "bike" ? "Bike owner" : "Car owner"}
        </p>
        <h1 className="font-display text-26 font-bold">
          Register your {label}
        </h1>
        <p className="mt-1 text-14 text-muted">
          Admin reviews plate, vehicle and licence before you can offer seats.
        </p>
      </div>

      {status === "pending" ? (
        <Badge tone="marigold">Currently pending admin approval</Badge>
      ) : null}
      {status === "rejected" ? (
        <div className="rounded-xl border border-red/30 bg-red/5 px-3 py-2 text-14 text-red">
          {me.vehicle?.rejectReason || "Rejected — update and resubmit"}
        </div>
      ) : null}
      {status === "approved" ? (
        <Badge tone="teal">Approved — you can edit and resubmit</Badge>
      ) : null}

      <form onSubmit={submit} className="card space-y-3 p-4">
        <p className="text-14 font-semibold">
          Vehicle type:{" "}
          <span className="text-teal">
            {kind === "bike" ? "Bike" : "Car"}
          </span>
        </p>
        <div className="grid grid-cols-2 gap-3">
          <label className="block">
            <span className="field-label">Make</span>
            <input
              className="input"
              placeholder="Make"
              value={make}
              onChange={(e) => setMake(e.target.value)}
              required
            />
          </label>
          <label className="block">
            <span className="field-label">Model</span>
            <input
              className="input"
              placeholder="Model"
              value={model}
              onChange={(e) => setModel(e.target.value)}
              required
            />
          </label>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <label className="block">
            <span className="field-label">Year</span>
            <input
              className="input"
              type="number"
              value={year}
              onChange={(e) => setYear(Number(e.target.value))}
              required
            />
          </label>
          <label className="block">
            <span className="field-label">Color</span>
            <input
              className="input"
              placeholder="Color"
              value={color}
              onChange={(e) => setColor(e.target.value)}
              required
            />
          </label>
        </div>
        <label className="block">
          <span className="field-label">Plate number</span>
          <input
            className="input"
            placeholder="e.g. LES-2190"
            value={plate}
            onChange={(e) => setPlate(e.target.value)}
            required
          />
        </label>
        {kind === "car" ? (
          <label className="block">
            <span className="field-label">Seats you can offer</span>
            <input
              className="input"
              type="number"
              min={1}
              max={4}
              value={seats}
              onChange={(e) => setSeats(Number(e.target.value))}
              required
            />
          </label>
        ) : (
          <p className="text-14 text-muted">Bike passenger seat: 1</p>
        )}
        <label className="block">
          <span className="field-label">Licence expiry</span>
          <input
            className="input"
            type="date"
            value={expiry}
            onChange={(e) => setExpiry(e.target.value)}
            required
          />
        </label>
        <label className="block">
          <span className="field-label">Licence photo</span>
          <input
            type="file"
            accept="image/*"
            className="mt-1 block w-full text-14"
            onChange={(e) =>
              setLicence(e.target.files?.[0]?.name ?? "licence.jpg")
            }
          />
        </label>
        <Button type="submit" className="w-full">
          {status === "rejected" ? "Resubmit for approval" : "Submit for approval"}
        </Button>
      </form>
    </main>
  );
}
