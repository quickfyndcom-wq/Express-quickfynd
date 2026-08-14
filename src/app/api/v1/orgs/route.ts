import { NextResponse } from "next/server";
import { tryCreateServiceClient } from "@/lib/supabase/admin";
import { mapOrg, missingTableHint, type OrgRow } from "@/lib/db/types";
import { deliveryDb } from "@/lib/delivery";

export const runtime = "nodejs";

function deliveryOrgs() {
  return deliveryDb.companies.map((c) => ({
    id: c.id,
    name: c.name,
    slug: c.slug,
    type: c.type,
    contactEmail: c.contactEmail,
    contactPhone: c.contactPhone,
    gstin: c.gstin ?? null,
    walletBalance: c.walletBalance,
    codBalance: c.codBalance,
    status: c.status,
  }));
}

/** GET /api/v1/orgs?email=... — list all, or find by contact email */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get("email")?.trim().toLowerCase();
    const supabase = tryCreateServiceClient();

    if (!supabase) {
      if (email) {
        const fallback = deliveryOrgs().find(
          (o) => o.contactEmail.toLowerCase() === email,
        );
        return NextResponse.json({ org: fallback ?? null });
      }
      return NextResponse.json({ orgs: deliveryOrgs() });
    }

    if (email) {
      const { data, error } = await supabase
        .from("organizations")
        .select("*")
        .ilike("contact_email", email)
        .limit(1)
        .maybeSingle();

      if (error) {
        const fallback = deliveryOrgs().find(
          (o) => o.contactEmail.toLowerCase() === email,
        );
        return NextResponse.json({ org: fallback ?? null });
      }
      return NextResponse.json({ org: data ? mapOrg(data as OrgRow) : null });
    }

    const { data, error } = await supabase
      .from("organizations")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      return NextResponse.json({
        orgs: deliveryOrgs(),
        warning: missingTableHint(error.message),
      });
    }

    const fromDb = ((data ?? []) as OrgRow[]).map(mapOrg);
    const seeded = deliveryOrgs();
    const merged = [...fromDb];
    for (const row of seeded) {
      if (!merged.some((o) => o.slug === row.slug || o.id === row.id)) {
        merged.push(row);
      }
    }
    return NextResponse.json({ orgs: merged });
  } catch (e) {
    return NextResponse.json({
      orgs: deliveryOrgs(),
      warning: e instanceof Error ? e.message : "Using delivery seed companies",
    });
  }
}

/** POST /api/v1/orgs — create pending merchant */
export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      name?: string;
      slug?: string;
      type?: string;
      contactEmail?: string;
      contactPhone?: string;
      ownerName?: string;
      companyAddress?: string;
      gstin?: string | null;
      status?: string;
    };

    const name = body.name?.trim();
    const contactEmail = body.contactEmail?.trim().toLowerCase();
    if (!name || !contactEmail) {
      return NextResponse.json(
        { error: "name and contactEmail are required" },
        { status: 400 },
      );
    }

    const slug =
      body.slug?.trim() ||
      name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");

    const supabase = tryCreateServiceClient();
    if (!supabase) {
      const company = deliveryDb.ensureCompany({
        name,
        slug,
        contactEmail,
      });
      return NextResponse.json(
        {
          org: {
            id: company.id,
            name: company.name,
            slug: company.slug,
            type: company.type,
            contactEmail: company.contactEmail,
            contactPhone: company.contactPhone,
            gstin: company.gstin ?? null,
            walletBalance: company.walletBalance,
            codBalance: company.codBalance,
            status: company.status,
          },
        },
        { status: 201 },
      );
    }

    const { data: existing } = await supabase
      .from("organizations")
      .select("*")
      .ilike("contact_email", contactEmail)
      .limit(1)
      .maybeSingle();

    if (existing) {
      return NextResponse.json({
        org: mapOrg(existing as OrgRow),
        alreadyExists: true,
      });
    }

    const { data, error } = await supabase
      .from("organizations")
      .insert({
        name,
        slug,
        type: body.type ?? "ecommerce",
        contact_email: contactEmail,
        contact_phone: body.contactPhone?.trim() ?? "",
        owner_name: body.ownerName?.trim() ?? "",
        company_address: body.companyAddress?.trim() ?? "",
        gstin: body.gstin?.trim().toUpperCase() || null,
        wallet_balance: 0,
        cod_balance: 0,
        status: body.status ?? "pending",
        approved_at: null,
        approved_by: null,
      })
      .select("*")
      .single();

    if (error) {
      return NextResponse.json(
        { error: missingTableHint(error.message) },
        { status: 500 },
      );
    }

    return NextResponse.json({ org: mapOrg(data as OrgRow) }, { status: 201 });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Create failed" },
      { status: 500 },
    );
  }
}
