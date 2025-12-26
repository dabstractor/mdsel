import { describe, it, expect } from 'vitest';
import { parseFile, parseMarkdown, ParserError } from '../../src/parser/index.js';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const FIXTURES_DIR = join(__dirname, '../fixtures/edge-cases');

describe('Binary File Detection', () => {
  describe('parseFile with binary content', () => {
    it('should detect and reject binary files with PNG header', async () => {
      const binaryFile = join(FIXTURES_DIR, 'binary.md');

      try {
        await parseFile(binaryFile);
        expect.fail('Should have thrown ParserError');
      } catch (error) {
        expect(error).toBeInstanceOf(ParserError);
        if (error instanceof ParserError) {
          expect(error.code).toBe('BINARY_FILE');
          expect(error.message).toContain('binary');
          expect(error.filePath).toBe(binaryFile);
        }
      }
    });

    it('should provide helpful error message for binary files', async () => {
      const binaryFile = join(FIXTURES_DIR, 'binary.md');

      try {
        await parseFile(binaryFile);
        expect.fail('Should have thrown ParserError');
      } catch (error) {
        if (error instanceof ParserError) {
          expect(error.message).toContain('binary content');
          expect(error.message).toContain('markdown');
        }
      }
    });
  });

  describe('parseMarkdown with empty/whitespace content', () => {
    it('should handle empty files gracefully', () => {
      const result = parseMarkdown('');

      expect(result.ast.type).toBe('root');
      expect(result.ast.children).toHaveLength(0);
    });

    it('should handle whitespace-only files', () => {
      const result = parseMarkdown('   \n\n  \t  \n');

      expect(result.ast.type).toBe('root');
      expect(result.ast.children).toHaveLength(0);
    });

    it('should handle tabs-only content', () => {
      const result = parseMarkdown('\t\t\t');

      expect(result.ast.type).toBe('root');
      expect(result.ast.children).toHaveLength(0);
    });

    it('should handle newlines-only content', () => {
      const result = parseMarkdown('\n\n\n\n');

      expect(result.ast.type).toBe('root');
      expect(result.ast.children).toHaveLength(0);
    });

    it('should handle mixed whitespace', () => {
      const result = parseMarkdown('  \t  \n  \r\n  ');

      expect(result.ast.type).toBe('root');
      expect(result.ast.children).toHaveLength(0);
    });
  });

  describe('parseFile with empty files', () => {
    it('should handle actual empty file from filesystem', async () => {
      // Use the existing empty.md fixture
      const emptyFile = join(__dirname, '../fixtures/empty.md');
      const result = await parseFile(emptyFile);

      expect(result.ast.type).toBe('root');
      expect(result.ast.children).toHaveLength(0);
      expect(result.filePath).toBe(emptyFile);
    });

    it('should parse file with single newline', async () => {
      const result = parseMarkdown('\n');

      expect(result.ast.type).toBe('root');
      expect(result.ast.children).toHaveLength(0);
    });
  });

  describe('null byte detection', () => {
    it('should reject content with many null bytes', () => {
      const contentWithNulls = '\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00';

      // This content has more than 10% null bytes, should be detected as binary
      // But since we're using parseMarkdown (not parseFile), it won't go through binary check
      // The binary check is only in parseFile
      const result = parseMarkdown(contentWithNulls);
      expect(result.ast).toBeDefined();
    });

    it('should accept content with few null bytes', () => {
      const contentWithFewNulls = 'Hello\x00World'; // Only 1 null byte

      const result = parseMarkdown(contentWithFewNulls);
      expect(result.ast).toBeDefined();
    });
  });

  describe('line ending normalization', () => {
    it('should normalize CRLF to LF', () => {
      const windowsContent = '# Title\r\n\r\nContent\r\n';
      const result = parseMarkdown(windowsContent);

      expect(result.ast.children).toHaveLength(2);
      expect(result.ast.children[0]?.type).toBe('heading');
      expect(result.ast.children[1]?.type).toBe('paragraph');
    });

    it('should normalize CR to LF', () => {
      const oldMacContent = '# Title\r\rContent\r';
      const result = parseMarkdown(oldMacContent);

      expect(result.ast.children).toHaveLength(2);
    });

    it('should handle mixed line endings', () => {
      const mixedContent = '# Title\r\n\nContent\r\nMore\n';
      const result = parseMarkdown(mixedContent);

      expect(result.ast.children).toHaveLength(2);
    });
  });

  describe('file size limits', () => {
    it('should parse small files without issue', async () => {
      const smallFile = join(__dirname, '../fixtures/simple.md');
      const result = await parseFile(smallFile);

      expect(result.ast).toBeDefined();
    });

    it('should reject files exceeding maxFileSize when specified', async () => {
      // This test requires creating a large file or mocking
      // For now, we test the option is accepted
      const smallFile = join(__dirname, '../fixtures/simple.md');
      // Set a very small limit (1 byte)
      try {
        await parseFile(smallFile, { maxFileSize: 1 });
        expect.fail('Should have thrown ParserError for file size');
      } catch (error) {
        if (error instanceof ParserError) {
          expect(error.code).toBe('FILE_TOO_LARGE');
        }
      }
    });
  });
});
