"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { DataTable, StatGrid } from "@/components/PortalShell";
import { useAuth } from "@/lib/auth-context";
import { getOrganization, patchOrganization } from "@/lib/db/orgs";
import type { Organization } from "@/lib/db/types";

type Props = { params: Promise<{ id: string }> };

export default function CustomerDetailPage({ params }: Props) {
  const { user } = useAuth();
  const [id, setId] = useState("");
  const [org, setOrg] = useState<Organization | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);

  async function load(orgId: string) {
    setLoading(true);
    try {
      const o = await getOrganization(orgId);
      setOrg(o);
      setError("");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load");
      setOrg(null);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    params.then(({ id: orgId }) => {
      setId(orgId);
      load(orgId);
    });
  }, [params]);

  async function setStatus(status: "active" | "suspended" | "pending") {
    if (!id) return;
    setBusy(true);
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
      await load(id);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Update failed");
    } finally {
      setBusy(false);
    }
  }

  if (loading) return <p className="text-sm text-muted">Loading…</p>;
  if (!org) {
    return (
      <div className="space-y-4">
        <Link href="/super-admin/customers" className="text-sm text-brand">
          ← Customer companies
        </Link>
        <p className="whitespace-pre-line text-sm text-muted">
          {error || "Company not found in Supabase."}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <Link href="/super-admin/customers" className="text-sm text-brand">
            ← Customer companies
          </Link>
          <h2 className="mt-2 font-[family-name:var(--font-syne)] text-2xl font-bold">
            {String(org.name ?? id)}
          </h2>
          <p className="text-sm text-muted">
            Status: <strong>{org.status ?? "—"}</strong>
            {org.approvedBy ? ` · Approved by ${org.approvedBy}` : ""}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {org.status !== "active" ? (
            <button
              type="button"
              disabled={busy}
              onClick={() => setStatus("active")}
              className="rounded-md bg-brand px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
            >
              Approve customer
            </button>
          ) : (
            <button
              type="button"
              disabled={busy}
              onClick={() => setStatus("suspended")}
              className="rounded-md border border-line px-4 py-2 text-sm font-semibold disabled:opacity-60"
            >
              Suspend
            </button>
          )}
        </div>
      </div>

      {error ? (
        <p className="whitespace-pre-line text-sm text-brand">{error}</p>
      ) : null}

      <div className="border border-line bg-paper p-4 text-sm text-muted">
        Merchants self-register at <strong className="text-ink">/register</strong>.
        Data is in <strong className="text-ink">Supabase</strong>. Click{" "}
        <strong className="text-ink">Approve</strong> to activate{" "}
        <strong className="text-ink">{org.contactEmail}</strong>.
      </div>

      <StatGrid
        items={[
          { label: "Wallet", value: `₹${org.walletBalance ?? 0}` },
          { label: "COD", value: `₹${org.codBalance ?? 0}` },
          { label: "Status", value: String(org.status ?? "—") },
        ]}
      />

      <dl className="grid gap-3 border border-line bg-paper p-5 text-sm sm:grid-cols-2">
        <div>
          <dt className="text-muted">Type</dt>
          <dd className="font-semibold">{String(org.type ?? "—")}</dd>
        </div>
        <div>
          <dt className="text-muted">Login email</dt>
          <dd>{String(org.contactEmail ?? "—")}</dd>
        </div>
        <div>
          <dt className="text-muted">Phone</dt>
          <dd>{String(org.contactPhone ?? "—")}</dd>
        </div>
        <div>
          <dt className="text-muted">GSTIN</dt>
          <dd className="font-mono">{String(org.gstin ?? "—")}</dd>
        </div>
        <div className="sm:col-span-2">
          <dt className="text-muted">Company address</dt>
          <dd>{String(org.companyAddress ?? "—")}</dd>
        </div>
      </dl>

      <div>
        <h3 className="mb-3 font-[family-name:var(--font-syne)] font-bold">
          Shipments
        </h3>
        <DataTable headers={["AWB", "Status", "COD"]} rows={[]} />
      </div>
    </div>
  );
}
