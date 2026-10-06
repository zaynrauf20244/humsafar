"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSaath } from "@/lib/store";

/** Bottom tabs — mobile only. Desktop uses top nav. */
export function MobileTabBar() {
  const pathname = usePathname();
  const { joinedCircleId, profile } = useSaath();

  const hide = pathname.startsWith("/register");
  if (hide) return null;

  const tabs = [
    {
      href: "/",
      label: "Home",
      match: (p: string) => p === "/",
      icon: HomeIcon,
    },
    {
      href: profile ? "/match" : "/",
      label: "Circles",
      match: (p: string) => p.startsWith("/match"),
      icon: CirclesIcon,
    },
    {
      href: joinedCircleId ? `/circle/${joinedCircleId}` : "/match",
      label: "My Circle",
      match: (p: string) => p.startsWith("/circle"),
      icon: SaathIcon,
    },
    {
      href: "/credits",
      label: "Credits",
      match: (p: string) => p.startsWith("/credits"),
      icon: CreditsIcon,
    },
  ];

  return (
    <nav
      className="fixed bottom-0 left-0 z-50 w-full border-t border-line bg-surface md:hidden"
      style={{ paddingBottom: "var(--safe-bottom)" }}
      aria-label="Mobile navigation"
    >
      <ul className="grid h-16 grid-cols-4">
        {tabs.map((tab) => {
          const active = tab.match(pathname);
          const Icon = tab.icon;
          return (
            <li key={tab.label}>
              <Link
                href={tab.href}
                className={`flex h-full flex-col items-center justify-center gap-0.5 text-[11px] font-semibold ${
                  active ? "text-accent" : "text-muted"
                }`}
              >
                <Icon active={active} />
                {tab.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

function HomeIcon({ active }: { active: boolean }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M4 10.5 12 4l8 6.5V20a1 1 0 0 1-1 1h-5v-6H10v6H5a1 1 0 0 1-1-1v-9.5Z"
        stroke={active ? "var(--accent)" : "currentColor"}
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function CirclesIcon({ active }: { active: boolean }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
      <circle
        cx="9"
        cy="12"
        r="5"
        stroke={active ? "var(--accent)" : "currentColor"}
        strokeWidth="1.8"
      />
      <circle
        cx="15"
        cy="12"
        r="5"
        stroke={active ? "var(--accent)" : "currentColor"}
        strokeWidth="1.8"
      />
    </svg>
  );
}

function SaathIcon({ active }: { active: boolean }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M8 18v-1a4 4 0 0 1 4-4h0a4 4 0 0 1 4 4v1"
        stroke={active ? "var(--accent)" : "currentColor"}
        strokeWidth="1.8"
        strokeLinecap="round"
      />
      <circle
        cx="12"
        cy="8"
        r="3"
        stroke={active ? "var(--accent)" : "currentColor"}
        strokeWidth="1.8"
      />
    </svg>
  );
}

function CreditsIcon({ active }: { active: boolean }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
      <circle
        cx="12"
        cy="12"
        r="8"
        stroke={active ? "var(--accent)" : "currentColor"}
        strokeWidth="1.8"
      />
      <path
        d="M12 7v10M9.5 9.5c.5-1 1.5-1.5 2.5-1.5s2 .6 2 1.75-1 1.5-2.5 1.9-2.5.7-2.5 1.9 1 1.75 2.5 1.75 2-.5 2.5-1.5"
        stroke={active ? "var(--accent)" : "currentColor"}
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}
