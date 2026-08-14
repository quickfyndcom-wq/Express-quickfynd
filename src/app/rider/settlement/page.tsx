import { DataTable } from "@/components/PortalShell";
import { db } from "@/lib/rider-store";

export default function Page() {
  return (
    <div className="space-y-6">
      <h2 className="font-[family-name:var(--font-syne)] text-2xl font-bold">
        Daily Settlement
      </h2>
      <DataTable
        headers={["Date", "Delivered", "Failed", "COD", "Status"]}
        rows={db.settlements.map((s) => [
          s.date,
          s.totalDelivered,
          s.totalFailed,
          `₹${s.totalCod}`,
          s.status,
        ])}
      />
    </div>
  );
}
