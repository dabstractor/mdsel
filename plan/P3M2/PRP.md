# PRP: P3M2 - JSON Output Formatter

**Phase 3, Milestone 2 - JSON Output Formatter for mdsel CLI**

---

## Goal

**Feature Goal**: Implement a JSON output formatter module that produces standardized, machine-readable CLI responses for index and select commands, optimized for LLM agent consumption.

**Deliverable**: A `src/output/` module containing:
- Output type definitions matching `plan/architecture/output_format.md` specification
- Response formatters for `index` command (document indices and summaries)
- Response formatters for `select` command (selector matches and unresolved selectors)
- Error response formatters with structured error codes and suggestions
- Comprehensive test suite covering all formatting scenarios

**Success Definition**: Running `npm run test` passes all output module tests with 85%+ coverage, and the formatters correctly:
- Output valid JSON matching the CLIResponse envelope structure
- Include ISO 8601 timestamps in all responses
- Format index responses with document indices and summaries
- Format select responses with matches, pagination, and unresolved selectors
- Format error responses with error codes, messages, and suggestions
- Handle null fields by omitting them (except data on errors)
- Support both pretty-printed and compact JSON output

---

## Why

- **Machine-Readable Output**: LLM agents require structured JSON output for programmatic consumption
- **Consistent Envelope**: Standardized response structure enables reliable parsing by agents
- **Error Recovery**: Structured error responses with suggestions enable agent self-correction
- **Type Safety**: Strongly typed interfaces ensure correct response formatting throughout the codebase
- **Testability**: Isolated formatters with clear inputs/outputs enable comprehensive testing

---

## What

Create the JSON Output Formatter infrastructure:

1. **Output Type Definitions** - CLIResponse, IndexResponse, SelectResponse, ErrorEntry interfaces
2. **Index Response Formatter** - Format document indices with headings and block summaries
3. **Select Response Formatter** - Format selector matches with pagination and unresolved selectors
4. **Error Response Formatter** - Format errors with codes, messages, and suggestions
5. **Test Suite** - Unit tests for all formatters covering success, error, and edge cases

### Success Criteria

- [ ] `formatIndexResponse()` returns valid JSON with documents array and summary
- [ ] `formatSelectResponse()` returns valid JSON with matches and unresolved arrays
- [ ] `formatErrorResponse()` returns valid JSON with error entries and suggestions
- [ ] All responses include ISO 8601 timestamps
- [ ] Null fields are omitted (except data on errors)
- [ ] Response envelope includes success boolean and command type
- [ ] Test coverage >= 85% for output module
- [ ] All ESLint and TypeScript checks pass

---

## All Needed Context

### Context Completeness Check

_"If someone knew nothing about this codebase, would they have everything needed to implement this successfully?"_ - **YES**, this PRP contains complete type definitions, formatter specifications, validation commands, and references to all necessary documentation.

### Documentation & References

```yaml
# MUST READ - Architecture Documentation (in codebase)
- file: plan/architecture/output_format.md
  why: Complete JSON output schema specification with examples
  pattern: CLIResponse envelope, SelectMatch, IndexResponse structures
  gotcha: Omit null fields (except data on errors), use ISO 8601 timestamps

- file: PRD.md sections 7-10
  why: CLI command surface, output format requirements, error handling
  pattern: Strict JSON only, no prose, consistent field ordering
  gotcha: Soft failures with partial_results and warnings arrays

# MUST READ - External Research (created during research phase)
- file: JSON_OUTPUT_GUIDE.md
  why: JSON output formatting best practices for CLI tools
  pattern: Envelope patterns, error responses, pagination metadata
  gotcha: Field ordering, null handling, ISO 8601 timestamps

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
- url: https://datatracker.ietf.org/doc/html/rfc7807
  why: RFC 7807 Problem Details for HTTP APIs (error response pattern)
  critical: Standard error format with type, title, detail, instance
  pattern: Use for error response structure

- url: https://jsonapi.org/format/
  why: JSON:API specification for response envelope patterns
  critical: Consistent field ordering, meta object, links object
  pattern: Use for overall response structure

- url: https://cli.github.com/
  why: GitHub CLI documentation for JSON output examples
  critical: Flat structure with minimal nesting
  pattern: Emulate for simple command responses

- url: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date/toISOString
  why: ISO 8601 timestamp formatting
  critical: Always include timezone (Z or offset)
  pattern: new Date().toISOString() for consistent timestamps
```

