import { PortalShell } from "@/components/PortalShell";

const OPS_NAV = [
  { href: "/hub", label: "Overview" },
  { href: "/hub/inbound", label: "Pickup" },
  { href: "/hub/sort", label: "Hub sorting" },
  { href: "/hub/dispatch", label: "Dispatch" },
  { href: "/hub/delivery", label: "Delivery" },
  { href: "/hub/returns", label: "Returns" },
  { href: "/hub/inventory", label: "Inventory" },
  { href: "/hub/exceptions", label: "Exceptions" },
];

export default function HubLayout({ children }: { children: React.ReactNode }) {
  return (
    <PortalShell
      title="Operations"
      subtitle="Pickup · Hub sorting · Dispatch · Delivery · Returns"
      accent="Operations · QuickFynd Express"
      nav={OPS_NAV}
    >
      {children}
    </PortalShell>
  );
}
