export interface StringParseOptions {
  default?: string | null;
  defaultIfEmpty?: string | null;
  match?: string | RegExp;
  defaultIfNoMatch?: string | null;
}

export function parseString(value: any, options: StringParseOptions = {}): string | null {
  const def = options.default ?? null;
  if (typeof value === "string") {
    if (options.defaultIfEmpty && value === "") return options.defaultIfEmpty;
    if (value == null) return def;
    return matchIfRequired(value, options);
  }

  if (typeof value === "number" || typeof value === "boolean") return matchIfRequired(value.toString(), options);
  return def;
}

function matchIfRequired(value: string | null, options?: StringParseOptions): string | null {
  if (value == null) return value;
  if (!options?.match) return value;
  const regex = new RegExp(options?.match);
  return regex.exec(value)?.[0] ?? options?.defaultIfNoMatch ?? null;
}
