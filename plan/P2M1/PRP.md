# PRP: P2M1 - Selector Parser

**Phase 2, Milestone 1 - Selector Parser for mdsel CLI**

---

## Goal

**Feature Goal**: Implement a selector parser that tokenizes and parses selector strings into an Abstract Syntax Tree (AST), enabling validation and interpretation of the custom selector grammar for Markdown semantic selection.

**Deliverable**: A `src/selector/` module containing:
- Token type definitions and interfaces for the selector AST
- A tokenizer (lexer) that converts selector strings to tokens
- A recursive descent parser that builds an AST from tokens
- Selector validation with detailed error reporting
- Comprehensive test suite covering all grammar rules and edge cases

**Success Definition**: Running `npm run test` passes all selector parser tests with 90%+ coverage, and the parser correctly:
- Tokenizes all valid selector syntax (namespaces, paths, indices, query params)
- Parses selectors into a valid AST structure
- Validates selector grammar (heading levels h1-h6, valid block types, proper indices)
- Provides detailed error messages with position information for invalid selectors
- Handles all edge cases (empty selectors, trailing slashes, malformed brackets)

---

## Why

- **Foundation for Selector Resolution**: The parser is the entry point for all selector operations - the Selector Engine (P2M2) will use the parsed AST to resolve selectors against semantic trees
- **Validation Before Processing**: Early error detection prevents invalid selectors from reaching downstream components
- **Type Safety**: Strongly typed AST ensures correct manipulation throughout the codebase
- **Error Quality**: Position-aware error messages help users correct selector syntax quickly
- **Grammar Enforcement**: Centralizes grammar rules in one place, making future extensions easier

---

## What

Create the Selector Parser infrastructure:

1. **Token Type Definitions** - TokenType enum, Token interface, Position tracking
2. **Tokenizer (Lexer)** - Character-by-character scanning with multi-character token handling
3. **AST Node Types** - SelectorAST, PathSegment, QueryParam interfaces
4. **Recursive Descent Parser** - One function per grammar rule
5. **Validation Layer** - Grammar constraints (heading levels, block types, index ranges)
6. **Test Suite** - Unit tests for tokenizer, parser, validation, and edge cases

### Success Criteria

- [ ] `tokenize()` returns correct token array for all selector syntax
- [ ] `parseSelector()` returns valid SelectorAST for all valid selectors
- [ ] Parser rejects invalid heading levels (h7, h0, h-1)
- [ ] Parser rejects invalid block types
- [ ] Error messages include position (line, column, offset)
- [ ] Parser handles empty input gracefully
- [ ] Parser handles unclosed brackets with specific error
- [ ] Test coverage >= 90% for selector module
- [ ] All ESLint and TypeScript checks pass

---

## All Needed Context

### Context Completeness Check

_"If someone knew nothing about this codebase, would they have everything needed to implement this successfully?"_ - **YES**, this PRP contains complete grammar specification, token definitions, implementation patterns, validation commands, and references to all necessary documentation.

### Documentation & References

```yaml
# MUST READ - Architecture Documentation (in codebase)
- file: plan/architecture/selector_grammar.md
  why: Complete EBNF grammar specification with examples
  pattern: selector = [namespace "::"] path ["?" query_params]
  gotcha: Section and Page are virtual nodes not parsed in this milestone

- file: plan/architecture/system_context.md
  why: Node type mapping and selector format conventions
  pattern: 0-based indexing, namespace::path format
  gotcha: Index is 0-based, not 1-based

- file: plan/architecture/output_format.md
  why: Error response format for selector validation
  pattern: ErrorEntry with type, message, code, suggestions
  gotcha: Must include position information in errors

# MUST READ - Existing Codebase Patterns
- file: src/parser/types.ts
  why: Parser error pattern (ParserError extends Error)
  pattern: Custom error class with code property, Error.captureStackTrace
  gotcha: Use import type for mdast types to avoid bundle bloat

- file: tests/parser/parse.test.ts
  why: Test patterns for parser testing in this codebase
  pattern: describe/it from Vitest globals, expect().toThrow()
  gotcha: Use join() with import.meta.dirname for fixture paths

- file: tests/parser/processor.test.ts
  why: Test organization patterns
  pattern: Group by valid input vs error cases
  gotcha: Test each error case separately with specific error type

# External Research References (from research agents)
- url: https://github.com/postcss/postcss-selector-parser
  why: Excellent example of selector parser with error reporting
  critical: Position tracking, source mapping for errors
  pattern: Separate tokenizer, then parser consuming tokens

- url: https://github.com/fb55/css-what
  why: Fast CSS selector parser with simple AST
  critical: Node type definitions, selector traversal
  pattern: Array-based AST with type discriminators

- url: https://github.com/pegjs/pegjs
  why: Parsing Expression Grammar concepts
  critical: EBNF to implementation translation
  pattern: Each grammar rule becomes a parsing function

- url: https://github.com/goto100/xpath
  why: Path-based selector parsing similar to our grammar
  critical: Path segment handling, namespace support
  pattern: Recursive descent for path expressions
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
│   │   ├── index.ts                 # Exports parseMarkdown, parseFile, types
│   │   ├── types.ts                 # ParserOptions, ParseResult, ParserError
│   │   ├── processor.ts             # createProcessor factory
│   │   └── parse.ts                 # parseMarkdown, parseFile functions
│   ├── tree/                        # COMPLETE from P1M3 (if done)
│   │   ├── index.ts
│   │   ├── types.ts
│   │   ├── word-counter.ts
│   │   ├── selector-generator.ts
│   │   ├── section-virtualizer.ts
│   │   └── builder.ts
│   ├── selector/                    # EMPTY - To be implemented in this milestone
│   └── output/                      # Future: Output formatters (P3)
└── dist/                            # Build output (cli.mjs exists)
```

