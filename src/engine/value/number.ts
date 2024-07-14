import { ValueParserEngine, ValueSelector } from "./base.js";
import { SelectorOptions, SimpleSelector } from "../base.js";
import { extractScope } from "../common.js";
import numeral, { Numeral } from "numeral";

/**
 * Additional options for {@link NumberSelector}
 */
interface NumberParseOptions {
  /**
   * Round value to int
   */
  int?: boolean;
  /**
   * Default value, for case invalid number
   */
  default?: number | null;
  /**
   * If format string passed then format number to that format (as string)
   * Number format: http://numeraljs.com/#format
   */
  format?: "number" | string;
  /**
   * Mode used to round value to int
   */
  roundMode?: "round" | "floor" | "ceil";
}

/**
 * Selector for {@link NumberParserEngine}
 */
export interface NumberSelector extends ValueSelector, NumberParseOptions {
  /**
   * Enable number parsing.
   */
  number: true;
}

/**
 * A {@link ParserEngine engine} that parse {@link Node} to number
 * @see NumberParseOptions
 */
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

/**
 * Schema helper to create a {@link NumberSelector} without nesting
 */
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

/**
 * Schema helper to create a {@link NumberSelector} that round to int without nesting
 */
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
