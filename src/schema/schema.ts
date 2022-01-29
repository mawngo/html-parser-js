export interface SelectorOptions {
  scope?: string;
  trim?: string;
  array?: boolean;
  transforms?: TransformFunction[] | TransformFunction;
}

export interface ValueSelector extends SelectorOptions {
  selector: SimpleSelector;
}

export interface ObjectSelector extends SelectorOptions {
  selector: MapSelector | MapSelector[];
  objTransforms?: TransformFunction[];
}

export type SimpleSelector = string | string[];
export type MapSelector = { [key: string]: Selector };
export type Selector = ObjectSelector | ValueSelector | SimpleSelector;

type TransformFunction = <T, V>(value: V) => T | Promise<T>;