### Desired Codebase Tree After P2M1 Completion

```bash
/home/dustin/projects/mdsel/
├── src/
│   ├── cli/
│   │   └── index.ts                 # Unchanged
│   ├── parser/                      # Unchanged
│   ├── tree/                        # Unchanged (or empty if P1M3 not done)
│   ├── selector/
│   │   ├── index.ts                 # Public API exports
│   │   ├── types.ts                 # TokenType, Token, SelectorAST, ParseError
│   │   ├── tokenizer.ts             # tokenize() function
│   │   ├── parser.ts                # parseSelector() function
│   │   └── validator.ts             # validateSelector() function
│   └── output/                      # Empty (future)
├── tests/
│   ├── fixtures/                    # Existing from P1M2
│   ├── parser/                      # Existing from P1M2
│   └── selector/
│       ├── tokenizer.test.ts        # Tokenizer tests
│       ├── parser.test.ts           # Parser tests
│       └── validator.test.ts        # Validation tests
└── ...
```

### Known Gotchas & Library Quirks

```typescript
// CRITICAL: ESM imports MUST use .js extension in source files
import { tokenize } from './tokenizer.js';     // CORRECT
import { tokenize } from './tokenizer';        // WRONG - runtime error

// CRITICAL: Tokenizer must check multi-character tokens BEFORE single characters
// When tokenizing "::", check for "::" before checking for ":"
if (input[index] === ':' && input[index + 1] === ':') {
  return { type: TokenType.NAMESPACE_SEP, value: '::', position };
}
// Otherwise ":" would be consumed first

// CRITICAL: Position tracking uses 1-based line/column, 0-based offset
interface Position {
  line: number;      // 1-based
  column: number;    // 1-based
  offset: number;    // 0-based
}

// CRITICAL: Heading level validation is h1-h6 only
// heading:h7 is INVALID, heading:h0 is INVALID
const validHeadingLevels = [1, 2, 3, 4, 5, 6];

// CRITICAL: Block type validation
const validBlockTypes = ['paragraph', 'list', 'code', 'table', 'blockquote'];
// block:invalid is INVALID

// CRITICAL: Index must be non-negative integer
// heading:h2[-1] is INVALID
// heading:h2[1.5] is INVALID (no decimals)

// CRITICAL: Namespace cannot be empty after "::"
// "::heading" is INVALID
// "doc::heading" is VALID

// CRITICAL: Query parameters must have proper format
// ?full=true is VALID
// ?invalid is INVALID (no equals sign)
// ?full= is VALID (empty value allowed)

// CRITICAL: Trailing slash is invalid
// "heading:h2[0]/" is INVALID

// GOTCHA: Recursive descent parsing functions need shared state
// Pass tokens array and current index by reference or use a class

// GOTCHA: Error collection vs fail-fast
// Collect all errors before throwing for better user experience

// GOTCHA: Empty selector input
// Return empty AST or throw? - Should throw ParseError with message
```

---

## Implementation Blueprint

### Data Models and Structure

```typescript
// src/selector/types.ts

/**
 * Token types produced by the tokenizer.
 */
export enum TokenType {
  // Identifiers and keywords
  IDENTIFIER = 'IDENTIFIER',
  ROOT = 'ROOT',
  HEADING = 'HEADING',
  SECTION = 'SECTION',
  BLOCK = 'BLOCK',
  PAGE = 'PAGE',

  // Separators and operators
  NAMESPACE_SEP = 'NAMESPACE_SEP',     // ::
  COLON = 'COLON',                     // :
  SLASH = 'SLASH',                     // /
  QUESTION = 'QUESTION',               // ?
  AMPERSAND = 'AMPERSAND',             // &
  EQUALS = 'EQUALS',                   // =

  // Brackets
  OPEN_BRACKET = 'OPEN_BRACKET',       // [
  CLOSE_BRACKET = 'CLOSE_BRACKET',     // ]

  // Literals
  NUMBER = 'NUMBER',
  STRING = 'STRING',

  // Special
  EOF = 'EOF',
  UNKNOWN = 'UNKNOWN',
}

/**
 * Position information for error reporting.
 */
export interface Position {
  /** 1-based line number */
  line: number;
  /** 1-based column number */
  column: number;
  /** 0-based byte offset */
  offset: number;
}

/**
 * A single token produced by the tokenizer.
 */
export interface Token {
  type: TokenType;
  value: string;
  position: Position;
}

/**
 * Node types in the selector AST.
 */
export enum SelectorNodeType {
  SELECTOR = 'selector',
  PATH_SEGMENT = 'path_segment',
  ROOT = 'root',
  HEADING = 'heading',
  SECTION = 'section',
  BLOCK = 'block',
  PAGE = 'page',
}

/**
 * Base interface for all AST nodes.
 */
export interface BaseSelectorNode {
  type: SelectorNodeType;
  position: Position;
}

/**
 * Root selector AST node.
 */
export interface SelectorAST extends BaseSelectorNode {
  type: SelectorNodeType.SELECTOR;
  namespace?: string;
  segments: PathSegmentNode[];
  queryParams?: QueryParam[];
}

/**
 * Path segment node (heading:h2[1], block:code[0], etc).
 */
export interface PathSegmentNode extends BaseSelectorNode {
  type: SelectorNodeType.PATH_SEGMENT;
  nodeType: 'root' | 'heading' | 'section' | 'block' | 'page';
  subtype?: HeadingLevel | BlockType;
  index?: number;
  position: Position;
}

/**
 * Heading level (h1-h6).
 */
export type HeadingLevel = 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';

/**
 * Block type.
 */
export type BlockType = 'paragraph' | 'list' | 'code' | 'table' | 'blockquote';

/**
 * Query parameter node.
 */
export interface QueryParam {
  key: string;
  value: string;
  position: Position;
}

/**
 * Error codes for selector parsing failures.
 */
export type SelectorErrorCode =
  | 'INVALID_SYNTAX'
  | 'INVALID_HEADING_LEVEL'
  | 'INVALID_BLOCK_TYPE'
  | 'INVALID_INDEX'
  | 'INVALID_NAMESPACE'
  | 'UNCLOSED_BRACKET'
  | 'EMPTY_SELECTOR'
  | 'TRAILING_SLASH'
  | 'MALFORMED_QUERY';

/**
 * Custom error class for selector parsing failures.
 */
export class SelectorParseError extends Error {
  public readonly code: SelectorErrorCode;
  public readonly position: Position;
  public readonly input: string;

  constructor(code: SelectorErrorCode, message: string, position: Position, input: string) {
    super(message);
    this.name = 'SelectorParseError';
    this.code = code;
    this.position = position;
    this.input = input;
    // Maintains proper stack trace in V8 environments
    Error.captureStackTrace?.(this, SelectorParseError);
  }

  /**
   * Format error message with position context.
   */
  toString(): string {
    const { line, column } = this.position;
    const lineStart = this.input.lastIndexOf('\n', this.position.offset - 1) + 1;
    const lineEnd = this.input.indexOf('\n', this.position.offset);
    const lineContent = this.input.slice(lineStart, lineEnd === -1 ? undefined : lineEnd);
    const pointer = ' '.repeat(column - 1) + '^';

    return `${this.message}\n` +
      `  at line ${line}, column ${column}\n` +
      `  ${lineContent}\n` +
      `  ${pointer}`;
  }
}
```

