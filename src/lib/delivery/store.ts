import type {
  Company,
  CreateDeliveryInput,
  Delivery,
  DeliveryStatus,
  GpsPing,
  PricingRule,
  QuoteInput,
  Rider,
  Seller,
  SupportTicket,
  WalletTxn,
  Zone,
} from "./types";
import {
  DEFAULT_PRICING,
  bearingDeg,
  etaMinutes,
  haversineKm,
  moveToward,
  minutesAgo,
  newAwb,
  newId,
  nextStatus,
  normalizeCreateInput,
  nowIso,
  otpCode,
  partnerCard,
  publicRider,
  quotePrice,
  rankRiders,
} from "./engine";
import { recommendVehicle } from "./catalog";
import type { VehicleType } from "./types";

const companies: Company[] = [
  {
    id: "co_quickfynd",
    name: "QuickFynd",
    slug: "quickfynd",
    type: "internal",
    contactEmail: "ops@quickfynd.com",
    contactPhone: "0495-4001000",
    gstin: "32JWYPS4831L1Z1",
    walletBalance: 184500,
    codBalance: 482300,
    status: "active",
    plan: "enterprise",
  },
  {
    id: "co_nilaas",
    name: "Nilaas",
    slug: "nilaas",
    type: "ecommerce",
    contactEmail: "hello@nilaas.com",
    contactPhone: "0495-4002000",
    gstin: "32JWYPS4831L1Z1",
    walletBalance: 42000,
    codBalance: 18600,
    status: "active",
    plan: "growth",
  },
  {
    id: "co_localmart",
    name: "Local Mart Kozhikode",
    slug: "localmart",
    type: "local",
    contactEmail: "shop@localmart.in",
    contactPhone: "9876501234",
    walletBalance: 8500,
    codBalance: 12400,
    status: "active",
    plan: "starter",
  },
];

const sellers: Seller[] = [
  {
    id: "sl_warehouse",
    companyId: "co_quickfynd",
    name: "QuickFynd Warehouse",
    phone: "9876500001",
    pickup: {
      name: "QuickFynd Warehouse",
      phone: "9876500001",
      line: "QuickFynd Warehouse, Kozhikode",
      city: "Kozhikode",
      pincode: "673001",
      lat: 11.2588,
      lng: 75.7804,
    },
    rating: 4.9,
    status: "active",
  },
  {
    id: "sl_electronics",
    companyId: "co_quickfynd",
    name: "Coastal Electronics",
    phone: "9876500002",
    pickup: {
      name: "Coastal Electronics",
      phone: "9876500002",
      line: "SM Street, Palayam",
      city: "Kozhikode",
      pincode: "673002",
      lat: 11.251,
      lng: 75.778,
    },
    rating: 4.6,
    status: "active",
  },
  {
    id: "sl_nilaas",
    companyId: "co_nilaas",
    name: "Nilaas Studio Store",
    phone: "9876500003",
    pickup: {
      name: "Nilaas Studio Store",
      phone: "9876500003",
      line: "Mavoor Road, Kozhikode",
      city: "Kozhikode",
      pincode: "673004",
      lat: 11.2655,
      lng: 75.79,
    },
    rating: 4.8,
    status: "active",
  },
];

