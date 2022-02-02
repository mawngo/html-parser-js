import { Cheerio, CheerioAPI } from "cheerio";
import { Node as CheerioNodeElement } from "domhandler/lib/node.js";
import { Node, NodeFactory } from "../engine/index.js";

export class CheerioNodeFactory implements NodeFactory {
  private readonly $: CheerioAPI;

  constructor($: CheerioAPI) {
    this.$ = $;
  }

  loadHtml(html: string): Node {
    return new CheerioNode(this.$.load(html).root(), this.$);
  }
}

export class CheerioNode implements Node {
  private readonly $: CheerioAPI;
  private readonly el: Cheerio<CheerioNodeElement>;

  constructor(el: Cheerio<CheerioNodeElement>, $: CheerioAPI) {
    this.el = el;
    this.$ = $;
  }

  attr(name: string): string | null {
    return this.el.attr(name) ?? null;
  }

  find(selector: string): Node[] {
    const elements = this.el.find(selector);
    if (elements.length === 0) return [];
    const nodes: Node[] = [];
    elements.each((_, el) => {
      nodes.push(new CheerioNode(this.$(el), this.$));
    });
    return nodes;
  }

  first(selector: string): Node | null {
    const elements = this.el.find(selector);
    if (elements.length === 0) return null;
    return new CheerioNode(this.$(elements.first()), this.$);
  }

  html(): string | null {
    return this.el.html();
  }

  text(): string {
    return this.el.text();
  }
}
