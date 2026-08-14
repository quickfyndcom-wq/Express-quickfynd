import { DataTable } from "@/components/PortalShell";
import { db } from "@/lib/rider-store";

export default function Page() {
  return (
    <div className="space-y-6">
      <h2 className="font-[family-name:var(--font-syne)] text-2xl font-bold">
        Assigned Deliveries
      </h2>
      <DataTable
        headers={["AWB", "Customer", "COD", "Status"]}
        rows={db.deliveries.map((d) => [
          d.awb,
          d.customerName,
          d.codAmount ? `₹${d.codAmount}` : "—",
          d.status,
        ])}
      />
    </div>
  );
}
