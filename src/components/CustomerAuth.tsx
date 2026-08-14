"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AuthProvider, useAuth } from "@/lib/auth-context";
import { findOrgByContactEmail } from "@/lib/db/orgs";
import type { Organization } from "@/lib/db/types";
import { createContext, useContext } from "react";

const OrgContext = createContext<Organization | null>(null);

export function useCustomerOrg() {
  return useContext(OrgContext);
}

function CustomerGate({ children }: { children: React.ReactNode }) {
  const { user, loading, isSuperAdmin, logout } = useAuth();
  const router = useRouter();
  const [org, setOrg] = useState<Organization | null>(null);
  const [orgLoading, setOrgLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (loading) return;
    if (!user) {
      router.replace("/login");
      return;
    }
    if (isSuperAdmin) {
      // Super Admin can peek; still try load if they have an org email
      setOrgLoading(false);
      return;
    }

    let cancelled = false;
    (async () => {
      setOrgLoading(true);
      try {
        const row = await findOrgByContactEmail(user.email ?? "");
        if (!cancelled) {
          setOrg(row);
          setError("");
        }
      } catch (e) {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : "Failed to load company");
          setOrg(null);
        }
      } finally {
        if (!cancelled) setOrgLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [loading, user, isSuperAdmin, router]);

  if (loading || (user && !isSuperAdmin && orgLoading)) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-mist text-sm text-muted">
        Checking customer access…
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-mist text-sm text-muted">
        Redirecting to login…
      </div>
    );
  }

  if (isSuperAdmin) {
    return <OrgContext.Provider value={null}>{children}</OrgContext.Provider>;
  }

  if (error) {
    return (
      <Blocked
        title="Could not load your company"
        body={error}
        onLogout={logout}
      />
    );
  }

  if (!org) {
    return (
      <Blocked
        title="Finish your company profile"
        body="No company is linked to this login yet. Complete /register with company name, GST and address, then wait for Super Admin approval."
        onLogout={logout}
        extra={
          <Link href="/register" className="font-semibold text-brand">
            Complete registration →
          </Link>
        }
      />
    );
  }

  if (org.status === "pending") {
    return (
      <Blocked
        title="Waiting for Super Admin approval"
        body={`Your company “${org.name ?? org.slug}” is pending. Ask Super Admin to open the company and click Approve.`}
        onLogout={logout}
      />
    );
  }

  if (org.status === "suspended") {
    return (
      <Blocked
        title="Account suspended"
        body="Contact QuickFynd Express support or Super Admin to reactivate."
        onLogout={logout}
      />
    );
  }

  if (org.status !== "active") {
    return (
      <Blocked
        title="Account not active"
        body={`Status: ${org.status ?? "unknown"}. Super Admin must approve this company.`}
        onLogout={logout}
      />
    );
  }

  return <OrgContext.Provider value={org}>{children}</OrgContext.Provider>;
}

function Blocked({
  title,
  body,
  onLogout,
  extra,
}: {
  title: string;
  body: string;
  onLogout: () => Promise<void>;
  extra?: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-mist px-5 text-center">
      <h1 className="font-[family-name:var(--font-syne)] text-xl font-bold text-ink">
        {title}
      </h1>
      <p className="mt-3 max-w-md text-sm text-muted">{body}</p>
      {extra ? <div className="mt-4">{extra}</div> : null}
      <div className="mt-6 flex gap-4 text-sm">
        <Link href="/" className="font-medium text-brand">
          ← Site
        </Link>
        <button
          type="button"
          onClick={() => onLogout()}
          className="font-medium text-muted hover:text-ink"
        >
          Sign out
        </button>
      </div>
    </div>
  );
}

export function CustomerAuth({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <CustomerGate>{children}</CustomerGate>
    </AuthProvider>
  );
}
