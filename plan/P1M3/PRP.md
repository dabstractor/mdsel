# PRP: P1M3 - Semantic Tree Builder

**Phase 1, Milestone 3 - Semantic Tree Builder for mdsel CLI**

---

## Goal

**Feature Goal**: Implement a semantic tree builder that transforms mdast ASTs into a hierarchical structure with path-based selectors, word counts, and virtual nodes (sections, pages) to enable LLM-friendly content navigation.

**Deliverable**: A `src/tree/` module containing:
- Type definitions for SemanticNode, NodeType enum, SemanticTree interfaces
- Word counting utility using mdast-util-to-string
- Selector generator creating path-based selectors with ordinal indexing
- Section virtualizer grouping headings with their content
- `buildSemanticTree()` function converting mdast to semantic tree
- Comprehensive test suite covering selector generation, section building, and word counting

**Success Definition**: Running `npm run test` passes all tree builder tests with 85%+ coverage, and the builder correctly:
- Generates unique selectors for all nodes (e.g., `doc::heading:h2[1]/section[0]/block:code[0]`)
- Creates virtual sections grouping headings with their descendants
- Counts words accurately for all node types
- Builds proper parent-child relationships in the tree
- Handles nested sections and deeply nested content

---

## Why

- **Selector Foundation**: The semantic tree is the core data structure that powers all selector-based operations in the CLI
- **LLM Optimization**: Path-based selectors enable LLMs to navigate large documents efficiently without seeing irrelevant content
- **Virtual Nodes**: Sections and pages provide natural content boundaries that align with how humans and LLMs think about documents
- **Type Safety**: Strongly typed interfaces ensure correct manipulation of tree structures throughout the codebase
- **Downstream Integration**: The Selector Engine (P2) and Output Formatter (P3) depend entirely on the semantic tree structure

---

## What

Create the Semantic Tree Builder infrastructure:

1. **Type Definitions** - SemanticNode interfaces, NodeType enum, SemanticTree structure
2. **Word Counter Utility** - Text extraction and word counting using mdast-util-to-string
3. **Selector Generator** - Path-based selector generation with ordinal indexing
4. **Section Virtualizer** - Grouping headings with their descendant content
5. **buildSemanticTree Function** - Main entry point converting mdast to semantic tree
6. **Test Suite** - Unit tests for all tree builder functionality

### Success Criteria

- [ ] `buildSemanticTree()` returns SemanticTree with complete node hierarchy
- [ ] All nodes have unique selectors with correct ordinal indices
- [ ] Sections properly group headings with all descendant content
- [ ] Word counts are accurate for all node types (headings, paragraphs, code, lists, tables, blockquotes)
- [ ] Root content (before first heading) is handled correctly
- [ ] Nested sections have proper parent-child relationships
- [ ] Test coverage >= 85% for tree builder module
- [ ] All ESLint and TypeScript checks pass

---

## All Needed Context

### Context Completeness Check

_"If someone knew nothing about this codebase, would they have everything needed to implement this successfully?"_ - **YES**, this PRP contains complete type definitions, algorithm specifications, validation commands, and references to all necessary documentation.

### Documentation & References

```yaml
# MUST READ - Core Research (in this PRP's research directory)
- file: plan/P1M3/research/01-mdast-traversal.md
  why: Tree traversal patterns using unist-util-visit, parent tracking, type narrowing
  pattern: visit() and visitParents() for walking mdast trees
  gotcha: Use visitParents() when you need ancestor chains for selector generation

- file: plan/P1M3/research/02-word-counting.md
  why: Text extraction and word counting algorithms with mdast-util-to-string
  pattern: toString() from mdast-util-to-string, split on /\s+/ for word count
  gotcha: Decide whether to count code blocks - this implementation excludes them

- file: plan/P1M3/research/03-selector-generation.md
  why: Complete algorithm for generating path-based selectors with ordinal indexing
  pattern: Count siblings of same type to determine 0-based index
  gotcha: Selector format is `heading:hN[index]` - N is depth 1-6, index is 0-based

- file: plan/P1M3/research/04-pagination.md
  why: Word-based pagination and truncation for virtual page nodes
  pattern: Split on word boundaries, add `[truncated]` marker when content exceeds limit
  gotcha: Page nodes are virtual - created on-demand when content exceeds MAX_WORDS

- file: plan/P1M3/research/05-data-structures.md
  why: TypeScript tree data structures with discriminated unions and immutability
  pattern: Use `type` field for type narrowing, circular reference handling for serialization
  gotcha: Parent references create circular structures - handle during JSON serialization

# MUST READ - Architecture Documentation
- file: plan/architecture/selector_grammar.md
  why: Complete selector grammar specification with examples
  pattern: `namespace::type[index]/type[index]` format
  gotcha: Section and Page are virtual nodes - not in mdast, created by tree builder

- file: plan/architecture/system_context.md
  why: Node type mapping between PRD and mdast, truncation constants
  pattern: MAX_WORDS: 500, PAGE_SIZE: 500, 0-based indexing
  gotcha: "section" is virtual - heading + all descendants until next equal/higher heading

- file: plan/architecture/output_format.md
  why: JSON output structure with pagination metadata
  pattern: PageInfo with current_page, total_pages, word_count, has_more
  gotcha: Add `[truncated]` marker when content exceeds MAX_WORDS

# MUST READ - Existing Codebase Patterns
- file: src/parser/types.ts
  why: Parser types and ParserOptions pattern
  pattern: JSDoc comments, import type for mdast types
  gotcha: Use `import type` for mdast types to avoid bundle bloat

- file: src/parser/parse.ts
  why: ParseResult pattern for returning results
  pattern: Return wrapped result object with AST and metadata
  gotcha: Follow same error handling pattern with custom error classes

# Official Documentation URLs
- url: https://github.com/syntax-tree/unist-util-visit
  why: Tree traversal library for mdast
  critical: Use visit(tree, nodeType, visitor) pattern for type-safe traversal

- url: https://github.com/syntax-tree/unist-util-visit-parents
  why: Traversal with ancestor tracking for selector generation
  critical: visitor receives (node, ancestors) array for building paths

- url: https://github.com/syntax-tree/mdast-util-to-string
  why: Text extraction from mdast nodes
  critical: Handles nested children, inline formatting, returns plain text

- url: https://github.com/syntax-tree/mdast#nodes
  why: Complete mdast node type reference
  critical: All node types have position property and specific fields (depth for headings, etc.)
```

