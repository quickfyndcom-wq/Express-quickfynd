"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { BrandLogo } from "@/components/BrandLogo";
import { useAuth } from "@/lib/auth-context";

const ADMIN_GMAIL = "quickfynd.com@gmail.com";

function AdminLoginForm() {
  const { signInGoogle, user, loading, isSuperAdmin } = useAuth();
  const router = useRouter();
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (loading || !user) return;
    if (isSuperAdmin) router.replace("/super-admin");
    else setError("This Google account is not on the Super Admin list.");
  }, [loading, user, isSuperAdmin, router]);

  async function onGoogle() {
    setBusy(true);
    setError("");
    try {
      await signInGoogle(ADMIN_GMAIL);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Google sign-in failed");
      setBusy(false);
    }
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-ink px-5 text-white">
      <div className="w-full max-w-md">
        <BrandLogo variant="light" size="md" href="/" showExpress showPoweredBy={false} />
        <h1 className="mt-8 font-[family-name:var(--font-syne)] text-2xl font-bold">
          Super Admin
        </h1>
        <p className="mt-2 text-sm text-white/55">
          Continue with Gmail. Platform admin is <span className="text-white">{ADMIN_GMAIL}</span>.
        </p>
        <button
          type="button"
          onClick={() => void onGoogle()}
          disabled={busy}
          className="mt-8 w-full rounded-md bg-brand py-3 text-sm font-semibold text-white disabled:opacity-60"
        >
          {busy ? "Redirecting to Google…" : "Continue with Google"}
        </button>
        {error ? (
          <p className="mt-4 text-sm text-brand" role="alert">
            {error}
          </p>
        ) : null}
        <p className="mt-6 text-center text-sm text-white/50">
          <Link href="/login" className="font-semibold text-white">
            Merchant login
          </Link>
        </p>
      </div>
    </div>
  );
}

export default function SuperAdminLoginPage() {
  return <AdminLoginForm />;
}
