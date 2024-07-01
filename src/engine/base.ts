/**
 * Common interface of html node object, represent element in the dom.
 *
 * Default implement backed by Cheerio.
 */
export interface Node {
  /**
   * Get the descendants of each element in the current set of matched elements,
   * filtered by a selector, jQuery object, or element.
   */
  find(selector: string): Node[];

  /**
   * Will select the first element of a cheerio object.
   */
  first(selector: string): Node | null;

  /**
   * Get the parent of each element in the current set of matched elements,
   * optionally filtered by a selector.
   */
  parent(): Node;

  /**
   * Get the combined text contents of each element in the set of matched
   *elements, including their descendants.
   */
  text(): string;

  /**
   * Gets an HTML content string from the first selected element.
   */
  innerHTML(): string;

  /**
   * Gets the HTML of the element.
   */
  outerHTML(): string;

  /**
   * Method for getting attributes. Gets the attribute value for only the first
   * element in the matched set.
   */
  attr(name: string): string | null;

  /**
   * Checks the current list of elements and returns `true` if _any_ of the elements match.
   */
  is(node: Node): boolean;
}

/**
 * Common interface for converting html to {@link Node}
 */
export interface NodeFactory {
  loadHtml(html: string): Node;
}

/**
 * Common interface for configurable objects.
 */
export interface Configurable<C = any> {
  config(options: C | Partial<C>): void;
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
    if (!selector) return Promise.reject(new Error("Please provide a non-empty selector"));
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

/**
 * Function that transform a value into another value.
 */
export type TransformFunction = (value: any, ...args: any[]) => any;
/**
 * The most basic selector.
 * {@code string} to select a value.
 * {@code string[]} to select a list of value.
 */
export type SimpleSelector = string | string[];

export interface SelectorOptions {
  scope?: SimpleSelector;
  trim?: boolean;
  transforms?: (TransformFunction | string)[];
  arrTransforms?: (TransformFunction | string)[];
}

export interface GeneralSelector<T = any> extends SelectorOptions {
  selector: T,
}
