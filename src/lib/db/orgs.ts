import type { Organization, OrgStatus } from "@/lib/db/types";

export type { Organization, OrgStatus };

async function readJson<T>(res: Response): Promise<T> {
  const data = (await res.json()) as T & { error?: string };
  if (!res.ok) {
    throw new Error(
      typeof data === "object" && data && "error" in data && data.error
        ? String(data.error)
        : `Request failed (${res.status})`,
    );
  }
  return data;
}

/** Find merchant company by login email (Supabase). */
export async function findOrgByContactEmail(email: string) {
  const res = await fetch(
    `/api/v1/orgs?email=${encodeURIComponent(email.trim().toLowerCase())}`,
    { cache: "no-store" },
  );
  const data = await readJson<{ org: Organization | null }>(res);
  return data.org;
}

export async function listOrganizations() {
  const res = await fetch("/api/v1/orgs", { cache: "no-store" });
  const data = await readJson<{ orgs: Organization[] }>(res);
  return data.orgs;
}

export async function getOrganization(id: string) {
  const res = await fetch(`/api/v1/orgs/${id}`, { cache: "no-store" });
  const data = await readJson<{ org: Organization }>(res);
  return data.org;
}

export async function createOrganization(input: {
  name: string;
  slug?: string;
  type?: string;
  contactEmail: string;
  contactPhone?: string;
  ownerName?: string;
  companyAddress?: string;
  gstin?: string | null;
  status?: OrgStatus | string;
}) {
  const res = await fetch("/api/v1/orgs", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  const data = await readJson<{ org: Organization; alreadyExists?: boolean }>(
    res,
  );
  return data.org;
}

export async function patchOrganization(
  id: string,
  patch: {
    status?: OrgStatus | string;
    approvedAt?: string | null;
    approvedBy?: string | null;
    name?: string;
    contactPhone?: string;
    gstin?: string | null;
    companyAddress?: string;
  },
) {
  const res = await fetch(`/api/v1/orgs/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(patch),
  });
  const data = await readJson<{ org: Organization }>(res);
  return data.org;
}