### Implementation Tasks (Ordered by Dependencies)

```yaml
Task 1: CREATE src/selector/types.ts
  - IMPLEMENT: TokenType enum, Token interface, Position interface
  - IMPLEMENT: SelectorNodeType enum, all AST node interfaces
  - IMPLEMENT: SelectorParseError class with toString() formatting
  - FOLLOW pattern: src/parser/types.ts (error class pattern, import type)
  - NAMING: PascalCase for types, UPPER_CASE for enum values
  - IMPORTS: No external dependencies needed
  - PLACEMENT: /src/selector/types.ts
  - VALIDATION: npx tsc --noEmit passes

Task 2: CREATE src/selector/tokenizer.ts
  - IMPLEMENT: tokenize(input: string) function returning Token[]
  - FOLLOW pattern: Character-by-character scanning with position tracking
  - PATTERN:
    - Track line, column, offset while scanning
    - Check multi-char tokens (::) before single-char tokens
    - Skip whitespace (don't emit tokens for it)
    - Emit EOF token at end
    - Throw SelectorParseError for invalid characters
  - KEY FUNCTIONS:
    - scanIdentifier(): Scan [a-zA-Z0-9_-]+
    - scanNumber(): Scan [0-9]+
    - scanString(): Scan quoted strings (for query values)
  - DEPENDENCIES: Task 1 (imports types)
  - PLACEMENT: /src/selector/tokenizer.ts
  - VALIDATION: Unit tests pass for all token types

Task 3: CREATE src/selector/parser.ts
  - IMPLEMENT: parseSelector(input: string) function returning SelectorAST
  - IMPLEMENT: Recursive descent parser with one function per grammar rule
  - FOLLOW pattern: Each EBNF rule becomes a method
  - PATTERN:
    - parseSelector(): Entry point, calls tokenize then parse
    - parseNamespace(): Handles optional namespace::
    - parsePath(): Handles path segments with / separators
    - parsePathSegment(): Handles single segment with optional [index]
    - parseNodeType(): Validates node type and subtype
    - parseIndex(): Parses [number] brackets
    - parseQueryParams(): Handles ?key=value&key2=value2
  - DEPENDENCIES: Task 1 (imports types), Task 2 (uses tokenize)
  - PLACEMENT: /src/selector/parser.ts
  - VALIDATION: Unit tests pass for all valid selectors

Task 4: CREATE src/selector/validator.ts
  - IMPLEMENT: validateSelector(ast: SelectorAST) function
  - IMPLEMENT: Grammar constraint validation
  - PATTERN:
    - Check heading levels are h1-h6
    - Check block types are valid
    - Check indices are non-negative
    - Check namespace is not empty
    - Check query params have valid format
  - DEPENDENCIES: Task 1 (imports types), Task 3 (uses SelectorAST)
  - PLACEMENT: /src/selector/validator.ts
  - VALIDATION: All invalid selectors are rejected

Task 5: CREATE src/selector/index.ts
  - IMPLEMENT: Public API exports
  - EXPORTS:
    - { parseSelector } from './parser.js'
    - { tokenize } from './tokenizer.js'
    - { validateSelector } from './validator.js'
    - { SelectorParseError, type SelectorErrorCode } from './types.js'
    - All AST types from './types.js'
  - NAMING: Barrel file pattern
  - DEPENDENCIES: Tasks 1-4
  - PLACEMENT: /src/selector/index.ts
  - VALIDATION: Can import from 'src/selector/index.js' in test files

Task 6: CREATE tests/selector/tokenizer.test.ts
  - IMPLEMENT: Unit tests for tokenizer
  - TEST CASES:
    - Tokenizes identifiers correctly
    - Tokenizes namespace separator (::)
    - Tokenizes all node types (root, heading, section, block, page)
    - Tokenizes brackets and indices
    - Tokenizes query parameters (? and &)
    - Tracks position correctly (line, column, offset)
    - Handles empty input (returns [EOF])
    - Throws SelectorParseError for invalid characters
    - Handles multi-character tokens correctly
  - FOLLOW pattern: tests/parser/*.test.ts (Vitest describe/it/expect)
  - COVERAGE: All token types, all error paths
  - PLACEMENT: /tests/selector/tokenizer.test.ts
  - VALIDATION: npm run test -- tests/selector/tokenizer.test.ts passes

Task 7: CREATE tests/selector/parser.test.ts
  - IMPLEMENT: Unit tests for parser
  - TEST CASES for valid selectors:
    - Parses root selector (root)
    - Parses namespaced root (doc::root)
    - Parses heading with level (heading:h2[1])
    - Parses block with type (block:code[0])
    - Parses path with segments (heading:h2[1]/section[0]/block:code[0])
    - Parses query params (section[1]?full=true)
    - Parses complex selector (ns::heading:h1[0]/block:paragraph[0]?full=true)
  - TEST CASES for invalid selectors:
    - Rejects invalid heading level (heading:h7[0])
    - Rejects invalid block type (block:invalid[0])
    - Rejects negative index (heading:h2[-1])
    - Rejects empty namespace (::heading)
    - Detects unclosed bracket (heading:h2[0)
    - Detects trailing slash (heading:h2[0]/)
  - FOLLOW pattern: tests/parser/*.test.ts
  - COVERAGE: All grammar rules, all error paths
  - PLACEMENT: /tests/selector/parser.test.ts
  - VALIDATION: npm run test -- tests/selector/parser.test.ts passes

Task 8: CREATE tests/selector/validator.test.ts
  - IMPLEMENT: Unit tests for validator
  - TEST CASES:
    - Validates heading levels (h1-h6 pass, h7 fails)
    - Validates block types (valid types pass, invalid fails)
    - Validates index ranges (0+ pass, negative fails)
    - Validates namespace format (non-empty required)
    - Validates query param format (key=value required)
  - FOLLOW pattern: tests/parser/*.test.ts
  - COVERAGE: All validation rules
  - PLACEMENT: /tests/selector/validator.test.ts
  - VALIDATION: npm run test -- tests/selector/validator.test.ts passes
```

