import { Configurable, GeneralSelector, Node, ParserEngine, SimpleSelector, TransformFunction } from "../base.js";
import { parseSelectorString, wrapArray } from "../common.js";
import { parse } from "@lanatools/pipe-parser";

export interface ValueSelector extends GeneralSelector<SimpleSelector> {
  selector: SimpleSelector;
}

interface ValueParserEngineConfig {
  transforms: {
    [key: string]: TransformFunction
  };
}

export abstract class ValueParserEngine<P extends ValueSelector> extends ParserEngine<P> implements Configurable<ValueParserEngineConfig> {
  protected options: ValueParserEngineConfig = { transforms: {} };

  config(options: Partial<ValueParserEngineConfig>) {
    this.options = { ...this.options, ...options };
  }

  parseNode<T>(node: Node, context: P): Promise<T | null> {
    context = { ...context };
    const isArray = Array.isArray(context.selector);
    const rawSelector = isArray ? context.selector[0] : context.selector as string;
    if (!rawSelector) return Promise.reject(new Error("Empty selector. Please check your selector schema syntax"));

    const { selector, attribute, transforms } = parseSelectorString(rawSelector);
    if (!selector) return Promise.reject(new Error("Empty selector. Please check your selector schema syntax"));
    // add transform from selector to transform array
    context.transforms = [...transforms, ...wrapArray(context.transforms)];

    if (isArray) {
      const attrs: Promise<any>[] = node.find(selector)
        .map(child => this.selectAttr(child, attribute, context))
        .filter(attr => attr != null);
      return Promise.all(attrs) as Promise<unknown> as Promise<T>;
    }

    const firstNode = node.first(selector);
    return this.selectAttr(firstNode, attribute, context);
  }

  protected selectAttr(node: Node | null, attr: string | undefined, context: P): Promise<any | null> {
    if (!attr) attr = "text";
    let value: string | null;

    if (node == null) {
      value = null;
    } else if (attr === "text") {
      value = node.text();
    } else if (attr === "html" || attr === "innerHTML") {
      value = node.innerHTML();
    } else if (attr === "outerHTML") {
      value = node.outerHTML();
    } else {
      value = node.attr(attr);
    }

    value = this.applyTransforms(value, context);
    return this.parseValue(value, context);
  }

  private applyTransforms(value: any, context: P): any | null {
    if (value && context.trim !== false) value = value.trim();
    if (!context.transforms) return value;

    const transforms = this.buildTransformList(context.transforms);
    return transforms.reduce((val: any, transform) => transform(val), value);
  }

  private buildTransformList(rawTransforms: (TransformFunction | string)[]): TransformFunction[] {
    const transforms: TransformFunction[] = [];
    for (const raw of rawTransforms) {
      if (typeof raw !== "string") {
        transforms.push(raw);
        continue;
      }

      const transformStrings = parse(raw);
      for (const transformString of transformStrings) {
        const transform = this.options.transforms[transformString.name];
        if (!transform) continue;
        transforms.push((val: any) => transform(val, ...transformString.args));
      }
    }
    return transforms;
  }

  protected isSimpleSelector(selector?: any): boolean {
    if (Array.isArray(selector?.selector)) {
      return typeof selector?.selector[0] === "string";
    }
    return typeof selector?.selector === "string";
  }

  protected abstract parseValue(value: any, context: P): Promise<any | null>
}

