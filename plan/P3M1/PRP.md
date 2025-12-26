# PRP: P3M1 - Content Extraction & Truncation

**Phase 3, Milestone 1 - Content Extraction & Truncation for mdsel CLI**

---

## Goal

**Feature Goal**: Implement a content extraction and truncation system that converts mdast nodes to markdown/plain text with word-based truncation and pagination, enabling LLM-friendly content retrieval with token-efficient output.

**Deliverable**: A `src/output/` module containing:
- Type definitions for CLI response envelopes, pagination info, and content extraction results
- Content extractor utilities (node-to-text and node-to-markdown converters)
- Truncation system with word-based mechanical truncation
- Pagination system for splitting large content into virtual pages
- Response formatters for `index` and `select` commands
- Comprehensive test suite covering all extraction, truncation, and pagination scenarios

**Success Definition**: Running `npm run test` passes all output module tests with 85%+ coverage, and the system correctly:
- Extracts markdown content from mdast nodes preserving structure
- Extracts plain text from mdast nodes for previews
- Truncates content at word boundaries when exceeding MAX_WORDS (500)
- Creates virtual pages with pagination metadata for large content
- Handles `?full=true` query parameter to bypass truncation
- Formats JSON output matching the CLI response envelope specification

---

## Why

- **LLM Token Efficiency**: Truncation prevents LLMs from receiving excessive content that wastes tokens
- **Mechanical Simplicity**: Word-based truncation is deterministic, requires no semantic understanding, and is reproducible
- **Pagination Support**: Large sections are split into virtual pages enabling incremental content retrieval
- **Output Standardization**: All CLI output uses consistent JSON envelope format for programmatic consumption
- **Error Recovery**: Structured error responses with suggestions enable LLM self-correction
- **Type Safety**: Strongly typed interfaces ensure correct content formatting throughout the codebase

---

## What

Create the Content Extraction & Truncation infrastructure:

1. **Output Type Definitions** - CLIResponse, SelectMatch, IndexResponse, PaginationInfo interfaces
2. **Content Extractor** - node-to-text and node-to-markdown conversion utilities
3. **Truncation System** - word-based mechanical truncation at word boundaries
4. **Pagination System** - virtual page creation with metadata tracking
5. **Response Formatters** - index and select command JSON formatters
6. **Test Suite** - Unit tests for all extraction, truncation, and pagination functionality

### Success Criteria

- [ ] `extractMarkdown()` returns markdown string from mdast node
- [ ] `extractText()` returns plain text from mdast node (for previews)
- [ ] `truncateContent()` truncates at word boundaries when exceeding MAX_WORDS
- [ ] `paginateContent()` splits content into pages with correct metadata
- [ ] Truncation adds `[truncated]` marker at end
- [ ] `?full=true` parameter bypasses truncation
- [ ] Pagination info includes current_page, total_pages, word_count, has_more
- [ ] Response formatters output valid JSON matching CLIResponse envelope
- [ ] Test coverage >= 85% for output module
- [ ] All ESLint and TypeScript checks pass

---

## All Needed Context

### Context Completeness Check

_"If someone knew nothing about this codebase, would they have everything needed to implement this successfully?"_ - **YES**, this PRP contains complete type definitions, algorithm specifications, validation commands, and references to all necessary documentation.

### Documentation & References

```yaml
# MUST READ - Architecture Documentation (in codebase)
- file: plan/architecture/output_format.md
  why: Complete JSON output schema specification with examples
  pattern: CLIResponse envelope, SelectMatch, IndexResponse structures
  gotcha: Omit null fields (except data on errors), use ISO 8601 timestamps

- file: plan/architecture/selector_grammar.md
  why: Understanding page selector syntax for pagination
  pattern: page[index] virtual node, ?full=true query parameter
  gotcha: Pages are 0-indexed, full=true bypasses all truncation

- file: PRD.md sections 6-7
  why: Truncation rules, pagination model, overview algorithm
  pattern: MAX_WORDS=500, PAGE_SIZE=500, mechanical truncation only
  gotcha: No fence balancing, no syntactic guarantees, add [truncated] marker

# MUST READ - Existing Codebase Patterns
- file: src/parser/types.ts
  why: ParserOptions and ParseResult patterns for type definitions
  pattern: JSDoc comments, import type for mdast, custom error classes
  gotcha: Use Error.captureStackTrace for proper stack traces

- file: src/selector/types.ts
  why: SelectorAST and QueryParam types for handling ?full=true
  pattern: Position interface, discriminated unions with enum types
  gotcha: queryParams is optional array of {key, value, position}

- file: src/resolver/types.ts
  why: ResolutionResult pattern for content extraction results
  pattern: Interface composition, optional properties with clear semantics
  gotcha: wordCount and childrenAvailable fields for content metadata

- file: tests/parser/*.test.ts
  why: Test organization patterns with Vitest describe/it/expect
  pattern: Fixture usage, error testing with try-catch, comprehensive coverage
  gotcha: Use join() with import.meta.dirname for fixture paths

# External Documentation URLs
- url: https://github.com/syntax-tree/mdast-util-to-markdown
  why: Converting mdast AST back to markdown string
  critical: toMarkdown(tree, options) returns markdown string
  pattern: Use options.bullet, options.fence for consistent formatting

- url: https://github.com/syntax-tree/mdast-util-to-string
  why: Extracting plain text from mdast nodes
  critical: toString(node) returns plain text content
  pattern: Handles nested children, inline formatting automatically

- url: https://github.com/syntax-tree/mdast#nodes
  why: Complete mdast node type reference for content extraction
  critical: All node types have type, children, position properties
  pattern: Content nodes have children array, text nodes have value property
```

