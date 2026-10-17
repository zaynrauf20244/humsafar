import { getSupabase, isLiveConfigured } from "./supabase";
import type {
  AppSettings,
  Booking,
  ChatMessage,
  ChatThread,
  Complaint,
  RateBounds,
  RoutePost,
  SosAlert,
  User,
  WalletTx,
} from "./types";

export { isLiveConfigured };

function normalizeVehicle(raw: unknown): User["vehicle"] | undefined {
  if (!raw || typeof raw !== "object") return undefined;
  const v = raw as Record<string, unknown>;
  const status =
    v.status === "pending" || v.status === "rejected" || v.status === "approved"
      ? v.status
      : "approved";
  return {
    kind: v.kind === "bike" ? "bike" : "car",
    make: String(v.make ?? ""),
    model: String(v.model ?? ""),
    year: Number(v.year ?? 0),
    color: String(v.color ?? ""),
    plate: String(v.plate ?? ""),
    seats: Number(v.seats ?? 1),
    status,
    rejectReason: (v.rejectReason as string) || undefined,
    photoName: (v.photoName as string) || undefined,
    regBookName: (v.regBookName as string) || undefined,
  };
}

function sb() {
  const c = getSupabase();
  if (!c) throw new Error("Supabase not configured");
  return c;
}

function logLiveError(label: string, error: unknown) {
  const e = error as {
    message?: string;
    code?: string;
    details?: string;
    hint?: string;
  } | null;
  console.error(
    `[live-db] ${label}`,
    e?.message || e?.code || "unknown",
    e?.details || "",
    e?.hint || ""
  );
}

/** Expected schema drift — warn once, don’t trip Next.js error overlay. */
let schemaWarnOnce = false;
function logSchemaGap(label: string, error: unknown) {
  if (schemaWarnOnce) return;
  schemaWarnOnce = true;
  const e = error as { message?: string; code?: string } | null;
  console.warn(
    `[live-db] ${label}`,
    e?.message || e?.code || "unknown",
    "(app continues with older columns — run supabase/migrate-routes-live.sql)"
  );
}

const GEO_FLAG = "humsafar-route-geo";
const KIND_FLAG = "humsafar-route-kind";

/** True once we know the Live DB has map lat/lng columns. */
let routeGeoColumnsOk: boolean | null = null;
/** True once we know vehicle_kind exists on routes. */
let routeKindColumnOk: boolean | null = null;

function readFlag(key: string): boolean | null {
  if (typeof window === "undefined") return null;
  try {
    const v = sessionStorage.getItem(key);
    if (v === "1") return true;
    if (v === "0") return false;
  } catch {
    /* private mode */
  }
  return null;
}

function writeFlag(key: string, ok: boolean) {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.setItem(key, ok ? "1" : "0");
  } catch {
    /* private mode */
  }
}

function geoColumnsKnown(): boolean | null {
  if (routeGeoColumnsOk != null) return routeGeoColumnsOk;
  const cached = readFlag(GEO_FLAG);
  if (cached != null) routeGeoColumnsOk = cached;
  return routeGeoColumnsOk;
}

function kindColumnKnown(): boolean | null {
  if (routeKindColumnOk != null) return routeKindColumnOk;
  const cached = readFlag(KIND_FLAG);
  if (cached != null) routeKindColumnOk = cached;
  return routeKindColumnOk;
}

function setGeoColumnsOk(ok: boolean) {
  routeGeoColumnsOk = ok;
  writeFlag(GEO_FLAG, ok);
}

function setKindColumnOk(ok: boolean) {
  routeKindColumnOk = ok;
  writeFlag(KIND_FLAG, ok);
}

function isMissingColumnError(error: unknown) {
  const e = error as { message?: string; code?: string } | null;
  const msg = (e?.message || "").toLowerCase();
  return (
    e?.code === "PGRST204" ||
    msg.includes("could not find") ||
    msg.includes("schema cache") ||
    (msg.includes("column") && msg.includes("does not exist"))
  );
}

function missingColumnName(error: unknown): string | null {
  const msg = String((error as { message?: string } | null)?.message || "");
  const m = msg.match(/'([a-z0-9_]+)' column/i);
  return m?.[1]?.toLowerCase() ?? null;
}

/* —— mappers —— */

