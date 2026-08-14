"use client";

import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import {
  AdminPanel,
  AdminStatCard,
} from "@/components/SuperAdminShell";
import { useAuth } from "@/lib/auth-context";
import {
  createOrganization,
  listOrganizations,
  patchOrganization,
} from "@/lib/db/orgs";
import type { Organization } from "@/lib/db/types";
import { DeleteButton } from "@/components/DeleteButton";

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export default function CustomersPage() {
  const { user } = useAuth();
  const [orgs, setOrgs] = useState<Organization[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [type, setType] = useState("ecommerce");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [ownerName, setOwnerName] = useState("");
  const [gstin, setGstin] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [busy, setBusy] = useState(false);
  const [actionId, setActionId] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    try {
      const statsRes = await fetch("/api/v1/stats");
      const stats = (await statsRes.json()) as { organizations?: Organization[] };
      if (stats.organizations?.length) {
        setOrgs(stats.organizations);
        setError("");
        return;
      }
      const rows = await listOrganizations();
      setOrgs(rows);
      setError("");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load");
      setOrgs([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function onCreate(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError("");
    setSuccess("");
    try {
      const finalSlug = slug.trim() || slugify(name);
      const org = await createOrganization({
        name: name.trim(),
        slug: finalSlug,
        type,
        contactEmail: email.trim().toLowerCase(),
        contactPhone: phone.trim(),
        ownerName: ownerName.trim(),
        gstin: gstin.trim() || null,
        status: "pending",
      });
      setSuccess(`Added as pending (${org.id}). Click Approve when ready.`);
      setName("");
      setSlug("");
      setEmail("");
      setPhone("");
      setOwnerName("");
      setGstin("");
      setType("ecommerce");
      setShowForm(false);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Create failed");
    } finally {
      setBusy(false);
    }
  }

  async function setStatus(
    id: string,
    status: "active" | "suspended" | "pending",
  ) {
    setActionId(id);
    setError("");
    try {
      await patchOrganization(id, {
        status,
        ...(status === "active"
          ? {
              approvedAt: new Date().toISOString(),
              approvedBy: user?.email ?? null,
            }
          : {}),
      });
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Update failed");
    } finally {
      setActionId(null);
    }
  }

  const pendingOrgs = orgs.filter((o) => o.status === "pending");
  const active = orgs.filter((o) => o.status === "active").length;

  return (
    <div className="mx-auto max-w-5xl space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <p className="max-w-lg text-sm leading-relaxed text-[var(--gc-muted)]">
Merchants register at /register with email, company, GST and address
            (saved in Supabase). Approve to unlock their Merchant Console.
        </p>
        <button
          type="button"
          onClick={() => {
            setShowForm((v) => !v);
            setSuccess("");
            setError("");
          }}
          className="rounded-full border border-[var(--gc-line)] bg-white px-4 py-2 text-sm font-medium text-[var(--gc-ink)] transition hover:bg-[var(--gc-soft)]"
        >
          {showForm ? "Cancel" : "Add manually"}
        </button>
      </div>

      {error ? (
        <p className="text-sm text-brand animate-fade-up">{error}</p>
      ) : null}
      {success ? (
        <p className="text-sm text-emerald-700 animate-fade-up">{success}</p>
      ) : null}

      <div className="grid gap-4 sm:grid-cols-3">
        <AdminStatCard label="Total" value={orgs.length} tone="slate" />
        <AdminStatCard
          label="Pending"
          value={pendingOrgs.length}
          tone="amber"
          hint="Waiting for you"
        />
        <AdminStatCard label="Active" value={active} tone="ok" />
      </div>

      {showForm ? (
        <AdminPanel className="animate-fade-up p-5">
          <p className="mb-4 text-sm font-semibold text-[var(--as-ink)]">
            Manual add (optional)
          </p>
          <form
            onSubmit={onCreate}
            className="grid gap-3 sm:grid-cols-2"
          >
            <label className="block text-sm sm:col-span-2">
              Company name *
              <input
                required
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  if (!slug) setSlug(slugify(e.target.value));
                }}
                className="mt-1.5 w-full rounded-xl border border-[var(--as-line)] bg-[var(--as-soft)] px-3 py-2.5 outline-none focus:border-brand focus:bg-white"
              />
            </label>
            <label className="block text-sm">
              Slug
              <input
                value={slug}
                onChange={(e) => setSlug(slugify(e.target.value))}
                className="mt-1.5 w-full rounded-xl border border-[var(--as-line)] bg-[var(--as-soft)] px-3 py-2.5 outline-none focus:border-brand focus:bg-white"
              />
            </label>
            <label className="block text-sm">
              Type
              <select
                value={type}
                onChange={(e) => setType(e.target.value)}
                className="mt-1.5 w-full rounded-xl border border-[var(--as-line)] bg-[var(--as-soft)] px-3 py-2.5 outline-none focus:border-brand focus:bg-white"
              >
                <option value="ecommerce">ecommerce</option>
                <option value="internal">internal</option>
                <option value="local">local</option>
              </select>
            </label>
            <label className="block text-sm">
              Owner
              <input
                value={ownerName}
                onChange={(e) => setOwnerName(e.target.value)}
                className="mt-1.5 w-full rounded-xl border border-[var(--as-line)] bg-[var(--as-soft)] px-3 py-2.5 outline-none focus:border-brand focus:bg-white"
              />
            </label>
            <label className="block text-sm">
              Login email *
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1.5 w-full rounded-xl border border-[var(--as-line)] bg-[var(--as-soft)] px-3 py-2.5 outline-none focus:border-brand focus:bg-white"
              />
            </label>
            <label className="block text-sm">
              Phone
              <input
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="mt-1.5 w-full rounded-xl border border-[var(--as-line)] bg-[var(--as-soft)] px-3 py-2.5 outline-none focus:border-brand focus:bg-white"
              />
            </label>
            <label className="block text-sm sm:col-span-2">
              GSTIN
              <input
                value={gstin}
                onChange={(e) => setGstin(e.target.value)}
                className="mt-1.5 w-full rounded-xl border border-[var(--as-line)] bg-[var(--as-soft)] px-3 py-2.5 font-mono outline-none focus:border-brand focus:bg-white"
              />
            </label>
            <div className="sm:col-span-2">
              <button
                type="submit"
                disabled={busy}
                className="rounded-xl bg-ink px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-60"
              >
                {busy ? "Saving…" : "Save as pending"}
              </button>
            </div>
          </form>
        </AdminPanel>
      ) : null}

      {loading ? (
        <p className="text-sm text-[var(--as-muted)]">Loading…</p>
      ) : orgs.length === 0 ? (
        <AdminPanel className="animate-fade-up-delay-1 px-6 py-12 text-center">
          <p className="font-[family-name:var(--font-syne)] text-lg font-bold text-[var(--as-ink)]">
            Inbox is clear
          </p>
          <p className="mx-auto mt-2 max-w-sm text-sm text-[var(--as-muted)]">
            When a merchant submits /register, their request shows up here for
            one-click Approve.
          </p>
        </AdminPanel>
      ) : (
        <div className="space-y-3">
          {pendingOrgs.length > 0 ? (
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-brand animate-fade-up">
              Waiting for approval
            </p>
          ) : null}
          {orgs.map((o, i) => (
            <AdminPanel
              key={o.id}
              className="admin-card flex flex-wrap items-center justify-between gap-4 p-4 sm:p-5"
            >
              <div
                className="min-w-0 flex-1 animate-fade-up"
                style={{ animationDelay: `${Math.min(i, 6) * 40}ms` }}
              >
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="font-[family-name:var(--font-syne)] text-lg font-bold text-[var(--as-ink)]">
                    {o.name ?? o.id}
                  </h3>
                  <span
                    className={`rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${
                      o.status === "active"
                        ? "bg-emerald-50 text-emerald-700"
                        : o.status === "pending"
                          ? "bg-[var(--as-tint)] text-brand"
                          : "bg-[var(--as-soft)] text-[var(--as-muted)]"
                    }`}
                  >
                    {o.status ?? "—"}
                  </span>
                </div>
                <p className="mt-1 truncate text-sm text-[var(--as-muted)]">
                  {o.contactEmail ?? "—"}
                  {o.gstin ? ` · ${o.gstin}` : ""}
                </p>
                {o.companyAddress ? (
                  <p className="mt-0.5 truncate text-xs text-[var(--as-muted)]">
                    {o.companyAddress}
                  </p>
                ) : null}
              </div>
              <div className="flex flex-wrap items-center gap-2">
                {o.status !== "active" ? (
                  <button
                    type="button"
                    disabled={actionId === o.id}
                    onClick={() => setStatus(o.id, "active")}
                    className="rounded-2xl bg-[var(--gc-accent)] px-4 py-2.5 text-sm font-semibold text-white shadow-[0_10px_22px_rgba(15,118,110,0.25)] transition hover:brightness-110 disabled:opacity-50"
                  >
                    {actionId === o.id ? "…" : "Approve"}
                  </button>
                ) : (
                  <button
                    type="button"
                    disabled={actionId === o.id}
                    onClick={() => setStatus(o.id, "suspended")}
                    className="rounded-2xl border border-[var(--as-line)] px-4 py-2.5 text-sm font-semibold text-[var(--as-muted)] transition hover:text-[var(--as-ink)] disabled:opacity-50"
                  >
                    Suspend
                  </button>
                )}
                <Link
                  href={`/super-admin/customers/${o.id}`}
                  className="rounded-2xl bg-[var(--as-soft)] px-4 py-2.5 text-sm font-semibold text-[var(--as-ink)] transition hover:bg-white"
                >
                  Details
                </Link>
                <DeleteButton
                  busy={actionId === o.id}
                  onDelete={async () => {
                    setActionId(o.id);
                    await fetch(`/api/v1/orgs/${o.id}`, { method: "DELETE" });
                    await load();
                    setActionId(null);
                  }}
                />
              </div>
            </AdminPanel>
          ))}
        </div>
      )}
    </div>
  );
}
