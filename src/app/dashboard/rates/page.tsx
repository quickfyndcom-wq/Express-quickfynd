"use client";

import { useState } from "react";

export default function Page() {
  const [weight, setWeight] = useState(1);
  const [cod, setCod] = useState(0);
  const base = 45 + weight * 12 + (cod > 0 ? 15 : 0);

  return (
    <div className="max-w-md space-y-6">
      <h2 className="font-[family-name:var(--font-syne)] text-2xl font-bold">
        Rate Calculator
      </h2>
      <label className="block text-sm">
        Weight (kg)
        <input
          type="number"
          value={weight}
          onChange={(e) => setWeight(Number(e.target.value))}
          className="mt-1 w-full border border-line px-3 py-2"
        />
      </label>
      <label className="block text-sm">
        COD amount
        <input
          type="number"
          value={cod}
          onChange={(e) => setCod(Number(e.target.value))}
          className="mt-1 w-full border border-line px-3 py-2"
        />
      </label>
      <p className="font-[family-name:var(--font-syne)] text-3xl font-bold text-brand">
        ≈ ₹{base.toFixed(0)}
      </p>
      <p className="text-xs text-muted">Demo estimate · final rate from org rate card.</p>
    </div>
  );
}