### Current Codebase Tree

```bash
/home/dustin/projects/mdsel/
├── package.json                     # Dependencies: unified, remark-parse, remark-gfm, unist-util-visit
├── tsconfig.json                    # TypeScript config (strict, ESM, NodeNext)
├── vitest.config.ts                 # Test config (globals, v8 coverage)
├── eslint.config.js                 # Linting (strictTypeChecked)
├── src/
│   ├── cli/
│   │   └── index.ts                 # CLI entry with placeholder commands
│   ├── parser/                      # COMPLETE from P1M2
│   │   ├── index.ts                 # Exports parseMarkdown, parseFile, types
│   │   ├── types.ts                 # ParserOptions, ParseResult, ParserError
│   │   ├── processor.ts             # createProcessor factory
│   │   └── parse.ts                 # parseMarkdown, parseFile functions
│   ├── tree/                        # EMPTY - To be implemented in this milestone
│   ├── selector/                    # Future: Selector engine (P2)
│   └── output/                      # Future: Output formatters (P3)
└── dist/                            # Build output (cli.mjs exists)
```

### Desired Codebase Tree After P1M3 Completion

```bash
/home/dustin/projects/mdsel/
├── src/
│   ├── cli/
│   │   └── index.ts                 # Unchanged
│   ├── parser/                      # Unchanged
│   │   ├── index.ts
│   │   ├── types.ts
│   │   ├── processor.ts
│   │   └── parse.ts
│   ├── tree/
│   │   ├── index.ts                 # Public API exports
│   │   ├── types.ts                 # SemanticNode, NodeType, SemanticTree interfaces
│   │   ├── word-counter.ts          # countWords function using mdast-util-to-string
│   │   ├── selector-generator.ts    # generateSelector function
│   │   ├── section-virtualizer.ts   # buildSections function
│   │   └── builder.ts               # buildSemanticTree main function
│   ├── selector/                    # Empty (future)
│   └── output/                      # Empty (future)
├── tests/
│   ├── fixtures/                    # Existing from P1M2
│   └── tree/
│       ├── word-counter.test.ts     # Word counting tests
│       ├── selector-generator.test.ts  # Selector generation tests
│       ├── section-virtualizer.test.ts # Section building tests
│       └── builder.test.ts          # Integration tests for buildSemanticTree
└── ...
```

### Known Gotchas & Library Quirks

```typescript
// CRITICAL: ESM imports MUST use .js extension in source files
import { countWords } from './word-counter.js';     // CORRECT
import { countWords } from './word-counter';        // WRONG - runtime error

// CRITICAL: Use type-only imports for mdast types
import type { Root, Heading, Paragraph } from 'mdast';  // CORRECT - no runtime cost
import { Root, Heading, Paragraph } from 'mdast';       // WORKS but bloats bundle

// CRITICAL: Install mdast-util-to-string for word counting
// npm install mdast-util-to-string
import { toString } from 'mdast-util-to-string';

// CRITICAL: Selector format uses specific pattern
// CORRECT: "heading:h2[1]" - h2 is level, [1] is 0-based index
// WRONG: "heading:2[1]" or "heading:h2[2]" (1-based)

// CRITICAL: Section detection algorithm
// A section includes heading + ALL content until next heading of EQUAL or HIGHER level
// Example: ## H2 content, ### H3 (nested), ## H2 (starts new section)

// CRITICAL: Word counting split regex
const words = text.trim().split(/\s+/);  // Handles spaces, tabs, newlines
const count = words.filter(w => w.length > 0).length;  // Filter empty strings

// CRITICAL: Parent references create circular JSON
// Use custom serializer that converts parent to selector string
const replacer = (key, value) => key === 'parent' && value ? value.selector : value;

// CRITICAL: Type guards for discriminated unions
function isHeadingNode(node: SemanticNode): node is HeadingSemanticNode {
  return node.type === NodeType.HEADING;  // Use enum for type safety
}

// CRITICAL: Selector ordinal counting is per-type, not global
// Count siblings of SAME TYPE only, not all siblings
const sameTypeSiblings = siblings.filter(s => s.type === node.type);
const index = sameTypeSiblings.indexOf(node);  // 0-based

// GOTCHA: Root content (before first heading) needs special handling
// Create a virtual "root" node for content before first heading
// Its selector is "namespace::root"

// GOTCHA: Namespace derivation from file path
// Use path.basename(filePath, '.md') to get namespace
// path/to/readme.md → namespace = "readme"

// GOTCHA: unist-util-visit vs unist-util-visit-parents
// Use visit() for simple traversal
// Use visitParents() when you need ancestor chain for selector generation

// GOTCHA: Empty markdown returns Root with empty children
// Handle gracefully - return SemanticTree with empty root node
```

---

## Implementation Blueprint

### Data Models and Structure

