# PRP: P1M2 - Markdown Parser Integration

**Phase 1, Milestone 2 - Markdown Parser Module for mdsel CLI**

---

## Goal

**Feature Goal**: Implement a robust Markdown parsing module that converts Markdown files into mdast (Markdown Abstract Syntax Tree) format, providing the foundational layer for semantic tree construction and selector-based content extraction.

**Deliverable**: A `src/parser/` module containing:
- Type definitions for parser configuration and mdast extensions
- A unified processor factory configured with remark-parse and remark-gfm
- `parseMarkdown(content: string)` - Parse markdown string to AST
- `parseFile(filePath: string)` - Read and parse markdown file
- Comprehensive test suite with fixtures covering standard markdown and GFM features

**Success Definition**: Running `npm run test` passes all parser tests with 85%+ coverage, and the parser correctly handles:
- Standard CommonMark markdown (headings, paragraphs, lists, code blocks, blockquotes)
- GFM extensions (tables, strikethrough, task lists)
- Position information preservation (line, column, offset)
- Error handling for invalid files and malformed markdown

---

## Why

- **Core Foundation**: The parser is the entry point of the entire data flow; all downstream components (semantic tree, selectors, output) depend on accurate AST generation
- **Deterministic Parsing**: Uses CommonMark-compliant remark-parse for reproducible, deterministic selector generation
- **GFM Support**: Enables tables and other GitHub Flavored Markdown features required by the PRD
- **Type Safety**: TypeScript interfaces ensure type-safe AST manipulation throughout the codebase
- **Testability**: Isolated parser module enables comprehensive unit testing before integration

---

## What

Create the Markdown parser infrastructure:

1. **Type Definitions** - mdast type extensions and parser options
2. **Processor Factory** - Configurable unified processor with plugins
3. **parseMarkdown Function** - String → AST conversion
4. **parseFile Function** - File path → AST conversion with error handling
5. **Test Fixtures** - Sample markdown files for testing
6. **Test Suite** - Unit tests for all parser functionality

### Success Criteria

- [ ] `parseMarkdown()` returns valid mdast Root node for markdown string
- [ ] `parseFile()` reads file and returns mdast Root node
- [ ] Parser handles empty files gracefully (returns empty Root node)
- [ ] Parser handles malformed/missing files with proper errors
- [ ] All mdast nodes have position information (line, column, offset)
- [ ] GFM tables parse correctly with alignment information
- [ ] GFM strikethrough and task lists parse correctly
- [ ] Test coverage >= 85% for parser module
- [ ] All ESLint and TypeScript checks pass

---

## All Needed Context

### Context Completeness Check

_"If someone knew nothing about this codebase, would they have everything needed to implement this successfully?"_ - **YES**, this PRP contains complete type definitions, code patterns, and validation commands.

### Documentation & References

```yaml
# MUST READ - Core Research (Already in codebase)
- file: plan/P1M1/research/remark-setup.md
  why: Comprehensive remark/unified/mdast documentation with TypeScript patterns
  pattern: Processor creation, tree traversal, GFM configuration, type imports
  gotcha: Use type-only imports for mdast types to avoid bundle bloat

- file: plan/architecture/external_deps.md
  why: Verified dependency versions and mdast node type reference
  pattern: unified ^11, remark-parse ^11, remark-gfm ^4, unist-util-visit ^5
  gotcha: All packages are ESM-only, require Node.js 18+

- file: plan/architecture/system_context.md
  why: Node type mapping between PRD and mdast
  pattern: heading (depth 1-6), paragraph, code, list, table, blockquote
  gotcha: "section" is a virtual node we create, not a native mdast type

# Official Documentation URLs
- url: https://github.com/syntax-tree/mdast#nodes
  why: Complete mdast node type specification
  critical: All node types have position property with start/end {line, column, offset}

- url: https://github.com/remarkjs/remark-gfm#readme
  why: GFM plugin configuration and extended node types
  critical: Adds Table, TableRow, TableCell, Delete (strikethrough), TaskListItem

- url: https://unifiedjs.com/learn/recipe/tree-traversal-typescript/
  why: TypeScript patterns for mdast traversal
  critical: Use type narrowing with node.type checks for type-safe access

- url: https://github.com/syntax-tree/mdast-util-to-string
  why: Text extraction from nodes (useful for testing)
  critical: Handles nested children, returns plain text content
```

### Current Codebase Tree

