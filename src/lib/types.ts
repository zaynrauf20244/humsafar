export type Weekday = "M" | "T" | "W" | "Th" | "F";

export type UserRole = "driver" | "passenger";

export type MemberRole = "car_owner" | "rider";

export type CircleCategory =
  | "office"
  | "women"
  | "university"
  | "society"
  | "friends"
  | "public";

export interface DriverDetails {
  phone: string;
  cnic: string;
  licenseNumber: string;
  vehicleMake: string;
  vehicleModel: string;
  vehicleColor: string;
  plateNumber: string;
  seats: number;
}

export interface CommuteProfile {
  role: UserRole;
  name: string;
  phone: string;
  home: string;
  office: string;
  arriveBy: string;
  days: Weekday[];
  category: CircleCategory;
  driver?: DriverDetails;
}

export interface Member {
  id: string;
  name: string;
  role: MemberRole;
  carModel?: string;
  verified: boolean;
  rating: number;
  credits: number;
  isYou?: boolean;
}

export interface ChatMessage {
  id: string;
  author: string;
  text: string;
  at: string;
  system?: boolean;
}

export interface Circle {
  id: string;
  name: string;
  routeFrom: string;
  routeTo: string;
  departureWindow: string;
  matchScore: number;
  members: Member[];
  carsAvailable: number;
  avgPickupDeviationMin: number;
  rating: number;
  category: CircleCategory;
  rotation: string[];
  chat: ChatMessage[];
  todayDriverId: string;
  status: "suggested" | "joined";
}

export interface AppState {
  profile: CommuteProfile | null;
  circles: Circle[];
  joinedCircleId: string | null;
  credits: number;
  backupOffer: {
    circleId: string;
    driverId: string;
    driverName: string;
    pickupTime: string;
  } | null;
}
