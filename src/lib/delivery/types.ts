export type DeliveryStatus =
  | "created"
  | "confirmed"
  | "preparing"
  | "ready_for_pickup"
  | "searching_rider"
  | "rider_assigned"
  | "going_to_pickup"
  | "arrived_pickup"
  | "pickup_verified"
  | "picked_up"
  | "in_transit"
  | "out_for_delivery"
  | "rider_arriving"
  | "arrived"
  | "otp_verified"
  | "delivered"
  | "cancelled"
  | "failed"
  | "rescheduled"
  | "return_requested"
  | "return_in_transit"
  | "returned";

export type VehicleType =
  | "bike"
  | "scooter"
  | "car"
  | "auto"
  | "mini_van"
  | "van"
  | "truck";

export type DeliveryType = "standard" | "same_day" | "express" | "scheduled";
export type PaymentType = "prepaid" | "cod";
export type DeliverySource = "ecommerce" | "company_api" | "manual" | "public";
export type RiderDuty =
  | "available"
  | "busy"
  | "pickup"
  | "delivering"
  | "break"
  | "offline";

export type GeoPoint = { lat: number; lng: number };

export type Address = {
  name: string;
  phone: string;
  line: string;
  city: string;
  pincode: string;
  lat: number;
  lng: number;
  instructions?: string;
};

export type Company = {
  id: string;
  name: string;
  slug: string;
  type: "ecommerce" | "local" | "internal" | "public";
  contactEmail: string;
  contactPhone: string;
  gstin?: string;
  walletBalance: number;
  codBalance: number;
  status: "pending" | "active" | "suspended";
  plan: "starter" | "growth" | "enterprise";
};

export type Seller = {
  id: string;
  companyId: string;
  name: string;
  phone: string;
  pickup: Address;
  rating: number;
  status: "active" | "pending" | "suspended";
};

export type Rider = {
  id: string;
  name: string;
  firstName: string;
  phone: string;
  photoUrl?: string;
  vehicle: VehicleType;
  vehicleReg: string;
  lat: number;
  lng: number;
  speed: number;
  heading: number;
  battery: number;
  online: boolean;
  duty: RiderDuty;
  rating: number;
  acceptanceRate: number;
  activeDeliveries: number;
  capacity: number;
  zoneId: string;
  todayEarnings: number;
  todayDeliveries: number;
  lastSeen: string;
};

export type PackageInfo = {
  type: string;
  weightKg: number;
  lengthCm?: number;
  widthCm?: number;
  heightCm?: number;
  count: number;
  fragile: boolean;
  instructions?: string;
};

export type PriceBreakdown = {
  base: number;
  distance: number;
  weight: number;
  express: number;
  cod: number;
  vehicle: number;
  total: number;
  platformFee: number;
  riderEarning: number;
  distanceKm: number;
};

export type Delivery = {
  id: string;
  awb: string;
  companyId: string;
  sellerId?: string;
  source: DeliverySource;
  orderId?: string;
  status: DeliveryStatus;
  pickup: Address;
  drop: Address;
  package: PackageInfo;
  payment: { type: PaymentType; amount: number };
  deliveryType: DeliveryType;
  vehicle: VehicleType;
  scheduledAt?: string;
  riderId?: string;
  price: PriceBreakdown;
  pickupOtp?: string;
  deliveryOtp?: string;
  declinedRiderIds: string[];
  offeredRiderId?: string;
  offerExpiresAt?: string;
  stopsBefore: number;
  createdAt: string;
  updatedAt: string;
  pickedUpAt?: string;
  deliveredAt?: string;
  failReason?: string;
  history: { status: DeliveryStatus; at: string; note?: string }[];
};

export type GpsPing = {
  riderId: string;
  lat: number;
  lng: number;
  speed: number;
  heading: number;
  battery: number;
  at: string;
};

export type Zone = {
  id: string;
  country: string;
  state: string;
  city: string;
  name: string;
  pincodes: string[];
  maxDistanceKm: number;
  vehicles: VehicleType[];
  sameDay: boolean;
  hours: string;
};

export type PricingRule = {
  id: string;
  zoneId: string;
  base: number;
  perKm: number;
  weightPerKg: number;
  express: number;
  sameDay: number;
  cod: number;
};

export type SupportTicket = {
  id: string;
  companyId?: string;
  awb?: string;
  subject: string;
  status: "open" | "pending" | "resolved";
  createdAt: string;
};

export type WalletTxn = {
  id: string;
  riderId: string;
  type: "earning" | "bonus" | "tip" | "cod" | "payout" | "penalty";
  amount: number;
  note: string;
  at: string;
};

export type CreateDeliveryInput = {
  companyId?: string;
  sellerId?: string;
  source?: DeliverySource;
  orderId?: string;
  pickup: Partial<Address> & { name: string; phone: string; line: string };
  customer: Partial<Address> & { name: string; phone: string; address?: string; line?: string };
  package?: Partial<PackageInfo>;
  payment?: { type?: PaymentType; amount?: number };
  deliveryType?: DeliveryType;
  vehicle?: VehicleType;
  scheduledAt?: string;
  autoDispatch?: boolean;
  preferredRiderId?: string;
  assignMode?: "quick" | "choose";
};

export type QuoteInput = {
  pickup: GeoPoint;
  drop: GeoPoint;
  weightKg?: number;
  deliveryType?: DeliveryType;
  paymentType?: PaymentType;
  vehicle?: VehicleType;
  zoneId?: string;
};
