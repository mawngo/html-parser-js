import { ValueParserEngine, ValueSelector } from "./base.js";
import { extractScope, wrapArray } from "../common.js";
import { SelectorOptions, SimpleSelector } from "../base.js";

/**
 * Additional options for {@link BooleanSelector}
 */
interface BooleanParseOptions {
  /**
   * List of value to parse as true
   * - if number passed the parser parse 0 as false, others as true
   * - if falsy, and truthy not provided, the parser parse non-empty string as true, empty string as false
   * - if only falsy provided, the parser parse falsy string as false, otherwise true
   * - if only truthy provided, the parser parse truthy string as true, otherwise false
   * - if both passed, the parser parse truthy string as true, falsy string as false, otherwise default value
   */
  truthy?: string | string[];
  /**
   * List of value to parse as false
   */
  falsy?: string | string[];
  /**
   * Default value for case complex type or null passed
   */
  default?: boolean | null;
}

/**
 * Selector for {@link BooleanParserEngine}
 * @see BooleanParseOptions
 */
export interface BooleanSelector extends ValueSelector, BooleanParseOptions {
  /**
   * Enable boolean parsing
   */
  boolean: true;
}

/**
 * A {@link ParserEngine engine} that parse {@link Node} to boolean
 */
export class BooleanParserEngine extends ValueParserEngine<BooleanSelector> {
  match(selector: any): boolean {
    return this.isSimpleSelector(selector) && selector?.boolean === true;
  }

  protected parseValue(value: any, context: BooleanSelector): Promise<boolean | null> {
    return Promise.resolve(parseBoolean(value, context));
  }
}

export function parseBoolean(value: any, options: BooleanParseOptions = {}): boolean | null {
  const def = options.default ?? null;

  if (typeof value === "string") {
    options.falsy = wrapArray<string>(options.falsy);
    options.truthy = wrapArray<string>(options.truthy);

    if (!options.falsy.length && !options.truthy.length) return value !== "";
    if (!options.falsy.length) return !!options.truthy?.includes(value);
    if (!options.truthy.length) return !options.falsy?.includes(value);

    const isTrue = options.truthy.includes(value);
    if (isTrue) return true;

    const isFalse = options.falsy.includes(value);
    if (isFalse) return false;

    return def;
  }

  if (typeof value === "number") return value !== 0;
  if (typeof value === "boolean") return value;
  return def;
}

/**
 * Schema helper to create a {@link BooleanSelector} without nesting
 */
export function bool(
  selector: SimpleSelector,
  opts?: SimpleSelector | BooleanParseOptions & SelectorOptions,
  truthy?: string | string[],
  falsy?: string | string[]
): BooleanSelector {
  const [scope, options] = extractScope(opts);
  return {
    boolean: true,
    selector,
    scope,
    truthy,
    falsy,
    ...options
  };
}