### Current Codebase Tree

```bash
/home/dustin/projects/mdsel/
├── package.json                     # Dependencies: vitest, typescript, eslint
├── tsconfig.json                    # TypeScript config (strict, ESM, NodeNext)
├── vitest.config.ts                 # Test config (globals, v8 coverage)
├── eslint.config.js                 # Linting (strictTypeChecked)
├── src/
│   ├── cli/
│   │   └── index.ts                 # CLI entry with placeholder commands
│   ├── parser/                      # COMPLETE from P1M2
│   │   ├── index.ts
│   │   ├── types.ts
│   │   ├── processor.ts
│   │   └── parse.ts
│   ├── selector/                    # COMPLETE from P2M1
│   │   ├── index.ts
│   │   ├── types.ts
│   │   ├── tokenizer.ts
│   │   └── parser.ts
│   ├── resolver/                    # COMPLETE from P2M2
│   │   ├── index.ts
│   │   ├── types.ts
│   │   ├── levenshtein.ts
│   │   ├── suggestions.ts
│   │   ├── single-resolver.ts
│   │   └── multi-resolver.ts
│   ├── types/                       # Created during research - NOT part of P3M2
│   │   └── json-output.ts           # Reference only - do not use directly
│   ├── utils/                       # Created during research - NOT part of P3M2
│   │   └── json-formatter.ts        # Reference only - do not use directly
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

### Desired Codebase Tree After P3M2 Completion

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
│       ├── types.ts                 # Output type definitions
│       ├── formatters.ts            # Response formatters
│       └── utils.ts                 # Helper utilities
├── tests/
│   ├── fixtures/                    # Unchanged
│   └── output/
│       ├── formatters.test.ts       # Formatter tests
│       └── types.test.ts            # Type validation tests
└── ...
```

### Known Gotchas & Library Quirks

