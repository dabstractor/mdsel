---
name: "P4.M1.T1: Edge Cases & Hardening - Handle Edge Cases"
description: |

## Goal

**Feature Goal**: Implement robust edge case handling for empty/malformed files, repeated heading titles, and deeply nested sections to ensure the mdsel CLI tool handles unusual inputs gracefully without crashes or data loss.

**Deliverable**: Enhanced error handling and input validation across parser, selector, resolver, and output modules with comprehensive test coverage for all identified edge cases.

**Success Definition**:
- All empty, malformed, and unusual file inputs return specific error messages with helpful suggestions
- Repeated heading titles resolve correctly using position-based indexing
- Deeply nested sections (beyond 20 levels) are rejected with clear error messages
- All edge case scenarios have corresponding test coverage
- Existing functionality remains unaffected (backward compatibility)

## User Persona

**Target User**: Developers and technical writers using the mdsel CLI tool to select and extract content from markdown documents.

**Use Case**: Users may encounter:
- Empty or corrupted markdown files
- Documents with repeated heading names
- Deeply nested documentation structures
- Files with encoding issues or binary content
- Extreme edge cases from automated generation tools

**User Journey**:
1. User runs `mdsel select` on a problematic file
2. Tool detects the edge case immediately
3. User receives clear, actionable error message with suggestions
4. User can either fix the issue or understand why selection failed

**Pain Points Addressed**:
- Cryptic error messages from low-level libraries
- Silent failures that produce incorrect output
- Crashes on unusual but valid inputs
- No guidance on how to fix input issues

## Why

- **Reliability**: CLI tools must handle real-world messy inputs gracefully
- **User Experience**: Clear error messages reduce frustration and support burden
- **Data Integrity**: Prevent silent failures that could corrupt output
- **Robustness**: Defense against malicious or malformed inputs
- **Integration**: Ensures tool works in automated pipelines with varied inputs

## What

Implement comprehensive edge case handling across three categories:

### 1. Empty and Malformed Files
- Detect binary files masquerading as markdown
- Validate UTF-8 encoding with clear error messages
- Handle empty and whitespace-only files gracefully
- Add file size limits to prevent memory exhaustion

### 2. Repeated Heading Titles
- Validate position-based indexing works correctly for duplicate titles
- Ensure ordinal selection resolves properly at same/different levels
- Test deep nesting with identical heading names

### 3. Deeply Nested Sections
- Add maximum depth validation (configurable, default 20 levels)
- Prevent stack overflow from extreme nesting
- Provide clear error messages when depth limits exceeded

### Success Criteria

- [ ] Empty files return empty AST without errors
- [ ] Binary files are detected and rejected with `BINARY_FILE` error code
- [ ] UTF-8 encoding errors produce `ENCODING_ERROR` with file path
- [ ] Repeated headings resolve using correct ordinal positions
- [ ] Nesting depth > 20 throws `DEPTH_EXCEEDED` error
- [ ] All edge cases have corresponding test coverage
- [ ] All existing tests pass without modification

## All Needed Context

### Context Completeness Check

**No Prior Knowledge Test**: Someone unfamiliar with this codebase would know:
- Exact file paths to modify for each edge case type
- Existing error class patterns to follow
- Test fixture locations and patterns to use
- Validation command sequences to verify implementation
- Specific line numbers of code to reference

### Documentation & References