### Implementation Patterns & Key Details

#### src/selector/types.ts (Task 1)

```typescript
/**
 * Token types produced by the tokenizer.
 */
export enum TokenType {
  // Identifiers and keywords
  IDENTIFIER = 'IDENTIFIER',
  ROOT = 'ROOT',
  HEADING = 'HEADING',
  SECTION = 'SECTION',
  BLOCK = 'BLOCK',
  PAGE = 'PAGE',

  // Separators and operators
  NAMESPACE_SEP = 'NAMESPACE_SEP',
  COLON = 'COLON',
  SLASH = 'SLASH',
  QUESTION = 'QUESTION',
  AMPERSAND = 'AMPERSAND',
  EQUALS = 'EQUALS',

  // Brackets
  OPEN_BRACKET = 'OPEN_BRACKET',
  CLOSE_BRACKET = 'CLOSE_BRACKET',

  // Literals
  NUMBER = 'NUMBER',
  STRING = 'STRING',

  // Special
  EOF = 'EOF',
  UNKNOWN = 'UNKNOWN',
}

/**
 * Position information for error reporting.
 */
export interface Position {
  line: number;
  column: number;
  offset: number;
}

/**
 * A single token produced by the tokenizer.
 */
export interface Token {
  type: TokenType;
  value: string;
  position: Position;
}

/**
 * Node types in the selector AST.
 */
export enum SelectorNodeType {
  SELECTOR = 'selector',
  PATH_SEGMENT = 'path_segment',
  ROOT = 'root',
  HEADING = 'heading',
  SECTION = 'section',
  BLOCK = 'block',
  PAGE = 'page',
}

/**
 * Base interface for all AST nodes.
 */
export interface BaseSelectorNode {
  type: SelectorNodeType;
  position: Position;
}

/**
 * Root selector AST node.
 */
export interface SelectorAST extends BaseSelectorNode {
  type: SelectorNodeType.SELECTOR;
  namespace?: string;
  segments: PathSegmentNode[];
  queryParams?: QueryParam[];
}

/**
 * Path segment node.
 */
export interface PathSegmentNode extends BaseSelectorNode {
  type: SelectorNodeType.PATH_SEGMENT;
  nodeType: 'root' | 'heading' | 'section' | 'block' | 'page';
  subtype?: HeadingLevel | BlockType;
  index?: number;
}

/**
 * Heading level (h1-h6).
 */
export type HeadingLevel = 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';

/**
 * Block type.
 */
export type BlockType = 'paragraph' | 'list' | 'code' | 'table' | 'blockquote';

/**
 * Query parameter node.
 */
export interface QueryParam {
  key: string;
  value: string;
  position: Position;
}

/**
 * Error codes for selector parsing failures.
 */
export type SelectorErrorCode =
  | 'INVALID_SYNTAX'
  | 'INVALID_HEADING_LEVEL'
  | 'INVALID_BLOCK_TYPE'
  | 'INVALID_INDEX'
  | 'INVALID_NAMESPACE'
  | 'UNCLOSED_BRACKET'
  | 'EMPTY_SELECTOR'
  | 'TRAILING_SLASH'
  | 'MALFORMED_QUERY';

/**
 * Custom error class for selector parsing failures.
 */
export class SelectorParseError extends Error {
  public readonly code: SelectorErrorCode;
  public readonly position: Position;
  public readonly input: string;

  constructor(code: SelectorErrorCode, message: string, position: Position, input: string) {
    super(message);
    this.name = 'SelectorParseError';
    this.code = code;
    this.position = position;
    this.input = input;
    Error.captureStackTrace?.(this, SelectorParseError);
  }

  toString(): string {
    const { line, column, offset } = this.position;
    const lineStart = this.input.lastIndexOf('\n', offset - 1) + 1;
    const lineEnd = this.input.indexOf('\n', offset);
    const lineContent = this.input.slice(lineStart, lineEnd === -1 ? undefined : lineEnd);
    const pointer = ' '.repeat(column - 1) + '^';

    return `${this.message}\n` +
      `  at line ${line}, column ${column}\n` +
      `  ${lineContent}\n` +
      `  ${pointer}`;
  }
}

// Re-export types for convenience
export type {
  BaseSelectorNode,
  SelectorAST,
  PathSegmentNode,
  QueryParam,
};
```