```typescript
// src/tree/types.ts

// NodeType enum for discriminated union
export enum NodeType {
  ROOT = 'root',
  HEADING = 'heading',
  SECTION = 'section',
  PARAGRAPH = 'paragraph',
  CODE = 'code',
  LIST = 'list',
  TABLE = 'table',
  BLOCKQUOTE = 'blockquote',
  PAGE = 'page',
}

// Base interface for all semantic nodes
export interface BaseSemanticNode {
  selector: string;
  type: NodeType;
  parent: SemanticNode | null;
  children: SemanticNode[];
  wordCount: number;
  originalNode: any;
}

// Discriminated union of all node types
export type SemanticNode =
  | RootSemanticNode
  | HeadingSemanticNode
  | SectionSemanticNode
  | BlockSemanticNode;

// Specific node types
export interface RootSemanticNode extends BaseSemanticNode {
  type: NodeType.ROOT;
  depth: 0;
  content: any[];
  headings: HeadingSemanticNode[];
}

export interface HeadingSemanticNode extends BaseSemanticNode {
  type: NodeType.HEADING;
  depth: 1 | 2 | 3 | 4 | 5 | 6;
  text: string;
  index: number;
  section?: SectionSemanticNode;
}

export interface SectionSemanticNode extends BaseSemanticNode {
  type: NodeType.SECTION;
  heading: HeadingSemanticNode;
  content: BlockSemanticNode[];
  children: SectionSemanticNode[];
  depth: number;
  index: number;
  totalWordCount: number;
}

export interface BlockSemanticNode extends BaseSemanticNode {
  type: NodeType.PARAGRAPH | NodeType.CODE | NodeType.LIST | NodeType.TABLE | NodeType.BLOCKQUOTE;
  index: number;
}

// Complete tree structure
export interface SemanticTree {
  namespace: string;
  root: RootSemanticNode;
  nodeIndex: Map<string, SemanticNode>;
  headingIndex: Map<string, HeadingSemanticNode>;
  sectionIndex: Map<string, SectionSemanticNode>;
}
```

### Implementation Tasks (Ordered by Dependencies)

```yaml
Task 1: CREATE src/tree/types.ts
  - IMPLEMENT: NodeType enum, BaseSemanticNode, all specific node type interfaces, SemanticTree
  - FOLLOW pattern: src/parser/types.ts (JSDoc comments, import type pattern)
  - NAMING: PascalCase for types, camelCase for properties
  - IMPORTS: Use `import type` for all mdast types
  - PLACEMENT: /src/tree/types.ts
  - VALIDATION: npx tsc --noEmit passes

Task 2: CREATE src/tree/word-counter.ts
  - IMPLEMENT: countWords(node, options?), extractText(node) utilities
  - FOLLOW pattern: plan/P1M3/research/02-word-counting.md
  - PATTERN:
    - Use mdast-util-to-string for text extraction
    - Split on /\s+/ regex for word counting
    - Skip code blocks by default (countCode: false option)
  - DEPENDENCIES: Task 1 (imports SemanticNode types)
  - PLACEMENT: /src/tree/word-counter.ts
  - VALIDATION: Unit tests pass for various node types

Task 3: CREATE src/tree/selector-generator.ts
  - IMPLEMENT: generateSelector(node, ancestors, namespace), createSelectorSegment helpers
  - FOLLOW pattern: plan/P1M3/research/03-selector-generation.md
  - PATTERN:
    - Use visitParents() to get ancestor chain
    - Count siblings of same type for ordinal index
    - Format: `namespace::heading:hN[index]/section[index]/block:type[index]`
  - DEPENDENCIES: Task 1 (imports SemanticNode types)
  - PLACEMENT: /src/tree/selector-generator.ts
  - VALIDATION: Generated selectors match expected format

Task 4: CREATE src/tree/section-virtualizer.ts
  - IMPLEMENT: buildSections(tree, namespace) with stack-based algorithm
  - FOLLOW pattern: plan/P1M3/research/03-selector-generation.md Section Building section
  - PATTERN:
    - Use stack to track nested sections
    - Pop stack when finding heading of equal or higher level
    - Assign content between headings to current section
  - DEPENDENCIES: Task 1 (imports SemanticNode), Task 2 (uses countWords)
  - PLACEMENT: /src/tree/section-virtualizer.ts
  - VALIDATION: Sections group content correctly

Task 5: CREATE src/tree/builder.ts
  - IMPLEMENT: buildSemanticTree(ast, namespace) main function
  - FOLLOW pattern: Integration of all utilities
  - PATTERN:
    - Create root node for content before first heading
    - Traverse tree, generate selectors for all nodes
    - Build sections using section virtualizer
    - Count words for all nodes
    - Build indexes (nodeIndex, headingIndex, sectionIndex)
  - DEPENDENCIES: Tasks 1, 2, 3, 4
  - PLACEMENT: /src/tree/builder.ts
  - VALIDATION: Returns complete SemanticTree with all nodes indexed

Task 6: CREATE src/tree/index.ts
  - IMPLEMENT: Public API exports
  - EXPORTS:
    - { buildSemanticTree } from './builder.js'
    - { countWords } from './word-counter.js'
    - { generateSelector } from './selector-generator.js'
    - { buildSections } from './section-virtualizer.js'
    - All types from './types.js'
  - NAMING: Barrel file pattern
  - DEPENDENCIES: Tasks 1-5
  - PLACEMENT: /src/tree/index.ts
  - VALIDATION: Can import from 'src/tree/index.js' in test files

Task 7: CREATE tests/tree/word-counter.test.ts
  - IMPLEMENT: Unit tests for countWords function
  - TEST CASES:
    - Counts words in paragraph correctly
    - Counts words in heading (excluding # symbols)
    - Skips code blocks by default
    - Counts code blocks when countCode: true
    - Handles empty content (returns 0)
    - Handles inline formatting (bold, italic, links)
    - Handles lists and nested content
  - FOLLOW pattern: tests/parser/*.test.ts (Vitest describe/it/expect)
  - USE fixtures: tests/fixtures/*.md from P1M2
  - COVERAGE: All branches of countWords
  - PLACEMENT: /tests/tree/word-counter.test.ts
  - VALIDATION: npm run test -- tests/tree/word-counter.test.ts passes

Task 8: CREATE tests/tree/selector-generator.test.ts
  - IMPLEMENT: Unit tests for selector generation
  - TEST CASES:
    - Generates correct heading selector (heading:h2[1])
    - Generates correct block selector (block:code[0])
    - Generates correct path (heading:h2[1]/block:code[0])
    - Handles root content selector (namespace::root)
    - Counts siblings of same type correctly
    - Handles multiple headings of same depth
    - Handles namespace prefix correctly
  - FOLLOW pattern: tests/parser/*.test.ts
  - COVERAGE: All selector generation scenarios
  - PLACEMENT: /tests/tree/selector-generator.test.ts
  - VALIDATION: npm run test -- tests/tree/selector-generator.test.ts passes

Task 9: CREATE tests/tree/section-virtualizer.test.ts
  - IMPLEMENT: Unit tests for section building
  - TEST CASES:
    - Creates section for each heading
    - Groups content with heading until next equal/higher heading
    - Handles nested sections (H3 under H2)
    - Calculates section word counts correctly
    - Handles content before first heading (root node)
    - Creates section selectors correctly
  - FOLLOW pattern: tests/parser/*.test.ts
  - COVERAGE: Section building algorithm
  - PLACEMENT: /tests/tree/section-virtualizer.test.ts
  - VALIDATION: npm run test -- tests/tree/section-virtualizer.test.ts passes

Task 10: CREATE tests/tree/builder.test.ts
  - IMPLEMENT: Integration tests for buildSemanticTree
  - TEST CASES:
    - Returns SemanticTree with complete structure
    - Root node contains content before first heading
    - All nodes have unique selectors
    - Headings are indexed correctly
    - Sections have proper parent-child relationships
    - Word counts are accurate for all nodes
    - Node index contains all nodes by selector
    - Handles empty document (returns tree with empty root)
    - Handles document with no headings (all content in root)
  - FOLLOW pattern: tests/parser/*.test.ts
  - USE fixtures: tests/fixtures/*.md
  - COVERAGE: Complete buildSemanticTree flow
  - PLACEMENT: /tests/tree/builder.test.ts
  - VALIDATION: npm run test -- tests/tree/builder.test.ts passes
```

