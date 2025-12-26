# Semantic Tree Data Structures in TypeScript

## Core Interface Design

### Base Node Interface

```typescript
/**
 * Base interface for all semantic nodes in the tree.
 * All nodes have a type, selector, and optional parent/children.
 */
export interface BaseSemanticNode {
  /** Unique selector path for this node */
  selector: string;
  /** Node type discriminator */
  type: NodeType;
  /** Parent node (null for root) */
  parent: SemanticNode | null;
  /** Child nodes */
  children: SemanticNode[];
  /** Word count for this node's content */
  wordCount: number;
  /** Original mdast node reference */
  originalNode: any;
}

/**
 * Discriminated union of all semantic node types.
 * Use the `type` field for type narrowing.
 */
export type SemanticNode =
  | RootSemanticNode
  | HeadingSemanticNode
  | SectionSemanticNode
  | ParagraphSemanticNode
  | CodeSemanticNode
  | ListSemanticNode
  | TableSemanticNode
  | BlockquoteSemanticNode
  | PageSemanticNode;
```

### Node Type Enum

```typescript
/**
 * All possible node types in the semantic tree.
 * Includes physical mdast types and virtual types (section, page, root).
 */
export enum NodeType {
  // Physical types (from mdast)
  HEADING = 'heading',
  PARAGRAPH = 'paragraph',
  CODE = 'code',
  LIST = 'list',
  TABLE = 'table',
  BLOCKQUOTE = 'blockquote',

  // Virtual types (created by semantic tree builder)
  ROOT = 'root',
  SECTION = 'section',
  PAGE = 'page',
}
```

### Type Guards

```typescript
/**
 * Type guard for root nodes
 */
export function isRootNode(node: SemanticNode): node is RootSemanticNode {
  return node.type === NodeType.ROOT;
}

/**
 * Type guard for heading nodes
 */
export function isHeadingNode(node: SemanticNode): node is HeadingSemanticNode {
  return node.type === NodeType.HEADING;
}

/**
 * Type guard for section nodes
 */
export function isSectionNode(node: SemanticNode): node is SectionSemanticNode {
  return node.type === NodeType.SECTION;
}

/**
 * Type guard for page nodes
 */
export function isPageNode(node: SemanticNode): node is PageSemanticNode {
  return node.type === NodeType.PAGE;
}

/**
 * Generic type guard
 */
export function isNodeType<T extends NodeType>(
  node: SemanticNode,
  type: T
): node is SemanticNode & { type: T } {
  return node.type === type;
}
```

## Specific Node Types

### Root Node

```typescript
/**
 * Root semantic node - represents the document root.
 * Contains content before the first heading.
 */
export interface RootSemanticNode extends BaseSemanticNode {
  type: NodeType.ROOT;
  depth: 0;
  /** Content before first heading */
  content: any[];
  /** All headings in document */
  headings: HeadingSemanticNode[];
}
```

### Heading Node

```typescript
/**
 * Heading semantic node - represents a markdown heading.
 */
export interface HeadingSemanticNode extends BaseSemanticNode {
  type: NodeType.HEADING;
  /** Heading depth (1-6) */
  depth: 1 | 2 | 3 | 4 | 5 | 6;
  /** Heading text content */
  text: string;
  /** Ordinal index among headings of same depth */
  index: number;
  /** Child section (if content follows) */
  section?: SectionSemanticNode;
}
```

### Section Node (Virtual)

```typescript
/**
 * Section semantic node - virtual node grouping a heading with its content.
 * A section includes the heading and all content until the next heading
 * of equal or higher level.
 */
export interface SectionSemanticNode extends BaseSemanticNode {
  type: NodeType.SECTION;
  /** The heading that starts this section */
  heading: HeadingSemanticNode;
  /** All content in this section (excluding nested sections) */
  content: BlockSemanticNode[];
  /** Nested sections (sub-headings) */
  children: SectionSemanticNode[];
  /** Section nesting depth */
  depth: number;
  /** Ordinal index among sibling sections */
  index: number;
  /** Word count including all nested content */
  totalWordCount: number;
}
```

### Block Nodes

