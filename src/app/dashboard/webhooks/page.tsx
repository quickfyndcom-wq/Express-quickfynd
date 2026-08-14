export default function Page() {
  return (
    <div className="space-y-4">
      <h2 className="font-[family-name:var(--font-syne)] text-2xl font-bold">Webhooks</h2>
      <p className="text-sm text-muted">
        Receive signed events: shipment.created, status.updated, delivered, failed, cod.collected.
      </p>
      <div className="border border-line bg-paper p-4 text-sm">
        Endpoint URL · Secret · Active events — configure per organization.
      </div>
    </div>
  );
}
