import Link from "next/link";

const cards = [
  {
    title: "FAQs",
    body: "Shipping, COD, tracking, and account basics.",
    href: "#contact",
  },
  {
    title: "Care Hub",
    body: "Raise issues and follow delivery updates.",
    href: "#contact",
    badge: "Support",
  },
  {
    title: "WhatsApp us",
    body: "Chat with ops for quick shipment help.",
    href: "https://wa.me/919876543210",
    external: true,
    accent: true,
  },
  {
    title: "Create account",
    body: "Register as a merchant and await approval.",
    href: "/register",
  },
  {
    title: "Track shipments",
    body: "Live AWB status from pickup to POD.",
    href: "#track",
  },
  {
    title: "Send shipments",
    body: "Book a pickup or request a rate card.",
    href: "#contact",
  },
];

export function SupportHelp() {
  return (
    <section id="support" className="bg-neutral-50 px-5 py-16 md:px-8 md:py-24">
      <div className="mx-auto max-w-6xl">
        <h2 className="text-center font-[family-name:var(--font-syne)] text-3xl font-bold text-neutral-950 md:text-4xl">
          Let&apos;s get you the right help
        </h2>
        <p className="mx-auto mt-3 max-w-lg text-center text-neutral-600">
          Select the category that fits the support you need
        </p>

        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {cards.map((card) => {
            const className =
              "relative border border-neutral-200 bg-white p-6 text-center transition hover:border-neutral-300 hover:shadow-sm";
            const content = (
              <>
                {card.badge ? (
                  <span className="absolute left-0 top-0 bg-brand px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-white">
                    {card.badge}
                  </span>
                ) : null}
                <h3
                  className={`font-[family-name:var(--font-syne)] text-base font-bold ${
                    card.accent ? "text-brand" : "text-neutral-950"
                  } ${card.badge ? "mt-4" : ""}`}
                >
                  {card.title}
                </h3>
                <p className="mt-2 text-sm text-neutral-600">{card.body}</p>
              </>
            );

            if (card.external) {
              return (
                <a
                  key={card.title}
                  href={card.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={className}
                >
                  {content}
                </a>
              );
            }

            return (
              <Link key={card.title} href={card.href} className={className}>
                {content}
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
