import { DataTable } from "@/components/PortalShell";
import { courierDb } from "@/lib/courier-store";

export default function Page() {
  const list = courierDb.shipments.filter((s) =>
    ["out_for_delivery", "in_transit"].includes(s.status),
  );
  return (
    <div className="space-y-6">
      <h2 className="font-[family-name:var(--font-syne)] text-2xl font-bold">
        Delivery
      </h2>
      <p className="text-sm text-muted">
        Parcels currently moving to consignees.
      </p>
      <DataTable
        headers={["AWB", "Consignee", "Pincode", "Status"]}
        rows={list.map((s) => [
          s.awb,
          s.consigneeName,
          s.pincode,
          s.status.replaceAll("_", " "),
        ])}
      />
    </div>
  );
}
