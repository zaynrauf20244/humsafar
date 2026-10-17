"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  LayoutGrid,
  Route,
  UserRound,
  Wallet,
} from "lucide-react";
import { useHumSafar } from "@/lib/store";

export function MobileTabBar() {
  const pathname = usePathname();
  const { me } = useHumSafar();

  if (
    !me ||
    me.role === "admin" ||
    pathname.startsWith("/login") ||
    pathname.startsWith("/onboarding") ||
    pathname.startsWith("/splash") ||
    pathname.startsWith("/intro") ||
    pathname.startsWith("/admin") ||
    pathname.startsWith("/join")
  ) {
    return null;
  }

  const tabs = [
    { href: "/", label: "Home", icon: Home },
    { href: "/circles", label: "Circles", icon: LayoutGrid },
    { href: "/rides", label: "Rides", icon: Route },
    { href: "/wallet", label: "Credits", icon: Wallet },
    { href: "/profile", label: "You", icon: UserRound },
  ];

  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-50 border-t border-line bg-white/95 backdrop-blur-md md:hidden"
      style={{ paddingBottom: "var(--safe-bottom)" }}
      aria-label="Main"
    >
      <ul className="grid h-[68px] grid-cols-5">
        {tabs.map((tab) => {
          const active =
            tab.href === "/"
              ? pathname === "/"
              : pathname.startsWith(tab.href);
          const Icon = tab.icon;
          return (
            <li key={tab.href}>
              <Link
                href={tab.href}
                className={`flex h-full min-h-[44px] flex-col items-center justify-center gap-0.5 text-12 font-semibold ${
                  active ? "text-teal" : "text-muted"
                }`}
              >
                <Icon className="size-6" strokeWidth={active ? 2.4 : 1.8} />
                <span className="truncate px-0.5">{tab.label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