```bash
/home/dustin/projects/mdsel/
├── package.json                     # Dependencies already installed (unified, remark-parse, remark-gfm)
├── tsconfig.json                    # TypeScript config (strict, ESM, NodeNext)
├── vitest.config.ts                 # Test config (globals, v8 coverage)
├── eslint.config.js                 # Linting (strictTypeChecked)
├── src/
│   ├── cli/
│   │   └── index.ts                 # CLI entry (placeholder index/select commands)
│   ├── parser/                      # EMPTY - To be implemented in this milestone
│   ├── tree/                        # Future: Semantic tree builder (P1.M3)
│   ├── selector/                    # Future: Selector engine (P2)
│   └── output/                      # Future: Output formatters (P3)
├── tests/
│   ├── setup.ts                     # Test setup (currently empty)
│   └── placeholder.test.ts          # Placeholder test (2 passing)
└── dist/                            # Build output
```

### Desired Codebase Tree After P1M2 Completion

```bash
/home/dustin/projects/mdsel/
├── src/
│   ├── cli/
│   │   └── index.ts                 # Unchanged
│   ├── parser/
│   │   ├── index.ts                 # Public API exports
│   │   ├── types.ts                 # Type definitions (ParserOptions, ParseResult)
│   │   ├── processor.ts             # Unified processor factory
│   │   └── parse.ts                 # parseMarkdown, parseFile functions
│   ├── tree/                        # Empty (future)
│   ├── selector/                    # Empty (future)
│   └── output/                      # Empty (future)
├── tests/
│   ├── setup.ts                     # Test setup
│   ├── placeholder.test.ts          # Existing placeholder
│   ├── fixtures/                    # Markdown test fixtures
│   │   ├── simple.md                # Basic headings and paragraphs
│   │   ├── gfm-table.md             # GFM table examples
│   │   ├── gfm-features.md          # Strikethrough, task lists
│   │   ├── code-blocks.md           # Fenced code with languages
│   │   ├── nested-lists.md          # Deeply nested lists
│   │   ├── empty.md                 # Empty file
│   │   └── complex.md               # All features combined
│   └── parser/
│       ├── processor.test.ts        # Processor factory tests
│       └── parse.test.ts            # parseMarkdown/parseFile tests
└── ...
```

### Known Gotchas & Library Quirks

```typescript
// CRITICAL: ESM imports MUST use .js extension in source files
import { createProcessor } from './processor.js';     // CORRECT
import { createProcessor } from './processor';        // WRONG - runtime error

// CRITICAL: Use type-only imports for mdast types
import type { Root, Heading, Paragraph } from 'mdast';  // CORRECT - no runtime cost
import { Root, Heading, Paragraph } from 'mdast';       // WORKS but bloats bundle

// CRITICAL: unified processor is synchronous for .parse(), async for .process()
const ast = processor.parse(markdown);       // Synchronous, returns AST
await processor.process(markdown);           // Async, runs all plugins

// CRITICAL: remark-gfm MUST be added with .use() for tables to parse
const processor = unified()
  .use(remarkParse)
  .use(remarkGfm);      // Without this, tables are paragraphs!

// CRITICAL: Position information is on every node
interface Position {
  start: Point;  // { line: 1, column: 1, offset: 0 }
  end: Point;    // { line: 1, column: 10, offset: 9 }
}
// line and column are 1-indexed, offset is 0-indexed

// CRITICAL: fs.readFile returns Buffer, must convert to string
const content = await fs.readFile(path, 'utf-8');  // Pass encoding!

// CRITICAL: Error handling - file not found should throw specific error
try {
  await fs.access(filePath);  // Check existence first
} catch {
  throw new ParserError('FILE_NOT_FOUND', `File not found: ${filePath}`);
}

// GOTCHA: processor.parse() returns unist Root, cast to mdast Root
const ast = processor.parse(content) as Root;  // Type assertion required

// GOTCHA: Empty markdown returns Root with empty children array
const emptyAst = processor.parse('');
// Returns: { type: 'root', children: [], position: {...} }
```

---

## Implementation Blueprint

### Data Models and Structure