const riders: Rider[] = [
  {
    id: "RIDER102",
    name: "Ahamed K",
    firstName: "Ahamed",
    phone: "9876510102",
    vehicle: "bike",
    vehicleReg: "KL-11-BX-1024",
    lat: 11.2588,
    lng: 75.7804,
    speed: 28,
    heading: 140,
    battery: 67,
    online: true,
    duty: "available",
    rating: 4.8,
    acceptanceRate: 94,
    activeDeliveries: 0,
    capacity: 8,
    zoneId: "zn_koz",
    todayEarnings: 1250,
    todayDeliveries: 18,
    lastSeen: nowIso(),
  },
  {
    id: "RIDER103",
    name: "Fathima N",
    firstName: "Fathima",
    phone: "9876510103",
    vehicle: "scooter",
    vehicleReg: "KL-11-CD-3311",
    lat: 11.265,
    lng: 75.785,
    speed: 0,
    heading: 90,
    battery: 82,
    online: true,
    duty: "available",
    rating: 4.9,
    acceptanceRate: 97,
    activeDeliveries: 0,
    capacity: 6,
    zoneId: "zn_koz",
    todayEarnings: 980,
    todayDeliveries: 12,
    lastSeen: nowIso(),
  },
  {
    id: "RIDER104",
    name: "Ravi Menon",
    firstName: "Ravi",
    phone: "9876510104",
    vehicle: "bike",
    vehicleReg: "KL-11-EF-7788",
    lat: 11.262,
    lng: 75.788,
    speed: 32,
    heading: 40,
    battery: 54,
    online: true,
    duty: "delivering",
    rating: 4.6,
    acceptanceRate: 88,
    activeDeliveries: 2,
    capacity: 8,
    zoneId: "zn_koz",
    todayEarnings: 1640,
    todayDeliveries: 21,
    lastSeen: nowIso(),
  },
  {
    id: "RIDER105",
    name: "Priya Das",
    firstName: "Priya",
    phone: "9876510105",
    vehicle: "car",
    vehicleReg: "KL-11-GH-2210",
    lat: 11.272,
    lng: 75.795,
    speed: 18,
    heading: 200,
    battery: 91,
    online: true,
    duty: "available",
    rating: 4.7,
    acceptanceRate: 91,
    activeDeliveries: 1,
    capacity: 20,
    zoneId: "zn_koz",
    todayEarnings: 2100,
    todayDeliveries: 9,
    lastSeen: nowIso(),
  },
  {
    id: "RIDER106",
    name: "Jibin P",
    firstName: "Jibin",
    phone: "9876510106",
    vehicle: "bike",
    vehicleReg: "KL-11-JK-5566",
    lat: 11.252,
    lng: 75.776,
    speed: 24,
    heading: 310,
    battery: 41,
    online: true,
    duty: "pickup",
    rating: 4.5,
    acceptanceRate: 86,
    activeDeliveries: 1,
    capacity: 8,
    zoneId: "zn_koz",
    todayEarnings: 740,
    todayDeliveries: 11,
    lastSeen: nowIso(),
  },
  {
    id: "RIDER107",
    name: "Sneha R",
    firstName: "Sneha",
    phone: "9876510107",
    vehicle: "scooter",
    vehicleReg: "KL-11-LM-9090",
    lat: 11.28,
    lng: 75.77,
    speed: 0,
    heading: 0,
    battery: 100,
    online: false,
    duty: "offline",
    rating: 4.4,
    acceptanceRate: 80,
    activeDeliveries: 0,
    capacity: 6,
    zoneId: "zn_koz",
    todayEarnings: 0,
    todayDeliveries: 0,
    lastSeen: minutesAgo(180),
  },
];

const zones: Zone[] = [
  {
    id: "zn_koz",
    country: "India",
    state: "Kerala",
    city: "Kozhikode",
    name: "Kozhikode City",
    pincodes: ["673001", "673002", "673004", "673016", "673631"],
    maxDistanceKm: 25,
    vehicles: ["bike", "scooter", "car", "auto", "van"],
    sameDay: true,
    hours: "07:00–22:00",
  },
  {
    id: "zn_feroke",
    country: "India",
    state: "Kerala",
    city: "Kozhikode",
    name: "Feroke",
    pincodes: ["673631", "673632"],
    maxDistanceKm: 18,
    vehicles: ["bike", "scooter", "auto"],
    sameDay: true,
    hours: "08:00–21:00",
  },
];

const pricingRules: PricingRule[] = [{ ...DEFAULT_PRICING }];

const tickets: SupportTicket[] = [
  {
    id: "tk_1001",
    companyId: "co_quickfynd",
    awb: "QFD12345601",
    subject: "Customer requested reschedule",
    status: "open",
    createdAt: minutesAgo(40),
  },
];

const walletTxns: WalletTxn[] = [];
const gpsPings: GpsPing[] = [];
const deliveries: Delivery[] = [];
const ratings: {
  id: string;
  deliveryId: string;
  awb: string;
  riderId?: string;
  overall: number;
  partner?: number;
  speed?: number;
  handling?: number;
  behaviour?: number;
  tipInr?: number;
  note?: string;
  at: string;
}[] = [];
const savedPlaces: Record<
  string,
  {
    id: string;
    label: string;
    line: string;
    city: string;
    lat: number;
    lng: number;
    pincode?: string;
  }[]
> = {};

function history(status: DeliveryStatus, mins: number, note?: string) {
  return { status, at: minutesAgo(mins), note };
}

function seedDelivery(partial: Omit<Delivery, "history" | "declinedRiderIds"> & {
  history?: Delivery["history"];
  declinedRiderIds?: string[];
}): Delivery {
  return {
    declinedRiderIds: [],
    history: [{ status: partial.status, at: partial.createdAt }],
    ...partial,
  };
}

