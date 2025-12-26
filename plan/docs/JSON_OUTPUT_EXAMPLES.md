# JSON Output Examples - P4.M2.T2

## Response Envelope Structure

All CLI responses follow the CLIResponse envelope from `src/output/types.ts`:

```typescript
interface CLIResponse<T = unknown> {
  success: boolean;           // Whether command succeeded
  command: 'index' | 'select'; // The command executed
  timestamp: string;          // ISO 8601 timestamp
  data: T | null;             // Response data (null on error)
  partial_results?: T[];      // Partial results if some succeeded
  unresolved_selectors?: string[]; // Unresolved selectors
  warnings?: string[];        // Warning messages
  errors?: ErrorEntry[];      // Error entries
}
```

## Index Response Examples

### Successful Index Response

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
          "content_preview": "mdsel is a declarative Markdown semantic selection CLI...",
          "truncated": false,
          "children_count": 3,
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
            "children_count": 2,
            "word_count": 1,
            "section_word_count": 85,
            "section_truncated": false
          },
          {
            "selector": "readme::heading:h2[0]",
            "type": "heading:h2",
            "depth": 2,
            "text": "Quick Start",
            "content_preview": "Quick Start",
            "truncated": false,
            "children_count": 4,
            "word_count": 2,
            "section_word_count": 156,
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

### Multi-Document Index Response

```json
{
  "success": true,
  "command": "index",
  "timestamp": "2025-01-15T10:31:00.000Z",
  "data": {
    "documents": [
      {
        "namespace": "readme",
        "file_path": "README.md",
        "root": { "selector": "readme::root", "type": "root", "content_preview": "...", "truncated": false, "children_count": 2, "word_count": 25 },
        "headings": [
          { "selector": "readme::heading:h1[0]", "type": "heading:h1", "depth": 1, "text": "Guide", "content_preview": "Guide", "truncated": false, "children_count": 3, "word_count": 1, "section_word_count": 200, "section_truncated": false }
        ],
        "blocks": { "paragraphs": 3, "code_blocks": 1, "lists": 0, "tables": 0, "blockquote": 0 }
      },
      {
        "namespace": "api",
        "file_path": "API.md",
        "root": null,
        "headings": [
          { "selector": "api::heading:h1[0]", "type": "heading:h1", "depth": 1, "text": "API Reference", "content_preview": "API Reference", "truncated": false, "children_count": 5, "word_count": 2, "section_word_count": 450, "section_truncated": false },
          { "selector": "api::heading:h2[0]", "type": "heading:h2", "depth": 2, "text": "Methods", "content_preview": "Methods", "truncated": false, "children_count": 4, "word_count": 1, "section_word_count": 320, "section_truncated": false }
        ],
        "blocks": { "paragraphs": 8, "code_blocks": 6, "lists": 2, "tables": 1, "blockquote": 0 }
      }
    ],
    "summary": {
      "total_documents": 2,
      "total_nodes": 15,
      "total_selectors": 15
    }
  }
}
```

## Select Response Examples

### Successful Select - Single Match

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
        "content": "## Quick Start\n\nTo get started with mdsel:\n\n1. Install globally: `npm install -g mdsel`\n2. Run index on a document\n3. Use selectors to retrieve content",
        "truncated": false,
        "children_available": [
          {
            "selector": "readme::heading:h2[0]/block:paragraph[0]",
            "type": "block:paragraph",
            "preview": "To get started with mdsel:"
          },
          {
            "selector": "readme::heading:h2[0]/block:list[0]",
            "type": "block:list",
            "preview": "1. Install globally..."
          }
        ]
      }
    ],
    "unresolved": []
  }
}
```

### Successful Select - Code Block

```json
{
  "success": true,
  "command": "select",
  "timestamp": "2025-01-15T10:33:00.000Z",
  "data": {
    "matches": [
      {
        "selector": "readme::block:code[0]",
        "type": "block:code",
        "content": "```bash\nnpm install -g mdsel\n```",
        "truncated": false,
        "children_available": []
      }
    ],
    "unresolved": []
  }
}
```

### Select with Truncation

```json
{
  "success": true,
  "command": "select",
  "timestamp": "2025-01-15T10:34:00.000Z",
  "data": {
    "matches": [
      {
        "selector": "docs::section[2]",
        "type": "section",
        "content": "## API Reference\n\nThis section covers all available API methods in detail. Each method is documented with its parameters, return types, and examples...[truncated]",
        "truncated": true,
        "pagination": {
          "current_page": 0,
          "total_pages": 4,
          "word_count": 500,
          "has_more": true
        },
        "children_available": [
          {
            "selector": "docs::section[2]/page[0]",
            "type": "page",
            "preview": "Page 1 of 4 (500 words)"
          },
          {
            "selector": "docs::section[2]/page[1]",
            "type": "page",
            "preview": "Page 2 of 4 (500 words)"
          },
          {
            "selector": "docs::section[2]/block:code[0]",
            "type": "block:code",
            "preview": "```typescript\ninterface..."
          }
        ]
      }
    ],
    "unresolved": []
  }
}
```

### Select with Full Retrieval

```json
{
  "success": true,
  "command": "select",
  "timestamp": "2025-01-15T10:35:00.000Z",
  "data": {
    "matches": [
      {
        "selector": "docs::section[2]",
        "type": "section",
        "content": "## API Reference\n\nThis section covers all available API methods in detail. Each method is documented with its parameters, return types, and examples. The methods are organized by category...\n\n[Full content - 2000 words]",
        "truncated": false,
        "children_available": [
          {
            "selector": "docs::section[2]/block:paragraph[0]",
            "type": "block:paragraph",
            "preview": "This section covers..."
          }
        ]
      }
    ],
    "unresolved": []
  }
}
```

## Error Response Examples

### File Not Found

```json
{
  "success": false,
  "command": "index",
  "timestamp": "2025-01-15T10:36:00.000Z",
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

### Invalid Selector Syntax

```json
{
  "success": false,
  "command": "select",
  "timestamp": "2025-01-15T10:37:00.000Z",
  "data": {
    "matches": [],
    "unresolved": []
  },
  "errors": [
    {
      "type": "INVALID_SELECTOR",
      "code": "INVALID_HEADING_LEVEL",
      "selector": "readme::heading:h7[0]",
      "message": "Invalid heading level 'h7' - must be h1-h6",
      "suggestions": [
        "readme::heading:h1[0]",
        "readme::heading:h2[0]",
        "readme::heading:h6[0]"
      ]
    }
  ]
}
```

### Selector Not Found with Suggestions

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

### Namespace Not Found

```json
{
  "success": false,
  "command": "select",
  "timestamp": "2025-01-15T10:39:00.000Z",
  "data": {
    "matches": [],
    "unresolved": [
      {
        "selector": "unknown::heading:h1[0]",
        "reason": "Namespace 'unknown' not found. Available namespaces: readme, api, docs",
        "suggestions": [
          "readme::heading:h1[0]",
          "api::heading:h1[0]",
          "docs::heading:h1[0]"
        ]
      }
    ]
  }
}
```

### Partial Success

```json
{
  "success": false,
  "command": "index",
  "timestamp": "2025-01-15T10:40:00.000Z",
  "data": {
    "documents": [
      {
        "namespace": "readme",
        "file_path": "README.md",
        "root": { "selector": "readme::root", "type": "root", "content_preview": "...", "truncated": false, "children_count": 2, "word_count": 30 },
        "headings": [
          { "selector": "readme::heading:h1[0]", "type": "heading:h1", "depth": 1, "text": "Title", "content_preview": "Title", "truncated": false, "children_count": 2, "word_count": 1, "section_word_count": 120, "section_truncated": false }
        ],
        "blocks": { "paragraphs": 2, "code_blocks": 1, "lists": 0, "tables": 0, "blockquote": 0 }
      }
    ],
    "summary": {
      "total_documents": 1,
      "total_nodes": 5,
      "total_selectors": 5
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

## Key Formatting Notes

1. **Timestamp format**: ISO 8601 with milliseconds (e.g., `2025-01-15T10:30:00.000Z`)
2. **Null handling**: Omit fields rather than including null (except `data` on errors)
3. **Selector format**: Always `namespace::type[index]` or `type[index]`
4. **Truncation marker**: Content ends with `[truncated]` when truncated
5. **Error types**: Match ErrorType enum from types.ts
6. **Suggestions**: Array of suggested selector strings when resolution fails