function userFromRow(r: Record<string, unknown>): User {
  return {
    id: String(r.id),
    phone: String(r.phone),
    name: String(r.name),
    photo: (r.photo as string) || undefined,
    gender: r.gender as User["gender"],
    age: r.age != null ? Number(r.age) : undefined,
    cnic: String(r.cnic),
    cnicFrontName: (r.cnic_front_name as string) || undefined,
    cnicBackName: (r.cnic_back_name as string) || undefined,
    cnicStatus: r.cnic_status as User["cnicStatus"],
    cnicRejectReason: (r.cnic_reject_reason as string) || undefined,
    role: r.role as User["role"],
    activeRole: r.active_role as User["activeRole"],
    rating: Number(r.rating),
    ratingCount: Number(r.rating_count),
    walletBalance: Number(r.wallet_balance),
    preferredVehicleKind:
      r.preferred_vehicle_kind === "bike" || r.preferred_vehicle_kind === "car"
        ? r.preferred_vehicle_kind
        : undefined,
    vehicle: normalizeVehicle(r.vehicle),
    licence: (r.licence as User["licence"]) || undefined,
    emergencyContacts: (r.emergency_contacts as User["emergencyContacts"]) || [],
    banned: Boolean(r.banned),
    darkMode: Boolean(r.dark_mode),
    notifyPush: r.notify_push != null ? Boolean(r.notify_push) : undefined,
    notifyQuietHours:
      r.notify_quiet_hours != null ? Boolean(r.notify_quiet_hours) : undefined,
    blockedUserIds: (r.blocked_user_ids as string[]) || [],
    introSeen: r.intro_seen != null ? Boolean(r.intro_seen) : true,
    referralCode: (r.referral_code as string) || undefined,
    createdAt: String(r.created_at),
  };
}

function userToRow(u: User) {
  return {
    id: u.id,
    phone: u.phone,
    name: u.name,
    photo: u.photo ?? null,
    gender: u.gender,
    age: u.age ?? null,
    cnic: u.cnic,
    cnic_front_name: u.cnicFrontName ?? null,
    cnic_back_name: u.cnicBackName ?? null,
    cnic_status: u.cnicStatus,
    cnic_reject_reason: u.cnicRejectReason ?? null,
    role: u.role,
    active_role: u.activeRole,
    rating: u.rating,
    rating_count: u.ratingCount,
    wallet_balance: u.walletBalance,
    vehicle: u.vehicle ?? null,
    licence: u.licence ?? null,
    emergency_contacts: u.emergencyContacts ?? [],
    banned: u.banned ?? false,
    dark_mode: u.darkMode ?? false,
    notify_push: u.notifyPush ?? null,
    notify_quiet_hours: u.notifyQuietHours ?? null,
    blocked_user_ids: u.blockedUserIds ?? [],
    intro_seen: u.introSeen ?? true,
    referral_code: u.referralCode ?? null,
    created_at: u.createdAt,
  };
}

function routeFromRow(r: Record<string, unknown>): RoutePost {
  return {
    id: String(r.id),
    driverId: String(r.driver_id),
    from: String(r.from),
    to: String(r.to),
    fromLat: r.from_lat != null ? Number(r.from_lat) : undefined,
    fromLng: r.from_lng != null ? Number(r.from_lng) : undefined,
    toLat: r.to_lat != null ? Number(r.to_lat) : undefined,
    toLng: r.to_lng != null ? Number(r.to_lng) : undefined,
    distanceKm: r.distance_km != null ? Number(r.distance_km) : undefined,
    durationMin: r.duration_min != null ? Number(r.duration_min) : undefined,
    direction: r.direction as RoutePost["direction"],
    time: String(r.time),
    flexMinutes: Number(r.flex_minutes),
    seatsTotal: Number(r.seats_total),
    seatsLeft: Number(r.seats_left),
    days: (r.days as RoutePost["days"]) || [],
    startDate: String(r.start_date),
    recurring: Boolean(r.recurring),
    category: r.category as RoutePost["category"],
    commuteType: r.commute_type as RoutePost["commuteType"],
    placeLabel: (r.place_label as string) || undefined,
    vehicleKind:
      r.vehicle_kind === "bike" || r.vehicle_kind === "car"
        ? r.vehicle_kind
        : "car",
    rate: Number(r.rate),
    suggestedMin: Number(r.suggested_min),
    suggestedMax: Number(r.suggested_max),
    active: Boolean(r.active),
    pausedToday: Boolean(r.paused_today),
    createdAt: String(r.created_at),
  };
}