### Implementation Patterns & Key Details

#### src/tree/types.ts (Task 1)

```typescript
import type { Root, Heading, Paragraph, Code, List, Table, Blockquote } from 'mdast';

/**
 * Node type enum for discriminated union type narrowing.
 */
export enum NodeType {
  ROOT = 'root',
  HEADING = 'heading',
  SECTION = 'section',
  PARAGRAPH = 'paragraph',
  CODE = 'code',
  LIST = 'list',
  TABLE = 'table',
  BLOCKQUOTE = 'blockquote',
  PAGE = 'page',
}

/**
 * Base interface for all semantic nodes.
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
  originalNode: Root | Heading | Paragraph | Code | List | Table | Blockquote | null;
}

/**
 * Discriminated union of all semantic node types.
 */
export type SemanticNode =
  | RootSemanticNode
  | HeadingSemanticNode
  | SectionSemanticNode
  | ParagraphSemanticNode
  | CodeSemanticNode
  | ListSemanticNode
  | TableSemanticNode
  | BlockquoteSemanticNode;

/**
 * Root semantic node - represents the document root.
 */
export interface RootSemanticNode extends BaseSemanticNode {
  type: NodeType.ROOT;
  depth: 0;
  /** Content before first heading */
  content: any[];
  /** All headings in document */
  headings: HeadingSemanticNode[];
}

/**
 * Heading semantic node.
 */
export interface HeadingSemanticNode extends BaseSemanticNode {
  type: NodeType.HEADING;
  depth: 1 | 2 | 3 | 4 | 5 | 6;
  /** Heading text content */
  text: string;
  /** Ordinal index among headings of same depth */
  index: number;
  /** Child section (if content follows) */
  section?: SectionSemanticNode;
}

/**
 * Section semantic node - virtual node grouping a heading with its content.
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

/**
 * Base type for block nodes.
 */
export interface BlockSemanticNode extends BaseSemanticNode {
  type: NodeType.PARAGRAPH | NodeType.CODE | NodeType.LIST | NodeType.TABLE | NodeType.BLOCKQUOTE;
  /** Ordinal index among blocks of same type */
  index: number;
}

/**
 * Paragraph semantic node.
 */
export interface ParagraphSemanticNode extends BlockSemanticNode {
  type: NodeType.PARAGRAPH;
}

/**
 * Code semantic node.
 */
export interface CodeSemanticNode extends BlockSemanticNode {
  type: NodeType.CODE;
  /** Programming language (if specified) */
  lang: string | undefined;
}

/**
 * List semantic node.
 */
export interface ListSemanticNode extends BlockSemanticNode {
  type: NodeType.LIST;
  /** True for ordered lists */
  ordered: boolean;
}

/**
 * Table semantic node.
 */
export interface TableSemanticNode extends BlockSemanticNode {
  type: NodeType.TABLE;
}

/**
 * Blockquote semantic node.
 */
export interface BlockquoteSemanticNode extends BlockSemanticNode {
  type: NodeType.BLOCKQUOTE;
}

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

/**
 * Type guard for heading nodes.
 */
export function isHeadingNode(node: SemanticNode): node is HeadingSemanticNode {
  return node.type === NodeType.HEADING;
}

/**
 * Type guard for section nodes.
 */
export function isSectionNode(node: SemanticNode): node is SectionSemanticNode {
  return node.type === NodeType.SECTION;
}

/**
 * Type guard for block nodes.
 */
export function isBlockNode(node: SemanticNode): node is BlockSemanticNode {
  return node.type === NodeType.PARAGRAPH ||
         node.type === NodeType.CODE ||
         node.type === NodeType.LIST ||
         node.type === NodeType.TABLE ||
         node.type === NodeType.BLOCKQUOTE;
}
```

