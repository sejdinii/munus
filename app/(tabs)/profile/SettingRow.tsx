import Link from "next/link";

/* Setting row — prototype .setting-row (CONTRACTS §4). Navigable rows render
   as a Link, action rows as a button, static rows (no href/onClick) render
   inert so they read as informational rather than broken. */

const rowClass =
  "grid min-h-[58px] w-full grid-cols-[1fr_auto] items-center gap-2 border-0 border-b border-line bg-transparent p-0 text-left text-[13px]";

function RowContent({
  label,
  meta,
  tone,
}: {
  label: string;
  meta: string;
  tone?: "hired";
}) {
  return (
    <>
      <span className={tone === "hired" ? "font-[720] text-green" : ""}>
        {label}
      </span>
      <small className="text-[10px] text-muted">{meta}</small>
    </>
  );
}

export function SettingRow({
  label,
  meta,
  href,
  onClick,
  tone,
}: {
  label: string;
  meta: string;
  href?: string;
  onClick?: () => void;
  tone?: "hired";
}) {
  if (href) {
    return (
      <Link href={href} className={rowClass}>
        <RowContent label={label} meta={meta} tone={tone} />
      </Link>
    );
  }
  if (onClick) {
    return (
      <button
        type="button"
        onClick={onClick}
        className={`${rowClass} cursor-pointer`}
      >
        <RowContent label={label} meta={meta} tone={tone} />
      </button>
    );
  }
  return (
    <div className={`${rowClass} cursor-default`}>
      <RowContent label={label} meta={meta} tone={tone} />
    </div>
  );
}
