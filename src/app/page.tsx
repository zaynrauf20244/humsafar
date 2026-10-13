"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { ArrowRight, MapPin } from "lucide-react";
import { CommuteTypeBadge } from "@/components/CommuteTypePicker";
import { HeroCommuteSlider } from "@/components/HeroCommuteSlider";
import {
  Avatar,
  Badge,
  Button,
  Card,
  GirlsOnlyBadge,
  ScreenStates,
  VerifiedMark,
  useToast,
} from "@/components/ui";
import { commuteMeta, type CommuteType } from "@/lib/commute-types";
import { priceTag, riderPays, suggestRate } from "@/lib/pricing";
import { effectiveRole, useHumSafar, useUser } from "@/lib/store";
import type { Weekday } from "@/lib/types";

type Mode = "offer" | "find";

const TYPE_IDS: CommuteType[] = [
  "office",
  "university",
  "women",
  "society",
  "school",
  "intercity",
  "airport",
  "event",
];

export default function HomePage() {
  const {
    me,
    hydrated,
    introDone,
    setActiveRole,
    routes,
    bookings,
    respondBooking,
    postRoute,
    pauseRouteToday,
    searchRoutes,
    settings,
  } = useHumSafar();
  const router = useRouter();
  const role = effectiveRole(me);
  const [booting, setBooting] = useState(true);
  const [mode, setMode] = useState<Mode>("find");
  const [commuteType, setCommuteType] = useState<CommuteType>("office");

  useEffect(() => {
    if (typeof window === "undefined") return;
    const q = new URLSearchParams(window.location.search);
    const t = q.get("type") as CommuteType | null;
    const m = q.get("mode") as Mode | null;
    if (t && TYPE_IDS.includes(t)) setCommuteType(t);
    if (m === "offer" || m === "find") setMode(m);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    if (!introDone) {
      router.replace("/splash");
      return;
    }
    if (!me) {
      router.replace("/login");
      return;
    }
    if (me.role === "admin") {
      router.replace("/admin");
      return;
    }
    if (!window.location.search.includes("mode=")) {
      const start: Mode =
        role === "driver" || me.role === "driver" || me.role === "both"
          ? me.activeRole === "driver"
            ? "offer"
            : "find"
          : "find";
      setMode(start);
    }
    setBooting(false);
  }, [hydrated, introDone, me, router, role]);

  useEffect(() => {
    if (!me || me.role !== "both") return;
    setActiveRole(mode === "offer" ? "driver" : "passenger");
  }, [mode, me, setActiveRole]);

  if (booting || !me) {
    return (
      <main className="page">
        <ScreenStates loading emptyTitle="">
          {null}
        </ScreenStates>
      </main>
    );
  }

  const first = me.name.split(" ")[0];
  const meta = commuteMeta(commuteType);

  return (
    <main className="page space-y-5">
      <section
        className="commute-hero animate-rise"
        key={commuteType}
        style={{ background: meta.tone }}
      >
        <div className="commute-hero-body">
          <p className="text-14 font-semibold text-white/75">Hi {first}</p>
          <h1 className="mt-3 font-display text-32 font-extrabold leading-[1.15]">
            <span className="hero-highlight">{meta.short}</span>
            <span className="mt-2 block text-white">{meta.heroLine}</span>
          </h1>
          <p className="mt-3 max-w-sm text-16 text-white/85">{meta.blurb}</p>
          <Link
            href="/circles"
            className="mt-5 inline-flex min-h-11 items-center rounded-[14px] bg-[var(--sun)] px-5 text-14 font-bold text-ink"
          >
            All circles
          </Link>
        </div>
        <HeroCommuteSlider value={commuteType} onChange={setCommuteType} />
      </section>

      <div className="grid grid-cols-2 gap-3">
        <button
          type="button"
          className={`mode-tile ${mode === "find" ? "active" : ""}`}
          onClick={() => setMode("find")}
        >
          <span className="text-12 font-bold uppercase tracking-wide text-teal">
            Rider
          </span>
          <h3>Find a seat</h3>
          <p className="text-14 text-muted">In {meta.short}</p>
        </button>
        <button
          type="button"
          className={`mode-tile ${mode === "offer" ? "active" : ""}`}
          onClick={() => {
            if (!me.vehicle && me.role === "passenger") {
              router.push("/driver/setup");
              return;
            }
            setMode("offer");
          }}
        >
          <span className="text-12 font-bold uppercase tracking-wide text-sun">
            Car owner
          </span>
          <h3>Offer a seat</h3>
          <p className="text-14 text-muted">For {meta.short}</p>
        </button>
      </div>

      {mode === "offer" ? (
        <OfferSeat
          commuteType={commuteType}
          routes={routes.filter(
            (r) =>
              r.driverId === me.id && r.active && r.commuteType === commuteType
          )}
          requests={bookings.filter(
            (b) => b.driverId === me.id && b.status === "requested"
          )}
          postRoute={postRoute}
          pauseRouteToday={pauseRouteToday}
          respondBooking={respondBooking}
          settings={settings}
        />
      ) : (
        <FindSeat
          commuteType={commuteType}
          searchRoutes={searchRoutes}
          settings={settings}
        />
      )}
    </main>
  );
}

