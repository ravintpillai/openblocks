import { memoized } from "util/memoize";
import { EvalMethods } from "./types/evalTypes";
import { FunctionNode, withFunction } from "./functionNode";
import { AbstractNode, Node, ValueFn } from "./node";
import { RecordNode } from "./recordNode";

interface CachedValue<T> {
  value: T;
  isCached: boolean;
}

export class CachedNode<T> extends AbstractNode<CachedValue<T>> {
  type: string = "cached";
  child: AbstractNode<T>;
  constructor(child: AbstractNode<T>) {
    super();
    this.child = withEvalCache(child);
  }
  override wrapContext(paramName: string): AbstractNode<ValueFn<CachedValue<T>>> {
    const childNode: Node<CachedValue<ValueFn<T>>> = new CachedNode(
      this.child.wrapContext(paramName)
    );
    return new FunctionNode(childNode, (childResult) => (...params: any[]) => {
      return { value: childResult.value(...params), isCached: childResult.isCached };
    });
  }
  @memoized()
  override filterNodes(exposingNodes: Record<string, Node<unknown>>): Map<Node<unknown>, string[]> {
    return this.child.filterNodes(exposingNodes);
  }
  override justEval(
    exposingNodes: Record<string, Node<unknown>>,
    methods?: EvalMethods
  ): CachedValue<T> {
    const isCached = this.child.isHitEvalCache(exposingNodes); // isCached must be set before evaluate() call
    const result = this.child.evaluate(exposingNodes, methods);
    return { value: result, isCached: isCached };
  }

  override getChildren(): Node<unknown>[] {
    return [this.child];
  }
  override dependValues(): Record<string, unknown> {
    return this.child.dependValues();
  }
  override fetchInfo(exposingNodes: Record<string, Node<unknown>>) {
    return this.child.fetchInfo(exposingNodes);
  }
}

function withEvalCache<T>(node: AbstractNode<T>): FunctionNode<T, T> {
  const newNode = withFunction(node, (x) => x);
  newNode.evalCache = { ...node.evalCache };
  return newNode;
}

/**
 * return a new node with two input nodes.
 * - if mainNode is never evaled, then (new node).evaluate equals to mainNode.evaluate
 * - if mainNode is never evaled, then (new node).evaluate equals to minorNode.evaluate
 *
 * @remarks
 * encapsulation logic: 2 nodes -> CachedNode(mainNode)+minorNode -> RecordNode({main, minor}) -> FunctionNode
 *
 * @warn improper use may cause unexpected behaviour, be careful.
 * @param mainNode mainNode
 * @param minorNode minorNode
 * @returns the new node
 */
export function evalNodeOrMinor<T>(mainNode: AbstractNode<T>, minorNode: Node<T>): Node<T> {
  const nodeRecord = { main: new CachedNode(mainNode), minor: minorNode };
  return new FunctionNode(new RecordNode(nodeRecord), (record) => {
    const mainCachedValue = record.main;
    if (!mainCachedValue.isCached) {
      return mainCachedValue.value;
    }
    return record.minor;
  });
}
