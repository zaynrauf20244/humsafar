"use client";

import {
  Building2,
  GraduationCap,
  Venus,
  Home,
  School,
  Bus,
  Plane,
  Ticket,
} from "lucide-react";
import { COMMUTE_TYPES, type CommuteType } from "@/lib/commute-types";

const ICONS: Record<CommuteType, typeof Building2> = {
  office: Building2,
  university: GraduationCap,
  women: Venus,
  society: Home,
  school: School,
  intercity: Bus,
  airport: Plane,
  event: Ticket,
};

export function CommuteTypePicker({
  value,
  onChange,
  dense,
}: {
  value: CommuteType;
  onChange: (id: CommuteType) => void;
  dense?: boolean;
}) {
  return (
    <div className={dense ? "space-y-2" : "space-y-3"}>
      {!dense ? (
        <div>
          <p className="field-label !mb-1">Commute type</p>
          <p className="text-14 text-muted">
            Pick how you travel — HumSafar matches that circle.
          </p>
        </div>
      ) : null}
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        {COMMUTE_TYPES.map((c) => {
          const Icon = ICONS[c.id];
          const active = value === c.id;
          return (
            <button
              key={c.id}
              type="button"
              onClick={() => onChange(c.id)}
              className={`flex min-h-[76px] flex-col items-start gap-1 rounded-[14px] border px-3 py-3 text-start transition ${
                active
                  ? c.id === "women"
                    ? "border-plum bg-plum-soft ring-2 ring-plum/20"
                    : "border-teal bg-teal-soft ring-2 ring-teal/20"
                  : "border-line bg-white"
              }`}
            >
              <Icon
                className={`size-5 ${c.id === "women" ? "text-plum" : "text-teal"}`}
              />
              <span className="text-14 font-bold leading-tight text-ink">
                {c.short}
              </span>
            </button>
          );
        })}
      </div>
      <p className="rounded-xl bg-mist px-3 py-2 text-14 text-muted">
        <span className="font-bold text-ink">
          {COMMUTE_TYPES.find((c) => c.id === value)?.title}:
        </span>{" "}
        {COMMUTE_TYPES.find((c) => c.id === value)?.blurb}
      </p>
    </div>
  );
}

export function CommuteTypeBadge({ id }: { id: CommuteType }) {
  const meta = COMMUTE_TYPES.find((c) => c.id === id);
  if (!meta) return null;
  return (
    <span
      className={`badge ${id === "women" ? "badge-plum" : "badge-teal"}`}
    >
      {meta.short}
    </span>
  );
}
