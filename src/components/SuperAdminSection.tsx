"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { DataTable, StatGrid } from "@/components/PortalShell";
import { DeleteButton, deleteRecord } from "@/components/DeleteButton";
import type { Organization } from "@/lib/db/types";

type AnyRow = Record<string, unknown> & { id: string };

function asRows(data: unknown): AnyRow[] {
  if (!Array.isArray(data)) return [];
  return data.map((row) => {
    const r = row as Record<string, unknown>;
    return { id: String(r.id ?? r.awb ?? ""), ...r };
  });
}

function recordType(section: string) {
  switch (section) {
    case "riders":
      return "rider";
    case "hubs":
    case "zones":
      return "zone";
    case "cod":
    case "wallets":
    case "staff":
    case "billing":
      return "company";
    case "support":
      return "ticket";
    default:
      return "delivery";
  }
}

export function SuperAdminSection({
  section,
  title,
}: {
  section: string;
  title?: string;
}) {
  const heading = title ?? section;
  const [rows, setRows] = useState<AnyRow[]>([]);
  const [orgs, setOrgs] = useState<Organization[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [busyId, setBusyId] = useState("");

  const load = useCallback(async () => {
    const table = tableFor(section);
    const statsRes = await fetch("/api/v1/stats");
    const stats = (await statsRes.json()) as Record<string, unknown> & {
      error?: string;
      organizations?: Organization[];
    };
    if (!statsRes.ok && stats.error) setError(String(stats.error));
    else setError("");

    const organizations = (stats.organizations ?? []) as Organization[];
    setOrgs(organizations);

    if (!table) setRows([]);
    else if (table === "organizations") {
      setRows(
        organizations.map((o) => ({
          id: o.id,
          name: o.name,
          contactEmail: o.contactEmail,
          type: o.type,
          walletBalance: o.walletBalance,
          codBalance: o.codBalance,
          status: o.status,
        })),
      );
    } else {
      setRows(asRows(stats[table]));
    }
  }, [section]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        await load();
      } catch (e) {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : "Load failed");
          setRows([]);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [load]);

  async function onDelete(id: string) {
    setBusyId(id);
    try {
      await deleteRecord(recordType(section), id);
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Delete failed");
    } finally {
      setBusyId("");
    }
  }

  if (loading) {
    return <p className="text-sm text-[var(--gc-muted)]">Loading…</p>;
  }

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm text-[var(--gc-muted)]">
          Live delivery network data.
        </p>
        {error ? (
          <p className="mt-2 whitespace-pre-line text-sm text-brand">{error}</p>
        ) : null}
      </div>

      <StatGrid
        items={[
          { label: "Records", value: rows.length },
          { label: "Companies", value: orgs.length },
        ]}
      />

      {rows.length === 0 ? (
        <div className="rounded-[22px] border border-dashed border-[var(--gc-line)] bg-white px-6 py-10 text-center text-sm text-[var(--gc-muted)]">
          No data for <strong className="text-[var(--gc-ink)]">{heading}</strong>{" "}
          yet.
        </div>
      ) : (
        <div className="soft-card overflow-hidden rounded-[22px] bg-white">
          <DataTable
            headers={[...headersFor(section), ""]}
            rows={rows.map((r) => [
              ...cellsFor(section, r, orgs),
              <DeleteButton
                key={r.id}
                busy={busyId === r.id}
                onDelete={() => onDelete(String(r.awb ?? r.id))}
              />,
            ])}
          />
        </div>
      )}

      {section === "api" ? (
        <pre className="overflow-x-auto rounded-[22px] border border-[var(--gc-line)] bg-white p-4 text-xs text-[var(--gc-muted)]">
{`GET  /api/v1/logistics/services
POST /api/v1/logistics/quote
POST /api/v1/logistics/nearby
POST /api/v1/logistics/book
POST /api/v1/logistics/request-rider
GET  /api/v1/ops/live
GET  /api/v1/track/:awb`}
        </pre>
      ) : null}

      {section === "settings" ? (
        <div className="soft-card overflow-hidden rounded-[22px] bg-white">
          <DataTable
            headers={["Setting", "Value"]}
            rows={[
              ["Courier brand", "QF Express"],
              ["Auth", "Supabase Auth"],
              ["Database", "Supabase Postgres"],
              ["Super Admin emails", "2 authorized accounts"],
            ]}
          />
        </div>
      ) : null}

      {(section === "hubs" || section === "riders") && (
        <Link
          href={section === "hubs" ? "/hub" : "/rider"}
          className="text-sm font-semibold text-brand"
        >
          Open {section === "hubs" ? "Operations" : "Rider"} portal →
        </Link>
      )}
    </div>
  );
}

function tableFor(section: string): string | null {
  switch (section) {
    case "shipments":
    case "pickups":
    case "deliveries":
    case "live":
    case "routes":
    case "returns":
    case "reports":
      return "shipments";
    case "hubs":
      return "hubs";
    case "riders":
      return "riders";
    case "billing":
      return "invoices";
    case "cod":
    case "wallets":
    case "staff":
      return "organizations";
    case "support":
      return "tickets";
    default:
      return null;
  }
}

function headersFor(section: string): string[] {
  switch (section) {
    case "shipments":
    case "pickups":
    case "deliveries":
    case "live":
    case "routes":
    case "returns":
    case "reports":
      return ["ID", "AWB", "Org", "Status", "COD"];
    case "hubs":
      return ["ID", "Name"];
    case "riders":
      return ["ID", "Name"];
    case "billing":
      return ["ID", "Status"];
    case "cod":
    case "wallets":
      return ["Company", "Wallet", "COD", "Status"];
    case "support":
      return ["ID", "Status"];
    case "staff":
      return ["Company", "Contact", "Type"];
    case "audit":
      return ["ID", "Action", "At"];
    default:
      return ["ID", "Data"];
  }
}

function cellsFor(
  section: string,
  r: AnyRow,
  orgs: Organization[],
): React.ReactNode[] {
  const orgName = (orgId: unknown) => {
    const o = orgs.find((x) => x.id === orgId);
    return o?.name ?? String(orgId ?? "—");
  };

  switch (section) {
    case "shipments":
    case "pickups":
    case "deliveries":
    case "live":
    case "routes":
    case "returns":
    case "reports":
      return [
        r.id,
        String(r.awb ?? "—"),
        orgName(r.org_id ?? r.orgId),
        String(r.status ?? "—"),
        r.cod_amount || r.codAmount
          ? `₹${r.cod_amount ?? r.codAmount}`
          : "—",
      ];
    case "hubs":
      return [r.id, String(r.name ?? "—")];
    case "riders":
      return [r.id, String(r.name ?? "—")];
    case "billing":
      return [r.id, String(r.status ?? "—")];
    case "cod":
    case "wallets":
      return [
        String(r.name ?? r.id),
        `₹${r.walletBalance ?? r.wallet_balance ?? 0}`,
        `₹${r.codBalance ?? r.cod_balance ?? 0}`,
        String(r.status ?? "—"),
      ];
    case "support":
      return [r.id, String(r.status ?? "—")];
    case "staff":
      return [
        String(r.name ?? r.id),
        String(r.contactEmail ?? r.contact_email ?? "—"),
        String(r.type ?? "—"),
      ];
    case "audit":
      return [
        r.id,
        String(r.action ?? "—"),
        String(r.created_at ?? r.createdAt ?? "—"),
      ];
    default:
      return [r.id, JSON.stringify(r).slice(0, 80)];
  }
}
