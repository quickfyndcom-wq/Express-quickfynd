"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { NavItem } from "@/components/PortalShell";

export function PortalNav({ nav }: { nav: NavItem[] }) {
  const pathname = usePathname();

  function isActive(href: string) {
    if (href === "/super-admin" || href === "/dashboard" || href === "/hub" || href === "/rider") {
      return pathname === href;
    }
    return pathname === href || pathname.startsWith(`${href}/`);
  }

  return (
    <>
      <nav className="hidden flex-1 flex-col gap-0.5 overflow-y-auto p-3 lg:flex">
        {nav.map((item) => {
          const active = isActive(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`rounded-md px-3 py-2 text-sm font-medium transition ${
                active
                  ? "bg-white/10 text-white"
                  : "text-white/70 hover:bg-white/5 hover:text-white"
              }`}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="flex gap-2 overflow-x-auto border-b border-line bg-paper px-4 py-2 lg:hidden">
        {nav.map((item) => {
          const active = isActive(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`shrink-0 rounded-full border px-3 py-1 text-xs font-medium ${
                active
                  ? "border-brand bg-brand text-white"
                  : "border-line text-ink"
              }`}
            >
              {item.label}
            </Link>
          );
        })}
      </div>
    </>
  );
}