```yaml
# MUST READ - Edge Case Research Documentation
- file: /home/dustin/projects/mdsel/MARKDOWN_PARSING_EDGE_CASES.md
  why: Comprehensive research on markdown parsing edge cases including binary files, UTF-8 encoding, empty files, deep nesting, and platform-specific issues
  critical: Contains specific implementation recommendations for binary detection, UTF-8 validation, and depth limits
  section: Category 1 (Empty/Malformed Files), Category 3 (Large Files), Implementation Recommendations

- file: /home/dustin/projects/mdsel/SELECTOR_RESOLUTION_EDGE_CASES.md
  why: Detailed analysis of selector resolution edge cases including repeated headings, deep nesting, and boundary conditions
  critical: Identifies that repeated headings are already handled correctly but depth validation is missing
  section: Category 1 (Repeated Headings), Category 2 (Deeply Nested Sections), Recommendations

- file: /home/dustin/projects/mdsel/src/parser/parse.ts
  why: Main parsing entry point where file reading and validation occurs
  pattern: Follow existing error handling pattern (lines 42-55) for new error types
  gotcha: Must maintain backward compatibility with existing ParseResult interface

- file: /home/dustin/projects/mdsel/src/parser/types.ts
  why: Contains ParserError class and ParserErrorCode type that need extension
  pattern: Extend ParserErrorCode union type (line 43) with new error codes
  gotcha: Error.captureStackTrace pattern (line 58) must be preserved for proper stack traces

- file: /home/dustin/projects/mdsel/src/selector/parser.ts
  why: Selector parser with existing validation patterns for empty input, invalid indices
  pattern: Follow SelectorParseError pattern (lines 36-42) for new selector validations
  gotcha: Parser validates at parse time, not resolution time

- file: /home/dustin/projects/mdsel/src/resolver/single-resolver.ts
  why: Core resolver where depth validation and repeated heading handling occurs
  pattern: Use existing index validation pattern (lines 189-197) for new depth checks
  gotcha: Iterative traversal prevents stack overflow but depth limits still needed for performance

- file: /home/dustin/projects/mdsel/tests/parser/parse.test.ts
  why: Existing parser test patterns to follow for new edge case tests
  pattern: Use describe/it structure with arrange-act-assert implicit
  gotcha: Tests use actual fixture files in tests/fixtures/ directory

- file: /home/dustin/projects/mdsel/tests/selector/parser.test.ts
  why: Selector parser edge case test patterns
  pattern: Edge case tests grouped in 'edge cases' describe block
  gotcha: Error testing uses try/catch with expect.fail pattern

- file: /home/dustin/projects/mdsel/tests/fixtures/empty.md
  why: Empty file fixture exists and should pass after changes
  pattern: Use this fixture as baseline for empty file handling
```

### Current Codebase Tree

```bash
mdsel/
├── src/
│   ├── parser/
│   │   ├── parse.ts              # MODIFY: Add binary detection, UTF-8 validation
│   │   ├── processor.ts          # MODIFY: Add depth limit middleware
│   │   └── types.ts              # MODIFY: Extend ParserErrorCode
│   ├── selector/
│   │   ├── parser.ts             # MODIFY: Add depth validation to selector grammar
│   │   └── types.ts              # REFERENCE: SelectorParseError pattern
│   ├── resolver/
│   │   ├── single-resolver.ts    # MODIFY: Add depth limit checking
│   │   ├── multi-resolver.ts     # MODIFY: Add depth limit checking
│   │   └── types.ts              # REFERENCE: ResolutionError patterns
│   └── utils/
│       └── validation.ts         # CREATE: New validation utilities
├── tests/
│   ├── fixtures/
│   │   ├── empty.md              # REFERENCE: Empty file fixture
│   │   ├── simple.md             # REFERENCE: Simple structure fixture
│   │   └── complex.md            # REFERENCE: Complex structure fixture
│   ├── parser/
│   │   └── parse.test.ts         # MODIFY: Add edge case tests
│   ├── selector/
│   │   └── parser.test.ts        # MODIFY: Add depth validation tests
│   └── resolver/
│       ├── single-resolver.test.ts  # MODIFY: Add depth/repeated heading tests
│       └── multi-resolver.test.ts   # MODIFY: Add depth tests
└── plan/
    └── P4M1T1/
        ├── PRP.md                # THIS DOCUMENT
        └── research/             # Store additional research here
```

### Desired Codebase Tree with Files to be Added

```bash
# NEW FILES TO CREATE
├── src/utils/
│   └── validation.ts             # CREATE: Binary detection, UTF-8 validation utilities
├── tests/fixtures/
│   ├── binary.md                 # CREATE: Binary file test fixture
│   ├── deep-nested.md            # CREATE: Deep nesting fixture (>20 levels)
│   └── repeated-headings.md      # CREATE: Repeated heading fixture
└── tests/edge-cases/             # CREATE: New directory for edge case tests
    ├── binary-files.test.ts      # CREATE: Binary file detection tests
    ├── encoding.test.ts          # CREATE: UTF-8 encoding tests
    ├── depth-limits.test.ts      # CREATE: Deep nesting tests
    └── repeated-headings.test.ts # CREATE: Repeated heading tests
```

### Known Gotchas of Our Codebase & Library Quirks

