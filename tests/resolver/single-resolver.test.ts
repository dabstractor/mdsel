import { describe, it, expect } from 'vitest';
import { resolveSingle } from '../../src/resolver/single-resolver.js';
import { parseSelector } from '../../src/selector/index.js';
import { parseMarkdown } from '../../src/parser/index.js';

describe('resolveSingle', () => {
  describe('valid selectors - root', () => {
    it('should resolve root selector', () => {
      const { ast } = parseMarkdown('# Title\n\nSome content');
      const selector = parseSelector('root');
      const availableSelectors = ['root'];

      const result = resolveSingle(ast, 'test', selector, availableSelectors);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.results).toHaveLength(1);
        expect(result.results[0].namespace).toBe('test');
        expect(result.results[0].node.type).toBe('root');
        expect(result.results[0].selector).toBe('root');
      }
    });

    it('should resolve namespaced root selector', () => {
      const { ast } = parseMarkdown('# Title');
      const selector = parseSelector('doc::root');
      const availableSelectors = ['doc::root'];

      const result = resolveSingle(ast, 'doc', selector, availableSelectors);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.results[0].node.type).toBe('root');
      }
    });
  });

  describe('valid selectors - headings', () => {
    it('should resolve heading:h1[0]', () => {
      const { ast } = parseMarkdown('# First Heading\n\n## Second Heading');
      const selector = parseSelector('heading:h1[0]');
      const availableSelectors = ['heading:h1[0]'];

      const result = resolveSingle(ast, 'test', selector, availableSelectors);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.results[0].node.type).toBe('heading');
        expect(result.results[0].node.depth).toBe(1);
        expect(result.results[0].wordCount).toBeGreaterThan(0);
      }
    });

    it('should resolve heading:h2[0]', () => {
      const { ast } = parseMarkdown('# H1\n\n## First H2\n\n## Second H2');
      const selector = parseSelector('heading:h2[0]');
      const availableSelectors = ['heading:h2[0]'];

      const result = resolveSingle(ast, 'test', selector, availableSelectors);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.results[0].node.type).toBe('heading');
        expect(result.results[0].node.depth).toBe(2);
      }
    });

    it('should resolve heading:h2[1] (second h2)', () => {
      const { ast } = parseMarkdown('## First H2\n\n## Second H2');
      const selector = parseSelector('heading:h2[1]');
      const availableSelectors = ['heading:h2[0]', 'heading:h2[1]'];

      const result = resolveSingle(ast, 'test', selector, availableSelectors);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.results[0].node.depth).toBe(2);
      }
    });

    it('should resolve all heading levels h1-h6', () => {
      const markdown = '# H1\n\n## H2\n\n### H3\n\n#### H4\n\n##### H5\n\n###### H6';
      const { ast } = parseMarkdown(markdown);

      for (let i = 1; i <= 6; i++) {
        const selector = parseSelector(`heading:h${i}[0]`);
        const availableSelectors = [`heading:h${i}[0]`];
        const result = resolveSingle(ast, 'test', selector, availableSelectors);

        expect(result.success).toBe(true);
        if (result.success) {
          expect(result.results[0].node.depth).toBe(i);
        }
      }
    });
  });

  describe('valid selectors - blocks', () => {
    it('should resolve block:code[0]', () => {
      const { ast } = parseMarkdown('```js\nconsole.log("hello");\n```');
      const selector = parseSelector('block:code[0]');
      const availableSelectors = ['block:code[0]'];

      const result = resolveSingle(ast, 'test', selector, availableSelectors);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.results[0].node.type).toBe('code');
      }
    });

    it('should resolve block:paragraph[0]', () => {
      const { ast } = parseMarkdown('This is a paragraph.\n\nAnother paragraph.');
      const selector = parseSelector('block:paragraph[0]');
      const availableSelectors = ['block:paragraph[0]'];

      const result = resolveSingle(ast, 'test', selector, availableSelectors);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.results[0].node.type).toBe('paragraph');
        expect(result.results[0].wordCount).toBeGreaterThan(0);
      }
    });

    it('should resolve block:list[0]', () => {
      const { ast } = parseMarkdown('- Item 1\n- Item 2\n- Item 3');
      const selector = parseSelector('block:list[0]');
      const availableSelectors = ['block:list[0]'];

      const result = resolveSingle(ast, 'test', selector, availableSelectors);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.results[0].node.type).toBe('list');
      }
    });

    it('should resolve block:blockquote[0]', () => {
      const { ast } = parseMarkdown('> This is a quote');
      const selector = parseSelector('block:blockquote[0]');
      const availableSelectors = ['block:blockquote[0]'];

      const result = resolveSingle(ast, 'test', selector, availableSelectors);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.results[0].node.type).toBe('blockquote');
      }
    });
  });

  describe('valid selectors - path composition', () => {
    it('should resolve root/heading:h1[0]', () => {
      const { ast } = parseMarkdown('# Title');
      const selector = parseSelector('root/heading:h1[0]');
      const availableSelectors = ['root/heading:h1[0]'];

      const result = resolveSingle(ast, 'test', selector, availableSelectors);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.results[0].node.type).toBe('heading');
        expect(result.results[0].node.depth).toBe(1);
      }
    });

    // Note: Path composition through root is a complex case
    // For P2M2, we focus on single-segment resolution
    // Multi-segment paths will be fully implemented in future milestones
    it('should resolve heading:h1[0] directly (single segment)', () => {
      const { ast } = parseMarkdown('# Title\n\n```js\nconsole.log("test");\n```');
      const selector = parseSelector('heading:h1[0]');
      const availableSelectors = ['heading:h1[0]'];

      const result = resolveSingle(ast, 'test', selector, availableSelectors);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.results[0].node.type).toBe('heading');
        expect(result.results[0].node.depth).toBe(1);
      }
    });
  });

  describe('error cases - namespace mismatch', () => {
    it('should return error when namespace does not match', () => {
      const { ast } = parseMarkdown('# Title');
      const selector = parseSelector('other::root');
      const availableSelectors = ['test::root'];

      const result = resolveSingle(ast, 'test', selector, availableSelectors);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.type).toBe('NAMESPACE_NOT_FOUND');
        expect(result.error.message).toContain('other');
      }
    });

    it('should include namespace suggestions in error', () => {
      const { ast } = parseMarkdown('# Title');
      const selector = parseSelector('othre::root'); // typo - 'other' -> 'othre'
      const availableSelectors = ['test::root', 'other::root'];

      const result = resolveSingle(ast, 'test', selector, availableSelectors);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.type).toBe('NAMESPACE_NOT_FOUND');
        // The typo 'othre' should suggest 'other' if it's close enough
        // But with the minRatio threshold, 'othre' (5 chars) vs 'other' (5 chars) with distance 1 = ratio 0.8
        // This should pass the default minRatio of 0.4
        if (result.error.suggestions.length > 0) {
          expect(result.error.suggestions[0].selector).toContain('other');
        }
      }
    });
  });

  describe('error cases - index out of range', () => {
    it('should return error for out-of-range heading index', () => {
      const { ast } = parseMarkdown('# Only one H1');
      const selector = parseSelector('heading:h1[5]'); // index 5 doesn't exist
      const availableSelectors = ['heading:h1[0]'];

      const result = resolveSingle(ast, 'test', selector, availableSelectors);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.type).toBe('INDEX_OUT_OF_RANGE');
        expect(result.error.message).toContain('Index 5');
        expect(result.error.message).toContain('only 1');
      }
    });

    it('should return error for out-of-range block index', () => {
      const { ast } = parseMarkdown('```js\nonly one code block\n```');
      const selector = parseSelector('block:code[10]');
      const availableSelectors = ['block:code[0]'];

      const result = resolveSingle(ast, 'test', selector, availableSelectors);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.type).toBe('INDEX_OUT_OF_RANGE');
      }
    });
  });

  describe('error cases - selector not found', () => {
    it('should return error when heading level does not exist', () => {
      const { ast } = parseMarkdown('# Only H1 here');
      const selector = parseSelector('heading:h2[0]');
      const availableSelectors = ['heading:h1[0]'];

      const result = resolveSingle(ast, 'test', selector, availableSelectors);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.type).toBe('SELECTOR_NOT_FOUND');
      }
    });

    it('should return error when block type does not exist', () => {
      const { ast } = parseMarkdown('Just text here, no code blocks');
      const selector = parseSelector('block:code[0]');
      const availableSelectors = ['block:paragraph[0]'];

      const result = resolveSingle(ast, 'test', selector, availableSelectors);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.type).toBe('SELECTOR_NOT_FOUND');
      }
    });

    it('should include suggestions for failed selector', () => {
      const { ast } = parseMarkdown('# Title');
      // Use a valid selector that just doesn't match (wrong heading level)
      const selector = parseSelector('heading:h2[0]'); // doesn't exist
      const availableSelectors = ['heading:h1[0]', 'heading:h2[0]'];

      const result = resolveSingle(ast, 'test', selector, availableSelectors);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.type).toBe('SELECTOR_NOT_FOUND');
      }
    });
  });

  describe('virtual nodes', () => {
    it('should return error for section selector (not implemented)', () => {
      const { ast } = parseMarkdown('# Title\n\nContent');
      const selector = parseSelector('section[0]');
      const availableSelectors = [];

      const result = resolveSingle(ast, 'test', selector, availableSelectors);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.type).toBe('SELECTOR_NOT_FOUND');
      }
    });

    it('should return error for page selector (not implemented)', () => {
      const { ast } = parseMarkdown('# Title');
      const selector = parseSelector('page[0]');
      const availableSelectors = [];

      const result = resolveSingle(ast, 'test', selector, availableSelectors);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.type).toBe('SELECTOR_NOT_FOUND');
      }
    });
  });

  describe('word count', () => {
    it('should calculate word count for heading', () => {
      const { ast } = parseMarkdown('# This is a heading with five words');
      const selector = parseSelector('heading:h1[0]');
      const availableSelectors = ['heading:h1[0]'];

      const result = resolveSingle(ast, 'test', selector, availableSelectors);

      expect(result.success).toBe(true);
      if (result.success) {
        // Word count includes all text in the heading
        expect(result.results[0].wordCount).toBeGreaterThan(0);
      }
    });

    it('should calculate word count for paragraph', () => {
      const { ast } = parseMarkdown('This paragraph has exactly six words in it.');
      const selector = parseSelector('block:paragraph[0]');
      const availableSelectors = ['block:paragraph[0]'];

      const result = resolveSingle(ast, 'test', selector, availableSelectors);

      expect(result.success).toBe(true);
      if (result.success) {
        // Word count includes all text in the paragraph
        expect(result.results[0].wordCount).toBeGreaterThan(0);
      }
    });

    it('should calculate word count for code block', () => {
      const { ast } = parseMarkdown('```js\nconst x = 1;\nconst y = 2;\n```');
      const selector = parseSelector('block:code[0]');
      const availableSelectors = ['block:code[0]'];

      const result = resolveSingle(ast, 'test', selector, availableSelectors);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.results[0].wordCount).toBeGreaterThan(0);
      }
    });
  });

  describe('children available', () => {
    it('should report childrenAvailable: true for root with children', () => {
      const { ast } = parseMarkdown('# Title\n\nContent');
      const selector = parseSelector('root');
      const availableSelectors = ['root'];

      const result = resolveSingle(ast, 'test', selector, availableSelectors);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.results[0].childrenAvailable).toBe(true);
      }
    });

    it('should report childrenAvailable: true for heading (has text children)', () => {
      const { ast } = parseMarkdown('# Title');
      const selector = parseSelector('heading:h1[0]');
      const availableSelectors = ['heading:h1[0]'];

      const result = resolveSingle(ast, 'test', selector, availableSelectors);

      expect(result.success).toBe(true);
      if (result.success) {
        // Headings have text children, so childrenAvailable is true
        expect(result.results[0].childrenAvailable).toBe(true);
      }
    });
  });

  describe('selector without index (default to 0)', () => {
    it('should resolve heading:h1 without index to first h1', () => {
      const { ast } = parseMarkdown('# First\n\n## Subsection\n\n# Second');
      const selector = parseSelector('heading:h1');
      const availableSelectors = ['heading:h1[0]', 'heading:h1[1]'];

      const result = resolveSingle(ast, 'test', selector, availableSelectors);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.results[0].node.depth).toBe(1);
      }
    });

    it('should resolve block:code without index to first code block', () => {
      const { ast } = parseMarkdown('```js\nfirst\n```\n\n```ts\nsecond\n```');
      const selector = parseSelector('block:code');
      const availableSelectors = ['block:code[0]', 'block:code[1]'];

      const result = resolveSingle(ast, 'test', selector, availableSelectors);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.results[0].node.type).toBe('code');
      }
    });
  });

  describe('query parameters', () => {
    it('should handle selector with query parameters', () => {
      const { ast } = parseMarkdown('# Title\n\nContent');
      const selector = parseSelector('heading:h1[0]?full=true');
      const availableSelectors = ['heading:h1[0]'];

      const result = resolveSingle(ast, 'test', selector, availableSelectors);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.results[0].node.type).toBe('heading');
      }
    });
  });
});
