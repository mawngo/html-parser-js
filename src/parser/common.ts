import { GeneralSelector, SimpleSelector } from "./base.js";
import { ValueSelector } from "./value/base.js";

export function wrapArray<T>(value?: T | T[] | null): T[] {
  if (Array.isArray(value)) return value;
  return value != null ? [value] : [];
}

export function parseSelectorString(selector: string): { selector?: string, attribute?: string, transforms: string[] } {
  const transforms = selector.split(/\s*\|(?!=)\s*/);
  const selectorsAndAttribute = transforms.shift();
  if (!selectorsAndAttribute) return { transforms };
  const match = selectorsAndAttribute.match(/^([^@]*)(?:@\s*([\w-_:]+))?$/) || [];

  return {
    selector: match[1] ? match[1].trim() : match[1],
    attribute: match[2],
    transforms
  };
}

export function unwrapSelector<T>(selector: GeneralSelector<T> | SimpleSelector): GeneralSelector<T> | ValueSelector {
  if (typeof selector === "string" || Array.isArray(selector)) {
    return {
      selector
    };
  }
  return selector;
}
