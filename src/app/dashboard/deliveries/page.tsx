"use client";

import { useCustomerOrg } from "@/components/CustomerAuth";
import { DeliveryBoard } from "@/components/delivery/DeliveryBoard";
import { companyQuery } from "@/components/delivery/StatusBadge";

export default function CompanyDeliveriesPage() {
  const org = useCustomerOrg();
  return <DeliveryBoard company={companyQuery(org) || "quickfynd"} />;
}
