import type { VehicleType } from "./types";

export type LogisticsService = {
  id: string;
  name: string;
  emoji: string;
  blurb: string;
  vehicles: VehicleType[];
  bestFor: string[];
};

export const LOGISTICS_SERVICES: LogisticsService[] = [
  {
    id: "bike",
    name: "Bike Delivery",
    emoji: "🏍",
    blurb: "Documents, food, medicine, small parcels",
    vehicles: ["bike", "scooter"],
    bestFor: ["Documents", "Food", "Medicine", "Electronics", "Fashion"],
  },
  {
    id: "auto",
    name: "Cargo Auto",
    emoji: "🛺",
    blurb: "Boxes, grocery stock, small furniture",
    vehicles: ["auto"],
    bestFor: ["Grocery", "Boxes / Cartons", "Home Products"],
  },
  {
    id: "mini_truck",
    name: "Mini Truck",
    emoji: "🚚",
    blurb: "Appliances, furniture, commercial goods",
    vehicles: ["mini_van", "van"],
    bestFor: ["Furniture", "Appliances", "Commercial Goods"],
  },
  {
    id: "van",
    name: "Van",
    emoji: "🚐",
    blurb: "Multiple packages and sensitive goods",
    vehicles: ["van"],
    bestFor: ["Boxes / Cartons", "Electronics", "Fragile Goods"],
  },
  {
    id: "truck",
    name: "Truck",
    emoji: "🚛",
    blurb: "Bulk warehouse and commercial transport",
    vehicles: ["truck"],
    bestFor: ["Commercial Goods", "Furniture"],
  },
  {
    id: "parcel",
    name: "Parcel Delivery",
    emoji: "📦",
    blurb: "Standard courier parcels",
    vehicles: ["bike", "scooter"],
    bestFor: ["Documents", "Fashion", "Electronics"],
  },
  {
    id: "movers",
    name: "Packers & Movers",
    emoji: "🏠",
    blurb: "Home and office shifting",
    vehicles: ["van", "truck"],
    bestFor: ["Furniture", "Appliances"],
  },
];

export const GOODS_TYPES = [
  "Documents",
  "Food",
  "Medicine",
  "Electronics",
  "Mobile / Laptop",
  "Fashion",
  "Grocery",
  "Home Products",
  "Furniture",
  "Appliances",
  "Commercial Goods",
  "Boxes / Cartons",
  "Fragile Goods",
  "Other",
] as const;

export const PLACES = {
  Kozhikode: { lat: 11.2588, lng: 75.7804, label: "Kozhikode", pincode: "673001" },
  Feroke: { lat: 11.18, lng: 75.83, label: "Feroke", pincode: "673631" },
  "Mavoor Road": { lat: 11.2655, lng: 75.79, label: "Mavoor Road", pincode: "673004" },
  Palayam: { lat: 11.251, lng: 75.778, label: "Palayam", pincode: "673002" },
  "Medical College": { lat: 11.275, lng: 75.837, label: "Medical College", pincode: "673016" },
} as const;

export function recommendVehicle(weightKg: number, goods: string): VehicleType {
  if (["Furniture", "Appliances", "Commercial Goods"].includes(goods) || weightKg >= 80) {
    return "van";
  }
  if (weightKg >= 25) return "auto";
  if (weightKg >= 8) return "scooter";
  return "bike";
}

export function serviceForVehicle(vehicle: VehicleType) {
  return (
    LOGISTICS_SERVICES.find((s) => s.vehicles.includes(vehicle)) ?? LOGISTICS_SERVICES[0]
  );
}