```typescript
// CRITICAL: remark library handles empty files gracefully
// Empty string creates: { type: 'root', children: [] }
// Do NOT throw errors for empty files - this is expected behavior

// CRITICAL: Node.js readFile with 'utf-8' may throw on invalid UTF-8
// Error code 'ERR_INVALID_CHAR' indicates encoding issues
// Must catch and convert to ParserError for consistency

// CRITICAL: Selector parser validates indices at parse time (line 186-188 in parser.ts)
// Negative indices are rejected before resolution
// This design should be followed for depth limits

// CRITICAL: Iterative traversal in single-resolver.ts prevents stack overflow
// But no depth limit exists - could cause performance issues
// Add depth counter in resolvePathSegments function

// CRITICAL: ParserError uses Error.captureStackTrace (line 58 in types.ts)
// This is V8-specific but works in Node.js
// Must call in constructor for proper stack traces

// CRITICAL: Test fixtures are actual files, not strings
// Use join(__dirname, '../fixtures/file.md') pattern
// Tests read from files system, not inline strings

// CRITICAL: Selector resolution uses 0-based indexing only
// No negative indices (CSS-like from-end selection)
// Index validation: segment.index >= matches.length

// CRITICAL: Namespace derived from file basename without extension
// Special characters in filenames affect namespace matching
// No Unicode normalization currently applied
```

## Implementation Blueprint

### Data Models and Structure

```typescript
// Extend ParserErrorCode in src/parser/types.ts
export type ParserErrorCode =
  | 'FILE_NOT_FOUND'
  | 'FILE_READ_ERROR'
  | 'PARSE_ERROR'
  | 'BINARY_FILE'      // NEW: Binary content detected
  | 'ENCODING_ERROR'   // NEW: Invalid UTF-8 encoding
  | 'DEPTH_EXCEEDED'   // NEW: Maximum nesting depth exceeded
  | 'FILE_TOO_LARGE';  // NEW: File size exceeds limit

// Extend ParserError class in src/parser/types.ts
export class ParserError extends Error {
  public readonly code: ParserErrorCode;
  public readonly filePath?: string;
  public readonly line?: number;     // NEW: Optional line number
  public readonly column?: number;   // NEW: Optional column number

  constructor(
    code: ParserErrorCode,
    message: string,
    filePath?: string,
    line?: number,      // NEW: For position-specific errors
    column?: number     // NEW: For position-specific errors
  ) {
    super(message);
    this.name = 'ParserError';
    this.code = code;
    this.filePath = filePath;
    this.line = line;
    this.column = column;
    Error.captureStackTrace(this, ParserError);
  }
}

// Add to src/parser/types.ts
export interface ParserOptions {
  gfm?: boolean;
  maxDepth?: number;    // NEW: Maximum nesting depth (default: 20)
  maxFileSize?: number; // NEW: Maximum file size in bytes (default: 50MB)
}

// Validation utilities in src/utils/validation.ts
export function isLikelyBinary(content: string, sampleSize = 1024): boolean;
export function isValidUtf8(buffer: Buffer): boolean;
export function getNestingDepth(ast: Root): number;
```

### Implementation Tasks (ordered by dependencies)

