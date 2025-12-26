# CLI JSON Output Formatting Best Practices

## Overview

This guide provides comprehensive best practices for JSON output formatting in CLI tools, specifically tailored for LLM agent consumption. The practices are based on industry standards, popular CLI tools, and practical implementation patterns.

## 1. JSON Output Envelope Patterns

### Simple Success Response (Flat Structure)
```json
{
  "status": "success",
  "data": {
    "content": "Selected markdown content...",
    "wordCount": 150
  }
}
```

### Envelope Pattern with Metadata
```json
{
  "status": "success",
  "data": {
    "content": "Selected markdown content...",
    "wordCount": 150
  },
  "meta": {
    "timestamp": "2024-12-25T22:03:00Z",
    "version": "1.0.0",
    "command": "select",
    "selector": "doc:h2[0]"
  }
}
```

### Error Response Envelope
```json
{
  "status": "error",
  "error": {
    "code": "SELECTOR_NOT_FOUND",
    "message": "No heading level h2 found at index 0",
    "details": {
      "selector": "doc:h2[0]",
      "availableHeadings": [
        { "level": "h1", "index": 0, "text": "Introduction" },
        { "level": "h3", "index": 0, "text": "Getting Started" }
      ]
    }
  }
}
```

### Multi-Result Envelope
```json
{
  "status": "success",
  "data": [
    {
      "namespace": "README",
      "content": "First matching content...",
      "wordCount": 120
    },
    {
      "namespace": "API",
      "content": "Second matching content...",
      "wordCount": 95
    }
  ],
  "meta": {
    "totalResults": 2,
    "timestamp": "2024-12-25T22:03:00Z",
    "command": "select"
  }
}
```

### Partial Results Envelope
```json
{
  "status": "partial",
  "data": [
    {
      "namespace": "README",
      "content": "Successfully matched content...",
      "wordCount": 120
    }
  ],
  "meta": {
    "totalResults": 1,
    "requestedResults": 3,
    "errors": [
      {
        "code": "FILE_NOT_FOUND",
        "message": "File 'api.md' not found",
        "file": "api.md"
      }
    ]
  }
}
```

## 2. ISO 8601 Timestamp Formatting Standards

Always use ISO 8601 format with timezone information:

### Recommended Formats
```json
{
  "timestamp": "2024-12-25T22:03:00Z",           // UTC
  "timestamp": "2024-12-25T22:03:00-05:00",     // With timezone offset
  "timestamp": "2024-12-25T22:03:00.123Z"       // With milliseconds
}
```

### Implementation Example
```typescript
function getISO8601Timestamp(): string {
  return new Date().toISOString();
}
```

## 3. Error Response JSON Schemas

### RFC 7807 Problem Details Format
```json
{
  "type": "https://example.com/docs/errors#invalid-selector",
  "title": "Invalid Selector",
  "status": 400,
  "detail": "The selector 'doc:h2[999]' is invalid",
  "instance": "abc123"
}
```

### CLI-Specific Error Format
```json
{
  "status": "error",
  "error": {
    "code": "INVALID_SELECTOR",
    "message": "The selector 'doc:h2[999]' is invalid",
    "details": {
      "selector": "doc:h2[999]",
      "position": {
        "line": 1,
        "column": 12,
        "offset": 11
      },
      "suggestions": [
        {
          "selector": "doc:h2[0]",
          "distance": 8,
          "reason": "index_adjustment"
        }
      ]
    },
    "stack": "Error: Invalid index at position 12..."
  }
}
```

### Error Code Standards
```typescript
export type ErrorCode =
  // Parser errors
  | 'FILE_NOT_FOUND'
  | 'FILE_READ_ERROR'
  | 'PARSE_ERROR'
  | 'INVALID_ENCODING'

  // Selector errors
  | 'INVALID_SELECTOR'
  | 'SELECTOR_NOT_FOUND'
  | 'INDEX_OUT_OF_RANGE'
  | 'INVALID_HEADING_LEVEL'
  | 'INVALID_BLOCK_TYPE'
  | 'MALFORMED_QUERY'

  // Resolution errors
  | 'NAMESPACE_NOT_FOUND'
  | 'PATH_RESOLUTION_FAILED'
  | 'MULTIPLE_MATCHES'
  | 'NO_MATCHES_FOUND'

  // System errors
  | 'INTERNAL_ERROR'
  | 'TIMEOUT'
  | 'PERMISSION_DENIED';
```

