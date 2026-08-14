"use client";

import { FormEvent, Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { BrandLogo } from "@/components/BrandLogo";
import { AuthProvider, useAuth } from "@/lib/auth-context";
import { isSuperAdminEmail } from "@/lib/admins";

const ADMIN_HINT = "quickfynd.com@gmail.com";

function friendlyAuthError(err: unknown): string {
  const code =
    typeof err === "object" && err && "code" in err
      ? String((err as { code: string }).code)
      : "";
  const message = err instanceof Error ? err.message : "Login failed";

  if (
    code === "auth/invalid-credential" ||
    code === "auth/wrong-password" ||
    code === "auth/user-not-found" ||
    code === "auth/invalid-email"
  ) {
    return "Wrong email or password. New merchants: create an account first, then wait for Super Admin approval.";
  }
  if (code === "auth/operation-not-allowed") {
    return "Enable Email/Password or Google in Firebase Console → Authentication → Sign-in method.";
  }
  if (code === "auth/popup-closed-by-user") {
    return "Google sign-in was cancelled.";
  }
  if (code === "auth/unauthorized-domain") {
    return "Add this domain under Firebase Authentication → Settings → Authorized domains.";
  }
  return message;
}

function LoginForm() {
  const { signInEmail, signInGoogle, user, loading, isSuperAdmin } = useAuth();
  const router = useRouter();
  const search = useSearchParams();
  const adminMode = search.get("admin") === "1" || search.get("next") === "/super-admin";
  const [email, setEmail] = useState(adminMode ? ADMIN_HINT : "");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (search.get("error") === "auth") {
      setError("Sign-in failed. Check Firebase Authentication providers.");
    }
  }, [search]);

  useEffect(() => {
    if (loading || !user) return;
    if (isSuperAdmin) {
      router.replace("/super-admin");
    } else {
      router.replace("/dashboard");
    }
  }, [loading, user, isSuperAdmin, router]);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      const trimmed = email.trim().toLowerCase();
      await signInEmail(trimmed, password);
      if (isSuperAdminEmail(trimmed)) {
        router.replace("/super-admin");
      } else {
        router.replace("/dashboard");
      }
    } catch (err) {
      setError(friendlyAuthError(err));
    } finally {
      setBusy(false);
    }
  }

  async function onGoogle() {
    setBusy(true);
    setError("");
    try {
      await signInGoogle(adminMode ? ADMIN_HINT : email || undefined);
    } catch (err) {
      setError(friendlyAuthError(err));
      setBusy(false);
    }
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-ink px-5 text-white">
      <div className="w-full max-w-md">
        <BrandLogo
          variant="light"
          size="md"
          href="/"
          showExpress
          showPoweredBy={false}
        />
        <h1 className="mt-8 font-[family-name:var(--font-syne)] text-2xl font-bold">
          {adminMode ? "Super Admin" : "Login"}
        </h1>
        <p className="mt-2 text-sm text-white/55">
          {adminMode
            ? `Sign in with Google as ${ADMIN_HINT}. That Gmail is the platform Super Admin.`
            : "Sign in with Firebase. Merchants need Super Admin approval before the dashboard opens."}
        </p>

        <button
          type="button"
          onClick={onGoogle}
          disabled={busy}
          className="mt-8 w-full rounded-md bg-brand py-3 text-sm font-semibold text-white transition hover:bg-brand-deep disabled:opacity-60"
        >
          {busy ? "Opening Google…" : "Continue with Google"}
        </button>

        <form onSubmit={onSubmit} className="mt-6 space-y-4">
          <label className="block text-sm">
            <span className="text-white/70">Email</span>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 w-full rounded-md border border-white/15 bg-white/5 px-3 py-2.5 text-white outline-none focus:border-brand"
              placeholder={adminMode ? ADMIN_HINT : "you@email.com"}
            />
          </label>
          <label className="block text-sm">
            <span className="text-white/70">Password</span>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 w-full rounded-md border border-white/15 bg-white/5 px-3 py-2.5 text-white outline-none focus:border-brand"
            />
          </label>
          {error ? (
            <p className="whitespace-pre-line text-sm text-brand" role="alert">
              {error}
            </p>
          ) : null}
          <button
            type="submit"
            disabled={busy}
            className="w-full rounded-md border border-white/20 py-3 text-sm font-semibold text-white disabled:opacity-60"
          >
            {busy ? "Signing in…" : "Sign in with email"}
          </button>
        </form>

        <p className="mt-5 text-center text-sm text-white/50">
          {adminMode ? (
            <Link href="/login" className="font-semibold text-brand">
              Merchant login
            </Link>
          ) : (
            <>
              New merchant?{" "}
              <Link href="/register" className="font-semibold text-brand">
                Create account
              </Link>
              {" · "}
              <Link href="/super-admin/login" className="font-semibold text-white">
                Super Admin
              </Link>
            </>
          )}
        </p>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <AuthProvider>
      <Suspense
        fallback={
          <div className="flex min-h-screen items-center justify-center bg-ink text-sm text-white/50">
            Loading…
          </div>
        }
      >
        <LoginForm />
      </Suspense>
    </AuthProvider>
  );
}