### Current Codebase Tree

```bash
/home/dustin/projects/mdsel/
├── package.json                     # Dependencies: vitest, typescript, eslint, mdast-util-to-string
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
│   ├── selector/                    # COMPLETE from P2M1
│   │   ├── index.ts                 # Exports parseSelector, tokenize, types
│   │   ├── types.ts                 # SelectorAST, PathSegmentNode, SelectorParseError
│   │   ├── tokenizer.ts             # tokenize() function
│   │   └── parser.ts                # parseSelector() function
│   ├── resolver/                    # COMPLETE from P2M2
│   │   ├── index.ts                 # Exports resolveSingle, resolveMulti, types
│   │   ├── types.ts                 # ResolutionResult, ResolutionError, Suggestion
│   │   ├── levenshtein.ts           # Levenshtein distance
│   │   ├── suggestions.ts           # Suggestion engine
│   │   ├── single-resolver.ts       # Single-tree resolver
│   │   └── multi-resolver.ts        # Multi-tree resolver
│   └── output/                      # EMPTY - To be implemented in this milestone
├── tests/
│   ├── fixtures/                    # Existing from P1M2
│   │   ├── simple.md
│   │   ├── code-blocks.md
│   │   ├── gfm-features.md
│   │   ├── nested-lists.md
│   │   ├── empty.md
│   │   └── complex.md
│   ├── parser/                      # Existing from P1M2
│   ├── selector/                    # Existing from P2M1
│   ├── resolver/                    # Existing from P2M2
│   └── output/                      # To be created
└── dist/                            # Build output
```

### Desired Codebase Tree After P3M1 Completion

```bash
/home/dustin/projects/mdsel/
├── src/
│   ├── cli/
│   │   └── index.ts                 # Unchanged
│   ├── parser/                      # Unchanged
│   ├── selector/                    # Unchanged
│   ├── resolver/                    # Unchanged
│   └── output/
│       ├── index.ts                 # Public API exports
│       ├── types.ts                 # CLIResponse, SelectMatch, PaginationInfo interfaces
│       ├── content.ts               # Content extraction utilities
│       ├── truncation.ts            # Truncation and pagination logic
│       ├── formatters.ts            # Response formatters for index/select
│       └── constants.ts             # MAX_WORDS, PAGE_SIZE, PREVIEW_LENGTH constants
├── tests/
│   ├── fixtures/                    # Unchanged
│   └── output/
│       ├── content.test.ts          # Content extraction tests
│       ├── truncation.test.ts       # Truncation and pagination tests
│       └── formatters.test.ts       # Response formatter tests
└── ...
```

### Known Gotchas & Library Quirks

```typescript
// CRITICAL: ESM imports MUST use .js extension in source files
import { extractMarkdown } from './output/content.js';     // CORRECT
import { extractMarkdown } from './output/content';        // WRONG - runtime error

// CRITICAL: Install mdast-util-to-markdown for content extraction
// npm install mdast-util-to-markdown
import { toMarkdown } from 'mdast-util-to-markdown';

// CRITICAL: mdast-util-to-string is already installed for word counting
import { toString } from 'mdast-util-to-string';

// CRITICAL: Truncation constants match architecture spec
const DEFAULTS = {
  MAX_WORDS: 500,        // Truncation threshold per node
  PAGE_SIZE: 500,        // Words per virtual page
  PREVIEW_LENGTH: 80,    // Characters in content_preview
};

// CRITICAL: Truncation is mechanical only - no fence balancing
// Don't try to preserve markdown validity after truncation
// Just add "[truncated]" marker at the end

// CRITICAL: Word counting uses /\s+/ regex split
const words = text.trim().split(/\s+/);
const count = words.filter(w => w.length > 0).length;

// CRITICAL: Pagination is 0-indexed for internal, 1-indexed for display
// Internal: page[0], page[1], page[2]
// Display metadata: current_page: 1, 2, 3 (add 1 for output)

// CRITICAL: ?full=true query parameter bypasses ALL truncation
// Check queryParams in SelectorAST for full=true
const isFull = selector.queryParams?.some(p => p.key === 'full' && p.value === 'true');

// CRITICAL: JSON output - omit null fields (except data on errors)
// Use JSON.stringify with replacer or conditional spreading
const response = data ? { ...base, data } : { ...base, data: null };

// CRITICAL: Error.captureStackTrace for V8 environments (Node.js)
// Follow pattern from ParserError and SelectorParseError
Error.captureStackTrace?.(this, MyClass);

// GOTCHA: toMarkdown() returns string with trailing newline
// May need to trim() depending on output requirements
const markdown = toMarkdown(node).trim();

// GOTCHA: Empty nodes return empty string
// Handle gracefully - return "" with truncated: false

// GOTCHA: Position tracking from mdast is preserved in extraction
// Use for error reporting but not needed for content output
```

---

## Implementation Blueprint

### Data Models and Structure

```typescript
// src/output/types.ts

// Response envelope for all CLI commands
interface CLIResponse<T = unknown> {
  success: boolean;
  command: 'index' | 'select';
  timestamp: string;  // ISO 8601
  data: T | null;
  partial_results?: T[];
  unresolved_selectors?: string[];
  warnings?: string[];
  errors?: ErrorEntry[];
}

// Content extraction result
interface ContentResult {
  markdown: string;      // Full markdown content
  text: string;          // Plain text (for previews)
  wordCount: number;     // Total word count
  truncated: boolean;    // Whether content was truncated
}

// Pagination info for large content
interface PaginationInfo {
  current_page: number;     // 1-indexed for display
  total_pages: number;
  word_count: number;
  has_more: boolean;
}

// Select command output
interface SelectMatch {
  selector: string;
  type: string;
  content: string;
  truncated: boolean;
  pagination?: PaginationInfo;
  children_available: ChildInfo[];
}

// Index command output
interface IndexResponse {
  documents: DocumentIndex[];
  summary: IndexSummary;
}
```

