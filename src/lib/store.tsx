"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { pickupCode, platformFee, suggestRate } from "./pricing";
import {
  ADMIN_PHONE,
  DEMO_OTP,
  defaultState,
  isValidCnic,
  isValidPkPhone,
  normalizeCnic,
  normalizePkPhone,
  uid,
} from "./seed";
import type {
  ActiveRole,
  AppState,
  Booking,
  CommuteType,
  Gender,
  Locale,
  RideCategory,
  RoutePost,
  User,
  UserRole,
  Vehicle,
  VerifyStatus,
  Weekday,
} from "./types";
import { commuteMeta } from "./commute-types";

const STORAGE_KEY = "humsafar-auth-v2";

type Store = AppState & {
  hydrated: boolean;
  me: User | null;
  setLocale: (l: Locale) => void;
  setIntroDone: () => void;
  setPendingRole: (role: UserRole | null) => void;
  setActiveRole: (role: ActiveRole) => void;
  requestOtp: (
    phone: string,
    opts: { intent: "signin" | "signup"; cnic: string }
  ) => { ok: boolean; error?: string };
  verifyOtp: (otp: string) => {
    ok: boolean;
    needsProfile: boolean;
    error?: string;
  };
  completeProfile: (data: {
    name: string;
    gender: Gender;
    age: number;
    cnic: string;
    photo?: string;
    role: UserRole;
    emergencyPhone?: string;
  }) => { ok: boolean; error?: string };
  saveVehicle: (
    vehicle: Vehicle,
    licenceFileName: string,
    licenceExpiry: string
  ) => void;
  postRoute: (input: {
    from: string;
    to: string;
    direction: RoutePost["direction"];
    time: string;
    seats: number;
    days: Weekday[];
    category: RideCategory;
    commuteType: CommuteType;
    placeLabel?: string;
    rate: number;
    recurring?: boolean;
  }) => { ok: boolean; error?: string };
  pauseRouteToday: (routeId: string) => void;
  removeRoute: (routeId: string) => void;
  searchRoutes: (
    from: string,
    to: string,
    opts?: {
      category?: RideCategory | "all";
      commuteType?: CommuteType | "all";
    }
  ) => RoutePost[];
  requestBooking: (
    routeId: string,
    pickup: string,
    drop: string
  ) => { ok: boolean; id?: string; error?: string };
  cancelBooking: (bookingId: string, reason: string) => void;
  respondBooking: (bookingId: string, accept: boolean) => { ok: boolean; error?: string };
  markArrived: (bookingId: string) => void;
  completeRide: (bookingId: string, cashReceived: boolean) => void;
  topUpWallet: (
    amount: number,
    method: string
  ) => { ok: boolean; error?: string };
  adjustWallet: (userId: string, amount: number, note: string) => void;
  sendChat: (chatId: string, text: string) => { ok: boolean; warn?: string };
  rateUser: (bookingId: string, userId: string, stars: number) => void;
  setCnicStatus: (
    userId: string,
    status: VerifyStatus,
    reason?: string
  ) => void;
  banUser: (userId: string) => void;
  unblockUser: (userId: string) => void;
  addComplaint: (
    againstUserId: string,
    text: string,
    bookingId?: string
  ) => void;
  resolveComplaint: (
    id: string,
    status: "resolved" | "in_progress" | "banned",
    note?: string
  ) => void;
  setSettings: (patch: Partial<AppState["settings"]>) => void;
  createMatchAlert: (
    from: string,
    to: string,
    time: string,
    category: RideCategory,
    commuteType?: CommuteType
  ) => void;
  savePlace: (label: string, value: string) => void;
  logout: () => void;
  triggerSos: (bookingId?: string) => string;
  shareLocation: (bookingId: string) => void;
  setAdminStepOk: (ok: boolean) => void;
  updateMe: (patch: Partial<User>) => void;
  blockUser: (userId: string) => void;
};

const Ctx = createContext<Store | null>(null);

function load(): AppState {
  if (typeof window === "undefined") return defaultState();
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultState();
    return { ...defaultState(), ...JSON.parse(raw) } as AppState;
  } catch {
    return defaultState();
  }
}

