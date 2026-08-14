import { DataTable } from "@/components/PortalShell";
import { db } from "@/lib/rider-store";

export default function Page() {
  return (
    <div className="space-y-6">
      <h2 className="font-[family-name:var(--font-syne)] text-2xl font-bold">
        Assigned Pickups
      </h2>
      <DataTable
        headers={["AWB", "Merchant", "Address", "Status"]}
        rows={db.pickups.map((p) => [
          p.awb,
          p.merchantName,
          p.address,
          p.status,
        ])}
      />
    </div>
  );
}
