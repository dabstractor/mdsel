import { describe, it, expect } from 'vitest';
import {
  formatIndexResponse,
  formatSelectResponse,
  formatErrorResponse,
  createErrorEntry,
  createTimestamp,
  omitNullFields,
  createResponseEnvelope,
} from '../../src/output/index.js';
import type {
  CLIResponse,
  IndexResponse,
  SelectResponse,
  DocumentIndex,
  IndexSummary,
  SelectMatch,
  UnresolvedSelector,
  ErrorEntry,
} from '../../src/output/types.js';

describe('createTimestamp', () => {
  it('should return ISO 8601 formatted string', () => {
    const timestamp = createTimestamp();

    expect(typeof timestamp).toBe('string');
    // ISO 8601 format: YYYY-MM-DDTHH:mm:ss.sssZ
    expect(timestamp).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/);
  });

  it('should include timezone information', () => {
    const timestamp = createTimestamp();

    expect(timestamp.endsWith('Z')).toBe(true);
  });
});

describe('omitNullFields', () => {
  it('should remove null values from object', () => {
    const input = {
      a: 'value',
      b: null,
      c: 123,
      d: null,
    };

    const result = omitNullFields(input);

    expect(result).toEqual({ a: 'value', c: 123 });
  });

  it('should preserve zero and false values', () => {
    const input = {
      a: 0,
      b: false,
      c: '',
      d: null,
    };

    const result = omitNullFields(input);

    expect(result).toEqual({ a: 0, b: false, c: '' });
  });

  it('should return empty object when all values are null', () => {
    const input = {
      a: null,
      b: null,
    };

    const result = omitNullFields(input);

    expect(result).toEqual({});
  });

  it('should return same object when no null values', () => {
    const input = {
      a: 'value',
      b: 123,
      c: true,
    };

    const result = omitNullFields(input);

    expect(result).toEqual(input);
  });
});

describe('createResponseEnvelope', () => {
  it('should create base response envelope', () => {
    const envelope = createResponseEnvelope('index', true);

    expect(envelope.success).toBe(true);
    expect(envelope.command).toBe('index');
    expect(typeof envelope.timestamp).toBe('string');
    expect(envelope.timestamp).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/);
  });

  it('should create error envelope', () => {
    const envelope = createResponseEnvelope('select', false);

    expect(envelope.success).toBe(false);
    expect(envelope.command).toBe('select');
    expect(typeof envelope.timestamp).toBe('string');
  });
});

describe('formatIndexResponse', () => {
  const mockDocument: DocumentIndex = {
    namespace: 'readme',
    file_path: 'README.md',
    root: null,
    headings: [],
    blocks: {
      paragraphs: 5,
      code_blocks: 2,
      lists: 1,
      tables: 0,
      blockquotes: 1,
    },
  };

  const mockSummary: IndexSummary = {
    total_documents: 1,
    total_nodes: 5,
    total_selectors: 5,
  };

  it('should return valid JSON with correct structure', () => {
    const response = formatIndexResponse([mockDocument], mockSummary);

    expect(response).toBeDefined();
    expect(response.success).toBe(true);
    expect(response.command).toBe('index');
    expect(response.data).toBeDefined();
  });

  it('should include all required fields', () => {
    const response = formatIndexResponse([mockDocument], mockSummary);

    expect(response.success).toBe(true);
    expect(response.command).toBe('index');
    expect(response.timestamp).toBeDefined();
    expect(typeof response.timestamp).toBe('string');
    expect(response.data).toBeDefined();
  });

  it('should have ISO 8601 timestamp', () => {
    const response = formatIndexResponse([mockDocument], mockSummary);

    expect(response.timestamp).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/);
  });

  it('should preserve documents array', () => {
    const response = formatIndexResponse([mockDocument], mockSummary);

    expect(response.data?.documents).toEqual([mockDocument]);
  });

  it('should include summary object', () => {
    const response = formatIndexResponse([mockDocument], mockSummary);

    expect(response.data?.summary).toEqual(mockSummary);
  });

  it('should omit null fields', () => {
    const response = formatIndexResponse([mockDocument], mockSummary);

    expect(response.partial_results).toBeUndefined();
    expect(response.unresolved_selectors).toBeUndefined();
    expect(response.warnings).toBeUndefined();
    expect(response.errors).toBeUndefined();
  });

  it('should serialize to valid JSON', () => {
    const response = formatIndexResponse([mockDocument], mockSummary);

    expect(() => JSON.stringify(response)).not.toThrow();
    const json = JSON.stringify(response);
    const parsed = JSON.parse(json);
    expect(parsed.success).toBe(true);
  });
});

