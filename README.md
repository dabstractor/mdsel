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

# Select a specific heading
mdsel select "readme::heading:h1[0]" README.md

# Select the first code block under a heading
mdsel select "readme::heading:h2[0]/block:code[0]" README.md

# Get full content (bypass truncation)
mdsel select "readme::section[0]?full=true" README.md
```

All commands return structured JSON output for programmatic consumption.

## Commands

### index

Parse documents and emit selector inventory.

```bash
mdsel index <files...>
```

**Example**:
```bash
mdsel index README.md docs/API.md
```

**Output**:
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
        "root": {
          "selector": "readme::root",
          "type": "root",
          "content_preview": "Project description...",
          "truncated": false,
          "children_count": 2,
          "word_count": 42
        },
        "headings": [
          {
            "selector": "readme::heading:h1[0]",
            "type": "heading:h1",
            "depth": 1,
            "text": "Installation",
            "content_preview": "Installation",
            "truncated": false,
            "children_count": 3,
            "word_count": 1,
            "section_word_count": 85,
            "section_truncated": false
          }
        ],
        "blocks": {
          "paragraphs": 5,
          "code_blocks": 2,
          "lists": 1,
          "tables": 0,
          "blockquote": 0
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
mdsel select <selector> [files...] --full
```

**Arguments**:
- `<selector>` - Selector string (see [Selectors](#selectors))
- `[files...]` - Markdown files to search (optional, uses stdin if omitted)

**Options**:
- `--full` - Bypass truncation and return full content

**Examples**:
```bash
# Select from specific document
mdsel select "readme::heading:h2[0]" README.md

# Select first code block
mdsel select "block:code[0]" README.md

# Select with full content
mdsel select "readme::section[1]" README.md --full

# Cross-document selection (all documents)
mdsel select "heading:h1[0]" README.md GUIDE.md

# Query parameter for full retrieval
mdsel select "readme::section[2]?full=true" README.md
```

**Output**:
```json
{
  "success": true,
  "command": "select",
  "timestamp": "2025-01-15T10:32:00.000Z",
  "data": {
    "matches": [
      {
        "selector": "readme::heading:h2[0]",
        "type": "heading:h2",
        "content": "## Quick Start\n\nTo get started...",
        "truncated": false,
        "children_available": [
          {
            "selector": "readme::heading:h2[0]/block:paragraph[0]",
            "type": "block:paragraph",
            "preview": "To get started..."
          }
        ]
      }
    ],
    "unresolved": []
  }
}
```

## Selectors

Selectors are path-based, ordinal, stateless, and deterministic. They resemble CSS/XPath conceptually but are purpose-built for Markdown.

### Syntax

```
[namespace::]type[index][/path]?query
```

- **namespace** (optional) - Document identifier, defaults to all documents
- **type** - Node type (root, heading, section, block)
- **index** (optional) - 0-based ordinal among siblings
- **path** (optional) - Additional path segments for nested selection
- **query** (optional) - Query parameters (e.g., `?full=true`)

### Node Types

| Category | Types |
|----------|-------|
| Root | `root` |
| Headings | `heading:h1`, `heading:h2`, `heading:h3`, `heading:h4`, `heading:h5`, `heading:h6` |
| Sections | `section` |
| Blocks | `block:paragraph`, `block:list`, `block:code`, `block:table`, `block:blockquote` |

### Examples

**Basic selection**:
```bash
root                           # Document root
heading:h1[0]                  # First h1 heading
heading:h2[1]                  # Second h2 heading
block:code[0]                  # First code block
```

**Namespace selection**:
```bash
readme::root                   # Root in specific document
docs::heading:h2[0]            # First h2 in docs
api::block:table[1]            # Second table in api
```

**Path composition**:
```bash
heading:h2[1]/block:code[0]            # First code block under second h2
section[0]/block:list[1]               # Second list in first section
docs::heading:h2[0]/section[0]/block:code[0]  # Nested path
```

**Query parameters**:
```bash
section[2]?full=true            # Full content bypassing truncation
heading:h1[0]?full=true         # Full heading content
```

**Cross-document selection**:
```bash
heading:h1[0]                   # First h1 from ALL documents
block:code[0]                   # First code block from ALL documents
```

### Index Semantics

- Index is **0-based** (first item is index 0)
- Index counts among siblings of the same type
- Index is relative to parent context, not global

## Output Format

All commands return structured JSON following the response envelope:

```typescript
interface CLIResponse<T = unknown> {
  success: boolean;
  command: 'index' | 'select';
  timestamp: string;        // ISO 8601 format
  data: T | null;
  errors?: ErrorEntry[];
}
```

### Index Response Schema

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

### Select Response Schema

```typescript
interface SelectResponse {
  matches: {
    selector: string;
    type: string;
    content: string;
    truncated: boolean;
    pagination?: {
      current_page: number;
      total_pages: number;
      word_count: number;
      has_more: boolean;
    };
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

Content exceeding size limits is truncated with a `[truncated]` marker. Use `?full=true` query parameter or `--full` flag to bypass truncation.

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

```json
{
  "success": false,
  "command": "select",
  "timestamp": "2025-01-15T10:38:00.000Z",
  "data": {
    "matches": [],
    "unresolved": [
      {
        "selector": "readme::heading:h2[99]",
        "reason": "Index out of range: document has 3 h2 headings",
        "suggestions": [
          "readme::heading:h2[0]",
          "readme::heading:h2[1]",
          "readme::heading:h2[2]"
        ]
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
