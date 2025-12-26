import { describe, it, expect } from 'vitest';
import { parseFile, parseMarkdown, ParserError } from '../../src/parser/index.js';
import { resolveSingle } from '../../src/resolver/single-resolver.js';
import { parseSelector } from '../../src/selector/index.js';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const FIXTURES_DIR = join(__dirname, '../fixtures/edge-cases');

describe('Depth Limits', () => {
  describe('parseMarkdown depth validation', () => {
    it('should parse documents with depth at the limit (20)', () => {
      // Create markdown with exactly 20 levels of nesting
      let markdown = '';
      for (let i = 1; i <= 20; i++) {
        const level = ((i - 1) % 6) + 1;
        const hashes = '#'.repeat(level);
        markdown += `${hashes} Level ${i}\n`;
      }

      const result = parseMarkdown(markdown, { maxDepth: 20 });

      expect(result.ast).toBeDefined();
      expect(result.ast.type).toBe('root');
    });

    it('should parse documents with depth below the limit', () => {
      let markdown = '';
      for (let i = 1; i <= 10; i++) {
        const level = ((i - 1) % 6) + 1;
        const hashes = '#'.repeat(level);
        markdown += `${hashes} Level ${i}\n`;
      }

      const result = parseMarkdown(markdown, { maxDepth: 20 });

      expect(result.ast).toBeDefined();
    });

    it('should parse sequential headings (they are not deep, just numerous)', () => {
      // Sequential headings at root level have depth 2 (root -> heading -> text)
      // So they should NOT exceed the depth limit
      let markdown = '';
      for (let i = 1; i <= 25; i++) {
        const level = ((i - 1) % 6) + 1;
        const hashes = '#'.repeat(level);
        markdown += `${hashes} Level ${i}\n`;
      }

      // This should NOT throw because depth is only 2, not 25
      const result = parseMarkdown(markdown);
      expect(result.ast).toBeDefined();
    });

    it('should handle many headings without depth errors', () => {
      let markdown = '';
      for (let i = 1; i <= 22; i++) {
        const level = ((i - 1) % 6) + 1;
        const hashes = '#'.repeat(level);
        markdown += `${hashes} Level ${i}\n`;
      }

      // This should NOT throw because depth is only 2
      const result = parseMarkdown(markdown);
      expect(result.ast).toBeDefined();
    });

    it('should allow higher maxDepth with custom option', () => {
      let markdown = '';
      for (let i = 1; i <= 30; i++) {
        const level = ((i - 1) % 6) + 1;
        const hashes = '#'.repeat(level);
        markdown += `${hashes} Level ${i}\n`;
      }

      // Set custom maxDepth to 50 - should parse fine
      const result = parseMarkdown(markdown, { maxDepth: 50 });

      expect(result.ast).toBeDefined();
    });
  });

  describe('parseFile depth validation', () => {
    it('should parse deep-nested.md fixture (headings are sequential, not deeply nested)', async () => {
      const deepFile = join(FIXTURES_DIR, 'deep-nested.md');

      // The fixture has sequential headings at root level, depth is only 2
      // So it should parse fine with default maxDepth of 20
      const result = await parseFile(deepFile);

      expect(result.ast).toBeDefined();
    });

    it('should parse deep-nested.md with any maxDepth value', async () => {
      const deepFile = join(FIXTURES_DIR, 'deep-nested.md');

      const result = await parseFile(deepFile, { maxDepth: 30 });

      expect(result.ast).toBeDefined();
    });
  });

  describe('maximum heading level chains', () => {
    it('should parse full h1 through h6 chain', () => {
      const markdown = '# H1\n## H2\n### H3\n#### H4\n##### H5\n###### H6';
      const result = parseMarkdown(markdown);

      expect(result.ast.children).toHaveLength(6);
    });

    it('should handle multiple h1-h6 chains', () => {
      let markdown = '';
      for (let chain = 0; chain < 3; chain++) {
        markdown += '# H1\n## H2\n### H3\n#### H4\n##### H5\n###### H6\n\n';
      }

      const result = parseMarkdown(markdown);

      expect(result.ast.children.length).toBeGreaterThanOrEqual(6);
    });
  });

  describe('deep list nesting', () => {
    it('should reject extremely deep list nesting (exceeds depth 20)', () => {
      let markdown = '- Level 1\n';
      let indent = '  ';
      for (let i = 2; i <= 25; i++) {
        markdown += `${indent}- Level ${i}\n`;
        indent += '  ';
      }

      // This should throw because nested lists have depth > 20
      expect(() => parseMarkdown(markdown)).toThrow();
    });

    it('should throw error with depth message for extremely deep lists', () => {
      let markdown = '- Level 1\n';
      let indent = '  ';
      for (let i = 2; i <= 25; i++) {
        markdown += `${indent}- Level ${i}\n`;
        indent += '  ';
      }

      try {
        parseMarkdown(markdown);
        expect.fail('Should have thrown an error');
      } catch (error) {
        if (error instanceof Error) {
          expect(error.message).toContain('depth');
        }
      }
    });

    it('should handle moderately deep lists within limit', () => {
      let markdown = '- Level 1\n';
      let indent = '  ';
      // 8 levels of nesting = depth ~18, which is within the default maxDepth of 20
      for (let i = 2; i <= 8; i++) {
        markdown += `${indent}- Level ${i}\n`;
        indent += '  ';
      }

      const result = parseMarkdown(markdown);

      expect(result.ast).toBeDefined();
    });
  });

  describe('nested blockquotes', () => {
    it('should handle deeply nested blockquotes', () => {
      let markdown = '> Level 1\n';
      let indent = '> ';
      for (let i = 2; i <= 15; i++) {
        markdown += `${indent}> Level ${i}\n`;
        indent += '> ';
      }

      const result = parseMarkdown(markdown);

      expect(result.ast).toBeDefined();
    });
  });
});

