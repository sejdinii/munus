import type { ButtonHTMLAttributes, ReactNode } from "react";

export function IconButton({
  label,
  className = "",
  children,
  ...rest
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  label: string;
  children: ReactNode;
}) {
  return (
    <button
      aria-label={label}
      className={`grid size-[42px] place-items-center rounded-full bg-transparent hover:bg-quiet [&_svg]:size-[22px] ${className}`}
      {...rest}
    >
      {children}
    </button>
  );
}