#### src/selector/tokenizer.ts (Task 2)

```typescript
import { TokenType, type Token, type Position, SelectorParseError } from './types.js';

/**
 * Tokenizes a selector string into an array of tokens.
 *
 * @param input - The selector string to tokenize
 * @returns Array of tokens ending with EOF
 * @throws {SelectorParseError} When encountering invalid characters
 *
 * @example
 * ```typescript
 * const tokens = tokenize('heading:h2[1]');
 * // Returns:
 * // [
 * //   { type: TokenType.HEADING, value: 'heading', position: {...} },
 * //   { type: TokenType.COLON, value: ':', position: {...} },
 * //   { type: TokenType.IDENTIFIER, value: 'h2', position: {...} },
 * //   { type: TokenType.OPEN_BRACKET, value: '[', position: {...} },
 * //   { type: TokenType.NUMBER, value: '1', position: {...} },
 * //   { type: TokenType.CLOSE_BRACKET, value: ']', position: {...} },
 * //   { type: TokenType.EOF, value: '', position: {...} }
 * // ]
 * ```
 */
export function tokenize(input: string): Token[] {
  const tokens: Token[] = [];
  let index = 0;
  let line = 1;
  let column = 1;

  const position = (): Position => ({ line, column, offset: index });

  const isAtEnd = () => index >= input.length;

  const advance = () => {
    if (!isAtEnd()) {
      if (input[index] === '\n') {
        line++;
        column = 1;
      } else {
        column++;
      }
      index++;
    }
  };

  const peek = (offset = 0) => {
    const pos = index + offset;
    return pos < input.length ? input[pos] : '';
  };

  const match = (char: string) => {
    if (peek() === char) {
      advance();
      return true;
    }
    return false;
  };

  const skipWhitespace = () => {
    while (!isAtEnd() && /\s/.test(peek())) {
      advance();
    }
  };

  const scanIdentifier = (): string => {
    const start = index;
    while (!isAtEnd() && /[a-zA-Z0-9_-]/.test(peek())) {
      advance();
    }
    return input.slice(start, index);
  };

  const scanNumber = (): string => {
    const start = index;
    while (!isAtEnd() && /[0-9]/.test(peek())) {
      advance();
    }
    return input.slice(start, index);
  };

  const scanString = (): string => {
    const quote = peek();
    advance(); // Opening quote
    const start = index;
    while (!isAtEnd() && peek() !== quote) {
      advance();
    }
    const value = input.slice(start, index);
    advance(); // Closing quote
    return value;
  };

  const addToken = (type: TokenType, value: string) => {
    tokens.push({ type, value, position: position() });
  };

  // Main scanning loop
  while (!isAtEnd()) {
    skipWhitespace();

    if (isAtEnd()) break;

    const char = peek();
    const pos = position();

    // Check for multi-character tokens first
    if (char === ':' && peek(1) === ':') {
      advance();
      advance();
      addToken(TokenType.NAMESPACE_SEP, '::');
      continue;
    }

    // Single character tokens
    switch (char) {
      case '/':
        advance();
        addToken(TokenType.SLASH, '/');
        continue;
      case ':':
        advance();
        addToken(TokenType.COLON, ':');
        continue;
      case '[':
        advance();
        addToken(TokenType.OPEN_BRACKET, '[');
        continue;
      case ']':
        advance();
        addToken(TokenType.CLOSE_BRACKET, ']');
        continue;
      case '?':
        advance();
        addToken(TokenType.QUESTION, '?');
        continue;
      case '&':
        advance();
        addToken(TokenType.AMPERSAND, '&');
        continue;
      case '=':
        advance();
        addToken(TokenType.EQUALS, '=');
        continue;
      case '"':
      case "'":
        const str = scanString();
        addToken(TokenType.STRING, str);
        continue;
    }

    // Numbers
    if (/[0-9]/.test(char)) {
      const num = scanNumber();
      addToken(TokenType.NUMBER, num);
      continue;
    }

    // Identifiers and keywords
    if (/[a-zA-Z_]/.test(char)) {
      const identifier = scanIdentifier();

      // Check for keywords
      switch (identifier) {
        case 'root':
          addToken(TokenType.ROOT, identifier);
          break;
        case 'heading':
          addToken(TokenType.HEADING, identifier);
          break;
        case 'section':
          addToken(TokenType.SECTION, identifier);
          break;
        case 'block':
          addToken(TokenType.BLOCK, identifier);
          break;
        case 'page':
          addToken(TokenType.PAGE, identifier);
          break;
        default:
          addToken(TokenType.IDENTIFIER, identifier);
      }
      continue;
    }

    // Invalid character
    throw new SelectorParseError(
      'INVALID_SYNTAX',
      `Invalid character '${char}' in selector`,
      pos,
      input
    );
  }

  // Add EOF token
  addToken(TokenType.EOF, '');

  return tokens;
}
```

