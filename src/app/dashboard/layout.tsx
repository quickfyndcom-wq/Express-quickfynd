"use client";

import {
  CustomerShell,
} from "@/components/CustomerShell";
import { CustomerAuth, useCustomerOrg } from "@/components/CustomerAuth";
import { useAuth } from "@/lib/auth-context";
import { CUSTOMER_NAV_GROUPS } from "@/lib/portal-nav";

function DashboardShell({ children }: { children: React.ReactNode }) {
  const { user, logout, isSuperAdmin } = useAuth();
  const org = useCustomerOrg();

  const orgName = org
    ? (org.name ?? org.slug ?? "Merchant")
    : isSuperAdmin
      ? "Super Admin preview"
      : "Merchant";

  return (
    <CustomerShell
      orgName={orgName}
      email={user?.email ?? undefined}
      nav={CUSTOMER_NAV_GROUPS}
      onLogout={() => {
        void logout();
      }}
    >
      {children}
    </CustomerShell>
  );
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <CustomerAuth>
      <DashboardShell>{children}</DashboardShell>
    </CustomerAuth>
  );
}
