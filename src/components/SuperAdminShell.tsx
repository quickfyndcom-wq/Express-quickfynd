"use client";

import {
  ConsoleShell,
  ConsolePanel,
  ConsoleStatCard,
} from "@/components/ConsoleShell";
import type { NavGroup } from "@/lib/portal-nav";

export function SuperAdminShell({
  email,
  nav,
  onLogout,
  children,
}: {
  email?: string;
  nav: NavGroup[];
  onLogout: () => void;
  children: React.ReactNode;
}) {
  return (
    <ConsoleShell
      product="QF Express"
      projectLabel="Super Admin"
      email={email}
      homeHref="/super-admin"
      ctaHref="/super-admin/customers"
      ctaLabel="Approve merchants"
      nav={nav}
      onLogout={onLogout}
      searchPlaceholder="Search..."
    >
      {children}
    </ConsoleShell>
  );
}

export const AdminStatCard = ConsoleStatCard;
export const AdminPanel = ConsolePanel;