### Implementation Tasks (Ordered by Dependencies)

```yaml
Task 1: CREATE src/output/constants.ts
  - IMPLEMENT: MAX_WORDS, PAGE_SIZE, PREVIEW_LENGTH constants
  - FOLLOW pattern: plan/architecture/output_format.md Section "Truncation Rules"
  - PATTERN: Export readonly constants for use across module
  - VALUES: MAX_WORDS=500, PAGE_SIZE=500, PREVIEW_LENGTH=80
  - PLACEMENT: /src/output/constants.ts
  - VALIDATION: npx tsc --noEmit passes

Task 2: CREATE src/output/types.ts
  - IMPLEMENT: CLIResponse, ContentResult, PaginationInfo, SelectMatch, IndexResponse
  - IMPLEMENT: ErrorEntry, ChildInfo, DocumentIndex, NodeDescriptor, HeadingDescriptor
  - FOLLOW pattern: src/parser/types.ts and src/resolver/types.ts
  - PATTERN: JSDoc comments, import type for mdast, re-export types
  - NAMING: PascalCase for types, camelCase for properties
  - IMPORTS: Use `import type` for all mdast types
  - PLACEMENT: /src/output/types.ts
  - VALIDATION: npx tsc --noEmit passes

Task 3: CREATE src/output/content.ts
  - IMPLEMENT: extractMarkdown(node) using mdast-util-to-markdown
  - IMPLEMENT: extractText(node) using mdast-util-to-string
  - IMPLEMENT: countWords(text) utility
  - IMPLEMENT: getContentPreview(text, maxLength) utility
  - FOLLOW pattern: mdast-util-to-markdown and mdast-util-to-string APIs
  - PATTERN:
    - toMarkdown(node) returns markdown string
    - toString(node) returns plain text
    - Word count: split on /\s+/, filter empty strings
  - DEPENDENCIES: Task 1 (imports constants), Task 2 (imports types)
  - INSTALL: npm install mdast-util-to-markdown
  - PLACEMENT: /src/output/content.ts
  - VALIDATION: Unit tests pass for various node types

Task 4: CREATE src/output/truncation.ts
  - IMPLEMENT: truncateContent(content, maxWords) function
  - IMPLEMENT: paginateContent(content, pageSize) function
  - IMPLEMENT: shouldTruncate(wordCount, maxWords, isFull) helper
  - IMPLEMENT: createPaginationInfo(currentPage, totalPages, wordCount) helper
  - FOLLOW pattern: PRD.md section 6 "Truncation & Pagination"
  - PATTERN:
    - Truncate at word boundaries (split on /\s+/)
    - Add "[truncated]" marker when truncated
    - Create 0-indexed pages, display as 1-indexed
    - Bypass truncation when isFull=true
  - DEPENDENCIES: Task 1 (imports constants), Task 3 (uses countWords)
  - PLACEMENT: /src/output/truncation.ts
  - VALIDATION: Unit tests pass for truncation and pagination

Task 5: CREATE src/output/formatters.ts
  - IMPLEMENT: formatIndexResponse(documents, summary) function
  - IMPLEMENT: formatSelectResponse(matches, unresolved) function
  - IMPLEMENT: formatError(error) function
  - IMPLEMENT: createCLIResponse(command, data, errors) helper
  - FOLLOW pattern: plan/architecture/output_format.md JSON schema
  - PATTERN:
    - ISO 8601 timestamps with new Date().toISOString()
    - Omit null fields (except data on errors)
    - Include success boolean and command type
  - DEPENDENCIES: Tasks 1-4 (uses all output utilities)
  - PLACEMENT: /src/output/formatters.ts
  - VALIDATION: Output JSON matches expected schema

Task 6: CREATE src/output/index.ts
  - IMPLEMENT: Public API exports
  - EXPORTS:
    - { extractMarkdown, extractText, countWords, getContentPreview } from './content.js'
    - { truncateContent, paginateContent, createPaginationInfo } from './truncation.js'
    - { formatIndexResponse, formatSelectResponse, formatError } from './formatters.js'
    - { MAX_WORDS, PAGE_SIZE, PREVIEW_LENGTH } from './constants.js'
    - All types from './types.js'
  - NAMING: Barrel file pattern
  - DEPENDENCIES: Tasks 1-5
  - PLACEMENT: /src/output/index.ts
  - VALIDATION: Can import from 'src/output/index.js' in test files

Task 7: CREATE tests/output/content.test.ts
  - IMPLEMENT: Unit tests for content extraction
  - TEST CASES:
    - extractMarkdown() returns markdown string for headings
    - extractMarkdown() returns markdown string for code blocks
    - extractMarkdown() returns markdown string for lists
    - extractText() returns plain text without markdown syntax
    - countWords() correctly counts words in various content
    - getContentPreview() truncates to max length
    - Handles empty content gracefully
  - FOLLOW pattern: tests/parser/*.test.ts (Vitest describe/it/expect)
  - USE fixtures: tests/fixtures/*.md
  - COVERAGE: All branches of content extraction
  - PLACEMENT: /tests/output/content.test.ts
  - VALIDATION: npm run test -- tests/output/content.test.ts passes

Task 8: CREATE tests/output/truncation.test.ts
  - IMPLEMENT: Unit tests for truncation and pagination
  - TEST CASES:
    - truncateContent() truncates at word boundaries
    - truncateContent() adds [truncated] marker when needed
    - truncateContent() returns full content when isFull=true
    - truncateContent() handles content shorter than maxWords
    - paginateContent() splits content into pages
    - paginateContent() handles last page with fewer words
    - Pagination metadata is correct (current_page, total_pages, etc.)
    - Empty content returns empty pagination
  - FOLLOW pattern: tests/parser/*.test.ts
  - COVERAGE: All truncation and pagination scenarios
  - PLACEMENT: /tests/output/truncation.test.ts
  - VALIDATION: npm run test -- tests/output/truncation.test.ts passes

Task 9: CREATE tests/output/formatters.test.ts
  - IMPLEMENT: Unit tests for response formatters
  - TEST CASES:
    - formatIndexResponse() returns valid JSON with correct structure
    - formatIndexResponse() includes all required fields
    - formatSelectResponse() returns valid JSON with correct structure
    - formatSelectResponse() includes pagination info when truncated
    - formatError() returns valid error response JSON
    - Timestamp format is ISO 8601
    - Null fields are omitted (except data on errors)
  - FOLLOW pattern: tests/parser/*.test.ts
  - COVERAGE: All formatter branches
  - PLACEMENT: /tests/output/formatters.test.ts
  - VALIDATION: npm run test -- tests/output/formatters.test.ts passes
```