describe('formatSelectResponse', () => {
  const mockMatch: SelectMatch = {
    selector: 'readme::heading:h2[0]',
    type: 'heading:h2',
    content: '## Installation\n\nTo install the package, run:\n\n```bash\nnpm install mdsel\n```',
    truncated: false,
    children_available: [
      {
        selector: 'readme::heading:h2[0]/block:paragraph[0]',
        type: 'block:paragraph',
        preview: 'To install the package, run:',
      },
      {
        selector: 'readme::heading:h2[0]/block:code[0]',
        type: 'block:code',
        preview: 'npm install mdsel',
      },
    ],
  };

  it('should return valid JSON with correct structure', () => {
    const response = formatSelectResponse([mockMatch], []);

    expect(response).toBeDefined();
    expect(response.success).toBe(true);
    expect(response.command).toBe('select');
    expect(response.data).toBeDefined();
  });

  it('should include matches array', () => {
    const response = formatSelectResponse([mockMatch], []);

    expect(response.data?.matches).toEqual([mockMatch]);
  });

  it('should include unresolved array', () => {
    const mockUnresolved: UnresolvedSelector = {
      selector: 'readme::heading:h2[99]',
      reason: 'Index out of range: document has 5 h2 headings',
      suggestions: ['readme::heading:h2[0]', 'readme::heading:h2[1]'],
    };

    const response = formatSelectResponse([mockMatch], [mockUnresolved]);

    expect(response.data?.unresolved).toEqual([mockUnresolved]);
  });

  it('should set success to false when unresolved present', () => {
    const mockUnresolved: UnresolvedSelector = {
      selector: 'readme::heading:h2[99]',
      reason: 'Index out of range',
      suggestions: [],
    };

    const response = formatSelectResponse([mockMatch], [mockUnresolved]);

    expect(response.success).toBe(false);
  });

  it('should include unresolved_selectors when unresolved present', () => {
    const mockUnresolved: UnresolvedSelector = {
      selector: 'readme::heading:h2[99]',
      reason: 'Index out of range',
      suggestions: [],
    };

    const response = formatSelectResponse([mockMatch], [mockUnresolved]);

    expect(response.unresolved_selectors).toEqual(['readme::heading:h2[99]']);
  });

  it('should omit unresolved_selectors when no unresolved', () => {
    const response = formatSelectResponse([mockMatch], []);

    expect(response.unresolved_selectors).toBeUndefined();
  });

  it('should have ISO 8601 timestamp', () => {
    const response = formatSelectResponse([mockMatch], []);

    expect(response.timestamp).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/);
  });

  it('should serialize to valid JSON', () => {
    const response = formatSelectResponse([mockMatch], []);

    expect(() => JSON.stringify(response)).not.toThrow();
    const json = JSON.stringify(response);
    const parsed = JSON.parse(json);
    expect(parsed.success).toBe(true);
  });

  it('should handle empty matches and unresolved', () => {
    const response = formatSelectResponse([], []);

    expect(response.data?.matches).toEqual([]);
    expect(response.data?.unresolved).toEqual([]);
    expect(response.success).toBe(true);
  });
});

describe('formatErrorResponse', () => {
  const mockErrors: ErrorEntry[] = [
    {
      type: 'FILE_NOT_FOUND',
      code: 'ENOENT',
      file: 'missing.md',
      message: 'File not found: missing.md',
    },
  ];

  it('should return valid JSON with correct structure', () => {
    const response = formatErrorResponse('index', mockErrors);

    expect(response).toBeDefined();
    expect(response.success).toBe(false);
    expect(response.command).toBe('index');
  });

  it('should have success set to false', () => {
    const response = formatErrorResponse('select', mockErrors);

    expect(response.success).toBe(false);
  });

  it('should have data set to null', () => {
    const response = formatErrorResponse('index', mockErrors);

    expect(response.data).toBe(null);
  });

  it('should include errors array', () => {
    const response = formatErrorResponse('select', mockErrors);

    expect(response.errors).toEqual(mockErrors);
  });

  it('should include partial_results when provided', () => {
    const partialResults = [{ namespace: 'readme', file_path: 'README.md' }];
    const response = formatErrorResponse('index', mockErrors, partialResults as any);

    expect(response.partial_results).toEqual(partialResults);
  });

  it('should omit partial_results when empty', () => {
    const response = formatErrorResponse('index', mockErrors);

    expect(response.partial_results).toBeUndefined();
  });

  it('should have ISO 8601 timestamp', () => {
    const response = formatErrorResponse('select', mockErrors);

    expect(response.timestamp).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/);
  });

  it('should serialize to valid JSON', () => {
    const response = formatErrorResponse('index', mockErrors);

    expect(() => JSON.stringify(response)).not.toThrow();
    const json = JSON.stringify(response);
    const parsed = JSON.parse(json);
    expect(parsed.success).toBe(false);
    expect(parsed.data).toBe(null);
  });
});

