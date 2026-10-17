import type { User, UserRole, VehicleKind, VerifyStatus } from "./types";

export function vehicleKindOf(
  user: Pick<User, "vehicle" | "preferredVehicleKind"> | null | undefined
): VehicleKind {
  if (user?.vehicle?.kind === "bike" || user?.vehicle?.kind === "car") {
    return user.vehicle.kind;
  }
  return user?.preferredVehicleKind === "bike" ? "bike" : "car";
}

/** null = no vehicle submitted yet */
export function vehicleVerifyStatus(
  user: Pick<User, "vehicle"> | null | undefined
): VerifyStatus | null {
  if (!user?.vehicle) return null;
  return user.vehicle.status ?? "approved";
}

export function canOfferSeats(
  user: Pick<User, "vehicle" | "cnicStatus" | "role"> | null | undefined
): boolean {
  if (!user || !canDriveRole(user.role)) return false;
  if (user.cnicStatus !== "approved") return false;
  return vehicleVerifyStatus(user) === "approved";
}

function canDriveRole(role: UserRole): boolean {
  return role === "driver" || role === "both";
}

/** Admin / UI persona label from role + vehicle. */
export function personaLabel(
  role: UserRole,
  kind?: VehicleKind | null
): string {
  if (role === "admin") return "Admin";
  if (role === "passenger") return "Passenger";
  if (role === "both") {
    return kind === "bike" ? "Both · Bike owner" : "Both · Car owner";
  }
  return kind === "bike" ? "Bike owner" : "Car owner";
}

export function ownerDashboardLabel(kind: VehicleKind): string {
  return kind === "bike" ? "Bike owner dashboard" : "Car owner dashboard";
}
