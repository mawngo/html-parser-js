import { unwrapSelector } from "../engine/common.js";
import {
  Configurable,
  GeneralSelector,
  Node,
  NodeFactory,
  ParserEngine,
  SimpleSelector,
  TransformFunction
} from "../engine/base.js";
import { ObjectSelector } from "../engine/object.js";


const isConfigurable = (x: any): x is Configurable => typeof x.config === "function";

/**
 * The base configuration for {@link CoreParser parsers}
 */
export interface CoreParserOptions<P extends GeneralSelector> {
  engines: ParserEngine<P>[];
  nodeFactory: NodeFactory;
  transforms: { [key: string]: TransformFunction };
  arrTransforms: { [key: string]: TransformFunction };
}

/**
 * The base class for implement parsers, contains methods for parsing html and {@link Node}
 */
export class CoreParser<P extends GeneralSelector> {
  protected readonly options: CoreParserOptions<P>;

  constructor(options: Partial<CoreParserOptions<P>> & { nodeFactory: NodeFactory, engines: ParserEngine<P>[] }) {
    this.options = { transforms: {}, arrTransforms: {}, ...options };
    if (!this.options.engines.length) throw new Error("No engine provided. please provide at least one engine in engines[] option");
    for (const engine of this.options.engines) {
      if (!isConfigurable(engine)) continue;
      engine.config(options);
    }
  }

  /**
   * Parse html into array
   */
  parseHtml<T>(html: string, selector: string[]): Promise<T>;
  /**
   * Parse html into array
   */
  parseHtml<T>(html: string, selector: P & { scope: string[] }): Promise<T>;
  /**
   * Parse html into array
   */
  parseHtml<T>(html: string, selector: P & { selector: string[] }): Promise<T>;
  /**
   * Parse into type T (object), which is specified by the schema.
   */
  parseHtml<T>(html: string, selector: P & ObjectSelector<P>): Promise<T>;
  /**
   * Parse into type T, which is specified by the schema.
   */
  parseHtml<T>(html: string, selector: P | SimpleSelector): Promise<T | null>;
  /**
   * Async version of parseHtml
   */
  async parseHtml<T>(html: string, selector: P | SimpleSelector): Promise<T | null> {
    const node = this.options.nodeFactory.loadHtml(html);
    return this.parseNode<T>(node, selector);
  }

  /**
   * Parse {@link Node} into array
   */
  parseNode<T>(node: Node, selector: string[]): Promise<T>;
  /**
   * Parse {@link Node} into array
   */
  parseNode<T>(node: Node, selector: P & { scope: string[] }): Promise<T>;
  /**
   * Parse {@link Node} into array
   */
  parseNode<T>(node: Node, selector: P & { selector: string[] }): Promise<T>;
  /**
   * Parse into type T (object), which is specified by the schema.
   */
  parseNode<T>(node: Node, selector: P & ObjectSelector<P>): Promise<T>;
  /**
   * Parse into type T, which is specified by the schema.
   */
  parseNode<T>(node: Node, selector: P | SimpleSelector): Promise<T | null>;
  /**
   * Async version of parseNode
   */
  async parseNode<T>(node: Node, selector: P | SimpleSelector): Promise<T | null> {
    const unwrappedSelector = unwrapSelector(selector) as P;
    for (const engine of this.options.engines) {
      if (!engine.match(unwrappedSelector)) continue;
      return engine.parse<T>(node, unwrappedSelector);
    }
    return null;
  }
}
