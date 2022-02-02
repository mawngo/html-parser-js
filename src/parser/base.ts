import { unwrapSelector } from "../engine/common.js";
import {
  Configurable,
  GeneralSelector,
  Node,
  NodeFactory,
  ParserEngine,
  SimpleSelector,
  TransformFunction
} from "../engine/index.js";

const isConfigurable = (x: any): x is Configurable => typeof x.config === "function";

export interface ParserOptions<P extends GeneralSelector> {
  engines: ParserEngine<P>[];
  nodeFactory: NodeFactory;
  transforms: { [key: string]: TransformFunction };
}

export class CoreParser<P extends GeneralSelector> {
  protected readonly options: ParserOptions<P>;

  constructor(options: Partial<ParserOptions<P>> & { nodeFactory: NodeFactory }) {
    this.options = { engines: [], transforms: {}, ...options };
    for (const engine of this.options.engines) {
      if (!isConfigurable(engine)) continue;
      engine.config(options);
    }
  }

  parseHtml<T>(html: string, selector: P | SimpleSelector): Promise<T | null> {
    const node = this.options.nodeFactory.loadHtml(html);
    return this.parseNode(node, selector);
  }

  parseNode<T>(node: Node, selector: P | SimpleSelector): Promise<T | null> {
    const unwrappedSelector = unwrapSelector(selector) as P;
    for (const engine of this.options.engines) {
      if (!engine.match(unwrappedSelector)) continue;
      return engine.parse<T>(node, unwrappedSelector);
    }
    return Promise.resolve(null);
  }
}
