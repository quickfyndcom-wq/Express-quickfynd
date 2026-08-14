"use client";

import {
  ConsoleShell,
  ConsolePanel,
  ConsoleStatCard,
} from "@/components/ConsoleShell";
import type { NavGroup } from "@/lib/portal-nav";

export function CustomerShell({
  orgName,
  email,
  nav,
  onLogout,
  children,
}: {
  orgName: string;
  email?: string;
  nav: NavGroup[];
  onLogout: () => void;
  children: React.ReactNode;
}) {
  return (
    <ConsoleShell
      product="Merchant"
      projectLabel={orgName}
      email={email}
      homeHref="/dashboard"
      ctaHref="/dashboard/create"
      ctaLabel="Create delivery"
      nav={nav}
      onLogout={onLogout}
      searchPlaceholder="Search..."
    >
      {children}
    </ConsoleShell>
  );
}

export function CustomerStatGrid({
  items,
}: {
  items: { label: string; value: string | number; hint?: string }[];
}) {
  const tones = ["teal", "sky", "amber"] as const;
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {items.map((item, i) => (
        <ConsoleStatCard
          key={item.label}
          label={item.label}
          value={item.value}
          hint={item.hint}
          tone={tones[i % tones.length]}
        />
      ))}
    </div>
  );
}

export function CustomerPanel({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <ConsolePanel className={className}>{children}</ConsolePanel>;
}