## 4. Pagination Metadata Patterns

### Offset/Limit Pagination
```json
{
  "data": [
    // Page of results
  ],
  "pagination": {
    "offset": 0,
    "limit": 20,
    "total": 150,
    "hasNext": true,
    "hasPrev": false
  }
}
```

### Cursor-Based Pagination
```json
{
  "data": [
    // Page of results
  ],
  "pagination": {
    "cursor": "eyJpZCI6MTIzLCJjcmVhdGVkX2F0IjoiMjAyNC0wMS0wMVQxMjowMDowMFoifQ==",
    "limit": 20,
    "hasNext": true,
    "hasPrev": false
  },
  "links": {
    "next": "/api?cursor=eyJpZCI6MTAwLCJjcmVhdGVkX2F0IjoiMjAyNC0wMS0wMVQxMDowMDowMFoifQ==",
    "prev": null
  }
}
```

### Complete Pagination Metadata
```json
{
  "data": [
    // Results array
  ],
  "pagination": {
    "page": 1,
    "pageSize": 20,
    "totalPages": 8,
    "totalItems": 150,
    "startIndex": 0,
    "endIndex": 19,
    "hasNext": true,
    "hasPrev": false
  },
  "links": {
    "self": "/api?page=1&size=20",
    "next": "/api?page=2&size=20",
    "prev": null,
    "first": "/api?page=1&size=20",
    "last": "/api?page=8&size=20"
  }
}
```

## 5. Handling Partial Results in JSON Responses

### Partial Success Pattern
```json
{
  "status": "partial",
  "results": [
    {
      "status": "success",
      "data": {
        "namespace": "doc1",
        "content": "Successfully extracted content..."
      }
    },
    {
      "status": "error",
      "error": {
        "code": "FILE_NOT_FOUND",
        "message": "File 'doc2.md' not found",
        "file": "doc2.md"
      }
    }
  ],
  "summary": {
    "total": 2,
    "successful": 1,
    "failed": 1,
    "errors": ["FILE_NOT_FOUND"]
  }
}
```

### Multi-Document Resolution with Partial Results
```json
{
  "status": "partial",
  "data": [
    {
      "namespace": "README",
      "content": "Content from README...",
      "wordCount": 150,
      "status": "success"
    }
  ],
  "errors": [
    {
      "code": "NAMESPACE_NOT_FOUND",
      "message": "Namespace 'api' not found in any document",
      "suggestions": [
        {
          "namespace": "README",
          "similarity": 0.8
        }
      ]
    }
  ],
  "meta": {
    "requestedNamespaces": ["README", "api", "docs"],
    "resolvedNamespaces": ["README"],
    "totalRequested": 3,
    "totalResolved": 1
  }
}
```

## 6. Field Ordering and Null Handling

### Recommended Field Ordering
```json
{
  // Standard fields first
  "status": "success",
  "data": {
    // Core data fields
    "content": "...",
    "wordCount": 150,

    // Metadata fields
    "namespace": "README",
    "path": ["root", "h1[0]", "p[0]"],
    "position": {
      "start": {"line": 10, "column": 1},
      "end": {"line": 12, "column": 20}
    }
  },
  "meta": {
    // Command metadata
    "timestamp": "2024-12-25T22:03:00Z",
    "command": "select",
    "selector": "doc:h1[0]"
  }
}
```

### Null Handling Best Practices
```json
{
  "status": "success",
  "data": {
    "content": "Actual content...",
    "wordCount": 150,
    "metadata": null,  // Explicit null for missing data
    "optionalField": null,  // Explicit null for optional fields
    // Missing fields vs explicit null
    "position": undefined  // Omit completely if not applicable
  }
}
```

### TypeScript Interfaces for Null Handling
```typescript
interface ResponseData {
  // Required fields
  content: string;
  wordCount: number;

  // Optional fields that can be null
  metadata: Record<string, any> | null;

  // Optional fields that should be omitted if not present
  position?: Position;
  namespace?: string;
  path?: string[];
}

interface ApiResponse<T = any> {
  status: 'success' | 'error' | 'partial';
  data: T | null;
  meta?: ResponseMeta;
  error?: ApiError;
}
```

## 7. Popular CLI Tool Patterns

