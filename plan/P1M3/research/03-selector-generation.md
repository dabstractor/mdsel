# Selector Generation Algorithms

## Selector Format

From `plan/architecture/selector_grammar.md`:

```
selector = [namespace "::"] path ["?" query_params]
path = path_segment ("/" path_segment)*
path_segment = node_type "[" index "]"
node_type = "root" | "heading:hN" | "section" | "block:type"
```

Examples:
- `doc::root`
- `doc::heading:h2[1]`
- `doc::heading:h2[1]/section[0]/block:code[0]`
- `doc::section[2]/page[1]?full=true`

## Ordinal Selector Generation

### Core Algorithm

The key insight is to count siblings of the same type to determine 0-based ordinal indices:

```typescript
interface SiblingCounter {
  [nodeType: string]: number;
}

function getNodeOrdinal(node: Node, parent: Node | null): number {
  if (!parent || !('children' in parent)) {
    return 0;
  }

  const siblings = parent.children;
  const sameTypeSiblings = siblings.filter(s => s.type === node.type);

  return sameTypeSiblings.indexOf(node);
}
```

### Selector Segment Generation

```typescript
import type { Node, Heading, Paragraph, Code, List, Table, Blockquote } from 'mdast';

type BlockType = 'paragraph' | 'code' | 'list' | 'table' | 'blockquote';

function nodeToBlockType(node: Node): BlockType | null {
  if (node.type === 'paragraph') return 'paragraph';
  if (node.type === 'code') return 'code';
  if (node.type === 'list') return 'list';
  if (node.type === 'table') return 'table';
  if (node.type === 'blockquote') return 'blockquote';
  return null;
}

function createSelectorSegment(
  node: Node,
  parent: Node | null,
  index: number
): string {
  switch (node.type) {
    case 'root':
      return 'root';

    case 'heading':
      return `heading:h${(node as Heading).depth}[${index}]`;

    default: {
      const blockType = nodeToBlockType(node);
      if (blockType) {
        return `block:${blockType}[${index}]`;
      }
      return `${node.type}[${index}]`;
    }
  }
}
```

### Full Path Generation

```typescript
interface SelectorPath {
  namespace: string;
  segments: string[];
}

function generateSelectorPath(
  node: Node,
  ancestors: Array<{ node: Node; index: number }>,
  namespace: string
): string {
  const parts: string[] = [];

  // Add all ancestor segments
  for (const { node: ancestor, index } of ancestors) {
    if (ancestor.type === 'root') continue;
    parts.push(createSelectorSegment(ancestor, null, index));
  }

  // Add current node segment
  const currentIndex = ancestors.length > 0
    ? ancestors[ancestors.length - 1].index
    : 0;
  parts.push(createSelectorSegment(node, null, currentIndex));

  const path = parts.join('/');

  return namespace ? `${namespace}::${path}` : path;
}
```

## Section Selector Generation

### Section Virtual Node

A "section" is a virtual node that groups a heading with all its content:

```typescript
interface SectionSelector {
  headingIndex: number;      // Index of heading within its level
  sectionIndex: number;      // Index of this section within parent
  fullSelector: string;      // Complete selector path
}

function generateSectionSelector(
  heading: Heading,
  headingIndex: number,
  sectionIndex: number,
  parentSelector: string | null,
  namespace: string
): SectionSelector {
  const headingSegment = `heading:h${heading.depth}[${headingIndex}]`;

  // Section selector is either top-level or nested
  const fullSelector = parentSelector
    ? `${parentSelector}/section[${sectionIndex}]`
    : `${namespace}::section[${sectionIndex}]`;

  return {
    headingIndex,
    sectionIndex,
    fullSelector
  };
}
```

### Section Building with Selectors

```typescript
import { visit } from 'unist-util-visit';

interface SectionWithSelector {
  heading: Heading;
  headingSelector: string;
  sectionSelector: string;
  content: Node[];
  children: SectionWithSelector[];
  wordCount: number;
}

function buildSectionsWithSelectors(
  tree: Root,
  namespace: string
): SectionWithSelector[] {
  const sections: SectionWithSelector[] = [];
  const stack: SectionWithSelector[] = [];

  // Track heading counts by depth
  const headingCounts: Record<number, number> = {};

  visit(tree, 'heading', (node: Heading, index, parent) => {
    const depth = node.depth;

    // Count this heading
    headingCounts[depth] = (headingCounts[depth] || 0) + 1;
    const headingIndex = headingCounts[depth] - 1;

    // Create selector for this heading
    const headingSelector = `${namespace}::heading:h${depth}[${headingIndex}]`;

    // Find parent section
    while (stack.length > 0 && stack[stack.length - 1].heading.depth >= depth) {
      stack.pop();
    }

    const section: SectionWithSelector = {
      heading: node,
      headingSelector,
      sectionSelector: '',
      content: [],
      children: [],
      wordCount: 0
    };

    if (stack.length > 0) {
      // Child section
      const parentSection = stack[stack.length - 1];
      const sectionIndex = parentSection.children.length;
      section.sectionSelector = `${parentSection.sectionSelector}/section[${sectionIndex}]`;
      parentSection.children.push(section);
    } else {
      // Top-level section
      const sectionIndex = sections.length;
      section.sectionSelector = `${namespace}::section[${sectionIndex}]`;
      sections.push(section);
    }

    stack.push(section);
  });

  return sections;
}
```

