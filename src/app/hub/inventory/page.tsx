import { DataTable } from "@/components/PortalShell";
import { courierDb } from "@/lib/courier-store";

export default function Page() {
  const list = courierDb.shipments.filter((s) =>
    ["at_hub", "picked_up"].includes(s.status),
  );
  return (
    <div className="space-y-6">
      <h2 className="font-[family-name:var(--font-syne)] text-2xl font-bold">
        Hub Inventory
      </h2>
      <DataTable
        headers={["AWB", "Destination", "Status"]}
        rows={list.map((s) => [
          s.awb,
          s.destination,
          s.status.replaceAll("_", " "),
        ])}
      />
    </div>
  );
}
