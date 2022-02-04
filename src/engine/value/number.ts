import { ValueParserEngine, ValueSelector } from "./base.js";
import { SelectorOptions, SimpleSelector } from "../base.js";
import { extractScope } from "../common.js";
import numeral, { Numeral } from "numeral";

// Number format: http://numeraljs.com/#format
interface NumberParseOptions {
  int?: boolean;
  default?: number | null;
  format?: "number" | string;
  roundMode?: "round" | "floor" | "ceil";
}

export interface NumberSelector extends ValueSelector, NumberParseOptions {
  number: true;
}

export class NumberParserEngine extends ValueParserEngine<NumberSelector> {
  match(selector?: any): boolean {
    return this.isSimpleSelector(selector) && selector?.number === true;
  }

  protected parseValue(value: any, context: NumberSelector): Promise<number | string | null> {
    return Promise.resolve(parseNumber(value, context));
  }
}

export function parseNumber(value: any, options: NumberParseOptions = {}): number | string | null {
  const def = parseNumberFormat(options.default != null ? numeral(options.default) : null, options);
  if (typeof value === "string") {
    if (value === "") return def;
    const num = numeral(value);
    if (num.value() == null) return def;
    return parseNumberFormat(num, options);
  }

  if (typeof value === "number") return parseNumberFormat(numeral(value), options);
  if (typeof value === "boolean") return parseNumberFormat(numeral(value ? 1 : 0), options);
  return def;
}

function parseNumberFormat(number: Numeral | null, options: NumberParseOptions): string | number | null {
  if (number == null || number.value() == null) return null;

  if (options?.int) {
    const value = number.value() as number;
    const mode = options?.roundMode || "round";
    number = numeral(Math[mode]?.(value) ?? Math.round(value));
  }

  if (!options.format || options.format === "number") return number.value();
  return number.format(options.format);
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
