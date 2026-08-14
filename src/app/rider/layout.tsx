import { PortalShell } from "@/components/PortalShell";
import { RIDER_NAV } from "@/lib/portal-nav";

export default function RiderLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <PortalShell
      title="Rider Web Portal"
      subtitle="Also available as Flutter app · apps/rider_app"
      accent="Rider"
      nav={RIDER_NAV}
    >
      {children}
    </PortalShell>
  );
}