function routeToRow(route: RoutePost) {
  return {
    id: route.id,
    driver_id: route.driverId,
    from: route.from,
    to: route.to,
    from_lat: route.fromLat ?? null,
    from_lng: route.fromLng ?? null,
    to_lat: route.toLat ?? null,
    to_lng: route.toLng ?? null,
    distance_km: route.distanceKm ?? null,
    duration_min: route.durationMin ?? null,
    direction: route.direction,
    time: route.time,
    flex_minutes: route.flexMinutes,
    seats_total: route.seatsTotal,
    seats_left: route.seatsLeft,
    days: route.days,
    start_date: route.startDate,
    recurring: route.recurring,
    category: route.category,
    commute_type: route.commuteType,
    place_label: route.placeLabel ?? null,
    vehicle_kind: route.vehicleKind ?? "car",
    rate: route.rate,
    suggested_min: route.suggestedMin,
    suggested_max: route.suggestedMax,
    active: route.active,
    paused_today: route.pausedToday ?? false,
    created_at: route.createdAt,
  };
}

function routeToRowWithoutGeo(route: RoutePost) {
  const row = routeToRow(route) as Record<string, unknown>;
  delete row.from_lat;
  delete row.from_lng;
  delete row.to_lat;
  delete row.to_lng;
  delete row.distance_km;
  delete row.duration_min;
  return row;
}

function routeToRowMinimal(route: RoutePost) {
  const row = routeToRowWithoutGeo(route) as Record<string, unknown>;
  delete row.vehicle_kind;
  return row;
}

function bookingFromRow(r: Record<string, unknown>): Booking {
  return {
    id: String(r.id),
    routeId: String(r.route_id),
    driverId: String(r.driver_id),
    passengerId: String(r.passenger_id),
    pickup: String(r.pickup),
    drop: String(r.dropoff),
    rate: Number(r.rate),
    platformFee: Number(r.platform_fee),
    status: r.status as Booking["status"],
    paymentNote: "cash",
    pickupCode: String(r.pickup_code),
    cancelReason: (r.cancel_reason as string) || undefined,
    cashReceived:
      r.cash_received === null || r.cash_received === undefined
        ? null
        : Boolean(r.cash_received),
    driverRated: r.driver_rated != null ? Boolean(r.driver_rated) : undefined,
    passengerRated:
      r.passenger_rated != null ? Boolean(r.passenger_rated) : undefined,
    createdAt: String(r.created_at),
    chatId: String(r.chat_id),
  };
}

function bookingToRow(b: Booking) {
  return {
    id: b.id,
    route_id: b.routeId,
    driver_id: b.driverId,
    passenger_id: b.passengerId,
    pickup: b.pickup,
    dropoff: b.drop,
    rate: b.rate,
    platform_fee: b.platformFee,
    status: b.status,
    payment_note: b.paymentNote,
    pickup_code: b.pickupCode,
    cancel_reason: b.cancelReason ?? null,
    cash_received: b.cashReceived ?? null,
    driver_rated: b.driverRated ?? null,
    passenger_rated: b.passengerRated ?? null,
    chat_id: b.chatId,
    created_at: b.createdAt,
  };
}

/* —— load —— */

