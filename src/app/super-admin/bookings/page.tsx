import { DeliveryBoard } from "@/components/delivery/DeliveryBoard";

export default function SuperAdminBookingsPage() {
  return (
    <div className="space-y-4">
      <div>
        <h2 className="font-[family-name:var(--font-syne)] text-2xl font-bold">
          Public bookings
        </h2>
        <p className="mt-1 text-sm text-muted">
          On-demand QuickFynd Logistics jobs created by anyone from /logistics.
        </p>
      </div>
      <DeliveryBoard admin source="public" />
    </div>
  );
}
