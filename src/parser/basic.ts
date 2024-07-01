import { Cheerio, load } from "cheerio";
import { AnyNode as CheerioNodeElement } from "domhandler/lib/node.js";
import { GeneralSelector, Node, NodeFactory, ParserEngine, TransformFunction } from "../engine/base.js";
import { ObjectParserEngine, ObjectSelector } from "../engine/object.js";
import { DefaultParserEngine, DefaultSelector } from "../engine/value/string.js";
import { CoreParser, CoreParserOptions } from "./base.js";
import { transforms } from "./transforms.js";

/**
 * Implement of {@link NodeFactory} backed by Cheerio.
 */
export class CheerioNodeFactory implements NodeFactory {
  loadHtml(html: string): Node {
    return new CheerioNode(load(html).root());
  }
}

/**
 * Implement of {@link Node} backed by Cheerio element.
 */
export class CheerioNode implements Node {
  public readonly el: Cheerio<CheerioNodeElement>;

  constructor(el: Cheerio<CheerioNodeElement>) {
    this.el = el;
  }

  attr(name: string): string | null {
    return this.el.attr(name) ?? null;
  }

  parent(): Node {
    const parent = this.el.parent();
    return new CheerioNode(parent);
  }

  find(selector: string): Node[] {
    const elements = this.el.find(selector);
    if (elements.length === 0) return [];
    const nodes: Node[] = [];
    elements.each((i) => {
      nodes.push(new CheerioNode(elements.eq(i)));
    });
    return nodes;
  }

  first(selector: string): Node | null {
    const elements = this.el.find(selector);
    if (elements.length === 0) return null;
    return new CheerioNode(elements.first());
  }

  innerHTML(): string {
    return this.el.html() ?? "";
  }

  text(): string {
    return this.el.text();
  }

  outerHTML(): string {
    return this.el.toString();
  }

  is(node: Node): boolean {
    if (!(node instanceof CheerioNode)) throw new Error("Operation not supported. target node is not CheerioNode");
    return this.el.is(node.el);
  }
}

export type BasicSupportedType<P extends GeneralSelector = DefaultSelector> =
  | ObjectSelector<BasicSupportedType<P>>
  | DefaultSelector
  | P

export interface ParserOptions<P extends GeneralSelector> extends CoreParserOptions<P> {
  objTransforms: {
    [key: string]: TransformFunction
  };
}

export class BasicParser<P extends GeneralSelector = DefaultSelector> extends CoreParser<BasicSupportedType<P>> {
  constructor(options: Partial<ParserOptions<BasicSupportedType<P>>> = {}) {
    options.transforms = {
      ...transforms,
      ...options.transforms
    };
    options.objTransforms = {
      ...transforms,
      ...options.objTransforms
    };
    options.arrTransforms = {
      ...transforms,
      ...options.arrTransforms
    };
    options.engines = [
      ...options.engines || [],
      new ObjectParserEngine<BasicSupportedType<P>>(),
      new DefaultParserEngine()
    ];
    super({
      nodeFactory: new CheerioNodeFactory(),
      ...options as Partial<ParserOptions<BasicSupportedType<P>>> & { engines: ParserEngine<P>[] }
    });
  }
}
