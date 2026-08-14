/** Shared org types + mappers for Supabase (database) */

export type OrgStatus = "pending" | "active" | "suspended";

export type Organization = {
  id: string;
  name?: string;
  slug?: string;
  type?: string;
  contactEmail?: string;
  contactPhone?: string;
  ownerName?: string;
  companyAddress?: string;
  gstin?: string | null;
  walletBalance?: number;
  codBalance?: number;
  status?: OrgStatus | string;
  createdAt?: string;
  updatedAt?: string;
  approvedAt?: string | null;
  approvedBy?: string | null;
};

export type OrgRow = {
  id: string;
  name: string;
  slug: string;
  type: string;
  contact_email: string;
  contact_phone: string | null;
  owner_name: string | null;
  company_address: string | null;
  gstin: string | null;
  wallet_balance: number | string;
  cod_balance: number | string;
  status: string;
  approved_at: string | null;
  approved_by: string | null;
  created_at: string;
  updated_at: string;
};

export function mapOrg(row: OrgRow): Organization {
  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    type: row.type,
    contactEmail: row.contact_email,
    contactPhone: row.contact_phone ?? "",
    ownerName: row.owner_name ?? "",
    companyAddress: row.company_address ?? "",
    gstin: row.gstin,
    walletBalance: Number(row.wallet_balance ?? 0),
    codBalance: Number(row.cod_balance ?? 0),
    status: row.status,
    approvedAt: row.approved_at,
    approvedBy: row.approved_by,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function missingTableHint(message: string) {
  if (
    message.includes("Could not find the table") ||
    message.includes("schema cache") ||
    message.includes("does not exist") ||
    message.includes("42P01")
  ) {
    return [
      "Supabase tables are missing.",
      "Open http://localhost:3001/setup → Copy SQL → paste in Supabase SQL Editor → Run.",
      "Direct link: https://supabase.com/dashboard/project/qcbnagqxzfewiqmoambm/sql/new",
    ].join("\n");
  }
  return message;
}
