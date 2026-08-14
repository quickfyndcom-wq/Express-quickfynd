"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { usePathname } from "next/navigation";
import { BrandLogo } from "@/components/BrandLogo";
import type { NavGroup } from "@/lib/portal-nav";

type ConsoleShellProps = {
  product: string;
  projectLabel: string;
  email?: string;
  homeHref: string;
  ctaHref?: string;
  ctaLabel?: string;
  nav: NavGroup[];
  onLogout: () => void;
  children: React.ReactNode;
  searchPlaceholder?: string;
};

function isActivePath(pathname: string, href: string, homeHref: string) {
  if (href === homeHref) return pathname === href;
  return pathname === href || pathname.startsWith(`${href}/`);
}

function NavGlyph({ href }: { href: string }) {
  const key = href.split("/").filter(Boolean).slice(-1)[0] ?? "home";
  const c = "h-[18px] w-[18px] shrink-0";
  const icons: Record<string, React.ReactNode> = {
    "super-admin": <path d="M4 10.5 12 4l8 6.5V20a1 1 0 0 1-1 1h-5v-6H10v6H5a1 1 0 0 1-1-1v-9.5Z" />,
    dashboard: <path d="M4 10.5 12 4l8 6.5V20a1 1 0 0 1-1 1h-5v-6H10v6H5a1 1 0 0 1-1-1v-9.5Z" />,
    seller: <path d="M4 10.5 12 4l8 6.5V20a1 1 0 0 1-1 1h-5v-6H10v6H5a1 1 0 0 1-1-1v-9.5Z" />,
    live: (
      <>
        <circle cx="12" cy="12" r="2.5" />
        <path d="M5 12a7 7 0 0 1 14 0M2 12a10 10 0 0 1 20 0" />
      </>
    ),
    customers: (
      <>
        <path d="M4 20V9l8-5 8 5v11" />
        <path d="M9 20v-6h6v6" />
      </>
    ),
    deliveries: (
      <>
        <path d="M3 7h13v10H3z" />
        <path d="M16 10h4l2 3v4h-6" />
        <circle cx="7.5" cy="18.5" r="1.5" />
        <circle cx="18.5" cy="18.5" r="1.5" />
      </>
    ),
    shipments: <path d="M4 7h16v12H4zM8 7V5h8v2" />,
    orders: <path d="M4 7h16v12H4zM8 7V5h8v2" />,
    create: (
      <>
        <path d="M12 5v14M5 12h14" />
        <rect x="4" y="4" width="16" height="16" rx="3" />
      </>
    ),
    riders: (
      <>
        <circle cx="12" cy="6.5" r="2.5" />
        <path d="M6 20v-1.5A4.5 4.5 0 0 1 10.5 14h3A4.5 4.5 0 0 1 18 18.5V20" />
        <circle cx="7" cy="19" r="2" />
        <circle cx="17" cy="19" r="2" />
      </>
    ),
    pickups: (
      <>
        <path d="M12 4v10" />
        <path d="m8 8 4-4 4 4" />
        <path d="M5 14h14v6H5z" />
      </>
    ),
    hubs: (
      <>
        <path d="M4 10 12 4l8 6v10H4V10Z" />
        <path d="M9 20v-6h6v6" />
      </>
    ),
    routes: <path d="M6 6h4v4H6zM14 14h4v4h-4zM10 8h5a3 3 0 0 1 3 3v3" />,
    returns: <path d="M9 7H5V3M5 7c3-4 11-4 14 1M15 17h4v4M19 17c-3 4-11 4-14-1" />,
    zones: (
      <>
        <path d="M12 21s7-5.4 7-11a7 7 0 1 0-14 0c0 5.6 7 11 7 11Z" />
        <circle cx="12" cy="10" r="2.2" />
      </>
    ),
    pricing: (
      <>
        <path d="M12 4v16M8 8h5.5a2.5 2.5 0 0 1 0 5H9a2.5 2.5 0 0 0 0 5h7" />
      </>
    ),
    rates: <path d="M12 4v16M8 8h5.5a2.5 2.5 0 0 1 0 5H9a2.5 2.5 0 0 0 0 5h7" />,
    billing: (
      <>
        <rect x="3" y="6" width="18" height="12" rx="2" />
        <path d="M3 10h18" />
      </>
    ),
    wallet: (
      <>
        <rect x="3" y="6" width="18" height="13" rx="2" />
        <path d="M16 13h4v4h-4a2 2 0 0 1 0-4Z" />
      </>
    ),
    wallets: (
      <>
        <rect x="3" y="6" width="18" height="13" rx="2" />
        <path d="M16 13h4v4h-4a2 2 0 0 1 0-4Z" />
      </>
    ),
    cod: (
      <>
        <circle cx="12" cy="12" r="8" />
        <path d="M12 8v8M9.5 10.5c.6-1 1.6-1.5 2.5-1.5s2 .6 2 1.8-1 1.7-2.4 2.2-2.6.8-2.6 2.2 1.2 2 2.6 2 2.1-.6 2.6-1.6" />
      </>
    ),
    reports: (
      <>
        <path d="M4 19V5M4 19h16" />
        <path d="M8 15v-4M12 15V8M16 15v-6" />
      </>
    ),
    support: (
      <>
        <path d="M4 12a8 8 0 0 1 16 0v5a2 2 0 0 1-2 2h-2v-7h4" />
        <path d="M4 12v5a2 2 0 0 0 2 2h2v-7H4" />
      </>
    ),
    api: (
      <>
        <path d="M8 8 4 12l4 4M16 8l4 4-4 4M13 5l-2 14" />
      </>
    ),
    webhooks: <path d="M8 8 4 12l4 4M16 8l4 4-4 4M13 5l-2 14" />,
    notifications: (
      <>
        <path d="M6 9a6 6 0 0 1 12 0c0 7 3 7 3 7H3s3 0 3-7" />
        <path d="M10 19a2 2 0 0 0 4 0" />
      </>
    ),
    staff: (
      <>
        <circle cx="9" cy="8" r="3" />
        <circle cx="17" cy="9" r="2.5" />
        <path d="M3 19c0-2.8 2.7-5 6-5s6 2.2 6 5" />
      </>
    ),
    team: (
      <>
        <circle cx="9" cy="8" r="3" />
        <circle cx="17" cy="9" r="2.5" />
        <path d="M3 19c0-2.8 2.7-5 6-5s6 2.2 6 5" />
      </>
    ),
    settings: (
      <>
        <circle cx="12" cy="12" r="3" />
        <path d="M12 3v2M12 19v2M3 12h2M19 12h2M5.6 5.6l1.4 1.4M17 17l1.4 1.4M18.4 5.6 17 7M7 17l-1.4 1.4" />
      </>
    ),
    audit: (
      <>
        <path d="M8 4h8l3 3v13H8z" />
        <path d="M9 12h6M9 16h4" />
      </>
    ),
    bulk: (
      <>
        <path d="M12 4v10" />
        <path d="m8 10 4 4 4-4" />
        <path d="M5 18h14" />
      </>
    ),
  };

  return (
    <svg className={c} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      {icons[key] ?? (
        <>
          <rect x="4" y="4" width="7" height="7" rx="1.5" />
          <rect x="13" y="4" width="7" height="7" rx="1.5" />
          <rect x="4" y="13" width="7" height="7" rx="1.5" />
          <rect x="13" y="13" width="7" height="7" rx="1.5" />
        </>
      )}
    </svg>
  );
}

