"use client";

import { usePathname } from "next/navigation";
import { SuperAdminAuth } from "@/components/SuperAdminAuth";
import { SuperAdminShell } from "@/components/SuperAdminShell";
import { useAuth } from "@/lib/auth-context";
import { SUPER_ADMIN_NAV_GROUPS } from "@/lib/portal-nav";

function AdminLayoutInner({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const isLogin = pathname === "/super-admin/login";

  if (isLogin) return <>{children}</>;

  return (
    <SuperAdminShell
      email={user?.email ?? undefined}
      nav={SUPER_ADMIN_NAV_GROUPS}
      onLogout={() => {
        void logout();
      }}
    >
      {children}
    </SuperAdminShell>
  );
}

export default function SuperAdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SuperAdminAuth>
      <AdminLayoutInner>{children}</AdminLayoutInner>
    </SuperAdminAuth>
  );
}
