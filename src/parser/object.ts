import { Configurable, Node, ParserEngine, SelectorOptions, TransformFunction } from "./node.js";
import { unwrapSelector } from "./common.js";
import { SimpleSelector, ValueSelector } from "./value/base.js";

export type Selector = ObjectSelector | ValueSelector | SimpleSelector;
export type MapSelector = { [key: string]: Selector };

export interface ObjectSelector extends SelectorOptions {
  selector: MapSelector;
  objTransforms?: TransformFunction[];
}

export interface ObjectParserEngineOptions {
  engines: ParserEngine[];
  objTransforms: {
    [key: string]: TransformFunction
  };
}

// Parse object values
export class ObjectParserEngine extends ParserEngine<ObjectSelector> implements Configurable<ObjectParserEngineOptions> {
  private options: ObjectParserEngineOptions = { engines: [], objTransforms: {} };

  config(options: Partial<ObjectParserEngineOptions>) {
    // swallow copy, so the ref of engines arrays is kept
    this.options = { ...this.options, ...options };
  }

  match(selector: any): boolean {
    if (selector.object === false) return false;
    if (Array.isArray(selector.selector)) return false;
    return typeof selector.selector === "object";
  }

  async parseNode<T>(node: Node, context: ObjectSelector): Promise<T | null> {
    const parsed = {};
    for (const [key, value] of Object.entries(context.selector)) {
      parsed[key] = await this.parseSelectorValue(node, value, context);
    }
    // TODO: apply object transform
    return parsed as T;
  }


  private parseSelectorValue(node: Node, value: Selector, context: ObjectSelector): Promise<any | null> {
    const selector = { ...unwrapSelector(value) };
    if (context.trim != null && selector.trim == null) {
      selector.trim = context.trim;
    }
    if (context.transforms && context.transforms.length) {
      selector.transforms = selector.transforms || [];
      selector.transforms = [...selector.transforms, ...context.transforms];
    }
    for (const engine of this.options.engines) {
      if (!engine.match(selector)) continue;
      return engine.parse(node, selector);
    }
    return Promise.resolve(null);
  }
}
