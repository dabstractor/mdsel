import { describe, it, expect } from 'vitest';
import type {
  CLIResponse,
  IndexResponse,
  SelectResponse,
  ErrorEntry,
  ErrorType,
  DocumentIndex,
  NodeDescriptor,
  HeadingDescriptor,
  BlockSummary,
  IndexSummary,
  SelectMatch,
  PaginationInfo,
  ChildInfo,
  UnresolvedSelector,
} from '../../src/output/types.js';

describe('Output Types', () => {
  describe('CLIResponse', () => {
    it('should accept valid index response structure', () => {
      const response: CLIResponse<IndexResponse> = {
        success: true,
        command: 'index',
        timestamp: '2024-12-25T22:03:00.000Z',
        data: {
          documents: [],
          summary: {
            total_documents: 0,
            total_nodes: 0,
            total_selectors: 0,
          },
        },
      };

      expect(response.success).toBe(true);
      expect(response.command).toBe('index');
    });

    it('should accept valid select response structure', () => {
      const response: CLIResponse<SelectResponse> = {
        success: true,
        command: 'select',
        timestamp: '2024-12-25T22:03:00.000Z',
        data: {
          matches: [],
          unresolved: [],
        },
      };

      expect(response.success).toBe(true);
      expect(response.command).toBe('select');
    });

    it('should accept error response with null data', () => {
      const response: CLIResponse<null> = {
        success: false,
        command: 'select',
        timestamp: '2024-12-25T22:03:00.000Z',
        data: null,
        errors: [
          {
            type: 'SELECTOR_NOT_FOUND',
            code: 'NOT_FOUND',
            message: 'Selector not found',
          },
        ],
      };

      expect(response.success).toBe(false);
      expect(response.data).toBe(null);
    });

    it('should accept optional partial_results field', () => {
      const response: CLIResponse<IndexResponse> = {
        success: false,
        command: 'index',
        timestamp: '2024-12-25T22:03:00.000Z',
        data: {
          documents: [],
          summary: {
            total_documents: 0,
            total_nodes: 0,
            total_selectors: 0,
          },
        },
        partial_results: [
          {
            documents: [],
            summary: {
              total_documents: 1,
              total_nodes: 5,
              total_selectors: 5,
            },
          },
        ],
        errors: [],
      };

      expect(response.partial_results).toBeDefined();
      expect(response.partial_results?.length).toBe(1);
    });

    it('should accept optional unresolved_selectors field', () => {
      const response: CLIResponse<SelectResponse> = {
        success: false,
        command: 'select',
        timestamp: '2024-12-25T22:03:00.000Z',
        data: {
          matches: [],
          unresolved: [],
        },
        unresolved_selectors: ['readme::heading:h2[99]'],
      };

      expect(response.unresolved_selectors).toEqual(['readme::heading:h2[99]']);
    });

    it('should accept optional warnings field', () => {
      const response: CLIResponse<IndexResponse> = {
        success: true,
        command: 'index',
        timestamp: '2024-12-25T22:03:00.000Z',
        data: {
          documents: [],
          summary: {
            total_documents: 0,
            total_nodes: 0,
            total_selectors: 0,
          },
        },
        warnings: ['1 of 2 files could not be processed'],
      };

      expect(response.warnings).toEqual(['1 of 2 files could not be processed']);
    });

    it('should accept optional errors field', () => {
      const response: CLIResponse<IndexResponse> = {
        success: false,
        command: 'index',
        timestamp: '2024-12-25T22:03:00.000Z',
        data: {
          documents: [],
          summary: {
            total_documents: 0,
            total_nodes: 0,
            total_selectors: 0,
          },
        },
        errors: [
          {
            type: 'FILE_NOT_FOUND',
            code: 'ENOENT',
            file: 'missing.md',
            message: 'File not found: missing.md',
          },
        ],
      };

      expect(response.errors).toBeDefined();
      expect(response.errors?.length).toBe(1);
    });
  });

  describe('ErrorEntry', () => {
    it('should accept entry with all fields', () => {
      const entry: ErrorEntry = {
        type: 'SELECTOR_NOT_FOUND',
        code: 'NOT_FOUND',
        message: 'Selector not found',
        file: 'test.md',
        selector: 'test::h2[99]',
        suggestions: ['test::h2[0]', 'test::h2[1]'],
      };

      expect(entry.type).toBe('SELECTOR_NOT_FOUND');
      expect(entry.file).toBe('test.md');
      expect(entry.selector).toBe('test::h2[99]');
      expect(entry.suggestions).toHaveLength(2);
    });

    it('should accept entry with only required fields', () => {
      const entry: ErrorEntry = {
        type: 'PARSE_ERROR',
        code: 'SYNTAX_ERROR',
        message: 'Invalid syntax',
      };

      expect(entry.type).toBe('PARSE_ERROR');
      expect(entry.code).toBe('SYNTAX_ERROR');
      expect(entry.message).toBe('Invalid syntax');
      expect(entry.file).toBeUndefined();
      expect(entry.selector).toBeUndefined();
      expect(entry.suggestions).toBeUndefined();
    });
  });

  describe('ErrorType', () => {
    const validErrorTypes: ErrorType[] = [
      'FILE_NOT_FOUND',
      'PARSE_ERROR',
      'INVALID_SELECTOR',
      'SELECTOR_NOT_FOUND',
      'NAMESPACE_NOT_FOUND',
      'PROCESSING_ERROR',
    ];

    it('should accept all valid error types', () => {
      validErrorTypes.forEach((type) => {
        const entry: ErrorEntry = {
          type,
          code: 'TEST',
          message: 'Test message',
        };
        expect(entry.type).toBe(type);
      });
    });
  });

  describe('DocumentIndex', () => {
    it('should accept complete document index', () => {
      const doc: DocumentIndex = {
        namespace: 'readme',
        file_path: 'README.md',
        root: {
          selector: 'readme::root',
          type: 'root',
          content_preview: 'Project overview',
          truncated: false,
          children_count: 5,
          word_count: 100,
        },
        headings: [
          {
            selector: 'readme::heading:h1[0]',
            type: 'heading:h1',
            depth: 1,
            text: 'Introduction',
            content_preview: 'Introduction',
            truncated: false,
            children_count: 3,
            word_count: 2,
            section_word_count: 250,
            section_truncated: false,
          },
        ],
        blocks: {
          paragraphs: 5,
          code_blocks: 2,
          lists: 1,
          tables: 0,
          blockquotes: 1,
        },
      };

      expect(doc.namespace).toBe('readme');
      expect(doc.headings).toHaveLength(1);
      expect(doc.blocks.paragraphs).toBe(5);
    });

    it('should accept document with null root', () => {
      const doc: DocumentIndex = {
        namespace: 'test',
        file_path: 'test.md',
        root: null,
        headings: [],
        blocks: {
          paragraphs: 0,
          code_blocks: 0,
          lists: 0,
          tables: 0,
          blockquotes: 0,
        },
      };

      expect(doc.root).toBe(null);
    });
  });

  describe('HeadingDescriptor', () => {
    it('should accept all heading depths (1-6)', () => {
      const depths: Array<1 | 2 | 3 | 4 | 5 | 6> = [1, 2, 3, 4, 5, 6];

      depths.forEach((depth) => {
        const heading: HeadingDescriptor = {
          selector: `test::heading:h${depth}[0]`,
          type: `heading:h${depth}`,
          depth,
          text: `Heading ${depth}`,
          content_preview: `Heading ${depth}`,
          truncated: false,
          children_count: 0,
          word_count: 2,
          section_word_count: 100,
          section_truncated: false,
        };

        expect(heading.depth).toBe(depth);
      });
    });
  });

  describe('BlockSummary', () => {
    it('should accept all block counts', () => {
      const blocks: BlockSummary = {
        paragraphs: 10,
        code_blocks: 5,
        lists: 3,
        tables: 2,
        blockquotes: 1,
      };

      expect(blocks.paragraphs).toBe(10);
      expect(blocks.code_blocks).toBe(5);
      expect(blocks.lists).toBe(3);
      expect(blocks.tables).toBe(2);
      expect(blocks.blockquotes).toBe(1);
    });
  });

  describe('SelectMatch', () => {
    it('should accept match with pagination', () => {
      const match: SelectMatch = {
        selector: 'docs::section[5]',
        type: 'section',
        content: 'Long content...',
        truncated: true,
        pagination: {
          current_page: 1,
          total_pages: 4,
          word_count: 500,
          has_more: true,
        },
        children_available: [],
      };

      expect(match.truncated).toBe(true);
      expect(match.pagination?.current_page).toBe(1);
      expect(match.pagination?.has_more).toBe(true);
    });

    it('should accept match without pagination', () => {
      const match: SelectMatch = {
        selector: 'readme::heading:h2[0]',
        type: 'heading:h2',
        content: '## Installation\n\nContent here',
        truncated: false,
        children_available: [
          {
            selector: 'readme::heading:h2[0]/block:paragraph[0]',
            type: 'block:paragraph',
            preview: 'Content here',
          },
        ],
      };

      expect(match.truncated).toBe(false);
      expect(match.pagination).toBeUndefined();
      expect(match.children_available).toHaveLength(1);
    });
  });

  describe('PaginationInfo', () => {
    it('should accept complete pagination info', () => {
      const pagination: PaginationInfo = {
        current_page: 2,
        total_pages: 5,
        word_count: 450,
        has_more: true,
      };

      expect(pagination.current_page).toBe(2);
      expect(pagination.total_pages).toBe(5);
      expect(pagination.word_count).toBe(450);
      expect(pagination.has_more).toBe(true);
    });

    it('should accept last page (has_more: false)', () => {
      const pagination: PaginationInfo = {
        current_page: 5,
        total_pages: 5,
        word_count: 200,
        has_more: false,
      };

      expect(pagination.has_more).toBe(false);
    });

    it('should accept first page (current_page: 1)', () => {
      const pagination: PaginationInfo = {
        current_page: 1,
        total_pages: 10,
        word_count: 500,
        has_more: true,
      };

      expect(pagination.current_page).toBe(1);
    });
  });

  describe('UnresolvedSelector', () => {
    it('should accept complete unresolved selector', () => {
      const unresolved: UnresolvedSelector = {
        selector: 'readme::heading:h2[99]',
        reason: 'Index out of range: document has 5 h2 headings',
        suggestions: [
          'readme::heading:h2[0]',
          'readme::heading:h2[1]',
          'readme::heading:h2[2]',
        ],
      };

      expect(unresolved.selector).toBe('readme::heading:h2[99]');
      expect(unresolved.suggestions).toHaveLength(3);
    });

    it('should accept unresolved with empty suggestions', () => {
      const unresolved: UnresolvedSelector = {
        selector: 'unknown::heading:h1[0]',
        reason: 'Namespace not found',
        suggestions: [],
      };

      expect(unresolved.suggestions).toEqual([]);
    });
  });

  describe('Type safety validation', () => {
    it('should correctly type IndexResponse', () => {
      const data: IndexResponse = {
        documents: [
          {
            namespace: 'test',
            file_path: 'test.md',
            root: null,
            headings: [],
            blocks: {
              paragraphs: 0,
              code_blocks: 0,
              lists: 0,
              tables: 0,
              blockquotes: 0,
            },
          },
        ],
        summary: {
          total_documents: 1,
          total_nodes: 0,
          total_selectors: 0,
        },
      };

      expect(data.documents).toBeDefined();
      expect(data.summary).toBeDefined();
    });

    it('should correctly type SelectResponse', () => {
      const data: SelectResponse = {
        matches: [
          {
            selector: 'test::heading:h1[0]',
            type: 'heading:h1',
            content: '# Test',
            truncated: false,
            children_available: [],
          },
        ],
        unresolved: [],
      };

      expect(data.matches).toBeDefined();
      expect(data.unresolved).toBeDefined();
    });

    it('should correctly type generic CLIResponse', () => {
      const stringResponse: CLIResponse<string> = {
        success: true,
        command: 'index',
        timestamp: '2024-12-25T22:03:00.000Z',
        data: 'simple string data',
      };

      const numberResponse: CLIResponse<number> = {
        success: true,
        command: 'select',
        timestamp: '2024-12-25T22:03:00.000Z',
        data: 42,
      };

      expect(stringResponse.data).toBe('simple string data');
      expect(numberResponse.data).toBe(42);
    });
  });
});
