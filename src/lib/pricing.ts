import type { PriceTag, RateBounds } from "./types";

export const PLATFORM_FEE_RATE = 0.1;

/**
 * Soft market reference for suggestions only (not enforced).
 * ~Rs 50/km is a rough Pakistan economy-car ballpark used as a hint;
 * carpool seat = (km × perKm) ÷ empty seats.
 */
export const SUGGEST_PER_KM_DEFAULT = 50;

/** Suggested corridor distances when map km is missing (demo). */
export function estimateKm(from: string, to: string) {
  const key = `${from}|${to}`.toLowerCase();
  if (key.includes("bahria") && key.includes("gulberg")) return 28;
  if (key.includes("dha") && key.includes("gulberg")) return 18;
  if (key.includes("johar")) return 16;
  if (key.includes("model town")) return 14;
  return 22;
}

/**
 * Suggested seat band for the owner — advisory only.
 * Owner may post any positive price; admin min/max only shape the hint band.
 */
export function suggestRate(
  from: string,
  to: string,
  bounds: RateBounds,
  perKm = SUGGEST_PER_KM_DEFAULT,
  seats = 3,
  knownKm?: number
) {
  const km =
    knownKm != null && knownKm > 0
      ? Math.round(knownKm * 10) / 10
      : estimateKm(from, to);
  const mid = Math.round((km * perKm) / Math.max(1, seats));
  const min = Math.max(bounds.minRate, Math.round(mid * 0.7));
  const max = Math.min(bounds.maxRate, Math.round(mid * 1.35));
  return {
    min,
    max,
    mid: Math.min(max, Math.max(min, mid)),
    km,
    perKm,
    driverGets: (rate: number, feePercent: number) =>
      Math.round(rate - rate * (feePercent / 100)),
  };
}

export function priceTag(
  rate: number,
  suggestedMin: number,
  suggestedMax: number
): PriceTag {
  const span = suggestedMax - suggestedMin || 1;
  if (rate <= suggestedMin + span * 0.33) return "cheap";
  if (rate >= suggestedMin + span * 0.72) return "expensive";
  return "normal";
}

/** Fee taken by HumSafar — shown to rider as booking fee; owner keeps full seat rate. */
export function platformFee(rate: number, feePercent = 10) {
  return Math.round(rate * (feePercent / 100));
}

export function riderPays(rate: number, feePercent = 10) {
  const fee = platformFee(rate, feePercent);
  return { seat: rate, fee, total: rate + fee };
}

export function ownerKeeps(rate: number) {
  return rate;
}

export function pickupCode() {
  return String(Math.floor(1000 + Math.random() * 9000));
}
