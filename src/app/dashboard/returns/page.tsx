import { DataTable } from "@/components/PortalShell";
import { orgShipments } from "@/lib/courier-store";

export default function Page() {
  const list = orgShipments("org_qf").filter((s) => s.status === "returned");
  return (
    <div className="space-y-6">
      <h2 className="font-[family-name:var(--font-syne)] text-2xl font-bold">Returns</h2>
      <DataTable
        headers={["AWB", "Consignee", "Destination", "Status"]}
        rows={list.map((s) => [
          s.awb,
          s.consigneeName,
          s.destination,
          s.status,
        ])}
      />
    </div>
  );
}
