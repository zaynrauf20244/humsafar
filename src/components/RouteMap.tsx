"use client";

import dynamic from "next/dynamic";
import {
  useEffect,
  useId,
  useRef,
  useState,
  type ReactNode,
} from "react";
import {
  fetchDrivingRoute,
  searchPlaces,
  type DrivingRoute,
  type GeoPoint,
  type PlaceHit,
} from "@/lib/geo";

export type RouteEnds = {
  from: GeoPoint | null;
  to: GeoPoint | null;
  distanceKm?: number;
  durationMin?: number;
};

type Props = {
  fromLabel: ReactNode;
  toLabel: ReactNode;
  fromPlaceholder?: string;
  toPlaceholder?: string;
  onChange: (ends: RouteEnds) => void;
};

const MapCanvas = dynamic(() => import("./RouteMapCanvas"), {
  ssr: false,
  loading: () => (
    <div className="flex h-[220px] items-center justify-center rounded-2xl bg-[var(--uber-soft,#f3f3f3)] text-14 text-muted">
      Loading map…
    </div>
  ),
});

export function RouteMap({
  fromLabel,
  toLabel,
  fromPlaceholder = "Search building or area",
  toPlaceholder = "Search home or drop",
  onChange,
}: Props) {
  const [from, setFrom] = useState<GeoPoint | null>(null);
  const [to, setTo] = useState<GeoPoint | null>(null);
  const [route, setRoute] = useState<DrivingRoute | null>(null);
  const [routeError, setRouteError] = useState("");

  useEffect(() => {
    onChange({
      from,
      to,
      distanceKm: route?.distanceKm,
      durationMin: route?.durationMin,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [from, to, route]);

  useEffect(() => {
    if (!from || !to) {
      setRoute(null);
      setRouteError("");
      return;
    }
    const ac = new AbortController();
    setRouteError("");
    fetchDrivingRoute(from, to, ac.signal)
      .then((r) => {
        if (!r) {
          setRoute(null);
          setRouteError("Couldn’t draw a road route — try nearby places");
          return;
        }
        setRoute(r);
      })
      .catch((err: unknown) => {
        if (err instanceof DOMException && err.name === "AbortError") return;
        setRoute(null);
        setRouteError("Route lookup failed");
      });
    return () => ac.abort();
  }, [from, to]);

  const [searchOpen, setSearchOpen] = useState<"from" | "to" | null>(null);

  return (
    <div className="relative z-10 space-y-3 overflow-visible">
      <PlaceSearch
        label={fromLabel}
        placeholder={fromPlaceholder}
        value={from}
        onPick={setFrom}
        stackPriority={2}
        onOpenChange={(o) =>
          setSearchOpen((cur) => (o ? "from" : cur === "from" ? null : cur))
        }
      />
      <PlaceSearch
        label={toLabel}
        placeholder={toPlaceholder}
        value={to}
        onPick={setTo}
        near={from}
        stackPriority={1}
        onOpenChange={(o) =>
          setSearchOpen((cur) => (o ? "to" : cur === "to" ? null : cur))
        }
      />

      <div
        className={
          searchOpen
            ? "pointer-events-none relative z-0 opacity-90"
            : "relative z-0"
        }
      >
        <MapCanvas from={from} to={to} path={route?.coords ?? null} />
      </div>

      {route ? (
        <p className="text-14 font-semibold text-teal">
          ~{route.distanceKm} km · ~{route.durationMin} min drive
        </p>
      ) : null}
      {routeError ? (
        <p className="text-14 font-semibold text-red">{routeError}</p>
      ) : null}
    </div>
  );
}

function PlaceSearch({
  label,
  placeholder,
  value,
  onPick,
  near,
  stackPriority = 1,
  onOpenChange,
}: {
  label: ReactNode;
  placeholder: string;
  value: GeoPoint | null;
  onPick: (p: GeoPoint | null) => void;
  near?: GeoPoint | null;
  /** Higher wins when both closed; open always elevates above siblings. */
  stackPriority?: number;
  onOpenChange?: (open: boolean) => void;
}) {
  const listId = useId();
  const [query, setQuery] = useState(value?.label ?? "");
  const [hits, setHits] = useState<PlaceHit[]>([]);
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [hint, setHint] = useState("");
  const wrapRef = useRef<HTMLDivElement>(null);
  const pickedRef = useRef(false);

  function setOpenSafe(next: boolean) {
    setOpen(next);
    onOpenChange?.(next);
  }

  useEffect(() => {
    if (value?.label) {
      setQuery(value.label);
      pickedRef.current = true;
    } else if (!value) {
      pickedRef.current = false;
    }
  }, [value?.label, value]);

  useEffect(() => {
    function onDoc(e: PointerEvent) {
      if (!wrapRef.current?.contains(e.target as Node)) setOpenSafe(false);
    }
    // bubble phase — after suggestion pointerdown picks
    document.addEventListener("pointerdown", onDoc);
    return () => document.removeEventListener("pointerdown", onDoc);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const q = query.trim();
    if (q.length < 2) {
      setHits([]);
      setHint("");
      return;
    }
    // Don’t re-search after a successful pick with the same label
    if (pickedRef.current && value?.label === q) {
      setHits([]);
      return;
    }

    const ac = new AbortController();
    const t = window.setTimeout(() => {
      setBusy(true);
      setHint("");
      searchPlaces(q, { signal: ac.signal, near })
        .then((list) => {
          setHits(list);
          setOpenSafe(true);
          setHint(list.length === 0 ? "No places found — try a fuller name" : "");
        })
        .catch((err: unknown) => {
          if (err instanceof DOMException && err.name === "AbortError") return;
          setHits([]);
          setHint("Search failed — wait a second and try again");
        })
        .finally(() => setBusy(false));
    }, 400);

    return () => {
      window.clearTimeout(t);
      ac.abort();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query, value?.label, near]);

  function pickHit(h: PlaceHit) {
    pickedRef.current = true;
    onPick(h);
    setQuery(h.label);
    setHits([]);
    setOpenSafe(false);
    setHint("");
  }

  const zClass = open
    ? "z-[1400]"
    : stackPriority >= 2
      ? "z-[30]"
      : "z-[20]";

  return (
    <div className={`relative overflow-visible ${zClass}`} ref={wrapRef}>
      <label className="block">
        <span className="field-label">{label}</span>
        <input
          className="input"
          value={query}
          placeholder={placeholder}
          autoComplete="off"
          role="combobox"
          aria-expanded={open}
          aria-controls={listId}
          onChange={(e) => {
            pickedRef.current = false;
            setQuery(e.target.value);
            if (value) onPick(null);
          }}
          onFocus={() => {
            if (hits.length > 0) setOpenSafe(true);
          }}
        />
      </label>
      {busy ? (
        <p className="mt-1 text-12 text-muted">Searching Pakistan…</p>
      ) : null}
      {!busy && hint ? (
        <p className="mt-1 text-12 text-muted">{hint}</p>
      ) : null}
      {open && hits.length > 0 ? (
        <ul
          id={listId}
          role="listbox"
          className="absolute left-0 right-0 top-full z-[1500] mt-1 max-h-60 w-full overflow-auto rounded-xl border border-black/10 bg-white py-1 shadow-xl"
        >
          {hits.map((h) => (
            <li key={h.id} role="option">
              <button
                type="button"
                className="min-h-11 w-full px-3 py-3 text-start text-14 hover:bg-black/5 active:bg-black/10"
                onPointerDown={(e) => {
                  // Capture pick before blur / outside-close / sibling fields
                  e.preventDefault();
                  e.stopPropagation();
                  pickHit(h);
                }}
              >
                {h.label}
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