### Implementation Patterns & Key Details

#### src/output/constants.ts (Task 1)

```typescript
/**
 * Truncation and pagination constants.
 *
 * These values are defined in the architecture specification
 * and should not be changed without updating the PRD.
 *
 * @see plan/architecture/output_format.md
 */

/**
 * Maximum word count before content is truncated.
 * Content exceeding this will have a `[truncated]` marker appended.
 */
export const MAX_WORDS = 500;

/**
 * Number of words per virtual page when content is paginated.
 */
export const PAGE_SIZE = 500;

/**
 * Maximum length of content preview text in characters.
 */
export const PREVIEW_LENGTH = 80;

/**
 * Truncation marker appended to truncated content.
 */
export const TRUNCATION_MARKER = '[truncated]';
```

#### src/output/types.ts (Task 2)

```typescript
import type { Root } from 'mdast';

/**
 * Response envelope for all CLI commands.
 * Ensures consistent JSON output structure.
 */
export interface CLIResponse<T = unknown> {
  /** Whether the command succeeded */
  success: boolean;
  /** The command that was executed */
  command: 'index' | 'select';
  /** ISO 8601 timestamp of response */
  timestamp: string;
  /** Response data (null on error) */
  data: T | null;
  /** Partial results if some operations succeeded */
  partial_results?: T[];
  /** Selectors that could not be resolved */
  unresolved_selectors?: string[];
  /** Warning messages */
  warnings?: string[];
  /** Error entries */
  errors?: ErrorEntry[];
}

/**
 * Error entry for error responses.
 */
export interface ErrorEntry {
  /** File where error occurred */
  file?: string;
  /** Selector that caused error */
  selector?: string;
  /** Error type code */
  type: ErrorType;
  /** Error message */
  message: string;
  /** Machine-readable error code */
  code: string;
  /** Suggested corrections */
  suggestions?: string[];
}

/**
 * Error type codes.
 */
export type ErrorType =
  | 'FILE_NOT_FOUND'
  | 'PARSE_ERROR'
  | 'INVALID_SELECTOR'
  | 'SELECTOR_NOT_FOUND'
  | 'NAMESPACE_NOT_FOUND'
  | 'PROCESSING_ERROR';

/**
 * Content extraction result.
 */
export interface ContentResult {
  /** Markdown content */
  markdown: string;
  /** Plain text content */
  text: string;
  /** Word count */
  wordCount: number;
  /** Whether content was truncated */
  truncated: boolean;
}

/**
 * Pagination information for large content.
 */
export interface PaginationInfo {
  /** Current page number (1-indexed) */
  current_page: number;
  /** Total number of pages */
  total_pages: number;
  /** Word count of current page */
  word_count: number;
  /** Whether more pages are available */
  has_more: boolean;
}

/**
 * Match result from select command.
 */
export interface SelectMatch {
  /** Selector that matched */
  selector: string;
  /** Node type */
  type: string;
  /** Extracted content */
  content: string;
  /** Whether content was truncated */
  truncated: boolean;
  /** Pagination info (if paginated) */
  pagination?: PaginationInfo;
  /** Available child selectors */
  children_available: ChildInfo[];
}

/**
 * Child node information.
 */
export interface ChildInfo {
  /** Child selector */
  selector: string;
  /** Child node type */
  type: string;
  /** Content preview */
  preview: string;
}

/**
 * Index command response data.
 */
export interface IndexResponse {
  /** Document indices */
  documents: DocumentIndex[];
  /** Summary statistics */
  summary: IndexSummary;
}

/**
 * Document index.
 */
export interface DocumentIndex {
  /** Document namespace */
  namespace: string;
  /** File path */
  file_path: string;
  /** Root node info */
  root: NodeDescriptor | null;
  /** Heading descriptors */
  headings: HeadingDescriptor[];
  /** Block summary */
  blocks: BlockSummary;
}

/**
 * Node descriptor for index output.
 */
export interface NodeDescriptor {
  /** Node selector */
  selector: string;
  /** Node type */
  type: string;
  /** Content preview */
  content_preview: string;
  /** Whether truncated */
  truncated: boolean;
  /** Number of children */
  children_count: number;
  /** Word count */
  word_count: number;
}

/**
 * Heading descriptor (extends NodeDescriptor).
 */
export interface HeadingDescriptor extends NodeDescriptor {
  /** Heading depth */
  depth: 1 | 2 | 3 | 4 | 5 | 6;
  /** Full heading text */
  text: string;
  /** Section word count */
  section_word_count: number;
  /** Whether section is truncated */
  section_truncated: boolean;
}

/**
 * Block counts summary.
 */
export interface BlockSummary {
  paragraphs: number;
  code_blocks: number;
  lists: number;
  tables: number;
  blockquotes: number;
}

/**
 * Index summary statistics.
 */
export interface IndexSummary {
  total_documents: number;
  total_nodes: number;
  total_selectors: number;
}

/**
 * Unresolved selector info.
 */
export interface UnresolvedSelector {
  selector: string;
  reason: string;
  suggestions: string[];
}

/**
 * Truncation options.
 */
export interface TruncationOptions {
  /** Maximum words before truncation */
  maxWords?: number;
  /** Whether to bypass truncation */
  full?: boolean;
}
```

