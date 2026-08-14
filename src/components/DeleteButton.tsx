"use client";

export function DeleteButton({
  onDelete,
  busy,
  label = "Delete",
}: {
  onDelete: () => void | Promise<void>;
  busy?: boolean;
  label?: string;
}) {
  return (
    <button
      type="button"
      disabled={busy}
      onClick={() => {
        if (window.confirm("Delete this record? This cannot be undone.")) {
          void onDelete();
        }
      }}
      className="rounded-full bg-rose-50 px-2.5 py-1 text-[11px] font-semibold text-rose-700 hover:bg-rose-100 disabled:opacity-50"
    >
      {busy ? "…" : label}
    </button>
  );
}

export async function deleteRecord(type: string, id: string) {
  const res = await fetch(
    `/api/v1/records?type=${encodeURIComponent(type)}&id=${encodeURIComponent(id)}`,
    { method: "DELETE" },
  );
  if (!res.ok) {
    const data = (await res.json().catch(() => ({}))) as { error?: string };
    throw new Error(data.error ?? "Delete failed");
  }
}
