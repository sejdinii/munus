export function EmptyState({
  symbol,
  title,
  body,
  children,
}: {
  symbol: React.ReactNode;
  title: string;
  body: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="empty-state">
      <div>
        <div className="empty-symbol" aria-hidden="true">
          {symbol}
        </div>
        <h2>{title}</h2>
        <p>{body}</p>
        {children ? (
          <div className="button-stack" style={{ marginTop: 16 }}>
            {children}
          </div>
        ) : null}
      </div>
    </div>
  );
}

export function Generating({
  label,
  sublabel,
}: {
  label: string;
  sublabel?: string;
}) {
  return (
    <div className="generating" role="status">
      <div>
        <div className="spinner" aria-hidden="true" />
        <strong>{label}</strong>
        {sublabel ? (
          <p style={{ color: "var(--muted)", fontSize: 11, lineHeight: 1.45 }}>
            {sublabel}
          </p>
        ) : null}
      </div>
    </div>
  );
}

import { Icon } from "./icons";

export function GroundingNote({ children }: { children: React.ReactNode }) {
  return (
    <div className="grounding-note liquid-glass">
      <span aria-hidden="true" style={{ display: "grid", placeItems: "center" }}>
        <Icon name="check" size={13} />
      </span>
      <span>{children}</span>
    </div>
  );
}