#### src/output/content.ts (Task 3)

```typescript
import { toMarkdown } from 'mdast-util-to-markdown';
import { toString } from 'mdast-util-to-string';
import type { Content, Root } from 'mdast';
import { PREVIEW_LENGTH } from './constants.js';
import type { ContentResult } from './types.js';

/**
 * Extract markdown content from an mdast node.
 *
 * @param node - The mdast node
 * @returns Markdown string representation
 *
 * @example
 * ```typescript
 * const heading = { type: 'heading', depth: 1, children: [...] };
 * const markdown = extractMarkdown(heading); // "# Title"
 * ```
 */
export function extractMarkdown(node: Content | Root): string {
  const markdown = toMarkdown(node, {
    bullet: '-',
    bulletOrdered: '.',
    fence: '`',
    fences: true,
    rule: '-',
  });
  return markdown.trimEnd();
}

/**
 * Extract plain text from an mdast node.
 *
 * @param node - The mdast node
 * @returns Plain text content (no markdown syntax)
 *
 * @example
 * ```typescript
 * const heading = { type: 'heading', depth: 1, children: [...] };
 * const text = extractText(heading); // "Title" (no #)
 * ```
 */
export function extractText(node: Content | Root): string {
  return toString(node);
}

/**
 * Count words in a text string.
 *
 * @param text - The text to count
 * @returns Word count
 *
 * Uses whitespace splitting for mechanical word counting.
 * Consistent with the PRD requirement for deterministic word counting.
 */
export function countWords(text: string): number {
  const trimmed = text.trim();
  if (trimmed.length === 0) return 0;

  const words = trimmed.split(/\s+/);
  return words.filter(w => w.length > 0).length;
}

/**
 * Create a content preview of specified max length.
 *
 * @param text - The text to preview
 * @param maxLength - Maximum preview length (default: PREVIEW_LENGTH)
 * @returns Preview string, truncated with "..." if needed
 */
export function getContentPreview(text: string, maxLength: number = PREVIEW_LENGTH): string {
  if (text.length <= maxLength) {
    return text;
  }

  return text.slice(0, maxLength - 3) + '...';
}

/**
 * Extract full content result from a node.
 *
 * @param node - The mdast node
 * @returns ContentResult with markdown, text, and word count
 */
export function extractContentResult(node: Content | Root): ContentResult {
  const markdown = extractMarkdown(node);
  const text = extractText(node);
  const wordCount = countWords(text);

  return {
    markdown,
    text,
    wordCount,
    truncated: false,
  };
}
```

#### src/output/truncation.ts (Task 4)

```typescript
import { MAX_WORDS, PAGE_SIZE, TRUNCATION_MARKER } from './constants.js';
import type { PaginationInfo, TruncationOptions } from './types.js';

/**
 * Truncation result.
 */
export interface TruncationResult {
  /** Truncated content */
  content: string;
  /** Whether content was truncated */
  truncated: boolean;
  /** Original word count */
  wordCount: number;
}

/**
 * Page result.
 */
export interface Page {
  /** Zero-based page index */
  index: number;
  /** Page content */
  content: string;
  /** Word count in this page */
  wordCount: number;
}

/**
 * Pagination result.
 */
export interface PaginationResult {
  /** All pages */
  pages: Page[];
  /** Total word count */
  totalWords: number;
  /** Total pages */
  totalPages: number;
}

/**
 * Check if content should be truncated.
 *
 * @param wordCount - Content word count
 * @param options - Truncation options
 * @returns Whether to truncate
 */
export function shouldTruncate(
  wordCount: number,
  options: TruncationOptions = {}
): boolean {
  const { maxWords = MAX_WORDS, full = false } = options;
  return !full && wordCount > maxWords;
}

/**
 * Truncate content at word boundaries.
 *
 * Mechanical truncation - does not preserve markdown validity.
 * Adds [truncated] marker when content exceeds maxWords.
 *
 * @param content - The content to truncate
 * @param options - Truncation options
 * @returns Truncation result
 *
 * @example
 * ```typescript
 * const result = truncateContent(longText, { maxWords: 100 });
 * // { content: "First 100 words...[truncated]", truncated: true, wordCount: 5000 }
 * ```
 */
export function truncateContent(
  content: string,
  options: TruncationOptions = {}
): TruncationResult {
  const { maxWords = MAX_WORDS, full = false } = options;

  const words = content.trim().split(/\s+/).filter(w => w.length > 0);
  const wordCount = words.length;

  if (!shouldTruncate(wordCount, options)) {
    return {
      content: content.trim(),
      truncated: false,
      wordCount,
    };
  }

  // Truncate at word boundary
  const truncatedWords = words.slice(0, maxWords);
  const truncatedContent = truncatedWords.join(' ') + ' ' + TRUNCATION_MARKER;

  return {
    content: truncatedContent,
    truncated: true,
    wordCount,
  };
}

