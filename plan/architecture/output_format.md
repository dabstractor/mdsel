# Output Format Specification

## Design Principles

1. **Strict JSON Only** - No prose, no human-oriented text
2. **Consistent Schema** - Same fields on every invocation
3. **LLM-Optimized** - Minimal tokens, maximum information density
4. **Soft Failures** - Partial results with detailed error context

## Response Envelope

Every CLI response follows this envelope structure:

```typescript
interface CLIResponse<T = unknown> {
  success: boolean;
  command: 'index' | 'select';
  timestamp: string;  // ISO 8601
  data: T;
  partial_results?: T[];
  unresolved_selectors?: string[];
  warnings?: string[];
  errors?: ErrorEntry[];
}

interface ErrorEntry {
  file?: string;
  selector?: string;
  type: ErrorType;
  message: string;
  code: string;
  suggestions?: string[];
}

type ErrorType =
  | 'FILE_NOT_FOUND'
  | 'PARSE_ERROR'
  | 'INVALID_SELECTOR'
  | 'SELECTOR_NOT_FOUND'
  | 'NAMESPACE_NOT_FOUND'
  | 'PROCESSING_ERROR';
```

## Command: `index`

### Input

```bash
mdsel index file1.md file2.md
```

### Output Schema

```typescript
interface IndexResponse {
  documents: DocumentIndex[];
  summary: IndexSummary;
}

interface IndexSummary {
  total_documents: number;
  total_nodes: number;
  total_selectors: number;
}

interface DocumentIndex {
  namespace: string;
  file_path: string;
  root: NodeDescriptor | null;
  headings: HeadingDescriptor[];
  blocks: BlockSummary;
}

interface NodeDescriptor {
  selector: string;
  type: string;
  content_preview: string;  // First N characters
  truncated: boolean;
  children_count: number;
  word_count: number;
}

interface HeadingDescriptor extends NodeDescriptor {
  depth: 1 | 2 | 3 | 4 | 5 | 6;
  text: string;  // Full heading text
  section_word_count: number;
  section_truncated: boolean;
}

interface BlockSummary {
  paragraphs: number;
  code_blocks: number;
  lists: number;
  tables: number;
  blockquotes: number;
}
```

### Example Output

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
          "content_preview": "This is a project that...",
          "truncated": false,
          "children_count": 2,
          "word_count": 45
        },
        "headings": [
          {
            "selector": "readme::heading:h1[0]",
            "type": "heading:h1",
            "depth": 1,
            "text": "Project Title",
            "content_preview": "Project Title",
            "truncated": false,
            "children_count": 5,
            "word_count": 2,
            "section_word_count": 350,
            "section_truncated": false
          },
          {
            "selector": "readme::heading:h2[0]",
            "type": "heading:h2",
            "depth": 2,
            "text": "Installation",
            "content_preview": "Installation",
            "truncated": false,
            "children_count": 3,
            "word_count": 1,
            "section_word_count": 120,
            "section_truncated": false
          }
        ],
        "blocks": {
          "paragraphs": 8,
          "code_blocks": 3,
          "lists": 2,
          "tables": 1,
          "blockquotes": 0
        }
      }
    ],
    "summary": {
      "total_documents": 1,
      "total_nodes": 15,
      "total_selectors": 15
    }
  }
}
```

## Command: `select`

### Input

```bash
mdsel select "readme::heading:h2[0]"
mdsel select "readme::heading:h2[0]/block:code[0]"
mdsel select "readme::section[1]?full=true"
```

### Output Schema

```typescript
interface SelectResponse {
  matches: SelectMatch[];
  unresolved: UnresolvedSelector[];
}

interface SelectMatch {
  selector: string;
  type: string;
  content: string;
  truncated: boolean;
  pagination?: PaginationInfo;
  children_available: ChildInfo[];
}

interface PaginationInfo {
  current_page: number;
  total_pages: number;
  word_count: number;
  has_more: boolean;
}

interface ChildInfo {
  selector: string;
  type: string;
  preview: string;
}

