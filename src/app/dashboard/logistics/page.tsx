"use client";

import Link from "next/link";
import { DeliveryBoard } from "@/components/delivery/DeliveryBoard";
import { useCustomerOrg } from "@/components/CustomerAuth";
import { companyQuery } from "@/components/delivery/StatusBadge";

export default function DashboardLogisticsPage() {
  const org = useCustomerOrg();
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="font-[family-name:var(--font-syne)] text-2xl font-bold">
            Logistics bookings
          </h2>
          <p className="mt-1 text-sm text-muted">
            Public courier jobs on the same QuickFynd delivery network.
          </p>
        </div>
        <Link
          href="/logistics"
          className="rounded-xl bg-brand px-4 py-2 text-sm font-semibold text-white"
        >
          New booking
        </Link>
      </div>
      <DeliveryBoard company={companyQuery(org) || "quickfynd"} source="public" />
    </div>
  );
}
