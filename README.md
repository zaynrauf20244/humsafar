# HumSafar

Pakistan daily commute — **offer a seat / find a seat** (cost sharing, not a taxi).

> **Brand name:** HumSafar (everywhere in code). GitHub remote may still show an older `saath` URL until renamed.

## Status: local demo only

This is a **Phase 1 UI + browser demo**. All data lives in `localStorage`.

| Demo reality | Production needs |
|---|---|
| Wallet / fee math runs in the browser | Server + DB; never trust client balances |
| Women-only filters are client-side | Enforce gender + CNIC on the API |
| Phone/OTP demo codes | Real SMS OTP + secrets outside git |
| One browser = one “world” | Multi-device sync via backend |

**Do not ship this store logic as a real app.** Treat every check as a preview of the intended rules.

## Language

- **Default: English**
- Urdu (RTL) available via nav / settings toggle

(Earlier Roman-Urdu UI was removed for clarity.)

## Stack

- Next.js 16 · React 19 · Tailwind CSS v4 (`@tailwindcss/postcss` + `@tailwindcss/turbopack`)
- PWA (installable) · TypeScript · Vitest + GitHub Actions CI

## Run

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

```bash
npm test          # unit tests (fee, women-only, CNIC, chat redact)
npm run lint
npx tsc --noEmit
```

## Demo accounts (local only)

These exist **only** so reviewers can click through. They are not production secrets — still, never put real keys in git.

| Phone | CNIC (digits) | OTP | Notes |
|-------|---------------|-----|--------|
| `03001234567` | `3520212345671` | see `src/lib/seed.ts` | Car owner |
| `03009876543` | `3520299887763` | same | Rider |
| `03000000000` | `0000000000000` | same + admin step in `admin/page.tsx` | Admin |

Sign in requires **phone + CNIC + OTP**. Sign up requires a **new** phone + **new** CNIC.

## Critical code (for review)

| Topic | File(s) |
|--------|---------|
| Fee / wallet math | `src/lib/pricing.ts`, `completeRide` in `src/lib/store.tsx` |
| Route post + match | `postRoute`, `searchRoutes`, `requestBooking` in `src/lib/store.tsx` |
| Women-only | `src/lib/safety.ts` + store filters |
| Chat number hide | `sendChat` in `src/lib/store.tsx` (redacts via `safety.ts`) |
| OTP + CNIC auth | `requestOtp` / `verifyOtp` in `src/lib/store.tsx`, UI `src/app/login/page.tsx` |
| Admin 2-step | `src/app/admin/page.tsx` |

## What’s in the demo

OTP lock/timer, phone+CNIC auth, roles, CNIC verification queue, 8 commute types, offer/find seat, price tags, booking fee, ride day codes, chat with number redaction, SOS, ratings, settings, admin panel, PWA install.