```yaml
Task 1: CREATE src/utils/validation.ts
  - IMPLEMENT: isLikelyBinary() function for binary content detection
  - IMPLEMENT: isValidUtf8() function for UTF-8 validation
  - IMPLEMENT: getNestingDepth() function for depth calculation
  - IMPLEMENT: sanitizeInput() function for input normalization
  - NAMING: camelCase function names, exported for module use
  - DEPENDENCIES: mdast types from 'mdast'
  - PLACEMENT: Utility layer in src/utils/

Task 2: MODIFY src/parser/types.ts
  - EXTEND: ParserErrorCode union type with new error codes
  - EXTEND: ParserError constructor with line, column parameters
  - EXTEND: ParserOptions interface with maxDepth, maxFileSize options
  - PRESERVE: Existing Error.captureStackTrace pattern
  - PRESERVE: All existing error codes for backward compatibility
  - PLACEMENT: Type definitions in src/parser/

Task 3: MODIFY src/parser/parse.ts
  - IMPLEMENT: Binary detection in parseFile() using isLikelyBinary()
  - IMPLEMENT: UTF-8 validation in parseFile() using isValidUtf8()
  - IMPLEMENT: File size limit check in parseFile()
  - IMPLEMENT: Line ending normalization (CRLF -> LF)
  - FOLLOW pattern: Existing error handling (lines 42-55)
  - NAMING: Throw ParserError with new error codes
  - PLACEMENT: Add validation after readFile(), before parseMarkdown()
  - GOTCHA: Must handle both Error and unknown types in catch blocks

Task 4: MODIFY src/parser/processor.ts
  - IMPLEMENT: Depth limit validation middleware
  - IMPLEMENT: Performance monitoring for slow parses
  - USE: remark-parse plugin system with visit() function
  - REFERENCE: MARKDOWN_PARSING_EDGE_CASES.md "Implementation Recommendations"
  - PLACEMENT: Add plugin after remarkGfm, before export
  - DEPENDENCIES: Task 1 (getNestingDepth), Task 2 (ParserOptions)

Task 5: MODIFY src/resolver/single-resolver.ts
  - IMPLEMENT: Depth counter in resolvePathSegments() function
  - IMPLEMENT: Depth limit check before each segment resolution
  - IMPLEMENT: Return DEPTH_EXCEEDED error when limit exceeded
  - FOLLOW pattern: Existing index validation (lines 189-197)
  - PLACEMENT: Add depth tracking at start of for loop (line 145)
  - DEPENDENCIES: Task 2 (ParserOptions for maxDepth)

Task 6: MODIFY src/resolver/multi-resolver.ts
  - IMPLEMENT: Pass maxDepth option to resolveSingle() calls
  - IMPLEMENT: Depth validation across all documents
  - FOLLOW pattern: single-resolver.ts implementation
  - PLACEMENT: Add depth parameter to resolveMulti() signature
  - DEPENDENCIES: Task 5

Task 7: CREATE tests/fixtures/edge-cases/
  - CREATE: binary.md - File with binary content (PNG header bytes)
  - CREATE: deep-nested.md - Markdown with >20 heading levels
  - CREATE: repeated-headings.md - Same heading text at multiple levels
  - CREATE: invalid-utf8.md - File with invalid UTF-8 sequences
  - NAMING: lowercase with hyphens
  - PLACEMENT: tests/fixtures/edge-cases/

Task 8: CREATE tests/edge-cases/binary-files.test.ts
  - IMPLEMENT: Test binary file detection throws BINARY_FILE error
  - IMPLEMENT: Test empty file handling returns empty AST
  - IMPLEMENT: Test whitespace-only file handling
  - FOLLOW pattern: tests/parser/parse.test.ts structure
  - NAMING: describe('Binary File Detection') with specific it() blocks
  - COVERAGE: All binary detection edge cases

Task 9: CREATE tests/edge-cases/encoding.test.ts
  - IMPLEMENT: Test UTF-8 validation detects invalid sequences
  - IMPLEMENT: Test encoding error includes file path
  - IMPLEMENT: Test valid UTF-8 files parse correctly
  - IMPLEMENT: Test Unicode/emoji in headings parse correctly
  - FOLLOW pattern: Try/catch with expect.fail for error tests
  - COVERAGE: All encoding edge cases

Task 10: CREATE tests/edge-cases/depth-limits.test.ts
  - IMPLEMENT: Test depth > 20 throws DEPTH_EXCEEDED error
  - IMPLEMENT: Test depth = 20 resolves successfully
  - IMPLEMENT: Test maxDepth option overrides default
  - IMPLEMENT: Test repeated headings at various depths
  - USE: Deep nested fixture from Task 7
  - COVERAGE: All depth-related edge cases

Task 11: CREATE tests/edge-cases/repeated-headings.test.ts
  - IMPLEMENT: Test same heading text at same level uses ordinal position
  - IMPLEMENT: Test same heading text at different levels resolves correctly
  - IMPLEMENT: Test deep nesting with identical titles
  - USE: Repeated headings fixture from Task 7
  - COVERAGE: All repeated heading scenarios

Task 12: MODIFY existing test files
  - UPDATE: tests/parser/parse.test.ts - Add edge case test references
  - UPDATE: tests/resolver/single-resolver.test.ts - Add depth test references
  - PRESERVE: All existing test cases
  - ENSURE: All existing tests still pass
```

### Implementation Patterns & Key Details

