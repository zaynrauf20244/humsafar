# HumSafar

Pakistan daily commute app — cost sharing (not a taxi). Phase 1 marketplace demo.

## Stack

Next.js 16 · React 19 · Tailwind 4 · PWA · localStorage demo store

## Design system

- Teal `#0E7C66` · Marigold `#F2A93B` · Plum `#6B3F86` (Sirf girls) · Ink · Mist · Red SOS
- Fonts: Bricolage Grotesque, DM Sans, Noto Nastaliq Urdu / Noto Naskh Arabic
- Default language: English. Urdu (RTL) toggle in nav / settings
- Bottom tabs: Home · Meri rides · Chat · Wallet · Profile

## Demo logins

| Phone | OTP | Role |
|-------|-----|------|
| `03001234567` | `123456` | Driver (Ali) |
| `03007654321` | `123456` | Both (Sara — girls route) |
| `03009876543` | `123456` | Passenger (Hamza) |
| `03000000000` | `123456` then admin code `999999` | Admin |

## Run

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) → splash → intro → login.

## What’s in the demo

P1 UI + local logic: OTP lock/timer, roles + switch, verification queue, route post, match cards (Sasta/Aam/Mehnga + Sirf girls), wallet top-up/fee, ride day codes, hidden chat + quick replies, SOS hold, ratings, settings (dark/language), admin 2-step.

Real SMS, JazzCash, live maps, and selfie liveness need production backends — screens are wired for demo.