```typescript
// src/parser/types.ts

import type { Root, Content, Position, Point } from 'mdast';

/**
 * Parser configuration options
 */
export interface ParserOptions {
  /** Enable GFM extensions (tables, strikethrough, task lists). Default: true */
  gfm?: boolean;
}

/**
 * Result of parsing a markdown file
 */
export interface ParseResult {
  /** The parsed mdast AST */
  ast: Root;
  /** Source file path (undefined for string parsing) */
  filePath?: string;
}

/**
 * Custom error for parser failures
 */
export class ParserError extends Error {
  constructor(
    public readonly code: ParserErrorCode,
    message: string,
    public readonly filePath?: string,
  ) {
    super(message);
    this.name = 'ParserError';
  }
}

export type ParserErrorCode =
  | 'FILE_NOT_FOUND'
  | 'FILE_READ_ERROR'
  | 'PARSE_ERROR';

// Re-export commonly used mdast types for convenience
export type { Root, Content, Position, Point };
export type { Heading, Paragraph, Code, List, ListItem } from 'mdast';
export type { Blockquote, Table, TableRow, TableCell } from 'mdast';
```

### Implementation Tasks (Ordered by Dependencies)

```yaml
Task 1: CREATE src/parser/types.ts
  - IMPLEMENT: ParserOptions, ParseResult, ParserError, type re-exports
  - FOLLOW pattern: TypeScript interfaces with JSDoc comments
  - NAMING: PascalCase for types/classes, camelCase for properties
  - IMPORTS: Use `import type` for all mdast types
  - PLACEMENT: /src/parser/types.ts
  - VALIDATION: npx tsc --noEmit passes

Task 2: CREATE src/parser/processor.ts
  - IMPLEMENT: createProcessor(options?: ParserOptions) factory function
  - FOLLOW pattern: plan/P1M1/research/remark-setup.md Section 4
  - PATTERN:
    - Import unified, remarkParse, remarkGfm
    - Return configured processor instance
    - Conditionally add remarkGfm based on options.gfm (default: true)
  - NAMING: createProcessor function, Processor type alias
  - DEPENDENCIES: Task 1 (imports ParserOptions)
  - PLACEMENT: /src/parser/processor.ts
  - VALIDATION: Import and call createProcessor() without errors

Task 3: CREATE src/parser/parse.ts
  - IMPLEMENT: parseMarkdown(content, options?), parseFile(filePath, options?)
  - FOLLOW pattern: plan/P1M1/research/remark-setup.md Section 4
  - PATTERN:
    - parseMarkdown: Create processor, call .parse(), return { ast }
    - parseFile: Read file with fs/promises, call parseMarkdown, add filePath to result
    - Error handling: Wrap fs errors in ParserError with appropriate codes
  - NAMING: parseMarkdown, parseFile functions
  - DEPENDENCIES: Task 1 (ParserError, ParseResult), Task 2 (createProcessor)
  - PLACEMENT: /src/parser/parse.ts
  - VALIDATION: Unit tests pass for both functions

Task 4: CREATE src/parser/index.ts
  - IMPLEMENT: Public API exports
  - EXPORTS:
    - { parseMarkdown, parseFile } from './parse.js'
    - { createProcessor } from './processor.js'
    - { ParserError, ParserOptions, ParseResult, ParserErrorCode } from './types.js'
    - Re-export mdast types for convenience
  - NAMING: Barrel file pattern
  - DEPENDENCIES: Tasks 1, 2, 3
  - PLACEMENT: /src/parser/index.ts
  - VALIDATION: Can import from 'src/parser/index.js' in test files

Task 5: CREATE tests/fixtures/ directory and markdown files
  - IMPLEMENT: Test fixtures for various markdown scenarios
  - FILES:
    - simple.md: # Title\n\nParagraph with **bold** and *italic*.\n\n## Section\n\nMore text.
    - gfm-table.md: Table with alignment | left | center | right |
    - gfm-features.md: ~~strikethrough~~, - [x] task, - [ ] task
    - code-blocks.md: ```js\nconst x = 1;\n``` with multiple languages
    - nested-lists.md: - Item\n  - Nested\n    - Deep nested
    - empty.md: (empty file)
    - complex.md: All features combined in realistic document
  - PLACEMENT: /tests/fixtures/*.md
  - VALIDATION: All files readable, non-empty (except empty.md)

Task 6: CREATE tests/parser/processor.test.ts
  - IMPLEMENT: Unit tests for processor factory
  - TEST CASES:
    - createProcessor() returns a processor with .parse() method
    - createProcessor({ gfm: true }) parses tables correctly
    - createProcessor({ gfm: false }) does NOT parse tables as Table nodes
    - Processor is deterministic (same input → same output)
  - FOLLOW pattern: tests/placeholder.test.ts (globals, describe/it)
  - COVERAGE: All branches of createProcessor
  - PLACEMENT: /tests/parser/processor.test.ts
  - VALIDATION: npm run test -- tests/parser/processor.test.ts passes

Task 7: CREATE tests/parser/parse.test.ts
  - IMPLEMENT: Unit tests for parseMarkdown and parseFile
  - TEST CASES for parseMarkdown:
    - Parses simple heading to Heading node with depth
    - Parses paragraph with inline formatting
    - Parses code block with language info
    - Parses list (ordered and unordered)
    - Parses blockquote
    - Parses GFM table with alignment
    - Returns empty children for empty string
    - All nodes have position information
  - TEST CASES for parseFile:
    - Reads and parses fixture file
    - Returns filePath in result
    - Throws ParserError with FILE_NOT_FOUND for missing file
    - Handles empty file correctly
  - FOLLOW pattern: tests/placeholder.test.ts
  - USE fixtures: Read from tests/fixtures/*.md
  - COVERAGE: All error paths and happy paths
  - PLACEMENT: /tests/parser/parse.test.ts
  - VALIDATION: npm run test -- tests/parser/parse.test.ts passes
```

