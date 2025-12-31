# mdsel

Declarative Markdown semantic selection CLI for LLM agents.

mdsel parses Markdown documents into semantic trees and exposes machine-addressable selectors for every meaningful chunk. It enables LLMs to request exactly the content they want—no more, no less—without loading entire files into context.

## Demo

**1. Index a document to see its structure:**

```bash
$ mdsel README.md
h1.0 mdsel
 h2.0 Demo
 h2.1 Installation
 h2.2 Quick Start
 h2.3 Usage
  h3.0 Index (files only)
  h3.1 Select (files + selectors)
  h3.2 Search (fuzzy matching)
 h2.4 Selectors
 h2.5 Output Format
 h2.6 Error Handling
 h2.7 Development
 h2.8 License
---
code:29 para:29 list:5 table:4
```

**2. Select specific content by selector:**

```bash
$ mdsel h2.1 README.md
## Installation

npm install -g mdsel

**Requirements**: Node.js >=18.0.0
```

**3. Drill into nested content:**

```bash
$ mdsel "h2.1/code.0" README.md
npm install -g mdsel
```

## Installation

```bash
npm install -g mdsel
```

**Requirements**: Node.js >=18.0.0

## Quick Start

```bash
# Index a document to see its structure
mdsel README.md

# Select a specific section by index
mdsel h2.1 README.md

# Select the entire document
mdsel '*' README.md

# Select a nested element (first code block under second h2)
mdsel "h2.1/code.0" README.md

# Select multiple sections at once
mdsel h2.0 h2.1 README.md

# Select a range of sections
mdsel h2.0-2 README.md

# Fuzzy search when you don't know the exact selector
mdsel "installation" README.md

# Limit output to first N lines
mdsel "h2.0?head=10" README.md

# JSON output for programmatic use
mdsel --json README.md
```

## Usage

```bash
mdsel [options] <files...> [selectors...]
```

Arguments are auto-detected: `.md` files and existing paths are files, everything else is a selector.

**Options**:
- `--json` - Output JSON instead of text
- `--help` - Show help

### Index (files only)

When only files are provided, outputs the document structure:

```bash
mdsel README.md
```

```
h1.0 mdsel
 h2.0 Demo
 h2.1 Installation
 h2.2 Quick Start
 h2.3 Usage
  h3.0 Index (files only)
  h3.1 Select (files + selectors)
  h3.2 Search (fuzzy matching)
---
code:29 para:29 list:5 table:4
```

The index shows:
- Heading hierarchy with selectors (e.g., `h1.0`, `h2.0`)
- Indentation reflecting document structure
- Block counts for code, paragraphs, lists, tables

### Select (files + selectors)

When selectors are provided, retrieves matching content:

```bash
# Single result - content only
mdsel h2.1 README.md
```

```
## Installation

npm install -g mdsel

**Requirements**: Node.js >=18.0.0
```

```bash
# Multiple results - prefixed with selector
mdsel h2.0 h2.1 README.md
```

```
heading:h2.0:
## Demo
...
heading:h2.1:
## Installation
...
```

```bash
# Errors show suggestions
mdsel h2.99 README.md
```

```
!h2.99
Index out of range: document has 9 h2 headings
~h2.0 ~h2.1 ~h2.2
```

### Search (fuzzy matching)

When input doesn't look like a selector, mdsel performs fuzzy search:

```bash
mdsel "installation" README.md
```

```
Search results for "installation":

readme::h2.1 (100% match)
  Installation

readme::code.9 (74% match)
  ## Installation npm install -g mdsel ...
```

Search returns selectors you can use directly to fetch the content.

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
| Wildcard | `*` | `*` |
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
*                   # Entire document (wildcard)
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
