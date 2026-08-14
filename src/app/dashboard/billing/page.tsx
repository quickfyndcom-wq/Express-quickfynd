import { DataTable } from "@/components/PortalShell";
import { courierDb } from "@/lib/courier-store";

export default function Page() {
  const list = courierDb.invoices.filter((i) => i.orgId === "org_qf");
  return (
    <div className="space-y-6">
      <h2 className="font-[family-name:var(--font-syne)] text-2xl font-bold">
        Billing and Invoices
      </h2>
      <p className="text-sm text-muted">
        Invoices under trade name NILAAS · GSTIN 32JWYPS4831L1Z1
      </p>
      <DataTable
        headers={["Invoice", "Amount", "Status", "Issued"]}
        rows={list.map((i) => [
          i.number,
          `₹${i.amount}`,
          i.status,
          new Date(i.issuedAt).toLocaleDateString(),
        ])}
      />
    </div>
  );
}
