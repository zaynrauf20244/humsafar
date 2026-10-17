"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { ArrowRight, MapPin } from "lucide-react";
import { CommuteTypeBadge } from "@/components/CommuteTypePicker";
import { HeroCommuteSlider } from "@/components/HeroCommuteSlider";
import { RouteMap } from "@/components/RouteMap";
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
import {
  canOfferSeats,
  ownerDashboardLabel,
  vehicleKindOf,
  vehicleVerifyStatus,
} from "@/lib/roles";
import { homeModeForUser, useHumSafar, useUser } from "@/lib/store";
import type { User, VehicleKind, Weekday } from "@/lib/types";

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
  const [booting, setBooting] = useState(true);
  const [mode, setMode] = useState<Mode>("find");
  const [commuteType, setCommuteType] = useState<CommuteType>("office");
  const [modeFromUrl, setModeFromUrl] = useState(false);
  const [rideKind, setRideKind] = useState<VehicleKind>("car");

  useEffect(() => {
    if (typeof window === "undefined") return;
    const q = new URLSearchParams(window.location.search);
    const t = q.get("type") as CommuteType | null;
    const m = q.get("mode") as Mode | null;
    if (t && TYPE_IDS.includes(t)) setCommuteType(t);
    if (m === "offer" || m === "find") {
      setMode(m);
      setModeFromUrl(true);
    }
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
    // Pure car owners always start on Offer; pure riders on Find.
    // Only "both" keeps an explicit ?mode= from the URL.
    if (me.role === "both" && modeFromUrl) {
      /* keep URL mode */
    } else {
      setMode(homeModeForUser(me));
    }
    setBooting(false);
  }, [hydrated, introDone, me, router, modeFromUrl]);

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
  const ownerKind = vehicleKindOf(me);
  const isOwnerDash = mode === "offer";
  const canSwitch = me.role === "both";
  const dashLabel = isOwnerDash
    ? ownerDashboardLabel(ownerKind)
    : "Passenger dashboard";
  const dashHint = isOwnerDash
    ? ownerKind === "bike"
      ? "Offer a bike seat on your road."
      : "Offer empty car seats on your road."
    : "Choose car or bike, then find a verified seat.";

  return (
    <main className="page space-y-5">
      <section
        className="commute-hero animate-rise"
        key={commuteType}
        style={{ background: meta.tone }}
      >
        <div className="commute-hero-body">
          <p className="text-14 font-semibold text-white/75">
            Hi {first}
            <span className="ms-2 rounded-full bg-white/20 px-2.5 py-0.5 text-12 font-bold tracking-wide text-white">
              {dashLabel}
            </span>
          </p>
          <h1 className="mt-3 font-display text-32 font-extrabold leading-[1.15]">
            <span className="hero-highlight">{meta.short}</span>
            <span className="mt-2 block text-white">
              {isOwnerDash
                ? ownerKind === "bike"
                  ? "Your road. Your bike. Share the ride."
                  : "Your road. Your empty seats. Share them."
                : meta.heroLine}
            </span>
          </h1>
          <p className="mt-3 max-w-sm text-16 text-white/85">
            {isOwnerDash ? dashHint : meta.blurb}
          </p>
          <Link
            href="/circles"
            className="mt-5 inline-flex min-h-11 items-center rounded-[14px] bg-[var(--sun)] px-5 text-14 font-bold text-ink"
          >
            All circles
          </Link>
        </div>
        <HeroCommuteSlider value={commuteType} onChange={setCommuteType} />
      </section>

      <Link
        href="/wallet"
        className="card flex items-center justify-between gap-3 !py-4 transition hover:border-teal"
      >
        <div>
          <p className="text-12 font-bold uppercase tracking-wide text-teal">
            Your credits
          </p>
          <p className="mt-0.5 font-display text-26 font-extrabold">
            Rs {me.walletBalance.toLocaleString()}
          </p>
          <p className="text-12 text-muted">Tap for history &amp; top-up</p>
        </div>
        <span className="rounded-xl bg-teal-soft px-3 py-2 text-14 font-bold text-teal-deep">
          Open
        </span>
      </Link>

      {canSwitch ? (
        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            className={`mode-tile ${mode === "find" ? "active" : ""}`}
            onClick={() => setMode("find")}
          >
            <span className="text-12 font-bold uppercase tracking-wide text-teal">
              Passenger
            </span>
            <h3>Find a seat</h3>
            <p className="text-14 text-muted">In {meta.short}</p>
          </button>
          <button
            type="button"
            className={`mode-tile ${mode === "offer" ? "active" : ""}`}
            onClick={() => setMode("offer")}
          >
            <span className="text-12 font-bold uppercase tracking-wide text-sun">
              {ownerKind === "bike" ? "Bike owner" : "Car owner"}
            </span>
            <h3>Offer a seat</h3>
            <p className="text-14 text-muted">For {meta.short}</p>
          </button>
        </div>
      ) : (
        <div className="rounded-2xl border border-black/8 bg-white px-4 py-3">
          <p className="text-12 font-bold uppercase tracking-wide text-teal">
            {dashLabel}
          </p>
          <p className="mt-1 text-14 text-muted">{dashHint}</p>
        </div>
      )}

      {isOwnerDash ? (
        canOfferSeats(me) ? (
          <OfferSeat
            commuteType={commuteType}
            vehicleKind={ownerKind}
            routes={routes.filter(
              (r) =>
                r.driverId === me.id &&
                r.active &&
                r.commuteType === commuteType
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
          <OwnerVehicleGate me={me} kind={ownerKind} />
        )
      ) : (
        <FindSeat
          commuteType={commuteType}
          rideKind={rideKind}
          onRideKindChange={setRideKind}
          searchRoutes={searchRoutes}
          settings={settings}
        />
      )}
    </main>
  );
}

function OwnerVehicleGate({ me, kind }: { me: User; kind: VehicleKind }) {
  const router = useRouter();
  const label = kind === "bike" ? "bike" : "car";
  const status = vehicleVerifyStatus(me);

  if (me.cnicStatus !== "approved") {
    return (
      <Card className="space-y-3">
        <h2 className="font-display text-20 font-bold">CNIC under review</h2>
        <p className="text-14 text-muted">
          Admin must approve your CNIC before you can register a {label} and
          offer seats.
        </p>
        {me.cnicStatus === "rejected" ? (
          <p className="text-14 font-semibold text-red">
            {me.cnicRejectReason || "CNIC rejected — update docs with support"}
          </p>
        ) : (
          <Badge tone="marigold">Pending admin approval</Badge>
        )}
      </Card>
    );
  }

  if (!status) {
    return (
      <Card className="space-y-4">
        <div>
          <p className="text-12 font-bold uppercase tracking-wide text-sun">
            Step 1 · Required
          </p>
          <h2 className="mt-1 font-display text-22 font-bold">
            Register your {label}
          </h2>
          <p className="mt-2 text-14 text-muted">
            Add make, model, plate and licence. Admin will review, then you can
            offer seats on your dashboard.
          </p>
        </div>
        <Button className="w-full" onClick={() => router.push("/driver/setup")}>
          Register {label} details
        </Button>
      </Card>
    );
  }

  if (status === "pending") {
    const v = me.vehicle!;
    return (
      <Card className="space-y-3">
        <Badge tone="marigold">Waiting for admin</Badge>
        <h2 className="font-display text-20 font-bold">
          {label === "bike" ? "Bike" : "Car"} submitted
        </h2>
        <p className="text-14 text-muted">
          {v.make} {v.model} · {v.plate} · {v.color}
        </p>
        <p className="text-14 text-muted">
          You can&apos;t offer seats until an admin approves this vehicle.
        </p>
        <Button
          variant="secondary"
          className="w-full"
          onClick={() => router.push("/driver/setup")}
        >
          Edit details
        </Button>
      </Card>
    );
  }

  // rejected
  return (
    <Card className="space-y-3">
      <Badge tone="red">Rejected</Badge>
      <h2 className="font-display text-20 font-bold">
        Update your {label} details
      </h2>
      <p className="text-14 font-semibold text-red">
        {me.vehicle?.rejectReason || "Documents unclear — please resubmit"}
      </p>
      <Button className="w-full" onClick={() => router.push("/driver/setup")}>
        Fix &amp; resubmit
      </Button>
    </Card>
  );
}

function OfferSeat({
  commuteType,
  vehicleKind,
  routes,
  requests,
  postRoute,
  pauseRouteToday,
  respondBooking,
  settings,
}: {
  commuteType: CommuteType;
  vehicleKind: VehicleKind;
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
  const [fromLat, setFromLat] = useState<number | undefined>();
  const [fromLng, setFromLng] = useState<number | undefined>();
  const [toLat, setToLat] = useState<number | undefined>();
  const [toLng, setToLng] = useState<number | undefined>();
  const [distanceKm, setDistanceKm] = useState<number | undefined>();
  const [durationMin, setDurationMin] = useState<number | undefined>();
  const [placeLabel, setPlaceLabel] = useState(meta.examples[0] || "");
  const [time, setTime] = useState(
    commuteType === "airport" ? "05:30" : commuteType === "event" ? "18:00" : "08:15"
  );
  const [seats, setSeats] = useState(vehicleKind === "bike" ? 1 : 2);

  useEffect(() => {
    setSeats(vehicleKind === "bike" ? 1 : 2);
  }, [vehicleKind]);
  const suggested = suggestRate(
    from || "Lahore",
    to || "Gulberg",
    { minRate: settings.minRate, maxRate: settings.maxRate },
    settings.perKm,
    seats,
    distanceKm
  );
  const [rate, setRate] = useState(suggested.mid);
  const days: Weekday[] = meta.recurringDefault
    ? ["mon", "tue", "wed", "thu", "fri"]
    : ["sat"];

  useEffect(() => {
    setFrom("");
    setTo("");
    setFromLat(undefined);
    setFromLng(undefined);
    setToLat(undefined);
    setToLng(undefined);
    setDistanceKm(undefined);
    setDurationMin(undefined);
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
            {r.distanceKm != null
              ? ` · ~${r.distanceKm} km${r.durationMin != null ? ` / ${r.durationMin} min` : ""}`
              : ""}
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
            Offer a {vehicleKind === "bike" ? "bike" : "car"} seat · {meta.title}
          </h2>
          <p className="text-14 text-muted">
            Map your building → home. You keep the full seat amount.
          </p>
        </div>

        <RouteMap
          key={`offer-${commuteType}`}
          fromLabel={
            <>
              <MapPin className="me-1 inline size-4 text-teal" />
              From
            </>
          }
          toLabel={
            <>
              <MapPin className="me-1 inline size-4 text-sun" />
              To
            </>
          }
          fromPlaceholder={meta.hintFrom}
          toPlaceholder={meta.hintTo}
          onChange={(ends) => {
            setFrom(ends.from?.label || "");
            setTo(ends.to?.label || "");
            setFromLat(ends.from?.lat);
            setFromLng(ends.from?.lng);
            setToLat(ends.to?.lat);
            setToLng(ends.to?.lng);
            setDistanceKm(ends.distanceKm);
            setDurationMin(ends.durationMin);
          }}
        />

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
            <span className="field-label">
              {vehicleKind === "bike" ? "Passenger seats" : "Empty seats"}
            </span>
            <input
              className="input"
              type="number"
              min={1}
              max={vehicleKind === "bike" ? 1 : 4}
              value={seats}
              onChange={(e) => setSeats(Number(e.target.value))}
              disabled={vehicleKind === "bike"}
            />
          </label>
        </div>

        <div>
          <span className="field-label">Your seat price (you decide)</span>
          <input
            className="input"
            type="number"
            min={1}
            value={rate}
            onChange={(e) => setRate(Number(e.target.value))}
          />
          <p className="mt-2 text-14 text-muted">
            Suggestion only (~Rs {settings.perKm}/km ÷ seats · ~{suggested.km}{" "}
            km):{" "}
            <span className="font-semibold text-ink">
              Rs {suggested.min}–{suggested.max}
            </span>
            . Final price is yours.
          </p>
          <p className="mt-1 text-14 font-semibold text-teal">
            You keep Rs {rate || 0} · rider pays HumSafar fee separately
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
            if (!from.trim() || !to.trim()) {
              show("Pick From and To on the map");
              return;
            }
            const res = postRoute({
              from,
              to,
              fromLat,
              fromLng,
              toLat,
              toLng,
              distanceKm,
              durationMin,
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
  rideKind,
  onRideKindChange,
  searchRoutes,
  settings,
}: {
  commuteType: CommuteType;
  rideKind: VehicleKind;
  onRideKindChange: (k: VehicleKind) => void;
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

  useEffect(() => {
    setSearched(false);
    setResults([]);
  }, [rideKind]);

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
            vehicleKind: rideKind,
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
          <p className="text-14 text-muted">
            {meta.blurb} Pick car or bike, then search From → To.
          </p>
        </div>

        <div>
          <span className="field-label">I want to go by</span>
          <div className="mt-2 grid grid-cols-2 gap-3">
            {(
              [
                ["car", "Car", "/vehicles/car.svg"],
                ["bike", "Bike", "/vehicles/bike.svg"],
              ] as const
            ).map(([k, label, src]) => (
              <button
                key={k}
                type="button"
                className={`overflow-hidden rounded-2xl border-2 text-start transition ${
                  rideKind === k
                    ? "border-teal shadow-[0_0_0_1px_var(--teal,#0d9488)]"
                    : "border-black/10"
                }`}
                onClick={() => onRideKindChange(k)}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={src}
                  alt=""
                  className="h-24 w-full object-cover"
                />
                <div className="bg-white px-3 py-2.5">
                  <p className="text-16 font-bold">{label}</p>
                  <p className="text-12 text-muted">
                    {k === "bike" ? "Share a bike seat" : "Share a car seat"}
                  </p>
                </div>
              </button>
            ))}
          </div>
        </div>

        <RouteMap
          key={`find-${commuteType}`}
          fromLabel="From"
          toLabel="To"
          fromPlaceholder={meta.hintFrom}
          toPlaceholder={meta.hintTo}
          onChange={(ends) => {
            setFrom(ends.from?.label || "");
            setTo(ends.to?.label || "");
          }}
        />

        <Button className="w-full" onClick={runSearch}>
          Find {rideKind} seats in {meta.short}
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
        <Badge tone="mist">
          {(route.vehicleKind ?? "car") === "bike" ? "Bike" : "Car"}
        </Badge>
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
        {route.distanceKm != null
          ? ` · ~${route.distanceKm} km${
              route.durationMin != null ? ` / ${route.durationMin} min` : ""
            }`
          : ""}
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
