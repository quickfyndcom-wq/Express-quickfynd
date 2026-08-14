"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { AuthProvider, useAuth } from "@/lib/auth-context";

function SuperAdminGate({ children }: { children: React.ReactNode }) {
  const { user, loading, isSuperAdmin } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const isLogin = pathname === "/super-admin/login";
  const cached =
    typeof window !== "undefined" && sessionStorage.getItem("qf_sa") === "1";

  useEffect(() => {
    if (loading) return;
    if (isLogin) {
      return;
    }
    if (isSuperAdmin) {
      sessionStorage.setItem("qf_sa", "1");
      return;
    }
    sessionStorage.removeItem("qf_sa");
    if (!user || !isSuperAdmin) {
      router.replace("/super-admin/login");
    }
  }, [loading, user, isSuperAdmin, isLogin, router]);

  if (isLogin) return <>{children}</>;

  if (loading && cached) {
    return <>{children}</>;
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-mist text-sm text-muted">
        Checking Super Admin access…
      </div>
    );
  }

  if (!user || !isSuperAdmin) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-mist text-sm text-muted">
        Redirecting to login…
      </div>
    );
  }

  return <>{children}</>;
}

export function SuperAdminAuth({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <SuperAdminGate>{children}</SuperAdminGate>
    </AuthProvider>
  );
}
