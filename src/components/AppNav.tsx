"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSaath } from "@/lib/store";

export function AppNav() {
  const pathname = usePathname();
  const { credits, hydrated, profile, joinedCircleId } = useSaath();

  const links = [
    { href: "/", label: "Home", match: (p: string) => p === "/" },
    {
      href: profile ? "/match" : "/",
      label: "Circles",
      match: (p: string) => p.startsWith("/match"),
    },
    {
      href: joinedCircleId ? `/circle/${joinedCircleId}` : "/match",
      label: "My Circle",
      match: (p: string) => p.startsWith("/circle"),
    },
    {
      href: "/credits",
      label: "Credits",
      match: (p: string) => p.startsWith("/credits"),
    },
  ];

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-surface">
      <div className="mx-auto flex h-14 max-w-[1120px] items-center justify-between px-4 md:h-16 md:px-8">
        <div className="flex items-center gap-8">
          <Link
            href="/"
            className="font-display text-lg font-semibold tracking-tight text-ink md:text-xl"
          >
            Saath
          </Link>

          <nav className="hidden items-center gap-1 md:flex">
            {links.map((link) => {
              const active = link.match(pathname);
              return (
                <Link
                  key={link.label}
                  href={link.href}
                  className={`rounded-[8px] px-3 py-2 text-sm font-medium transition ${
                    active
                      ? "bg-accent-soft text-accent"
                      : "text-muted hover:bg-bg hover:text-ink"
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="flex items-center gap-2 text-xs font-medium md:gap-3 md:text-sm">
          {!pathname.startsWith("/register") && (
            <>
              {!profile && (
                <div className="hidden items-center gap-2 md:flex">
                  <Link
                    href="/register/driver"
                    className="btn-secondary !px-3 !py-2 text-sm"
                  >
                    Driver
                  </Link>
                  <Link
                    href="/register/passenger"
                    className="btn-primary !px-3 !py-2 text-sm"
                  >
                    Passenger
                  </Link>
                </div>
              )}
              {profile && (
                <span className="rounded-[6px] border border-line bg-bg px-2 py-1 capitalize text-ink-soft">
                  {profile.role}
                </span>
              )}
              {(profile || pathname !== "/") && (
                <span className="rounded-[6px] bg-accent-soft px-2 py-1 text-accent-deep">
                  {hydrated ? `${credits} cr` : "…"}
                </span>
              )}
            </>
          )}
        </div>
      </div>
    </header>
  );
}
