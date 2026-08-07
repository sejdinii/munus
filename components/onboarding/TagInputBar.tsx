"use client";

/**
 * LinkedIn-style tag input bar (founder design direction 2026-08-07):
 * one input bar, type-ahead suggestions from a catalog, Enter or tap to
 * add, custom text added as-is when no match exists, multiple tokens in
 * the bar, backspace removes the last one. Used for roles, locations,
 * and levels.
 */

import { useEffect, useRef, useState } from "react";

export interface TagInputBarProps {
  /** Accessible name + placeholder text. */
  placeholder: string;
  value: string[];
  onChange: (tokens: string[]) => void;
  /** Returns catalog suggestions for a query (already filtered + capped). */
  suggestions: (query: string) => string[];
  maxTokens?: number;
  /** When true, Enter with no exact match adds the raw typed text. */
  allowCustom?: boolean;
}

export function TagInputBar({
  placeholder,
  value,
  onChange,
  suggestions,
  maxTokens = 8,
  allowCustom = true,
}: TagInputBarProps) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const boxRef = useRef<HTMLDivElement>(null);

  const matches = suggestions(query.trim()).filter((s) => !value.includes(s));
  const exactMatch = matches.find((m) => m.toLowerCase() === query.trim().toLowerCase());
  const showCustom = allowCustom && query.trim().length > 0 && !exactMatch;
  const items = [...matches, ...(showCustom ? [`"${query.trim()}"`] : [])];
  const atMax = value.length >= maxTokens;

  useEffect(() => {
    setActive(0);
  }, [query, open]);

  useEffect(() => {
    function onDocClick(event: MouseEvent) {
      if (boxRef.current && !boxRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, []);

  function add(token: string) {
    const clean = token.replace(/^"|"$/g, "").trim();
    if (!clean || value.includes(clean) || atMax) return;
    onChange([...value, clean]);
    setQuery("");
    setOpen(false);
    inputRef.current?.focus();
  }

  function remove(token: string) {
    onChange(value.filter((t) => t !== token));
  }

  function onKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Enter") {
      event.preventDefault();
      if (items.length > 0) {
        add(items[Math.min(active, items.length - 1)]!);
      }
      return;
    }
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setActive((a) => Math.min(items.length - 1, a + 1));
      return;
    }
    if (event.key === "ArrowUp") {
      event.preventDefault();
      setActive((a) => Math.max(0, a - 1));
      return;
    }
    if (event.key === "Escape") {
      setOpen(false);
      return;
    }
    if (event.key === "Backspace" && query === "" && value.length > 0) {
      remove(value[value.length - 1]!);
    }
  }

  return (
    <div ref={boxRef} className="relative">
      <div
        className={`flex min-h-[55px] flex-wrap items-center gap-1.5 rounded-[14px] border bg-paper px-2.5 py-2 ${
          open ? "border-rose ring-[3px] ring-rose-soft" : "border-line"
        }`}
      >
        {value.map((token) => (
          <span
            key={token}
            className="inline-flex items-center gap-1.5 rounded-full bg-rose-soft py-1.5 pl-3 pr-2 text-[12.5px] font-[620] text-rose-ink"
          >
            {token}
            <button
              type="button"
              aria-label={`Remove ${token}`}
              onClick={() => remove(token)}
              className="grid size-[18px] place-items-center rounded-full bg-rose-ink/10 text-[11px] leading-none text-rose-ink"
            >
              ✕
            </button>
          </span>
        ))}
        <input
          ref={inputRef}
          type="text"
          aria-label={placeholder}
          placeholder={atMax ? `Limit ${maxTokens} reached` : placeholder}
          value={query}
          disabled={atMax}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={onKeyDown}
          className="min-w-[140px] flex-1 bg-transparent px-1.5 py-1 text-[14px] text-ink outline-none placeholder:text-[#b8b0b4]"
        />
      </div>

      {open && items.length > 0 ? (
        <div className="absolute left-0 right-0 z-20 mt-1.5 overflow-hidden rounded-[14px] border border-line bg-paper shadow-[0_10px_30px_rgba(0,0,0,0.12)]">
          {items.slice(0, 7).map((item, index) => {
            const isCustom = item.startsWith('"');
            return (
              <button
                key={item}
                type="button"
                onClick={() => add(item)}
                onMouseEnter={() => setActive(index)}
                className={`flex min-h-[44px] w-full items-center justify-between px-4 text-left text-[13px] font-[620] ${
                  index === active ? "bg-quiet text-ink" : "text-ink"
                }`}
              >
                <span>{isCustom ? item.slice(1, -1) : item}</span>
                <span className="text-[11px] font-[650] text-rose-ink">
                  {isCustom ? "Add" : "+ Add"}
                </span>
              </button>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}
