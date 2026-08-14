export type TaskStatus =
  | "assigned"
  | "en_route"
  | "arrived"
  | "completed"
  | "failed";

export type PickupTask = {
  id: string;
  awb: string;
  merchantName: string;
  address: string;
  phone: string;
  lat: number;
  lng: number;
  status: TaskStatus;
  scheduledAt: string;
  riderId: string;
};

export type DeliveryTask = {
  id: string;
  awb: string;
  customerName: string;
  address: string;
  phone: string;
  lat: number;
  lng: number;
  status: TaskStatus;
  codAmount: number;
  otpRequired: boolean;
  scheduledAt: string;
  riderId: string;
};

export type Rider = {
  id: string;
  name: string;
  email: string;
  phone: string;
  hubId: string;
  password: string;
  vehicle: string;
};

export type Attendance = {
  riderId: string;
  date: string;
  checkInAt: string | null;
  checkOutAt: string | null;
};

export type GpsPing = {
  riderId: string;
  lat: number;
  lng: number;
  accuracy: number;
  at: string;
};

export type ScanEvent = {
  id: string;
  riderId: string;
  awb: string;
  taskId: string;
  type: "pickup" | "delivery";
  at: string;
};

export type PodRecord = {
  id: string;
  riderId: string;
  taskId: string;
  awb: string;
  photoUrl?: string;
  signatureUrl?: string;
  otpVerified: boolean;
  at: string;
};

export type CodCollection = {
  id: string;
  riderId: string;
  taskId: string;
  awb: string;
  amount: number;
  method: "cash" | "upi";
  at: string;
};

export type FailedDelivery = {
  id: string;
  riderId: string;
  taskId: string;
  awb: string;
  reason: string;
  notes: string;
  at: string;
};

export type Settlement = {
  id: string;
  riderId: string;
  date: string;
  totalCod: number;
  totalDelivered: number;
  totalFailed: number;
  cashHanded: number;
  status: "open" | "submitted" | "approved";
  submittedAt: string | null;
};

/** Empty until riders are created in Firebase / admin */
const riders: Rider[] = [];
const sessions = new Map<string, string>();
const attendance: Attendance[] = [];
const pickups: PickupTask[] = [];
const deliveries: DeliveryTask[] = [];
const gpsPings: GpsPing[] = [];
const scans: ScanEvent[] = [];
const pods: PodRecord[] = [];
const codCollections: CodCollection[] = [];
const failures: FailedDelivery[] = [];
const settlements: Settlement[] = [];
const otpStore = new Map<string, string>();

function today() {
  return new Date().toISOString().slice(0, 10);
}

function id(prefix: string) {
  return `${prefix}_${Math.random().toString(36).slice(2, 9)}`;
}

export const db = {
  riders,
  sessions,
  attendance,
  pickups,
  deliveries,
  gpsPings,
  scans,
  pods,
  codCollections,
  failures,
  settlements,
  otpStore,
  today,
  id,
};

export function getRiderFromAuth(authHeader: string | null): Rider | null {
  if (!authHeader?.startsWith("Bearer ")) return null;
  const token = authHeader.slice(7);
  const riderId = sessions.get(token);
  if (!riderId) return null;
  return riders.find((r) => r.id === riderId) ?? null;
}

export function publicRider(r: Rider) {
  const { password: _, ...rest } = r;
  return rest;
}
