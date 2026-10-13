"use client";

import { useEffect, useRef } from "react";
import { COMMUTE_TYPES, type CommuteType } from "@/lib/commute-types";

export function HeroCommuteSlider({
  value,
  onChange,
}: {
  value: CommuteType;
  onChange: (id: CommuteType) => void;
}) {
  const scroller = useRef<HTMLDivElement>(null);
  const activeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    activeRef.current?.scrollIntoView({
      behavior: "smooth",
      inline: "center",
      block: "nearest",
    });
  }, [value]);

  return (
    <div className="hero-slider relative z-[1]" ref={scroller}>
      <div className="hero-slider-track" role="tablist" aria-label="Commute type">
        {COMMUTE_TYPES.map((c) => {
          const active = value === c.id;
          return (
            <button
              key={c.id}
              ref={active ? activeRef : undefined}
              type="button"
              role="tab"
              aria-selected={active}
              className={`hero-slider-tab ${active ? "active" : ""}`}
              onClick={() => onChange(c.id)}
            >
              {c.short}
            </button>
          );
        })}
      </div>
    </div>
  );
}