interface UnresolvedSelector {
  selector: string;
  reason: string;
  suggestions: string[];
}
```

### Example Output

```json
{
  "success": true,
  "command": "select",
  "timestamp": "2025-01-15T10:31:00.000Z",
  "data": {
    "matches": [
      {
        "selector": "readme::heading:h2[0]",
        "type": "heading:h2",
        "content": "## Installation\n\nTo install the package, run:\n\n```bash\nnpm install mdsel\n```",
        "truncated": false,
        "children_available": [
          {
            "selector": "readme::heading:h2[0]/block:paragraph[0]",
            "type": "block:paragraph",
            "preview": "To install the package, run:"
          },
          {
            "selector": "readme::heading:h2[0]/block:code[0]",
            "type": "block:code",
            "preview": "npm install mdsel"
          }
        ]
      }
    ],
    "unresolved": []
  }
}
```

### Truncated Content Example

```json
{
  "success": true,
  "command": "select",
  "timestamp": "2025-01-15T10:32:00.000Z",
  "data": {
    "matches": [
      {
        "selector": "docs::section[5]",
        "type": "section",
        "content": "## API Reference\n\nThis section documents all available API methods...[truncated]",
        "truncated": true,
        "pagination": {
          "current_page": 0,
          "total_pages": 4,
          "word_count": 2340,
          "has_more": true
        },
        "children_available": [
          {
            "selector": "docs::section[5]/page[0]",
            "type": "page",
            "preview": "Page 1 of 4 (500 words)"
          },
          {
            "selector": "docs::section[5]/page[1]",
            "type": "page",
            "preview": "Page 2 of 4 (500 words)"
          }
        ]
      }
    ],
    "unresolved": []
  }
}
```

## Error Responses

### File Not Found

```json
{
  "success": false,
  "command": "index",
  "timestamp": "2025-01-15T10:33:00.000Z",
  "data": null,
  "errors": [
    {
      "type": "FILE_NOT_FOUND",
      "code": "ENOENT",
      "file": "missing.md",
      "message": "File not found: missing.md"
    }
  ]
}
```

### Partial Success (Multiple Files)

```json
{
  "success": false,
  "command": "index",
  "timestamp": "2025-01-15T10:34:00.000Z",
  "data": {
    "documents": [
      {
        "namespace": "readme",
        "file_path": "README.md"
      }
    ],
    "summary": {
      "total_documents": 1,
      "total_nodes": 15,
      "total_selectors": 15
    }
  },
  "partial_results": [
    {
      "namespace": "readme",
      "file_path": "README.md"
    }
  ],
  "errors": [
    {
      "type": "FILE_NOT_FOUND",
      "code": "ENOENT",
      "file": "missing.md",
      "message": "File not found: missing.md"
    }
  ],
  "warnings": [
    "1 of 2 files could not be processed"
  ]
}
```

### Selector Not Found with Suggestions

```json
{
  "success": false,
  "command": "select",
  "timestamp": "2025-01-15T10:35:00.000Z",
  "data": {
    "matches": [],
    "unresolved": [
      {
        "selector": "readme::heading:h2[99]",
        "reason": "Index out of range: document has 5 h2 headings",
        "suggestions": [
          "readme::heading:h2[0]",
          "readme::heading:h2[1]",
          "readme::heading:h2[2]",
          "readme::heading:h2[3]",
          "readme::heading:h2[4]"
        ]
      }
    ]
  }
}
```

### Invalid Selector Syntax

```json
{
  "success": false,
  "command": "select",
  "timestamp": "2025-01-15T10:36:00.000Z",
  "data": {
    "matches": [],
    "unresolved": []
  },
  "errors": [
    {
      "type": "INVALID_SELECTOR",
      "code": "SYNTAX_ERROR",
      "selector": "readme::heading:h7[0]",
      "message": "Invalid heading level 'h7' - must be h1-h6",
      "suggestions": [
        "readme::heading:h1[0]",
        "readme::heading:h2[0]",
        "readme::heading:h3[0]"
      ]
    }
  ]
}
```

## Exit Codes

| Code | Meaning |
|------|---------|
| 0 | Success - all operations completed |
| 1 | Error - complete failure |
| 2 | Invalid arguments or usage |
| 4 | Partial success - some operations succeeded |

## Truncation Rules

### Default Settings

```typescript
const DEFAULTS = {
  MAX_WORDS: 500,        // Truncation threshold per node
  PAGE_SIZE: 500,        // Words per virtual page
  PREVIEW_LENGTH: 80,    // Characters in content_preview
};
```

### Truncation Marker

When content is truncated, it ends with `[truncated]` marker:

```json
{
  "content": "This is the beginning of a very long section...[truncated]",
  "truncated": true
}
```

### Full Retrieval

Use `?full=true` query parameter to bypass truncation:

```bash
mdsel select "readme::section[5]?full=true"
```

## Implementation Constraints

1. **No newlines in JSON** - Output is single-line JSON unless pretty-printed
2. **UTF-8 encoding** - All content encoded as UTF-8
3. **Consistent field order** - Fields appear in consistent order for diffability
4. **No null values** - Omit fields rather than include nulls (except `data` on errors)
5. **ISO 8601 timestamps** - All timestamps in ISO 8601 format with timezone
