import type {
  CreateDeliveryInput,
  Delivery,
  DeliveryStatus,
  DeliveryType,
  GeoPoint,
  PriceBreakdown,
  PricingRule,
  QuoteInput,
  Rider,
  VehicleType,
} from "./types";

export const STATUS_FLOW: DeliveryStatus[] = [
  "created",
  "confirmed",
  "preparing",
  "ready_for_pickup",
  "searching_rider",
  "rider_assigned",
  "going_to_pickup",
  "arrived_pickup",
  "pickup_verified",
  "picked_up",
  "in_transit",
  "out_for_delivery",
  "rider_arriving",
  "arrived",
  "otp_verified",
  "delivered",
];

export const TRACK_STEPS: { status: DeliveryStatus; label: string }[] = [
  { status: "confirmed", label: "Order Confirmed" },
  { status: "rider_assigned", label: "Rider Assigned" },
  { status: "picked_up", label: "Picked Up" },
  { status: "out_for_delivery", label: "On The Way" },
  { status: "rider_arriving", label: "Arriving" },
  { status: "delivered", label: "Delivered" },
];

export const DEFAULT_PRICING: PricingRule = {
  id: "pr_default",
  zoneId: "zn_koz",
  base: 40,
  perKm: 10,
  weightPerKg: 8,
  express: 40,
  sameDay: 25,
  cod: 15,
};

const VEHICLE_FACTOR: Record<VehicleType, number> = {
  bike: 1,
  scooter: 1,
  auto: 1.15,
  car: 1.4,
  mini_van: 1.6,
  van: 1.8,
  truck: 2.5,
};

const CITY_SPEED_KMH = 22;

function toRad(deg: number) {
  return (deg * Math.PI) / 180;
}

export function haversineKm(a: GeoPoint, b: GeoPoint) {
  const R = 6371;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const s =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.min(1, Math.sqrt(s)));
}

export function etaMinutes(distanceKm: number) {
  return Math.max(4, Math.round((distanceKm / CITY_SPEED_KMH) * 60));
}

export function bearingDeg(from: GeoPoint, to: GeoPoint) {
  const dLng = toRad(to.lng - from.lng);
  const y = Math.sin(dLng) * Math.cos(toRad(to.lat));
  const x =
    Math.cos(toRad(from.lat)) * Math.sin(toRad(to.lat)) -
    Math.sin(toRad(from.lat)) * Math.cos(toRad(to.lat)) * Math.cos(dLng);
  return (Math.atan2(y, x) * 180) / Math.PI;
}

export function moveToward(from: GeoPoint, to: GeoPoint, stepKm: number): GeoPoint {
  const dist = haversineKm(from, to);
  if (dist < 0.04) return { lat: to.lat, lng: to.lng };
  const frac = Math.min(1, stepKm / dist);
  return {
    lat: from.lat + (to.lat - from.lat) * frac,
    lng: from.lng + (to.lng - from.lng) * frac,
  };
}

export function quotePrice(input: QuoteInput, rule = DEFAULT_PRICING): PriceBreakdown {
  const distanceKm = Number(haversineKm(input.pickup, input.drop).toFixed(1));
  const weightKg = input.weightKg ?? 1;
  const type: DeliveryType = input.deliveryType ?? "standard";
  const vehicle: VehicleType = input.vehicle ?? "bike";

  const base = rule.base;
  const distance = Math.round(distanceKm * rule.perKm);
  const weight = Math.round(Math.max(0, weightKg - 1) * rule.weightPerKg);
  const express =
    type === "express" ? rule.express : type === "same_day" ? rule.sameDay : 0;
  const cod = input.paymentType === "cod" ? rule.cod : 0;
  const subtotal = base + distance + weight + express + cod;
  const vehicleCharge = Math.round(subtotal * (VEHICLE_FACTOR[vehicle] - 1));
  const total = subtotal + vehicleCharge;
  const platformFee = Math.round(total * 0.2);
  const riderEarning = total - platformFee;

  return {
    base,
    distance,
    weight,
    express,
    cod,
    vehicle: vehicleCharge,
    total,
    platformFee,
    riderEarning,
    distanceKm,
  };
}

export function riderScore(rider: Rider, pickup: GeoPoint) {
  const distanceKm = haversineKm(
    { lat: rider.lat, lng: rider.lng },
    pickup,
  );
  const distanceScore = Math.max(0, 40 - distanceKm * 8);
  const availabilityScore =
    rider.online && rider.duty === "available" ? 25 : rider.online ? 8 : 0;
  const workloadScore = Math.max(0, 20 - rider.activeDeliveries * 6);
  const vehicleScore = ["bike", "scooter"].includes(rider.vehicle) ? 10 : 7;
  const performanceScore = Math.min(
    5,
    rider.rating - 3 + rider.acceptanceRate / 100,
  );
  const score = Math.round(
    distanceScore +
      availabilityScore +
      workloadScore +
      vehicleScore +
      performanceScore,
  );
  return { score, distanceKm };
}

export function rankRiders(riders: Rider[], pickup: GeoPoint, radiusKm = 8) {
  return riders
    .filter((r) => r.online && r.duty !== "offline" && r.duty !== "break")
    .map((rider) => ({ rider, ...riderScore(rider, pickup) }))
    .filter((row) => row.distanceKm <= radiusKm)
    .sort((a, b) => b.score - a.score);
}