/**
 * Paginate content into pages of specified size.
 *
 * @param content - The content to paginate
 * @param pageSize - Words per page (default: PAGE_SIZE)
 * @returns Pagination result
 *
 * @example
 * ```typescript
 * const result = paginateContent(longText, 500);
 * // { pages: [{index: 0, content: "...", wordCount: 500}, ...], totalWords: 2340, totalPages: 5 }
 * ```
 */
export function paginateContent(content: string, pageSize: number = PAGE_SIZE): PaginationResult {
  const words = content.trim().split(/\s+/).filter(w => w.length > 0);
  const totalWords = words.length;
  const totalPages = Math.max(1, Math.ceil(totalWords / pageSize));

  const pages: Page[] = [];

  for (let i = 0; i < totalWords; i += pageSize) {
    const pageWords = words.slice(i, i + pageSize);
    const pageContent = pageWords.join(' ');

    pages.push({
      index: i / pageSize,
      content: pageContent,
      wordCount: pageWords.length,
    });
  }

  return {
    pages,
    totalWords,
    totalPages,
  };
}

/**
 * Create pagination metadata for output.
 *
 * Converts 0-indexed internal pagination to 1-indexed display format.
 *
 * @param currentPage - Zero-based current page index
 * @param totalPages - Total number of pages
 * @param wordCount - Word count of current page
 * @returns Pagination info for output
 */
export function createPaginationInfo(
  currentPage: number,
  totalPages: number,
  wordCount: number
): PaginationInfo {
  return {
    current_page: currentPage + 1,  // Convert to 1-indexed
    total_pages: totalPages,
    word_count: wordCount,
    has_more: currentPage < totalPages - 1,
  };
}

/**
 * Get a specific page from paginated content.
 *
 * @param content - The content to paginate
 * @param pageIndex - Zero-based page index
 * @param pageSize - Words per page
 * @returns Page or null if index out of range
 */
export function getPage(
  content: string,
  pageIndex: number,
  pageSize: number = PAGE_SIZE
): Page | null {
  const result = paginateContent(content, pageSize);

  if (pageIndex < 0 || pageIndex >= result.pages.length) {
    return null;
  }

  return result.pages[pageIndex];
}
```

#### src/output/formatters.ts (Task 5)

```typescript
import type { Root } from 'mdast';
import type {
  CLIResponse,
  IndexResponse,
  SelectMatch,
  UnresolvedSelector,
  ErrorEntry,
  DocumentIndex,
  HeadingDescriptor,
  BlockSummary,
  IndexSummary,
  PaginationInfo,
} from './types.js';
import { extractMarkdown, extractText, countWords, getContentPreview } from './content.js';
import { truncateContent, paginateContent, createPaginationInfo } from './truncation.js';
import { MAX_WORDS, PREVIEW_LENGTH } from './constants.js';

/**
 * Create a CLI response envelope.
 *
 * @param command - The command type
 * @param data - Response data
 * @param errors - Optional errors
 * @returns Formatted CLI response
 */
export function createCLIResponse<T>(
  command: 'index' | 'select',
  data: T | null,
  errors?: ErrorEntry[]
): CLIResponse<T> {
  const response: CLIResponse<T> = {
    success: errors === undefined || errors.length === 0,
    command,
    timestamp: new Date().toISOString(),
    data,
  };

  if (errors && errors.length > 0) {
    response.errors = errors;
  }

  return response;
}

/**
 * Format index command response.
 *
 * @param documents - Document indices
 * @param summary - Summary statistics
 * @returns Formatted index response
 */
export function formatIndexResponse(
  documents: DocumentIndex[],
  summary: IndexSummary
): CLIResponse<IndexResponse> {
  return createCLIResponse('index', {
    documents,
    summary,
  });
}

/**
 * Format select command response.
 *
 * @param matches - Selector matches
 * @param unresolved - Unresolved selectors
 * @returns Formatted select response
 */
export function formatSelectResponse(
  matches: SelectMatch[],
  unresolved: UnresolvedSelector[] = []
): CLIResponse<{ matches: SelectMatch[]; unresolved: UnresolvedSelector[] }> {
  return createCLIResponse('select', {
    matches,
    unresolved,
  });
}

/**
 * Format error response.
 *
 * @param command - The command that failed
 * @param errorType - Error type code
 * @param code - Machine-readable error code
 * @param message - Error message
 * @param suggestions - Optional suggestions
 * @returns Formatted error response
 */
export function formatError(
  command: 'index' | 'select',
  errorType: string,
  code: string,
  message: string,
  suggestions?: string[]
): CLIResponse<null> {
  return createCLIResponse(command, null, [
    {
      type: errorType as any,
      code,
      message,
      suggestions,
    },
  ]);
}

/**
 * Create a node descriptor for index output.
 *
 * @param selector - Node selector
 * @param nodeType - Node type
 * @param node - The mdast node
 * @returns Node descriptor
 */
export function createNodeDescriptor(
  selector: string,
  nodeType: string,
  node: Root
): {
  selector: string;
  type: string;
  content_preview: string;
  truncated: boolean;
  children_count: number;
  word_count: number;
} {
  const text = extractText(node);
  const wordCount = countWords(text);
  const preview = getContentPreview(text, PREVIEW_LENGTH);

  return {
    selector,
    type: nodeType,
    content_preview: preview,
    truncated: false,
    children_count: node.children.length,
    word_count: wordCount,
  };
}