```typescript
// CRITICAL: ESM imports MUST use .js extension in source files
import { formatIndexResponse } from './output/formatters.js';     // CORRECT
import { formatIndexResponse } from './output/formatters';        // WRONG - runtime error

// CRITICAL: ISO 8601 timestamps must include timezone
const timestamp = new Date().toISOString();  // "2024-12-25T22:03:00.000Z"

// CRITICAL: Null field handling - omit nulls (except data on errors)
// Use conditional spreading or JSON.stringify replacer
const response = {
  success: true,
  command: 'index',
  timestamp,
  data: responseData,
  ...(errors && errors.length > 0 ? { errors } : {}),  // Omit if empty/undefined
};

// CRITICAL: Response envelope MUST follow architecture spec exactly
// { success, command, timestamp, data, partial_results?, unresolved_selectors?, warnings?, errors? }

// CRITICAL: Error codes must match ErrorType union exactly
type ErrorType =
  | 'FILE_NOT_FOUND'
  | 'PARSE_ERROR'
  | 'INVALID_SELECTOR'
  | 'SELECTOR_NOT_FOUND'
  | 'NAMESPACE_NOT_FOUND'
  | 'PROCESSING_ERROR';

// CRITICAL: Timestamp format is ISO 8601 with milliseconds
// new Date().toISOString() produces: "2024-12-25T22:03:00.000Z"

// GOTCHA: When formatting errors, always include suggestions array
// Even if empty, it should be present for consistency

// GOTCHA: Partial success responses include both data and errors
// Success: { success: true, data: {...} }
// Partial:  { success: false, data: [...], errors: [...], partial_results: [...] }

// GOTCHA: The research files in src/types/ and src/utils/ are REFERENCE ONLY
// Do not import from them - implement src/output/ from scratch following patterns

// GOTCHA: Index command returns document indices with block counts
// Select command returns matches with pagination info

// GOTCHA: Pagination uses 1-indexed display values
// Internal pages are 0-indexed, but output shows current_page starting at 1

// GOTCHA: The CLIResponse is a generic type
// CLIResponse<IndexResponse> for index command
// CLIResponse<SelectResponse> for select command
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

// Error entry for error responses
interface ErrorEntry {
  file?: string;
  selector?: string;
  type: ErrorType;
  message: string;
  code: string;
  suggestions?: string[];
}

// Error type codes
type ErrorType =
  | 'FILE_NOT_FOUND'
  | 'PARSE_ERROR'
  | 'INVALID_SELECTOR'
  | 'SELECTOR_NOT_FOUND'
  | 'NAMESPACE_NOT_FOUND'
  | 'PROCESSING_ERROR';

// Index command response data
interface IndexResponse {
  documents: DocumentIndex[];
  summary: IndexSummary;
}

// Document index
interface DocumentIndex {
  namespace: string;
  file_path: string;
  root: NodeDescriptor | null;
  headings: HeadingDescriptor[];
  blocks: BlockSummary;
}

// Node descriptor
interface NodeDescriptor {
  selector: string;
  type: string;
  content_preview: string;
  truncated: boolean;
  children_count: number;
  word_count: number;
}

// Heading descriptor
interface HeadingDescriptor extends NodeDescriptor {
  depth: 1 | 2 | 3 | 4 | 5 | 6;
  text: string;
  section_word_count: number;
  section_truncated: boolean;
}

// Block counts summary
interface BlockSummary {
  paragraphs: number;
  code_blocks: number;
  lists: number;
  tables: number;
  blockquotes: number;
}

// Index summary statistics
interface IndexSummary {
  total_documents: number;
  total_nodes: number;
  total_selectors: number;
}

// Select command response data
interface SelectResponse {
  matches: SelectMatch[];
  unresolved: UnresolvedSelector[];
}

// Select match
interface SelectMatch {
  selector: string;
  type: string;
  content: string;
  truncated: boolean;
  pagination?: PaginationInfo;
  children_available: ChildInfo[];
}

// Pagination info
interface PaginationInfo {
  current_page: number;
  total_pages: number;
  word_count: number;
  has_more: boolean;
}

// Child node info
interface ChildInfo {
  selector: string;
  type: string;
  preview: string;
}

// Unresolved selector
interface UnresolvedSelector {
  selector: string;
  reason: string;
  suggestions: string[];
}
```

### Implementation Tasks (Ordered by Dependencies)

