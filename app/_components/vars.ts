import type { CSSProperties } from "react";

/** Custom properties inline (--i, --c, --a…) tipadas, sem `as any`. */
export const vars = (v: Record<string, string | number>) => v as CSSProperties;
