import { StatGrid } from "@/components/PortalShell";
import { getOrg, orgShipments, shipmentStats } from "@/lib/courier-store";

export default function Page() {
  const org = getOrg("quickfynd");
  const stats = shipmentStats(org ? orgShipments(org.id) : []);
  return (
    <div className="space-y-6">
      <h2 className="font-[family-name:var(--font-syne)] text-2xl font-bold">
        COD Settlements
      </h2>
      <p className="text-sm text-muted">
        Empty until your organization and shipments exist in the database.
      </p>
      <StatGrid
        items={[
          { label: "COD collected", value: `₹${stats.codCollected}` },
          { label: "COD pending", value: `₹${stats.codPending}` },
          { label: "Org COD balance", value: `₹${org?.codBalance ?? 0}` },
        ]}
      />
    </div>
  );
}