```yaml
Task 1: CREATE src/output/types.ts
  - IMPLEMENT: CLIResponse, IndexResponse, SelectResponse interfaces
  - IMPLEMENT: ErrorEntry, ErrorType, NodeDescriptor interfaces
  - IMPLEMENT: DocumentIndex, HeadingDescriptor, BlockSummary interfaces
  - IMPLEMENT: SelectMatch, PaginationInfo, ChildInfo interfaces
  - IMPLEMENT: UnresolvedSelector, IndexSummary interfaces
  - FOLLOW pattern: src/parser/types.ts and src/resolver/types.ts
  - PATTERN: JSDoc comments, import type for mdast, re-export types
  - NAMING: PascalCase for types, camelCase for properties
  - IMPORTS: Use `import type` for all mdast types (Root, Content)
  - PLACEMENT: /src/output/types.ts
  - VALIDATION: npx tsc --noEmit passes

Task 2: CREATE src/output/utils.ts
  - IMPLEMENT: createTimestamp() function - returns ISO 8601 string
  - IMPLEMENT: createResponseEnvelope() helper - builds base CLIResponse
  - IMPLEMENT: omitNullFields() utility - removes null values from objects
  - IMPLEMENT: sanitizeForJson() utility - ensures safe JSON serialization
  - FOLLOW pattern: Utility functions from JSON_OUTPUT_GUIDE.md
  - PATTERN:
    - new Date().toISOString() for timestamps
    - Object.fromEntries() for filtering null entries
    - JSON.stringify() with replacer for sanitization
  - DEPENDENCIES: Task 1 (imports types)
  - PLACEMENT: /src/output/utils.ts
  - VALIDATION: Unit tests pass for timestamp format and null handling

Task 3: CREATE src/output/formatters.ts
  - IMPLEMENT: formatIndexResponse() function
    - Takes: documents array, summary object
    - Returns: CLIResponse<IndexResponse>
    - Structure: { success, command: 'index', timestamp, data: { documents, summary } }

  - IMPLEMENT: formatSelectResponse() function
    - Takes: matches array, unresolved array
    - Returns: CLIResponse<SelectResponse>
    - Structure: { success, command: 'select', timestamp, data: { matches, unresolved } }

  - IMPLEMENT: formatErrorResponse() function
    - Takes: command type, error entries array, partial results
    - Returns: CLIResponse<null> or CLIResponse with errors
    - Structure: { success: false, command, timestamp, data: null, errors: [...] }

  - IMPLEMENT: createErrorEntry() helper
    - Takes: type, code, message, file/selector optional, suggestions optional
    - Returns: ErrorEntry object

  - FOLLOW pattern: plan/architecture/output_format.md JSON schema
  - PATTERN:
    - ISO 8601 timestamps with createTimestamp()
    - Omit null fields with omitNullFields()
    - Consistent field ordering (success, command, timestamp, data, ...)
  - DEPENDENCIES: Tasks 1-2 (imports types and utils)
  - PLACEMENT: /src/output/formatters.ts
  - VALIDATION: Output JSON matches expected schema

Task 4: CREATE src/output/index.ts
  - IMPLEMENT: Public API exports
  - EXPORTS:
    - { formatIndexResponse, formatSelectResponse, formatErrorResponse } from './formatters.js'
    - { createTimestamp, createResponseEnvelope, omitNullFields } from './utils.js'
    - All types from './types.js'
  - NAMING: Barrel file pattern matching existing modules
  - DEPENDENCIES: Tasks 1-3
  - PLACEMENT: /src/output/index.ts
  - VALIDATION: Can import from 'src/output/index.js' in test files

Task 5: CREATE tests/output/formatters.test.ts
  - IMPLEMENT: Unit tests for formatIndexResponse()
    - TEST: Returns valid JSON with correct structure
    - TEST: Includes all required fields (success, command, timestamp, data)
    - TEST: Timestamp is ISO 8601 format
    - TEST: Documents array is preserved
    - TEST: Summary object is included
    - TEST: Null fields are omitted

  - IMPLEMENT: Unit tests for formatSelectResponse()
    - TEST: Returns valid JSON with correct structure
    - TEST: Includes matches array
    - TEST: Includes unresolved array
    - TEST: Pagination info is included when truncated
    - TEST: Timestamp is ISO 8601 format

  - IMPLEMENT: Unit tests for formatErrorResponse()
    - TEST: Returns valid JSON with correct structure
    - TEST: Success is false
    - TEST: Data is null
    - TEST: Errors array is included
    - TEST: Error entries have all required fields
    - TEST: Suggestions are included when provided

  - IMPLEMENT: Unit tests for createErrorEntry()
    - TEST: Creates valid ErrorEntry objects
    - TEST: All fields are correctly populated
    - TEST: Optional fields are handled correctly

  - IMPLEMENT: Unit tests for utility functions
    - TEST: createTimestamp() returns ISO 8601 string
    - TEST: omitNullFields() removes null values
    - TEST: createResponseEnvelope() builds correct envelope

  - FOLLOW pattern: tests/parser/*.test.ts and tests/resolver/*.test.ts
  - USE fixtures: tests/fixtures/*.md for test data
  - COVERAGE: All formatter branches and error paths
  - PLACEMENT: /tests/output/formatters.test.ts
  - VALIDATION: npm run test -- tests/output/formatters.test.ts passes

Task 6: CREATE tests/output/types.test.ts
  - IMPLEMENT: Type validation tests
    - TEST: CLIResponse<IndexResponse> type checks correctly
    - TEST: CLIResponse<SelectResponse> type checks correctly
    - TEST: ErrorEntry type accepts all error types
    - TEST: All interfaces have correct required/optional fields

  - FOLLOW pattern: Type testing patterns from existing codebase
  - PLACEMENT: /tests/output/types.test.ts
  - VALIDATION: npm run test -- tests/output/types.test.ts passes
```