```typescript
// Pattern 1: Binary Detection (Task 1, Task 3)
// Location: src/utils/validation.ts, src/parser/parse.ts

// In validation.ts:
export function isLikelyBinary(content: string, sampleSize = 1024): boolean {
  const sample = content.slice(0, sampleSize);
  const nullCount = (sample.match(/\0/g) || []).length;
  // CRITICAL: More than 10% null bytes indicates binary content
  return nullCount / sample.length > 0.1;
}

// In parse.ts:
import { isLikelyBinary } from '../utils/validation.js';

export async function parseFile(filePath: string, options?: ParserOptions): Promise<ParseResult> {
  // ... existing file access check ...

  let content: string;
  try {
    const buffer = await readFile(filePath);
    content = buffer.toString('utf-8');

    // GOTCHA: Check binary content BEFORE UTF-8 validation
    if (isLikelyBinary(content)) {
      throw new ParserError('BINARY_FILE', 'File appears to be binary content', filePath);
    }

    // GOTCHA: Validate UTF-8 after converting from buffer
    if (!isValidUtf8(buffer)) {
      throw new ParserError('ENCODING_ERROR', 'File contains invalid UTF-8 bytes', filePath);
    }
  } catch (error) {
    // ... existing error handling ...
  }
}

// Pattern 2: UTF-8 Validation (Task 1, Task 3)
// Location: src/utils/validation.ts

export function isValidUtf8(buffer: Buffer): boolean {
  try {
    buffer.toString('utf-8');
    return true;
  } catch {
    return false;
  }
}

// Pattern 3: Depth Validation (Task 4, Task 5)
// Location: src/parser/processor.ts, src/resolver/single-resolver.ts

// In processor.ts - add middleware plugin:
import { visit } from 'unist-util-visit';

function createProcessor(options: ParserOptions = {}) {
  const maxDepth = options.maxDepth ?? 20;

  const processor = unified()
    .use(remarkParse)
    .use(remarkGfm)
    .use(() => {
      return (tree) => {
        // GOTCHA: Check depth during tree traversal, not parsing
        let maxActualDepth = 0;
        visit(tree, (node) => {
          maxActualDepth = Math.max(maxActualDepth, getDepth(node));
        });

        if (maxActualDepth > maxDepth) {
          throw new ParserError(
            'DEPTH_EXCEEDED',
            `Maximum nesting depth of ${maxDepth} exceeded (found ${maxActualDepth})`
          );
        }
      };
    });

  return processor;
}

// In single-resolver.ts - add depth counter:
function resolvePathSegments(
  context: ResolutionContext,
  segments: PathSegmentNode[]
): SegmentResolutionOutcome {
  let currentNode = context.currentNode;
  const path = [...context.path];
  const partialResults: ResolutionResult[] = [];
  const maxDepth = 20; // TODO: Make configurable

  for (let i = 0; i < segments.length; i++) {
    const segment = segments[i];

    // NEW: Check depth before processing segment
    if (i >= maxDepth) {
      return {
        success: false,
        errorType: 'DEPTH_EXCEEDED',
        errorMessage: `Selector depth ${i + 1} exceeds maximum of ${maxDepth}`,
        failedAtSegment: i,
        partialResults
      };
    }

    // ... rest of resolution logic ...
  }
}

// Pattern 4: Error Handling with Position (Task 2, Task 3)
// Location: src/parser/types.ts, src/parser/parse.ts

// In types.ts - extended ParserError:
export class ParserError extends Error {
  public readonly code: ParserErrorCode;
  public readonly filePath?: string;
  public readonly line?: number;
  public readonly column?: number;

  constructor(
    code: ParserErrorCode,
    message: string,
    filePath?: string,
    line?: number,
    column?: number
  ) {
    super(message);
    this.name = 'ParserError';
    this.code = code;
    this.filePath = filePath;
    this.line = line;
    this.column = column;
    // CRITICAL: Must call Error.captureStackTrace for proper stack traces
    Error.captureStackTrace(this, ParserError);
  }
}

// Pattern 5: Test Structure for Edge Cases (Task 8-11)
// Location: tests/edge-cases/*.test.ts

import { describe, it, expect } from 'vitest';
import { parseFile } from '../../src/parser/parse.js';
import { ParserError } from '../../src/parser/types.js';
import { join } from 'node:path';

describe('Binary File Detection', () => {
  const FIXTURES_DIR = join(__dirname, '../fixtures/edge-cases');

  it('should detect and reject binary files', async () => {
    const binaryFile = join(FIXTURES_DIR, 'binary.md');

    try {
      await parseFile(binaryFile);
      expect.fail('Should have thrown ParserError');
    } catch (error) {
      expect(error).toBeInstanceOf(ParserError);
      expect((error as ParserError).code).toBe('BINARY_FILE');
    }
  });

  it('should handle empty files gracefully', () => {
    const result = parseMarkdown('');
    expect(result.ast.children).toHaveLength(0);
  });

  it('should handle whitespace-only files', () => {
    const result = parseMarkdown('   \n\n  \t  \n');
    expect(result.ast.children).toHaveLength(0);
  });
});

// Pattern 6: Line Ending Normalization (Task 3)
// Location: src/parser/parse.ts

export async function parseFile(filePath: string, options?: ParserOptions): Promise<ParseResult> {
  // ... file reading logic ...

  // GOTCHA: Normalize line endings AFTER reading, BEFORE parsing
  content = content.replace(/\r\n?/g, '\n');

  const result = parseMarkdown(content, options);
  return { ...result, filePath };
}
```