function canDrive(role: UserRole) {
  return role === "driver" || role === "both" || role === "admin";
}
function canRide(role: UserRole) {
  return role === "passenger" || role === "both" || role === "admin";
}

export function HumSafarProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AppState>(defaultState);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setState(load());
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state, hydrated]);

  const me = useMemo(
    () => state.users.find((u) => u.id === state.sessionUserId) ?? null,
    [state.users, state.sessionUserId]
  );

  const setLocale = useCallback((locale: Locale) => {
    setState((s) => ({ ...s, locale }));
  }, []);

  const setIntroDone = useCallback(() => {
    setState((s) => ({ ...s, introDone: true }));
  }, []);

  const setPendingRole = useCallback((role: UserRole | null) => {
    setState((s) => ({ ...s, pendingRole: role }));
  }, []);

  const setActiveRole = useCallback(
    (role: ActiveRole) => {
      if (!me) return;
      setState((s) => ({
        ...s,
        users: s.users.map((u) =>
          u.id === me.id ? { ...u, activeRole: role } : u
        ),
      }));
    },
    [me]
  );

  const requestOtp = useCallback(
    (phone: string, opts: { intent: "signin" | "signup"; cnic: string }) => {
      if (!isValidPkPhone(phone)) {
        return { ok: false, error: "invalidPhone" };
      }
      if (!isValidCnic(opts.cnic)) {
        return { ok: false, error: "invalidCnic" };
      }
      const cleaned = normalizePkPhone(phone);
      const cnicDigits = normalizeCnic(opts.cnic);
      const now = Date.now();
      if (state.otp.lockedUntil && state.otp.lockedUntil > now) {
        return { ok: false, error: "otpLocked" };
      }

      const byPhone = state.users.find((u) => u.phone === cleaned);
      const byCnic = state.users.find(
        (u) => normalizeCnic(u.cnic) === cnicDigits
      );

      if (opts.intent === "signup") {
        if (byPhone) return { ok: false, error: "phoneExists" };
        if (byCnic) return { ok: false, error: "cnicExists" };
      } else {
        if (!byPhone) return { ok: false, error: "noAccount" };
        if (byPhone.banned) return { ok: false, error: "banned" };
        if (normalizeCnic(byPhone.cnic) !== cnicDigits) {
          return { ok: false, error: "cnicMismatch" };
        }
      }

      setState((s) => ({
        ...s,
        pendingPhone: cleaned,
        pendingCnic: cnicDigits,
        authIntent: opts.intent,
        otp: {
          phone: cleaned,
          attempts: 0,
          lockedUntil: null,
          expiresAt: now + 5 * 60 * 1000,
          sentAt: now,
        },
      }));
      return { ok: true };
    },
    [state.otp.lockedUntil, state.users]
  );

  const verifyOtp = useCallback(
    (otp: string) => {
      const now = Date.now();
      if (state.otp.lockedUntil && state.otp.lockedUntil > now) {
        return { ok: false, needsProfile: false, error: "otpLocked" };
      }
      if (!state.pendingPhone || !state.otp.expiresAt) {
        return { ok: false, needsProfile: false, error: "otpExpired" };
      }
      if (state.otp.expiresAt < now) {
        return { ok: false, needsProfile: false, error: "otpExpired" };
      }
      if (otp !== DEMO_OTP) {
        const attempts = state.otp.attempts + 1;
        const locked = attempts >= 5;
        setState((s) => ({
          ...s,
          otp: {
            ...s.otp,
            attempts,
            lockedUntil: locked ? now + 15 * 60 * 1000 : null,
          },
        }));
        return {
          ok: false,
          needsProfile: false,
          error: locked ? "otpLocked" : "badOtp",
        };
      }
      const phone = state.pendingPhone;
      const existing = state.users.find((u) => u.phone === phone);
      if (existing) {
        if (existing.banned)
          return { ok: false, needsProfile: false, error: "banned" };
        setState((s) => ({
          ...s,
          sessionUserId: existing.id,
          pendingPhone: null,
          pendingCnic: null,
          authIntent: null,
          otp: { ...s.otp, phone: null, attempts: 0 },
          adminStepOk: existing.role === "admin" ? false : s.adminStepOk,
        }));
        return { ok: true, needsProfile: false };
      }
      // New account — keep pendingPhone + pendingCnic for join/profile
      return { ok: true, needsProfile: true };
    },
    [state.pendingPhone, state.otp, state.users]
  );

  const completeProfile = useCallback(
    (data: {
      name: string;
      gender: Gender;
      age: number;
      cnic: string;
      photo?: string;
      role: UserRole;
      emergencyPhone?: string;
    }) => {
      const phone = state.pendingPhone;
      if (!phone) return { ok: false, error: "No phone" };
      const cnicDigits = normalizeCnic(
        state.pendingCnic || data.cnic
      );
      if (!isValidCnic(cnicDigits))
        return { ok: false, error: "CNIC must be 13 digits" };
      if (data.age < 18) return { ok: false, error: "Must be 18+" };
      if (state.users.some((u) => normalizeCnic(u.cnic) === cnicDigits))
        return { ok: false, error: "CNIC already used" };
      if (
        data.emergencyPhone &&
        normalizePkPhone(data.emergencyPhone) === phone
      )
        return { ok: false, error: "Emergency contact cannot be your number" };

      const role: UserRole =
        phone === ADMIN_PHONE
          ? "admin"
          : data.role === "admin"
            ? "passenger"
            : data.role;
      const activeRole: ActiveRole =
        role === "driver" || role === "both" ? "driver" : "passenger";
      const bonus =
        canDrive(role) && role !== "admin" ? state.settings.signupBonus : 0;
      const user: User = {
        id: uid("usr"),
        phone,
        name: data.name.trim(),
        photo: data.photo,
        gender: data.gender,
        age: data.age,
        cnic: cnicDigits,
        cnicStatus: role === "admin" ? "approved" : "pending",
        role,
        activeRole,
        rating: 5,
        ratingCount: 0,
        walletBalance: bonus,
        emergencyContacts: data.emergencyPhone
          ? [
              {
                name: "Emergency",
                phone: normalizePkPhone(data.emergencyPhone),
              },
            ]
          : [],
        blockedUserIds: [],
        introSeen: true,
        createdAt: new Date().toISOString(),
      };
      setState((s) => ({
        ...s,
        users: [...s.users, user],
        sessionUserId: user.id,
        pendingPhone: null,
        pendingCnic: null,
        authIntent: null,
        pendingRole: null,
        walletTx:
          bonus > 0
            ? [
                {
                  id: uid("tx"),
                  userId: user.id,
                  type: "bonus",
                  amount: bonus,
                  note: "Signup bonus",
                  createdAt: new Date().toISOString(),
                },
                ...s.walletTx,
              ]
            : s.walletTx,
      }));
      return { ok: true };
    },
    [
      state.pendingPhone,
      state.pendingCnic,
      state.users,
      state.settings.signupBonus,
    ]
  );

  const saveVehicle = useCallback(
    (vehicle: Vehicle, licenceFileName: string, licenceExpiry: string) => {
      if (!me) return;
      if (new Date(licenceExpiry) < new Date()) return;
      if (
        state.users.some(
          (u) =>
            u.id !== me.id &&
            u.vehicle?.plate.toLowerCase() === vehicle.plate.toLowerCase()
        )
      )
        return;
      setState((s) => ({
        ...s,
        users: s.users.map((u) =>
          u.id === me.id
            ? {
                ...u,
                vehicle: {
                  ...vehicle,
                  seats: Math.min(4, Math.max(1, vehicle.seats)),
                },
                licence: { fileName: licenceFileName, expiry: licenceExpiry },
                role: u.role === "passenger" ? "both" : u.role,
                activeRole: "driver",
              }
            : u
        ),
      }));
    },
    [me, state.users]
  );

  const postRoute = useCallback(
    (input: {
      from: string;
      to: string;
      direction: RoutePost["direction"];
      time: string;
      seats: number;
      days: Weekday[];
      category: RideCategory;
      commuteType: CommuteType;
      placeLabel?: string;
      rate: number;
      recurring?: boolean;
    }) => {
      if (!me || !canDrive(me.role))
        return { ok: false, error: "Car owners only" };
      if (me.cnicStatus !== "approved")
        return { ok: false, error: "CNIC not approved yet" };
      if (!me.vehicle) return { ok: false, error: "Add vehicle first" };
      if (me.licence && new Date(me.licence.expiry) < new Date())
        return { ok: false, error: "Licence expired" };
      if (input.from.trim().toLowerCase() === input.to.trim().toLowerCase())
        return { ok: false, error: "Pickup and drop cannot be same" };
      if (input.seats > me.vehicle.seats)
        return { ok: false, error: "Seats exceed vehicle" };
      const meta = commuteMeta(input.commuteType);
      const genderCat: RideCategory =
        input.commuteType === "women" || meta.womenOnly
          ? "women"
          : input.category;
      if (genderCat === "women" && me.gender !== "female") {
        return { ok: false, error: "Women-only needs a woman car owner" };
      }
      const { min, max } = suggestRate(
        input.from,
        input.to,
        {
          minRate: state.settings.minRate,
          maxRate: state.settings.maxRate,
        },
        state.settings.perKm,
        input.seats
      );
      if (
        input.rate < state.settings.minRate ||
        input.rate > state.settings.maxRate
      ) {
        return {
          ok: false,
          error: `Rate must be Rs ${state.settings.minRate}–${state.settings.maxRate}`,
        };
      }
      const route: RoutePost = {
        id: uid("rt"),
        driverId: me.id,
        from: input.from.trim(),
        to: input.to.trim(),
        direction: input.direction,
        time: input.time,
        flexMinutes: 10,
        seatsTotal: input.seats,
        seatsLeft: input.seats,
        days: input.days,
        startDate: new Date().toISOString().slice(0, 10),
        recurring: input.recurring ?? meta.recurringDefault,
        category: genderCat,
        commuteType: input.commuteType,
        placeLabel: input.placeLabel?.trim() || undefined,
        rate: input.rate,
        suggestedMin: min,
        suggestedMax: max,
        active: true,
        createdAt: new Date().toISOString(),
      };
      setState((s) => ({ ...s, routes: [route, ...s.routes] }));
      return { ok: true };
    },
    [me, state.settings]
  );

  const pauseRouteToday = useCallback((routeId: string) => {
    setState((s) => ({
      ...s,
      routes: s.routes.map((r) =>
        r.id === routeId ? { ...r, pausedToday: true, active: false } : r
      ),
    }));
  }, []);

  const removeRoute = useCallback((routeId: string) => {
    setState((s) => ({
      ...s,
      routes: s.routes.map((r) =>
        r.id === routeId ? { ...r, active: false } : r
      ),
    }));
  }, []);

  const searchRoutes = useCallback(
    (
      from: string,
      to: string,
      opts?: {
        category?: RideCategory | "all";
        commuteType?: CommuteType | "all";
      }
    ) => {
      const category = opts?.category ?? "all";
      const commuteType = opts?.commuteType ?? "all";
      const f = from.trim().toLowerCase();
      const t = to.trim().toLowerCase();
      return state.routes.filter((r) => {
        if (!r.active || r.seatsLeft < 1 || r.pausedToday) return false;
        const driver = state.users.find((u) => u.id === r.driverId);
        if (!driver || driver.banned || driver.cnicStatus !== "approved")
          return false;
        if (commuteType !== "all" && r.commuteType !== commuteType) return false;
        if (category !== "all" && r.category !== category) return false;
        if (
          (category === "women" || r.commuteType === "women") &&
          (driver.gender !== "female" || driver.cnicStatus !== "approved")
        )
          return false;
        if (me && canRide(me.role) && me.gender === "female" && r.category === "men")
          return false;
        if (me && canRide(me.role) && me.gender === "male" && r.category === "women")
          return false;
        if (me && canRide(me.role) && me.gender === "male" && r.commuteType === "women")
          return false;
        const fromOk = !f || r.from.toLowerCase().includes(f);
        const toOk = !t || r.to.toLowerCase().includes(t);
        return fromOk && toOk;
      });
    },
    [state.routes, state.users, me]
  );

  const requestBooking = useCallback(
    (routeId: string, pickup: string, drop: string) => {
      if (!me || !canRide(me.role))
        return { ok: false, error: "Riders only" };
      if (me.cnicStatus !== "approved")
        return { ok: false, error: "Verification pending" };
      const route = state.routes.find((r) => r.id === routeId);
      if (!route || route.seatsLeft < 1)
        return { ok: false, error: "No seats left" };
      const clash = state.bookings.some(
        (b) =>
          b.passengerId === me.id &&
          (b.status === "requested" ||
            b.status === "accepted" ||
            b.status === "ongoing")
      );
      if (clash) return { ok: false, error: "You already have an active ride" };
      const fee = platformFee(route.rate, state.settings.feePercent);
      const chatId = uid("chat");
      const booking: Booking = {
        id: uid("bk"),
        routeId,
        driverId: route.driverId,
        passengerId: me.id,
        pickup: pickup.trim() || route.from,
        drop: drop.trim() || route.to,
        rate: route.rate,
        platformFee: fee,
        status: "requested",
        paymentNote: "cash",
        pickupCode: pickupCode(),
        createdAt: new Date().toISOString(),
        chatId,
      };
      setState((s) => ({
        ...s,
        bookings: [booking, ...s.bookings],
        chats: [
          {
            id: chatId,
            bookingId: booking.id,
            messages: [
              {
                id: uid("m"),
                senderId: "system",
                text: "Chat started. Phone numbers stay hidden.",
                at: new Date().toLocaleTimeString(),
                system: true,
              },
            ],
          },
          ...s.chats,
        ],
      }));
      return { ok: true, id: booking.id };
    },
    [me, state.routes, state.bookings, state.settings.feePercent]
  );

  const cancelBooking = useCallback(
    (bookingId: string, reason: string) => {
      setState((s) => ({
        ...s,
        bookings: s.bookings.map((b) =>
          b.id === bookingId && b.status === "requested"
            ? { ...b, status: "cancelled", cancelReason: reason }
            : b
        ),
      }));
    },
    []
  );

  const respondBooking = useCallback(
    (bookingId: string, accept: boolean) => {
      let result: { ok: boolean; error?: string } = { ok: true };
      setState((s) => {
        const booking = s.bookings.find((b) => b.id === bookingId);
        if (!booking || booking.status !== "requested") {
          result = { ok: false, error: "Request expired" };
          return s;
        }
        if (accept) {
          const route = s.routes.find((r) => r.id === booking.routeId);
          if (!route || route.seatsLeft < 1) {
            result = { ok: false, error: "No seats" };
            return s;
          }
          return {
            ...s,
            routes: s.routes.map((r) =>
              r.id === booking.routeId
                ? { ...r, seatsLeft: r.seatsLeft - 1 }
                : r
            ),
            bookings: s.bookings.map((b) =>
              b.id === bookingId ? { ...b, status: "accepted" as const } : b
            ),
            chats: s.chats.map((c) =>
              c.id === booking.chatId
                ? {
                    ...c,
                    messages: [
                      ...c.messages,
                      {
                        id: uid("m"),
                        senderId: "system",
                        text: "Seat confirmed. Pay the car owner in cash — they keep the full seat price.",
                        at: new Date().toLocaleTimeString(),
                        system: true,
                      },
                    ],
                  }
                : c
            ),
          };
        }
        return {
          ...s,
          bookings: s.bookings.map((b) =>
            b.id === bookingId ? { ...b, status: "rejected" as const } : b
          ),
        };
      });
      return result;
    },
    []
  );

  const markArrived = useCallback((bookingId: string) => {
    setState((s) => ({
      ...s,
      bookings: s.bookings.map((b) =>
        b.id === bookingId && b.status === "accepted"
          ? { ...b, status: "ongoing" }
          : b
      ),
    }));
  }, []);

  const completeRide = useCallback(
    (bookingId: string, cashReceived: boolean) => {
      setState((s) => {
        const booking = s.bookings.find((b) => b.id === bookingId);
        if (
          !booking ||
          (booking.status !== "accepted" && booking.status !== "ongoing")
        )
          return s;
        const fee = booking.platformFee;
        // Passenger booking-fee model: owner keeps full seat rate; fee is HumSafar's cut from rider.
        const next: AppState = {
          ...s,
          bookings: s.bookings.map((b) =>
            b.id === bookingId
              ? {
                  ...b,
                  status: "completed",
                  cashReceived,
                }
              : b
          ),
          walletTx: [
            {
              id: uid("tx"),
              userId: booking.passengerId,
              type: "fee",
              amount: -fee,
              note: `HumSafar booking fee — ${booking.id}`,
              createdAt: new Date().toISOString(),
            },
            ...s.walletTx,
          ],
          chats: s.chats.map((c) =>
            c.id === booking.chatId
              ? {
                  ...c,
                  closedAt: new Date(
                    Date.now() + 24 * 60 * 60 * 1000
                  ).toISOString(),
                  messages: [
                    ...c.messages,
                    {
                      id: uid("m"),
                      senderId: "system",
                      text: cashReceived
                        ? `Ride done. Owner gets Rs ${booking.rate} cash. HumSafar fee Rs ${fee} (rider).`
                        : "Cash not received — complaint opened.",
                      at: new Date().toLocaleTimeString(),
                      system: true,
                    },
                  ],
                }
              : c
          ),
          complaints: cashReceived
            ? s.complaints
            : [
                {
                  id: uid("cmp"),
                  fromUserId: booking.driverId,
                  againstUserId: booking.passengerId,
                  bookingId,
                  text: "Cash not received",
                  status: "open",
                  createdAt: new Date().toISOString(),
                },
                ...s.complaints,
              ],
        };
        return next;
      });
    },
    []
  );

  const topUpWallet = useCallback(
    (amount: number, method: string) => {
      if (!me) return { ok: false, error: "Login required" };
      if (amount < state.settings.minTopup)
        return { ok: false, error: `Min Rs ${state.settings.minTopup}` };
      setState((s) => ({
        ...s,
        users: s.users.map((u) =>
          u.id === me.id
            ? { ...u, walletBalance: u.walletBalance + amount }
            : u
        ),
        walletTx: [
          {
            id: uid("tx"),
            userId: me.id,
            type: "topup",
            amount,
            note: `${method} top-up`,
            createdAt: new Date().toISOString(),
          },
          ...s.walletTx,
        ],
      }));
      return { ok: true };
    },
    [me, state.settings.minTopup]
  );

  const adjustWallet = useCallback(
    (userId: string, amount: number, note: string) => {
      setState((s) => ({
        ...s,
        users: s.users.map((u) =>
          u.id === userId
            ? { ...u, walletBalance: Math.max(0, u.walletBalance + amount) }
            : u
        ),
        walletTx: [
          {
            id: uid("tx"),
            userId,
            type: "adjustment",
            amount,
            note: note || "Admin adjustment",
            createdAt: new Date().toISOString(),
          },
          ...s.walletTx,
        ],
      }));
    },
    []
  );

  const sendChat = useCallback(
    (chatId: string, text: string) => {
      if (!me || !text.trim()) return { ok: false };
      const phoneLike = /\b03\d{9}\b|\+\s*92/.test(text);
      setState((s) => ({
        ...s,
        chats: s.chats.map((c) =>
          c.id !== chatId
            ? c
            : {
                ...c,
                messages: [
                  ...c.messages,
                  {
                    id: uid("m"),
                    senderId: me.id,
                    text: text.trim(),
                    at: new Date().toLocaleTimeString(),
                  },
                ],
              }
        ),
      }));
      return { ok: true, warn: phoneLike ? "phoneWarn" : undefined };
    },
    [me]
  );

  const rateUser = useCallback(
    (bookingId: string, userId: string, stars: number) => {
      setState((s) => {
        const booking = s.bookings.find((b) => b.id === bookingId);
        if (!booking) return s;
        const iAmDriver = me?.id === booking.driverId;
        return {
          ...s,
          bookings: s.bookings.map((b) =>
            b.id === bookingId
              ? {
                  ...b,
                  driverRated: iAmDriver ? true : b.driverRated,
                  passengerRated: !iAmDriver ? true : b.passengerRated,
                }
              : b
          ),
          users: s.users.map((u) => {
            if (u.id !== userId) return u;
            const ratingCount = u.ratingCount + 1;
            const rating =
              Math.round(
                ((u.rating * u.ratingCount + stars) / ratingCount) * 10
              ) / 10;
            return { ...u, rating, ratingCount };
          }),
        };
      });
    },
    [me]
  );

  const setCnicStatus = useCallback(
    (userId: string, status: VerifyStatus, reason?: string) => {
      setState((s) => ({
        ...s,
        users: s.users.map((u) =>
          u.id === userId
            ? {
                ...u,
                cnicStatus: status,
                cnicRejectReason: status === "rejected" ? reason : undefined,
              }
            : u
        ),
      }));
    },
    []
  );

  const banUser = useCallback((userId: string) => {
    setState((s) => ({
      ...s,
      users: s.users.map((u) =>
        u.id === userId ? { ...u, banned: true } : u
      ),
      sessionUserId: s.sessionUserId === userId ? null : s.sessionUserId,
    }));
  }, []);

  const unblockUser = useCallback((userId: string) => {
    setState((s) => ({
      ...s,
      users: s.users.map((u) =>
        u.id === userId ? { ...u, banned: false } : u
      ),
    }));
  }, []);

  const addComplaint = useCallback(
    (againstUserId: string, text: string, bookingId?: string) => {
      if (!me) return;
      setState((s) => ({
        ...s,
        complaints: [
          {
            id: uid("cmp"),
            fromUserId: me.id,
            againstUserId,
            bookingId,
            text,
            status: "open",
            createdAt: new Date().toISOString(),
          },
          ...s.complaints,
        ],
      }));
    },
    [me]
  );

  const resolveComplaint = useCallback(
    (
      id: string,
      status: "resolved" | "in_progress" | "banned",
      note?: string
    ) => {
      setState((s) => {
        const c = s.complaints.find((x) => x.id === id);
        if (!c) return s;
        return {
          ...s,
          complaints: s.complaints.map((x) =>
            x.id === id ? { ...x, status, adminNote: note } : x
          ),
          users:
            status === "banned"
              ? s.users.map((u) =>
                  u.id === c.againstUserId ? { ...u, banned: true } : u
                )
              : s.users,
        };
      });
    },
    []
  );

  const setSettings = useCallback((patch: Partial<AppState["settings"]>) => {
    setState((s) => ({
      ...s,
      settings: { ...s.settings, ...patch },
      rateBounds: {
        minRate: patch.minRate ?? s.settings.minRate,
        maxRate: patch.maxRate ?? s.settings.maxRate,
      },
    }));
  }, []);

  const createMatchAlert = useCallback(
    (
      from: string,
      to: string,
      time: string,
      category: RideCategory,
      commuteType?: CommuteType
    ) => {
      if (!me) return;
      setState((s) => ({
        ...s,
        matchAlerts: [
          {
            id: uid("al"),
            passengerId: me.id,
            from,
            to,
            time,
            category,
            commuteType,
            createdAt: new Date().toISOString(),
          },
          ...s.matchAlerts,
        ],
      }));
    },
    [me]
  );

  const savePlace = useCallback(
    (label: string, value: string) => {
      if (!me) return;
      setState((s) => {
        const prev = s.savedPlaces[me.id] || [];
        const next = [
          { label, value },
          ...prev.filter((p) => p.label !== label),
        ].slice(0, 4);
        return {
          ...s,
          savedPlaces: { ...s.savedPlaces, [me.id]: next },
        };
      });
    },
    [me]
  );

  const logout = useCallback(() => {
    setState((s) => ({
      ...s,
      sessionUserId: null,
      pendingPhone: null,
      pendingCnic: null,
      authIntent: null,
      pendingRole: null,
      adminStepOk: false,
    }));
  }, []);

  const triggerSos = useCallback(
    (bookingId?: string) => {
      const msg = "SOS sent — emergency contacts + admin notified (demo)";
      const alert = {
        id: uid("sos"),
        userId: me?.id || "unknown",
        bookingId,
        at: new Date().toISOString(),
        location: "31.5204° N, 74.3587° E (demo)",
        status: "live" as const,
      };
      setState((s) => {
        const booking = bookingId
          ? s.bookings.find((b) => b.id === bookingId)
          : undefined;
        return {
          ...s,
          sosAlerts: [alert, ...s.sosAlerts],
          chats: booking
            ? s.chats.map((c) =>
                c.id === booking.chatId
                  ? {
                      ...c,
                      messages: [
                        ...c.messages,
                        {
                          id: uid("m"),
                          senderId: "system",
                          text: msg,
                          at: new Date().toLocaleTimeString(),
                          system: true,
                        },
                      ],
                    }
                  : c
              )
            : s.chats,
        };
      });
      return msg;
    },
    [me]
  );

  const shareLocation = useCallback(
    (bookingId: string) => {
      const booking = state.bookings.find((b) => b.id === bookingId);
      if (!booking || !me) return;
      setState((s) => ({
        ...s,
        bookings: s.bookings.map((b) =>
          b.id === bookingId && b.status === "accepted"
            ? { ...b, status: "ongoing" as const }
            : b
        ),
        chats: s.chats.map((c) =>
          c.id === booking.chatId
            ? {
                ...c,
                messages: [
                  ...c.messages,
                  {
                    id: uid("m"),
                    senderId: me.id,
                    text: "Live location: 31.5204° N, 74.3587° E",
                    at: new Date().toLocaleTimeString(),
                  },
                ],
              }
            : c
        ),
      }));
    },
    [state.bookings, me]
  );

  const setAdminStepOk = useCallback((ok: boolean) => {
    setState((s) => ({ ...s, adminStepOk: ok }));
  }, []);

  const updateMe = useCallback(
    (patch: Partial<User>) => {
      if (!me) return;
      setState((s) => ({
        ...s,
        users: s.users.map((u) => (u.id === me.id ? { ...u, ...patch } : u)),
      }));
    },
    [me]
  );

  const blockUser = useCallback(
    (userId: string) => {
      if (!me) return;
      setState((s) => ({
        ...s,
        users: s.users.map((u) =>
          u.id === me.id
            ? {
                ...u,
                blockedUserIds: Array.from(
                  new Set([...u.blockedUserIds, userId])
                ),
              }
            : u
        ),
      }));
    },
    [me]
  );

  const value = useMemo<Store>(
    () => ({
      ...state,
      hydrated,
      me,
      setLocale,
      setIntroDone,
      setPendingRole,
      setActiveRole,
      requestOtp,
      verifyOtp,
      completeProfile,
      saveVehicle,
      postRoute,
      pauseRouteToday,
      removeRoute,
      searchRoutes,
      requestBooking,
      cancelBooking,
      respondBooking,
      markArrived,
      completeRide,
      topUpWallet,
      adjustWallet,
      sendChat,
      rateUser,
      setCnicStatus,
      banUser,
      unblockUser,
      addComplaint,
      resolveComplaint,
      setSettings,
      createMatchAlert,
      savePlace,
      logout,
      triggerSos,
      shareLocation,
      setAdminStepOk,
      updateMe,
      blockUser,
    }),
    [
      state,
      hydrated,
      me,
      setLocale,
      setIntroDone,
      setPendingRole,
      setActiveRole,
      requestOtp,
      verifyOtp,
      completeProfile,
      saveVehicle,
      postRoute,
      pauseRouteToday,
      removeRoute,
      searchRoutes,
      requestBooking,
      cancelBooking,
      respondBooking,
      markArrived,
      completeRide,
      topUpWallet,
      adjustWallet,
      sendChat,
      rateUser,
      setCnicStatus,
      banUser,
      unblockUser,
      addComplaint,
      resolveComplaint,
      setSettings,
      createMatchAlert,
      savePlace,
      logout,
      triggerSos,
      shareLocation,
      setAdminStepOk,
      updateMe,
      blockUser,
    ]
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useHumSafar() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useHumSafar outside provider");
  return ctx;
}

export function useUser(id: string | undefined) {
  const { users } = useHumSafar();
  return users.find((u) => u.id === id);
}

export function effectiveRole(me: User | null): ActiveRole | "admin" | null {
  if (!me) return null;
  if (me.role === "admin") return "admin";
  if (me.role === "both") return me.activeRole;
  if (me.role === "driver") return "driver";
  return "passenger";
}