#### src/selector/parser.ts (Task 3)

```typescript
import {
  type SelectorAST,
  type PathSegmentNode,
  type QueryParam,
  type Token,
  TokenType,
  SelectorNodeType,
  SelectorParseError,
  type HeadingLevel,
  type BlockType,
  type SelectorErrorCode,
} from './types.js';
import { tokenize } from './tokenizer.js';

const validHeadingLevels: HeadingLevel[] = ['h1', 'h2', 'h3', 'h4', 'h5', 'h6'];
const validBlockTypes: BlockType[] = ['paragraph', 'list', 'code', 'table', 'blockquote'];

/**
 * Parses a selector string into an AST.
 *
 * @param input - The selector string to parse
 * @returns The parsed selector AST
 * @throws {SelectorParseError} When selector syntax is invalid
 *
 * @example
 * ```typescript
 * const ast = parseSelector('doc::heading:h2[1]/block:code[0]');
 * console.log(ast.namespace); // 'doc'
 * console.log(ast.segments.length); // 2
 * ```
 */
export function parseSelector(input: string): SelectorAST {
  const tokens = tokenize(input);
  const parser = new Parser(tokens, input);
  return parser.parse();
}

/**
 * Recursive descent parser for selector grammar.
 */
class Parser {
  private tokens: Token[];
  private current = 0;
  private input: string;

  constructor(tokens: Token[], input: string) {
    this.tokens = tokens;
    this.input = input;
  }

  parse(): SelectorAST {
    const segments: PathSegmentNode[] = [];
    let namespace: string | undefined;
    let queryParams: QueryParam[] | undefined;

    // Parse optional namespace
    if (this.match(TokenType.IDENTIFIER) && this.peekType() === TokenType.NAMESPACE_SEP) {
      namespace = this.previous().value;
      this.advance(); // Consume NAMESPACE_SEP
    }

    // Parse path segments
    do {
      segments.push(this.parsePathSegment());
    } while (this.match(TokenType.SLASH));

    // Parse optional query params
    if (this.match(TokenType.QUESTION)) {
      queryParams = this.parseQueryParams();
    }

    // Should be at EOF
    if (!this.check(TokenType.EOF)) {
      throw this.error('INVALID_SYNTAX', `Unexpected token '${this.peek().value}' after selector`);
    }

    // Validate no trailing slash
    if (segments.length > 0 && segments[segments.length - 1].nodeType === 'invalid') {
      throw this.error('TRAILING_SLASH', 'Trailing slash is not allowed');
    }

    return {
      type: SelectorNodeType.SELECTOR,
      namespace,
      segments,
      queryParams,
      position: { line: 1, column: 1, offset: 0 },
    };
  }

  private parsePathSegment(): PathSegmentNode {
    const startPos = this.peek().position;
    let nodeType: 'root' | 'heading' | 'section' | 'block' | 'page';
    let subtype: HeadingLevel | BlockType | undefined;
    let index: number | undefined;

    // Parse node type
    if (this.match(TokenType.ROOT)) {
      nodeType = 'root';
    } else if (this.match(TokenType.HEADING)) {
      nodeType = 'heading';
      // Expect colon and heading level
      if (!this.match(TokenType.COLON)) {
        throw this.error('INVALID_SYNTAX', `Expected ':' after 'heading'`);
      }
      if (!this.check(TokenType.IDENTIFIER)) {
        throw this.error('INVALID_HEADING_LEVEL', `Expected heading level (h1-h6) after 'heading:'`);
      }
      const level = this.advance().value as HeadingLevel;
      if (!validHeadingLevels.includes(level)) {
        throw this.error('INVALID_HEADING_LEVEL', `Invalid heading level '${level}' - must be h1-h6`);
      }
      subtype = level;
    } else if (this.match(TokenType.BLOCK)) {
      nodeType = 'block';
      // Expect colon and block type
      if (!this.match(TokenType.COLON)) {
        throw this.error('INVALID_SYNTAX', `Expected ':' after 'block'`);
      }
      if (!this.check(TokenType.IDENTIFIER)) {
        throw this.error('INVALID_BLOCK_TYPE', `Expected block type after 'block:'`);
      }
      const type = this.advance().value as BlockType;
      if (!validBlockTypes.includes(type)) {
        throw this.error('INVALID_BLOCK_TYPE', `Invalid block type '${type}'`);
      }
      subtype = type;
    } else if (this.match(TokenType.SECTION)) {
      nodeType = 'section';
    } else if (this.match(TokenType.PAGE)) {
      nodeType = 'page';
    } else if (this.check(TokenType.IDENTIFIER)) {
      // Could be a bare identifier, treat as error for now
      throw this.error('INVALID_SYNTAX', `Unexpected identifier '${this.peek().value}'`);
    } else {
      throw this.error('INVALID_SYNTAX', `Expected node type (root, heading, section, block, or page)`);
    }

    // Parse optional index
    if (this.match(TokenType.OPEN_BRACKET)) {
      if (!this.check(TokenType.NUMBER)) {
        throw this.error('INVALID_INDEX', `Expected number inside brackets`);
      }
      const indexToken = this.advance();
      index = parseInt(indexToken.value, 10);
      if (index < 0) {
        throw this.error('INVALID_INDEX', `Index must be non-negative`);
      }
      if (!this.match(TokenType.CLOSE_BRACKET)) {
        throw this.error('UNCLOSED_BRACKET', `Unclosed bracket, expected ']'`);
      }
    }

    return {
      type: SelectorNodeType.PATH_SEGMENT,
      nodeType,
      subtype,
      index,
      position: startPos,
    };
  }

  private parseQueryParams(): QueryParam[] {
    const params: QueryParam[] = [];

    do {
      const startPos = this.peek().position;

      // Parse key
      if (!this.check(TokenType.IDENTIFIER)) {
        throw this.error('MALFORMED_QUERY', `Expected parameter name`);
      }
      const key = this.advance().value;

      // Expect equals
      if (!this.match(TokenType.EQUALS)) {
        throw this.error('MALFORMED_QUERY', `Expected '=' after parameter name '${key}'`);
      }

      // Parse value (identifier or string)
      let value: string;
      if (this.check(TokenType.STRING)) {
        value = this.advance().value;
      } else if (this.check(TokenType.IDENTIFIER)) {
        value = this.advance().value;
      } else if (this.check(TokenType.NUMBER)) {
        value = this.advance().value;
      } else {
        // Empty value allowed
        value = '';
      }

      params.push({ key, value, position: startPos });
    } while (this.match(TokenType.AMPERSAND));

    return params;
  }

  private check(type: TokenType): boolean {
    return this.peek().type === type;
  }

  private peekType(offset = 0): TokenType {
    const pos = this.current + offset;
    return pos < this.tokens.length ? this.tokens[pos].type : TokenType.EOF;
  }

  private match(...types: TokenType[]): boolean {
    for (const type of types) {
      if (this.check(type)) {
        this.advance();
        return true;
      }
    }
    return false;
  }

  private advance(): Token {
    if (!this.check(TokenType.EOF)) {
      this.current++;
    }
    return this.previous();
  }

  private peek(): Token {
    return this.tokens[this.current];
  }

  private previous(): Token {
    return this.tokens[this.current - 1];
  }

  private error(code: SelectorErrorCode, message: string): SelectorParseError {
    return new SelectorParseError(code, message, this.peek().position, this.input);
  }
}
```