### Integration Points

```yaml
PARSER_MODULE:
  - file: src/parser/parse.ts
  - changes: Add validation chain (binary -> UTF-8 -> size -> parse)
  - pattern: "Validate early, parse late"
  - integration: Imports from src/utils/validation.ts

RESOLVER_MODULE:
  - file: src/resolver/single-resolver.ts
  - changes: Add depth checking in resolvePathSegments()
  - pattern: "Fail fast on depth exceeded"
  - integration: Uses ParserOptions.maxDepth if provided

OPTIONS_INTERFACE:
  - file: src/parser/types.ts
  - changes: Extend ParserOptions interface
  - pattern: "Optional with sensible defaults"
  - default: maxDepth: 20, maxFileSize: 52428800 (50MB)

TEST_SUITE:
  - files: tests/edge-cases/*.test.ts
  - pattern: "Group by edge case category"
  - fixtures: tests/fixtures/edge-cases/*.md
  - integration: Vitest framework with global describe/it/expect
```

## Validation Loop

### Level 1: Syntax & Style (Immediate Feedback)

```bash
# Run after each file creation - fix before proceeding
npx tsc --noEmit                # TypeScript type checking
npx eslint src/utils/validation.ts --fix  # Lint new file
npx eslint src/parser/*.ts --fix          # Lint modified parser files
npx eslint src/resolver/*.ts --fix        # Lint modified resolver files
npx prettier --write src/utils/validation.ts  # Format new file

# Project-wide validation after all changes
npm run lint                    # Runs eslint on all files
npm run format                  # Runs prettier on all files
npm run typecheck               # Runs tsc --noEmit

# Expected: Zero errors. If errors exist, READ output and fix before proceeding.
```

### Level 2: Unit Tests (Component Validation)

```bash
# Test new validation utilities
npm test -- src/utils/validation.test.ts

# Test parser edge cases
npm test -- tests/parser/parse.test.ts

# Test resolver edge cases
npm test -- tests/resolver/single-resolver.test.ts
npm test -- tests/resolver/multi-resolver.test.ts

# Test all edge case suites
npm test -- tests/edge-cases/

# Full test suite validation
npm test                        # Run all tests

# Coverage validation
npm run test:coverage           # Generate coverage report

# Expected: All tests pass. If failing, debug root cause and fix implementation.
```

### Level 3: Integration Testing (System Validation)

```bash
# Test binary file rejection
echo -e '\x89\x50\x4e\x47\x0d\x0a\x1a\x0a' > /tmp/test.md
npm run build && node dist/cli.js select /tmp/test.md "heading:h1[0]"
# Expected: Error message "File appears to be binary content"

# Test empty file handling
touch /tmp/empty.md
npm run build && node dist/cli.js select /tmp/empty.md "root"
# Expected: Successful result with empty content

# Test UTF-8 error detection
echo -e '\xff\xfe Hello' > /tmp/invalid.md
npm run build && node dist/cli.js select /tmp/invalid.md "root"
# Expected: Error message "File contains invalid UTF-8 bytes"

# Test depth limit with actual fixture
npm run build && node dist/cli.js select tests/fixtures/edge-cases/deep-nested.md "heading:h1[0]"
# Expected: Error message about depth exceeded

# Test repeated headings
npm run build && node dist/cli.js select tests/fixtures/edge-cases/repeated-headings.md "heading:h2[1]"
# Expected: Successfully resolves to second h2 heading

# Expected: All integration tests produce expected output with clear error messages.
```

