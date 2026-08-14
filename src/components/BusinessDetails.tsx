export function BusinessDetails() {
  return (
    <section id="business" className="bg-paper px-5 py-20 md:px-8 md:py-28">
      <div className="mx-auto max-w-6xl">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-brand">
          Business details
        </p>
        <h2 className="mt-3 max-w-xl font-[family-name:var(--font-syne)] text-3xl font-bold tracking-tight text-ink md:text-4xl">
          For invoices and tax purposes
        </h2>
        <p className="mt-4 max-w-xl text-muted leading-relaxed">
          Use this GST and trade name for invoices and tax purposes. For GST
          invoice help, please contact support.
        </p>

        <dl className="mt-10 grid gap-6 border border-line bg-mist p-6 sm:grid-cols-3 sm:p-8">
          <div>
            <dt className="text-xs font-semibold uppercase tracking-wider text-muted">
              Trade name
            </dt>
            <dd className="mt-2 font-[family-name:var(--font-syne)] text-xl font-bold text-ink">
              NILAAS
            </dd>
          </div>
          <div>
            <dt className="text-xs font-semibold uppercase tracking-wider text-muted">
              Brand
            </dt>
            <dd className="mt-2 font-[family-name:var(--font-syne)] text-xl font-bold text-ink">
              QuickFynd
            </dd>
            <dd className="mt-1 text-sm text-muted">QuickFynd — Powered by Nilaas</dd>
          </div>
          <div>
            <dt className="text-xs font-semibold uppercase tracking-wider text-muted">
              GSTIN
            </dt>
            <dd className="mt-2 font-mono text-lg font-semibold tracking-wide text-ink">
              32JWYPS4831L1Z1
            </dd>
          </div>
        </dl>
      </div>
    </section>
  );
}