### Implementation Patterns & Key Details

#### src/parser/types.ts (Task 1)

```typescript
import type {
  Root,
  Content,
  Position,
  Point,
  Heading,
  Paragraph,
  Code,
  List,
  ListItem,
  Blockquote,
  Table,
  TableRow,
  TableCell,
  Text,
  ThematicBreak,
} from 'mdast';

/**
 * Configuration options for the Markdown parser.
 */
export interface ParserOptions {
  /**
   * Enable GitHub Flavored Markdown extensions.
   * Includes: tables, strikethrough, task lists, autolinks.
   * @default true
   */
  gfm?: boolean;
}

/**
 * Result of parsing a Markdown document.
 */
export interface ParseResult {
  /** The parsed mdast Abstract Syntax Tree */
  ast: Root;
  /** Source file path (only present when using parseFile) */
  filePath?: string;
}

/**
 * Error codes for parser failures.
 */
export type ParserErrorCode = 'FILE_NOT_FOUND' | 'FILE_READ_ERROR' | 'PARSE_ERROR';

/**
 * Custom error class for parser-related failures.
 */
export class ParserError extends Error {
  public readonly code: ParserErrorCode;
  public readonly filePath?: string;

  constructor(code: ParserErrorCode, message: string, filePath?: string) {
    super(message);
    this.name = 'ParserError';
    this.code = code;
    this.filePath = filePath;
    // Maintains proper stack trace in V8 environments
    Error.captureStackTrace?.(this, ParserError);
  }
}

// Re-export commonly used mdast types for convenience
export type {
  Root,
  Content,
  Position,
  Point,
  Heading,
  Paragraph,
  Code,
  List,
  ListItem,
  Blockquote,
  Table,
  TableRow,
  TableCell,
  Text,
  ThematicBreak,
};
```

#### src/parser/processor.ts (Task 2)

```typescript
import { unified, type Processor } from 'unified';
import remarkParse from 'remark-parse';
import remarkGfm from 'remark-gfm';
import type { Root } from 'mdast';
import type { ParserOptions } from './types.js';

/**
 * Type alias for the configured remark processor.
 */
export type MarkdownProcessor = Processor<Root, undefined, undefined, Root, string>;

/**
 * Creates a configured unified processor for parsing Markdown.
 *
 * @param options - Parser configuration options
 * @returns A unified processor configured for Markdown parsing
 *
 * @example
 * ```typescript
 * const processor = createProcessor();
 * const ast = processor.parse('# Hello');
 * ```
 */
export function createProcessor(options: ParserOptions = {}): MarkdownProcessor {
  const { gfm = true } = options;

  let processor = unified().use(remarkParse);

  if (gfm) {
    processor = processor.use(remarkGfm);
  }

  return processor as unknown as MarkdownProcessor;
}
```

#### src/parser/parse.ts (Task 3)