export async function liveFetchSnapshot(): Promise<{
  users: User[];
  routes: RoutePost[];
  bookings: Booking[];
  chats: ChatThread[];
  walletTx: WalletTx[];
  sosAlerts: SosAlert[];
  complaints: Complaint[];
  settings: AppSettings;
  rateBounds: RateBounds;
} | null> {
  if (!isLiveConfigured()) return null;
  const db = sb();

  const [usersRes, routesRes, bookingsRes, msgsRes, txRes, sosRes, compRes, setRes] =
    await Promise.all([
      db.from("users").select("*"),
      db.from("routes").select("*").order("created_at", { ascending: false }),
      db.from("bookings").select("*").order("created_at", { ascending: false }),
      db.from("chat_messages").select("*").order("created_at", { ascending: true }),
      db.from("wallet_tx").select("*").order("created_at", { ascending: false }),
      db.from("sos_alerts").select("*").order("created_at", { ascending: false }),
      db.from("complaints").select("*").order("created_at", { ascending: false }),
      db.from("app_settings").select("*").eq("id", 1).maybeSingle(),
    ]);

  // Soft-fail per table so one missing/error table doesn’t crash Live mode.
  const parts: [string, { error: unknown }][] = [
    ["users", usersRes],
    ["routes", routesRes],
    ["bookings", bookingsRes],
    ["chat_messages", msgsRes],
    ["wallet_tx", txRes],
    ["sos_alerts", sosRes],
    ["complaints", compRes],
    ["app_settings", setRes],
  ];
  for (const [name, res] of parts) {
    if (res.error) logLiveError(`fetch ${name}`, res.error);
  }

  // Users are required for Live mode; everything else can be empty.
  if (usersRes.error) {
    return null;
  }

  const bookings = (bookingsRes.error ? [] : bookingsRes.data || []).map((r) =>
    bookingFromRow(r as Record<string, unknown>)
  );
  const msgs = (
    msgsRes.error ? [] : msgsRes.data || []
  ) as Record<string, unknown>[];
  const chats: ChatThread[] = bookings.map((b) => ({
    id: b.chatId,
    bookingId: b.id,
    messages: msgs
      .filter((m) => String(m.chat_id) === b.chatId)
      .map(
        (m): ChatMessage => ({
          id: String(m.id),
          senderId: String(m.sender_id),
          text: String(m.text),
          at: String(m.at),
          system: Boolean(m.system),
        })
      ),
  }));

  const settingsRow = setRes.error
    ? null
    : (setRes.data as Record<string, unknown> | null);
  const settings: AppSettings = settingsRow
    ? {
        perKm: Number(settingsRow.per_km),
        feePercent: Number(settingsRow.fee_percent),
        minRate: Number(settingsRow.min_rate),
        maxRate: Number(settingsRow.max_rate),
        signupBonus: Number(settingsRow.signup_bonus),
        minTopup: Number(settingsRow.min_topup),
      }
    : {
        perKm: 50,
        feePercent: 10,
        minRate: 50,
        maxRate: 5000,
        signupBonus: 200,
        minTopup: 200,
      };

  return {
    users: (usersRes.data || []).map((r) =>
      userFromRow(r as Record<string, unknown>)
    ),
    routes: (routesRes.error ? [] : routesRes.data || []).map((r) =>
      routeFromRow(r as Record<string, unknown>)
    ),
    bookings,
    chats,
    walletTx: (txRes.error ? [] : txRes.data || []).map((r) => ({
      id: String((r as Record<string, unknown>).id),
      userId: String((r as Record<string, unknown>).user_id),
      type: (r as Record<string, unknown>).type as WalletTx["type"],
      amount: Number((r as Record<string, unknown>).amount),
      note: String((r as Record<string, unknown>).note),
      createdAt: String((r as Record<string, unknown>).created_at),
    })),
    sosAlerts: (sosRes.error ? [] : sosRes.data || []).map((r) => ({
      id: String((r as Record<string, unknown>).id),
      userId: String((r as Record<string, unknown>).user_id),
      bookingId:
        ((r as Record<string, unknown>).booking_id as string) || undefined,
      at: String((r as Record<string, unknown>).at),
      location: String((r as Record<string, unknown>).location),
      status: (r as Record<string, unknown>).status as SosAlert["status"],
    })),
    complaints: (compRes.error ? [] : compRes.data || []).map((r) => ({
      id: String((r as Record<string, unknown>).id),
      fromUserId: String((r as Record<string, unknown>).from_user_id),
      againstUserId: String((r as Record<string, unknown>).against_user_id),
      bookingId:
        ((r as Record<string, unknown>).booking_id as string) || undefined,
      text: String((r as Record<string, unknown>).text),
      status: (r as Record<string, unknown>).status as Complaint["status"],
      adminNote:
        ((r as Record<string, unknown>).admin_note as string) || undefined,
      createdAt: String((r as Record<string, unknown>).created_at),
    })),
    settings,
    rateBounds: { minRate: settings.minRate, maxRate: settings.maxRate },
  };
}

/* —— upserts —— */

export async function liveUpsertUser(u: User) {
  if (!isLiveConfigured()) return;
  const { error } = await sb().from("users").upsert(userToRow(u));
  if (error) logLiveError("upsert user", error);
}

