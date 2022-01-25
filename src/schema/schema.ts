import { BooleanParseOptions } from "../parser/boolean";
import { NumberParseOptions } from "../parser/number";
import { StringParseOptions } from "../parser/string";

export interface SelectorOptions {
  scope?: string;
  trim?: string;
  array?: boolean;
  transforms?: TransformFunction[] | TransformFunction;
}

export interface ObjectSelector extends SelectorOptions {
  selector: MapSelector | MapSelector[];
  objTransforms?: TransformFunction[],
}

export interface StringSelector extends SelectorOptions, StringParseOptions {
  selector: SimpleSelector;
  string: true;
}

export interface NumberSelector extends SelectorOptions, NumberParseOptions {
  selector: SimpleSelector;
  number: true;
}

export interface BooleanSelector extends SelectorOptions, BooleanParseOptions {
  selector: SimpleSelector;
  boolean: true;
}

export type SimpleSelector = string | string[];
export type MapSelector = { [key: string]: Selector };
export type Selector = ObjectSelector | BooleanSelector | NumberSelector | StringSelector | SimpleSelector;

type TransformFunction = <T, V>(value: V) => T | Promise<T>;