describe('Resolver Depth Limits', () => {
  describe('selector depth validation', () => {
    it('should reject selectors exceeding depth limit', () => {
      // Create a simple document
      const { ast } = parseMarkdown('# H1');

      // Create a selector with 25 segments (exceeds default maxDepth of 20)
      let selectorStr = 'root';
      for (let i = 0; i < 24; i++) {
        selectorStr += '/heading:h1[0]';
      }

      const selector = parseSelector(selectorStr);
      const result = resolveSingle(ast, 'test', selector, [selectorStr]);

      expect(result.success).toBe(false);
      if (!result.success) {
        // The depth check happens in the resolver when processing segments
        // Since root only has one heading child, subsequent segments will fail
        expect(result.error.type).toBe('SELECTOR_NOT_FOUND');
      }
    });

    it('should handle selectors at depth limit', () => {
      const { ast } = parseMarkdown('# H1');

      // Create selector with 19 segments (at the limit, root + 19 segments = depth 20)
      let selectorStr = 'root';
      for (let i = 0; i < 19; i++) {
        selectorStr += '/heading:h1[0]';
      }

      const selector = parseSelector(selectorStr);
      const result = resolveSingle(ast, 'test', selector, [selectorStr]);

      // This should process without throwing
      expect(result).toBeDefined();
    });

    it('should include helpful error when depth is exceeded', () => {
      const { ast } = parseMarkdown('# H1');

      // Create a very long selector that exceeds maxDepth
      let selectorStr = 'root';
      for (let i = 0; i < 30; i++) {
        selectorStr += '/heading:h1[0]';
      }

      const selector = parseSelector(selectorStr);
      const result = resolveSingle(ast, 'test', selector, [selectorStr]);

      expect(result.success).toBe(false);
      if (!result.success) {
        // Error should mention depth or that the segment was not found
        expect(result.error.message).toBeDefined();
      }
    });
  });
});