export async function liveUpsertRoute(route: RoutePost) {
  if (!isLiveConfigured()) return;
  const client = sb();

  function buildRow(): Record<string, unknown> {
    const geo = geoColumnsKnown();
    const kind = kindColumnKnown();
    if (geo === false && kind === false) {
      return routeToRowMinimal(route) as Record<string, unknown>;
    }
    if (geo === false) {
      return routeToRowWithoutGeo(route) as Record<string, unknown>;
    }
    if (kind === false) {
      const row = routeToRow(route) as Record<string, unknown>;
      delete row.vehicle_kind;
      return row;
    }
    return routeToRow(route) as Record<string, unknown>;
  }

  let row = buildRow();
  for (let attempt = 0; attempt < 4; attempt++) {
    const { error } = await client.from("routes").upsert(row);
    if (!error) {
      if (row.from_lat !== undefined) setGeoColumnsOk(true);
      if (row.vehicle_kind !== undefined) setKindColumnOk(true);
      return;
    }

    if (!isMissingColumnError(error)) {
      logLiveError("upsert route", error);
      return;
    }

    const col = missingColumnName(error);
    logSchemaGap("upsert route — schema gap", error);

    if (
      col === "from_lat" ||
      col === "from_lng" ||
      col === "to_lat" ||
      col === "to_lng" ||
      col === "distance_km" ||
      col === "duration_min"
    ) {
      setGeoColumnsOk(false);
      row = routeToRowWithoutGeo(route) as Record<string, unknown>;
      if (kindColumnKnown() === false) delete row.vehicle_kind;
      continue;
    }

    if (col === "vehicle_kind") {
      setKindColumnOk(false);
      delete row.vehicle_kind;
      continue;
    }

    // Unknown missing column — strip geo + kind and retry once
    setGeoColumnsOk(false);
    setKindColumnOk(false);
    row = routeToRowMinimal(route) as Record<string, unknown>;
  }
}

export async function liveUpsertBooking(b: Booking) {
  if (!isLiveConfigured()) return;
  const { error } = await sb().from("bookings").upsert(bookingToRow(b));
  if (error) logLiveError("upsert booking", error);
}

export async function liveInsertChatMessage(
  bookingId: string,
  chatId: string,
  m: ChatMessage
) {
  if (!isLiveConfigured()) return;
  const { error } = await sb().from("chat_messages").upsert({
    id: m.id,
    chat_id: chatId,
    booking_id: bookingId,
    sender_id: m.senderId,
    text: m.text,
    at: m.at,
    system: m.system ?? false,
  });
  if (error) logLiveError("insert chat", error);
}

export async function liveUpsertWalletTx(tx: WalletTx) {
  if (!isLiveConfigured()) return;
  const { error } = await sb().from("wallet_tx").upsert({
    id: tx.id,
    user_id: tx.userId,
    type: tx.type,
    amount: tx.amount,
    note: tx.note,
    created_at: tx.createdAt,
  });
  if (error) logLiveError("wallet tx", error);
}

export async function liveUpsertSos(a: SosAlert) {
  if (!isLiveConfigured()) return;
  const { error } = await sb().from("sos_alerts").upsert({
    id: a.id,
    user_id: a.userId,
    booking_id: a.bookingId ?? null,
    at: a.at,
    location: a.location,
    status: a.status,
  });
  if (error) logLiveError("sos", error);
}

export async function liveUpsertComplaint(c: Complaint) {
  if (!isLiveConfigured()) return;
  const { error } = await sb().from("complaints").upsert({
    id: c.id,
    from_user_id: c.fromUserId,
    against_user_id: c.againstUserId,
    booking_id: c.bookingId ?? null,
    text: c.text,
    status: c.status,
    admin_note: c.adminNote ?? null,
    created_at: c.createdAt,
  });
  if (error) logLiveError("complaint", error);
}

export async function liveUpsertSettings(s: AppSettings) {
  if (!isLiveConfigured()) return;
  const { error } = await sb().from("app_settings").upsert({
    id: 1,
    per_km: s.perKm,
    fee_percent: s.feePercent,
    min_rate: s.minRate,
    max_rate: s.maxRate,
    signup_bonus: s.signupBonus,
    min_topup: s.minTopup,
  });
  if (error) logLiveError("settings", error);
}

export async function liveSeedAll(users: User[], routes: RoutePost[]) {
  if (!isLiveConfigured()) throw new Error("Supabase env not set");
  const db = sb();
  const { error: uErr } = await db.from("users").upsert(users.map(userToRow));
  if (uErr) throw uErr;
  const { error: rErr } = await db.from("routes").upsert(routes.map(routeToRow));
  if (rErr) throw rErr;
}

/** Subscribe to routes/bookings changes; returns unsubscribe */
export function liveSubscribe(onChange: () => void) {
  if (!isLiveConfigured()) return () => {};
  const db = sb();
  const channel = db
    .channel("humsafar-live")
    .on(
      "postgres_changes",
      { event: "*", schema: "public", table: "routes" },
      () => onChange()
    )
    .on(
      "postgres_changes",
      { event: "*", schema: "public", table: "bookings" },
      () => onChange()
    )
    .on(
      "postgres_changes",
      { event: "*", schema: "public", table: "chat_messages" },
      () => onChange()
    )
    .subscribe();
  return () => {
    void db.removeChannel(channel);
  };
}
