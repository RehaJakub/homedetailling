import type { SVGProps } from "react";

// Path data on a 24px grid, shared with the design handoff's icon pack.
const PATHS = {
  "arrow-up-right": ["M7 17 17 7M8 7h9v9"],
  "arrow-down": ["M12 5v14M5 12l7 7 7-7"],
  "arrow-left": ["M19 12H5M12 19l-7-7 7-7"],
  "arrow-right": ["M5 12h14M12 5l7 7-7 7"],
  "chevron-left": ["M15 6l-6 6 6 6"],
  "chevron-right": ["M9 6l6 6-6 6"],
  "chevron-down": ["M6 9l6 6 6-6"],
  close: ["M6 6l12 12M18 6 6 18"],
  check: ["M5 12l5 5L20 7"],
  "check-circle": ["circle:12,12,9", "M8 12l3 3 5-6"],
  plus: ["M12 5v14M5 12h14"],
  minus: ["M5 12h14"],
  search: ["circle:11,11,6.5", "M20 20l-4-4"],
  calendar: ["rect:3,5,18,16", "M3 10h18M8 3v4M16 3v4"],
  clock: ["circle:12,12,9", "M12 7v5l3 2"],
  pin: ["M12 21s-6-5.5-6-11a6 6 0 0 1 12 0c0 5.5-6 11-6 11z", "circle:12,10,2"],
  phone: ["M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2z"],
  mail: ["rect:3,5,18,14", "M3 7l9 6 9-6"],
  user: ["circle:12,8,4", "M4 21a8 8 0 0 1 16 0"],
  users: ["circle:9,8,3.5", "M2 20a7 7 0 0 1 14 0M16 4.5a3.5 3.5 0 0 1 0 7M18 13.5a6 6 0 0 1 4 6.5"],
  car: ["M3 13l2-5h14l2 5v5H3z", "M3 13h18M7 18v2M17 18v2", "circle:7.5,15.5,1", "circle:16.5,15.5,1"],
  droplet: ["M12 3s6 6.5 6 11a6 6 0 0 1-12 0c0-4.5 6-11 6-11z"],
  sparkle: ["M12 3v4M12 17v4M3 12h4M17 12h4M6 6l2 2M16 16l2 2M6 18l2-2M16 8l2-2"],
  spray: ["M9 8h6v13H9zM10 8V5h4v3M14 5h4M18 3v4M20 5h1"],
  shield: ["M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6z", "M9 12l2 2 4-4"],
  home: ["M3 11l9-7 9 7v10H3z", "M10 21v-6h4v6"],
  edit: ["M4 20h4L19 9l-4-4L4 16z", "M13 7l4 4"],
  trash: ["M4 7h16M9 7V4h6v3M6 7l1 14h10l1-14"],
  info: ["circle:12,12,9", "M12 11v6M12 7.5v.5"],
  alert: ["M12 3l10 18H2z", "M12 10v5M12 18v.5"],
  bell: ["M6 17V11a6 6 0 0 1 12 0v6l2 2H4z", "M10 21h4"],
  undo: ["M9 14 4 9l5-5", "M4 9h10a6 6 0 0 1 0 12h-3"],
  refresh: ["M20 12a8 8 0 1 1-2.3-5.7", "M20 4v5h-5"],
  menu: ["M4 7h16M4 12h16M4 17h16"],
  logout: ["M10 4H5v16h5M14 8l5 4-5 4M19 12H9"],
  settings: ["circle:12,12,3", "M12 2v3M12 19v3M2 12h3M19 12h3M4.9 4.9l2.1 2.1M17 17l2.1 2.1M4.9 19.1 7 17M17 7l2.1-2.1"],
  grid: ["rect:4,4,7,7", "rect:13,4,7,7", "rect:4,13,7,7", "rect:13,13,7,7"],
  list: ["M9 6h12M9 12h12M9 18h12M4 6h.5M4 12h.5M4 18h.5"],
  tag: ["M3 3h9l9 9-9 9-9-9z", "circle:8,8,1"],
  star: ["M12 3l2.8 6 6.2.7-4.6 4.3 1.3 6.4L12 17.3 6.3 20.4l1.3-6.4L3 9.7 9.2 9z"],
  wallet: ["rect:3,6,18,13", "M3 10h18M16 14h2"],
  file: ["M6 3h8l4 4v14H6z", "M14 3v4h4M9 13h6M9 17h6"],
  external: ["M14 4h6v6M20 4l-9 9M18 14v6H4V6h6"],
} as const;

export type IconName = keyof typeof PATHS;
export const iconNames = Object.keys(PATHS) as IconName[];

export type IconProps = Omit<SVGProps<SVGSVGElement>, "name" | "stroke"> & {
  name: IconName;
  /** Rendered size in px (square). */
  size?: number;
  /** Stroke width on the 24px grid. */
  stroke?: number;
};

/**
 * Line icon from the brand set: 24px grid, square caps, miter joins, no fill.
 */
export function Icon({ name, size = 20, stroke = 1.75, style, ...rest }: IconProps) {
  const parts = PATHS[name] ?? PATHS.info;
  return (
    <svg
      {...rest}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={stroke}
      strokeLinecap="square"
      strokeLinejoin="miter"
      aria-hidden="true"
      focusable="false"
      style={{ display: "inline-block", flexShrink: 0, verticalAlign: "middle", ...style }}
    >
      {parts.map((part, i) => {
        if (part.startsWith("circle:")) {
          const [cx, cy, r] = part.slice(7).split(",").map(Number);
          return <circle key={i} cx={cx} cy={cy} r={r} />;
        }
        if (part.startsWith("rect:")) {
          const [x, y, w, h] = part.slice(5).split(",").map(Number);
          return <rect key={i} x={x} y={y} width={w} height={h} />;
        }
        return <path key={i} d={part} />;
      })}
    </svg>
  );
}