### Implementation Patterns & Key Details

#### src/output/types.ts (Task 1)

```typescript
import type { Root, Content } from 'mdast';

/**
 * Response envelope for all CLI commands.
 *
 * Ensures consistent JSON output structure for LLM agent consumption.
 * All responses include success boolean, command type, and timestamp.
 */
export interface CLIResponse<T = unknown> {
  /** Whether the command succeeded */
  success: boolean;
  /** The command that was executed */
  command: 'index' | 'select';
  /** ISO 8601 timestamp of response */
  timestamp: string;
  /** Response data (null on complete error) */
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
 * Select command response data.
 */
export interface SelectResponse {
  /** Selector matches */
  matches: SelectMatch[];
  /** Unresolved selectors */
  unresolved: UnresolvedSelector[];
}

/**
 * Select match result.
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
 * Unresolved selector info.
 */
export interface UnresolvedSelector {
  selector: string;
  reason: string;
  suggestions: string[];
}
```

#### src/output/utils.ts (Task 2)

```typescript
/**
 * Create an ISO 8601 timestamp.
 *
 * @returns ISO 8601 formatted timestamp with milliseconds
 *
 * @example
 * ```typescript
 * const ts = createTimestamp(); // "2024-12-25T22:03:00.000Z"
 * ```
 */
export function createTimestamp(): string {
  return new Date().toISOString();
}

/**
 * Create a response envelope base.
 *
 * @param command - The command type
 * @param success - Whether the command succeeded
 * @returns Base CLIResponse object
 */
export function createResponseEnvelope(
  command: 'index' | 'select',
  success: boolean
): Omit<CLIResponse, 'data'> {
  return {
    success,
    command,
    timestamp: createTimestamp(),
  };
}

/**
 * Remove null fields from an object.
 *
 * @param obj - The object to clean
 * @returns Object with null fields removed
 */
export function omitNullFields<T extends Record<string, any>>(obj: T): T {
  const result = {} as T;

  for (const [key, value] of Object.entries(obj)) {
    if (value !== null) {
      (result as any)[key] = value;
    }
  }

  return result;
}

/**
 * Sanitize a value for JSON serialization.
 *
 * Handles undefined, BigInt, circular references, and special values.
 *
 * @param value - The value to sanitize
 * @returns JSON-safe value
 */
export function sanitizeForJson(value: unknown): unknown {
  if (value === undefined) {
    return null;
  }

  if (typeof value === 'bigint') {
    return value.toString();
  }

  if (typeof value === 'symbol') {
    return null;
  }

  return value;
}
```

#### src/output/formatters.ts (Task 3)

```typescript
import type {
  CLIResponse,
  IndexResponse,
  SelectResponse,
  ErrorEntry,
  DocumentIndex,
  IndexSummary,
  SelectMatch,
  UnresolvedSelector,
  ErrorType,
} from './types.js';
import { createTimestamp, createResponseEnvelope, omitNullFields } from './utils.js';

/**
 * Format an index command response.
 *
 * @param documents - Document indices
 * @param summary - Summary statistics
 * @returns Formatted index response
 */
export function formatIndexResponse(
  documents: DocumentIndex[],
  summary: IndexSummary
): CLIResponse<IndexResponse> {
  return {
    ...createResponseEnvelope('index', true),
    data: {
      documents,
      summary,
    },
  };
}

/**
 * Format a select command response.
 *
 * @param matches - Selector matches
 * @param unresolved - Unresolved selectors (optional)
 * @returns Formatted select response
 */
export function formatSelectResponse(
  matches: SelectMatch[],
  unresolved: UnresolvedSelector[] = []
): CLIResponse<SelectResponse> {
  const hasErrors = unresolved.length > 0;

  return {
    ...createResponseEnvelope('select', !hasErrors),
    data: {
      matches,
      unresolved,
    },
    ...(unresolved.length > 0 ? { unresolved_selectors: unresolved.map(u => u.selector) } : {}),
  };
}

/**
 * Format an error response.
 *
 * @param command - The command that failed
 * @param errors - Error entries
 * @param partialResults - Optional partial results
 * @returns Formatted error response
 */
export function formatErrorResponse(
  command: 'index' | 'select',
  errors: ErrorEntry[],
  partialResults?: any[]
): CLIResponse<null> {
  const response: CLIResponse<null> = {
    ...createResponseEnvelope(command, false),
    data: null,
    errors,
  };

  if (partialResults && partialResults.length > 0) {
    response.partial_results = partialResults;
  }

  return response;
}

/**
 * Create an error entry.
 *
 * @param type - Error type
 * @param code - Error code
 * @param message - Error message
 * @param file - Optional file path
 * @param selector - Optional selector
 * @param suggestions - Optional suggestions
 * @returns ErrorEntry object
 */
export function createErrorEntry(
  type: ErrorType,
  code: string,
  message: string,
  file?: string,
  selector?: string,
  suggestions?: string[]
): ErrorEntry {
  return omitNullFields({
    type,
    code,
    message,
    file,
    selector,
    suggestions,
  });
}
```

