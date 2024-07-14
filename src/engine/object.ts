import {
  Configurable,
  GeneralSelector,
  Node,
  ParserEngine,
  SelectorOptions,
  SimpleSelector,
  TransformFunction
} from "./base.js";
import { buildTransformList, extractScope, isObject, unwrapSelector } from "./common.js";

type ObjectSelectorMap<S extends GeneralSelector> = {
  [key: string]: SimpleSelector | S | ObjectSelector<S>
}

/**
 * Selector for {@link ObjectParserEngine}
 */
export interface ObjectSelector<S extends GeneralSelector> extends GeneralSelector<ObjectSelectorMap<S>> {
  /**
   *  List of transform to apply. transform can be a function that take
   *  current value and return another value, or name of ```built-in transforms```
   *
   *  transforms will be applied on all object's fields, and run after fields transform
   */
  transforms?: (TransformFunction | string)[];
  /**
   * The selector for engine to select value.
   * For {@link ObjectParserEngine object parser} we support {@link ObjectSelectorMap map selector}
   */
  selector: ObjectSelectorMap<S>;
  /**
   * Apply transform to the object result
   */
  objTransforms?: (TransformFunction | string)[];
  /**
   * Enable object parsing. Set to ```false``` to disable, only when you want to implement your own ObjectParserEngine
   * By default, this will always true when the selector is {@link ObjectSelectorMap}
   */
  object?: boolean;
  /**
   * Flatten the object, merge its keys with its parent keys
   */
  flat?: boolean;
}

interface ObjectParserEngineOptions<P extends GeneralSelector> {
  engines: (ParserEngine<P> | ObjectParserEngine<P>)[];
  objTransforms: {
    [key: string]: TransformFunction
  };
}

/**
 * A {@link ParserEngine engine} that parse {@link Node} to objects
 * Include this engine make parsing to complex schema possible
 */
export class ObjectParserEngine<P extends GeneralSelector> extends ParserEngine<ObjectSelector<P>> implements Configurable<ObjectParserEngineOptions<P>> {
  private options: ObjectParserEngineOptions<P> = { engines: [], objTransforms: {} };

  config(options: Partial<ObjectParserEngineOptions<P>>) {
    // swallow copy, so the ref of engines arrays is kept
    this.options = { ...this.options, ...options };

    // validate registered engine
    const hasOtherEngine = this.options.engines
      .some(engine => !(engine instanceof ObjectParserEngine));
    if (!hasOtherEngine) throw new Error("Object engine cannot work without other engine, Please register at least one other engine. Example: DefaultParserEngine");
  }

  match(selector?: any): boolean {
    if (selector?.object === false) return false;
    if (Array.isArray(selector?.selector)) return false;
    return typeof selector?.selector === "object";
  }

  async parseNode<T>(node: Node, context: ObjectSelector<P>): Promise<T | null> {
    const promises: Promise<[any, string, ObjectSelector<P>]>[] = Object.entries(context.selector)
      .map(([key, value]) => {
        const selector = unwrapSelector(value) as P;
        return this.parseSelectorValue(node, selector, context)
          .then(parsedValue => [parsedValue, key, selector]); // add key value to process later (maintaining keys order)
      });

    const parsed = {};
    const overwrite = {};
    const parseResults = await Promise.all(promises);
    for (const [parsedValue, key, selector] of parseResults) {
      if (selector.flat && isObject(parsedValue)) {
        Object.assign(overwrite, parsedValue);
        continue;
      }
      parsed[key] = parsedValue;
    }
    return this.applyObjTransforms({ ...parsed, ...overwrite }, context) as T;
  }

  private applyObjTransforms(value: any, context: ObjectSelector<P>): any | null {
    if (!context.objTransforms || !context.objTransforms.length) return value;
    const transforms = buildTransformList(context.objTransforms, this.options.objTransforms);
    return transforms.reduce((val: any, transform) => transform(val), value);
  }

  private parseSelectorValue(node: Node, selector: P, context: ObjectSelector<GeneralSelector>): Promise<any | null> {
    if (context.trim != null && selector.trim == null) {
      selector.trim = context.trim;
    }
    if (context.transforms && context.transforms.length) {
      selector.transforms = selector.transforms || [];
      // add transform from object to selector transform array. transform from object run last
      selector.transforms = [...selector.transforms, ...context.transforms];
    }
    if (context.arrTransforms && context.arrTransforms.length) {
      selector.arrTransforms = selector.arrTransforms || [];
      // add arrTransform from object to selector arrTransform array. arrTransform from object run last
      selector.arrTransforms = [...selector.arrTransforms, ...context.arrTransforms];
    }
    for (const engine of this.options.engines) {
      if (!engine.match(selector)) continue;
      return engine.parse(node, selector);
    }
    return Promise.resolve(null);
  }
}

/**
 * Schema helper to create a {@link ObjectSelector} without nesting
 */
export function obj<S extends GeneralSelector>(
  selector: ObjectSelectorMap<S>,
  opts?: SimpleSelector | SelectorOptions
): ObjectSelector<S> {
  const [scope, options] = extractScope(opts);
  return {
    selector,
    scope,
    ...options
  };
}

/**
 * Schema helper to create a {@link ObjectSelector} with ```{flat: true}``` without nesting
 */
export function flat<S extends GeneralSelector>(
  selector: ObjectSelectorMap<S>,
  opts?: SimpleSelector | SelectorOptions
): ObjectSelector<S> {
  const [scope, options] = extractScope(opts);
  return {
    selector,
    scope,
    flat: true,
    ...options
  };
}
