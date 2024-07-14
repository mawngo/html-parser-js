import { NumberParserEngine, NumberSelector } from "../engine/value/number.js";
import { ObjectSelector } from "../engine/object.js";
import { DefaultSelector } from "../engine/value/string.js";
import { BooleanParserEngine, BooleanSelector } from "../engine/value/boolean.js";
import { GeneralSelector } from "../engine/base.js";
import { DateParserEngine, DateSelector } from "../engine/value/date.js";
import { BasicParser, ParserOptions } from "./basic.js";

/**
 * Types that {@link Parser} can parse to
 */
export type SupportedType<P extends GeneralSelector = DefaultSelector> =
  | ObjectSelector<SupportedType<P>>
  | NumberSelector
  | BooleanSelector
  | DateSelector
  | DefaultSelector
  | P

/**
 * A Parser with all built-in {@link ParserEngine engines} included
 */
export class Parser<P extends GeneralSelector = DefaultSelector> extends BasicParser<SupportedType<P>> {
  constructor(options: Partial<ParserOptions<SupportedType<P>>> = {}) {
    options.engines = [
      ...options.engines || [],
      new NumberParserEngine(),
      new BooleanParserEngine(),
      new DateParserEngine()
    ];
    super({ ...options });
  }
}
