export type Locale = "en" | "ur";

export type UserRole = "driver" | "passenger" | "both" | "admin";

export type ActiveRole = "driver" | "passenger";

export type Gender = "male" | "female" | "other";

export type VerifyStatus = "pending" | "approved" | "rejected";

export type Weekday = "mon" | "tue" | "wed" | "thu" | "fri" | "sat" | "sun";

export type RideCategory = "women" | "men" | "any";

export type CommuteType =
  | "office"
  | "university"
  | "women"
  | "society"
  | "school"
  | "intercity"
  | "airport"
  | "event";

export type PriceTag = "cheap" | "normal" | "expensive";

export type BookingStatus =
  | "requested"
  | "accepted"
  | "rejected"
  | "ongoing"
  | "completed"
  | "cancelled"
  | "no_show";

export type WalletTxType =
  | "topup"
  | "fee"
  | "bonus"
  | "adjustment"
  | "refund";

export interface EmergencyContact {
  name: string;
  phone: string;
  tested?: boolean;
}

export type VehicleKind = "car" | "bike";

export interface Vehicle {
  kind: VehicleKind;
  make: string;
  model: string;
  year: number;
  color: string;
  plate: string;
  seats: number;
  /** Admin must approve before owner can offer seats */
  status: VerifyStatus;
  rejectReason?: string;
  photoName?: string;
  regBookName?: string;
}

export interface Licence {
  fileName: string;
  expiry: string;
}

export interface User {
  id: string;
  phone: string;
  name: string;
  photo?: string;
  gender: Gender;
  age?: number;
  cnic: string;
  cnicFrontName?: string;
  cnicBackName?: string;
  cnicStatus: VerifyStatus;
  cnicRejectReason?: string;
  role: UserRole;
  activeRole: ActiveRole;
  rating: number;
  ratingCount: number;
  walletBalance: number;
  /** Chosen at signup (Car owner / Bike owner) before vehicle is registered */
  preferredVehicleKind?: VehicleKind;
  vehicle?: Vehicle;
  licence?: Licence;
  emergencyContacts: EmergencyContact[];
  banned?: boolean;
  darkMode?: boolean;
  notifyPush?: boolean;
  notifyQuietHours?: boolean;
  blockedUserIds: string[];
  introSeen?: boolean;
  referralCode?: string;
  createdAt: string;
}

export interface RoutePost {
  id: string;
  driverId: string;
  from: string;
  to: string;
  /** Optional map coordinates (OpenStreetMap) */
  fromLat?: number;
  fromLng?: number;
  toLat?: number;
  toLng?: number;
  distanceKm?: number;
  durationMin?: number;
  direction: "home_to_office" | "office_to_home";
  time: string;
  flexMinutes: number;
  seatsTotal: number;
  seatsLeft: number;
  days: Weekday[];
  startDate: string;
  recurring: boolean;
  /** Gender filter for who can sit */
  category: RideCategory;
  /** Which HumSafar use-case this route belongs to */
  commuteType: CommuteType;
  /** Optional label: company, uni, school, event name */
  placeLabel?: string;
  /** Car or bike ride (defaults to car for older rows) */
  vehicleKind?: VehicleKind;
  rate: number;
  suggestedMin: number;
  suggestedMax: number;
  active: boolean;
  pausedToday?: boolean;
  createdAt: string;
}

export interface Booking {
  id: string;
  routeId: string;
  driverId: string;
  passengerId: string;
  pickup: string;
  drop: string;
  rate: number;
  platformFee: number;
  status: BookingStatus;
  paymentNote: "cash";
  pickupCode: string;
  cancelReason?: string;
  cashReceived?: boolean | null;
  driverRated?: boolean;
  passengerRated?: boolean;
  createdAt: string;
  chatId: string;
}

export interface ChatThread {
  id: string;
  bookingId: string;
  closedAt?: string;
  messages: ChatMessage[];
}

export interface ChatMessage {
  id: string;
  senderId: string;
  text: string;
  at: string;
  system?: boolean;
}

export interface Complaint {
  id: string;
  fromUserId: string;
  againstUserId: string;
  bookingId?: string;
  text: string;
  status: "open" | "in_progress" | "resolved" | "banned";
  adminNote?: string;
  createdAt: string;
}

export interface WalletTx {
  id: string;
  userId: string;
  type: WalletTxType;
  amount: number;
  note: string;
  createdAt: string;
}

export interface SosAlert {
  id: string;
  userId: string;
  bookingId?: string;
  at: string;
  location: string;
  status: "live" | "closed";
}

export interface MatchAlert {
  id: string;
  passengerId: string;
  from: string;
  to: string;
  time: string;
  category: RideCategory;
  commuteType?: CommuteType;
  createdAt: string;
}

export interface SavedPlace {
  label: string;
  value: string;
}

export interface NotificationPrefs {
  requests: boolean;
  reminders: boolean;
  wallet: boolean;
  marketing: boolean;
}

export interface AppSettings {
  perKm: number;
  feePercent: number;
  minRate: number;
  maxRate: number;
  signupBonus: number;
  minTopup: number;
}

export interface RateBounds {
  minRate: number;
  maxRate: number;
}

export interface OtpState {
  phone: string | null;
  attempts: number;
  lockedUntil: number | null;
  expiresAt: number | null;
  sentAt: number | null;
}

export interface AppState {
  locale: Locale;
  sessionUserId: string | null;
  users: User[];
  routes: RoutePost[];
  bookings: Booking[];
  chats: ChatThread[];
  complaints: Complaint[];
  walletTx: WalletTx[];
  sosAlerts: SosAlert[];
  matchAlerts: MatchAlert[];
  rateBounds: RateBounds;
  settings: AppSettings;
  otp: OtpState;
  pendingPhone: string | null;
  /** CNIC captured at sign-in / sign-up (digits or formatted) */
  pendingCnic: string | null;
  /** What the user started on the auth screen */
  authIntent: "signin" | "signup" | null;
  pendingRole: UserRole | null;
  /** Car vs bike for new owners at sign-up */
  pendingVehicleKind: VehicleKind | null;
  savedPlaces: Record<string, SavedPlace[]>;
  introDone: boolean;
  adminStepOk: boolean;
}
