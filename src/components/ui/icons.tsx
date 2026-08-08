// Icon paths ported from the prototype's inline SVG set.

const PATHS: Record<string, React.ReactNode> = {
  back: <path d="m15 18-6-6 6-6" />,
  x: <path d="m6 6 12 12M18 6 6 18" />,
  upload: <path d="M12 16V4M7 9l5-5 5 5M5 20h14" />,
  profile: (
    <>
      <circle cx="12" cy="8" r="4" />
      <path d="M4.5 21a7.5 7.5 0 0 1 15 0" />
    </>
  ),
  spark: (
    <>
      <path d="m12 2 1.5 5.5L19 9l-5.5 1.5L12 16l-1.5-5.5L5 9l5.5-1.5L12 2Z" />
      <path d="m19 15 .7 2.3L22 18l-2.3.7L19 21l-.7-2.3L16 18l2.3-.7L19 15Z" />
    </>
  ),
  doc: <path d="M5 4h14v16H5zM8 9h8M8 13h5" />,
  check: <path d="M20 6 9 17l-5-5" />,
  heart: (
    <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8l1.1 1.1L12 21l7.7-7.5a5.5 5.5 0 0 0 1.1-8.9Z" />
  ),
  star: (
    <path d="m12 3 2.6 5.4 5.9.8-4.3 4.1 1 5.9-5.2-2.8-5.2 2.8 1-5.9L3.5 9.2l5.9-.8L12 3Z" />
  ),
  "arrow-up-right": <path d="M7 17 17 7M8 7h9v9" />,
  alert: (
    <>
      <path d="M12 9v4M12 17h.01" />
      <path d="M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0Z" />
    </>
  ),
};

export type IconName = keyof typeof PATHS & string;

export function Icon({ name, size }: { name: IconName; size?: number }) {
  // Self-contained stroke styling so icons render correctly in any context,
  // not only inside containers whose CSS happens to style descendant SVGs.
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      style={{
        fill: "none",
        stroke: "currentColor",
        strokeWidth: 1.8,
        strokeLinecap: "round",
        strokeLinejoin: "round",
        ...(size ? { width: size, height: size } : {}),
      }}
    >
      {PATHS[name]}
    </svg>
  );
}