/**
 * Create a heading descriptor for index output.
 *
 * @param selector - Heading selector
 * @param depth - Heading depth
 * @param node - The heading node
 * @param sectionWordCount - Section word count
 * @param sectionTruncated - Whether section is truncated
 * @returns Heading descriptor
 */
export function createHeadingDescriptor(
  selector: string,
  depth: 1 | 2 | 3 | 4 | 5 | 6,
  node: Root,
  sectionWordCount: number,
  sectionTruncated: boolean
): HeadingDescriptor {
  const text = extractText(node);
  const wordCount = countWords(text);
  const preview = getContentPreview(text, PREVIEW_LENGTH);

  return {
    selector,
    type: `heading:h${depth}`,
    depth,
    text,
    content_preview: preview,
    truncated: false,
    children_count: node.children.length,
    word_count: wordCount,
    section_word_count: sectionWordCount,
    section_truncated: sectionTruncated,
  };
}

/**
 * Create a select match from a node.
 *
 * @param selector - Node selector
 * @param nodeType - Node type
 * @param node - The mdast node
 * @param full - Whether full content was requested
 * @returns Select match
 */
export function createSelectMatch(
  selector: string,
  nodeType: string,
  node: Root,
  full = false
): SelectMatch {
  const markdown = extractMarkdown(node);
  const result = truncateContent(markdown, { full });

  const match: SelectMatch = {
    selector,
    type: nodeType,
    content: result.content,
    truncated: result.truncated,
    children_available: [],
  };

  // Add pagination info if truncated
  if (result.truncated && !full) {
    const pagination = paginateContent(markdown);
    match.pagination = createPaginationInfo(0, pagination.totalPages, pagination.pages[0]?.wordCount || 0);
  }

  return match;
}
```

#### src/output/index.ts (Task 6)

```typescript
// Constants
export {
  MAX_WORDS,
  PAGE_SIZE,
  PREVIEW_LENGTH,
  TRUNCATION_MARKER,
} from './constants.js';

// Content extraction
export {
  extractMarkdown,
  extractText,
  countWords,
  getContentPreview,
  extractContentResult,
} from './content.js';

// Truncation and pagination
export {
  truncateContent,
  paginateContent,
  createPaginationInfo,
  getPage,
  shouldTruncate,
} from './truncation.js';

// Response formatters
export {
  createCLIResponse,
  formatIndexResponse,
  formatSelectResponse,
  formatError,
  createNodeDescriptor,
  createHeadingDescriptor,
  createSelectMatch,
} from './formatters.js';

// Types
export type {
  CLIResponse,
  ContentResult,
  PaginationInfo,
  SelectMatch,
  ChildInfo,
  IndexResponse,
  DocumentIndex,
  NodeDescriptor,
  HeadingDescriptor,
  BlockSummary,
  IndexSummary,
  UnresolvedSelector,
  TruncationOptions,
  ErrorEntry,
  ErrorType,
} from './types.js';
```

### Integration Points

```yaml
DEPENDENCIES:
  - NEW: mdast-util-to-markdown (must install)
    Install: npm install mdast-util-to-markdown
    Use: toMarkdown() for AST-to-markdown conversion

  - From: mdast-util-to-string (existing)
    Use: toString() for plain text extraction

  - From: mdast (existing)
    Use: Type imports for Root, Content, Heading, etc.

SELECTOR_INTEGRATION:
  - The output module consumes SelectorAST from selector module
  - Import: { parseSelector, type SelectorAST } from '../selector/index.js'
  - Usage: Check queryParams for ?full=true bypass

RESOLVER_INTEGRATION:
  - The output module formats ResolutionOutcome from resolver module
  - Import: { type ResolutionOutcome, type ResolutionResult } from '../resolver/index.js'
  - Usage: Convert resolution results to SelectMatch

FUTURE_INTEGRATION (P3M2, P3M3 - CLI):
  - The CLI will consume formatted responses directly
  - Output JSON to stdout
  - Handle exit codes based on success/partial/error
```

---

## Validation Loop

### Level 1: Syntax & Style (Immediate Feedback)

```bash
# Install new dependency
npm install mdast-util-to-markdown

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
# Run content extraction tests first
npm run test:run -- tests/output/content.test.ts -v

# Expected: All 7+ tests pass
# ✓ extractMarkdown() returns markdown for headings
# ✓ extractMarkdown() returns markdown for code blocks
# ✓ extractMarkdown() returns markdown for lists
# ✓ extractText() returns plain text
# ✓ countWords() counts correctly
# ✓ getContentPreview() truncates properly
# ✓ Handles empty content

# Run truncation tests
npm run test:run -- tests/output/truncation.test.ts -v

# Expected: All 8+ tests pass
# ✓ Truncates at word boundaries
# ✓ Adds [truncated] marker
# ✓ Bypasses when full=true
# ✓ Handles short content
# ✓ Paginates correctly
# ✓ Last page has fewer words
# ✓ Pagination metadata correct
# ✓ Empty content handled

# Run formatter tests
npm run test:run -- tests/output/formatters.test.ts -v

# Expected: All 6+ tests pass
# ✓ formatIndexResponse() returns valid JSON
# ✓ formatSelectResponse() returns valid JSON
# ✓ formatError() returns valid JSON
# ✓ Timestamps are ISO 8601
# ✓ Null fields omitted
# ✓ Pagination info included

# Run all output tests with coverage
npm run test:coverage -- --include='src/output/**/*.ts'

