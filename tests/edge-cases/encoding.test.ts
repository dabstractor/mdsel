import { describe, it, expect } from 'vitest';
import { parseFile, parseMarkdown, ParserError } from '../../src/parser/index.js';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { writeFileSync, unlinkSync, mkdirSync } from 'node:fs';
import { join as pathJoin } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const FIXTURES_DIR = join(__dirname, '../fixtures/edge-cases');

describe('UTF-8 Encoding Validation', () => {
  describe('invalid UTF-8 detection', () => {
    it('should detect and reject files with invalid UTF-8 sequences', async () => {
      const invalidFile = join(FIXTURES_DIR, 'invalid-utf8.md');

      try {
        await parseFile(invalidFile);
        expect.fail('Should have thrown ParserError');
      } catch (error) {
        expect(error).toBeInstanceOf(ParserError);
        if (error instanceof ParserError) {
          expect(error.code).toBe('ENCODING_ERROR');
          expect(error.message).toContain('UTF-8');
          expect(error.filePath).toBe(invalidFile);
        }
      }
    });

    it('should include file path in encoding error', async () => {
      const invalidFile = join(FIXTURES_DIR, 'invalid-utf8.md');

      try {
        await parseFile(invalidFile);
        expect.fail('Should have thrown ParserError');
      } catch (error) {
        if (error instanceof ParserError) {
          expect(error.filePath).toBeDefined();
          expect(error.filePath).toContain('invalid-utf8.md');
        }
      }
    });

    it('should provide helpful error message for encoding issues', async () => {
      const invalidFile = join(FIXTURES_DIR, 'invalid-utf8.md');

      try {
        await parseFile(invalidFile);
        expect.fail('Should have thrown ParserError');
      } catch (error) {
        if (error instanceof ParserError) {
          expect(error.message).toContain('invalid UTF-8');
        }
      }
    });
  });

  describe('valid UTF-8 handling', () => {
    it('should parse valid UTF-8 files correctly', async () => {
      const simpleFile = join(__dirname, '../fixtures/simple.md');
      const result = await parseFile(simpleFile);

      expect(result.ast).toBeDefined();
      expect(result.ast.type).toBe('root');
    });

    it('should handle UTF-8 files with BOM', async () => {
      // Create a temporary file with UTF-8 BOM
      const tempDir = pathJoin(__dirname, '../temp');
      mkdirSync(tempDir, { recursive: true });
      const tempFile = pathJoin(tempDir, 'with-bom.md');

      try {
        // UTF-8 BOM is EF BB BF
        const bom = Buffer.from([0xef, 0xbb, 0xbf]);
        const content = Buffer.concat([bom, Buffer.from('# Title\n\nContent')]);
        writeFileSync(tempFile, content);

        const result = await parseFile(tempFile);
        expect(result.ast).toBeDefined();
        expect(result.ast.children.length).toBeGreaterThan(0);
      } finally {
        unlinkSync(tempFile);
      }
    });
  });

  describe('Unicode and emoji in headings', () => {
    it('should parse Chinese characters in headings', () => {
      const result = parseMarkdown('# 标题\n\n中文内容');

      expect(result.ast.children).toHaveLength(2);
      expect(result.ast.children[0]?.type).toBe('heading');
    });

    it('should parse emoji in headings', () => {
      const result = parseMarkdown('# 🚀 Introduction to Markdown 📝');

      expect(result.ast.children).toHaveLength(1);
      expect(result.ast.children[0]?.type).toBe('heading');
    });

    it('should parse mixed scripts in content', () => {
      const result = parseMarkdown('Café Français 日本語 한국어 العربية');

      expect(result.ast.children).toHaveLength(1);
      expect(result.ast.children[0]?.type).toBe('paragraph');
    });

    it('should parse RTL text correctly', () => {
      const result = parseMarkdown('العربية مع الإنجليزية');

      expect(result.ast.children).toHaveLength(1);
      expect(result.ast.children[0]?.type).toBe('paragraph');
    });

    it('should parse multiple emoji in heading', () => {
      const result = parseMarkdown('# 📊 Performance Metrics 📈 🔧');

      expect(result.ast.children).toHaveLength(1);
      expect(result.ast.children[0]?.type).toBe('heading');
    });

    it('should handle zero-width characters', () => {
      const result = parseMarkdown('# Zero\u200BWidth\u200BJoiners');

      expect(result.ast.children).toHaveLength(1);
      expect(result.ast.children[0]?.type).toBe('heading');
    });
  });

  describe('special Unicode characters', () => {
    it('should parse mathematical symbols', () => {
      const result = parseMarkdown('# Math Symbols: ∑ ∫ ∂ ∞ ≈ ≠ ≤ ≥');

      expect(result.ast.children).toHaveLength(1);
      expect(result.ast.children[0]?.type).toBe('heading');
    });

    it('should parse currency symbols', () => {
      const result = parseMarkdown('Prices: $100, €50, £75, ¥1000');

      expect(result.ast.children).toHaveLength(1);
      expect(result.ast.children[0]?.type).toBe('paragraph');
    });

    it('should parse arrows and symbols', () => {
      const result = parseMarkdown('Arrows: → ← ↑ ↓ ↔ ↕ ⇄ ⇅');

      expect(result.ast.children).toHaveLength(1);
      expect(result.ast.children[0]?.type).toBe('paragraph');
    });

    it('should parse box drawing characters', () => {
      const result = parseMarkdown('┌─┬─┐\n│ │ │\n├─┼─┤\n│ │ │\n└─┴─┘');

      expect(result.ast).toBeDefined();
    });

    it('should parse combining characters', () => {
      const result = parseMarkdown('café = caf + \\u0301');

      expect(result.ast.children).toHaveLength(1);
      expect(result.ast.children[0]?.type).toBe('paragraph');
    });
  });

  describe('Unicode in code blocks', () => {
    it('should preserve Unicode in code blocks', () => {
      const result = parseMarkdown('```js\nconst greeting = "你好";\n```');

      expect(result.ast.children).toHaveLength(1);
      expect(result.ast.children[0]?.type).toBe('code');
    });

    it('should handle emoji in inline code', () => {
      const result = parseMarkdown('Use `🚀` for rocket emoji');

      expect(result.ast.children).toHaveLength(1);
    });
  });

  describe('Unicode in lists', () => {
    it('should parse Unicode bullet points', () => {
      const result = parseMarkdown('* 第一个项目\n* 第二个项目\n* 第三个项目');

      expect(result.ast.children).toHaveLength(1);
      expect(result.ast.children[0]?.type).toBe('list');
    });

    it('should parse numbered lists with Unicode content', () => {
      const result = parseMarkdown('1. Élément français\n2. Элемент русский\n3.要素日本語');

      expect(result.ast.children).toHaveLength(1);
      expect(result.ast.children[0]?.type).toBe('list');
    });
  });
});
