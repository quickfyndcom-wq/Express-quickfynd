import { ContactForm } from "@/components/ContactForm";

export function Contact() {
  return (
    <section id="contact" className="bg-white px-5 py-16 md:px-8 md:py-24">
      <div className="mx-auto grid max-w-6xl gap-12 lg:grid-cols-[0.85fr_1.15fr]">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand">
            Contact
          </p>
          <h2 className="mt-3 font-[family-name:var(--font-syne)] text-3xl font-bold text-neutral-950 md:text-4xl">
            How can we help?
          </h2>
          <p className="mt-4 text-neutral-600 leading-relaxed">
            Rates, bookings, GST invoices, or a stuck shipment — send your
            enquiry and the ops desk will follow up.
          </p>
          <div className="mt-8 space-y-4 border-t border-neutral-200 pt-8 text-sm">
            <p>
              <span className="block font-semibold text-neutral-900">Email</span>
              <a href="mailto:support@quickfynd.com" className="text-brand hover:underline">
                support@quickfynd.com
              </a>
            </p>
            <p>
              <span className="block font-semibold text-neutral-900">Hours</span>
              <span className="text-neutral-600">Mon – Sat · 09:00 – 18:00 IST</span>
            </p>
            <p>
              <span className="block font-semibold text-neutral-900">Business</span>
              <span className="text-neutral-600">
                NILAAS · GSTIN 32JWYPS4831L1Z1
              </span>
            </p>
          </div>
        </div>
        <ContactForm />
      </div>
    </section>
  );
}
