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
};

export type IconName = keyof typeof PATHS & string;

export function Icon({ name, size }: { name: IconName; size?: number }) {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      style={size ? { width: size, height: size } : undefined}
    >
      {PATHS[name]}
    </svg>
  );
}