```typescript
import { readFile, access } from 'node:fs/promises';
import { createProcessor } from './processor.js';
import { ParserError, type ParserOptions, type ParseResult, type Root } from './types.js';

/**
 * Parses a Markdown string into an mdast Abstract Syntax Tree.
 *
 * @param content - The Markdown content to parse
 * @param options - Parser configuration options
 * @returns The parsed AST wrapped in a ParseResult
 *
 * @example
 * ```typescript
 * const result = parseMarkdown('# Hello\n\nWorld');
 * console.log(result.ast.children[0].type); // 'heading'
 * ```
 */
export function parseMarkdown(content: string, options?: ParserOptions): ParseResult {
  const processor = createProcessor(options);
  const ast = processor.parse(content) as Root;

  return { ast };
}

/**
 * Reads a Markdown file and parses it into an mdast Abstract Syntax Tree.
 *
 * @param filePath - Path to the Markdown file
 * @param options - Parser configuration options
 * @returns The parsed AST wrapped in a ParseResult, including the file path
 * @throws {ParserError} When the file cannot be read or parsed
 *
 * @example
 * ```typescript
 * const result = await parseFile('./README.md');
 * console.log(result.filePath); // './README.md'
 * console.log(result.ast.type); // 'root'
 * ```
 */
export async function parseFile(filePath: string, options?: ParserOptions): Promise<ParseResult> {
  // Check file exists first for better error messages
  try {
    await access(filePath);
  } catch {
    throw new ParserError('FILE_NOT_FOUND', `File not found: ${filePath}`, filePath);
  }

  // Read file content
  let content: string;
  try {
    content = await readFile(filePath, 'utf-8');
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown read error';
    throw new ParserError('FILE_READ_ERROR', `Failed to read file: ${message}`, filePath);
  }

  // Parse the content
  const result = parseMarkdown(content, options);

  return {
    ...result,
    filePath,
  };
}
```

#### src/parser/index.ts (Task 4)

```typescript
// Public API for the parser module
export { parseMarkdown, parseFile } from './parse.js';
export { createProcessor, type MarkdownProcessor } from './processor.js';
export {
  ParserError,
  type ParserOptions,
  type ParseResult,
  type ParserErrorCode,
  // Re-exported mdast types
  type Root,
  type Content,
  type Position,
  type Point,
  type Heading,
  type Paragraph,
  type Code,
  type List,
  type ListItem,
  type Blockquote,
  type Table,
  type TableRow,
  type TableCell,
  type Text,
  type ThematicBreak,
} from './types.js';
```

#### tests/fixtures/simple.md (Task 5)

```markdown
# Main Title

This is a paragraph with **bold** and *italic* text.

## First Section

Some content under the first section.

### Subsection

Nested content here.

## Second Section

Final section content.
```

#### tests/fixtures/gfm-table.md (Task 5)

```markdown
# Table Example

| Name    | Age | City     |
|:--------|:---:|---------:|
| Alice   | 30  | New York |
| Bob     | 25  | London   |
| Charlie | 35  | Tokyo    |
```

#### tests/fixtures/gfm-features.md (Task 5)

```markdown
# GFM Features

## Strikethrough

This is ~~deleted~~ text.

## Task Lists

- [x] Completed task
- [ ] Incomplete task
- [x] Another done task

## Autolinks

Visit https://example.com for more info.
```

#### tests/fixtures/code-blocks.md (Task 5)

```markdown
# Code Examples

## JavaScript

```js
const greeting = 'Hello, World!';
console.log(greeting);
```

## TypeScript

```typescript
interface User {
  name: string;
  age: number;
}
```

## Inline Code

Use the `npm install` command.
```

#### tests/fixtures/nested-lists.md (Task 5)

```markdown
# Nested Lists

## Unordered

- Level 1 Item A
  - Level 2 Item A1
    - Level 3 Item A1a
    - Level 3 Item A1b
  - Level 2 Item A2
- Level 1 Item B

## Ordered

1. First item
   1. Sub-item one
   2. Sub-item two
2. Second item
```

#### tests/fixtures/empty.md (Task 5)

(Empty file - 0 bytes)

#### tests/fixtures/complex.md (Task 5)

```markdown
# Complete Document

This is a comprehensive test document with all features.

## Introduction

A paragraph with **bold**, *italic*, and `inline code`.

> This is a blockquote with multiple lines.
> It continues here.

## Data Table

| Feature       | Status    | Notes           |
|---------------|:---------:|-----------------|
| Headings      | Supported | All levels 1-6  |
| Tables        | Supported | GFM extension   |
| ~~Removed~~   | N/A       | Strikethrough   |

## Code Example

```python
def hello(name: str) -> str:
    return f"Hello, {name}!"
```

## Task List

- [x] Create parser module
- [x] Add test fixtures
- [ ] Write documentation

### Nested Content

1. First item
   - Bullet under number
   - Another bullet
2. Second item
   1. Nested number
   2. Another nested

---

## Conclusion

Final paragraph here.
```

#### tests/parser/processor.test.ts (Task 6)

