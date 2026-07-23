import type { ButtonHTMLAttributes, ReactNode } from "react";

type Variant = "default" | "primary" | "dark" | "plain";

const variantClasses: Record<Variant, string> = {
  default: "border-line bg-paper",
  primary: "border-rose bg-rose text-white",
  dark: "border-ink bg-ink text-white",
  plain: "border-transparent bg-transparent",
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
      className={`inline-flex items-center justify-center gap-2 border font-[710] transition-transform hover:-translate-y-px disabled:opacity-40 disabled:hover:translate-y-0 ${size} ${variantClasses[variant]} ${className}`}
      {...rest}
    >
      {children}
    </button>
  );
}
