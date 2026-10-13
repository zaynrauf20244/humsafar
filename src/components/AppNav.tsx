"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { useHumSafar } from "@/lib/store";

export function AppNav() {
  const pathname = usePathname();
  const { me, locale, setLocale, logout, hydrated } = useHumSafar();
  const hide =
    pathname.startsWith("/splash") ||
    pathname.startsWith("/intro") ||
    pathname.startsWith("/onboarding");

  if (hide) return null;

  return (
    <header className="sticky top-0 z-40 border-b border-line/70 bg-white/80 backdrop-blur-xl">
      <div className="mx-auto flex h-14 max-w-[720px] items-center justify-between gap-3 px-4 md:h-16 md:px-6">
        <Link href="/" className="flex items-center gap-2.5">
          <span className="brand-mark !size-9 !text-16">H</span>
          <span className="font-display text-20 font-extrabold tracking-tight md:text-26">
            HumSafar
          </span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {me && me.role !== "admin" ? (
            <>
              <NavLink href="/" active={pathname === "/"}>
                Home
              </NavLink>
              <NavLink
                href="/circles"
                active={pathname.startsWith("/circles")}
              >
                Circles
              </NavLink>
              <NavLink href="/rides" active={pathname.startsWith("/rides")}>
                My rides
              </NavLink>
              <NavLink href="/chat" active={pathname.startsWith("/chat")}>
                Chat
              </NavLink>
            </>
          ) : null}
          {me?.role === "admin" ? (
            <NavLink href="/admin" active={pathname.startsWith("/admin")}>
              Admin
            </NavLink>
          ) : null}
        </nav>

        <div className="flex items-center gap-2">
          <button
            type="button"
            className="min-h-11 rounded-[12px] border border-line bg-white px-3 text-12 font-bold"
            onClick={() => setLocale(locale === "en" ? "ur" : "en")}
          >
            {locale === "en" ? "اردو" : "EN"}
          </button>
          {me ? (
            <button
              type="button"
              onClick={logout}
              className="min-h-11 px-2 text-12 font-semibold text-muted"
            >
              Log out
            </button>
          ) : (
            <Link href="/login" className="btn btn-primary !min-h-11 !px-4 text-14">
              Login
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}

function NavLink({
  href,
  active,
  children,
}: {
  href: string;
  active: boolean;
  children: ReactNode;
}) {
  return (
    <Link
      href={href}
      className={`rounded-xl px-3 py-2 text-14 font-semibold transition ${
        active
          ? "bg-teal-soft text-teal-deep"
          : "text-muted hover:bg-white hover:text-ink"
      }`}
    >
      {children}
    </Link>
  );
}
