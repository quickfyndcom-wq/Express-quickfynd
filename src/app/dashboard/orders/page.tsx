import { DataTable } from "@/components/PortalShell";
import { courierDb, orgShipments } from "@/lib/courier-store";

export default function Page() {
  const list = orgShipments("org_qf");
  return (
    <div className="space-y-6">
      <h2 className="font-[family-name:var(--font-syne)] text-2xl font-bold">Orders</h2>
      <DataTable
        headers={["Reference", "AWB", "Consignee", "Status"]}
        rows={list.map((s) => [
          s.reference ?? s.bookingNo ?? "—",
          s.awb,
          s.consigneeName,
          s.status.replaceAll("_", " "),
        ])}
      />
    </div>
  );
}