```typescript
/**
 * Block semantic node - base type for all block-level content.
 */
export interface BlockSemanticNode extends BaseSemanticNode {
  type: Exclude<NodeType, NodeType.ROOT | NodeType.HEADING | NodeType.SECTION | NodeType.PAGE>;
  /** Ordinal index among blocks of same type */
  index: number;
}

/**
 * Paragraph semantic node
 */
export interface ParagraphSemanticNode extends BlockSemanticNode {
  type: NodeType.PARAGRAPH;
}

/**
 * Code semantic node
 */
export interface CodeSemanticNode extends BlockSemanticNode {
  type: NodeType.CODE;
  /** Programming language (if specified) */
  lang: string | undefined;
  /** Code content */
  value: string;
}

/**
 * List semantic node
 */
export interface ListSemanticNode extends BlockSemanticNode {
  type: NodeType.LIST;
  /** True for ordered lists, false for unordered */
  ordered: boolean;
}

/**
 * Table semantic node
 */
export interface TableSemanticNode extends BlockSemanticNode {
  type: NodeType.TABLE;
  /** Column alignment */
  align: ('left' | 'center' | 'right' | null)[] | undefined;
}

/**
 * Blockquote semantic node
 */
export interface BlockquoteSemanticNode extends BlockSemanticNode {
  type: NodeType.BLOCKQUOTE;
}
```

### Page Node (Virtual)

```typescript
/**
 * Page semantic node - virtual node for paginated content.
 * Created when content exceeds MAX_WORDS threshold.
 */
export interface PageSemanticNode extends BaseSemanticNode {
  type: NodeType.PAGE;
  /** Page index (0-based) */
  pageIndex: number;
  /** Total pages in parent node */
  totalPages: number;
  /** Paginated content */
  content: string;
}
```

## Tree Structure

### Complete Semantic Tree

```typescript
/**
 * The complete semantic tree for a document.
 */
export interface SemanticTree {
  /** Namespace (derived from filename) */
  namespace: string;
  /** Root node */
  root: RootSemanticNode;
  /** All nodes indexed by selector */
  nodeIndex: Map<string, SemanticNode>;
  /** All headings indexed by selector */
  headingIndex: Map<string, HeadingSemanticNode>;
  /** All sections indexed by selector */
  sectionIndex: Map<string, SectionSemanticNode>;
}
```

## Immutable Operations

### Tree Builder Pattern

```typescript
/**
 * Builder class for creating semantic trees.
 * Provides fluent interface for constructing trees.
 */
export class SemanticTreeBuilder {
  private tree: Partial<SemanticTree>;
  private currentNodeStack: SemanticNode[];

  constructor(namespace: string) {
    this.tree = {
      namespace,
      nodeIndex: new Map(),
      headingIndex: new Map(),
      sectionIndex: new Map()
    };
    this.currentNodeStack = [];
  }

  withRoot(rootNode: RootSemanticNode): this {
    this.tree.root = rootNode;
    return this;
  }

  addNode(node: SemanticNode, parentSelector: string | null): this {
    if (parentSelector && this.tree.nodeIndex) {
      const parent = this.tree.nodeIndex.get(parentSelector);
      if (parent) {
        node.parent = parent;
        parent.children.push(node);
      }
    }

    if (this.tree.nodeIndex) {
      this.tree.nodeIndex.set(node.selector, node);
    }

    return this;
  }

  build(): SemanticTree {
    if (!this.tree.root || !this.tree.nodeIndex) {
      throw new Error('Cannot build incomplete tree');
    }

    return this.tree as SemanticTree;
  }
}
```

### Node Creation Helpers

