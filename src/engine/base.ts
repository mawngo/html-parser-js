export interface Node {
  find(selector: string): Node[];

  first(selector: string): Node | null;

  text(): string;

  innerHTML(): string;

  outerHTML(): string;

  attr(name: string): string | null;
}

export interface NodeFactory {
  loadHtml(html: string): Node;
}

export interface Configurable<C = any> {
  config(options: C | Partial<C>);
}

export const isConfigurable = (x: any): x is Configurable => typeof x.config === "function";

export abstract class ParserEngine<P extends GeneralSelector = GeneralSelector> {
  parse<T>(node: Node | null, context: P): Promise<T | null> {
    if (node === null) return Promise.resolve(null);

    if (!context.scope) return this.parseNode<T>(node, context);

    if (Array.isArray(context.scope)) {
      const scope = context.scope[0];
      if (!scope) throw new Error("Invalid scope selector: []. Please provide valid scope (string or array of single string). Ex: 'h1' or ['h1']");

      const children = node.find(scope);
      if (children.length === 0) return Promise.resolve([] as unknown as T);

      return Promise.all(children.map(node => this.parseNode(node, context)))
        .then(values => values.filter(val => val != null)) as unknown as Promise<T>;
    }

    const child = node.first(context.scope);
    if (!child) return Promise.resolve(null);
    return this.parseNode(child, context);
  }

  protected abstract parseNode<T>(node: Node, context: P): Promise<T | null>;

  abstract match(selector?: any): boolean;
}

export type TransformFunction = (value: any, ...args: any[]) => any;
export type SimpleSelector = string | string[];

export interface SelectorOptions {
  scope?: SimpleSelector;
  trim?: boolean;
  transforms?: (TransformFunction | string)[];
}

export interface GeneralSelector<T = any> extends SelectorOptions {
  selector: T,
}
