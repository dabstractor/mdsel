# mdsel

Declarative Markdown semantic selection CLI for LLM agents.

mdsel parses Markdown documents into semantic trees and exposes machine-addressable selectors for every meaningful chunk. It enables LLMs to request exactly the content they want—no more, no less—without loading entire files into context.

## Installation

```bash
npm install -g mdsel
```

**Requirements**: Node.js >=18.0.0

## Quick Start

```bash
# Index a document to discover available selectors
mdsel index README.md

# Select a specific heading (shorthand)
mdsel select h1.0 README.md

# Select the first code block under a heading
mdsel select "h2.0/code.0" README.md

# Select multiple headings with comma syntax
mdsel select h2.0,2 README.md

# Limit output to first 10 lines
mdsel select "h2.0?head=10" README.md

# Limit output to last 5 lines
mdsel select "h2.0?tail=5" README.md

# Use JSON output for programmatic consumption
mdsel index README.md --json
```

## Commands

### index

Parse documents and emit selector inventory.

```bash
mdsel index <files...>
mdsel index <files...> --json
```

**Example**:
```bash
mdsel index README.md docs/API.md
```

**Text Output** (default):
```
h1.0 mdsel
 h2.0 Installation
 h2.1 Quick Start
 h2.2 Commands
  h3.0 index
  h3.1 select
---
code:19 para:23 list:5 table:3
```

**JSON Output** (`--json` flag):
```json
{
  "success": true,
  "command": "index",
  "timestamp": "2025-01-15T10:30:00.000Z",
  "data": {
    "documents": [
      {
        "namespace": "readme",
        "file_path": "README.md",
        "headings": [...],
        "blocks": {
          "paragraphs": 5,
          "code_blocks": 2,
          "lists": 1,
          "tables": 0,
          "blockquotes": 0
        }
      }
    ],
    "summary": {
      "total_documents": 1,
      "total_nodes": 8,
      "total_selectors": 8
    }
  }
}
```

### select

Retrieve content via selectors.

```bash
mdsel select <selector> [files...]
mdsel select <selector> [files...] --json
```

