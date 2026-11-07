const base = {
  className: "mp-icon",
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeLinecap: "round",
  strokeLinejoin: "round",
  "aria-hidden": true,
} as const;

export function ArrowIcon({ size = 20 }: { size?: number }) {
  return (
    <svg {...base} width={size} height={size} strokeWidth={1.5}>
      <path d="M5 12h14" />
      <path d="m12 5 7 7-7 7" />
    </svg>
  );
}

export function CheckIcon({ size, strokeWidth = 1.5, pathLength }: { size: number; strokeWidth?: number; pathLength?: number }) {
  return (
    <svg {...base} width={size} height={size} strokeWidth={strokeWidth}>
      <path pathLength={pathLength} d="M20 6 9 17l-5-5" />
    </svg>
  );
}
