/**
 * Seed HumSafar demo users + routes into Supabase.
 * Usage: node --env-file=.env.local scripts/seed-live.mjs
 */
import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");

function loadEnvLocal() {
  try {
    const raw = readFileSync(join(root, ".env.local"), "utf8");
    for (const line of raw.split("\n")) {
      const m = line.match(/^([^#=]+)=(.*)$/);
      if (!m) continue;
      const key = m[1].trim();
      const val = m[2].trim().replace(/^["']|["']$/g, "");
      if (!process.env[key]) process.env[key] = val;
    }
  } catch {
    /* optional if --env-file used */
  }
}

loadEnvLocal();

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!url || !key || url.includes("YOUR_PROJECT")) {
  console.error(
    "Missing NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local"
  );
  process.exit(1);
}

const now = "2026-10-01T08:00:00.000Z";

const users = [
  {
    id: "admin",
    phone: "03000000000",
    name: "Admin",
    gender: "other",
    cnic: "00000-0000000-0",
    cnic_status: "approved",
    role: "admin",
    active_role: "passenger",
    rating: 5,
    rating_count: 0,
    wallet_balance: 0,
    emergency_contacts: [],
    blocked_user_ids: [],
    intro_seen: true,
    created_at: now,
  },
  {
    id: "drv-ali",
    phone: "03001234567",
    name: "Ali Khan",
    gender: "male",
    age: 29,
    cnic: "35202-1234567-1",
    cnic_status: "approved",
    role: "driver",
    active_role: "driver",
    rating: 4.9,
    rating_count: 42,
    wallet_balance: 500,
    vehicle: {
      kind: "car",
      make: "Honda",
      model: "Civic",
      year: 2019,
      color: "White",
      plate: "LES-2190",
      seats: 3,
      status: "approved",
    },
    licence: { fileName: "ali-licence.jpg", expiry: "2027-06-01" },
    emergency_contacts: [{ name: "Ahmed", phone: "03011112222", tested: true }],
    blocked_user_ids: [],
    intro_seen: true,
    created_at: now,
  },
  {
    id: "drv-sara",
    phone: "03007654321",
    name: "Sara Ahmed",
    gender: "female",
    age: 27,
    cnic: "35202-7654321-2",
    cnic_status: "approved",
    role: "both",
    active_role: "driver",
    rating: 5,
    rating_count: 28,
    wallet_balance: 800,
    vehicle: {
      kind: "car",
      make: "Toyota",
      model: "Vitz",
      year: 2020,
      color: "Silver",
      plate: "LEB-4411",
      seats: 3,
      status: "approved",
    },
    licence: { fileName: "sara-licence.jpg", expiry: "2028-01-15" },
    emergency_contacts: [{ name: "Amna", phone: "03013334444", tested: true }],
    blocked_user_ids: [],
    intro_seen: true,
    created_at: now,
  },
  {
    id: "drv-bilal",
    phone: "03001112233",
    name: "Bilal Hussain",
    gender: "male",
    age: 25,
    cnic: "35202-1122334-5",
    cnic_status: "approved",
    role: "driver",
    active_role: "driver",
    rating: 4.8,
    rating_count: 19,
    wallet_balance: 200,
    vehicle: {
      kind: "bike",
      make: "Honda",
      model: "CG 125",
      year: 2022,
      color: "Black",
      plate: "LEB-7788",
      seats: 1,
      status: "approved",
    },
    licence: { fileName: "bilal-licence.jpg", expiry: "2028-09-01" },
    emergency_contacts: [{ name: "Imran", phone: "03019998877", tested: true }],
    blocked_user_ids: [],
    intro_seen: true,
    created_at: now,
  },
  {
    id: "psg-hamza",
    phone: "03009876543",
    name: "Hamza",
    gender: "male",
    age: 24,
    cnic: "35202-9988776-3",
    cnic_status: "approved",
    role: "passenger",
    active_role: "passenger",
    rating: 4.7,
    rating_count: 11,
    wallet_balance: 0,
    emergency_contacts: [{ name: "Baba", phone: "03015556666", tested: true }],
    blocked_user_ids: [],
    intro_seen: true,
    created_at: now,
  },
  {
    id: "psg-ayesha",
    phone: "03005551234",
    name: "Ayesha",
    gender: "female",
    age: 26,
    cnic: "35202-5551234-4",
    cnic_status: "pending",
    role: "passenger",
    active_role: "passenger",
    rating: 5,
    rating_count: 2,
    wallet_balance: 0,
    emergency_contacts: [],
    blocked_user_ids: [],
    intro_seen: true,
    created_at: now,
  },
];

const routes = [
  {
    id: "rt-office-1",
    driver_id: "drv-ali",
    from: "Bahria Town",
    to: "Arfa Tower",
    direction: "home_to_office",
    time: "08:00",
    flex_minutes: 10,
    seats_total: 3,
    seats_left: 2,
    days: ["mon", "tue", "wed", "thu", "fri"],
    start_date: "2026-10-01",
    recurring: true,
    category: "any",
    commute_type: "office",
    vehicle_kind: "car",
    place_label: "Arfa Tower",
    rate: 280,
    suggested_min: 220,
    suggested_max: 320,
    active: true,
    created_at: now,
  },
  {
    id: "rt-women-1",
    driver_id: "drv-sara",
    from: "DHA Phase 5",
    to: "Gulberg",
    direction: "home_to_office",
    time: "08:30",
    flex_minutes: 10,
    seats_total: 2,
    seats_left: 2,
    days: ["mon", "tue", "wed", "thu", "fri"],
    start_date: "2026-10-01",
    recurring: true,
    category: "women",
    commute_type: "women",
    vehicle_kind: "car",
    place_label: "Women office circle",
    rate: 320,
    suggested_min: 260,
    suggested_max: 360,
    active: true,
    created_at: now,
  },
  {
    id: "rt-bike-office-1",
    driver_id: "drv-bilal",
    from: "Johar Town",
    to: "Arfa Tower",
    direction: "home_to_office",
    time: "08:00",
    flex_minutes: 10,
    seats_total: 1,
    seats_left: 1,
    days: ["mon", "tue", "wed", "thu", "fri"],
    start_date: "2026-10-01",
    recurring: true,
    category: "any",
    commute_type: "office",
    vehicle_kind: "bike",
    place_label: "Arfa Tower",
    rate: 120,
    suggested_min: 80,
    suggested_max: 160,
    active: true,
    created_at: now,
  },
];

const db = createClient(url, key, {
  auth: { persistSession: false, autoRefreshToken: false },
});

const { error: uErr } = await db.from("users").upsert(users);
if (uErr) {
  console.error("users seed failed", uErr);
  process.exit(1);
}
const { error: rErr } = await db.from("routes").upsert(routes);
if (rErr) {
  console.error("routes seed failed", rErr);
  process.exit(1);
}

console.log(`Seeded ${users.length} users + ${routes.length} routes → ${url}`);
