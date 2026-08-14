export default function Page() {
  return (
    <div className="space-y-4">
      <h2 className="font-[family-name:var(--font-syne)] text-2xl font-bold">
        Bulk Upload Shipments
      </h2>
      <p className="text-sm text-muted">
        Upload CSV/Excel to create many AWBs for your organization only.
      </p>
      <div className="border border-dashed border-line bg-paper px-6 py-12 text-center text-sm text-muted">
        Drop file here · columns: consignee, phone, address, pincode, COD, weight, reference
      </div>
    </div>
  );
}
