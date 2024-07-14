import { ValueParserEngine, ValueSelector } from "./base.js";
import { extractScope } from "../common.js";
import { SelectorOptions, SimpleSelector } from "../base.js";
import customParseFormat from "dayjs/plugin/customParseFormat.js";
import dayjs, { Dayjs } from "dayjs";

dayjs.extend(customParseFormat);

/**
 * Additional options for {@link DateSelector}
 */
interface DateParseOptions {
  /*
   * Format for parsing input string into date.
   * Date format: https://day.js.org/docs/en/parse/string-format#list-of-all-available-parsing-tokens
   *
   * If number passed, the engine ignore the format and parse number as timestamp
   */
  parse?: string | string[];
  /**
   * Output date format
   * - if format options is 'iso', the parser return value as iso date string (default)
   * - if format options is 'date', the parser return value as Date object
   * - if format options is 'timestamp', the parser return value as timestamp number
   * - if format options is 'dayjs', the parser return value as dayjs instance
   * - if format options is other string, the parser return formatted date string
   * Date format: https://day.js.org/docs/en/parse/string-format#list-of-all-available-parsing-tokens
   */
  format?: "iso" | "date" | "dayjs" | "timestamp" | string;
  /**
   * Default value for case invalid date
   */
  default?: string | Date | number;
}

/**
 * Selector for {@link DateParserEngine}
 * @see DateParseOptions
 */
export interface DateSelector extends ValueSelector, DateParseOptions {
  /**
   * Enable date parsing
   */
  date: true;
}

/**
 * A {@link ParserEngine engine} that parse {@link Node} to Date
 */
export class DateParserEngine extends ValueParserEngine<DateSelector> {
  match(selector?: any): boolean {
    return this.isSimpleSelector(selector) && selector?.date === true;
  }

  protected parseValue(value: any, context: DateSelector): Promise<Dayjs | Date | string | number | null> {
    return Promise.resolve(parseDate(value, context));
  }
}

export function parseDate(value: any, options: DateParseOptions = {}): Dayjs | Date | string | number | null {
  const format = options.format || "iso";
  const def = formatDate(options.default ? dayjs(options.default) : null, format);
  const isSupported = typeof value === "number" || typeof value === "string" || value instanceof Date || dayjs.isDayjs(value);

  if (isSupported) {
    const date = dayjs(value, options.parse);
    if (!date || !date.isValid()) return def;
    return formatDate(date, format);
  }
  return def;
}

function formatDate(date: Dayjs | null, format: string): Dayjs | Date | string | number | null {
  if (!date || !date.isValid()) return null;
  if (format === "iso") return date.toISOString();
  if (format === "dayjs") return date;
  if (format === "date") return date.toDate();
  if (format === "timestamp") return date.toDate().getTime();
  return date.format(format);
}

/**
 * Schema helper to create a {@link DateSelector} without nesting
 */
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