### GitHub CLI (`gh`) Pattern
```json
{
  "repository": {
    "name": "my-repo",
    "full_name": "user/my-repo",
    "description": "My awesome repository"
  },
  "urls": {
    "html": "https://github.com/user/my-repo",
    "api": "https://api.github.com/repos/user/my-repo"
  }
}
```

### AWS CLI Pattern
```json
{
  "Version": "2012-10-17",
  "Id": "policy123",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::example-bucket/*"
    }
  ]
}
```

### jq Pattern (Simple and Filterable)
```json
{
  "status": "success",
  "value": 42,
  "timestamp": "2024-12-25T22:03:00Z"
}
```

## 8. LLM Agent-Specific Considerations

### Machine-Readable Format
```json
{
  "status": "success",
  "data": {
    "content": "Selected content...",
    "metadata": {
      "type": "paragraph",
      "level": 2,
      "position": {
        "start": {"line": 15, "column": 1},
        "end": {"line": 17, "column": 45}
      },
      "context": {
        "parent": "section:installation",
        "previousSibling": "heading:h3[0]",
        "nextSibling": "list[0]"
      }
    }
  },
  "meta": {
    "llmOptimized": true,
    "maxTokens": 4096,
    "truncated": false
  }
}
```

### Context-Aware Responses
```json
{
  "status": "success",
  "data": {
    "content": "Selected content...",
    "context": {
      "document": {
        "name": "README.md",
        "wordCount": 2500,
        "section": "Installation"
      },
      "selection": {
        "preceding": "Previous paragraph content...",
        "following": "Next paragraph content..."
      }
    }
  }
}
```

## 9. Implementation Examples

### Complete Success Response
```typescript
interface SuccessResponse<T> {
  status: 'success';
  data: T;
  meta: {
    timestamp: string;
    command: string;
    version: string;
    duration?: number;
  };
}

function createSuccessResponse<T>(
  data: T,
  command: string,
  meta?: Partial<SuccessResponse<T>['meta']>
): SuccessResponse<T> {
  return {
    status: 'success',
    data,
    meta: {
      timestamp: new Date().toISOString(),
      command,
      version: '1.0.0',
      duration: meta?.duration,
      ...meta
    }
  };
}
```

### Error Response Factory
```typescript
interface ErrorResponse {
  status: 'error';
  error: {
    code: string;
    message: string;
    details?: Record<string, any>;
    stack?: string;
  };
  meta?: {
    timestamp: string;
    command: string;
  };
}

function createErrorResponse(
  code: string,
  message: string,
  details?: Record<string, any>,
  stack?: string
): ErrorResponse {
  return {
    status: 'error',
    error: {
      code,
      message,
      details,
      stack: process.env.NODE_ENV === 'development' ? stack : undefined
    },
    meta: {
      timestamp: new Date().toISOString()
    }
  };
}
```

### Response Formatter
```typescript
function formatJsonResponse(
  response: SuccessResponse<any> | ErrorResponse,
  options: {
    pretty?: boolean;
    sortKeys?: boolean;
    nulls?: 'include' | 'omit';
  } = {}
): string {
  const { pretty = true, sortKeys = false, nulls = 'omit' } = options;

  const data = nulls === 'omit' ?
    JSON.parse(JSON.stringify(response, (key, value) => value ?? undefined)) :
    response;

  if (pretty) {
    return JSON.stringify(data, null, 2);
  }

  return JSON.stringify(data);
}
```

## 10. Testing JSON Output

### Schema Validation
```typescript
import { z } from 'zod';

const SuccessResponseSchema = z.object({
  status: z.literal('success'),
  data: z.any(),
  meta: z.object({
    timestamp: z.string(),
    command: z.string(),
    version: z.string()
  })
});

const ErrorResponseSchema = z.object({
  status: z.literal('error'),
  error: z.object({
    code: z.string(),
    message: z.string(),
    details: z.record(z.any()).optional()
  }),
  meta: z.object({
    timestamp: z.string()
  }).optional()
});

function validateResponse(response: unknown): void {
  if (SuccessResponseSchema.safeParse(response).success) {
    console.log('Valid success response');
  } else if (ErrorResponseSchema.safeParse(response).success) {
    console.log('Valid error response');
  } else {
    throw new Error('Invalid response format');
  }
}
```

This comprehensive guide provides a solid foundation for implementing robust, machine-readable JSON output in CLI tools designed for LLM agent consumption.