```typescript
import { createProcessor } from '../../src/parser/processor.js';
import type { Root, Table, Paragraph } from 'mdast';

describe('createProcessor', () => {
  it('should return a processor with parse method', () => {
    const processor = createProcessor();
    expect(typeof processor.parse).toBe('function');
  });

  it('should parse markdown to Root node', () => {
    const processor = createProcessor();
    const ast = processor.parse('# Hello') as Root;

    expect(ast.type).toBe('root');
    expect(ast.children).toBeDefined();
    expect(ast.children.length).toBeGreaterThan(0);
  });

  it('should parse GFM tables when gfm option is true (default)', () => {
    const processor = createProcessor({ gfm: true });
    const markdown = '| A | B |\n|---|---|\n| 1 | 2 |';
    const ast = processor.parse(markdown) as Root;

    const table = ast.children[0] as Table;
    expect(table.type).toBe('table');
    expect(table.children.length).toBe(2); // header row + data row
  });

  it('should NOT parse tables when gfm option is false', () => {
    const processor = createProcessor({ gfm: false });
    const markdown = '| A | B |\n|---|---|\n| 1 | 2 |';
    const ast = processor.parse(markdown) as Root;

    // Without GFM, tables parse as paragraphs
    const firstChild = ast.children[0] as Paragraph;
    expect(firstChild.type).toBe('paragraph');
  });

  it('should be deterministic (same input produces same output)', () => {
    const processor = createProcessor();
    const markdown = '# Title\n\nParagraph.';

    const ast1 = processor.parse(markdown);
    const ast2 = processor.parse(markdown);

    expect(JSON.stringify(ast1)).toBe(JSON.stringify(ast2));
  });

  it('should include position information on nodes', () => {
    const processor = createProcessor();
    const ast = processor.parse('# Hello') as Root;

    const heading = ast.children[0];
    expect(heading?.position).toBeDefined();
    expect(heading?.position?.start).toEqual({ line: 1, column: 1, offset: 0 });
  });
});
```

#### tests/parser/parse.test.ts (Task 7)

