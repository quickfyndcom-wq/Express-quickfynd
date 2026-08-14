import { NextResponse } from "next/server";
import { tryCreateServiceClient } from "@/lib/supabase/admin";
import { mapOrg, missingTableHint, type OrgRow } from "@/lib/db/types";
import { deliveryDb } from "@/lib/delivery";

export const runtime = "nodejs";

type Ctx = { params: Promise<{ id: string }> };

export async function GET(_request: Request, ctx: Ctx) {
  try {
    const { id } = await ctx.params;
    const seeded = deliveryDb.findCompany(id);
    const supabase = tryCreateServiceClient();
    if (!supabase) {
      if (!seeded) {
        return NextResponse.json({ error: "Not found" }, { status: 404 });
      }
      return NextResponse.json({
        org: {
          id: seeded.id,
          name: seeded.name,
          slug: seeded.slug,
          type: seeded.type,
          contactEmail: seeded.contactEmail,
          contactPhone: seeded.contactPhone,
          gstin: seeded.gstin ?? null,
          walletBalance: seeded.walletBalance,
          codBalance: seeded.codBalance,
          status: seeded.status,
        },
      });
    }
    const { data, error } = await supabase
      .from("organizations")
      .select("*")
      .eq("id", id)
      .maybeSingle();

    if (error) {
      return NextResponse.json(
        { error: missingTableHint(error.message) },
        { status: 500 },
      );
    }
    if (!data) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    return NextResponse.json({ org: mapOrg(data as OrgRow) });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Failed" },
      { status: 500 },
    );
  }
}

export async function PATCH(request: Request, ctx: Ctx) {
  try {
    const { id } = await ctx.params;
    const body = (await request.json()) as {
      status?: string;
      approvedAt?: string | null;
      approvedBy?: string | null;
      name?: string;
      contactPhone?: string;
      gstin?: string | null;
      companyAddress?: string;
    };

    const patch: Record<string, unknown> = {
      updated_at: new Date().toISOString(),
    };
    if (body.status !== undefined) patch.status = body.status;
    if (body.approvedAt !== undefined) patch.approved_at = body.approvedAt;
    if (body.approvedBy !== undefined) patch.approved_by = body.approvedBy;
    if (body.name !== undefined) patch.name = body.name;
    if (body.contactPhone !== undefined) patch.contact_phone = body.contactPhone;
    if (body.gstin !== undefined) patch.gstin = body.gstin;
    if (body.companyAddress !== undefined) {
      patch.company_address = body.companyAddress;
    }

    const supabase = tryCreateServiceClient();
    if (!supabase) {
      return NextResponse.json({ error: "Supabase not configured" }, { status: 400 });
    }
    const { data, error } = await supabase
      .from("organizations")
      .update(patch)
      .eq("id", id)
      .select("*")
      .single();

    if (error) {
      return NextResponse.json(
        { error: missingTableHint(error.message) },
        { status: 500 },
      );
    }

    return NextResponse.json({ org: mapOrg(data as OrgRow) });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Update failed" },
      { status: 500 },
    );
  }
}

export async function DELETE(_request: Request, ctx: Ctx) {
  const { id } = await ctx.params;
  const removed = deliveryDb.removeCompany(id);
  const supabase = tryCreateServiceClient();
  if (supabase) {
    await supabase.from("organizations").delete().eq("id", id);
  }
  if (!removed && !supabase) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  return NextResponse.json({ ok: true });
}
