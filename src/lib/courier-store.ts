/**
 * In-memory courier store — starts EMPTY.
 * Prefer Firebase Firestore for real data (see src/lib/firestore.ts).
 * Kept for optional API demos until fully migrated.
 */

export type OrgRole =
  | "owner"
  | "admin"
  | "operations"
  | "finance"
  | "support";

export type ShipmentStatus =
  | "created"
  | "awaiting_pickup"
  | "picked_up"
  | "at_hub"
  | "in_transit"
  | "out_for_delivery"
  | "delivered"
  | "failed"
  | "returned";

export type Organization = {
  id: string;
  name: string;
  slug: string;
  type: "ecommerce" | "local" | "internal";
  contactEmail: string;
  contactPhone: string;
  gstin?: string;
  walletBalance: number;
  codBalance: number;
  status: "active" | "suspended";
};

export type OrgUser = {
  id: string;
  orgId: string;
  name: string;
  email: string;
  role: OrgRole;
};

export type PickupAddress = {
  id: string;
  orgId: string;
  label: string;
  address: string;
  pincode: string;
  contactName: string;
  phone: string;
};

export type Shipment = {
  id: string;
  awb: string;
  orgId: string;
  reference?: string;
  bookingNo?: string;
  consigneeName: string;
  consigneePhone: string;
  destination: string;
  pincode: string;
  status: ShipmentStatus;
  codAmount: number;
  weightKg: number;
  createdAt: string;
  updatedAt: string;
  hubId?: string;
  riderId?: string;
};

export type Invoice = {
  id: string;
  orgId: string;
  number: string;
  amount: number;
  status: "draft" | "due" | "paid";
  issuedAt: string;
};

export type SupportTicket = {
  id: string;
  orgId: string;
  awb?: string;
  subject: string;
  status: "open" | "pending" | "resolved";
  createdAt: string;
};

export type Hub = {
  id: string;
  code: string;
  name: string;
  city: string;
};

const organizations: Organization[] = [];
const orgUsers: OrgUser[] = [];
const pickupAddresses: PickupAddress[] = [];
const hubs: Hub[] = [];
const shipments: Shipment[] = [];
const invoices: Invoice[] = [];
const tickets: SupportTicket[] = [];

export function shipmentStats(list: Shipment[]) {
  const count = (status: ShipmentStatus) =>
    list.filter((s) => s.status === status).length;
  const delivered = count("delivered");
  const failed = count("failed");
  const terminal = delivered + failed + count("returned");
  const successRate =
    terminal === 0 ? 0 : Math.round((delivered / terminal) * 100);
  const codCollected = list
    .filter((s) => s.status === "delivered" && s.codAmount > 0)
    .reduce((sum, s) => sum + s.codAmount, 0);
  const codPending = list
    .filter(
      (s) =>
        s.codAmount > 0 &&
        !["delivered", "returned", "failed"].includes(s.status),
    )
    .reduce((sum, s) => sum + s.codAmount, 0);

  return {
    total: list.length,
    awaiting_pickup: count("awaiting_pickup"),
    picked_up: count("picked_up"),
    at_hub: count("at_hub"),
    in_transit: count("in_transit"),
    out_for_delivery: count("out_for_delivery"),
    delivered,
    failed,
    returned: count("returned"),
    created: count("created"),
    codCollected,
    codPending,
    successRate,
    avgDeliveryDays: 0,
  };
}

export const courierDb = {
  organizations,
  orgUsers,
  pickupAddresses,
  hubs,
  shipments,
  invoices,
  tickets,
};

export function getOrg(idOrSlug: string) {
  return (
    organizations.find((o) => o.id === idOrSlug || o.slug === idOrSlug) ?? null
  );
}

export function orgShipments(orgId: string) {
  return shipments.filter((s) => s.orgId === orgId);
}

export function findShipmentByAwb(awb: string) {
  return shipments.find((s) => s.awb.toUpperCase() === awb.toUpperCase());
}

export function createShipmentFromOrder(input: {
  orgId: string;
  reference?: string;
  consigneeName: string;
  consigneePhone: string;
  destination: string;
  pincode: string;
  codAmount?: number;
  weightKg?: number;
}): {
  shipment: Shipment;
  trackingUrl: string;
  pickup: { status: "created"; message: string };
  webhookPreview: { event: string; data: Record<string, unknown> };
} {
  const org = organizations.find((o) => o.id === input.orgId);
  if (!org) throw new Error("Organization not found — create it in Super Admin first");

  const prefix = org.slug.slice(0, 2).toUpperCase() || "QF";
  const awb = `${prefix}${Date.now().toString().slice(-10)}`;
  const now = new Date().toISOString();

  const shipment: Shipment = {
    id: `sh_${Math.random().toString(36).slice(2, 9)}`,
    awb,
    orgId: input.orgId,
    reference: input.reference,
    bookingNo: `BK-${Date.now().toString().slice(-6)}`,
    consigneeName: input.consigneeName,
    consigneePhone: input.consigneePhone,
    destination: input.destination,
    pincode: input.pincode,
    status: "awaiting_pickup",
    codAmount: input.codAmount ?? 0,
    weightKg: input.weightKg ?? 1,
    createdAt: now,
    updatedAt: now,
  };

  shipments.unshift(shipment);

  return {
    shipment,
    trackingUrl: `/track/${awb}`,
    pickup: {
      status: "created",
      message: "Pickup request created — awaiting rider assignment",
    },
    webhookPreview: {
      event: "shipment.created",
      data: {
        awb,
        reference: input.reference,
        status: shipment.status,
        organization: org.slug,
      },
    },
  };
}

const statusOrder: ShipmentStatus[] = [
  "created",
  "awaiting_pickup",
  "picked_up",
  "at_hub",
  "in_transit",
  "out_for_delivery",
  "delivered",
];

export function advanceShipmentStatus(
  awb: string,
  next?: ShipmentStatus,
  riderId?: string,
): {
  shipment: Shipment;
  webhook: { event: string; data: Record<string, unknown> };
} | null {
  const shipment = findShipmentByAwb(awb);
  if (!shipment) return null;

  if (next) {
    shipment.status = next;
  } else {
    const idx = statusOrder.indexOf(shipment.status);
    if (idx >= 0 && idx < statusOrder.length - 1) {
      shipment.status = statusOrder[idx + 1];
    }
  }

  if (riderId) shipment.riderId = riderId;
  shipment.updatedAt = new Date().toISOString();

  const org = organizations.find((o) => o.id === shipment.orgId);

  return {
    shipment,
    webhook: {
      event:
        shipment.status === "delivered"
          ? "shipment.delivered"
          : "shipment.status_updated",
      data: {
        awb: shipment.awb,
        reference: shipment.reference,
        status: shipment.status,
        organization: org?.slug,
        riderId: shipment.riderId,
        updatedAt: shipment.updatedAt,
      },
    },
  };
}