**Arguments**:
- `<selector>` - Selector string (see [Selectors](#selectors))
- `[files...]` - Markdown files to search (optional, uses stdin if omitted)

**Options**:
- `--json` - Output JSON instead of text

**Examples**:
```bash
# Select first h2 (shorthand)
mdsel select h2.0 README.md

# Select first code block
mdsel select code.0 README.md

# Cross-document selection (all documents)
mdsel select h1.0 README.md GUIDE.md

# Limit output to first 10 lines
mdsel select "h2.0?head=10" README.md

# Limit output to last 5 lines
mdsel select "h2.0?tail=5" README.md

# Range selection
mdsel select h2.1-3 README.md

# Multiple specific indices
mdsel select h2.0,2,4 README.md
```

**Text Output** (default):
```
## Quick Start

To get started...
```

**Multiple Results** (selector prefix):
```
heading:h2.0:
## Installation
content...
heading:h2.1:
## Quick Start
content...
```

**Error Output**:
```
!h2.99
Index out of range: document has 3 h2 headings
~h2.0 ~h2.1 ~h2.2
```

## Selectors

Selectors are path-based, ordinal, stateless, and deterministic. They resemble CSS/XPath conceptually but are purpose-built for Markdown.

### Syntax

```
[namespace::]type[index][/path][?query]
```

- **namespace** (optional) - Document identifier, defaults to all documents
- **type** - Node type (root, heading, section, block) or shorthand
- **index** (optional) - 0-based ordinal: `.N`, `[N]`, `.N-M` (range), `.N,M,O` (list)
- **path** (optional) - Additional path segments for nested selection
- **query** (optional) - Query parameters (e.g., `?head=10`, `?tail=5`)

### Node Types

| Category | Full Form | Shorthand |
|----------|-----------|-----------|
| Root | `root` | - |
| Headings | `heading:h1` ... `heading:h6` | `h1` ... `h6` |
| Sections | `section` | - |
| Blocks | `block:paragraph` | `para`, `paragraph` |
| | `block:code` | `code` |
| | `block:list` | `list` |
| | `block:table` | `table` |
| | `block:blockquote` | `quote`, `blockquote` |

### Index Syntax

Two equivalent notations are supported:

| Notation | Example | Meaning |
|----------|---------|---------|
| Dot | `h2.0` | First h2 |
| Bracket | `h2[0]` | First h2 |
| Range | `h2.1-3` or `h2[1-3]` | h2.1, h2.2, h2.3 |
| Comma list | `h2.0,2,4` or `h2[0,2,4]` | h2.0, h2.2, h2.4 |
| No index | `h2` | All h2 headings |

### Examples

**Basic selection**:
```bash
root                # Document root
h1.0                # First h1 heading
h2.1                # Second h2 heading
code.0              # First code block
para.2              # Third paragraph
```

**Full form (equivalent)**:
```bash
heading:h1[0]       # First h1 heading
block:code[0]       # First code block
```

**Namespace selection**:
```bash
readme::root        # Root in specific document
docs::h2.0          # First h2 in docs
api::table.1        # Second table in api
```

**Path composition**:
```bash
h2.1/code.0                    # First code block under second h2
section.0/list.1               # Second list in first section
docs::h2.0/section.0/code.0    # Nested path with namespace
```

**Range and list selection**:
```bash
h2.0-2              # First three h2 headings
h2.1,3,5            # 2nd, 4th, and 6th h2 headings
code.0,2            # 1st and 3rd code blocks
```

**Query parameters**:
```bash
h2.0?head=10        # First 10 lines of content
h2.0?tail=5         # Last 5 lines of content
section.2?head=20   # First 20 lines of section
```

**Cross-document selection**:
```bash
h1.0                # First h1 from ALL documents
code.0              # First code block from ALL documents
```

### Index Semantics

- Index is **0-based** (first item is index 0)
- Index counts among siblings of the same type
- Index is relative to parent context, not global
- No index means select **all** matches of that type

## Output Format

Default output is compact text optimized for LLM token efficiency. Use `--json` for structured JSON output.

### Index Response Schema (JSON)

```typescript
interface IndexResponse {
  documents: DocumentIndex[];
  summary: {
    total_documents: number;
    total_nodes: number;
    total_selectors: number;
  };
}
```

### Select Response Schema (JSON)

```typescript
interface SelectResponse {
  matches: {
    selector: string;
    type: string;
    content: string;
    truncated: boolean;
    children_available: {
      selector: string;
      type: string;
      preview: string;
    }[];
  }[];
  unresolved: {
    selector: string;
    reason: string;
    suggestions: string[];
  }[];
}
```

### Truncation

By default, full content is returned. Use `?head=N` or `?tail=N` query parameters to limit output to the first or last N lines. Truncated content includes a `[truncated]` marker.

## Error Handling

### Exit Codes

| Code | Meaning |
|------|---------|
| 0 | Success |
| 1 | Error |
| 2 | Usage error |

### Error Types

| Type | Description |
|------|-------------|
| `FILE_NOT_FOUND` | Specified file does not exist |
| `PARSE_ERROR` | Markdown parsing failed |
| `INVALID_SELECTOR` | Selector syntax is invalid |
| `SELECTOR_NOT_FOUND` | Selector does not match any nodes |
| `NAMESPACE_NOT_FOUND` | Specified namespace does not exist |
| `PROCESSING_ERROR` | General processing error |

### Error Response Example

**Text format**:
```
!h2.99
Index out of range: document has 3 h2 headings
~h2.0 ~h2.1 ~h2.2
```

**JSON format**:
```json
{
  "success": false,
  "command": "select",
  "timestamp": "2025-01-15T10:38:00.000Z",
  "data": {
    "matches": [],
    "unresolved": [
      {
        "selector": "h2.99",
        "reason": "Index out of range: document has 3 h2 headings",
        "suggestions": ["h2.0", "h2.1", "h2.2"]
      }
    ]
  }
}
```

### Suggestions

When a selector fails to resolve, the tool provides fuzzy-matched suggestions based on:
- Known selector grammar
- Existing selectors in the document
- Levenshtein distance and prefix similarity

## Development

```bash
# Run tests
npm test

# Build project
npm run build

# Lint code
npm run lint

# Format code
npm run format

# Type check
npm run type-check
```

**Requirements**: Node.js >=18.0.0, npm

## License

MIT
