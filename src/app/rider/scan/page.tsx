export default function Page() {
  return (
    <div className="space-y-4">
      <h2 className="font-[family-name:var(--font-syne)] text-2xl font-bold">
        Barcode Scanner
      </h2>
      <input
        className="w-full max-w-md border border-line px-3 py-2"
        placeholder="Scan AWB"
      />
      <p className="text-sm text-muted">Posts to POST /api/rider/scan</p>
    </div>
  );
}