const ICON_TONES = {
  brand: "bg-[#ffe4ea] text-brand",
  teal: "bg-[#ccfbf1] text-[#0f766e]",
  amber: "bg-[#ffedd5] text-[#c2410c]",
  slate: "bg-[#e2e8f0] text-[#334155]",
  sky: "bg-[#e0f2fe] text-[#0369a1]",
  ok: "bg-[#dcfce7] text-emerald-700",
} as const;

export function ConsoleShell({
  product,
  projectLabel,
  email,
  homeHref,
  ctaHref,
  ctaLabel,
  nav,
  onLogout,
  children,
  searchPlaceholder = "Search...",
}: ConsoleShellProps) {
  const pathname = usePathname();
  const [query, setQuery] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);
  const [navOpen, setNavOpen] = useState(false);

  const flat = useMemo(() => nav.flatMap((g) => g.items), [nav]);
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    return flat.filter((i) => i.label.toLowerCase().includes(q)).slice(0, 8);
  }, [flat, query]);

  const pageTitle =
    flat.find((item) => isActivePath(pathname, item.href, homeHref))?.label ??
    product;

  const initials = (email ?? "QF").split("@")[0].slice(0, 2).toUpperCase();
  const displayName = email?.split("@")[0] ?? "User";

  return (
    <div className="console-shell flex min-h-screen text-[var(--gc-ink)]">
      <aside
        className={`fixed inset-y-0 left-0 z-30 flex w-[min(100%,280px)] flex-col bg-white/95 px-3 py-4 backdrop-blur-md transition-transform sm:px-4 sm:py-5 lg:static lg:w-[260px] lg:translate-x-0 ${
          navOpen ? "translate-x-0 shadow-2xl" : "-translate-x-full"
        }`}
      >
        <Link href={homeHref} className="mb-4 px-2 sm:mb-5">
          <BrandLogo
            variant="dark"
            size="sm"
            href={null}
            showExpress
            showPoweredBy={false}
          />
        </Link>

        {ctaHref && ctaLabel ? (
          <Link
            href={ctaHref}
            onClick={() => setNavOpen(false)}
            className="console-cta mb-4 flex items-center justify-center gap-2 rounded-2xl px-4 py-3 text-sm font-semibold text-white transition sm:mb-5"
          >
            <span className="text-lg leading-none">+</span>
            {ctaLabel}
          </Link>
        ) : null}

        <nav className="flex-1 overflow-y-auto pr-1">
          {nav.map((group) => (
            <div key={group.label} className="mb-4">
              <p className="mb-1 px-3 text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--gc-muted)]">
                {group.label}
              </p>
              <div className="flex flex-col gap-0.5">
                {group.items.map((item) => {
                  const active = isActivePath(pathname, item.href, homeHref);
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setNavOpen(false)}
                      className={`console-nav flex items-center gap-3 rounded-xl px-3 py-2.5 text-[13px] font-medium ${
                        active
                          ? "bg-[var(--gc-tint)] text-[var(--gc-accent)]"
                          : "text-[var(--gc-ink-soft)] hover:bg-[var(--gc-soft)]"
                      }`}
                    >
                      <NavGlyph href={item.href} />
                      <span className="truncate">{item.label}</span>
                      {active ? (
                        <span className="ml-auto h-1.5 w-1.5 rounded-full bg-[var(--gc-accent)]" />
                      ) : null}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        <div className="console-promo mt-3 hidden overflow-hidden rounded-2xl p-4 text-white sm:block">
          <p className="text-xs font-semibold">QF Express app</p>
          <p className="mt-1 text-[11px] text-white/70">
            Track AWBs &amp; manage COD on the go.
          </p>
          <Link
            href="/track"
            className="mt-3 inline-flex rounded-full bg-white/15 px-3 py-1.5 text-[11px] font-semibold text-white backdrop-blur transition hover:bg-white/25"
          >
            Open tracking
          </Link>
        </div>
      </aside>

      {navOpen ? (
        <button
          type="button"
          className="fixed inset-0 z-20 bg-black/25 lg:hidden"
          aria-label="Close menu"
          onClick={() => setNavOpen(false)}
        />
      ) : null}

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex items-center gap-3 px-5 pb-2 pt-5 md:px-8">
          <button
            type="button"
            className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-white text-[var(--gc-muted)] shadow-sm lg:hidden"
            aria-label="Open menu"
            onClick={() => setNavOpen(true)}
          >
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M4 7h16v2H4V7zm0 4h16v2H4v-2zm0 4h16v2H4v-2z" />
            </svg>
          </button>

          <div className="relative max-w-md flex-1">
            <div className="flex h-11 items-center gap-2 rounded-2xl border border-transparent bg-white px-4 shadow-[0_2px_12px_rgba(15,23,42,0.04)]">
              <svg
                className="h-4 w-4 text-[var(--gc-muted)]"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <circle cx="11" cy="11" r="7" />
                <path d="m20 20-3.5-3.5" />
              </svg>
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={searchPlaceholder}
                className="w-full bg-transparent text-sm outline-none placeholder:text-[var(--gc-muted)]"
              />
            </div>
            {filtered.length > 0 ? (
              <div className="absolute left-0 right-0 top-[calc(100%+8px)] z-20 overflow-hidden rounded-2xl border border-[var(--gc-line)] bg-white shadow-xl">
                {filtered.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setQuery("")}
                    className="flex items-center gap-2 px-4 py-2.5 text-sm hover:bg-[var(--gc-soft)]"
                  >
                    <NavGlyph href={item.href} />
                    {item.label}
                  </Link>
                ))}
              </div>
            ) : null}
          </div>

          <div className="ml-auto flex items-center gap-2">
            <button
              type="button"
              className="hidden h-10 w-10 items-center justify-center rounded-full bg-white text-[var(--gc-muted)] shadow-sm transition hover:text-brand sm:inline-flex"
              aria-label="Notifications"
            >
              <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                <path d="M6 9a6 6 0 0 1 12 0c0 7 3 7 3 7H3s3 0 3-7" />
                <path d="M10 19a2 2 0 0 0 4 0" />
              </svg>
            </button>
            <div className="relative">
              <button
                type="button"
                onClick={() => setMenuOpen((v) => !v)}
                className="flex items-center gap-2 rounded-full bg-white py-1.5 pl-1.5 pr-3 shadow-sm"
              >
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--gc-accent)] text-[11px] font-bold text-white">
                  {initials}
                </span>
                <span className="hidden text-left sm:block">
                  <span className="block text-xs font-semibold capitalize">
                    {displayName}
                  </span>
                  <span className="block text-[10px] text-[var(--gc-muted)]">
                    {projectLabel}
                  </span>
                </span>
              </button>
              {menuOpen ? (
                <div className="absolute right-0 top-[calc(100%+8px)] z-20 w-56 overflow-hidden rounded-2xl border border-[var(--gc-line)] bg-white shadow-xl animate-fade-up">
                  <div className="border-b border-[var(--gc-line)] px-4 py-3">
                    <p className="truncate text-sm font-semibold">{email}</p>
                    <p className="text-xs text-[var(--gc-muted)]">{product}</p>
                  </div>
                  <Link
                    href="/"
                    className="block px-4 py-2.5 text-sm hover:bg-[var(--gc-soft)]"
                    onClick={() => setMenuOpen(false)}
                  >
                    Site
                  </Link>
                  <button
                    type="button"
                    onClick={() => {
                      setMenuOpen(false);
                      onLogout();
                    }}
                    className="block w-full px-4 py-2.5 text-left text-sm hover:bg-[var(--gc-soft)]"
                  >
                    Sign out
                  </button>
                </div>
              ) : null}
            </div>
          </div>
        </header>

        <main className="flex-1 px-4 pb-8 pt-3 sm:px-5 md:px-8">
          <div className="mb-5 animate-fade-up">
            <p className="text-xs text-[var(--gc-muted)]">
              {product} · {pageTitle}
            </p>
            <h1 className="mt-1 font-[family-name:var(--font-syne)] text-xl font-bold tracking-tight sm:text-2xl md:text-[1.75rem]">
              {pageTitle}
            </h1>
          </div>
          {children}
        </main>
      </div>
    </div>
  );
}

