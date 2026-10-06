import Link from "next/link";

export default function Home() {
  return (
    <main className="page !pb-8 md:!pb-12">
      {/* Desktop: wide hero + two columns. Mobile: stacked. */}
      <div className="grid items-start gap-8 md:grid-cols-2 md:gap-12 md:py-8 lg:gap-16">
        <div className="animate-rise md:pt-6">
          <p className="label-caps text-accent">Commute platform</p>
          <h1 className="mt-3 font-display text-4xl font-semibold leading-tight text-ink md:text-5xl lg:text-6xl">
            Saath
          </h1>
          <p className="mt-4 max-w-md text-[0.95rem] leading-relaxed text-muted md:text-lg">
            Recurring commute circles for verified drivers and passengers.
            Select your role to continue.
          </p>

          <ul className="mt-8 hidden space-y-3 text-sm text-ink-soft md:block">
            <li className="flex gap-2">
              <span className="font-semibold text-accent">01</span>
              Permanent circles — same people each workday
            </li>
            <li className="flex gap-2">
              <span className="font-semibold text-accent">02</span>
              Driver rotation & commute credits
            </li>
            <li className="flex gap-2">
              <span className="font-semibold text-accent">03</span>
              Backup coverage when plans change
            </li>
          </ul>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-1 lg:grid-cols-1">
          <Link
            href="/register/driver"
            className="role-card animate-rise-delay-1 md:p-6"
          >
            <div className="flex items-start gap-4">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[10px] border border-line bg-bg text-accent">
                <CarIcon />
              </div>
              <div className="min-w-0">
                <p className="text-base font-semibold text-ink md:text-lg">
                  Driver
                </p>
                <p className="mt-1 text-sm leading-relaxed text-muted">
                  Register your vehicle and offer seats on your existing daily
                  route. Earn commute credits through rotation.
                </p>
                <p className="mt-3 text-sm font-semibold text-accent">
                  Start driver registration →
                </p>
              </div>
            </div>
          </Link>

          <Link
            href="/register/passenger"
            className="role-card animate-rise-delay-2 md:p-6"
          >
            <div className="flex items-start gap-4">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[10px] border border-line bg-bg text-ink-soft">
                <RiderIcon />
              </div>
              <div className="min-w-0">
                <p className="text-base font-semibold text-ink md:text-lg">
                  Passenger
                </p>
                <p className="mt-1 text-sm leading-relaxed text-muted">
                  Enter your commute details and join a verified circle on your
                  corridor — same people, every workday.
                </p>
                <p className="mt-3 text-sm font-semibold text-accent">
                  Continue as passenger →
                </p>
              </div>
            </div>
          </Link>
        </div>
      </div>

      <p className="mt-8 border-t border-line pt-6 text-xs leading-relaxed text-muted md:hidden">
        Tip: Add to Home Screen for the mobile app experience.
      </p>
    </main>
  );
}

function CarIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M4 14h16l-1.2-4.2A2 2 0 0 0 16.9 8H7.1a2 2 0 0 0-1.9 1.8L4 14Z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      <path
        d="M4 14v3h2.5M20 14v3h-2.5M7 17.5a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3ZM17 17.5a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3Z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
    </svg>
  );
}

function RiderIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
      <circle cx="12" cy="8" r="3" stroke="currentColor" strokeWidth="1.6" />
      <path
        d="M6 19v-1a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v1"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
    </svg>
  );
}