export function nextStatus(current: DeliveryStatus): DeliveryStatus | null {
  const idx = STATUS_FLOW.indexOf(current);
  if (idx < 0 || idx >= STATUS_FLOW.length - 1) return null;
  return STATUS_FLOW[idx + 1];
}

export function isTerminal(status: DeliveryStatus) {
  return ["delivered", "cancelled", "returned"].includes(status);
}

export function otpCode() {
  return String(Math.floor(1000 + Math.random() * 9000));
}

export function newId(prefix: string) {
  return `${prefix}_${Math.random().toString(36).slice(2, 9)}`;
}

export function newAwb(prefix = "QFD") {
  return `${prefix}${Date.now().toString().slice(-8)}${Math.floor(Math.random() * 90 + 10)}`;
}

export function nowIso() {
  return new Date().toISOString();
}

export function minutesAgo(mins: number) {
  return new Date(Date.now() - mins * 60_000).toISOString();
}

export function statusLabel(status: DeliveryStatus) {
  return status.replaceAll("_", " ");
}

export function normalizeCreateInput(input: CreateDeliveryInput) {
  const pickupLine = input.pickup.line;
  const dropLine = input.customer.line ?? input.customer.address ?? "";
  return {
    pickup: {
      name: input.pickup.name,
      phone: input.pickup.phone,
      line: pickupLine,
      city: input.pickup.city ?? "Kozhikode",
      pincode: input.pickup.pincode ?? "673001",
      lat: input.pickup.lat ?? 11.2588,
      lng: input.pickup.lng ?? 75.7804,
      instructions: input.pickup.instructions,
    },
    drop: {
      name: input.customer.name,
      phone: input.customer.phone,
      line: dropLine,
      city: input.customer.city ?? "Kozhikode",
      pincode: input.customer.pincode ?? "673001",
      lat: input.customer.lat ?? 11.258,
      lng: input.customer.lng ?? 75.78,
      instructions: input.customer.instructions,
    },
    package: {
      type: input.package?.type ?? "parcel",
      weightKg: Number(input.package?.weightKg ?? 1),
      lengthCm: input.package?.lengthCm,
      widthCm: input.package?.widthCm,
      heightCm: input.package?.heightCm,
      count: Number(input.package?.count ?? 1),
      fragile: Boolean(input.package?.fragile),
      instructions: input.package?.instructions,
    },
    payment: {
      type: input.payment?.type ?? "prepaid",
      amount: Number(input.payment?.amount ?? 0),
    },
    deliveryType: input.deliveryType ?? "standard",
    vehicle: input.vehicle ?? "bike",
  };
}

export function projectMap(
  point: GeoPoint,
  bounds = { minLat: 11.15, maxLat: 11.35, minLng: 75.7, maxLng: 75.9 },
) {
  const x = ((point.lng - bounds.minLng) / (bounds.maxLng - bounds.minLng)) * 100;
  const y = (1 - (point.lat - bounds.minLat) / (bounds.maxLat - bounds.minLat)) * 100;
  return {
    x: Math.min(96, Math.max(4, x)),
    y: Math.min(96, Math.max(4, y)),
  };
}

export function customerDelivery(d: Delivery, assignedRider?: Rider | null) {
  return {
    id: d.id,
    awb: d.awb,
    status: d.status,
    pickup: d.pickup,
    drop: d.drop,
    package: d.package,
    payment: d.payment,
    vehicle: d.vehicle,
    price: d.price,
    pickupOtp: d.pickupOtp,
    deliveryOtp: d.deliveryOtp,
    offeredRiderId: d.offeredRiderId,
    offerExpiresAt: d.offerExpiresAt,
    rider: assignedRider
      ? partnerCard(assignedRider, d.pickup, Boolean(d.riderId))
      : null,
    stopsBefore: d.stopsBefore,
    createdAt: d.createdAt,
    updatedAt: d.updatedAt,
    history: d.history,
    trackingUrl: `/track/${d.awb}`,
  };
}

export function publicRider(r: Rider) {
  return {
    id: r.id,
    firstName: r.firstName,
    name: r.name,
    vehicle: r.vehicle,
    vehicleReg: r.vehicleReg,
    rating: r.rating,
    lat: r.lat,
    lng: r.lng,
    speed: r.speed,
    heading: r.heading,
    battery: r.battery,
    online: r.online,
    duty: r.duty,
    lastSeen: r.lastSeen,
    photoUrl: r.photoUrl,
    todayEarnings: r.todayEarnings,
    todayDeliveries: r.todayDeliveries,
    acceptanceRate: r.acceptanceRate,
    activeDeliveries: r.activeDeliveries,
  };
}

/** Customer-facing partner card — no phone or full name. */
export function partnerCard(
  r: Rider,
  pickup: GeoPoint,
  assigned = false,
) {
  const distanceKm = Math.round(haversineKm(r, pickup) * 10) / 10;
  return {
    id: r.id,
    firstName: r.firstName,
    photoUrl: r.photoUrl ?? null,
    rating: r.rating,
    vehicle: r.vehicle,
    vehicleReg: assigned ? r.vehicleReg : undefined,
    distanceKm,
    pickupEtaMin: etaMinutes(distanceKm),
    completedTrips: Math.max(r.todayDeliveries * 40, 120),
    online: r.online,
    duty: r.duty,
  };
}
