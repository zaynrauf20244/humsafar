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
import { buildYouMember, findCircles } from "./matching";
import { SEED_CIRCLES, WEEKDAYS } from "./seed";
import type { AppState, ChatMessage, Circle, CommuteProfile } from "./types";

const STORAGE_KEY = "saath-app-v2";

const defaultState: AppState = {
  profile: null,
  circles: SEED_CIRCLES,
  joinedCircleId: null,
  credits: 50,
  backupOffer: null,
};

type Store = AppState & {
  hydrated: boolean;
  setProfileAndMatch: (profile: CommuteProfile) => Circle[];
  joinCircle: (circleId: string) => void;
  sendChat: (circleId: string, text: string) => void;
  cantDriveToday: (circleId: string) => void;
  acceptBackup: () => void;
  dismissBackup: () => void;
  applyDriveCredits: (passengers: number) => void;
  applyRideCost: () => void;
  resetApp: () => void;
  joinedCircle: Circle | null;
};

const SaathContext = createContext<Store | null>(null);

function loadState(): AppState {
  if (typeof window === "undefined") return defaultState;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultState;
    return { ...defaultState, ...JSON.parse(raw) } as AppState;
  } catch {
    return defaultState;
  }
}

export function SaathProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AppState>(defaultState);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setState(loadState());
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state, hydrated]);

  const setProfileAndMatch = useCallback((profile: CommuteProfile) => {
    const matched = findCircles(profile);
    setState((prev) => ({
      ...prev,
      profile,
      circles: matched,
      credits: prev.credits || 50,
    }));
    return matched;
  }, []);

  const joinCircle = useCallback((circleId: string) => {
    setState((prev) => {
      if (!prev.profile) return prev;
      const you = buildYouMember(prev.profile);
      const circles = prev.circles.map((c) => {
        if (c.id !== circleId) return { ...c, status: "suggested" as const };
        const already = c.members.some((m) => m.id === "you");
        const members = already ? c.members : [...c.members, you];
        const rotation =
          you.role === "car_owner" && !c.rotation.includes("you")
            ? [...c.rotation.slice(0, 4), "you"]
            : c.rotation;
        const joinMsg: ChatMessage = {
          id: `join-${Date.now()}`,
          author: "Saath",
          text: `${you.name} joined the Circle. Drive today. Ride tomorrow.`,
          at: "Just now",
          system: true,
        };
        return {
          ...c,
          status: "joined" as const,
          members,
          rotation,
          chat: [...c.chat, joinMsg],
        };
      });
      return {
        ...prev,
        circles,
        joinedCircleId: circleId,
        credits: prev.credits + 10,
      };
    });
  }, []);

  const sendChat = useCallback((circleId: string, text: string) => {
    const trimmed = text.trim();
    if (!trimmed) return;
    setState((prev) => ({
      ...prev,
      circles: prev.circles.map((c) =>
        c.id !== circleId
          ? c
          : {
              ...c,
              chat: [
                ...c.chat,
                {
                  id: `m-${Date.now()}`,
                  author: prev.profile?.name || "You",
                  text: trimmed,
                  at: "Just now",
                },
              ],
            },
      ),
    }));
  }, []);

  const cantDriveToday = useCallback((circleId: string) => {
    setState((prev) => {
      const circle = prev.circles.find((c) => c.id === circleId);
      if (!circle) return prev;

      const backup = circle.members.find(
        (m) => m.role === "car_owner" && m.id !== circle.todayDriverId,
      );

      if (!backup) {
        const msg: ChatMessage = {
          id: `sys-${Date.now()}`,
          author: "Saath",
          text: "No backup in Circle. Checking Gulberg Circle #4… 1 seat available.",
          at: "Just now",
          system: true,
        };
        return {
          ...prev,
          circles: prev.circles.map((c) =>
            c.id === circleId ? { ...c, chat: [...c.chat, msg] } : c,
          ),
          backupOffer: {
            circleId,
            driverId: "corridor-backup",
            driverName: "Zain (Circle #4)",
            pickupTime: "8:17 AM",
          },
        };
      }

      const msg: ChatMessage = {
        id: `sys-${Date.now()}`,
        author: "Saath",
        text: `Backup driver found — ${backup.name} is available. Pickup ~8:17 AM.`,
        at: "Just now",
        system: true,
      };

      return {
        ...prev,
        circles: prev.circles.map((c) =>
          c.id === circleId ? { ...c, chat: [...c.chat, msg] } : c,
        ),
        backupOffer: {
          circleId,
          driverId: backup.id,
          driverName: backup.name,
          pickupTime: "8:17 AM",
        },
      };
    });
  }, []);

  const acceptBackup = useCallback(() => {
    setState((prev) => {
      if (!prev.backupOffer) return prev;
      const { circleId, driverId, driverName } = prev.backupOffer;
      const msg: ChatMessage = {
        id: `sys-${Date.now()}`,
        author: "Saath",
        text: `${driverName} is today's driver. You're covered — never get stranded.`,
        at: "Just now",
        system: true,
      };
      return {
        ...prev,
        backupOffer: null,
        circles: prev.circles.map((c) =>
          c.id !== circleId
            ? c
            : {
                ...c,
                todayDriverId: driverId.startsWith("corridor")
                  ? c.todayDriverId
                  : driverId,
                chat: [...c.chat, msg],
              },
        ),
      };
    });
  }, []);

  const dismissBackup = useCallback(() => {
    setState((prev) => ({ ...prev, backupOffer: null }));
  }, []);

  const applyDriveCredits = useCallback((passengers: number) => {
    setState((prev) => ({
      ...prev,
      credits: prev.credits + passengers * 10,
    }));
  }, []);

  const applyRideCost = useCallback(() => {
    setState((prev) => ({
      ...prev,
      credits: Math.max(0, prev.credits - 10),
    }));
  }, []);

  const resetApp = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    setState(defaultState);
  }, []);

  const joinedCircle = useMemo(
    () => state.circles.find((c) => c.id === state.joinedCircleId) ?? null,
    [state.circles, state.joinedCircleId],
  );

  const value = useMemo<Store>(
    () => ({
      ...state,
      hydrated,
      setProfileAndMatch,
      joinCircle,
      sendChat,
      cantDriveToday,
      acceptBackup,
      dismissBackup,
      applyDriveCredits,
      applyRideCost,
      resetApp,
      joinedCircle,
    }),
    [
      state,
      hydrated,
      setProfileAndMatch,
      joinCircle,
      sendChat,
      cantDriveToday,
      acceptBackup,
      dismissBackup,
      applyDriveCredits,
      applyRideCost,
      resetApp,
      joinedCircle,
    ],
  );

  return (
    <SaathContext.Provider value={value}>{children}</SaathContext.Provider>
  );
}

export function useSaath() {
  const ctx = useContext(SaathContext);
  if (!ctx) throw new Error("useSaath must be used within SaathProvider");
  return ctx;
}

export function memberName(circle: Circle, id: string) {
  return circle.members.find((m) => m.id === id)?.name ?? "TBD";
}

export { WEEKDAYS };
