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

export interface CoreParserOptions<P extends GeneralSelector> {
  engines: ParserEngine<P>[];
  nodeFactory: NodeFactory;
  transforms: { [key: string]: TransformFunction };
}

export class CoreParser<P extends GeneralSelector> {
  protected readonly options: CoreParserOptions<P>;

  constructor(options: Partial<CoreParserOptions<P>> & { nodeFactory: NodeFactory }) {
    this.options = { engines: [], transforms: {}, ...options };
    for (const engine of this.options.engines) {
      if (!isConfigurable(engine)) continue;
      engine.config(options);
    }
  }

  parseHtml<T>(html: string, selector: string[]): Promise<T>;
  parseHtml<T>(html: string, selector: P & { scope: string[] }): Promise<T>;
  parseHtml<T>(html: string, selector: P & { selector: string[] }): Promise<T>;
  parseHtml<T>(html: string, selector: P & ObjectSelector<P>): Promise<T>;
  parseHtml<T>(html: string, selector: P | SimpleSelector): Promise<T | null>;
  async parseHtml<T>(html: string, selector: P | SimpleSelector): Promise<T | null> {
    const node = this.options.nodeFactory.loadHtml(html);
    return this.parseNode<T>(node, selector);
  }

  parseNode<T>(node: Node, selector: string[]): Promise<T>;
  parseNode<T>(node: Node, selector: P & { scope: string[] }): Promise<T>;
  parseNode<T>(node: Node, selector: P & { selector: string[] }): Promise<T>;
  parseNode<T>(node: Node, selector: P & ObjectSelector<P>): Promise<T>;
  parseNode<T>(node: Node, selector: P | SimpleSelector): Promise<T | null>;
  async parseNode<T>(node: Node, selector: P | SimpleSelector): Promise<T | null> {
    const unwrappedSelector = unwrapSelector(selector) as P;
    for (const engine of this.options.engines) {
      if (!engine.match(unwrappedSelector)) continue;
      return engine.parse<T>(node, unwrappedSelector);
    }
    return null;
  }
}
