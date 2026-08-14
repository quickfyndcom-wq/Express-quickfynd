import Link from "next/link";
import { BrandLogo } from "@/components/BrandLogo";
import { PortalNav } from "@/components/PortalNav";

export type NavItem = { href: string; label: string };

export function PortalShell({
  title,
  subtitle,
  nav,
  children,
  accent = "Super Admin",
}: {
  title: string;
  subtitle?: string;
  nav: NavItem[];
  children: React.ReactNode;
  accent?: string;
}) {
  return (
    <div className="flex min-h-screen bg-mist text-ink">
      <aside className="hidden w-64 shrink-0 flex-col border-r border-line bg-ink text-white lg:flex">
        <div className="border-b border-white/10 px-5 py-5">
          <BrandLogo
            variant="light"
            size="sm"
            href="/"
            showExpress
            showPoweredBy={false}
          />
          <p className="mt-2 text-xs text-white/45">{accent}</p>
        </div>
        <PortalNav nav={nav} />
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex items-center justify-between border-b border-line bg-paper px-5 py-4 md:px-8">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-brand">
              {accent}
            </p>
            <h1 className="font-[family-name:var(--font-syne)] text-lg font-bold">
              {title}
            </h1>
            {subtitle ? <p className="text-xs text-muted">{subtitle}</p> : null}
          </div>
          <Link href="/" className="text-sm font-medium text-muted hover:text-ink">
            ← Site
          </Link>
        </header>

        <div className="lg:hidden">
          <PortalNav nav={nav} />
        </div>

        <main className="flex-1 px-5 py-6 md:px-8 md:py-8">{children}</main>
      </div>
    </div>
  );
}

export function StatGrid({
  items,
}: {
  items: { label: string; value: string | number }[];
}) {
  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
      {items.map((item) => (
        <div key={item.label} className="border border-line bg-paper px-4 py-3">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-muted">
            {item.label}
          </p>
          <p className="mt-1 font-[family-name:var(--font-syne)] text-2xl font-bold">
            {item.value}
          </p>
        </div>
      ))}
    </div>
  );
}

export function DataTable({
  headers,
  rows,
}: {
  headers: string[];
  rows: React.ReactNode[][];
}) {
  return (
    <div className="overflow-x-auto border border-line">
      <table className="w-full min-w-[640px] text-left text-sm">
        <thead className="bg-mist text-xs uppercase tracking-wider text-muted">
          <tr>
            {headers.map((h) => (
              <th key={h} className="px-4 py-3">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 ? (
            <tr>
              <td
                colSpan={headers.length}
                className="px-4 py-8 text-center text-muted"
              >
                No records yet.
              </td>
            </tr>
          ) : (
            rows.map((row, i) => (
              <tr key={i} className="border-t border-line bg-paper">
                {row.map((cell, j) => (
                  <td key={j} className="px-4 py-3">
                    {cell}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