function OfferSeat({
  commuteType,
  routes,
  requests,
  postRoute,
  pauseRouteToday,
  respondBooking,
  settings,
}: {
  commuteType: CommuteType;
  routes: ReturnType<typeof useHumSafar>["routes"];
  requests: ReturnType<typeof useHumSafar>["bookings"];
  postRoute: ReturnType<typeof useHumSafar>["postRoute"];
  pauseRouteToday: ReturnType<typeof useHumSafar>["pauseRouteToday"];
  respondBooking: ReturnType<typeof useHumSafar>["respondBooking"];
  settings: ReturnType<typeof useHumSafar>["settings"];
}) {
  const { users } = useHumSafar();
  const { show } = useToast();
  const meta = commuteMeta(commuteType);
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [placeLabel, setPlaceLabel] = useState(meta.examples[0] || "");
  const [time, setTime] = useState(
    commuteType === "airport" ? "05:30" : commuteType === "event" ? "18:00" : "08:15"
  );
  const [seats, setSeats] = useState(2);
  const suggested = suggestRate(
    from || "Lahore",
    to || "Gulberg",
    { minRate: settings.minRate, maxRate: settings.maxRate },
    settings.perKm,
    seats
  );
  const [rate, setRate] = useState(suggested.mid);
  const days: Weekday[] = meta.recurringDefault
    ? ["mon", "tue", "wed", "thu", "fri"]
    : ["sat"];

  useEffect(() => {
    setFrom("");
    setTo(commuteType === "airport" ? "Allama Iqbal Airport" : "");
    setPlaceLabel(meta.examples[0] || "");
    setTime(
      commuteType === "airport"
        ? "05:30"
        : commuteType === "event"
          ? "18:00"
          : commuteType === "school"
            ? "07:20"
            : "08:15"
    );
  }, [commuteType, meta.examples]);

  useEffect(() => {
    setRate(suggested.mid);
  }, [suggested.mid]);

  return (
    <div className="space-y-4">
      <p className="text-14 text-muted">{meta.blurb}</p>

      {requests.length > 0 ? (
        <section className="space-y-3">
          <h2 className="font-display text-20 font-bold">
            Seat requests · {requests.length}
          </h2>
          {requests.map((b) => {
            const p = users.find((u) => u.id === b.passengerId);
            return (
              <Card key={b.id} className="space-y-3">
                <div className="flex items-center gap-3">
                  <Avatar name={p?.name || "R"} />
                  <div>
                    <p className="font-bold">{p?.name}</p>
                    <p className="text-14 text-muted">
                      ★ {p?.rating} · {b.pickup}
                    </p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <Button
                    onClick={() => {
                      const r = respondBooking(b.id, true);
                      show(r.ok ? "Seat confirmed" : r.error || "");
                    }}
                  >
                    Accept
                  </Button>
                  <Button
                    variant="secondary"
                    onClick={() => respondBooking(b.id, false)}
                  >
                    Decline
                  </Button>
                </div>
              </Card>
            );
          })}
        </section>
      ) : null}

      {routes.map((r) => (
        <Card key={r.id} className="space-y-3">
          <div className="flex flex-wrap gap-2">
            <CommuteTypeBadge id={r.commuteType} />
            {r.category === "women" ? <GirlsOnlyBadge /> : null}
          </div>
          <p className="font-display text-20 font-bold">
            {r.from} → {r.to}
          </p>
          <p className="text-14 text-muted">
            {r.time} · {r.seatsLeft} seats · you keep Rs {r.rate}
            {r.placeLabel ? ` · ${r.placeLabel}` : ""}
          </p>
          <Button
            variant="secondary"
            className="w-full"
            onClick={() => {
              pauseRouteToday(r.id);
              show("Paused for today");
            }}
          >
            Can&apos;t go today
          </Button>
        </Card>
      ))}

      <Card className="space-y-4">
        <div>
          <h2 className="font-display text-20 font-bold">
            Offer a seat · {meta.title}
          </h2>
          <p className="text-14 text-muted">
            You set the price. You keep the full seat amount.
          </p>
        </div>

        <label className="block">
          <span className="field-label">
            <MapPin className="me-1 inline size-4 text-teal" />
            From
          </span>
          <input
            className="input"
            value={from}
            onChange={(e) => setFrom(e.target.value)}
            placeholder={meta.hintFrom}
          />
        </label>
        <label className="block">
          <span className="field-label">
            <MapPin className="me-1 inline size-4 text-sun" />
            To
          </span>
          <input
            className="input"
            value={to}
            onChange={(e) => setTo(e.target.value)}
            placeholder={meta.hintTo}
          />
        </label>
        <label className="block">
          <span className="field-label">
            {commuteType === "office"
              ? "Building / company"
              : commuteType === "university"
                ? "University"
                : commuteType === "school"
                  ? "School name"
                  : commuteType === "event"
                    ? "Event name"
                    : commuteType === "society"
                      ? "Society"
                      : "Label (optional)"}
          </span>
          <input
            className="input"
            value={placeLabel}
            onChange={(e) => setPlaceLabel(e.target.value)}
            placeholder={meta.examples[0]}
          />
        </label>
        <div className="grid grid-cols-2 gap-3">
          <label className="block">
            <span className="field-label">Leave around</span>
            <input
              className="input"
              type="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
            />
          </label>
          <label className="block">
            <span className="field-label">Empty seats</span>
            <input
              className="input"
              type="number"
              min={1}
              max={4}
              value={seats}
              onChange={(e) => setSeats(Number(e.target.value))}
            />
          </label>
        </div>

        <div>
          <span className="field-label">
            Your seat price · recommended Rs {suggested.min}–{suggested.max}
          </span>
          <input
            className="input"
            type="number"
            value={rate}
            onChange={(e) => setRate(Number(e.target.value))}
          />
          <p className="mt-2 text-14 font-semibold text-teal">
            You keep Rs {rate} · rider pays HumSafar fee separately
          </p>
        </div>

        {commuteType === "women" ? (
          <GirlsOnlyBadge />
        ) : (
          <p className="text-12 text-muted">Open to verified riders in this circle</p>
        )}

        <Button
          className="w-full"
          onClick={() => {
            const res = postRoute({
              from,
              to,
              direction: "home_to_office",
              time,
              seats,
              days,
              category: commuteType === "women" ? "women" : "any",
              commuteType,
              placeLabel,
              rate,
              recurring: meta.recurringDefault,
            });
            show(res.ok ? `Offered in ${meta.short}` : res.error || "Error");
          }}
        >
          Offer this seat
        </Button>
      </Card>
    </div>
  );
}

