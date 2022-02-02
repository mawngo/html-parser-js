import { ValueParserEngine, ValueSelector } from "./base.js";
import { SelectorOptions, SimpleSelector } from "../base.js";
import { extractScope } from "../common.js";

interface NumberParseOptions {
  int?: boolean;
  default?: number | null;
  roundMode?: "round" | "floor" | "ceil";
}

export interface NumberSelector extends ValueSelector, NumberParseOptions {
  number: true;
}

export class NumberParserEngine extends ValueParserEngine<NumberSelector> {
  match(selector?: any): boolean {
    return this.isSimpleSelector(selector) && selector?.number === true;
  }

  protected parseValue(value: any, context: NumberSelector): Promise<number | null> {
    return Promise.resolve(parseNumber(value, context));
  }
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

export function num(
  selector: SimpleSelector,
  opts?: SimpleSelector | NumberParseOptions & SelectorOptions,
  defaultValue: number | null = null
): NumberSelector {
  const [scope, options] = extractScope(opts);
  return {
    number: true,
    selector,
    scope,
    default: defaultValue,
    ...options
  };
}

export function int(
  selector: SimpleSelector,
  opts?: SimpleSelector | NumberParseOptions & SelectorOptions,
  defaultValue: number | null = null
): NumberSelector {
  const [scope, options] = extractScope(opts);
  return {
    number: true,
    int: true,
    selector,
    scope,
    default: defaultValue,
    ...options
  };
}