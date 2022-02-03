import { Cheerio, CheerioAPI } from "cheerio";
import { Node as CheerioNodeElement } from "domhandler/lib/node.js";
import { Node, NodeFactory } from "../engine/base.js";

export class CheerioNodeFactory implements NodeFactory {
  private readonly $: CheerioAPI;

  constructor($: CheerioAPI) {
    this.$ = $;
  }

  loadHtml(html: string): Node {
    return new CheerioNode(this.$.load(html).root());
  }
}

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
