interface SelectorOptions {
  scope?: string;
  trim?: string;
  array?: boolean;
  transforms?: TransformFunction[] | TransformFunction;
}

interface ObjectSelector extends SelectorOptions {
  selector: MapSelector | MapSelector[];
  objTransforms?: TransformFunction[],
}

interface StringParseOptions {
  default?: string | null;
}

interface StringSelector extends SelectorOptions, StringParseOptions {
  selector: SimpleSelector;
  string: true;
}

interface NumberParseOptions {
  int?: boolean;
  default?: number | null;
}

interface NumberSelector extends SelectorOptions, NumberParseOptions {
  selector: SimpleSelector;
  number: true;
}

interface BooleanParseOptions {
  truthy?: string | string[];
  falsy?: string | string[];
  default?: boolean | null;
}

interface BooleanSelector extends SelectorOptions, BooleanParseOptions {
  selector: SimpleSelector;
  boolean: true;
}

type SimpleSelector = string | string[];
type MapSelector = { [key: string]: Selector };
type Selector = ObjectSelector | BooleanSelector | NumberSelector | StringSelector | SimpleSelector;

type TransformFunction = <T, V>(value: V) => T | Promise<T>;