export function ConsoleStatCard({
  label,
  value,
  hint,
  tone = "brand",
  icon,
}: {
  label: string;
  value: string | number;
  hint?: string;
  tone?: keyof typeof ICON_TONES;
  icon?: React.ReactNode;
}) {
  return (
    <div className="console-card soft-card flex items-start gap-4 rounded-[22px] bg-white p-5">
      <div
        className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ${ICON_TONES[tone]}`}
      >
        {icon ?? (
          <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
            <path d="M4 19V5M4 19h16M8 15v-4M12 15V8M16 15v-6" />
          </svg>
        )}
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-2">
          <p className="text-xs font-medium text-[var(--gc-muted)]">{label}</p>
          <span className="text-[var(--gc-muted)]">···</span>
        </div>
        <p className="mt-1 font-[family-name:var(--font-syne)] text-2xl font-bold tracking-tight">
          {value}
        </p>
        {hint ? (
          <p className="mt-0.5 text-xs text-[var(--gc-muted)]">{hint}</p>
        ) : null}
      </div>
    </div>
  );
}

export function ConsolePanel({
  children,
  className = "",
  title,
  action,
}: {
  children: React.ReactNode;
  className?: string;
  title?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className={`console-card soft-card overflow-hidden rounded-[22px] bg-white ${className}`}>
      {title ? (
        <div className="flex items-center justify-between px-5 pb-1 pt-5">
          <h3 className="text-sm font-semibold">{title}</h3>
          {action}
        </div>
      ) : null}
      {children}
    </div>
  );
}

export const AdminStatCard = ConsoleStatCard;
export const AdminPanel = ConsolePanel;