```typescript
import { join } from 'node:path';
import { parseMarkdown, parseFile, ParserError } from '../../src/parser/index.js';
import type { Heading, Paragraph, Code, List, Blockquote, Table } from 'mdast';

const FIXTURES_DIR = join(import.meta.dirname, '../fixtures');

describe('parseMarkdown', () => {
  it('should parse heading with correct depth', () => {
    const result = parseMarkdown('# Title');
    const heading = result.ast.children[0] as Heading;

    expect(heading.type).toBe('heading');
    expect(heading.depth).toBe(1);
  });

  it('should parse all heading levels', () => {
    const markdown = '# H1\n## H2\n### H3\n#### H4\n##### H5\n###### H6';
    const result = parseMarkdown(markdown);

    const headings = result.ast.children.filter((n): n is Heading => n.type === 'heading');
    expect(headings.map((h) => h.depth)).toEqual([1, 2, 3, 4, 5, 6]);
  });

  it('should parse paragraph with inline content', () => {
    const result = parseMarkdown('Hello **world** with *emphasis*.');
    const paragraph = result.ast.children[0] as Paragraph;

    expect(paragraph.type).toBe('paragraph');
    expect(paragraph.children.length).toBeGreaterThan(0);
  });

  it('should parse fenced code block with language', () => {
    const result = parseMarkdown('```javascript\nconst x = 1;\n```');
    const code = result.ast.children[0] as Code;

    expect(code.type).toBe('code');
    expect(code.lang).toBe('javascript');
    expect(code.value).toBe('const x = 1;');
  });

  it('should parse unordered list', () => {
    const result = parseMarkdown('- Item 1\n- Item 2\n- Item 3');
    const list = result.ast.children[0] as List;

    expect(list.type).toBe('list');
    expect(list.ordered).toBe(false);
    expect(list.children.length).toBe(3);
  });

  it('should parse ordered list', () => {
    const result = parseMarkdown('1. First\n2. Second');
    const list = result.ast.children[0] as List;

    expect(list.type).toBe('list');
    expect(list.ordered).toBe(true);
  });

  it('should parse blockquote', () => {
    const result = parseMarkdown('> Quote text');
    const blockquote = result.ast.children[0] as Blockquote;

    expect(blockquote.type).toBe('blockquote');
    expect(blockquote.children.length).toBeGreaterThan(0);
  });

  it('should parse GFM table with alignment', () => {
    const markdown = '| Left | Center | Right |\n|:-----|:------:|------:|\n| A | B | C |';
    const result = parseMarkdown(markdown);
    const table = result.ast.children[0] as Table;

    expect(table.type).toBe('table');
    expect(table.align).toEqual(['left', 'center', 'right']);
  });

  it('should return empty children for empty string', () => {
    const result = parseMarkdown('');

    expect(result.ast.type).toBe('root');
    expect(result.ast.children).toEqual([]);
  });

  it('should include position information on all nodes', () => {
    const result = parseMarkdown('# Hello\n\nWorld');

    for (const child of result.ast.children) {
      expect(child.position).toBeDefined();
      expect(child.position?.start.line).toBeGreaterThan(0);
      expect(child.position?.start.column).toBeGreaterThan(0);
      expect(child.position?.start.offset).toBeGreaterThanOrEqual(0);
    }
  });

  it('should not include filePath for string parsing', () => {
    const result = parseMarkdown('# Test');
    expect(result.filePath).toBeUndefined();
  });
});

describe('parseFile', () => {
  it('should read and parse a markdown file', async () => {
    const result = await parseFile(join(FIXTURES_DIR, 'simple.md'));

    expect(result.ast.type).toBe('root');
    expect(result.ast.children.length).toBeGreaterThan(0);
  });

  it('should include filePath in result', async () => {
    const filePath = join(FIXTURES_DIR, 'simple.md');
    const result = await parseFile(filePath);

    expect(result.filePath).toBe(filePath);
  });

  it('should throw ParserError with FILE_NOT_FOUND for missing file', async () => {
    const nonexistentPath = join(FIXTURES_DIR, 'does-not-exist.md');

    await expect(parseFile(nonexistentPath)).rejects.toThrow(ParserError);

    try {
      await parseFile(nonexistentPath);
    } catch (error) {
      expect(error).toBeInstanceOf(ParserError);
      expect((error as ParserError).code).toBe('FILE_NOT_FOUND');
      expect((error as ParserError).filePath).toBe(nonexistentPath);
    }
  });

  it('should handle empty file correctly', async () => {
    const result = await parseFile(join(FIXTURES_DIR, 'empty.md'));

    expect(result.ast.type).toBe('root');
    expect(result.ast.children).toEqual([]);
  });

  it('should parse GFM tables from file', async () => {
    const result = await parseFile(join(FIXTURES_DIR, 'gfm-table.md'));
    const table = result.ast.children.find((n) => n.type === 'table') as Table | undefined;

    expect(table).toBeDefined();
    expect(table?.children.length).toBeGreaterThan(0);
  });

  it('should parse all features in complex file', async () => {
    const result = await parseFile(join(FIXTURES_DIR, 'complex.md'));

    const types = new Set(result.ast.children.map((n) => n.type));

    expect(types.has('heading')).toBe(true);
    expect(types.has('paragraph')).toBe(true);
    expect(types.has('table')).toBe(true);
    expect(types.has('code')).toBe(true);
    expect(types.has('list')).toBe(true);
    expect(types.has('blockquote')).toBe(true);
  });
});
```

### Integration Points

```yaml
IMPORTS:
  - From: node:fs/promises
    Use: readFile, access for file operations
  - From: unified
    Use: unified function for processor creation
  - From: remark-parse
    Use: Default export as remarkParse plugin
  - From: remark-gfm
    Use: Default export as remarkGfm plugin
  - From: mdast
    Use: Type imports for Root, Heading, Paragraph, etc.

CLI_INTEGRATION:
  - The parser module is NOT integrated with CLI in this milestone
  - CLI integration happens in later milestone
  - Parser module is standalone and tested independently

EXPORTS:
  - src/parser/index.ts exports all public API
  - Consumers import from './parser/index.js'
```

---

## Validation Loop

### Level 1: Syntax & Style (Immediate Feedback)

```bash
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
# Run processor tests first (simpler, fewer dependencies)
npm run test:run -- tests/parser/processor.test.ts -v

# Expected: All 5+ tests pass
# ✓ should return a processor with parse method
# ✓ should parse markdown to Root node
# ✓ should parse GFM tables when gfm option is true
# ✓ should NOT parse tables when gfm option is false
# ✓ should be deterministic

# Run parse tests (includes file I/O)
npm run test:run -- tests/parser/parse.test.ts -v

# Expected: All 15+ tests pass
# ✓ parseMarkdown tests (headings, paragraphs, code, lists, etc.)
# ✓ parseFile tests (file reading, error handling)

# Run all parser tests with coverage
npm run test:coverage -- --include='src/parser/**/*.ts'

# Expected: Coverage >= 85% for all files
```

### Level 3: Integration Validation (System Validation)