function FindSeat({
  commuteType,
  searchRoutes,
  settings,
}: {
  commuteType: CommuteType;
  searchRoutes: ReturnType<typeof useHumSafar>["searchRoutes"];
  settings: ReturnType<typeof useHumSafar>["settings"];
}) {
  const { me, savedPlaces, savePlace, requestBooking, createMatchAlert } =
    useHumSafar();
  const { show } = useToast();
  const meta = commuteMeta(commuteType);
  const places = me ? savedPlaces[me.id] || [] : [];
  const [from, setFrom] = useState(places[0]?.value || "");
  const [to, setTo] = useState(
    commuteType === "airport" ? "Allama Iqbal Airport" : places[1]?.value || ""
  );
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [results, setResults] = useState<ReturnType<typeof searchRoutes>>([]);

  useEffect(() => {
    setSearched(false);
    setResults([]);
    if (commuteType === "airport") setTo("Allama Iqbal Airport");
  }, [commuteType]);

  function runSearch() {
    setLoading(true);
    setSearched(true);
    if (from) savePlace("Home", from);
    if (to) savePlace("Office", to);
    window.setTimeout(() => {
      setResults(
        [
          ...searchRoutes(from, to, {
            commuteType,
            category: commuteType === "women" ? "women" : "all",
          }),
        ].sort((a, b) => a.time.localeCompare(b.time))
      );
      setLoading(false);
    }, 320);
  }

  return (
    <div className="space-y-4">
      <Card className="space-y-4">
        <div>
          <h2 className="font-display text-20 font-bold">{meta.title}</h2>
          <p className="text-14 text-muted">{meta.blurb}</p>
        </div>

        <label className="block">
          <span className="field-label">From</span>
          <input
            className="input"
            value={from}
            onChange={(e) => setFrom(e.target.value)}
            placeholder={meta.hintFrom}
          />
        </label>
        <label className="block">
          <span className="field-label">To</span>
          <input
            className="input"
            value={to}
            onChange={(e) => setTo(e.target.value)}
            placeholder={meta.hintTo}
          />
        </label>

        <Button className="w-full" onClick={runSearch}>
          Find seats in {meta.short}
        </Button>
      </Card>

      {searched ? (
        <ScreenStates
          loading={loading}
          empty={!loading && results.length === 0}
          emptyTitle={`No ${meta.short} seats yet`}
          emptyBody="Save an alert — we’ll tell you when someone offers."
          emptyAction={
            <Button
              onClick={() => {
                createMatchAlert(
                  from,
                  to,
                  "08:00",
                  commuteType === "women" ? "women" : "any",
                  commuteType
                );
                show("Alert saved");
              }}
            >
              Notify me
            </Button>
          }
        >
          <div className="space-y-3">
            <p className="text-14 font-semibold text-muted">
              {meta.title} · {results.length} open
            </p>
            {results.map((r) => (
              <SeatCard
                key={r.id}
                routeId={r.id}
                feePercent={settings.feePercent}
                onBook={() => {
                  const res = requestBooking(r.id, from || r.from, to || r.to);
                  show(res.ok ? "Request sent" : res.error || "");
                }}
              />
            ))}
          </div>
        </ScreenStates>
      ) : null}
    </div>
  );
}

