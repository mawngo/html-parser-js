import { ValueParserEngine, ValueSelector } from "./base.js";
import { extractScope } from "../common.js";
import { SelectorOptions, SimpleSelector } from "../base.js";
import customParseFormat from "dayjs/plugin/customParseFormat.js";
import dayjs, { Dayjs } from "dayjs";

dayjs.extend(customParseFormat);

interface DateParseOptions {
  parse?: string | string[];
  format?: "iso" | "date" | "dayjs" | "timestamp" | string;
  default?: string | Date;
}

export interface DateSelector extends ValueSelector, DateParseOptions {
  date: true;
}

export class DateParserEngine extends ValueParserEngine<DateSelector> {
  match(selector?: any): boolean {
    return this.isSimpleSelector(selector) && selector?.date === true;
  }

  protected parseValue(value: any, context: DateSelector): Promise<Dayjs | Date | string | number | null> {
    return Promise.resolve(parseDate(value, context));
  }
}

export function parseDate(value: any, options: DateParseOptions = {}): Dayjs | Date | string | number | null {
  const def = options.default ?? null;
  const format = options.format || "iso";
  const isSupported = typeof value === "number" || typeof value === "string" || value instanceof Date || dayjs.isDayjs(value);

  if (isSupported) {
    const date = dayjs(value, options.parse);
    if (!date || !date.isValid()) return def;
    if (format === "iso") return date.toISOString();
    if (format === "dayjs") return date;
    if (format === "date") return date.toDate();
    if (format === "timestamp") return date.toDate().getTime();
    return date.format(format);
  }
  return def;
}

export function date(
  selector: SimpleSelector,
  opts?: SimpleSelector | DateParseOptions & SelectorOptions,
  parse?: string | string[],
  format?: "iso" | "date" | "dayjs" | "timestamp" | string,
  defaultValue?: string | Date
): DateSelector {
  const [scope, options] = extractScope(opts);
  return {
    date: true,
    selector,
    scope,
    parse: parse,
    format: format,
    default: defaultValue,
    ...options
  };
}
