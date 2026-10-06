import type { Circle, CommuteProfile } from "./types";
import { SEED_CIRCLES } from "./seed";

function normalize(s: string) {
  return s.trim().toLowerCase();
}

function routeOverlap(profile: CommuteProfile, circle: Circle): number {
  const home = normalize(profile.home);
  const office = normalize(profile.office);
  const from = normalize(circle.routeFrom);
  const to = normalize(circle.routeTo);

  let score = circle.matchScore;

  if (home.includes(from.split(" ")[0]) || from.includes(home.split(" ")[0])) {
    score += 3;
  }
  if (office.includes(to.split(" ")[0]) || to.includes(office.split(" ")[0])) {
    score += 3;
  }
  if (home === from && office === to) score += 5;
  if (profile.category === circle.category) score += 4;
  if (profile.category === "women" && circle.category !== "women") score -= 40;

  return Math.min(99, Math.max(40, score));
}

export function findCircles(profile: CommuteProfile): Circle[] {
  return SEED_CIRCLES.map((circle) => ({
    ...circle,
    matchScore: routeOverlap(profile, circle),
    status: "suggested" as const,
    members: circle.members.map((m) => ({ ...m })),
    chat: [...circle.chat],
    rotation: [...circle.rotation],
  })).sort((a, b) => b.matchScore - a.matchScore);
}

export function buildYouMember(profile: CommuteProfile) {
  const isDriver = profile.role === "driver";
  const carLabel = profile.driver
    ? `${profile.driver.vehicleMake} ${profile.driver.vehicleModel}`.trim()
    : "Car";

  return {
    id: "you",
    name: profile.name || "You",
    role: isDriver ? ("car_owner" as const) : ("rider" as const),
    carModel: isDriver ? carLabel : undefined,
    verified: true,
    rating: 5.0,
    credits: 50,
    isYou: true,
  };
}