## Block Selector Generation

### Counting Siblings of Same Type

```typescript
interface TypeIndexer {
  getCurrentIndex(node: Node): number;
}

class SiblingTypeIndexer implements TypeIndexer {
  private typeCounts = new Map<string, number>();

  getCurrentIndex(node: Node): number {
    const key = node.type;
    const count = this.typeCounts.get(key) || 0;
    this.typeCounts.set(key, count + 1);
    return count;
  }

  reset() {
    this.typeCounts.clear();
  }
}

// Alternative: Count within parent context
function getSiblingIndex(node: Node, parent: Node): number {
  if (!('children' in parent)) return 0;

  const siblings = parent.children;
  const sameTypeSiblings = siblings.filter(s => s.type === node.type);

  return sameTypeSiblings.indexOf(node);
}
```

### Generating All Selectors for a Tree

```typescript
interface NodeWithSelector {
  node: Node;
  selector: string;
  parent: NodeWithSelector | null;
  children: NodeWithSelector[];
}

function generateAllSelectors(
  tree: Root,
  namespace: string
): NodeWithSelector[] {
  const result: NodeWithSelector[] = [];
  const parentStack: NodeWithSelector[] = [];

  // Track type counts at each level
  const typeCountStack: Map<string, number>[] = [new Map()];

  visit(tree, (node, index, parent) => {
    const currentCounts = typeCountStack[typeCountStack.length - 1];
    const nodeType = node.type;

    // Get ordinal index
    const currentCount = currentCounts.get(nodeType) || 0;
    currentCounts.set(nodeType, currentCount + 1);

    // Create selector
    const segment = createSelectorSegment(node, parent, currentCount);
    const parentSelector = parentStack.length > 0
      ? parentStack[parentStack.length - 1].selector
      : namespace;

    const selector = parentStack.length === 0
      ? `${namespace}::${segment}`
      : `${parentSelector}/${segment}`;

    const nodeWithSelector: NodeWithSelector = {
      node,
      selector,
      parent: parentStack.length > 0 ? parentStack[parentStack.length - 1] : null,
      children: []
    };

    result.push(nodeWithSelector);

    // Handle children
    if ('children' in node && node.children.length > 0) {
      parentStack.push(nodeWithSelector);
      typeCountStack.push(new Map());
    } else {
      // Pop when done with leaf
      if (parentStack.length > 0 && parentStack[parentStack.length - 1].node === parent) {
        typeCountStack.pop();
        parentStack.pop();
      }
    }
  });

  return result;
}
```

## Virtual Node Selectors

### Page Selectors

```typescript
interface PageSelector {
  pageSelector: string;
  pageIndex: number;
  totalPages: number;
  wordCount: number;
}

function generatePageSelector(
  parentSelector: string,
  pageIndex: number,
  totalPages: number
): PageSelector {
  return {
    pageSelector: `${parentSelector}/page[${pageIndex}]`,
    pageIndex,
    totalPages,
    wordCount: 0 // To be calculated
  };
}
```

### Root Content Selector

```typescript
// Content before the first heading
function generateRootSelector(namespace: string): string {
  return `${namespace}::root`;
}
```

## Selector String Utilities

### Selector Parsing

```typescript
interface ParsedSelector {
  namespace: string | null;
  path: string[];
  queryParams: Record<string, string>;
}

function parseSelector(selector: string): ParsedSelector {
  const result: ParsedSelector = {
    namespace: null,
    path: [],
    queryParams: {}
  };

  // Extract namespace
  const namespaceMatch = selector.match(/^([^:]+)::/);
  if (namespaceMatch) {
    result.namespace = namespaceMatch[1];
    selector = selector.slice(namespaceMatch[0].length);
  }

  // Extract query params
  const queryIndex = selector.indexOf('?');
  if (queryIndex !== -1) {
    const queryString = selector.slice(queryIndex + 1);
    selector = selector.slice(0, queryIndex);

    const pairs = queryString.split('&');
    for (const pair of pairs) {
      const [key, value] = pair.split('=');
      result.queryParams[key] = value || 'true';
    }
  }

  // Split path
  result.path = selector.split('/').filter(s => s.length > 0);

  return result;
}
```

### Selector Validation

```typescript
function isValidSelector(selector: string): boolean {
  // Basic validation
  const pattern = /^(?:[^:]+::)?(?:root|(?:heading:h[1-6]|section|block:(?:paragraph|code|list|table|blockquote)|page)\[\d+\])(?:\/(?:heading:h[1-6]|section|block:(?:paragraph|code|list|table|blockquote)|page)\[\d+\])*(?:\?.*)?$/;

  return pattern.test(selector);
}
```

## Gotchas and Best Practices

1. **0-Based Indexing**: First item is `[0]`, not `[1]`
2. **Type-Specific Counting**: Count siblings of same type only
3. **Namespace Separation**: Always include namespace prefix for multi-document scenarios
4. **Virtual vs Physical**: Sections and pages are virtual - they don't exist in mdast
5. **Selector Stability**: Selectors depend on document structure - reordering changes them
6. **Path Building**: Build from root to target, not reverse

## References

- Selector Grammar: `plan/architecture/selector_grammar.md`
- CSS Selector Generator: https://github.com/antonmedv/css-selector-generator
- XPath Generation: https://github.com/ff1959/xpath-generator