function seed() {
  if (deliveries.length) return;

  const qfWh = sellers[0].pickup;
  const electronics = sellers[1].pickup;
  const nilaas = sellers[2].pickup;

  deliveries.push(
    seedDelivery({
      id: "dl_live1",
      awb: "QFD12345601",
      companyId: "co_quickfynd",
      sellerId: "sl_warehouse",
      source: "ecommerce",
      orderId: "QF-ORD-8801",
      status: "out_for_delivery",
      pickup: qfWh,
      drop: {
        name: "Ahamed",
        phone: "9999999999",
        line: "Mavoor Road, Kozhikode",
        city: "Kozhikode",
        pincode: "673004",
        lat: 11.2655,
        lng: 75.79,
      },
      package: { type: "headphones", weightKg: 0.6, count: 1, fragile: true },
      payment: { type: "cod", amount: 1499 },
      deliveryType: "express",
      vehicle: "bike",
      riderId: "RIDER104",
      price: quotePrice({
        pickup: qfWh,
        drop: { lat: 11.2655, lng: 75.79 },
        weightKg: 0.6,
        deliveryType: "express",
        paymentType: "cod",
      }),
      deliveryOtp: "7231",
      stopsBefore: 1,
      createdAt: minutesAgo(90),
      updatedAt: minutesAgo(8),
      pickedUpAt: minutesAgo(35),
      history: [
        history("created", 90),
        history("ready_for_pickup", 70),
        history("rider_assigned", 55),
        history("picked_up", 35),
        history("out_for_delivery", 8),
      ],
    }),
    seedDelivery({
      id: "dl_live2",
      awb: "QFD12345602",
      companyId: "co_quickfynd",
      sellerId: "sl_electronics",
      source: "manual",
      orderId: "QF-ORD-8802",
      status: "going_to_pickup",
      pickup: electronics,
      drop: {
        name: "Anjali Menon",
        phone: "9900112233",
        line: "Medical College, Kozhikode",
        city: "Kozhikode",
        pincode: "673016",
        lat: 11.275,
        lng: 75.837,
      },
      package: { type: "phone case", weightKg: 0.3, count: 1, fragile: false },
      payment: { type: "prepaid", amount: 0 },
      deliveryType: "same_day",
      vehicle: "bike",
      riderId: "RIDER106",
      price: quotePrice({
        pickup: electronics,
        drop: { lat: 11.275, lng: 75.837 },
        weightKg: 0.3,
        deliveryType: "same_day",
      }),
      pickupOtp: "5682",
      stopsBefore: 0,
      createdAt: minutesAgo(40),
      updatedAt: minutesAgo(6),
      history: [
        history("created", 40),
        history("ready_for_pickup", 25),
        history("rider_assigned", 12),
        history("going_to_pickup", 6),
      ],
    }),
    seedDelivery({
      id: "dl_search",
      awb: "QFD12345603",
      companyId: "co_nilaas",
      sellerId: "sl_nilaas",
      source: "company_api",
      orderId: "NL-4412",
      status: "searching_rider",
      pickup: nilaas,
      drop: {
        name: "Rahul K",
        phone: "9812345670",
        line: "Calicut Beach Road",
        city: "Kozhikode",
        pincode: "673032",
        lat: 11.258,
        lng: 75.77,
      },
      package: { type: "apparel", weightKg: 1.2, count: 2, fragile: false },
      payment: { type: "cod", amount: 899 },
      deliveryType: "standard",
      vehicle: "scooter",
      price: quotePrice({
        pickup: nilaas,
        drop: { lat: 11.258, lng: 75.77 },
        weightKg: 1.2,
        paymentType: "cod",
      }),
      stopsBefore: 0,
      createdAt: minutesAgo(12),
      updatedAt: minutesAgo(2),
    }),
    seedDelivery({
      id: "dl_public",
      awb: "QFD12345604",
      companyId: "co_quickfynd",
      source: "public",
      orderId: "PUB-14KM",
      status: "ready_for_pickup",
      pickup: {
        name: "Arun",
        phone: "9847001122",
        line: "Kozhikode city",
        city: "Kozhikode",
        pincode: "673001",
        lat: 11.2588,
        lng: 75.7804,
      },
      drop: {
        name: "Meera",
        phone: "9847003344",
        line: "Feroke",
        city: "Kozhikode",
        pincode: "673631",
        lat: 11.18,
        lng: 75.83,
      },
      package: { type: "laptop", weightKg: 2, count: 1, fragile: true },
      payment: { type: "prepaid", amount: 0 },
      deliveryType: "express",
      vehicle: "bike",
      price: quotePrice({
        pickup: { lat: 11.2588, lng: 75.7804 },
        drop: { lat: 11.18, lng: 75.83 },
        weightKg: 2,
        deliveryType: "express",
      }),
      stopsBefore: 0,
      createdAt: minutesAgo(18),
      updatedAt: minutesAgo(18),
    }),
    seedDelivery({
      id: "dl_done",
      awb: "QFD12345605",
      companyId: "co_quickfynd",
      sellerId: "sl_warehouse",
      source: "ecommerce",
      orderId: "QF-ORD-8790",
      status: "delivered",
      pickup: qfWh,
      drop: {
        name: "Sana",
        phone: "9895007788",
        line: "Palayam, Kozhikode",
        city: "Kozhikode",
        pincode: "673002",
        lat: 11.251,
        lng: 75.778,
      },
      package: { type: "books", weightKg: 1.4, count: 1, fragile: false },
      payment: { type: "cod", amount: 650 },
      deliveryType: "standard",
      vehicle: "bike",
      riderId: "RIDER102",
      price: quotePrice({
        pickup: qfWh,
        drop: { lat: 11.251, lng: 75.778 },
        weightKg: 1.4,
        paymentType: "cod",
      }),
      stopsBefore: 0,
      createdAt: minutesAgo(240),
      updatedAt: minutesAgo(50),
      pickedUpAt: minutesAgo(180),
      deliveredAt: minutesAgo(50),
      history: [
        history("created", 240),
        history("picked_up", 180),
        history("delivered", 50, "OTP verified"),
      ],
    }),
    seedDelivery({
      id: "dl_fail",
      awb: "QFD12345606",
      companyId: "co_localmart",
      source: "manual",
      orderId: "LM-220",
      status: "failed",
      pickup: {
        name: "Local Mart",
        phone: "9876501234",
        line: "Indira Gandhi Road",
        city: "Kozhikode",
        pincode: "673001",
        lat: 11.255,
        lng: 75.782,
      },
      drop: {
        name: "Vishnu",
        phone: "9745002211",
        line: "West Hill",
        city: "Kozhikode",
        pincode: "673005",
        lat: 11.27,
        lng: 75.76,
      },
      package: { type: "groceries", weightKg: 4, count: 1, fragile: false },
      payment: { type: "cod", amount: 420 },
      deliveryType: "same_day",
      vehicle: "scooter",
      riderId: "RIDER105",
      price: quotePrice({
        pickup: { lat: 11.255, lng: 75.782 },
        drop: { lat: 11.27, lng: 75.76 },
        weightKg: 4,
        deliveryType: "same_day",
        paymentType: "cod",
      }),
      failReason: "Customer unavailable",
      stopsBefore: 0,
      createdAt: minutesAgo(200),
      updatedAt: minutesAgo(20),
    }),
  );

  for (const rider of riders) {
    gpsPings.push({
      riderId: rider.id,
      lat: rider.lat,
      lng: rider.lng,
      speed: rider.speed,
      heading: rider.heading,
      battery: rider.battery,
      at: rider.lastSeen,
    });
  }
}