#### src/tree/word-counter.ts (Task 2)

```typescript
import { toString } from 'mdast-util-to-string';
import type { Node } from 'mdast';
import type { SemanticNode } from './types.js';

/**
 * Options for word counting.
 */
export interface WordCountOptions {
  /** Include code block content in word count. Default: false */
  countCode?: boolean;
}

/**
 * Extract plain text from an mdast node.
 *
 * @param node - The mdast node
 * @returns Plain text content
 */
export function extractText(node: Node): string {
  return toString(node, {
    includeImageAlt: true,
    includeHtml: true
  });
}

/**
 * Count words in an mdast node.
 *
 * @param node - The mdast node
 * @param options - Counting options
 * @returns Word count
 *
 * @example
 * ```typescript
 * const count = countWords(headingNode);  // Counts heading text
 * const countWithCode = countWords(codeNode, { countCode: true });  // Includes code
 * ```
 */
export function countWords(node: Node, options: WordCountOptions = {}): number {
  const { countCode = false } = options;

  // Skip code blocks unless explicitly included
  if (node.type === 'code' && !countCode) {
    return 0;
  }

  // For code blocks with countCode, count directly
  if (node.type === 'code' && countCode) {
    return (node as { value: string }).value
      .trim()
      .split(/\s+/)
      .filter(w => w.length > 0)
      .length;
  }

  // Extract text and count words
  const text = extractText(node);
  const words = text.trim().split(/\s+/);

  return words.filter(w => w.length > 0).length;
}

/**
 * Count words in a semantic node.
 *
 * @param node - The semantic node
 * @returns Word count (cached in node.wordCount)
 */
export function countSemanticWords(node: SemanticNode): number {
  return node.wordCount;
}
```

#### src/tree/selector-generator.ts (Task 3)

```typescript
import type { Node } from 'mdast';
import type { NodeType as SemanticNodeType } from './types.js';
import type { SemanticNode, HeadingSemanticNode, BlockSemanticNode } from './types.js';

/**
 * Convert mdast node type to selector block type.
 */
function mdastToBlockType(node: Node): string {
  switch (node.type) {
    case 'paragraph':
      return 'paragraph';
    case 'code':
      return 'code';
    case 'list':
      return 'list';
    case 'table':
      return 'table';
    case 'blockquote':
      return 'blockquote';
    default:
      return node.type;
  }
}

/**
 * Create a selector segment for a node.
 *
 * @param node - The mdast node
 * @param parent - Parent node
 * @param index - Ordinal index among siblings of same type
 * @param namespace - Document namespace
 * @returns Selector segment string
 */
export function createSelectorSegment(
  node: Node,
  parent: Node | null,
  index: number,
  namespace: string
): string {
  if (node.type === 'root') {
    return `${namespace}::root`;
  }

  if (node.type === 'heading') {
    const depth = (node as { depth: number }).depth;
    return `heading:h${depth}[${index}]`;
  }

  const blockType = mdastToBlockType(node);
  return `block:${blockType}[${index}]`;
}

/**
 * Get ordinal index of a node among siblings of the same type.
 *
 * @param node - The node to find index for
 * @param parent - Parent node
 * @returns 0-based ordinal index
 */
function getNodeOrdinal(node: Node, parent: Node | null): number {
  if (!parent || !('children' in parent)) {
    return 0;
  }

  const siblings = parent.children as Node[];
  const sameTypeSiblings = siblings.filter(s => s.type === node.type);

  return sameTypeSiblings.indexOf(node);
}

/**
 * Generate a full selector path for a node.
 *
 * @param node - The mdast node
 * @param ancestors - Array of ancestor nodes with their indices
 * @param namespace - Document namespace
 * @returns Full selector path
 *
 * @example
 * ```typescript
 * const selector = generateSelector(headingNode, ancestors, 'docs');
 * // Returns: "docs::heading:h2[1]"
 * ```
 */
export function generateSelector(
  node: Node,
  ancestors: Array<{ node: Node; index: number }>,
  namespace: string
): string {
  const parts: string[] = [];

  // Add all ancestor segments
  for (const { node: ancestor } of ancestors) {
    if (ancestor.type === 'root') continue;

    const parentIndex = ancestors.indexOf({ node: ancestor, index: 0 });
    const parent = parentIndex > 0 ? ancestors[parentIndex - 1].node : null;

    parts.push(createSelectorSegment(
      ancestor,
      parent,
      getNodeOrdinal(ancestor, parent),
      namespace
    ));
  }

  // Add current node segment
  const parent = ancestors.length > 0 ? ancestors[ancestors.length - 1].node : null;
  const currentIndex = getNodeOrdinal(node, parent);

  if (node.type !== 'root') {
    parts.push(createSelectorSegment(node, parent, currentIndex, namespace));
  }

  const path = parts.join('/');

  return parts.length === 0 ? `${namespace}::root` : `${namespace}::${path}`;
}
```

#### src/tree/section-virtualizer.ts (Task 4)

