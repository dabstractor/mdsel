# Selector Grammar Specification

## Overview

The mdsel selector system provides path-based, ordinal, stateless, deterministic, LLM-readable addressing for Markdown document nodes.

## Grammar Formal Definition

### EBNF Grammar

```ebnf
selector       = [namespace "::"] path ["?" query_params]
namespace      = identifier
path           = path_segment ("/" path_segment)*
path_segment   = node_type ["[" index "]"]
node_type      = "root"
               | "heading:" heading_level
               | "section"
               | "block:" block_type
               | "page"
heading_level  = "h1" | "h2" | "h3" | "h4" | "h5" | "h6"
block_type     = "paragraph" | "list" | "code" | "table" | "blockquote"
index          = non_negative_integer
query_params   = param ("&" param)*
param          = "full=true"
identifier     = [a-zA-Z0-9_-]+
non_negative_integer = [0-9]+
```

## Selector Components

### 1. Namespace (Optional)

Identifies the source document. If omitted, selector applies across all loaded documents.

```
doc1::heading:h2[0]        # Specific document
heading:h2[0]              # All documents
```

**Namespace derivation:** File basename without extension
- `path/to/readme.md` → `readme`
- `API_GUIDE.md` → `API_GUIDE`

### 2. Path Segments

Left-to-right composition, each segment scopes to a child of the previous.

```
heading:h2[1]/section[0]/block:code[0]
│             │          └── First code block within the section
│             └── First section (heading + its content)
└── Second h2 heading
```

### 3. Node Types

| Type | Syntax | Description |
|------|--------|-------------|
| Root | `root` | Document root (content before first heading) |
| Heading | `heading:hN[index]` | Heading at level N (1-6) |
| Section | `section[index]` | Virtual: heading + all its descendants |
| Paragraph | `block:paragraph[index]` | Text paragraph |
| List | `block:list[index]` | Ordered or unordered list |
| Code | `block:code[index]` | Fenced code block |
| Table | `block:table[index]` | Markdown table |
| Blockquote | `block:blockquote[index]` | Blockquote |
| Page | `page[index]` | Virtual pagination unit |

### 4. Index (0-based)

Ordinal position among siblings of the same type.

```
heading:h2[0]   # First h2 heading
heading:h2[1]   # Second h2 heading
block:code[3]   # Fourth code block
```

**Index scope:** Counted within parent context, not globally.

### 5. Query Parameters

```
doc::section[2]?full=true   # Bypass truncation
```

| Parameter | Type | Description |
|-----------|------|-------------|
| `full` | boolean | If `true`, bypass truncation limits |

## Resolution Rules

### Rule 1: Path Composition

Each path segment resolves relative to the previous segment's result.

```
doc::heading:h2[1]/block:code[0]
```

1. Find second h2 in `doc`
2. Within that h2's descendants, find first code block

### Rule 2: Implicit Expansion

Selecting a parent yields all children (subject to truncation).

```
doc::heading:h2[1]
```

Returns:
- The heading text
- All descendant blocks

### Rule 3: Cross-Document Selection

Omitting namespace searches all documents.

```
block:code[0]
```

Returns first code block from EACH loaded document.

### Rule 4: Section Virtual Nodes

A `section` is a heading plus all content until the next heading of equal or higher level.

```markdown
## Introduction    ←── section[0] for h2
Some text here.

### Details        ←── section[0] for h3 (nested within h2 section)
More text.

## Next Topic      ←── section[1] for h2
```

### Rule 5: Pagination Virtual Nodes

Large nodes split into virtual pages.

```
doc::section[2]/page[0]    # First page of section 2
doc::section[2]/page[1]    # Second page
```

## Selector Examples

### Basic Selections

```bash
# Document root (pre-heading content)
doc::root

# First h1 heading
doc::heading:h1[0]

# Third h2 heading
doc::heading:h2[2]

# All h2 headings across all documents
heading:h2

# First code block in document
doc::block:code[0]
```

### Path Compositions

```bash
# First code block under second h2
doc::heading:h2[1]/block:code[0]

# Second list in first section
doc::section[0]/block:list[1]

# Table in nested section
doc::heading:h2[0]/section[0]/block:table[0]
```

### Pagination

```bash
# Paginated access to large section
doc::section[5]/page[0]
doc::section[5]/page[1]

# Full retrieval (bypass pagination)
doc::section[5]?full=true
```

## Error Handling

### Invalid Selector Format

```json
{
  "success": false,
  "error": {
    "type": "INVALID_SELECTOR",
    "message": "Invalid selector syntax at position 12",
    "selector": "doc::heading:h7[0]",
    "position": 12
  }
}
```

### Selector Not Found

```json
{
  "success": false,
  "error": {
    "type": "SELECTOR_NOT_FOUND",
    "message": "No node matches selector",
    "selector": "doc::heading:h2[99]"
  },
  "suggestions": [
    "doc::heading:h2[0]",
    "doc::heading:h2[1]",
    "doc::heading:h2[2]"
  ]
}
```

### Namespace Not Found

```json
{
  "success": false,
  "error": {
    "type": "NAMESPACE_NOT_FOUND",
    "message": "Unknown namespace: xyz",
    "selector": "xyz::heading:h1[0]"
  },
  "suggestions": [
    "doc1::heading:h1[0]",
    "doc2::heading:h1[0]"
  ]
}
```

## Implementation Notes

### Parsing Strategy

1. **Tokenize:** Split on `::`, `/`, `[`, `]`, `?`, `&`, `=`
2. **Validate:** Check each token against grammar
3. **Build AST:** Create selector tree structure
4. **Resolve:** Walk document tree matching each segment

### Index Calculation

```typescript
interface IndexCounter {
  [nodeType: string]: number;
}

function getNodeIndex(node: Node, parent: Node): number {
  const counters: IndexCounter = {};
  for (const sibling of parent.children) {
    const type = getNodeTypeKey(sibling);
    counters[type] = (counters[type] ?? -1) + 1;
    if (sibling === node) {
      return counters[type];
    }
  }
  throw new Error('Node not found in parent');
}
```

### Selector Generation

```typescript
function generateSelector(node: Node, ancestors: Node[]): string {
  const parts: string[] = [];

  for (const ancestor of ancestors) {
    if (ancestor.type === 'root') continue;
    parts.push(nodeToSelectorSegment(ancestor));
  }

  parts.push(nodeToSelectorSegment(node));
  return parts.join('/');
}
```
