export interface NumberParseOptions {
  int?: boolean;
  default?: number | null;
  roundMode?: "round" | "floor" | "ceil";
}

export function parseNumber(value: any, options: NumberParseOptions = {}): number | null {
  const def = options.default ?? null;
  if (typeof value === "string") {
    if (value === "") return def;
    const num = Number(value);
    if (isNaN(num)) return def;
    return parseIntIfRequired(num, options);
  }

  if (typeof value === "number") return parseIntIfRequired(value, options);
  if (typeof value === "boolean") return value ? 1 : 0;
  return def;
}

function parseIntIfRequired(num: number | null, options?: NumberParseOptions): number | null {
  const toInt = !!options?.int;
  if (!num || !toInt) return num;

  const mode = options?.roundMode || "round";
  return Math[mode]?.(num) ?? Math.round(num);
}
