import type { SVGProps } from "react";

/* Icon set lifted 1:1 from prototypes/scout-pink-v2.html (binding spec). */

function Svg(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
      {...props}
    />
  );
}

export const BackIcon = (p: SVGProps<SVGSVGElement>) => (
  <Svg {...p}>
    <path d="m15 18-6-6 6-6" />
  </Svg>
);

export const FilterIcon = (p: SVGProps<SVGSVGElement>) => (
  <Svg {...p}>
    <path d="M4 7h10M18 7h2M4 17h2M10 17h10M14 5v4M6 15v4" />
  </Svg>
);

export const UndoIcon = (p: SVGProps<SVGSVGElement>) => (
  <Svg {...p}>
    <path d="M9 8H5v-4" />
    <path d="M5.5 8.5A8 8 0 1 1 4 15" />
  </Svg>
);

export const XIcon = (p: SVGProps<SVGSVGElement>) => (
  <Svg {...p}>
    <path d="m6 6 12 12M18 6 6 18" />
  </Svg>
);

export const HeartIcon = (p: SVGProps<SVGSVGElement>) => (
  <Svg {...p}>
    <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8l1.1 1.1L12 21l7.7-7.5a5.5 5.5 0 0 0 1.1-8.9Z" />
  </Svg>
);

export const StarIcon = (p: SVGProps<SVGSVGElement>) => (
  <Svg {...p}>
    <path d="m12 3 2.6 5.4 5.9.8-4.3 4.1 1 5.9-5.2-2.8-5.2 2.8 1-5.9L3.5 9.2l5.9-.8L12 3Z" />
  </Svg>
);

export const InfoIcon = (p: SVGProps<SVGSVGElement>) => (
  <Svg {...p}>
    <circle cx="12" cy="12" r="9" />
    <path d="M12 11v5M12 8h.01" />
  </Svg>
);

export const DiscoverIcon = (p: SVGProps<SVGSVGElement>) => (
  <Svg {...p}>
    <path d="m14.5 9.5-3 1.5-1.5 3 3-1.5 1.5-3Z" />
    <circle cx="12" cy="12" r="9" />
  </Svg>
);

export const SavedIcon = (p: SVGProps<SVGSVGElement>) => (
  <Svg {...p}>
    <path d="M6 4h12v17l-6-4-6 4V4Z" />
  </Svg>
);

export const ActivityIcon = (p: SVGProps<SVGSVGElement>) => (
  <Svg {...p}>
    <path d="M5 4h14v16H5zM8 9h8M8 13h5" />
  </Svg>
);

export const ProfileIcon = (p: SVGProps<SVGSVGElement>) => (
  <Svg {...p}>
    <circle cx="12" cy="8" r="4" />
    <path d="M4.5 21a7.5 7.5 0 0 1 15 0" />
  </Svg>
);

export const UploadIcon = (p: SVGProps<SVGSVGElement>) => (
  <Svg {...p}>
    <path d="M12 16V4M7 9l5-5 5 5M5 20h14" />
  </Svg>
);

export const SparkIcon = (p: SVGProps<SVGSVGElement>) => (
  <Svg {...p}>
    <path d="m12 2 1.5 5.5L19 9l-5.5 1.5L12 16l-1.5-5.5L5 9l5.5-1.5L12 2Z" />
    <path d="m19 15 .7 2.3L22 18l-2.3.7L19 21l-.7-2.3L16 18l2.3-.7L19 15Z" />
  </Svg>
);