```typescript
import { visit } from 'unist-util-visit';
import type { Root, Heading } from 'mdast';
import type { HeadingSemanticNode, SectionSemanticNode, SemanticNode } from './types.js';
import { countWords } from './word-counter.js';
import { generateSelector } from './selector-generator.js';

/**
 * Section data during building.
 */
interface BuildingSection {
  heading: Heading;
  headingNode: HeadingSemanticNode;
  content: any[];
  children: BuildingSection[];
  depth: number;
  index: number;
  selector: string;
}

/**
 * Build sections from an mdast tree.
 *
 * @param tree - The mdast tree
 * @param namespace - Document namespace
 * @returns Array of top-level sections
 *
 * @example
 * ```typescript
 * const sections = buildSections(ast, 'docs');
 * console.log(sections[0].headingNode.text);  // "Introduction"
 * ```
 */
export function buildSections(
  tree: Root,
  namespace: string
): SectionSemanticNode[] {
  const sections: BuildingSection[] = [];
  const stack: BuildingSection[] = [];

  // Track heading counts by depth
  const headingCounts: Record<number, number> = {};

  // First pass: collect all headings and create section structure
  visit(tree, 'heading', (node: Heading, index, parent) => {
    const depth = node.depth;

    // Count this heading
    headingCounts[depth] = (headingCounts[depth] || 0) + 1;
    const headingIndex = headingCounts[depth] - 1;

    // Create heading semantic node
    const headingSelector = `${namespace}::heading:h${depth}[${headingIndex}]`;
    const text = node.children
      .filter((c): c is { type: 'text'; value: string } => c.type === 'text')
      .map(c => c.value)
      .join('');

    const headingNode: HeadingSemanticNode = {
      type: 'heading' as any,
      selector: headingSelector,
      parent: null,
      children: [],
      wordCount: countWords(node),
      originalNode: node,
      depth,
      text,
      index: headingIndex
    };

    // Find parent section
    while (stack.length > 0 && stack[stack.length - 1].depth >= depth) {
      stack.pop();
    }

    const section: BuildingSection = {
      heading: node,
      headingNode,
      content: [],
      children: [],
      depth,
      index: 0,
      selector: ''
    };

    if (stack.length > 0) {
      // Child section
      const parentSection = stack[stack.length - 1];
      section.index = parentSection.children.length;
      section.selector = `${parentSection.selector}/section[${section.index}]`;
      headingNode.parent = parentSection.headingNode;
      parentSection.children.push(section);
    } else {
      // Top-level section
      section.index = sections.length;
      section.selector = `${namespace}::section[${section.index}]`;
      sections.push(section);
    }

    headingNode.section = section as any;
    stack.push(section);
  });

  // Second pass: assign content to sections
  let currentSection: BuildingSection | null = null;

  visit(tree, (node, index, parent) => {
    if (node.type === 'heading') {
      // Find the section for this heading
      currentSection = findSectionForHeading(sections, node as Heading);
      return;
    }

    if (currentSection) {
      currentSection.content.push(node);
    }
  });

  // Convert to final section nodes
  return convertSections(sections, namespace);
}

/**
 * Find section by heading.
 */
function findSectionForHeading(
  sections: BuildingSection[],
  heading: Heading
): BuildingSection | null {
  for (const section of sections) {
    if (section.heading === heading) return section;

    const found = findSectionForHeading(section.children, heading);
    if (found) return found;
  }
  return null;
}

/**
 * Convert building sections to final section nodes.
 */
function convertSections(
  sections: BuildingSection[],
  namespace: string
): SectionSemanticNode[] {
  return sections.map(section => {
    const totalWordCount = section.headingNode.wordCount +
      section.content.reduce((sum, node) => sum + countWords(node), 0) +
      section.children.reduce((sum, child) => {
        const converted = convertSections([child], namespace)[0];
        return sum + converted.totalWordCount;
      }, 0);

    return {
      type: 'section' as any,
      selector: section.selector,
      parent: section.headingNode.parent,
      children: convertSections(section.children, namespace),
      wordCount: totalWordCount,
      originalNode: section.heading,
      heading: section.headingNode,
      content: section.content,
      children: convertSections(section.children, namespace),
      depth: section.depth,
      index: section.index,
      totalWordCount
    } as SectionSemanticNode;
  });
}
```

#### src/tree/builder.ts (Task 5)