function SeatCard({
  routeId,
  feePercent,
  onBook,
}: {
  routeId: string;
  feePercent: number;
  onBook: () => void;
}) {
  const { routes } = useHumSafar();
  const route = routes.find((r) => r.id === routeId);
  const owner = useUser(route?.driverId);
  if (!route || !owner) return null;
  const tag = priceTag(route.rate, route.suggestedMin, route.suggestedMax);
  const pay = riderPays(route.rate, feePercent);

  return (
    <Card className="space-y-3 animate-rise">
      <div className="flex flex-wrap gap-2">
        <CommuteTypeBadge id={route.commuteType} />
        {route.category === "women" || route.commuteType === "women" ? (
          <GirlsOnlyBadge />
        ) : null}
        {route.placeLabel ? (
          <Badge tone="mist">{route.placeLabel}</Badge>
        ) : null}
      </div>

      <div className="flex items-center gap-3">
        <Avatar name={owner.name} size={52} />
        <div className="min-w-0 flex-1">
          <p className="truncate text-16 font-bold">{owner.name}</p>
          <div className="flex flex-wrap items-center gap-2">
            <VerifiedMark />
            <span className="text-14 text-muted">★ {owner.rating}</span>
          </div>
        </div>
        <div className="text-end">
          <p className="font-display text-20 font-bold">Rs {pay.total}</p>
          <p className="text-12 text-muted">incl. fee</p>
        </div>
      </div>

      <p className="text-16 font-semibold">
        {route.from} <ArrowRight className="inline size-4" /> {route.to}
      </p>
      <p className="text-14 text-muted">
        Leaves {route.time} · {route.seatsLeft} seats · {owner.vehicle?.make}{" "}
        {owner.vehicle?.model}
      </p>

      <div className="flex flex-wrap gap-2">
        <Badge
          tone={
            tag === "cheap" ? "teal" : tag === "expensive" ? "marigold" : "mist"
          }
        >
          {tag === "cheap" ? "Good deal" : tag === "expensive" ? "Higher" : "Fair"}
        </Badge>
      </div>

      <p className="rounded-xl bg-mist px-3 py-2 text-12 text-muted">
        Seat Rs {pay.seat} + HumSafar fee Rs {pay.fee} · cash to owner
      </p>

      <Button className="w-full" onClick={onBook}>
        Request seat
      </Button>
    </Card>
  );
}
