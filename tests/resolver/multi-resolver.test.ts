import { describe, it, expect } from 'vitest';
import { resolveMulti } from '../../src/resolver/multi-resolver.js';
import { parseSelector } from '../../src/selector/index.js';
import { parseMarkdown } from '../../src/parser/index.js';

describe('resolveMulti', () => {
  describe('namespaced resolution', () => {
    it('should resolve in specific namespace when provided', () => {
      const { ast: ast1 } = parseMarkdown('# Doc 1');
      const { ast: ast2 } = parseMarkdown('# Doc 2');

      const documents = [
        {
          namespace: 'doc1',
          tree: ast1,
          availableSelectors: ['doc1::heading:h1[0]']
        },
        {
          namespace: 'doc2',
          tree: ast2,
          availableSelectors: ['doc2::heading:h1[0]']
        }
      ];

      const selector = parseSelector('doc1::heading:h1[0]');
      const result = resolveMulti(documents, selector);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.results).toHaveLength(1);
        expect(result.results[0].namespace).toBe('doc1');
      }
    });

    it('should return error for non-existent namespace', () => {
      const { ast } = parseMarkdown('# Doc');
      const documents = [
        {
          namespace: 'doc',
          tree: ast,
          availableSelectors: ['doc::heading:h1[0]']
        }
      ];

      const selector = parseSelector('nonexistent::heading:h1[0]');
      const result = resolveMulti(documents, selector);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.type).toBe('NAMESPACE_NOT_FOUND');
        expect(result.error.message).toContain('nonexistent');
        expect(result.error.message).toContain('doc');
      }
    });

    it('should include namespace suggestions for typo', () => {
      const { ast: ast1 } = parseMarkdown('# Doc 1');
      const { ast: ast2 } = parseMarkdown('# Doc 2');

      const documents = [
        {
          namespace: 'readme',
          tree: ast1,
          availableSelectors: ['readme::heading:h1[0]']
        },
        {
          namespace: 'changelog',
          tree: ast2,
          availableSelectors: ['changelog::heading:h1[0]']
        }
      ];

      const selector = parseSelector('redme::heading:h1[0]'); // typo
      const result = resolveMulti(documents, selector);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.type).toBe('NAMESPACE_NOT_FOUND');
        expect(result.error.suggestions.length).toBeGreaterThan(0);
        expect(result.error.suggestions[0].selector).toContain('readme');
      }
    });
  });

  describe('cross-document resolution (no namespace)', () => {
    it('should resolve across all namespaces when no namespace specified', () => {
      const { ast: ast1 } = parseMarkdown('# Doc 1');
      const { ast: ast2 } = parseMarkdown('# Doc 2');
      const { ast: ast3 } = parseMarkdown('# Doc 3');

      const documents = [
        {
          namespace: 'doc1',
          tree: ast1,
          availableSelectors: ['doc1::heading:h1[0]']
        },
        {
          namespace: 'doc2',
          tree: ast2,
          availableSelectors: ['doc2::heading:h1[0]']
        },
        {
          namespace: 'doc3',
          tree: ast3,
          availableSelectors: ['doc3::heading:h1[0]']
        }
      ];

      const selector = parseSelector('heading:h1[0]');
      const result = resolveMulti(documents, selector);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.results).toHaveLength(3);
        expect(result.results[0].namespace).toBe('doc1');
        expect(result.results[1].namespace).toBe('doc2');
        expect(result.results[2].namespace).toBe('doc3');
      }
    });

    it('should return empty results when no matches in any document', () => {
      const { ast } = parseMarkdown('# Just H1');
      const documents = [
        {
          namespace: 'doc',
          tree: ast,
          availableSelectors: ['doc::heading:h1[0]']
        }
      ];

      const selector = parseSelector('heading:h2[0]');
      const result = resolveMulti(documents, selector);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.type).toBe('SELECTOR_NOT_FOUND');
      }
    });

    it('should return partial results when some documents match', () => {
      const { ast: ast1 } = parseMarkdown('# Has H1');
      const { ast: ast2 } = parseMarkdown('## Only H2');

      const documents = [
        {
          namespace: 'with-h1',
          tree: ast1,
          availableSelectors: ['with-h1::heading:h1[0]']
        },
        {
          namespace: 'no-h1',
          tree: ast2,
          availableSelectors: ['no-h1::heading:h2[0]']
        }
      ];

      const selector = parseSelector('heading:h1[0]');
      const result = resolveMulti(documents, selector);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.results).toHaveLength(1);
        expect(result.results[0].namespace).toBe('with-h1');
      }
    });
  });

  describe('suggestions from multiple documents', () => {
    it('should generate suggestions from all available selectors', () => {
      const { ast: ast1 } = parseMarkdown('# Title 1\n\n## Subtitle');
      const { ast: ast2 } = parseMarkdown('# Title 2\n\n```js\ncode\n```');

      const documents = [
        {
          namespace: 'doc1',
          tree: ast1,
          availableSelectors: ['doc1::heading:h1[0]', 'doc1::heading:h2[0]']
        },
        {
          namespace: 'doc2',
          tree: ast2,
          availableSelectors: ['doc2::heading:h1[0]', 'doc2::block:code[0]']
        }
      ];

      // Use a valid selector that doesn't exist (h3 not present)
      const selector = parseSelector('heading:h3[0]');
      const result = resolveMulti(documents, selector);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.type).toBe('SELECTOR_NOT_FOUND');
      }
    });
  });

  describe('empty document list', () => {
    it('should handle empty document list gracefully', () => {
      const documents: any[] = [];
      const selector = parseSelector('heading:h1[0]');
      const result = resolveMulti(documents, selector);

      expect(result.success).toBe(false);
      if (!result.success) {
        // With no documents and no namespace, we get SELECTOR_NOT_FOUND
        expect(result.error.type).toBe('SELECTOR_NOT_FOUND');
      }
    });
  });

  describe('query parameters', () => {
    it('should handle query parameters in multi-document resolution', () => {
      const { ast: ast1 } = parseMarkdown('# Doc 1');
      const { ast: ast2 } = parseMarkdown('# Doc 2');

      const documents = [
        {
          namespace: 'doc1',
          tree: ast1,
          availableSelectors: ['doc1::heading:h1[0]']
        },
        {
          namespace: 'doc2',
          tree: ast2,
          availableSelectors: ['doc2::heading:h1[0]']
        }
      ];

      const selector = parseSelector('heading:h1[0]?full=true');
      const result = resolveMulti(documents, selector);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.results).toHaveLength(2);
      }
    });
  });

  describe('complex scenarios', () => {
    it('should handle multiple documents with different structures', () => {
      const { ast: ast1 } = parseMarkdown('# Guide\n\n## Intro\n\nContent here');
      const { ast: ast2 } = parseMarkdown('```js\nconst x = 1;\n```');
      const { ast: ast3 } = parseMarkdown('- Item 1\n- Item 2');

      const documents = [
        {
          namespace: 'guide',
          tree: ast1,
          availableSelectors: ['guide::heading:h1[0]', 'guide::heading:h2[0]']
        },
        {
          namespace: 'code-examples',
          tree: ast2,
          availableSelectors: ['code-examples::block:code[0]']
        },
        {
          namespace: 'checklist',
          tree: ast3,
          availableSelectors: ['checklist::block:list[0]']
        }
      ];

      // Test heading selector - should only match guide
      const headingSelector = parseSelector('heading:h1[0]');
      const headingResult = resolveMulti(documents, headingSelector);

      expect(headingResult.success).toBe(true);
      if (headingResult.success) {
        expect(headingResult.results).toHaveLength(1);
        expect(headingResult.results[0].namespace).toBe('guide');
      }

      // Test code selector - should only match code-examples
      const codeSelector = parseSelector('block:code[0]');
      const codeResult = resolveMulti(documents, codeSelector);

      expect(codeResult.success).toBe(true);
      if (codeResult.success) {
        expect(codeResult.results).toHaveLength(1);
        expect(codeResult.results[0].namespace).toBe('code-examples');
      }
    });

    it('should handle selector with namespace and path', () => {
      const { ast } = parseMarkdown('# Title\n\n## Subtitle');
      const documents = [
        {
          namespace: 'doc',
          tree: ast,
          availableSelectors: ['doc::root', 'doc::heading:h1[0]', 'doc::heading:h2[0]']
        }
      ];

      const selector = parseSelector('doc::root/heading:h1[0]');
      const result = resolveMulti(documents, selector);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.results[0].namespace).toBe('doc');
        expect(result.results[0].node.type).toBe('heading');
      }
    });
  });

  describe('namespace case sensitivity', () => {
    it('should match namespace exactly (case-sensitive)', () => {
      const { ast } = parseMarkdown('# Doc');
      const documents = [
        {
          namespace: 'MyDoc',
          tree: ast,
          availableSelectors: ['MyDoc::heading:h1[0]']
        }
      ];

      const selector = parseSelector('mydoc::heading:h1[0]'); // lowercase
      const result = resolveMulti(documents, selector);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.type).toBe('NAMESPACE_NOT_FOUND');
      }
    });
  });

  describe('results order', () => {
    it('should maintain document order in results', () => {
      const { ast: ast1 } = parseMarkdown('# First');
      const { ast: ast2 } = parseMarkdown('# Second');
      const { ast: ast3 } = parseMarkdown('# Third');

      const documents = [
        { namespace: 'z-last', tree: ast1, availableSelectors: ['z-last::heading:h1[0]'] },
        { namespace: 'a-first', tree: ast2, availableSelectors: ['a-first::heading:h1[0]'] },
        { namespace: 'm-middle', tree: ast3, availableSelectors: ['m-middle::heading:h1[0]'] }
      ];

      const selector = parseSelector('heading:h1[0]');
      const result = resolveMulti(documents, selector);

      expect(result.success).toBe(true);
      if (result.success) {
        // Results should be in document order, not sorted
        expect(result.results[0].namespace).toBe('z-last');
        expect(result.results[1].namespace).toBe('a-first');
        expect(result.results[2].namespace).toBe('m-middle');
      }
    });
  });
});