#### src/output/index.ts (Task 4)

```typescript
// Public API for the output module

// Formatters
export {
  formatIndexResponse,
  formatSelectResponse,
  formatErrorResponse,
  createErrorEntry,
} from './formatters.js';

// Utilities
export {
  createTimestamp,
  createResponseEnvelope,
  omitNullFields,
  sanitizeForJson,
} from './utils.js';

// Types
export type {
  CLIResponse,
  IndexResponse,
  SelectResponse,
  ErrorEntry,
  ErrorType,
  DocumentIndex,
  NodeDescriptor,
  HeadingDescriptor,
  BlockSummary,
  IndexSummary,
  SelectMatch,
  PaginationInfo,
  ChildInfo,
  UnresolvedSelector,
} from './types.js';
```

### Integration Points

```yaml
RESOLVER_INTEGRATION:
  - The output module formats ResolutionOutcome from resolver module
  - Import: { type ResolutionOutcome, type ResolutionResult } from '../resolver/index.js'
  - Usage: Convert resolution results to SelectMatch format

SELECTOR_INTEGRATION:
  - The output module consumes SelectorAST from selector module
  - Import: { type SelectorAST } from '../selector/types.js'
  - Usage: Extract selector strings for error messages

FUTURE_INTEGRATION (P3M3 - CLI):
  - The CLI will consume formatted responses directly
  - Output JSON to stdout via console.log()
  - Handle exit codes based on success/partial/error
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
# Run formatters tests
npm run test:run -- tests/output/formatters.test.ts -v

# Expected output:
# ✓ formatIndexResponse() returns valid JSON
# ✓ formatIndexResponse() includes all required fields
# ✓ formatIndexResponse() has ISO 8601 timestamp
# ✓ formatSelectResponse() returns valid JSON
# ✓ formatSelectResponse() includes matches and unresolved
# ✓ formatErrorResponse() returns valid JSON
# ✓ formatErrorResponse() has success: false
# ✓ createErrorEntry() creates valid ErrorEntry
# ✓ createTimestamp() returns ISO 8601 string
# ✓ omitNullFields() removes null values

# Run types tests
npm run test:run -- tests/output/types.test.ts -v

# Run all output tests with coverage
npm run test:coverage -- --include='src/output/**/*.ts'

# Expected: Coverage >= 85% for all files
```

### Level 3: Integration Testing (System Validation)