```typescript
import { visit, visitParents } from 'unist-util-visit';
import type { Root } from 'mdast';
import type {
  SemanticTree,
  SemanticNode,
  RootSemanticNode,
  HeadingSemanticNode,
  SectionSemanticNode,
  BlockSemanticNode,
  NodeType
} from './types.js';
import { countWords } from './word-counter.js';
import { generateSelector } from './selector-generator.js';
import { buildSections } from './section-virtualizer.js';
import { isHeadingNode, isSectionNode, isBlockNode } from './types.js';

/**
 * Build a semantic tree from an mdast AST.
 *
 * @param ast - The mdast AST
 * @param namespace - Document namespace (typically filename without extension)
 * @returns Complete semantic tree
 *
 * @example
 * ```typescript
 * import { parseFile } from './parser/index.js';
 * import { buildSemanticTree } from './tree/index.js';
 *
 * const { ast } = await parseFile('./README.md');
 * const tree = buildSemanticTree(ast, 'readme');
 * console.log(tree.root.headings.map(h => h.text));
 * ```
 */
export function buildSemanticTree(ast: Root, namespace: string): SemanticTree {
  const nodeIndex = new Map<string, SemanticNode>();
  const headingIndex = new Map<string, HeadingSemanticNode>();
  const sectionIndex = new Map<string, SectionSemanticNode>();

  // Build root node
  const root: RootSemanticNode = {
    type: 'root' as NodeType,
    selector: `${namespace}::root`,
    parent: null,
    children: [],
    wordCount: 0,
    originalNode: ast,
    depth: 0,
    content: [],
    headings: []
  };

  nodeIndex.set(root.selector, root);

  // Track headings for root
  const rootContent: any[] = [];
  let foundFirstHeading = false;

  // Collect all nodes with selectors
  visitParents(ast, (node, ancestors) => {
    if (node.type === 'root') return;

    const selector = generateSelector(node, ancestors, namespace);
    const wordCount = countWords(node);

    if (node.type === 'heading') {
      foundFirstHeading = true;
      // Heading nodes will be created by section builder
    } else if (!foundFirstHeading) {
      rootContent.push(node);
    }
  });

  root.content = rootContent;
  root.wordCount = rootContent.reduce((sum, node) => sum + countWords(node), 0);

  // Build sections
  const sections = buildSections(ast, namespace);

  // Index all sections
  const indexSections = (secs: SectionSemanticNode[]) => {
    for (const section of secs) {
      sectionIndex.set(section.selector, section);
      nodeIndex.set(section.selector, section);
      headingIndex.set(section.heading.selector, section.heading);
      nodeIndex.set(section.heading.selector, section.heading);

      root.headings.push(section.heading);
      root.children.push(section);

      indexSections(section.children);
    }
  };

  indexSections(sections);

  // Build block nodes for section content
  const buildBlockNodes = (sections: SectionSemanticNode[]) => {
    for (const section of sections) {
      // Create block nodes for section content
      const blockCounts: Record<string, number> = {};

      for (const contentNode of section.content) {
        const type = contentNode.type;
        blockCounts[type] = (blockCounts[type] || 0) + 1;

        const blockSelector = `${section.selector}/block:${type}[${blockCounts[type] - 1}]`;
        const blockWordCount = countWords(contentNode);

        const blockNode: BlockSemanticNode = {
          type: type as any,
          selector: blockSelector,
          parent: section,
          children: [],
          wordCount: blockWordCount,
          originalNode: contentNode,
          index: blockCounts[type] - 1
        };

        nodeIndex.set(blockSelector, blockNode);
        section.content.push(blockNode);
        section.children.push(blockNode);
      }

      // Recursively process nested sections
      buildBlockNodes(section.children);
    }
  };

  buildBlockNodes(sections);

  return {
    namespace,
    root,
    nodeIndex,
    headingIndex,
    sectionIndex
  };
}
```

#### src/tree/index.ts (Task 6)

```typescript
// Public API for the tree module
export { buildSemanticTree } from './builder.js';
export { countWords, extractText, type WordCountOptions } from './word-counter.js';
export {
  generateSelector,
  createSelectorSegment
} from './selector-generator.js';
export { buildSections } from './section-virtualizer.js';

// Type exports
export {
  NodeType,
  type SemanticNode,
  type SemanticTree,
  type RootSemanticNode,
  type HeadingSemanticNode,
  type SectionSemanticNode,
  type BlockSemanticNode,
  type ParagraphSemanticNode,
  type CodeSemanticNode,
  type ListSemanticNode,
  type TableSemanticNode,
  type BlockquoteSemanticNode
} from './types.js';

// Type guards
export {
  isHeadingNode,
  isSectionNode,
  isBlockNode
} from './types.js';
```

### Integration Points

```yaml
DEPENDENCIES:
  - From: node:fs/promises
    Use: readFile, access for file operations (already in parser)

  - From: unified (existing)
    Use: Already installed for parser

  - From: unist-util-visit (existing)
    Use: visit() and visitParents() for tree traversal

  - NEW: mdast-util-to-string (must install)
    Install: npm install mdast-util-to-string
    Use: toString() for text extraction

  - From: mdast (existing)
    Use: Type imports for Root, Heading, etc.

PARSER_INTEGRATION:
  - The tree module consumes ParseResult from parser module
  - Import: { parseFile, type ParseResult } from '../parser/index.js'
  - Usage: const { ast } = await parseFile(filePath);
           const tree = buildSemanticTree(ast, namespace);

EXPORTS:
  - src/tree/index.ts exports all public API
  - Consumers import from 'src/tree/index.js'
```

---

## Validation Loop

### Level 1: Syntax & Style (Immediate Feedback)

```bash
# Install new dependency
npm install mdast-util-to-string

# After creating each file, run type check
npm run type-check

# Fix any TypeScript errors before proceeding
# Common issues:
# - Missing .js extension in imports
# - Wrong import type (import vs import type)
# - Missing type annotations

# Run linting
npm run lint

# Auto-fix lint issues
npm run lint:fix

# Check formatting
npm run format:check

# Auto-format if needed
npm run format

# Expected: All commands exit with code 0
```

### Level 2: Unit Tests (Component Validation)

```bash
# Run word counter tests first (simpler, fewer dependencies)
npm run test:run -- tests/tree/word-counter.test.ts -v

# Expected: All 7+ tests pass
# ✓ Counts words in paragraph correctly
# ✓ Counts words in heading (excluding # symbols)
# ✓ Skips code blocks by default
# ✓ Counts code blocks when countCode: true
# ✓ Handles empty content
# ✓ Handles inline formatting
# ✓ Handles lists and nested content

# Run selector generator tests
npm run test:run -- tests/tree/selector-generator.test.ts -v

# Expected: All 6+ tests pass
# ✓ Generates correct heading selector
# ✓ Generates correct block selector
# ✓ Generates correct path
# ✓ Handles root content selector
# ✓ Counts siblings correctly
# ✓ Handles multiple headings of same depth

# Run section virtualizer tests
npm run test:run -- tests/tree/section-virtualizer.test.ts -v

# Expected: All 5+ tests pass
# ✓ Creates section for each heading
# ✓ Groups content correctly
# ✓ Handles nested sections
# ✓ Calculates word counts
# ✓ Handles content before first heading

# Run builder integration tests
npm run test:run -- tests/tree/builder.test.ts -v

# Expected: All 8+ tests pass
# ✓ Returns SemanticTree with complete structure
# ✓ Root node contains pre-heading content
# ✓ All nodes have unique selectors
# ✓ Headings indexed correctly
# ✓ Sections have proper relationships
# ✓ Word counts accurate
# ✓ Node index complete
# ✓ Handles empty document

# Run all tree tests with coverage
npm run test:coverage -- --include='src/tree/**/*.ts'

# Expected: Coverage >= 85% for all files
```

