import type { PriceTag, RateBounds } from "./types";

export const PLATFORM_FEE_RATE = 0.1;

/** Suggested = km × perKm ÷ seats (demo corridor distances). */
export function estimateKm(from: string, to: string) {
  const key = `${from}|${to}`.toLowerCase();
  if (key.includes("bahria") && key.includes("gulberg")) return 28;
  if (key.includes("dha") && key.includes("gulberg")) return 18;
  if (key.includes("johar")) return 16;
  if (key.includes("model town")) return 14;
  return 22;
}

export function suggestRate(
  from: string,
  to: string,
  bounds: RateBounds,
  perKm = 35,
  seats = 3
) {
  const km = estimateKm(from, to);
  const mid = Math.round((km * perKm) / Math.max(1, seats));
  const min = Math.max(bounds.minRate, mid - 60);
  const max = Math.min(bounds.maxRate, mid + 40);
  return {
    min,
    max,
    mid: Math.round((min + max) / 2),
    km,
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
