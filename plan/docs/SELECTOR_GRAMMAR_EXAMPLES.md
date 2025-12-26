# Selector Grammar Examples - P4.M2.T2

## Selector Syntax Overview

Selectors follow the pattern: `[namespace::]type[index]?query`

Components:
- **namespace** (optional): Document identifier
- **type**: Node type (root, heading:hN, section, block:type)
- **index** (optional): 0-based ordinal among siblings
- **query** (optional): Query parameters like `?full=true`

## Valid Node Types

### From src/selector/types.ts

```typescript
export type HeadingLevel = 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
export type BlockType = 'paragraph' | 'list' | 'code' | 'table' | 'blockquote';
```

### Node Type Table

| Category | Types |
|----------|-------|
| Root | `root` |
| Headings | `heading:h1`, `heading:h2`, `heading:h3`, `heading:h4`, `heading:h5`, `heading:h6` |
| Sections | `section` |
| Blocks | `block:paragraph`, `block:list`, `block:code`, `block:table`, `block:blockquote` |
| Virtual | `page` |

## Progressive Selector Examples

### Level 1: Single Node Selection

```bash
# Document root (pre-heading content)
root

# First h1 heading
heading:h1[0]

# First h2 heading
heading:h2[0]

# Third h3 heading
heading:h3[2]
```

### Level 2: Namespace Selection

```bash
# Root in specific document
readme::root

# First h2 in specific document
readme::heading:h2[0]

# Fourth code block in docs
docs::block:code[3]
```

### Level 3: Block Selection

```bash
# First paragraph
block:paragraph[0]

# Second list
block:list[1]

# First code block
block:code[0]

# Only table
block:table[0]

# First blockquote
block:blockquote[0]
```

### Level 4: Path Composition

```bash
# First code block under second h2
heading:h2[1]/block:code[0]

# Second list in first section
section[0]/block:list[1]

# Nested path: h2 -> section -> code
docs::heading:h2[0]/section[0]/block:code[0]

# Deep path: h3 -> section -> paragraph
heading:h3[2]/section[0]/block:paragraph[0]
```

### Level 5: Query Parameters

```bash
# Full content (bypass truncation)
section[5]?full=true

# Full heading content
heading:h2[0]?full=true

# Full code block
block:code[3]?full=true
```

### Level 6: Cross-Document Selection

```bash
# All first h1s across all documents
heading:h1[0]

# All code blocks across all documents
block:code[0]

# All second h2s
heading:h2[1]
```

## Index Semantics

- **0-based**: First item is at index 0
- **Ordinal among siblings**: Counted within same type at same level
- **Scope**: Index is relative to parent, not global

Example structure:
```markdown
# H1 #1            <- heading:h1[0]
## H2 #1           <- heading:h2[0]
### H3 #1          <- heading:h3[0]
### H3 #2          <- heading:h3[1]
## H2 #2           <- heading:h2[1]
### H3 #1          <- heading:h3[0] (under this H2)
```

## Namespace Derivation

Namespace is the file basename without extension:

| File path | Namespace |
|-----------|-----------|
| `README.md` | `readme` |
| `API_GUIDE.md` | `API_GUIDE` |
| `path/to/docs.md` | `docs` |
| `src/lib/parser.ts` | `parser` |

## Path Composition Rules

1. **Left-to-right**: Each segment scopes to children of previous
2. **Implicit expansion**: Selecting parent yields all descendants
3. **Section virtual nodes**: `section` is heading + all content until next equal/higher heading

## Query Parameters

| Parameter | Values | Description |
|-----------|--------|-------------|
| `full` | `true` | Bypass truncation limits |

## Invalid Selectors

These are **invalid** (don't exist in grammar):

- `heading:h0[0]` - No h0 level
- `heading:h7[0]` - No h7 level
- `block:div[0]` - div is not a block type
- `block:text[0]` - text is not a block type

## Selector Resolution Examples

### Single Document
```bash
mdsel select "readme::heading:h2[0]"
```
Returns: Second h2 heading in readme.md (0-indexed = first at level 2)

### Multiple Documents
```bash
mdsel select "heading:h1[0]" README.md GUIDE.md
```
Returns: First h1 from each document

### Specific Path
```bash
mdsel select "docs::heading:h2[1]/block:code[0]"
```
Returns: First code block under second h2 in docs

## Fuzzy Matching and Suggestions

When a selector doesn't resolve, the tool provides suggestions:

```json
{
  "success": false,
  "errors": [{
    "type": "SELECTOR_NOT_FOUND",
    "selector": "readme::heading:h2[99]",
    "suggestions": [
      "readme::heading:h2[0]",
      "readme::heading:h2[1]"
    ]
  }]
}
```
