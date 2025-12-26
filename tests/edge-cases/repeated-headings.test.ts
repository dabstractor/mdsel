import { describe, it, expect } from 'vitest';
import { parseFile, parseMarkdown } from '../../src/parser/index.js';
import { resolveSingle } from '../../src/resolver/single-resolver.js';
import { parseSelector } from '../../src/selector/index.js';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const FIXTURES_DIR = join(__dirname, '../fixtures/edge-cases');

describe('Repeated Heading Titles', () => {
  describe('same heading text at different levels', () => {
    it('should parse repeated heading text at different levels', () => {
      const markdown = '# Introduction\n\n## Introduction\n\n### Introduction\n\n#### Introduction';
      const { ast } = parseMarkdown(markdown);

      const headings = ast.children.filter((c: any) => c.type === 'heading');
      expect(headings.length).toBe(4);
    });

    it('should resolve h1 Introduction correctly', () => {
      const markdown = '# Introduction\n\n## Introduction\n\n### Introduction';
      const { ast } = parseMarkdown(markdown);
      const selector = parseSelector('heading:h1[0]');
      const result = resolveSingle(ast, 'test', selector, ['heading:h1[0]']);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.results[0]?.node.depth).toBe(1);
      }
    });

    it('should resolve h2 Introduction correctly', () => {
      const markdown = '# Introduction\n\n## Introduction\n\n### Introduction';
      const { ast } = parseMarkdown(markdown);
      const selector = parseSelector('heading:h2[0]');
      const result = resolveSingle(ast, 'test', selector, ['heading:h2[0]']);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.results[0]?.node.depth).toBe(2);
      }
    });

    it('should resolve h3 Introduction correctly', () => {
      const markdown = '# Introduction\n\n## Introduction\n\n### Introduction';
      const { ast } = parseMarkdown(markdown);
      const selector = parseSelector('heading:h3[0]');
      const result = resolveSingle(ast, 'test', selector, ['heading:h3[0]']);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.results[0]?.node.depth).toBe(3);
      }
    });
  });

  describe('same heading text at same level', () => {
    it('should parse multiple identical headings at same level', () => {
      const markdown = '## Section A\n\nContent\n\n## Section A\n\nMore content\n\n## Section A';
      const { ast } = parseMarkdown(markdown);

      const h2Headings = ast.children.filter((c: any) => c.type === 'heading' && c.depth === 2);
      expect(h2Headings.length).toBe(3);
    });

    it('should resolve to first occurrence with index 0', () => {
      const markdown = '## Section A\n\nContent 1\n\n## Section A\n\nContent 2';
      const { ast } = parseMarkdown(markdown);
      const selector = parseSelector('heading:h2[0]');
      const result = resolveSingle(ast, 'test', selector, ['heading:h2[0]', 'heading:h2[1]']);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.results[0]?.node.depth).toBe(2);
      }
    });

    it('should resolve to second occurrence with index 1', () => {
      const markdown = '## Section A\n\nContent 1\n\n## Section A\n\nContent 2';
      const { ast } = parseMarkdown(markdown);
      const selector = parseSelector('heading:h2[1]');
      const result = resolveSingle(ast, 'test', selector, ['heading:h2[0]', 'heading:h2[1]']);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.results[0]?.node.depth).toBe(2);
      }
    });

    it('should return error for out-of-range index', () => {
      const markdown = '## Section A\n\n## Section A';
      const { ast } = parseMarkdown(markdown);
      const selector = parseSelector('heading:h2[2]');
      const result = resolveSingle(ast, 'test', selector, ['heading:h2[0]', 'heading:h2[1]']);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.type).toBe('INDEX_OUT_OF_RANGE');
      }
    });
  });

  describe('deep nesting with identical titles', () => {
    it('should resolve deep chain with identical title text', () => {
      const markdown =
        '# Overview\n\n## Overview\n\n### Overview\n\n#### Overview\n\n##### Overview';
      const { ast } = parseMarkdown(markdown);

      const selector = parseSelector('heading:h1[0]');
      const result = resolveSingle(ast, 'test', selector, ['heading:h1[0]']);

      expect(result.success).toBe(true);
    });

    it('should correctly identify each level independently', () => {
      const markdown = '# Overview\n\n## Overview\n\n### Overview\n\n#### Overview';
      const { ast } = parseMarkdown(markdown);

      // Test each level
      for (let depth = 1; depth <= 4; depth++) {
        const selector = parseSelector(`heading:h${depth}[0]`);
        const result = resolveSingle(ast, 'test', selector, [`heading:h${depth}[0]`]);

        expect(result.success).toBe(true);
        if (result.success) {
          expect(result.results[0]?.node.depth).toBe(depth);
        }
      }
    });
  });

  describe('repeated-headings.md fixture', () => {
    it('should parse the fixture file', async () => {
      const fixtureFile = join(FIXTURES_DIR, 'repeated-headings.md');
      const result = await parseFile(fixtureFile);

      expect(result.ast).toBeDefined();
    });

    it('should have multiple Introduction headings', async () => {
      const fixtureFile = join(FIXTURES_DIR, 'repeated-headings.md');
      const { ast } = await parseFile(fixtureFile);

      const introHeadings = ast.children.filter((c: any) => {
        if (c.type !== 'heading') return false;
        const text = extractHeadingText(c);
        return text.toLowerCase().includes('introduction');
      });

      expect(introHeadings.length).toBeGreaterThanOrEqual(3);
    });

    it('should resolve first Introduction heading', async () => {
      const fixtureFile = join(FIXTURES_DIR, 'repeated-headings.md');
      const { ast } = await parseFile(fixtureFile);

      const selector = parseSelector('heading:h1[0]');
      const result = resolveSingle(ast, 'test', selector, ['heading:h1[0]']);

      expect(result.success).toBe(true);
    });

    it('should resolve second h2 Introduction heading', async () => {
      const fixtureFile = join(FIXTURES_DIR, 'repeated-headings.md');
      const { ast } = await parseFile(fixtureFile);

      // Find all h2 headings
      const h2Headings = ast.children.filter((c: any) => c.type === 'heading' && c.depth === 2);
      if (h2Headings.length >= 2) {
        const selector = parseSelector('heading:h2[1]');
        const result = resolveSingle(ast, 'test', selector, ['heading:h2[0]', 'heading:h2[1]']);

        expect(result.success).toBe(true);
      }
    });
  });

  describe('ordinal position correctness', () => {
    it('should use 0-based indexing correctly', () => {
      const markdown = '## First\n\n## Second\n\n## Third';
      const { ast } = parseMarkdown(markdown);

      // Test [0] gives first
      let selector = parseSelector('heading:h2[0]');
      let result = resolveSingle(ast, 'test', selector, [
        'heading:h2[0]',
        'heading:h2[1]',
        'heading:h2[2]',
      ]);
      expect(result.success).toBe(true);

      // Test [1] gives second
      selector = parseSelector('heading:h2[1]');
      result = resolveSingle(ast, 'test', selector, [
        'heading:h2[0]',
        'heading:h2[1]',
        'heading:h2[2]',
      ]);
      expect(result.success).toBe(true);

      // Test [2] gives third
      selector = parseSelector('heading:h2[2]');
      result = resolveSingle(ast, 'test', selector, [
        'heading:h2[0]',
        'heading:h2[1]',
        'heading:h2[2]',
      ]);
      expect(result.success).toBe(true);
    });

    it('should handle gaps in identical headings', () => {
      const markdown = '## Title\n\n## Title\n\nContent\n\n## Other\n\n## Title';
      const { ast } = parseMarkdown(markdown);

      // There are 3 "Title" headings at positions 0, 1, and 3 (skipping 2 which is "Other")
      const selector = parseSelector('heading:h2[2]');
      const result = resolveSingle(ast, 'test', selector, [
        'heading:h2[0]',
        'heading:h2[1]',
        'heading:h2[2]',
      ]);

      expect(result.success).toBe(true);
    });
  });

  describe('mixed repeated and unique headings', () => {
    it('should handle document with both repeated and unique headings', () => {
      const markdown =
        '# Introduction\n\n## Unique Section\n\n### Introduction\n\n## Another Unique\n\n### Introduction';
      const { ast } = parseMarkdown(markdown);

      const allHeadings = ast.children.filter((c: any) => c.type === 'heading');
      expect(allHeadings.length).toBe(5);
    });

    it('should correctly count headings at each level', () => {
      const markdown =
        '# Intro\n\n# Intro\n\n## Section\n\n## Section\n\n### Subsection\n\n### Subsection';
      const { ast } = parseMarkdown(markdown);

      const h1Count = ast.children.filter((c: any) => c.type === 'heading' && c.depth === 1).length;
      const h2Count = ast.children.filter((c: any) => c.type === 'heading' && c.depth === 2).length;
      const h3Count = ast.children.filter((c: any) => c.type === 'heading' && c.depth === 3).length;

      expect(h1Count).toBe(2);
      expect(h2Count).toBe(2);
      expect(h3Count).toBe(2);
    });
  });
});

/**
 * Helper function to extract text content from a heading node.
 */
function extractHeadingText(heading: any): string {
  if (!heading || !heading.children || !Array.isArray(heading.children)) {
    return '';
  }

  return heading.children
    .map((child: any) => {
      if (child.type === 'text') {
        return child.value || '';
      }
      return '';
    })
    .join('');
}
