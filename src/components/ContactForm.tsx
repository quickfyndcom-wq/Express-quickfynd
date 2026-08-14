"use client";

import { FormEvent, useState } from "react";

const reasons = [
  "Track a shipment",
  "Send / book a shipment",
  "Business / rate enquiry",
  "COD or settlement",
  "Merchant account",
  "GST / invoice help",
  "Other enquiry",
];

const field =
  "mt-1.5 w-full border border-neutral-300 bg-white px-3 py-2.5 text-sm text-neutral-900 outline-none placeholder:text-neutral-400 focus:border-brand";

export function ContactForm() {
  const [reason, setReason] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [marketing, setMarketing] = useState(false);
  const [error, setError] = useState("");
  const [sent, setSent] = useState(false);

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    if (!reason || !firstName.trim() || !lastName.trim() || !phone.trim() || !email.trim()) {
      setError("Please fill all required fields.");
      return;
    }
    if (!acceptTerms) {
      setError("Please accept the Terms of use.");
      return;
    }
    const subject = encodeURIComponent(`QF Express enquiry: ${reason}`);
    const body = encodeURIComponent(
      [
        `Reason: ${reason}`,
        `Name: ${firstName.trim()} ${lastName.trim()}`,
        `Phone: +91 ${phone.trim()}`,
        `Email: ${email.trim()}`,
        marketing ? "Marketing consent: yes" : "Marketing consent: no",
        "",
        message.trim() || "(no extra details)",
      ].join("\n"),
    );
    window.location.href = `mailto:support@quickfynd.com?subject=${subject}&body=${body}`;
    setSent(true);
  }

  if (sent) {
    return (
      <div className="border border-neutral-200 bg-neutral-50 p-8 text-center">
        <h3 className="font-[family-name:var(--font-syne)] text-xl font-bold text-neutral-950">
          Thanks — your mail app should open
        </h3>
        <p className="mt-2 text-sm text-neutral-600">
          Or email{" "}
          <a href="mailto:support@quickfynd.com" className="font-semibold text-brand">
            support@quickfynd.com
          </a>
        </p>
        <button
          type="button"
          onClick={() => setSent(false)}
          className="mt-5 text-sm font-semibold text-brand hover:underline"
        >
          Send another enquiry
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="border border-neutral-200 bg-neutral-50 p-6 md:p-8" noValidate>
      <h3 className="font-[family-name:var(--font-syne)] text-xl font-bold text-neutral-950 md:text-2xl">
        Send an enquiry
      </h3>

      <label className="mt-6 block text-sm font-medium text-neutral-800">
        Reason for enquiry <span className="text-brand">*</span>
        <select required value={reason} onChange={(e) => setReason(e.target.value)} className={field}>
          <option value="">Please select an option</option>
          {reasons.map((r) => (
            <option key={r} value={r}>
              {r}
            </option>
          ))}
        </select>
      </label>

      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <label className="block text-sm font-medium text-neutral-800">
          First Name <span className="text-brand">*</span>
          <input required value={firstName} onChange={(e) => setFirstName(e.target.value)} className={field} />
        </label>
        <label className="block text-sm font-medium text-neutral-800">
          Last Name <span className="text-brand">*</span>
          <input required value={lastName} onChange={(e) => setLastName(e.target.value)} className={field} />
        </label>
      </div>

      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <label className="block text-sm font-medium text-neutral-800">
          Contact Number <span className="text-brand">*</span>
          <span className="mt-1.5 flex border border-neutral-300 focus-within:border-brand">
            <span className="flex items-center border-r border-neutral-300 bg-white px-3 text-sm text-neutral-700">
              +91
            </span>
            <input
              required
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="98765 43210"
              className="min-w-0 flex-1 bg-white px-3 py-2.5 text-sm outline-none"
            />
          </span>
        </label>
        <label className="block text-sm font-medium text-neutral-800">
          Email Address <span className="text-brand">*</span>
          <input
            required
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={field}
          />
        </label>
      </div>

      <label className="mt-4 block text-sm font-medium text-neutral-800">
        Details
        <textarea
          rows={4}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          className={`${field} resize-y`}
          placeholder="Tell us what you need"
        />
      </label>

      <label className="mt-5 flex items-start gap-2 text-sm text-neutral-700">
        <input
          type="checkbox"
          checked={acceptTerms}
          onChange={(e) => setAcceptTerms(e.target.checked)}
          className="mt-0.5 accent-[var(--brand)]"
        />
        <span>I accept the Terms of use</span>
      </label>
      <label className="mt-2 flex items-start gap-2 text-sm text-neutral-700">
        <input
          type="checkbox"
          checked={marketing}
          onChange={(e) => setMarketing(e.target.checked)}
          className="mt-0.5 accent-[var(--brand)]"
        />
        <span>I consent to be contacted about QuickFynd Express services</span>
      </label>

      {error ? (
        <p className="mt-3 text-sm text-brand" role="alert">
          {error}
        </p>
      ) : null}

      <button
        type="submit"
        className="mt-6 bg-brand px-7 py-3 text-sm font-semibold text-white hover:bg-brand-deep"
      >
        Get in touch
      </button>
    </form>
  );
}