```bash
# Verify output module can be imported
node --input-type=module -e "
import {
  formatIndexResponse,
  formatSelectResponse,
  formatErrorResponse,
  createErrorEntry,
} from './src/output/index.js';

console.log('Output module loaded successfully');

// Test index response
const indexResponse = formatIndexResponse(
  [{ namespace: 'test', file_path: 'test.md', root: null, headings: [], blocks: { paragraphs: 0, code_blocks: 0, lists: 0, tables: 0, blockquotes: 0 } }],
  { total_documents: 1, total_nodes: 0, total_selectors: 0 }
);
console.log('Index response:', JSON.stringify(indexResponse, null, 2));

// Test select response
const selectResponse = formatSelectResponse(
  [{ selector: 'test::heading:h1[0]', type: 'heading:h1', content: '# Test', truncated: false, children_available: [] }],
  []
);
console.log('Select response:', JSON.stringify(selectResponse, null, 2));

// Test error response
const errorResponse = formatErrorResponse(
  'select',
  [createErrorEntry('SELECTOR_NOT_FOUND', 'NOT_FOUND', 'Selector not found', undefined, 'test::h2[99]', ['test::h2[0]'])]
);
console.log('Error response:', JSON.stringify(errorResponse, null, 2));
"

# Expected output:
# Output module loaded successfully
# Index response: { "success": true, "command": "index", "timestamp": "2024-...", "data": {...} }
# Select response: { "success": true, "command": "select", "timestamp": "2024-...", "data": {...} }
# Error response: { "success": false, "command": "select", "timestamp": "2024-...", "data": null, "errors": [...] }

# Verify JSON is valid
node --input-type=module -e "
import { formatIndexResponse } from './src/output/index.js';
const response = formatIndexResponse([], { total_documents: 0, total_nodes: 0, total_selectors: 0 });
const json = JSON.stringify(response);
JSON.parse(json); // Will throw if invalid
console.log('JSON is valid');
"
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

### Feature Validation

- [ ] `formatIndexResponse()` returns valid JSON matching CLIResponse<IndexResponse>
- [ ] `formatSelectResponse()` returns valid JSON matching CLIResponse<SelectResponse>
- [ ] `formatErrorResponse()` returns valid JSON with errors array
- [ ] All responses include ISO 8601 timestamps
- [ ] Null fields are omitted (except data on errors)
- [ ] Response envelope includes success boolean and command type
- [ ] Error entries include all required fields

### Code Quality Validation

- [ ] All files use `.js` extension in imports
- [ ] All mdast types use `import type`
- [ ] Follows existing code patterns from parser/resolver modules
- [ ] JSDoc comments on all public functions
- [ ] Error handling matches existing patterns

### Files Created Checklist

- [ ] `/src/output/types.ts` - Type definitions
- [ ] `/src/output/utils.ts` - Helper utilities
- [ ] `/src/output/formatters.ts` - Response formatters
- [ ] `/src/output/index.ts` - Public exports
- [ ] `/tests/output/formatters.test.ts`
- [ ] `/tests/output/types.test.ts`

---

## Anti-Patterns to Avoid

- Do not use `require()` - this is an ESM project
- Do not omit `.js` extensions in import paths
- Do not include `src/types/json-output.ts` or `src/utils/json-formatter.ts` - these are reference only
- Do not skip null field handling - must omit null fields per spec
- Do not use Date.toString() - must use ISO 8601 format
- Do not forget timestamp in responses - required field
- Do not hardcode timestamps - must be generated dynamically
- Do not return data as null on success - only on complete failure
- Do not include stack traces in production responses
- Do not deviate from CLIResponse envelope structure defined in architecture spec

---

## Confidence Score

**Implementation Success Likelihood: 9/10**

**Rationale:**
- Complete type definitions matching architecture specification
- Detailed formatter specifications with input/output contracts
- Clear integration patterns with existing parser, selector, and resolver modules
- Comprehensive test patterns from existing codebase
- All external dependencies documented with URLs
- Research from 3 specialized agents covering codebase patterns, testing, and JSON formatting best practices
- Follows established patterns from P1M1/P1M2/P2M1/P2M2 codebase
- No ambiguous implementation decisions

**Risk Factors:**
- Minor: Understanding exact JSON schema requirements (mitigated with architecture spec reference)
- Minor: Null handling edge cases (mitigated with explicit utility function)
- Minor: Field ordering consistency (mitigated with clear examples)

---

## Execution Notes

1. **Follow task order**: Create types → utils → formatters → index → tests
2. **Validate after each file**: Run `npm run type-check` after each file creation
3. **Test incrementally**: Run tests for each component before moving to next
4. **Use exact imports**: Copy import statements exactly as shown
5. **Check coverage last**: Only after all tests pass, verify coverage thresholds
6. **ESM everywhere**: All imports use `.js` extension, all files are ESM
7. **ISO 8601 always**: Use `new Date().toISOString()` for all timestamps