```typescript
/**
 * Create a root semantic node
 */
export function createRootNode(
  namespace: string,
  content: any[] = []
): RootSemanticNode {
  return {
    type: NodeType.ROOT,
    selector: `${namespace}::root`,
    parent: null,
    children: [],
    wordCount: 0,
    originalNode: null,
    depth: 0,
    content,
    headings: []
  };
}

/**
 * Create a heading semantic node
 */
export function createHeadingNode(
  namespace: string,
  depth: 1 | 2 | 3 | 4 | 5 | 6,
  text: string,
  index: number,
  originalNode: any
): HeadingSemanticNode {
  const selector = `${namespace}::heading:h${depth}[${index}]`;

  return {
    type: NodeType.HEADING,
    selector,
    parent: null,
    children: [],
    wordCount: text.split(/\s+/).length,
    originalNode,
    depth,
    text,
    index
  };
}

/**
 * Create a section semantic node
 */
export function createSectionNode(
  heading: HeadingSemanticNode,
  index: number
): SectionSemanticNode {
  const selector = `${heading.selector}/section[${index}]`;

  return {
    type: NodeType.SECTION,
    selector,
    parent: heading.parent,
    children: [],
    wordCount: heading.wordCount,
    originalNode: heading.originalNode,
    heading,
    content: [],
    children: [], // Nested sections
    depth: heading.depth,
    index,
    totalWordCount: heading.wordCount
  };
}
```

## JSON Serialization

### Handling Circular References

```typescript
/**
 * Serialize semantic tree to JSON, handling circular references.
 * Converts parent references to selector strings.
 */
export function serializeSemanticTree(tree: SemanticTree): string {
  const replacer = (key: string, value: any): any => {
    // Convert parent reference to selector string
    if (key === 'parent' && value !== null) {
      return (value as SemanticNode).selector;
    }

    // Convert original node to type reference only
    if (key === 'originalNode' && value !== null) {
      return { type: value.type };
    }

    return value;
  };

  return JSON.stringify(tree, replacer, 2);
}

/**
 * Deserialize JSON to semantic tree.
 * Reconstructs parent references from selector strings.
 */
export function deserializeSemanticTree(json: string): SemanticTree {
  const parsed = JSON.parse(json);

  // Reconstruct parent references
  const nodeIndex = parsed.nodeIndex;

  const restoreParent = (node: any) => {
    if (typeof node.parent === 'string') {
      node.parent = nodeIndex.get(node.parent) || null;
    }
    for (const child of node.children) {
      restoreParent(child);
    }
  };

  restoreParent(parsed.root);

  return parsed;
}
```

## Tree Traversal

### Visitor Pattern

```typescript
/**
 * Visit all nodes in the semantic tree.
 */
export function visitSemanticTree(
  tree: SemanticTree,
  visitor: (node: SemanticNode, depth: number) => void
): void {
  const visitNode = (node: SemanticNode, depth: number) => {
    visitor(node, depth);

    for (const child of node.children) {
      visitNode(child, depth + 1);
    }
  };

  visitNode(tree.root, 0);
}

/**
 * Find all nodes matching a predicate.
 */
export function findNodes(
  tree: SemanticTree,
  predicate: (node: SemanticNode) => boolean
): SemanticNode[] {
  const results: SemanticNode[] = [];

  visitSemanticTree(tree, (node) => {
    if (predicate(node)) {
      results.push(node);
    }
  });

  return results;
}

/**
 * Find a node by selector.
 */
export function findNodeBySelector(
  tree: SemanticTree,
  selector: string
): SemanticNode | undefined {
  return tree.nodeIndex.get(selector);
}
```

## Gotchas and Best Practices

1. **Discriminated Unions**: Always use `type` field for type narrowing
2. **Immutable Updates**: Consider using immutable update patterns for tree modifications
3. **Circular References**: Handle parent/child circular references during serialization
4. **Selector Uniqueness**: Ensure selectors are unique within a document
5. **Type Safety**: Use type guards instead of `any` when possible
6. **Node Indices**: Track 0-based ordinal indices for selector generation
7. **Word Count Caching**: Cache word counts to avoid recalculating
8. **Parent Consistency**: Keep parent references in sync with children arrays

## References

- TypeScript Discriminated Unions: https://www.typescriptlang.org/docs/handbook/typescript-in-5-minutes-func.html#discriminated-unions
- Type Guards: https://www.typescriptlang.org/docs/handbook/2/narrowing.html#using-type-predicates
- Tree Data Structures: `01-mdast-traversal.md`, `03-selector-generation.md`