seed();

let lastGpsTick = Date.now();

function findDelivery(idOrAwb: string) {
  const key = idOrAwb.toUpperCase();
  return (
    deliveries.find(
      (d) => d.id === idOrAwb || d.awb.toUpperCase() === key,
    ) ?? null
  );
}

function findRider(id: string) {
  return riders.find((r) => r.id === id) ?? null;
}

function findCompany(idOrSlug: string) {
  return (
    companies.find((c) => c.id === idOrSlug || c.slug === idOrSlug) ?? null
  );
}

function pushStatus(d: Delivery, status: DeliveryStatus, note?: string) {
  d.status = status;
  d.updatedAt = nowIso();
  d.history.push({ status, at: d.updatedAt, note });
}

function expireOffers() {
  const now = Date.now();
  for (const d of deliveries) {
    if (
      d.status === "searching_rider" &&
      d.offeredRiderId &&
      d.offerExpiresAt &&
      new Date(d.offerExpiresAt).getTime() < now
    ) {
      d.declinedRiderIds.push(d.offeredRiderId);
      d.offeredRiderId = undefined;
      d.offerExpiresAt = undefined;
      offerNext(d);
    }
  }
}

function vehicleMatch(riderVehicle: VehicleType, wanted: VehicleType) {
  if (riderVehicle === wanted) return true;
  if (
    (wanted === "bike" || wanted === "scooter") &&
    (riderVehicle === "bike" || riderVehicle === "scooter")
  ) {
    return true;
  }
  if (
    (wanted === "van" || wanted === "mini_van") &&
    (riderVehicle === "van" || riderVehicle === "mini_van")
  ) {
    return true;
  }
  return false;
}

function offerNext(d: Delivery, preferredRiderId?: string) {
  let ranked = rankRiders(riders, d.pickup).filter(
    (row) =>
      !d.declinedRiderIds.includes(row.rider.id) &&
      vehicleMatch(row.rider.vehicle, d.vehicle),
  );
  if (!ranked.length) {
    ranked = rankRiders(riders, d.pickup).filter(
      (row) => !d.declinedRiderIds.includes(row.rider.id),
    );
  }
  const preferred = preferredRiderId
    ? ranked.find((row) => row.rider.id === preferredRiderId)
    : undefined;
  const next = preferred ?? ranked[0];
  if (!next) {
    d.offeredRiderId = undefined;
    d.offerExpiresAt = undefined;
    return { offered: null as Rider | null, candidates: ranked };
  }
  d.offeredRiderId = next.rider.id;
  d.offerExpiresAt = new Date(Date.now() + 30_000).toISOString();
  if (d.status === "ready_for_pickup" || d.status === "created") {
    pushStatus(d, "searching_rider", `Offered to ${next.rider.firstName}`);
  }
  return { offered: next.rider, candidates: ranked };
}

