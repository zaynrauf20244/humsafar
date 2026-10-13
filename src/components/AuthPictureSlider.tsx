"use client";

import { useEffect, useRef } from "react";
import { COMMUTE_TYPES, type CommuteType } from "@/lib/commute-types";
import { COMMUTE_IMAGES } from "@/lib/commute-media";

export function AuthPictureSlider({
  value,
  onChange,
}: {
  value: CommuteType;
  onChange: (id: CommuteType) => void;
}) {
  const meta = COMMUTE_TYPES.find((c) => c.id === value) || COMMUTE_TYPES[0];
  const img = COMMUTE_IMAGES[value];
  const activeRef = useRef<HTMLButtonElement>(null);
  const onChangeRef = useRef(onChange);
  const valueRef = useRef(value);

  onChangeRef.current = onChange;
  valueRef.current = value;

  // Preload all slides so tab changes never flash empty
  useEffect(() => {
    Object.values(COMMUTE_IMAGES).forEach((item) => {
      const preload = new window.Image();
      preload.src = item.src;
    });
  }, []);

  useEffect(() => {
    activeRef.current?.scrollIntoView({
      behavior: "smooth",
      inline: "center",
      block: "nearest",
    });
  }, [value]);

  useEffect(() => {
    const id = window.setInterval(() => {
      const current = valueRef.current;
      const i = COMMUTE_TYPES.findIndex((c) => c.id === current);
      onChangeRef.current(COMMUTE_TYPES[(i + 1) % COMMUTE_TYPES.length].id);
    }, 5500);
    return () => window.clearInterval(id);
  }, []);

  return (
    <div className="auth-pic-slider">
      <div className="auth-pic-frame" style={{ background: meta.tone }}>
        {COMMUTE_TYPES.map((c) => {
          const src = COMMUTE_IMAGES[c.id].src;
          const active = c.id === value;
          return (
            <div
              key={c.id}
              className={`auth-pic-layer ${active ? "on" : ""}`}
              style={{ backgroundImage: `url("${src}")` }}
              role={active ? "img" : undefined}
              aria-label={active ? COMMUTE_IMAGES[c.id].alt : undefined}
              aria-hidden={!active}
            />
          );
        })}
        <div className="auth-pic-shade" />
        <div className="auth-pic-copy">
          <p className="auth-pic-kicker">Ready for {meta.short}?</p>
          <p className="auth-pic-line">{meta.heroLine}</p>
        </div>
      </div>

      <div className="auth-pic-tabs-wrap">
        <div
          className="hero-slider-track !px-0"
          role="tablist"
          aria-label="Commute type"
        >
          {COMMUTE_TYPES.map((c) => {
            const active = value === c.id;
            return (
              <button
                key={c.id}
                ref={active ? activeRef : undefined}
                type="button"
                role="tab"
                aria-selected={active}
                className={`auth-pic-tab ${active ? "active" : ""}`}
                onClick={() => onChange(c.id)}
              >
                {c.short}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