#### src/selector/index.ts (Task 5)

```typescript
// Public API for the selector module
export { parseSelector } from './parser.js';
export { tokenize } from './tokenizer.js';

// Type exports
export {
  TokenType,
  SelectorNodeType,
  type Token,
  type Position,
  type SelectorAST,
  type PathSegmentNode,
  type QueryParam,
  type HeadingLevel,
  type BlockType,
  type SelectorErrorCode,
} from './types.js';

// Error class
export { SelectorParseError } from './types.js';
```

### Integration Points

```yaml
NO EXTERNAL DEPENDENCIES:
  - This module is self-contained
  - Uses only TypeScript built-ins
  - No npm packages required

PARSER_INTEGRATION (Future - P2M2):
  - The Selector Engine will consume parseSelector() output
  - Import: { parseSelector, type SelectorAST } from '../selector/index.js'
  - Usage: const ast = parseSelector(selectorString);

CLI_INTEGRATION (Future - P3M3):
  - The CLI will parse selectors from command line arguments
  - Parse and validate before passing to resolver

EXPORTS:
  - src/selector/index.ts exports all public API
  - Consumers import from 'src/selector/index.js'
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
# Run tokenizer tests first (simpler, fewer dependencies)
npm run test:run -- tests/selector/tokenizer.test.ts -v

# Expected: All 10+ tests pass
# ✓ Tokenizes identifiers correctly
# ✓ Tokenizes namespace separator
# ✓ Tokenizes all node types
# ✓ Tokenizes brackets and indices
# ✓ Tracks position correctly
# ✓ Handles empty input
# ✓ Throws for invalid characters

# Run parser tests
npm run test:run -- tests/selector/parser.test.ts -v

# Expected: All 15+ tests pass
# ✓ Parses root selector
# ✓ Parses namespaced root
# ✓ Parses heading with level
# ✓ Parses block with type
# ✓ Parses path with segments
# ✓ Parses query params
# ✓ Rejects invalid heading level
# ✓ Rejects invalid block type
# ✓ Rejects negative index
# ✓ Detects unclosed bracket
# ✓ Detects trailing slash

# Run all selector tests with coverage
npm run test:coverage -- --include='src/selector/**/*.ts'

# Expected: Coverage >= 90% for all files
```

### Level 3: Integration Testing (System Validation)

