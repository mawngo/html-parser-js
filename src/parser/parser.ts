import { NumberParserEngine, NumberSelector } from "../engine/value/number.js";
import { ObjectParserEngine, ObjectSelector } from "../engine/object.js";
import { DefaultParserEngine, DefaultSelector } from "../engine/value/string.js";
import { CoreParser, ParserOptions } from "./base.js";
import { CheerioNodeFactory } from "./node-factory.js";
import { load } from "cheerio";
import { BooleanParserEngine, BooleanSelector } from "../engine/value/boolean.js";
import { GeneralSelector } from "../engine/base.js";
import { DateParserEngine, DateSelector } from "../engine/value/date.js";

type BasicSupportedType<P extends GeneralSelector> =
  | ObjectSelector<BasicSupportedType<P>>
  | NumberSelector
  | DefaultSelector
  | P

export class BasicParser<P extends GeneralSelector = DefaultSelector> extends CoreParser<BasicSupportedType<P>> {
  constructor(options: Partial<ParserOptions<BasicSupportedType<P>>> = {}) {
    options.engines = [
      ...options.engines || [],
      new ObjectParserEngine<BasicSupportedType<P>>(),
      new NumberParserEngine(),
      new DefaultParserEngine()
    ];
    super({
      nodeFactory: new CheerioNodeFactory(load("")),
      ...options
    });
  }
}

type SupportedType<P extends GeneralSelector> =
  | ObjectSelector<SupportedType<P>>
  | NumberSelector
  | BooleanSelector
  | DateSelector
  | DefaultSelector
  | P

export class Parser<P extends GeneralSelector = DefaultSelector> extends CoreParser<SupportedType<P>> {
  constructor(options: Partial<ParserOptions<SupportedType<P>>> = {}) {
    options.engines = [
      ...options.engines || [],
      new ObjectParserEngine<SupportedType<P>>(),
      new NumberParserEngine(),
      new BooleanParserEngine(),
      new DateParserEngine(),
      new DefaultParserEngine()
    ];
    super({
      nodeFactory: new CheerioNodeFactory(load("")),
      ...options
    });
  }
}