### Level 4: Creative & Domain-Specific Validation

```bash
# Edge Case Stress Testing

# 1. Generate and test extremely large selector chains
# Create selector with 100 segments
node -e "
  const selector = Array(100).fill('heading:h1[0]').join('/');
  console.log(selector);
" | xargs -I {} npm run build && node dist/cli.js select tests/fixtures/simple.md {}

# 2. Test with various file encodings
# ISO-8859-1 file
iconv -f ISO-8859-1 -t UTF-8 tests/fixtures/iso-file.txt > /tmp/test.md
npm run build && node dist/cli.js select /tmp/test.md "heading:h1[0]"

# 3. Test with files at exactly size limits
# Create 50MB file (default limit)
dd if=/dev/zero bs=1M count=50 2>/dev/null | tr '\0' ' ' > /tmp/large.md
echo '# Title' >> /tmp/large.md
npm run build && node dist/cli.js select /tmp/large.md "heading:h1[0]"

# 4. Test concurrent file processing
for i in {1..10}; do
  npm run build && node dist/cli.js select tests/fixtures/simple.md "heading:h1[0]" &
done
wait

# 5. Test real-world edge cases from documentation
# Wikipedia markdown exports, Jupyter notebook markdowns, etc.
wget -qO- https://raw.githubusercontent.com/github/docs/main/content/index.md | \
  npm run build && node dist/cli.js select /dev/stdin "heading:h1[0]"

# Expected: All stress tests handle gracefully without crashes or hangs.
```

## Final Validation Checklist

### Technical Validation

- [ ] All 4 validation levels completed successfully
- [ ] All tests pass: `npm test`
- [ ] No linting errors: `npm run lint`
- [ ] No type errors: `npm run typecheck`
- [ ] No formatting issues: `npm run format -- --check`
- [ ] Coverage report shows >90% for new code

### Feature Validation

- [ ] Empty files return empty AST without errors
- [ ] Binary files throw BINARY_FILE error with file path
- [ ] UTF-8 encoding errors throw ENCODING_ERROR with file path
- [ ] Files exceeding size limit throw FILE_TOO_LARGE error
- [ ] Depth > 20 throws DEPTH_EXCEEDED error with current depth
- [ ] Repeated headings resolve using correct ordinal positions
- [ ] Same heading at different levels resolves independently
- [ ] Line endings normalized (CRLF -> LF)
- [ ] All existing tests pass without modification

### Code Quality Validation

- [ ] Follows existing ParserError pattern (Error.captureStackTrace)
- [ ] File placement matches desired codebase tree structure
- [ ] Error codes follow {CONTEXT}_{ERROR_TYPE} naming convention
- [ ] New utilities in src/utils/ directory
- [ ] Test fixtures in tests/fixtures/edge-cases/
- [ ] Test files in tests/edge-cases/ directory
- [ ] All public functions have JSDoc comments
- [ ] No console.log statements (use proper logging)

### Documentation & Deployment

- [ ] JSDoc comments on all new public functions
- [ ] Error messages include file paths when applicable
- [ ] Error messages include line/column when available
- [ ] New error codes documented in types.ts
- [ ] Test fixtures documented with comments explaining edge case
- [ ] MAX_DEPTH constant exported for user configuration
- [ ] MAX_FILE_SIZE constant exported for user configuration

---

## Anti-Patterns to Avoid

- [ ] Don't throw errors for empty files - return empty AST (existing behavior)
- [ ] Don't use sync file operations - always use async await
- [ ] Don't skip Error.captureStackTrace - required for proper stack traces
- [ ] Don't modify existing error codes - only add new ones
- [ ] Don't break existing tests - all must pass after changes
- [ ] Don't use console.error for errors - throw typed errors
- [ ] Don't validate indices at resolution time - parser already does this
- [ ] Don't add depth limits to parser - resolver handles traversal depth
- [ ] Don't hardcode limits - use options with sensible defaults
- [ ] Don't forget to normalize line endings BEFORE parsing
- [ ] Don't use regex for binary detection - use null byte ratio
- [ ] Don't validate UTF-8 on string - validate on Buffer before conversion
- [ ] Don't mix validation concerns - binary detection separate from encoding
- [ ] Don't create circular dependencies - utils depends on types only
- [ ] Don't test with strings - use actual fixture files
