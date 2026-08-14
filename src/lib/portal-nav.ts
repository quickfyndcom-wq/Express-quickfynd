export type NavItem = { href: string; label: string };
export type NavGroup = { label: string; items: NavItem[] };

export const SUPER_ADMIN_NAV_GROUPS: NavGroup[] = [
  {
    label: "Home",
    items: [
      { href: "/super-admin", label: "Overview" },
      { href: "/super-admin/live", label: "Live operations" },
      { href: "/super-admin/bookings", label: "Public bookings" },
      { href: "/super-admin/customers", label: "Companies" },
    ],
  },
  {
    label: "Network",
    items: [
      { href: "/super-admin/deliveries", label: "All deliveries" },
      { href: "/super-admin/shipments", label: "Shipments" },
      { href: "/super-admin/riders", label: "Delivery partners" },
      { href: "/super-admin/pickups", label: "Pickups" },
      { href: "/super-admin/hubs", label: "Hubs" },
      { href: "/super-admin/routes", label: "Routes" },
      { href: "/super-admin/returns", label: "Returns" },
      { href: "/super-admin/zones", label: "Zones" },
    ],
  },
  {
    label: "Money",
    items: [
      { href: "/super-admin/pricing", label: "Pricing" },
      { href: "/super-admin/billing", label: "Billing" },
      { href: "/super-admin/cod", label: "COD settlement" },
      { href: "/super-admin/wallets", label: "Wallets" },
      { href: "/super-admin/reports", label: "Reports" },
    ],
  },
  {
    label: "Platform",
    items: [
      { href: "/super-admin/support", label: "Support" },
      { href: "/super-admin/api", label: "API" },
      { href: "/super-admin/notifications", label: "Notifications" },
      { href: "/super-admin/staff", label: "Staff" },
      { href: "/super-admin/settings", label: "Settings" },
      { href: "/super-admin/audit", label: "Audit logs" },
    ],
  },
];

export const SUPER_ADMIN_NAV = SUPER_ADMIN_NAV_GROUPS.flatMap((g) => g.items);

export const CUSTOMER_NAV_GROUPS: NavGroup[] = [
  {
    label: "Shipping",
    items: [
      { href: "/dashboard", label: "Overview" },
      { href: "/dashboard/create", label: "Create delivery" },
      { href: "/logistics", label: "Book courier" },
      { href: "/dashboard/logistics", label: "Public bookings" },
      { href: "/dashboard/deliveries", label: "Deliveries" },
      { href: "/dashboard/bulk", label: "Bulk upload" },
      { href: "/dashboard/orders", label: "Orders" },
      { href: "/dashboard/pickups", label: "Pickups" },
      { href: "/dashboard/shipments", label: "Shipments" },
      { href: "/dashboard/live", label: "Live tracking" },
      { href: "/dashboard/returns", label: "Returns" },
    ],
  },
  {
    label: "Finance",
    items: [
      { href: "/dashboard/cod", label: "COD settlements" },
      { href: "/dashboard/wallet", label: "Wallet" },
      { href: "/dashboard/rates", label: "Rate calculator" },
      { href: "/dashboard/billing", label: "Billing & invoices" },
      { href: "/dashboard/reports", label: "Reports" },
    ],
  },
  {
    label: "Developers",
    items: [
      { href: "/dashboard/api", label: "API integration" },
      { href: "/dashboard/webhooks", label: "Webhooks" },
    ],
  },
  {
    label: "Account",
    items: [
      { href: "/dashboard/support", label: "Support" },
      { href: "/dashboard/team", label: "Team members" },
      { href: "/dashboard/settings", label: "Company settings" },
    ],
  },
];

export const CUSTOMER_NAV = CUSTOMER_NAV_GROUPS.flatMap((g) => g.items);

export const HUB_NAV = [
  { href: "/hub", label: "Overview" },
  { href: "/hub/inbound", label: "Pickup" },
  { href: "/hub/sort", label: "Hub sorting" },
  { href: "/hub/dispatch", label: "Dispatch" },
  { href: "/hub/delivery", label: "Delivery" },
  { href: "/hub/returns", label: "Returns" },
  { href: "/hub/inventory", label: "Inventory" },
  { href: "/hub/exceptions", label: "Exceptions" },
];

export const SELLER_NAV_GROUPS: NavGroup[] = [
  {
    label: "Seller",
    items: [
      { href: "/seller", label: "Overview" },
      { href: "/seller/orders", label: "Orders" },
    ],
  },
];

export const RIDER_NAV = [
  { href: "/rider", label: "Duty / Attendance" },
  { href: "/rider/pickups", label: "Pickups" },
  { href: "/rider/deliveries", label: "Deliveries" },
  { href: "/rider/scan", label: "Scan / Navigation" },
  { href: "/rider/cod", label: "OTP / COD" },
  { href: "/rider/settlement", label: "Live tracking / Settlement" },
];
