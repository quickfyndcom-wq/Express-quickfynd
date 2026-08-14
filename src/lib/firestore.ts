/**
 * @deprecated Use @/lib/db/orgs and /api/v1/* (Supabase) instead.
 */
export type { Organization, OrgStatus } from "@/lib/db/types";
export {
  findOrgByContactEmail,
  listOrganizations as listCollection,
  createOrganization,
  patchOrganization,
  getOrganization,
} from "@/lib/db/orgs";

/** Legacy collection name map — no longer hits Firestore */
export const COLLECTIONS = {
  organizations: "organizations",
  shipments: "shipments",
  hubs: "hubs",
  riders: "riders",
  invoices: "invoices",
  tickets: "tickets",
  auditLogs: "audit_logs",
} as const;

export async function createDoc(
  _name: string,
  data: Record<string, unknown>,
) {
  const { createOrganization } = await import("@/lib/db/orgs");
  const org = await createOrganization({
    name: String(data.name ?? ""),
    slug: data.slug ? String(data.slug) : undefined,
    type: data.type ? String(data.type) : undefined,
    contactEmail: String(data.contactEmail ?? ""),
    contactPhone: data.contactPhone ? String(data.contactPhone) : undefined,
    ownerName: data.ownerName ? String(data.ownerName) : undefined,
    companyAddress: data.companyAddress
      ? String(data.companyAddress)
      : undefined,
    gstin: (data.gstin as string | null) ?? null,
    status: (data.status as string) ?? "pending",
  });
  return org.id;
}

export async function patchDoc(
  _name: string,
  id: string,
  data: Record<string, unknown>,
) {
  const { patchOrganization } = await import("@/lib/db/orgs");
  await patchOrganization(id, {
    status: data.status as string | undefined,
    approvedAt: (data.approvedAt as string | null) ?? undefined,
    approvedBy: (data.approvedBy as string | null) ?? undefined,
  });
}

export async function getById(_name: string, id: string) {
  const { getOrganization } = await import("@/lib/db/orgs");
  return getOrganization(id);
}

export function friendlyFirestoreError(err: unknown) {
  return err instanceof Error ? err.message : String(err);
}