export const deliveryDb = {
  companies,
  sellers,
  riders,
  zones,
  pricingRules,
  tickets,
  walletTxns,
  gpsPings,
  deliveries,
  ratings,
  savedPlaces,
  findDelivery,
  findRider,
  findCompany,

  listDeliveries(filter?: {
    companyId?: string;
    sellerId?: string;
    status?: DeliveryStatus | "active" | "unassigned";
    source?: Delivery["source"];
    q?: string;
    phone?: string;
  }) {
    expireOffers();
    let list = [...deliveries];
    if (filter?.companyId) {
      const company = findCompany(filter.companyId);
      list = list.filter((d) => d.companyId === (company?.id ?? filter.companyId));
    }
    if (filter?.sellerId) list = list.filter((d) => d.sellerId === filter.sellerId);
    if (filter?.source) list = list.filter((d) => d.source === filter.source);
    if (filter?.phone) {
      const p = filter.phone.replace(/\D/g, "");
      list = list.filter(
        (d) =>
          d.pickup.phone.replace(/\D/g, "").includes(p) ||
          d.drop.phone.replace(/\D/g, "").includes(p),
      );
    }
    if (filter?.status === "active") {
      list = list.filter(
        (d) => !["delivered", "cancelled", "returned", "failed"].includes(d.status),
      );
    } else if (filter?.status === "unassigned") {
      list = list.filter((d) => !d.riderId && d.status !== "cancelled");
    } else if (filter?.status) {
      list = list.filter((d) => d.status === filter.status);
    }
    if (filter?.q) {
      const q = filter.q.toLowerCase();
      list = list.filter(
        (d) =>
          d.awb.toLowerCase().includes(q) ||
          d.drop.name.toLowerCase().includes(q) ||
          d.pickup.name.toLowerCase().includes(q) ||
          (d.orderId ?? "").toLowerCase().includes(q),
      );
    }
    return list.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
  },

  quote(input: QuoteInput) {
    return quotePrice(input, pricingRules[0] ?? DEFAULT_PRICING);
  },

  createDelivery(input: CreateDeliveryInput) {
    const company =
      findCompany(input.companyId ?? "co_quickfynd") ?? companies[0];
    const norm = normalizeCreateInput(input);
    const price = quotePrice(
      {
        pickup: norm.pickup,
        drop: norm.drop,
        weightKg: norm.package.weightKg,
        deliveryType: norm.deliveryType,
        paymentType: norm.payment.type,
        vehicle: norm.vehicle,
      },
      pricingRules[0],
    );
    const now = nowIso();
    const delivery: Delivery = {
      id: newId("dl"),
      awb: newAwb("QFD"),
      companyId: company.id,
      sellerId: input.sellerId,
      source: input.source ?? "manual",
      orderId: input.orderId,
      status: "ready_for_pickup",
      pickup: norm.pickup,
      drop: norm.drop,
      package: norm.package,
      payment: norm.payment,
      deliveryType: norm.deliveryType,
      vehicle: norm.vehicle,
      scheduledAt: input.scheduledAt,
      price,
      pickupOtp: otpCode(),
      deliveryOtp: otpCode(),
      declinedRiderIds: [],
      stopsBefore: 0,
      createdAt: now,
      updatedAt: now,
      history: [
        { status: "created", at: now },
        { status: "ready_for_pickup", at: now },
      ],
    };
    deliveries.unshift(delivery);
    if (input.assignMode === "choose" && input.preferredRiderId) {
      this.requestRider(delivery.id, input.preferredRiderId);
    } else if (input.autoDispatch !== false) {
      this.dispatch(delivery.id);
    }
    return delivery;
  },

  dispatch(idOrAwb: string, preferredRiderId?: string) {
    const d = findDelivery(idOrAwb);
    if (!d) return null;
    expireOffers();
    const result = offerNext(d, preferredRiderId);
    return { delivery: d, ...result };
  },

  requestRider(idOrAwb: string, riderId: string) {
    const d = findDelivery(idOrAwb);
    const rider = findRider(riderId);
    if (!d || !rider) return { ok: false as const, error: "Not found" };
    if (!rider.online || rider.duty === "offline" || rider.duty === "break") {
      return { ok: false as const, error: "Rider unavailable", delivery: d };
    }
    expireOffers();
    d.offeredRiderId = rider.id;
    d.offerExpiresAt = new Date(Date.now() + 25_000).toISOString();
    pushStatus(d, "searching_rider", `Requested ${rider.firstName}`);
    return { ok: true as const, delivery: d, offered: rider };
  },

  nearbyPartners(pickup: { lat: number; lng: number }, vehicle?: VehicleType) {
    let ranked = rankRiders(riders, pickup, 12).filter((row) =>
      vehicle ? vehicleMatch(row.rider.vehicle, vehicle) : true,
    );
    if (!ranked.length) ranked = rankRiders(riders, pickup, 12);
    const nearest = ranked[0];
    const pickupEtas = ranked.map((row) => etaMinutes(row.distanceKm));
    const avgPickup =
      pickupEtas.length === 0
        ? 8
        : Math.round(pickupEtas.reduce((a, b) => a + b, 0) / pickupEtas.length);
    const byVehicle = riders
      .filter((r) => r.online && r.duty !== "offline" && r.duty !== "break")
      .reduce(
        (acc, r) => {
          acc[r.vehicle] = (acc[r.vehicle] ?? 0) + 1;
          return acc;
        },
        {} as Record<string, number>,
      );
    return {
      available: ranked.length,
      nearestKm: nearest ? Math.round(nearest.distanceKm * 10) / 10 : null,
      nearestEtaMin: nearest ? etaMinutes(nearest.distanceKm) : null,
      averagePickupMin: avgPickup,
      pickupWindow: nearest
        ? `${etaMinutes(nearest.distanceKm)}–${avgPickup + 3} min`
        : "—",
      byVehicle,
      partners: ranked.slice(0, 12).map((row) =>
        partnerCard(row.rider, pickup, false),
      ),
      recommendedVehicle: recommendVehicle(1, "Documents"),
    };
  },

  availabilitySummary(pickup: { lat: number; lng: number }) {
    const all = this.nearbyPartners(pickup);
    return {
      bikes: (all.byVehicle.bike ?? 0) + (all.byVehicle.scooter ?? 0),
      autos: all.byVehicle.auto ?? 0,
      miniTrucks: all.byVehicle.mini_van ?? 0,
      vans: all.byVehicle.van ?? 0,
      trucks: all.byVehicle.truck ?? 0,
      total: all.available,
    };
  },

  rateDelivery(
    idOrAwb: string,
    input: {
      overall: number;
      partner?: number;
      speed?: number;
      handling?: number;
      behaviour?: number;
      tipInr?: number;
      note?: string;
    },
  ) {
    const d = findDelivery(idOrAwb);
    if (!d) return null;
    const rating = {
      id: newId("rt"),
      deliveryId: d.id,
      awb: d.awb,
      riderId: d.riderId,
      ...input,
      at: nowIso(),
    };
    ratings.unshift(rating);
    if (input.tipInr && input.tipInr > 0 && d.riderId) {
      walletTxns.unshift({
        id: newId("tx"),
        riderId: d.riderId,
        type: "tip",
        amount: input.tipInr,
        note: `Tip on ${d.awb}`,
        at: nowIso(),
      });
    }
    return rating;
  },

  listPlaces(ownerKey: string) {
    return savedPlaces[ownerKey] ?? [];
  },

  savePlace(
    ownerKey: string,
    place: { label: string; line: string; city: string; lat: number; lng: number; pincode?: string },
  ) {
    const list = savedPlaces[ownerKey] ?? [];
    const row = { id: newId("pl"), ...place };
    savedPlaces[ownerKey] = [row, ...list.filter((p) => p.label !== place.label)];
    return row;
  },

  accept(idOrAwb: string, riderId: string) {
    const d = findDelivery(idOrAwb);
    const rider = findRider(riderId);
    if (!d || !rider) return null;
    d.riderId = rider.id;
    d.offeredRiderId = undefined;
    d.offerExpiresAt = undefined;
    rider.duty = "pickup";
    rider.activeDeliveries += 1;
    pushStatus(d, "rider_assigned", `${rider.firstName} accepted`);
    pushStatus(d, "going_to_pickup");
    return { delivery: d, rider };
  },

  decline(idOrAwb: string, riderId: string) {
    const d = findDelivery(idOrAwb);
    if (!d) return null;
    if (!d.declinedRiderIds.includes(riderId)) d.declinedRiderIds.push(riderId);
    d.offeredRiderId = undefined;
    d.offerExpiresAt = undefined;
    const result = offerNext(d);
    return { delivery: d, ...result };
  },

  setStatus(
    idOrAwb: string,
    status?: DeliveryStatus,
    extra?: { failReason?: string; note?: string },
  ) {
    const d = findDelivery(idOrAwb);
    if (!d) return null;
    const next = status ?? nextStatus(d.status);
    if (!next) return { delivery: d };
    if (next === "picked_up") d.pickedUpAt = nowIso();
    if (next === "delivered") {
      d.deliveredAt = nowIso();
      const rider = d.riderId ? findRider(d.riderId) : null;
      if (rider) {
        rider.todayDeliveries += 1;
        rider.todayEarnings += d.price.riderEarning;
        rider.activeDeliveries = Math.max(0, rider.activeDeliveries - 1);
        rider.duty = rider.activeDeliveries ? "delivering" : "available";
        walletTxns.unshift({
          id: newId("txn"),
          riderId: rider.id,
          type: "earning",
          amount: d.price.riderEarning,
          note: `Delivery ${d.awb}`,
          at: nowIso(),
        });
      }
      if (d.payment.type === "cod" && d.payment.amount > 0) {
        const company = findCompany(d.companyId);
        if (company) company.codBalance += d.payment.amount;
      }
    }
    if (next === "failed") d.failReason = extra?.failReason ?? "Failed attempt";
    pushStatus(d, next, extra?.note ?? extra?.failReason);
    return { delivery: d };
  },

  verifyOtp(idOrAwb: string, kind: "pickup" | "delivery", code: string) {
    const d = findDelivery(idOrAwb);
    if (!d) return { ok: false as const, error: "Delivery not found" };
    const expected = kind === "pickup" ? d.pickupOtp : d.deliveryOtp;
    if (!expected || expected !== code.trim()) {
      return { ok: false as const, error: "Invalid OTP" };
    }
    if (kind === "pickup") {
      pushStatus(d, "pickup_verified", "Pickup OTP verified");
      pushStatus(d, "picked_up");
      pushStatus(d, "in_transit");
      d.pickedUpAt = nowIso();
      const rider = d.riderId ? findRider(d.riderId) : null;
      if (rider) rider.duty = "delivering";
    } else {
      pushStatus(d, "otp_verified", "Delivery OTP verified");
      this.setStatus(d.id, "delivered", { note: "OTP verified" });
    }
    return { ok: true as const, delivery: d };
  },

  sendOtp(idOrAwb: string, kind: "pickup" | "delivery") {
    const d = findDelivery(idOrAwb);
    if (!d) return null;
    const code = otpCode();
    if (kind === "pickup") d.pickupOtp = code;
    else d.deliveryOtp = code;
    d.updatedAt = nowIso();
    return { delivery: d, kind, code };
  },

  pingGps(input: {
    riderId: string;
    lat: number;
    lng: number;
    speed?: number;
    heading?: number;
    battery?: number;
  }) {
    const rider = findRider(input.riderId);
    if (!rider) return null;
    rider.lat = input.lat;
    rider.lng = input.lng;
    rider.speed = input.speed ?? rider.speed;
    rider.heading = input.heading ?? rider.heading;
    rider.battery = input.battery ?? rider.battery;
    rider.lastSeen = nowIso();
    const ping: GpsPing = {
      riderId: rider.id,
      lat: rider.lat,
      lng: rider.lng,
      speed: rider.speed,
      heading: rider.heading,
      battery: rider.battery,
      at: rider.lastSeen,
    };
    gpsPings.push(ping);
    if (gpsPings.length > 400) gpsPings.splice(0, gpsPings.length - 400);

    for (const d of deliveries) {
      if (d.riderId !== rider.id) continue;
      if (!["picked_up", "in_transit", "out_for_delivery", "rider_arriving"].includes(d.status)) {
        continue;
      }
      const remaining = haversineKm(rider, d.drop);
      if (remaining <= 0.5 && d.status !== "rider_arriving") {
        pushStatus(d, "rider_arriving", "Entered 500m geofence");
      }
    }
    return { rider, ping };
  },

  setRiderOnline(riderId: string, online: boolean) {
    const rider = findRider(riderId);
    if (!rider) return null;
    rider.online = online;
    rider.duty = online ? (rider.activeDeliveries ? "busy" : "available") : "offline";
    rider.lastSeen = nowIso();
    return rider;
  },

  ensureCompany(input: {
    id?: string;
    name?: string;
    slug?: string;
    contactEmail?: string;
  }) {
    if (input.id) {
      const existing = findCompany(input.id);
      if (existing) return existing;
    }
    if (input.slug) {
      const existing = findCompany(input.slug);
      if (existing) return existing;
    }
    const company: Company = {
      id: input.id ?? newId("co"),
      name: input.name ?? "New company",
      slug: input.slug ?? `co-${Date.now().toString().slice(-6)}`,
      type: "ecommerce",
      contactEmail: input.contactEmail ?? "",
      contactPhone: "",
      walletBalance: 0,
      codBalance: 0,
      status: "active",
      plan: "starter",
    };
    companies.push(company);
    return company;
  },

  stats(companyId?: string) {
    expireOffers();
    const list = companyId
      ? deliveries.filter((d) => d.companyId === (findCompany(companyId)?.id ?? companyId))
      : deliveries;
    const count = (status: DeliveryStatus) =>
      list.filter((d) => d.status === status).length;
    const delivered = count("delivered");
    const failed = count("failed");
    const returned = count("returned");
    const terminal = delivered + failed + returned + count("cancelled");
    const active = list.filter(
      (d) => !["delivered", "cancelled", "returned", "failed"].includes(d.status),
    );
    const unassigned = list.filter(
      (d) =>
        !d.riderId &&
        ["ready_for_pickup", "searching_rider", "created", "confirmed"].includes(
          d.status,
        ),
    );
    const delayed = active.filter((d) => {
      const age = Date.now() - new Date(d.createdAt).getTime();
      return age > 3 * 60 * 60 * 1000;
    });
    const codCollected = list
      .filter((d) => d.status === "delivered" && d.payment.type === "cod")
      .reduce((s, d) => s + d.payment.amount, 0);
    const revenue = list
      .filter((d) => d.status === "delivered")
      .reduce((s, d) => s + d.price.total, 0);
    return {
      total: list.length,
      delivered,
      failed,
      returned,
      cancelled: count("cancelled"),
      inTransit: active.length,
      pending: unassigned.length,
      searching: count("searching_rider"),
      assigned: list.filter((d) => Boolean(d.riderId) && d.status !== "delivered").length,
      delayed: delayed.length,
      successRate: terminal === 0 ? 0 : Math.round((delivered / terminal) * 100),
      codCollected,
      revenue,
    };
  },

  tickLiveGps() {
    const now = Date.now();
    const dtSec = Math.min(6, Math.max(0.4, (now - lastGpsTick) / 1000));
    lastGpsTick = now;

    for (const rider of riders) {
      if (!rider.online || rider.duty === "offline" || rider.duty === "break") continue;
      const job = deliveries.find(
        (d) =>
          d.riderId === rider.id &&
          !["delivered", "cancelled", "failed", "returned"].includes(d.status),
      );
      const target = job
        ? ["going_to_pickup", "rider_assigned", "arrived_pickup", "searching_rider"].includes(
            job.status,
          )
          ? job.pickup
          : job.drop
        : null;
      const speedKmh = target ? 32 : 8;
      const stepKm = (speedKmh / 3600) * dtSec;
      if (target) {
        const next = moveToward(rider, target, stepKm);
        rider.heading = (bearingDeg(rider, target) + 360) % 360;
        rider.lat = next.lat;
        rider.lng = next.lng;
        rider.speed = speedKmh;
      } else {
        const wander = (Math.sin(now / 4000 + rider.id.length) * 0.00018);
        rider.lat += wander;
        rider.lng += wander * 0.6;
        rider.heading = (rider.heading + 8) % 360;
        rider.speed = 6;
      }
      rider.lastSeen = nowIso();
      gpsPings.push({
        riderId: rider.id,
        lat: rider.lat,
        lng: rider.lng,
        speed: rider.speed,
        heading: rider.heading,
        battery: rider.battery,
        at: rider.lastSeen,
      });
    }
    if (gpsPings.length > 400) gpsPings.splice(0, gpsPings.length - 400);
  },

  liveOps() {
    expireOffers();
    this.tickLiveGps();
    const stats = this.stats();
    return {
      summary: {
        onlineRiders: riders.filter((r) => r.online).length,
        offlineRiders: riders.filter((r) => !r.online).length,
        activeDeliveries: stats.inTransit,
        waitingAssignment: stats.pending,
        delayed: stats.delayed,
        failed: stats.failed,
        delivered: stats.delivered,
        successRate: stats.successRate,
        codCollected: stats.codCollected,
      },
      riders: riders.map((r) => ({
        ...publicRider(r),
        currentDelivery: deliveries.find(
          (d) =>
            d.riderId === r.id &&
            !["delivered", "cancelled", "failed", "returned"].includes(d.status),
        )?.awb,
      })),
      deliveries: this.listDeliveries({ status: "active" }),
      unassigned: this.listDeliveries({ status: "unassigned" }),
      offers: deliveries
        .filter((d) => d.offeredRiderId)
        .map((d) => ({
          awb: d.awb,
          riderId: d.offeredRiderId,
          expiresAt: d.offerExpiresAt,
        })),
      zones,
    };
  },

  track(awb: string) {
    expireOffers();
    this.tickLiveGps();
    const d = findDelivery(awb);
    if (!d) return null;
    const rider = d.riderId ? findRider(d.riderId) : null;
    const remainingKm = rider ? Number(haversineKm(rider, d.drop).toFixed(1)) : d.price.distanceKm;
    return {
      delivery: d,
      rider: rider ? publicRider(rider) : null,
      remainingKm,
      etaMinutes: etaMinutes(remainingKm),
      lastGps: rider
        ? gpsPings.filter((p) => p.riderId === rider.id).at(-1) ?? null
        : null,
    };
  },

  removeDelivery(idOrAwb: string) {
    const d = findDelivery(idOrAwb);
    if (!d) return false;
    deliveries.splice(deliveries.indexOf(d), 1);
    return true;
  },

  removeCompany(idOrSlug: string) {
    const company = findCompany(idOrSlug);
    if (!company) return false;
    companies.splice(companies.indexOf(company), 1);
    for (let i = deliveries.length - 1; i >= 0; i -= 1) {
      if (deliveries[i].companyId === company.id) deliveries.splice(i, 1);
    }
    for (let i = sellers.length - 1; i >= 0; i -= 1) {
      if (sellers[i].companyId === company.id) sellers.splice(i, 1);
    }
    return true;
  },

  removeRider(id: string) {
    const rider = findRider(id);
    if (!rider) return false;
    riders.splice(riders.indexOf(rider), 1);
    return true;
  },

  removeZone(id: string) {
    const i = zones.findIndex((z) => z.id === id);
    if (i < 0) return false;
    zones.splice(i, 1);
    return true;
  },

  removeTicket(id: string) {
    const i = tickets.findIndex((t) => t.id === id);
    if (i < 0) return false;
    tickets.splice(i, 1);
    return true;
  },

  removeRecord(type: string, id: string) {
    switch (type) {
      case "delivery":
      case "shipment":
      case "pickup":
      case "route":
      case "return":
        return this.removeDelivery(id);
      case "company":
      case "organization":
      case "staff":
        return this.removeCompany(id);
      case "rider":
        return this.removeRider(id);
      case "zone":
      case "hub":
        return this.removeZone(id);
      case "ticket":
      case "support":
        return this.removeTicket(id);
      default:
        return this.removeDelivery(id) || this.removeCompany(id) || this.removeRider(id);
    }
  },
};
