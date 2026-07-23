import type { ButtonHTMLAttributes, ReactNode } from "react";

type Variant = "default" | "primary" | "dark" | "plain";

/* Disabled styling is per-variant, never element-level opacity: fading the
   whole element makes white-on-dark buttons converge with a light page
   background from both directions until the label disappears. */
const variantClasses: Record<Variant, string> = {
  default:
    "border-line bg-paper disabled:border-line disabled:bg-quiet disabled:text-muted",
  primary:
    "border-rose bg-rose text-white disabled:border-transparent disabled:bg-rose/40",
  dark: "border-ink bg-ink text-white disabled:border-transparent disabled:bg-ink/50",
  plain: "border-transparent bg-transparent disabled:text-muted",
};

export function Button({
  variant = "default",
  small = false,
  className = "",
  children,
  ...rest
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant;
  small?: boolean;
  children: ReactNode;
}) {
  const size = small
    ? "min-h-10 rounded-[12px] px-3.5 text-[13px]"
    : "min-h-[52px] rounded-[15px] px-[18px]";
  return (
    <button
      className={`inline-flex items-center justify-center gap-2 border font-[710] transition-transform hover:-translate-y-px disabled:cursor-default disabled:hover:translate-y-0 ${size} ${variantClasses[variant]} ${className}`}
      {...rest}
    >
      {children}
    </button>
  );
}
