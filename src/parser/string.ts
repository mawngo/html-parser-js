import { ValueSelector } from "../schema/schema";

export interface ValueParser<T, O> {
  parse(value: any, options?: O): T | Promise<T | null> | null;

  isSelectorMatch(selector: any): boolean;
}

export interface StringParseOptions {
  default?: string | null;
  defaultIfEmpty?: string | null;
  match?: string | RegExp;
  defaultIfNoMatch?: string | null;
}

export interface StringSelector extends ValueSelector, StringParseOptions {
  string: true;
}

export class StringValueParser implements ValueParser<string, StringParseOptions> {
  parse(value: any, options: StringParseOptions = {}): string | null {
    const def = options.default ?? null;
    if (typeof value === "string") {
      if (options.defaultIfEmpty && value === "") return options.defaultIfEmpty;
      if (value == null) return def;
      return matchIfRequired(value, options);
    }

    if (typeof value === "number" || typeof value === "boolean") return matchIfRequired(value.toString(), options);
    return def;
  }

  isSelectorMatch(selector: any): boolean {
    return selector.string === true;
  }
}

export class DefaultValueParser extends StringValueParser {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  override isSelectorMatch(_selector: any): boolean {
    // always match
    return true;
  }
}

function matchIfRequired(value: string | null, options?: StringParseOptions): string | null {
  if (value == null) return value;
  if (!options?.match) return value;
  const regex = new RegExp(options?.match);
  return regex.exec(value)?.[0] ?? options?.defaultIfNoMatch ?? null;
}
