"use client";

import { useId } from "react";

export function Choice({
  selected,
  onSelect,
  children,
}: {
  selected: boolean;
  onSelect: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      className={
        selected ? "choice selected liquid-glass-selected" : "choice liquid-glass"
      }
      aria-pressed={selected}
      onClick={onSelect}
    >
      {children}
    </button>
  );
}

export function TextField({
  label,
  error,
  hint,
  ...rest
}: {
  label: string;
  error?: string;
  hint?: string;
} & React.InputHTMLAttributes<HTMLInputElement>) {
  const id = useId();
  return (
    <div>
      <label className="field-label" htmlFor={id}>
        {label}
      </label>
      <input id={id} className="text-field" aria-invalid={Boolean(error)} {...rest} />
      {error ? <p className="field-error">{error}</p> : null}
      {hint && !error ? (
        <p className="privacy" style={{ textAlign: "left", marginTop: 9 }}>
          {hint}
        </p>
      ) : null}
    </div>
  );
}

export function Progress({ value }: { value: number }) {
  const pct = Math.max(0, Math.min(1, value)) * 100;
  return (
    <div
      className="progress"
      role="progressbar"
      aria-valuenow={Math.round(pct)}
      aria-valuemin={0}
      aria-valuemax={100}
    >
      <span style={{ transform: `scaleX(${pct / 100})` }} />
    </div>
  );
}
