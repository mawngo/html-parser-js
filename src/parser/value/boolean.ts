import { ValueParserEngine, ValueSelector } from "./base";
import { wrapArray } from "../common";


export interface BooleanParseOptions {
  truthy?: string | string[];
  falsy?: string | string[];
  default?: boolean | null;
}

export interface BooleanSelector extends ValueSelector, BooleanParseOptions {
  boolean: true;
}

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
