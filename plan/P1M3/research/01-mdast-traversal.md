# MDAST Tree Traversal Patterns

## Key Libraries

### unist-util-visit
- **URL**: https://github.com/syntax-tree/unist-util-visit
- **Purpose**: Primary library for traversing mdast trees
- **Installation**: `npm install unist-util-visit`

### unist-util-visit-parents
- **URL**: https://github.com/syntax-tree/unist-util-visit-parents
- **Purpose**: Traversal with parent/ancestor tracking
- **Installation**: `npm install unist-util-visit-parents`

### unist-util-is
- **URL**: https://github.com/syntax-tree/unist-util-is
- **Purpose**: Type checking and node predicates
- **Installation**: `npm install unist-util-is`

## Basic Traversal Patterns

### Simple Type-Specific Traversal

```typescript
import { visit } from 'unist-util-visit';
import type { Root, Heading } from 'mdast';

function findAllHeadings(tree: Root): Heading[] {
  const headings: Heading[] = [];
  visit(tree, 'heading', (node) => {
    headings.push(node);
  });
  return headings;
}
```

### Multiple Node Types

```typescript
import { visit } from 'unist-util-visit';

// Visit multiple node types
visit(tree, ['heading', 'paragraph', 'code'], (node) => {
  // Handle different types
  if (node.type === 'heading') {
    // Access heading.depth
  } else if (node.type === 'code') {
    // Access node.lang, node.value
  }
});
```

### Traversal with Parent Tracking

```typescript
import { visitParents } from 'unist-util-visit-parents';
import type { Root } from 'mdast';

interface AncestorInfo {
  node: any;
  index: number;
}

function processWithAncestors(tree: Root) {
  visitParents(tree, 'heading', (node, ancestors) => {
    // Get direct parent
    const directParent = ancestors[ancestors.length - 1]?.node;

    // Get ancestor types
    const ancestorTypes = ancestors.map(a => a.node.type);

    // Calculate nesting depth
    const depth = ancestors.length;

    console.log(`Heading at depth ${depth}, parent path: ${ancestorTypes.join(' > ')}`);
  });
}
```

## Type Guard Patterns

### Node Type Guards

```typescript
import type { Node } from 'unist';
import type { Heading, Paragraph, Code, List, Table, Blockquote } from 'mdast';

// Specific type guard
function isHeading(node: Node): node is Heading {
  return node.type === 'heading';
}

// Generic type guard
function isNodeType<T extends Node['type']>(
  node: Node,
  type: T
): node is Extract<Node, { type: T }> {
  return node.type === type;
}

// Usage with filter
const headings = ast.children.filter(isHeading);
const paragraphs = ast.children.filter((n): n is Paragraph => n.type === 'paragraph');
```

### Discriminated Union Pattern

```typescript
type BlockNode = Paragraph | Code | List | Table | Blockquote;

function isBlockNode(node: Node): node is BlockNode {
  return ['paragraph', 'code', 'list', 'table', 'blockquote'].includes(node.type);
}

function processBlock(node: BlockNode) {
  switch (node.type) {
    case 'heading':
      console.log(`H${node.depth}`);
      break;
    case 'code':
      console.log(`Code: ${node.lang}`);
      break;
    // ... other cases
  }
}
```

## State Accumulation Patterns

### Counting During Traversal

```typescript
interface TraversalState {
  headingCount: number;
  codeBlockCount: number;
  listCount: number;
  tableCount: number;
}

function analyzeDocument(tree: Root): TraversalState {
  const state: TraversalState = {
    headingCount: 0,
    codeBlockCount: 0,
    listCount: 0,
    tableCount: 0
  };

  visit(tree, (node) => {
    switch (node.type) {
      case 'heading':
        state.headingCount++;
        break;
      case 'code':
        state.codeBlockCount++;
        break;
      case 'list':
        state.listCount++;
        break;
      case 'table':
        state.tableCount++;
        break;
    }
  });

  return state;
}
```

### Building Index During Traversal

```typescript
interface NodeIndex {
  headings: Array<{ depth: number; text: string; index: number }>;
  codeBlocks: Array<{ lang: string | undefined; index: number }>;
}

function buildNodeIndex(tree: Root): NodeIndex {
  const index: NodeIndex = {
    headings: [],
    codeBlocks: []
  };

  visit(tree, (node, position) => {
    if (node.type === 'heading' && node.children) {
      const text = node.children
        .filter((child): child is { type: 'text'; value: string } => child.type === 'text')
        .map(child => child.value)
        .join('');

      index.headings.push({
        depth: node.depth,
        text,
        index: position ?? 0
      });
    } else if (node.type === 'code') {
      index.codeBlocks.push({
        lang: node.lang,
        index: position ?? 0
      });
    }
  });

  return index;
}
```

## Visitor Return Values

The visitor function can control traversal:

```typescript
visit(tree, (node, index, parent) => {
  // Return false to skip visiting children
  if (node.type === 'code') {
    return false; // Don't traverse into code block
  }

  // Return true to skip to next sibling
  if (shouldSkip(node)) {
    return true;
  }

  // Return undefined (default) to continue normal traversal
});
```

## Common Gotchas

1. **Position Parameter**: The `index` parameter is the index in parent's children, not a global index
2. **Parent Undefined**: Root nodes have no parent - always check `parent !== undefined`
3. **Mutation**: Modifying nodes during traversal can affect behavior - consider cloning first
4. **Text Splitting**: Text content may be split across multiple `text` nodes
5. **GFM Nodes**: Table nodes only exist when remark-gfm plugin is enabled

## Performance Tips

1. **Specific Node Types**: Use specific node type selectors to avoid unnecessary visits
2. **Early Exit**: Return `false` when you don't need to go deeper
3. **Caching**: Cache traversal results if visiting the same tree multiple times
4. **Batch Operations**: Collect nodes during traversal, then process in batch

## References

- unist-util-visit docs: https://github.com/syntax-tree/unist-util-visit#readme
- unist-util-visit-parents docs: https://github.com/syntax-tree/unist-util-visit-parents#readme
- mdast node types: https://github.com/syntax-tree/mdast#nodes
