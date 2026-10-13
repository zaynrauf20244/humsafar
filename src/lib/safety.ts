import type { Gender, RideCategory, User, VerifyStatus } from "./types";
import type { CommuteType } from "./commute-types";

/** Detect Pakistani-style phone numbers in free text (chat) */
export function looksLikePkPhone(text: string) {
  return /\b03\d{9}\b|\+\s*92\s*\d|\b92\d{10}\b/.test(text);
}

/** Redact phone-like spans for in-app chat */
export function redactPhoneNumbers(text: string) {
  return text
    .replace(/\b03\d{9}\b/g, "[number hidden]")
    .replace(/\+\s*92[\d\s-]{9,}/g, "[number hidden]")
    .replace(/\b92\d{10}\b/g, "[number hidden]");
}

export function canPostWomenRoute(me: {
  gender: Gender;
  cnicStatus: VerifyStatus;
}) {
  return me.gender === "female" && me.cnicStatus === "approved";
}

export function isWomenRoute(input: {
  category: RideCategory;
  commuteType: CommuteType;
}) {
  return input.category === "women" || input.commuteType === "women";
}

/** Male riders must not see / book women-only seats */
export function riderBlockedFromWomenRoute(
  rider: Pick<User, "gender" | "role"> | null | undefined,
  route: { category: RideCategory; commuteType: CommuteType }
) {
  if (!rider) return false;
  if (!isWomenRoute(route)) return false;
  return rider.gender === "male";
}

/** Women-only listings require an approved woman car owner */
export function womenRouteDriverOk(driver: {
  gender: Gender;
  cnicStatus: VerifyStatus;
  banned?: boolean;
}) {
  if (driver.banned) return false;
  return canPostWomenRoute(driver);
}
