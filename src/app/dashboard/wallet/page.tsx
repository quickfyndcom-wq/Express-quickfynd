import { StatGrid } from "@/components/PortalShell";
import { getOrg } from "@/lib/courier-store";

export default function Page() {
  const org = getOrg("quickfynd");
  return (
    <div className="space-y-6">
      <h2 className="font-[family-name:var(--font-syne)] text-2xl font-bold">Wallet</h2>
      <StatGrid
        items={[
          { label: "Available balance", value: `₹${org?.walletBalance ?? 0}` },
          { label: "COD receivable", value: `₹${org?.codBalance ?? 0}` },
        ]}
      />
    </div>
  );
}
