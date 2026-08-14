import { DataTable, StatGrid } from "@/components/PortalShell";
import { courierDb } from "@/lib/courier-store";

export default function HubHome() {
  const atHub = courierDb.shipments.filter((s) => s.status === "at_hub");
  return (
    <div className="space-y-6">
      <h2 className="font-[family-name:var(--font-syne)] text-2xl font-bold">
        Operations Overview
      </h2>
      <p className="text-sm text-muted">
        Pickup · Hub sorting · Dispatch · Delivery · Returns
      </p>
      <StatGrid
        items={[
          { label: "Parcels at hub", value: atHub.length },
          { label: "Active hubs", value: courierDb.hubs.length },
          {
            label: "Awaiting sort",
            value: courierDb.shipments.filter((s) => s.status === "picked_up")
              .length,
          },
        ]}
      />
      <DataTable
        headers={["Code", "Name", "City"]}
        rows={courierDb.hubs.map((h) => [h.code, h.name, h.city])}
      />
    </div>
  );
}