### Level 3: Integration Testing (System Validation)

```bash
# Verify tree module can be imported from CLI context
node --input-type=module -e "
import { buildSemanticTree } from './src/tree/index.js';
import { parseMarkdown } from './src/parser/index.js';
console.log('Tree module loaded successfully');
const { ast } = parseMarkdown('# Test\\n\\nContent here.');
const tree = buildSemanticTree(ast, 'test');
console.log('Tree built:', tree.root.headings.length, 'headings');
"

# Expected output:
# Tree module loaded successfully
# Tree built: 1 headings

# Test with fixture file
node --input-type=module -e "
import { buildSemanticTree } from './src/tree/index.js';
import { parseFile } from './src/parser/index.js';
const { ast } = await parseFile('./tests/fixtures/simple.md');
const tree = buildSemanticTree(ast, 'simple');
console.log('Namespace:', tree.namespace);
console.log('Headings:', tree.root.headings.map(h => ({ text: h.text, selector: h.selector })));
console.log('Total nodes:', tree.nodeIndex.size);
"

# Expected: Shows namespace, heading list, total node count
```

### Level 4: Full Test Suite Validation

```bash
# Run complete test suite including tree builder
npm run test:run

# Expected: All tests pass (parser + tree tests)

# Run with coverage report
npm run test:coverage

# Expected:
# - All tests pass
# - src/tree coverage >= 85%
# - No uncovered error branches

# Build the project to verify no build errors
npm run build

# Verify build output
ls -la dist/

# Expected: dist/ contains compiled JS files
```

---

## Final Validation Checklist

### Technical Validation

- [ ] All 4 validation levels completed successfully
- [ ] `npm run test:run` passes all tree builder tests
- [ ] `npm run type-check` reports zero TypeScript errors
- [ ] `npm run lint` reports zero ESLint errors
- [ ] `npm run format:check` reports zero formatting issues
- [ ] Coverage >= 85% for `src/tree/**/*.ts`
- [ ] `mdast-util-to-string` dependency installed

### Feature Validation

- [ ] `buildSemanticTree(ast, namespace)` returns SemanticTree with complete hierarchy
- [ ] All nodes have unique selectors matching format `namespace::type[index]`
- [ ] Headings have correct ordinal indices (0-based, per depth level)
- [ ] Sections group content correctly (heading + descendants until next equal/higher heading)
- [ ] Word counts accurate for paragraphs, headings, lists, tables, blockquotes
- [ ] Code blocks excluded from word count by default
- [ ] Root content (before first heading) handled correctly
- [ ] Nested sections have proper parent-child relationships
- [ ] Node index contains all nodes by selector
- [ ] Empty document returns tree with empty root

### Code Quality Validation

- [ ] All files use `.js` extension in imports
- [ ] All mdast types use `import type`
- [ ] Follows existing code patterns from parser module
- [ ] JSDoc comments on all public functions
- [ ] Type guards implemented for discriminated union
- [ ] Parent references handled for circular JSON (if implementing serialization)

### Files Created Checklist

- [ ] `/src/tree/types.ts` - Type definitions
- [ ] `/src/tree/word-counter.ts` - Word counting utility
- [ ] `/src/tree/selector-generator.ts` - Selector generation
- [ ] `/src/tree/section-virtualizer.ts` - Section building
- [ ] `/src/tree/builder.ts` - Main builder function
- [ ] `/src/tree/index.ts` - Public exports
- [ ] `/tests/tree/word-counter.test.ts`
- [ ] `/tests/tree/selector-generator.test.ts`
- [ ] `/tests/tree/section-virtualizer.test.ts`
- [ ] `/tests/tree/builder.test.ts`

---

## Anti-Patterns to Avoid

- Do not use `require()` - this is an ESM project
- Do not omit `.js` extensions in import paths
- Do not use 1-based indexing - selectors use 0-based ordinals
- Do not skip type guards - use discriminated unions properly
- Do not count all siblings for index - count siblings of same type only
- Do not forget to install `mdast-util-to-string` - required for text extraction
- Do not use sync tree traversal when visitParents provides ancestor chain
- Do not create circular JSON without custom serialization for parent references
- Do not hardcode namespace - derive from file path using path.basename()
- Do not mutate original mdast tree - create new semantic node structure

---

## Confidence Score

**Implementation Success Likelihood: 9/10**

**Rationale:**
- Comprehensive research documentation with specific algorithms and patterns
- Complete code examples provided for all files
- Clear task dependencies and validation commands
- All external dependencies documented with URLs
- Research from 5 specialized agents covering all aspects
- Follows established patterns from P1M1/P1M2 codebase
- No ambiguous implementation decisions
- Deterministic validation with expected outputs

**Risk Factors:**
- Minor: Section virtualization algorithm complexity (mitigated with detailed pseudo-code)
- Minor: Type safety with discriminated unions (mitigated with type guard examples)
- Minor: Parent reference circularity (mitigated with serialization guidance)

---

## Execution Notes

1. **Install dependency first**: `npm install mdast-util-to-string`
2. **Create files in order**: types.ts → word-counter.ts → selector-generator.ts → section-virtualizer.ts → builder.ts → index.ts → tests
3. **Validate after each file**: Run `npm run type-check` after each file creation
4. **Test incrementally**: Run tests for each component before moving to next
5. **Use exact imports**: Copy import statements exactly as shown
6. **Check coverage last**: Only after all tests pass, verify coverage thresholds
7. **ESM everywhere**: All imports use `.js` extension, all files are ESM
