export interface Node {
  find(selector: string): Node[];

  first(selector: string): Node | null;

  parent(): Node;

  text(): string;

  innerHTML(): string;

  outerHTML(): string;

  attr(name: string): string | null;

  is(node: Node): boolean;
}

export interface NodeFactory {
  loadHtml(html: string): Node;
}

export interface Configurable<C = any> {
  config(options: C | Partial<C>);
}

export abstract class ParserEngine<P extends GeneralSelector = GeneralSelector> {
  parse<T>(node: Node | null, context: P): Promise<T | null> {
    if (node === null) return Promise.resolve(null);

    if (!context.scope) return this.parseNode<T>(node, context);

    if (Array.isArray(context.scope)) {
      const scope = context.scope[0];
      if (!scope) return this.tryAutoScoping(node, context);

      const children = node.find(scope);
      return this.parseAllNode(children, context);
    }

    const child = node.first(context.scope);
    if (!child) return Promise.resolve(null);
    return this.parseNode(child, context);
  }

  private tryAutoScoping<T>(node: Node, context: P): Promise<T | null> {
    const selector = Array.isArray(context.selector) ? context.selector[0] : context.selector;
    if (!selector) return Promise.reject(new Error("Selector is required"));
    if (typeof selector !== "string") return Promise.reject(new Error("Invalid scope: []. Auto scoping only support simple selector. Please provide valid scope (string or array of single string). Ex: 'h1' or ['h1']"));

    const grandchildren = node.find(selector);
    const children = removeDuplicateNode(grandchildren.map(child => child.parent()));
    return this.parseAllNode(children, context);
  }

  private parseAllNode<T>(nodes: Node[], context: P): Promise<T> {
    if (nodes.length === 0) return Promise.resolve([] as unknown as T);
    return Promise.all(nodes.map(node => this.parseNode(node, context)))
      .then(values => values.filter(val => val != null)) as unknown as Promise<T>;
  }

  protected abstract parseNode<T>(node: Node, context: P): Promise<T | null>;

  abstract match(selector?: any): boolean;
}

function removeDuplicateNode(nodes: Node[]): Node[] {
  const uniqueNodes: Node[] = [];
  for (const node of nodes) {
    const existed = uniqueNodes.some(uniqueNode => node.is(uniqueNode));
    if (existed) continue;
    uniqueNodes.push(node);
  }
  return uniqueNodes;
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
