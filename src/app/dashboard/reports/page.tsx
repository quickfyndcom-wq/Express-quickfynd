import { StatGrid } from "@/components/PortalShell";
import { orgShipments, shipmentStats } from "@/lib/courier-store";

export default function Page() {
  const stats = shipmentStats(orgShipments("org_qf"));
  return (
    <div className="space-y-6">
      <h2 className="font-[family-name:var(--font-syne)] text-2xl font-bold">Reports</h2>
      <StatGrid
        items={[
          { label: "Orders", value: stats.total },
          { label: "Success rate", value: `${stats.successRate}%` },
          { label: "Avg delivery", value: `${stats.avgDeliveryDays}d` },
          { label: "Failed", value: stats.failed },
        ]}
      />
    </div>
  );
}
