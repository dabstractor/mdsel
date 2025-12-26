# P2M1 Research Index

This document indexes all research conducted for Phase 2 Milestone 1 (Selector Parser) of the mdsel project.

## Research Areas

### 1. Tokenizer Implementation Patterns

**Agent**: search-specialist (ID: ae84ca3)

**Key Findings**:
- Character-by-character scanning is the most fundamental pattern for custom grammars
- Multi-character tokens like `::` must be checked BEFORE single-character tokens (`:`)
- Position tracking requires line (1-based), column (1-based), and offset (0-based)
- Error recovery patterns: skip invalid characters and continue tokenization

**Key Libraries to Reference**:
- [Moo](https://github.com/tj/js-moo) - Simple and fast tokenizer
- [Chevrotain](https://github.com/SAP/chevrotain) - Full-featured parser framework with excellent error messages

**Implementation Patterns**:
```typescript
// Always check multi-char tokens first
if (input[index] === ':' && input[index + 1] === ':') {
  return { type: 'NAMESPACE_SEP', value: '::', position };
}

// Track position throughout scanning
const position = { line: 1, column: 1, offset: 0 };
```

### 2. CSS Selector and XPath Parsing

**Agent**: search-specialist (ID: ae45bed)

**Key Findings**:
- CSS selector parsers use similar patterns to what we need
- AST structures typically have: type, value, children, position
- Common node types: selector, combinator, pseudo, attribute, tag, id, class

**Key Libraries to Study**:
- [css-what](https://github.com/fb55/css-what) - Fast CSS selector parser
- [postcss-selector-parser](https://github.com/postcss/postcss-selector-parser) - Full AST with traversal
- [esquery](https://github.com/estools/esquery) - CSS selector for ASTs (uses PEG.js)
- [xpath.js](https://github.com/goto100/xpath) - Pure JavaScript XPath implementation

**AST Structure Patterns**:
```typescript
interface SelectorNode {
  type: string;
  value?: string | number;
  children?: SelectorNode[];
  position?: {
    start: { line: number; column: number; offset: number };
    end: { line: number; column: number; offset: number };
  };
}
```

### 3. Recursive Descent Parser Implementation

**Agent**: search-specialist (ID: a4eb5e0)

**Key Findings**:
- Each EBNF grammar rule becomes a method in the parser
- Parser maintains state: tokens array and current index
- Error handling with position-aware messages
- Common pattern: `parseX()` methods that consume tokens

**EBNF to Implementation Translation**:
```
EBNF: selector = [namespace "::"] path ["?" query_params]
Code: parseSelector() handles optional namespace, calls parsePath(), then parseQueryParams()
```

**Key Patterns**:
- One function per grammar rule
- Shared token stream with current index
- Match/check/advance pattern for token consumption
- Error messages include position context

### 4. Parser Testing Patterns

**Agent**: search-specialist (ID: b98c379)

**Key Findings**:
- Test structure: group by valid input vs error cases
- Test each error case separately with specific error type
- Coverage goals: 90%+ for parser modules
- Test edge cases: empty input, whitespace, boundary values

**Test Organization**:
```
tests/selector/
  ├── tokenizer.test.ts  - Tokenizer unit tests
  ├── parser.test.ts     - Parser unit tests
  └── validator.test.ts  - Validation tests
```

**Common Edge Cases to Test**:
1. Empty and whitespace inputs
2. Boundary values (max heading levels, large indices)
3. Malformed input recovery
4. Character encoding (Unicode, emoji)

## Architecture References

### In-Codebase Documentation

- `plan/architecture/selector_grammar.md` - Complete EBNF grammar specification
- `plan/architecture/system_context.md` - Node type mapping and conventions
- `plan/architecture/output_format.md` - Error response format

### Existing Codebase Patterns

- `src/parser/types.ts` - Error class pattern (ParserError extends Error)
- `tests/parser/parse.test.ts` - Test patterns for parser testing
- `tests/parser/processor.test.ts` - Test organization patterns

## Selector Grammar Specification

### EBNF Grammar

```ebnf
selector       = [namespace "::"] path ["?" query_params]
namespace      = identifier
path           = path_segment ("/" path_segment)*
path_segment   = node_type ["[" index "]"]
node_type      = "root" | "heading:" heading_level | "section" | "block:" block_type | "page"
heading_level  = "h1" | "h2" | "h3" | "h4" | "h5" | "h6"
block_type     = "paragraph" | "list" | "code" | "table" | "blockquote"
index          = non_negative_integer
query_params   = param ("&" param)*
param          = identifier "=" value
identifier     = [a-zA-Z0-9_-]+
```

### Validation Rules

1. **Heading levels**: h1-h6 only (h7, h0, h-1 are invalid)
2. **Block types**: paragraph, list, code, table, blockquote only
3. **Index**: non-negative integers only (0, 1, 2, ...)
4. **Namespace**: cannot be empty after `::`
5. **Trailing slash**: not allowed

### Token Types

| Token | Example | Description |
|-------|---------|-------------|
| IDENTIFIER | `heading`, `doc` | Alphanumeric identifiers |
| ROOT | `root` | Root node keyword |
| HEADING | `heading` | Heading node keyword |
| SECTION | `section` | Section node keyword |
| BLOCK | `block` | Block node keyword |
| PAGE | `page` | Page node keyword |
| NAMESPACE_SEP | `::` | Namespace separator |
| COLON | `:` | Type separator |
| SLASH | `/` | Path separator |
| OPEN_BRACKET | `[` | Index start |
| CLOSE_BRACKET | `]` | Index end |
| QUESTION | `?` | Query params start |
| AMPERSAND | `&` | Query param separator |
| EQUALS | `=` | Key-value separator |
| NUMBER | `0`, `42` | Numeric values |
| STRING | `"value"` | Quoted strings |
| EOF | - | End of input |

## AST Structure

### SelectorAST

```typescript
interface SelectorAST {
  type: 'selector';
  namespace?: string;           // Optional namespace prefix
  segments: PathSegmentNode[];  // Path segments
  queryParams?: QueryParam[];   // Optional query params
  position: Position;
}
```

### PathSegmentNode

```typescript
interface PathSegmentNode {
  type: 'path_segment';
  nodeType: 'root' | 'heading' | 'section' | 'block' | 'page';
  subtype?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' |  // For heading
            'paragraph' | 'list' | 'code' | 'table' | 'blockquote';  // For block
  index?: number;               // 0-based ordinal index
  position: Position;
}
```

## Implementation Checklist

### Files to Create

- [ ] `src/selector/types.ts` - Type definitions
- [ ] `src/selector/tokenizer.ts` - Tokenizer
- [ ] `src/selector/parser.ts` - Recursive descent parser
- [ ] `src/selector/validator.ts` - Validation layer
- [ ] `src/selector/index.ts` - Public exports
- [ ] `tests/selector/tokenizer.test.ts`
- [ ] `tests/selector/parser.test.ts`
- [ ] `tests/selector/validator.test.ts`

### Validation Commands

```bash
npm run type-check    # TypeScript type checking
npm run lint         # ESLint
npm run format:check # Prettier
npm run test:run     # Run all tests
npm run test:coverage # Coverage report (target: >=90%)
```

## Key Gotchas

1. **Multi-character tokens**: Check `::` before `:` in tokenizer
2. **Position tracking**: Line/column are 1-based, offset is 0-based
3. **0-based indexing**: Selectors use `[0]` for first item
4. **Empty namespace**: `::heading` is invalid, need `doc::heading`
5. **Heading validation**: h7 is invalid, only h1-h6 allowed
6. **Index validation**: Must be non-negative integer

## External Resources

### Documentation

- [CSS Selectors Level 3](https://www.w3.org/TR/selectors-3/)
- [XPath 1.0](https://www.w3.org/TR/xpath/)
- [PEG.js](https://github.com/pegjs/pegjs) - Parsing Expression Grammars

### Libraries to Study

- css-what - CSS selector parsing
- postcss-selector-parser - AST and error reporting
- esquery - PEG.js implementation
- xpath.js - Path-based selector parsing
