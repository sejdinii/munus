import type { ReactNode } from "react";

/* Plan card — ported from prototypes/scout-pink-v2.html .plan-card /
   .plan-flag / .plan-feats (CONTRACTS §4 binding visual spec). */

export type PlanFeature = { mark: "✓" | "—"; text: ReactNode; na?: boolean };

export function PlanCard({
  name,
  price,
  period,
  sub,
  features,
  featured = false,
  flag,
  action,
}: {
  name: string;
  price: string;
  period?: string;
  sub: string;
  features: PlanFeature[];
  featured?: boolean;
  flag?: string;
  action?: ReactNode;
}) {
  return (
    <div
      className={`relative mb-3 rounded-[20px] border bg-paper p-[18px] ${
        featured
          ? "border-2 border-rose shadow-[0_14px_34px_rgba(242,12,120,0.1)]"
          : "border-line"
      }`}
    >
      {flag ? (
        <span className="absolute -top-2.5 left-[18px] rounded-[8px] bg-rose px-[9px] py-1 text-[9px] font-extrabold uppercase tracking-[0.05em] text-white">
          {flag}
        </span>
      ) : null}
      <div className="mb-1 flex items-baseline justify-between">
        <h3 className="m-0 text-[17px] tracking-[-0.03em]">{name}</h3>
        <span className="text-[17px] font-[850] tracking-[-0.03em]">
          {price}
          {period ? (
            <small className="text-[10px] font-[650] text-muted"> {period}</small>
          ) : null}
        </span>
      </div>
      <p className="m-0 mb-3 text-[11px] text-muted">{sub}</p>
      <ul className="m-0 grid list-none gap-[7px] p-0">
        {features.map((f, i) => (
          <li
            key={i}
            className={`grid grid-cols-[16px_1fr] gap-2 text-[11px] leading-[1.35] ${
              f.na ? "text-[#b1abae]" : "text-[#4f494c]"
            }`}
          >
            <b className={`font-extrabold ${f.na ? "text-[#c8c2c5]" : "text-green"}`}>
              {f.mark}
            </b>
            <span>{f.text}</span>
          </li>
        ))}
      </ul>
      {action ? <div className="mt-3.5 [&>button]:w-full">{action}</div> : null}
    </div>
  );
}
