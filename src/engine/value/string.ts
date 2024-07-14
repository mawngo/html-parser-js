import { ValueParserEngine, ValueSelector } from "./base.js";
import { SelectorOptions, SimpleSelector } from "../base.js";
import { extractScope } from "../common.js";

/**
 * Additional options for {@link StringSelector}
 */
interface StringParseOptions {
  /**
   * Default value, for case complex type or null
   */
  default?: string | null;
  /**
   * Default value when value is empty
   */
  defaultIfEmpty?: string | null;
  /**
   * Match the value and return match
   */
  match?: string | RegExp;
  /**
   * Default value if there is no match
   */
  defaultIfNoMatch?: string | null;
}

/**
 * Selector for {@link DefaultParserEngine}
 * @see StringParseOptions
 */
export interface StringSelector extends ValueSelector, StringParseOptions {
  /**
   * Enable string parsing.
   */
  string: true;
}

/**
 * Selector for {@link DefaultParserEngine}, without explicit enabling string parsing.
 */
export interface DefaultSelector extends ValueSelector, StringParseOptions {
  /**
   * Enable string parsing. By default, if no other type is enabled, we use this engine anyway.
   */
  string?: true;
}

export class StringParserEngine extends ValueParserEngine<StringSelector> {
  match(selector: any): boolean {
    return this.isSimpleSelector(selector) && selector?.string === true;
  }

  protected parseValue(value: any, context: StringSelector): Promise<string | null> {
    return Promise.resolve(parseString(value, context));
  }
}

/**
 * A {@link ParserEngine engine} that parse {@link Node} to string
 */
export class DefaultParserEngine extends ValueParserEngine<DefaultSelector> {
  match(selector?: any): boolean {
    if (selector?.string === false) return false;
    if (!selector || !selector.selector) throw new Error("Please provide a non-empty selector");
    if (Array.isArray(selector.selector)) {
      if (!selector.selector[0]) throw new Error("Please provide a non-empty selector");
      return typeof selector.selector[0] === "string";
    }
    return typeof selector.selector === "string";
  }

  protected parseValue(value: any, context: StringSelector): Promise<string | null> {
    return Promise.resolve(parseString(value, context));
  }
}

export function parseString(value: any, options: StringParseOptions = {}): string | null {
  const def = options.default ?? null;
  if (typeof value === "string") {
    if (options.defaultIfEmpty && value === "") return options.defaultIfEmpty;
    return matchIfRequired(value, options);
  }

  if (typeof value === "number" || typeof value === "boolean") return matchIfRequired(value.toString(), options);
  return def;
}

function matchIfRequired(value: string, options?: StringParseOptions): string | null {
  if (!options?.match) return value;
  const regex = new RegExp(options?.match);
  return regex.exec(value)?.[0] ?? options?.defaultIfNoMatch ?? null;
}

/**
 * Schema helper to create a {@link StringSelector} without nesting
 */
export function str(
  selector: SimpleSelector,
  opts?: SimpleSelector | StringParseOptions & SelectorOptions,
  defaultValue: string | null = null
): StringSelector {
  const [scope, options] = extractScope(opts);
  return {
    string: true,
    selector,
    scope,
    default: defaultValue,
    ...options
  };
}

/**
 * Schema helper to create a {@link StringSelector} with regex matching without nesting
 */
export function match(
  regex: string | RegExp,
  selector: SimpleSelector,
  opts?: SimpleSelector | StringParseOptions & SelectorOptions,
  defaultValue: string | null = null
): StringSelector {
  const [scope, options] = extractScope(opts);
  return {
    string: true,
    selector,
    scope,
    match: regex,
    default: defaultValue,
    defaultIfNoMatch: defaultValue,
    ...options
  };
}
