import { wrapArray } from "./common";
import { ValueSelector } from "../../schema/schema";
import { ValueParser } from "./string";

export interface BooleanParseOptions {
  truthy?: string | string[];
  falsy?: string | string[];
  default?: boolean | null;
}

export interface BooleanSelector extends ValueSelector, BooleanParseOptions {
  boolean: true;
}

export class BooleanValueParser implements ValueParser<boolean, BooleanParseOptions> {
  parse(value: any, options: BooleanParseOptions = {}): boolean | null {
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

  match(selector: any): boolean {
    return selector?.boolean === true;
  }
}