describe('createErrorEntry', () => {
  it('should create valid ErrorEntry object', () => {
    const entry = createErrorEntry(
      'FILE_NOT_FOUND',
      'ENOENT',
      'File not found: test.md'
    );

    expect(entry.type).toBe('FILE_NOT_FOUND');
    expect(entry.code).toBe('ENOENT');
    expect(entry.message).toBe('File not found: test.md');
  });

  it('should include file when provided', () => {
    const entry = createErrorEntry(
      'FILE_NOT_FOUND',
      'ENOENT',
      'File not found',
      'test.md'
    );

    expect(entry.file).toBe('test.md');
  });

  it('should include selector when provided', () => {
    const entry = createErrorEntry(
      'SELECTOR_NOT_FOUND',
      'NOT_FOUND',
      'Selector not found',
      undefined,
      'test::h2[99]'
    );

    expect(entry.selector).toBe('test::h2[99]');
  });

  it('should include suggestions when provided', () => {
    const suggestions = ['test::h2[0]', 'test::h2[1]'];
    const entry = createErrorEntry(
      'SELECTOR_NOT_FOUND',
      'NOT_FOUND',
      'Selector not found',
      undefined,
      undefined,
      suggestions
    );

    expect(entry.suggestions).toEqual(suggestions);
  });

  it('should omit optional fields when not provided', () => {
    const entry = createErrorEntry(
      'PARSE_ERROR',
      'SYNTAX_ERROR',
      'Invalid syntax'
    );

    expect(entry.file).toBeUndefined();
    expect(entry.selector).toBeUndefined();
    expect(entry.suggestions).toBeUndefined();
  });

  it('should omit null optional fields', () => {
    const entry = createErrorEntry(
      'PARSE_ERROR',
      'SYNTAX_ERROR',
      'Invalid syntax',
      undefined,
      undefined,
      undefined
    );

    expect(entry.file).toBeUndefined();
    expect(entry.selector).toBeUndefined();
    expect(entry.suggestions).toBeUndefined();
  });
});

describe('Integration tests', () => {
  it('should create and validate complete index response', () => {
    const documents: DocumentIndex[] = [
      {
        namespace: 'readme',
        file_path: 'README.md',
        root: {
          selector: 'readme::root',
          type: 'root',
          content_preview: 'This is a project...',
          truncated: false,
          children_count: 2,
          word_count: 45,
        },
        headings: [
          {
            selector: 'readme::heading:h1[0]',
            type: 'heading:h1',
            depth: 1,
            text: 'Project Title',
            content_preview: 'Project Title',
            truncated: false,
            children_count: 5,
            word_count: 2,
            section_word_count: 350,
            section_truncated: false,
          },
        ],
        blocks: {
          paragraphs: 8,
          code_blocks: 3,
          lists: 2,
          tables: 1,
          blockquotes: 0,
        },
      },
    ];

    const summary: IndexSummary = {
      total_documents: 1,
      total_nodes: 15,
      total_selectors: 15,
    };

    const response = formatIndexResponse(documents, summary);

    // Verify response structure
    expect(response.success).toBe(true);
    expect(response.command).toBe('index');
    expect(response.data?.documents).toHaveLength(1);
    expect(response.data?.summary.total_documents).toBe(1);

    // Verify JSON serializability
    const json = JSON.stringify(response);
    const parsed = JSON.parse(json) as CLIResponse<IndexResponse>;
    expect(parsed.success).toBe(true);
    expect(parsed.data?.documents[0]?.headings[0]?.depth).toBe(1);
  });

  it('should create and validate complete select response with pagination', () => {
    const matches: SelectMatch[] = [
      {
        selector: 'docs::section[5]',
        type: 'section',
        content: '## API Reference\n\nThis section documents all available API methods...',
        truncated: true,
        pagination: {
          current_page: 1,
          total_pages: 4,
          word_count: 500,
          has_more: true,
        },
        children_available: [
          {
            selector: 'docs::section[5]/page[0]',
            type: 'page',
            preview: 'Page 1 of 4 (500 words)',
          },
        ],
      },
    ];

    const response = formatSelectResponse(matches, []);

    // Verify response structure
    expect(response.success).toBe(true);
    expect(response.data?.matches[0].truncated).toBe(true);
    expect(response.data?.matches[0].pagination?.current_page).toBe(1);

    // Verify JSON serializability
    const json = JSON.stringify(response);
    const parsed = JSON.parse(json) as CLIResponse<SelectResponse>;
    expect(parsed.data?.matches[0]?.pagination?.has_more).toBe(true);
  });

  it('should create and validate error response with suggestions', () => {
    const errors: ErrorEntry[] = [
      {
        type: 'SELECTOR_NOT_FOUND',
        code: 'NOT_FOUND',
        selector: 'readme::heading:h2[99]',
        message: 'Index out of range: document has 5 h2 headings',
        suggestions: ['readme::heading:h2[0]', 'readme::heading:h2[1]'],
      },
    ];

    const response = formatErrorResponse('select', errors);

    // Verify response structure
    expect(response.success).toBe(false);
    expect(response.data).toBe(null);
    expect(response.errors?.[0]?.suggestions).toHaveLength(2);

    // Verify JSON serializability
    const json = JSON.stringify(response);
    const parsed = JSON.parse(json) as CLIResponse<null>;
    expect(parsed.errors?.[0]?.code).toBe('NOT_FOUND');
  });
});
