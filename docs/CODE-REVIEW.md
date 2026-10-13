# HumSafar — code paths for security / product review

Open these files in the repo (paths relative to project root).

## 1. Wallet & fee

- `src/lib/pricing.ts` — `platformFee`, `riderPays`, `ownerKeeps`
- `src/lib/store.tsx` — `completeRide`, `topUpWallet`, `requestBooking` (fee attached at request time)

Model: owner keeps full seat cash; rider pays seat + HumSafar booking fee (demo wallet).

## 2. Route post & match

- `src/lib/store.tsx` — `postRoute`, `searchRoutes`, `requestBooking`
- UI: `src/app/page.tsx` (Offer / Find a seat)

## 3. Women-only

- Rules: `src/lib/safety.ts`
- Enforced in: `postRoute`, `searchRoutes`, `requestBooking` (`store.tsx`)
- Tests: `src/lib/safety.test.ts`

## 4. Chat (numbers)

- `src/lib/safety.ts` — `looksLikePkPhone`, `redactPhoneNumbers`
- `sendChat` in `src/lib/store.tsx` — redacts before storing
- UI: `src/app/chat/[id]/ChatThread.tsx`

## 5. OTP + CNIC + admin

- Auth rules: `requestOtp` / `verifyOtp` / `completeProfile` in `src/lib/store.tsx`
- Login UI: `src/app/login/page.tsx`
- Join (CNIC locked): `src/app/join/page.tsx`
- Seed users: `src/lib/seed.ts`
- Admin 2-step: `src/app/admin/page.tsx`

## Reminder

All of the above runs in the browser today. Production must re-implement the same rules on a server.
