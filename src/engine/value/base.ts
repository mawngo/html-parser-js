import { Configurable, GeneralSelector, Node, ParserEngine, SimpleSelector, TransformFunction } from "../base.js";
import { buildTransformList, parseSelectorString } from "../common.js";

/**
 * Selector for {@link ValueParserEngine}
 */
export interface ValueSelector extends GeneralSelector<SimpleSelector> {
  /**
   * The selector for engine to select value.
   * For all {@link ValueParserEngine value parser} implementation, we support {@link SimpleSelector}
   */
  selector: SimpleSelector;
}

interface ValueParserEngineConfig {
  transforms: {
    [key: string]: TransformFunction
  };
  arrTransforms: {
    [key: string]: TransformFunction
  };
}

/**
 * Base {@link ParserEngine engine} that parse {@link Node} to value
 */
export abstract class ValueParserEngine<P extends ValueSelector> extends ParserEngine<P> implements Configurable<ValueParserEngineConfig> {
  protected options: ValueParserEngineConfig = { transforms: {}, arrTransforms: {} };

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
    // add transform from selector to transform array. transform from selector run first
    context.transforms = [...transforms, ...context.transforms ?? []];

    if (isArray) {
      const attrs: Promise<any>[] = node.find(selector)
        .map(child => this.selectAttr(child, attribute, context))
        .filter(attr => attr != null);
      return Promise.all(attrs)
        .then(attrs => this.applyArrTransforms(attrs, context)) as Promise<unknown> as Promise<T>;
    }

    const firstNode = node.first(selector);
    return this.selectAttr(firstNode, attribute, context);
  }

  private applyArrTransforms(value: any[], context: P): any | [] {
    if (!Array.isArray(value)) return value;
    if (!context.arrTransforms || !context.arrTransforms.length) return value;
    const transforms = buildTransformList(context.arrTransforms, this.options.arrTransforms);
    return transforms.reduce((val: any, transform) => transform(val), value);
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
    if (!context.transforms || !context.transforms.length) return value;

    const transforms = buildTransformList(context.transforms, this.options.transforms);
    return transforms.reduce((val: any, transform) => transform(val), value);
  }

  protected isSimpleSelector(selector?: any): boolean {
    if (Array.isArray(selector?.selector)) {
      return typeof selector?.selector[0] === "string";
    }
    return typeof selector?.selector === "string";
  }

  protected abstract parseValue(value: any, context: P): Promise<any | null>
}