```bash
# Verify parser can be imported from CLI context
node --input-type=module -e "
import { parseMarkdown, parseFile, ParserError } from './src/parser/index.js';
console.log('Parser module loaded successfully');
console.log('parseMarkdown:', typeof parseMarkdown);
console.log('parseFile:', typeof parseFile);
console.log('ParserError:', typeof ParserError);
"

# Expected output:
# Parser module loaded successfully
# parseMarkdown: function
# parseFile: function
# ParserError: function

# Test parsing a real file
node --input-type=module -e "
import { parseFile } from './src/parser/index.js';
const result = await parseFile('./tests/fixtures/simple.md');
console.log('Parsed:', result.ast.type);
console.log('Children:', result.ast.children.length);
console.log('FilePath:', result.filePath);
"

# Expected: Shows root type, child count, and file path
```

### Level 4: Full Test Suite Validation

```bash
# Run complete test suite including parser
npm run test:run

# Expected: All tests pass (placeholder + parser tests)

# Run with coverage report
npm run test:coverage

# Expected:
# - All tests pass
# - src/parser coverage >= 85%
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
- [ ] `npm run test:run` passes all parser tests
- [ ] `npm run type-check` reports zero TypeScript errors
- [ ] `npm run lint` reports zero ESLint errors
- [ ] `npm run format:check` reports zero formatting issues
- [ ] Coverage >= 85% for `src/parser/**/*.ts`

### Feature Validation

- [ ] `parseMarkdown('# Title')` returns Root with Heading child
- [ ] `parseFile('./tests/fixtures/simple.md')` returns parsed AST with filePath
- [ ] Empty markdown returns Root with empty children array
- [ ] Missing file throws ParserError with FILE_NOT_FOUND code
- [ ] GFM tables parse correctly with alignment info
- [ ] All nodes have position information (line, column, offset)
- [ ] Code blocks include language information

### Code Quality Validation

- [ ] All files use `.js` extension in imports
- [ ] All mdast types use `import type`
- [ ] ParserError extends Error correctly with code property
- [ ] JSDoc comments on all public functions
- [ ] Follows existing code patterns from P1M1

### Files Created Checklist

- [ ] `/src/parser/types.ts` - Type definitions
- [ ] `/src/parser/processor.ts` - Processor factory
- [ ] `/src/parser/parse.ts` - Parse functions
- [ ] `/src/parser/index.ts` - Public exports
- [ ] `/tests/fixtures/simple.md`
- [ ] `/tests/fixtures/gfm-table.md`
- [ ] `/tests/fixtures/gfm-features.md`
- [ ] `/tests/fixtures/code-blocks.md`
- [ ] `/tests/fixtures/nested-lists.md`
- [ ] `/tests/fixtures/empty.md`
- [ ] `/tests/fixtures/complex.md`
- [ ] `/tests/parser/processor.test.ts`
- [ ] `/tests/parser/parse.test.ts`

---

## Anti-Patterns to Avoid

- Do not use `require()` - this is an ESM project
- Do not omit `.js` extensions in import paths
- Do not use synchronous `fs.readFileSync` - use async `readFile`
- Do not catch all errors with generic `catch` - use specific error types
- Do not return `null` for empty files - return Root with empty children
- Do not forget to pass `'utf-8'` encoding to `readFile`
- Do not use `any` type - use proper mdast types
- Do not skip position validation in tests - it's critical for selectors
- Do not hardcode fixture paths - use `join()` with `import.meta.dirname`
- Do not create processor in module scope - create in functions for testability

---

## Confidence Score

**Implementation Success Likelihood: 9/10**

**Rationale:**
- All dependencies already installed in package.json (unified, remark-parse, remark-gfm)
- Comprehensive research available in plan/P1M1/research/remark-setup.md
- Complete code examples provided for all files
- Clear test cases with expected outputs
- Follows established patterns from P1M1 codebase
- No ambiguous implementation decisions
- Deterministic validation commands

**Risk Factors:**
- Minor: Type casting for processor.parse() return type (mitigated with `as Root`)
- Minor: import.meta.dirname availability (Node 20.11+, project uses Node 18+ but recommended 20+)

---

## Execution Notes

1. **Create files in order**: types.ts → processor.ts → parse.ts → index.ts → fixtures → tests
2. **Validate after each file**: Run `npm run type-check` after each file creation
3. **Test incrementally**: Run tests for each component before moving to next
4. **Use exact imports**: Copy import statements exactly as shown
5. **Check coverage last**: Only after all tests pass, verify coverage thresholds
6. **ESM everywhere**: All imports use `.js` extension, all files are ESM
