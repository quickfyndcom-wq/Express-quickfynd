import { DataTable } from "@/components/PortalShell";
import { db } from "@/lib/rider-store";

export default function Page() {
  return (
    <div className="space-y-6">
      <h2 className="font-[family-name:var(--font-syne)] text-2xl font-bold">
        COD Collection
      </h2>
      <DataTable
        headers={["AWB", "Amount", "Method", "Time"]}
        rows={db.codCollections.map((c) => [
          c.awb,
          `₹${c.amount}`,
          c.method,
          new Date(c.at).toLocaleString(),
        ])}
      />
    </div>
  );
}
