import Link from "next/link";

type Variant = "primary" | "dark" | "outline" | "plain";
type Size = "md" | "sm";

function classes(variant: Variant, size: Size, extra?: string) {
  return [
    "btn",
    variant === "primary" && "btn-primary liquid-glass-selected",
    variant === "dark" && "btn-dark liquid-glass",
    variant === "outline" && "liquid-glass",
    variant === "plain" && "btn-plain",
    size === "sm" && "btn-small",
    extra,
  ]
    .filter(Boolean)
    .join(" ");
}

type CommonProps = {
  variant?: Variant;
  size?: Size;
  className?: string;
  children: React.ReactNode;
};

export function Button({
  variant = "outline",
  size = "md",
  className,
  children,
  loading,
  disabled,
  ...rest
}: CommonProps &
  React.ButtonHTMLAttributes<HTMLButtonElement> & { loading?: boolean }) {
  return (
    <button
      className={classes(variant, size, className)}
      disabled={disabled || loading}
      {...rest}
    >
      {loading ? (
        <span
          className="spinner"
          style={{ width: 18, height: 18, margin: 0, borderWidth: 2 }}
        />
      ) : null}
      {children}
    </button>
  );
}

export function ButtonLink({
  variant = "outline",
  size = "md",
  className,
  children,
  href,
}: CommonProps & { href: string }) {
  return (
    <Link href={href} className={classes(variant, size, className)}>
      {children}
    </Link>
  );
}
