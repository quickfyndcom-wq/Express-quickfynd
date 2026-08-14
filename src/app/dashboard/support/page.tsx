import { DataTable } from "@/components/PortalShell";
import { courierDb } from "@/lib/courier-store";

export default function Page() {
  const list = courierDb.tickets.filter((t) => t.orgId === "org_qf");
  return (
    <div className="space-y-6">
      <h2 className="font-[family-name:var(--font-syne)] text-2xl font-bold">Support</h2>
      <DataTable
        headers={["Subject", "AWB", "Status", "Created"]}
        rows={list.map((t) => [
          t.subject,
          t.awb ?? "—",
          t.status,
          new Date(t.createdAt).toLocaleDateString(),
        ])}
      />
    </div>
  );
}
