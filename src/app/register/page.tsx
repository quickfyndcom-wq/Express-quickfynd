"use client";

import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import { BrandLogo } from "@/components/BrandLogo";
import { AuthProvider, useAuth } from "@/lib/auth-context";
import { isSuperAdminEmail } from "@/lib/admins";
import { createOrganization, findOrgByContactEmail } from "@/lib/db/orgs";

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function RegisterForm() {
  const { user, signUpEmail, signInGoogle, logout } = useAuth();
  const [company, setCompany] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [gstin, setGstin] = useState("");
  const [address, setAddress] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);

  const viaGoogle = Boolean(user?.email);

  useEffect(() => {
    if (user?.email) {
      setEmail(user.email);
    }
  }, [user?.email]);

  async function savePendingOrg(trimmedEmail: string) {
    let existing = null;
    try {
      existing = await findOrgByContactEmail(trimmedEmail);
    } catch {
      /* create path will surface a clearer error */
    }

    if (existing?.status === "active") {
      throw new Error("This company is already approved. Please sign in.");
    }
    if (existing?.status === "pending") {
      return;
    }

    await createOrganization({
      name: company.trim(),
      slug: slugify(company),
      type: "ecommerce",
      contactEmail: trimmedEmail,
      contactPhone: phone.trim(),
      companyAddress: address.trim(),
      gstin: gstin.trim().toUpperCase() || null,
      status: "pending",
    });
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      const trimmed = (user?.email ?? email).trim().toLowerCase();
      if (!trimmed) {
        throw new Error("Sign in with Google or enter your email first.");
      }
      if (isSuperAdminEmail(trimmed)) {
        throw new Error("This email is reserved for Super Admin. Use Login.");
      }

      if (!user) {
        await signUpEmail(trimmed, password);
      }

      await savePendingOrg(trimmed);
      setDone(true);
      void logout().catch(() => undefined);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Registration failed");
    } finally {
      setBusy(false);
    }
  }

  async function onGoogle() {
    setBusy(true);
    setError("");
    try {
      await signInGoogle();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Google sign-in failed");
    } finally {
      setBusy(false);
    }
  }

  if (done) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-ink px-5 text-white">
        <div className="w-full max-w-md text-center">
          <BrandLogo
            variant="light"
            size="md"
            href="/"
            showExpress
            showPoweredBy={false}
          />
          <h1 className="mt-8 font-[family-name:var(--font-syne)] text-2xl font-bold">
            Request submitted
          </h1>
          <p className="mt-3 text-sm leading-relaxed text-white/60">
            Login is on <strong className="text-white">Firebase</strong>; company
            data is in <strong className="text-white">Supabase</strong> as{" "}
            <strong className="text-white">pending</strong>. Super Admin must
            Approve it, then you can use the Merchant Console.
          </p>
          <Link
            href="/login"
            className="mt-8 inline-flex w-full items-center justify-center rounded-md bg-brand py-3 text-sm font-semibold text-white"
          >
            Back to login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-ink px-5 py-12 text-white">
      <div className="w-full max-w-md">
        <BrandLogo
          variant="light"
          size="md"
          href="/"
          showExpress
          showPoweredBy={false}
        />
        <h1 className="mt-8 font-[family-name:var(--font-syne)] text-2xl font-bold">
          Create merchant account
        </h1>
        <p className="mt-2 text-sm text-white/55">
          Firebase login + company profile in Supabase. Super Admin Approves
          before the dashboard opens.
        </p>

        {!viaGoogle ? (
          <button
            type="button"
            onClick={onGoogle}
            disabled={busy}
            className="mt-6 w-full rounded-md border border-white/20 py-3 text-sm font-semibold text-white transition hover:bg-white/5 disabled:opacity-60"
          >
            Continue with Google
          </button>
        ) : (
          <p className="mt-6 rounded-md border border-brand/40 bg-brand/10 px-3 py-2 text-sm text-white/80">
            Signed in with Google as{" "}
            <strong className="text-white">{user?.email}</strong>. Complete
            company details below.
          </p>
        )}

        <form onSubmit={onSubmit} className="mt-6 space-y-4">
          <label className="block text-sm">
            <span className="text-white/70">Company name *</span>
            <input
              required
              value={company}
              onChange={(e) => setCompany(e.target.value)}
              className="mt-1 w-full rounded-md border border-white/15 bg-white/5 px-3 py-2.5 text-white outline-none focus:border-brand"
              placeholder="e.g. Nilaas Traders"
            />
          </label>
          {!viaGoogle ? (
            <label className="block text-sm">
              <span className="text-white/70">Work email *</span>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1 w-full rounded-md border border-white/15 bg-white/5 px-3 py-2.5 text-white outline-none focus:border-brand"
                placeholder="ops@company.com"
              />
            </label>
          ) : null}
          <label className="block text-sm">
            <span className="text-white/70">GSTIN *</span>
            <input
              required
              value={gstin}
              onChange={(e) => setGstin(e.target.value)}
              className="mt-1 w-full rounded-md border border-white/15 bg-white/5 px-3 py-2.5 font-mono text-white outline-none focus:border-brand"
              placeholder="15-character GSTIN"
              minLength={15}
              maxLength={15}
            />
          </label>
          <label className="block text-sm">
            <span className="text-white/70">Company address *</span>
            <textarea
              required
              rows={3}
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="mt-1 w-full resize-y rounded-md border border-white/15 bg-white/5 px-3 py-2.5 text-white outline-none focus:border-brand"
              placeholder="Registered office / warehouse address"
            />
          </label>
          <label className="block text-sm">
            <span className="text-white/70">Phone</span>
            <input
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="mt-1 w-full rounded-md border border-white/15 bg-white/5 px-3 py-2.5 text-white outline-none focus:border-brand"
              placeholder="Optional"
            />
          </label>
          {!viaGoogle ? (
            <label className="block text-sm">
              <span className="text-white/70">Password *</span>
              <input
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1 w-full rounded-md border border-white/15 bg-white/5 px-3 py-2.5 text-white outline-none focus:border-brand"
                placeholder="Min 6 characters"
              />
            </label>
          ) : null}
          {error ? (
            <p className="whitespace-pre-line text-sm text-brand" role="alert">
              {error}
            </p>
          ) : null}
          <button
            type="submit"
            disabled={busy}
            className="w-full rounded-md bg-brand py-3 text-sm font-semibold text-white disabled:opacity-60"
          >
            {busy ? "Submitting…" : "Submit for Super Admin approval"}
          </button>
        </form>

        <p className="mt-4 text-center text-sm text-white/50">
          Already approved?{" "}
          <Link href="/login" className="text-brand">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <AuthProvider>
      <RegisterForm />
    </AuthProvider>
  );
}
