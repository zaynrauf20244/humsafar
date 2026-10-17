# HumSafar

Pakistan daily commute — **offer a seat / find a seat** (cost sharing, not a taxi).

## Modes

| Mode | When | Data |
|------|------|------|
| **Local demo** | No Supabase env | `localStorage` (one browser) |
| **Live** | `.env.local` has Supabase URL + anon key | Shared Postgres + Realtime |

Login / nav show a **Live** or **Local demo** badge.

## Enable live data (Supabase)

1. Create a free project at [supabase.com](https://supabase.com)
2. SQL Editor → paste [`supabase/schema.sql`](supabase/schema.sql) → **Run**  
   (Already live? Run [`supabase/migrate-routes-live.sql`](supabase/migrate-routes-live.sql) once for map + vehicle columns.)
3. Project Settings → API → copy **Project URL** + **anon public** key
4. Copy env file and fill keys:

```bash
cp .env.local.example .env.local
```

5. Seed demo users/routes (optional — app also auto-seeds if DB is empty):

```bash
npm run seed:live
```

6. Restart the app:

```bash
npm run dev
```

Badge should say **Live**. Then:

- Browser A: sign in as car owner (`03001234567` / CNIC `3520212345671`) → Offer a seat  
- Browser B (incognito / phone): sign in as rider (`03009876543` / CNIC `3520299887763`) → Find a seat  

OTP is still the demo value in `src/lib/seed.ts` (not real SMS).

> Demo RLS allows anon read/write for testing. **Tighten before production.** Client-side fee/wallet rules are not a substitute for server enforcement.

## Language

- **Default: English**
- Urdu (RTL) via nav / settings toggle

## Stack

- Next.js 16 · React 19 · Tailwind CSS v4 · Supabase (optional) · PWA · Vitest

## Run

```bash
npm install
npm run dev
```

```bash
npm test
npm run lint
npx tsc --noEmit
```

## Demo accounts

| Phone | CNIC (digits) | OTP | Notes |
|-------|---------------|-----|--------|
| `03001234567` | `3520212345671` | see `src/lib/seed.ts` | Car owner |
| `03009876543` | `3520299887763` | same | Rider |
| `03000000000` | `0000000000000` | same + admin step `999999` | Admin |

## Critical code

| Topic | File(s) |
|--------|---------|
| Live DB | `src/lib/supabase.ts`, `src/lib/live-db.ts`, `supabase/schema.sql` |
| Store hydrate / sync | `src/lib/store.tsx` |
| Fee / wallet | `src/lib/pricing.ts` |
| Women-only | `src/lib/safety.ts` |
| Auth UI | `src/app/login/page.tsx` |
| Admin | `src/app/admin/page.tsx` |