# Expected: Coverage >= 85% for all files
```

### Level 3: Integration Testing (System Validation)

```bash
# Verify output module can be imported
node --input-type=module -e "
import {
  extractMarkdown,
  extractText,
  countWords,
  truncateContent,
  paginateContent,
  formatIndexResponse,
  formatSelectResponse
} from './src/output/index.js';
import { parseMarkdown } from './src/parser/index.js';

console.log('Output module loaded successfully');

// Test content extraction
const { ast } = parseMarkdown('# Test\\n\\nThis is content.');
const heading = ast.children[0];
const markdown = extractMarkdown(heading);
const text = extractText(heading);
const words = countWords(text);

console.log('Markdown:', markdown);
console.log('Text:', text);
console.log('Word count:', words);

// Test truncation
const longText = 'word '.repeat(1000);
const truncated = truncateContent(longText, { maxWords: 100 });
console.log('Truncated:', truncated.content.slice(0, 50) + '...');
console.log('Was truncated:', truncated.truncated);

// Test pagination
const paginated = paginateContent(longText, 500);
console.log('Total pages:', paginated.totalPages);

// Test formatters
const indexResponse = formatIndexResponse([], {
  total_documents: 0,
  total_nodes: 0,
  total_selectors: 0
});
console.log('Index response:', JSON.stringify(indexResponse, null, 2));
"

# Expected output:
# Output module loaded successfully
# Markdown: # Test
# Text: Test
# Word count: 1
# Truncated: word word word ... [truncated]
# Was truncated: true
# Total pages: 2
# Index response: { "success": true, "command": "index", ... }
```

### Level 4: Full Test Suite Validation

```bash
# Run complete test suite including output module
npm run test:run

# Expected: All tests pass (parser + selector + resolver + output tests)

# Run with coverage report
npm run test:coverage

# Expected:
# - All tests pass
# - src/output coverage >= 85%
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
- [ ] `npm run test:run` passes all output module tests
- [ ] `npm run type-check` reports zero TypeScript errors
- [ ] `npm run lint` reports zero ESLint errors
- [ ] `npm run format:check` reports zero formatting issues
- [ ] Coverage >= 85% for `src/output/**/*.ts`
- [ ] `mdast-util-to-markdown` dependency installed

### Feature Validation

- [ ] `extractMarkdown()` returns valid markdown from mdast nodes
- [ ] `extractText()` returns plain text (no markdown syntax)
- [ ] `countWords()` correctly counts words using whitespace split
- [ ] `truncateContent()` truncates at word boundaries
- [ ] `truncateContent()` adds `[truncated]` marker
- [ ] `truncateContent()` bypasses truncation when full=true
- [ ] `paginateContent()` creates pages with correct word counts
- [ ] `createPaginationInfo()` returns 1-indexed display values
- [ ] Formatters output valid JSON matching CLIResponse envelope
- [ ] Timestamps in ISO 8601 format
- [ ] Null fields omitted (except data on errors)

### Code Quality Validation

- [ ] All files use `.js` extension in imports
- [ ] All mdast types use `import type`
- [ ] Follows existing code patterns from parser/resolver modules
- [ ] JSDoc comments on all public functions
- [ ] Error handling matches existing patterns (ParserError, SelectorParseError)

### Files Created Checklist

- [ ] `/src/output/constants.ts` - Constants
- [ ] `/src/output/types.ts` - Type definitions
- [ ] `/src/output/content.ts` - Content extraction
- [ ] `/src/output/truncation.ts` - Truncation and pagination
- [ ] `/src/output/formatters.ts` - Response formatters
- [ ] `/src/output/index.ts` - Public exports
- [ ] `/tests/output/content.test.ts`
- [ ] `/tests/output/truncation.test.ts`
- [ ] `/tests/output/formatters.test.ts`

---

## Anti-Patterns to Avoid

- Do not use `require()` - this is an ESM project
- Do not omit `.js` extensions in import paths
- Do not implement smart truncation - use mechanical word-based truncation only
- Do not preserve markdown validity after truncation - not required by PRD
- Do not forget to add `[truncated]` marker
- Do not use 1-based page indexing internally - convert to 1-indexed for display only
- Do not hardcode constants - use exported constants from constants.ts
- Do not skip null field handling - omit null fields in JSON output
- Do not use sync operations when async is available
- Do not forget to install mdast-util-to-markdown

---

## Confidence Score

**Implementation Success Likelihood: 9/10**

**Rationale:**
- Complete type definitions with clear interfaces matching architecture specification
- Detailed algorithm specifications for truncation and pagination
- Clear integration patterns with existing parser, selector, and resolver modules
- Comprehensive test patterns from existing codebase
- All external dependencies documented with URLs and API references
- Research from 7 specialized agents covering codebase patterns, testing, mdast utilities, truncation, and pagination
- Follows established patterns from P1M2/P2M1/P2M2 codebase
- No ambiguous implementation decisions

**Risk Factors:**
- Minor: mdast-util-to-markdown API differences (mitigated with documentation links)
- Minor: Pagination indexing confusion (mitigated with clear comments on 0-based vs 1-based)
- Minor: JSON null handling (mitigated with explicit examples)

---

## Execution Notes

1. **Install dependency first**: `npm install mdast-util-to-markdown`
2. **Create files in order**: constants.ts → types.ts → content.ts → truncation.ts → formatters.ts → index.ts → tests
3. **Validate after each file**: Run `npm run type-check` after each file creation
4. **Test incrementally**: Run tests for each component before moving to next
5. **Use exact imports**: Copy import statements exactly as shown
6. **Check coverage last**: Only after all tests pass, verify coverage thresholds
7. **ESM everywhere**: All imports use `.js` extension, all files are ESM
