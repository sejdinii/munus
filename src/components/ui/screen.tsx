import Link from "next/link";
import { Icon } from "./icons";

export function Screen({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <section className={["screen", className].filter(Boolean).join(" ")}>
      {children}
    </section>
  );
}

export function TopBar({ title, backHref }: { title: string; backHref?: string }) {
  return (
    <header className="topbar">
      {backHref ? (
        <Link href={backHref} className="icon-button liquid-glass" aria-label="Back">
          <Icon name="back" />
        </Link>
      ) : (
        <span />
      )}
      <h1>{title}</h1>
      <span />
    </header>
  );
}

export function Overline({ children }: { children: React.ReactNode }) {
  return <p className="overline">{children}</p>;
}

export function Wordmark() {
  return (
    <div className="wordmark liquid-glass">
      <span className="mark" aria-hidden="true" />
      Scout
    </div>
  );
}
