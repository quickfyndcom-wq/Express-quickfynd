import { NextRequest, NextResponse } from "next/server";
import { APP_HOME_SERVICES, deliveryDb } from "@/lib/delivery";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  const lat = Number(req.nextUrl.searchParams.get("lat") ?? 11.2588);
  const lng = Number(req.nextUrl.searchParams.get("lng") ?? 75.7804);
  const pickupLabel =
    req.nextUrl.searchParams.get("label") ?? "Kozhikode, Kerala";
  const pickup = { lat, lng };

  const tiles = APP_HOME_SERVICES.map((svc) => {
    const nearby = deliveryDb.nearbyPartners(pickup, svc.vehicle);
    const count = svc.vehicles.reduce((n, v) => n + (nearby.byVehicle[v] ?? 0), 0);
    const available = count > 0;
    return {
      id: svc.id,
      title: svc.title,
      blurb: svc.blurb,
      icon: svc.icon,
      vehicle: svc.vehicle,
      vehicles: svc.vehicles,
      available,
      partnersNearby: count,
      nearestEtaMin: nearby.nearestEtaMin,
      nearestKm: nearby.nearestKm,
      subtitle: available
        ? `${count} nearby · ${nearby.nearestEtaMin ?? 4} min`
        : "No partners nearby",
      next: `/api/v1/logistics/nearby?lat=${lat}&lng=${lng}&vehicle=${svc.vehicle}`,
    };
  });

  const twoWheeler = tiles.find((t) => t.id === "two_wheeler");

  return NextResponse.json({
    ok: true,
    pickup: {
      label: pickupLabel,
      lat,
      lng,
    },
    banner: {
      title: "House shifting made easy!",
      cta: "Know More",
      tag: "PACKERS & MOVERS",
      serviceId: "movers",
    },
    services: tiles,
    scooter: {
      available: Boolean(twoWheeler?.available),
      partnersNearby: twoWheeler?.partnersNearby ?? 0,
      nearestEtaMin: twoWheeler?.nearestEtaMin ?? null,
      message: twoWheeler?.available
        ? "2 Wheeler / scooter delivery is available near you."
        : "No scooter or bike partner nearby right now.",
    },
    nav: [
      { id: "home", label: "Home" },
      { id: "orders", label: "Orders", href: "/logistics/activity" },
      { id: "payments", label: "Payments" },
      { id: "account", label: "Account" },
    ],
    flow: [
      "GET /api/v1/logistics/home?lat=&lng=",
      "User taps a tile (two_wheeler, trucks, movers, car)",
      "GET /api/v1/logistics/nearby?vehicle=scooter",
      "If available, collect drop + goods",
      "POST /api/v1/logistics/quote",
      "POST /api/v1/logistics/book  (assignMode: quick)",
      "GET /api/v1/track/{awb}",
    ],
  });
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const url = new URL(req.url);
  if (body.lat) url.searchParams.set("lat", String(body.lat));
  if (body.lng) url.searchParams.set("lng", String(body.lng));
  if (body.label) url.searchParams.set("label", String(body.label));
  return GET(new NextRequest(url));
}
