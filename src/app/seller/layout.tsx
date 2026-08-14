"use client";

import { ConsoleShell } from "@/components/ConsoleShell";
import { SELLER_NAV_GROUPS } from "@/lib/portal-nav";

export default function SellerLayout({ children }: { children: React.ReactNode }) {
  return (
    <ConsoleShell
      product="Seller"
      projectLabel="QuickFynd sellers"
      email="seller@quickfynd.com"
      homeHref="/seller"
      ctaHref="/seller/orders"
      ctaLabel="Ready for pickup"
      nav={SELLER_NAV_GROUPS}
      onLogout={() => {
        window.location.href = "/";
      }}
    >
      {children}
    </ConsoleShell>
  );
}
