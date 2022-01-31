import { Configurable, Node, ParserEngine, SelectorOptions, TransformFunction } from "../node";
import { parseSelectorString, wrapArray } from "../common";

export interface ValueSelector extends SelectorOptions {
  selector: SimpleSelector;
}

export type SimpleSelector = string | string[];

export interface ValueParserEngineConfig {
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
    const isArray = Array.isArray(context.selector);
    const rawSelector = isArray ? context.selector[0] : context.selector as string;
    if (!rawSelector) throw new Error("Empty selector. Please check your selector schema syntax");

    const { selector, attribute, transforms } = parseSelectorString(rawSelector);
    if (!selector) throw new Error("Empty selector. Please check your selector schema syntax");
    // add transform to
    context.transforms = [...transforms, ...wrapArray(context.transforms)];

    if (isArray) {
      const attrs: Promise<any>[] = node.find(selector)
        .map(child => this.selectAttr(child, attribute, context))
        .filter(attr => attr != null)
        .map(attr => this.parseValue(attr as string, context));
      return Promise.all(attrs) as Promise<unknown> as Promise<T>;
    }

    const firstNode = node.first(selector);
    if (!firstNode) return Promise.resolve(null);
    const attr = this.selectAttr(firstNode, attribute, context);
    if (!attr) return Promise.resolve(null);
    return this.parseValue(attr, context);
  }

  protected selectAttr(node: Node, attr: string | undefined, context: P): any | null {
    if (!attr) attr = "text";
    let value: string | null;

    if (attr === "text") {
      value = node.text();
    } else if (attr === "html") {
      value = node.html();
    } else {
      value = node.attr(attr);
    }

    if (value == null) return null;
    if (context.trim === false) return attr.trim();
    // TODO: apply transform.
    return value;
  }

  protected isSimpleSelector(selector: any): boolean {
    if (Array.isArray(selector.selector)) {
      return typeof selector.selector[0] === "string";
    }
    return typeof selector.selector === "string";
  }

  protected abstract parseValue(value: any, context: P): Promise<any | null>
}

