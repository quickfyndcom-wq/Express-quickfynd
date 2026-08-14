import { DataTable } from "@/components/PortalShell";
import { courierDb } from "@/lib/courier-store";

export default function Page() {
  const users = courierDb.orgUsers.filter((u) => u.orgId === "org_qf");
  return (
    <div className="space-y-6">
      <h2 className="font-[family-name:var(--font-syne)] text-2xl font-bold">
        Team Members
      </h2>
      <DataTable
        headers={["Name", "Email", "Role"]}
        rows={users.map((u) => [u.name, u.email, u.role])}
      />
      <p className="text-sm text-muted">
        Roles: Owner · Admin · Operations · Finance · Support (org-scoped).
      </p>
    </div>
  );
}