```bash
# Verify selector module can be imported
node --input-type=module -e "
import { parseSelector, tokenize, SelectorParseError } from './src/selector/index.js';
console.log('Selector module loaded successfully');
console.log('parseSelector:', typeof parseSelector);
console.log('tokenize:', typeof tokenize);
console.log('SelectorParseError:', typeof SelectorParseError);

// Test a simple selector
const ast = parseSelector('heading:h2[1]');
console.log('Parsed AST:', JSON.stringify(ast, null, 2));
"

# Expected output:
# Selector module loaded successfully
# parseSelector: function
# tokenize: function
# SelectorParseError: function
# Parsed AST: {
#   "type": "selector",
#   "segments": [
#     {
#       "type": "path_segment",
#       "nodeType": "heading",
#       "subtype": "h2",
#       "index": 1
#     }
#   ]
# }

# Test error handling
node --input-type=module -e "
import { parseSelector, SelectorParseError } from './src/selector/index.js';

try {
  parseSelector('heading:h7[0]');
} catch (error) {
  if (error instanceof SelectorParseError) {
    console.log('Error code:', error.code);
    console.log('Error message:');
    console.log(error.toString());
  }
}
"

# Expected output:
# Error code: INVALID_HEADING_LEVEL
# Error message:
# Invalid heading level 'h7' - must be h1-h6
#   at line 1, column 10
#   heading:h7[0]
#          ^

# Test complex selector
node --input-type=module -e "
import { parseSelector } from './src/selector/index.js';

const ast = parseSelector('doc::heading:h1[0]/section[0]/block:code[0]?full=true');
console.log('Namespace:', ast.namespace);
console.log('Segments:', ast.segments.length);
console.log('Query params:', ast.queryParams);
"

# Expected: Shows namespace, segment count, and query params
```

### Level 4: Full Test Suite Validation

```bash
# Run complete test suite including selector
npm run test:run

# Expected: All tests pass (parser + tree + selector tests)

# Run with coverage report
npm run test:coverage

# Expected:
# - All tests pass
# - src/selector coverage >= 90%
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
- [ ] `npm run test:run` passes all selector tests
- [ ] `npm run type-check` reports zero TypeScript errors
- [ ] `npm run lint` reports zero ESLint errors
- [ ] `npm run format:check` reports zero formatting issues
- [ ] Coverage >= 90% for `src/selector/**/*.ts`

### Feature Validation

- [ ] `tokenize('heading:h2[1]')` returns correct token array
- [ ] `parseSelector('root')` returns AST with single root segment
- [ ] `parseSelector('doc::heading:h2[1]')` returns AST with namespace
- [ ] `parseSelector('heading:h2[1]/section[0]')` returns AST with 2 segments
- [ ] `parseSelector('section[1]?full=true')` returns AST with query params
- [ ] Invalid heading level (h7) throws SelectorParseError with INVALID_HEADING_LEVEL
- [ ] Invalid block type throws SelectorParseError with INVALID_BLOCK_TYPE
- [ ] Negative index throws SelectorParseError with INVALID_INDEX
- [ ] Unclosed bracket throws SelectorParseError with UNCLOSED_BRACKET
- [ ] Trailing slash throws SelectorParseError with TRAILING_SLASH
- [ ] Error messages include position (line, column, offset)
- [ ] Error.toString() formats message with context pointer

### Code Quality Validation

- [ ] All files use `.js` extension in imports
- [ ] No external dependencies (pure TypeScript implementation)
- [ ] Follows existing code patterns from parser module
- [ ] JSDoc comments on all public functions
- [ ] Error class follows ParserError pattern
- [ ] Tokenizer checks multi-char tokens before single-char

### Files Created Checklist

- [ ] `/src/selector/types.ts` - Type definitions
- [ ] `/src/selector/tokenizer.ts` - Tokenizer
- [ ] `/src/selector/parser.ts` - Recursive descent parser
- [ ] `/src/selector/validator.ts` - Validation layer
- [ ] `/src/selector/index.ts` - Public exports
- [ ] `/tests/selector/tokenizer.test.ts`
- [ ] `/tests/selector/parser.test.ts`
- [ ] `/tests/selector/validator.test.ts`

---

## Anti-Patterns to Avoid

- Do not use `require()` - this is an ESM project
- Do not omit `.js` extensions in import paths
- Do not check single-character tokens before multi-character tokens (check `::` before `:`)
- Do not use 1-based indexing - selectors use 0-based ordinals
- Do not allow negative indices - validate index >= 0
- Do not skip position tracking - required for error messages
- Do not use external parser libraries - implement pure TypeScript
- Do not catch all errors with generic `catch` - be specific
- Do not use `any` type - use proper AST node types
- Do not hardcode valid heading levels - use const array for maintainability

---

## Confidence Score

**Implementation Success Likelihood: 9/10**

**Rationale:**
- Complete EBNF grammar specification in selector_grammar.md
- Comprehensive research from 4 specialized agents covering all aspects
- Complete code examples provided for all files
- Clear task dependencies and validation commands
- Follows established patterns from P1M1/P1M2 codebase
- No external dependencies required
- Detailed error handling patterns

**Risk Factors:**
- Minor: Multi-character token handling gotcha (mitigated with explicit guidance)
- Minor: Recursive descent state management (mitigated with class-based parser pattern)
- Minor: Position tracking complexity (mitigated with clear examples)

---

## Execution Notes

1. **Create files in order**: types.ts → tokenizer.ts → parser.ts → validator.ts → index.ts → tests
2. **Validate after each file**: Run `npm run type-check` after each file creation
3. **Test incrementally**: Run tests for each component before moving to next
4. **Use exact imports**: Copy import statements exactly as shown
5. **Check coverage last**: Only after all tests pass, verify coverage thresholds
6. **ESM everywhere**: All imports use `.js` extension, all files are ESM
7. **Multi-char tokens first**: Always check `::` before `:` in tokenizer
