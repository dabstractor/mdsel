import { describe, it, expect } from 'vitest';
import { levenshteinDistance } from '../../src/resolver/levenshtein.js';

describe('levenshteinDistance', () => {
  describe('basic functionality', () => {
    it('should return 0 for identical strings', () => {
      expect(levenshteinDistance('hello', 'hello')).toBe(0);
      expect(levenshteinDistance('', '')).toBe(0);
      expect(levenshteinDistance('same', 'same')).toBe(0);
    });

    it('should return string length for completely different strings', () => {
      expect(levenshteinDistance('', 'abc')).toBe(3);
      expect(levenshteinDistance('abc', '')).toBe(3);
      expect(levenshteinDistance('abc', 'def')).toBe(3);
    });

    it('should return 1 for single character difference', () => {
      expect(levenshteinDistance('hello', 'hallo')).toBe(1);
      expect(levenshteinDistance('cat', 'bat')).toBe(1);
      expect(levenshteinDistance('test', 'tent')).toBe(1);
    });

    it('should handle single character strings', () => {
      expect(levenshteinDistance('a', 'a')).toBe(0);
      expect(levenshteinDistance('a', 'b')).toBe(1);
      expect(levenshteinDistance('', 'a')).toBe(1);
      expect(levenshteinDistance('a', '')).toBe(1);
    });
  });

  describe('known test cases', () => {
    it('should return 3 for kitten vs sitting (classic example)', () => {
      // kitten -> sitten (substitute k with s)
      // sitten -> sittin (substitute e with i)
      // sittin -> sitting (insert g at end)
      expect(levenshteinDistance('kitten', 'sitting')).toBe(3);
    });

    it('should return 3 for saturday vs sunday', () => {
      expect(levenshteinDistance('saturday', 'sunday')).toBe(3);
    });

    it('should return 2 for book vs back', () => {
      expect(levenshteinDistance('book', 'back')).toBe(2);
    });

    it('should return 5 for algorithm vs logarithmic', () => {
      expect(levenshteinDistance('algorithm', 'logarithmic')).toBe(5);
    });
  });

  describe('insertions', () => {
    it('should count insertions correctly', () => {
      expect(levenshteinDistance('test', 'testi')).toBe(1);
      expect(levenshteinDistance('test', 'testin')).toBe(2);
      expect(levenshteinDistance('test', 'testing')).toBe(3);
    });

    it('should handle insertions at beginning', () => {
      expect(levenshteinDistance('test', 'atest')).toBe(1);
      expect(levenshteinDistance('test', 'notest')).toBe(2);
    });
  });

  describe('deletions', () => {
    it('should count deletions correctly', () => {
      expect(levenshteinDistance('test', 'tes')).toBe(1);
      expect(levenshteinDistance('test', 'te')).toBe(2);
      expect(levenshteinDistance('test', 't')).toBe(3);
    });
  });

  describe('substitutions', () => {
    it('should count substitutions correctly', () => {
      expect(levenshteinDistance('test', 'tast')).toBe(1);
      expect(levenshteinDistance('test', 'taat')).toBe(2);
      expect(levenshteinDistance('test', 'tasd')).toBe(2); // e->a, t->d substitutions
    });
  });

  describe('mixed operations', () => {
    it('should handle combination of insert, delete, substitute', () => {
      expect(levenshteinDistance('abcdef', 'azced')).toBe(3);
      expect(levenshteinDistance('intention', 'execution')).toBe(5);
    });
  });

  describe('edge cases', () => {
    it('should handle empty strings', () => {
      expect(levenshteinDistance('', '')).toBe(0);
      expect(levenshteinDistance('', 'a')).toBe(1);
      expect(levenshteinDistance('', 'abc')).toBe(3);
      expect(levenshteinDistance('abc', '')).toBe(3);
    });

    it('should handle strings with spaces', () => {
      expect(levenshteinDistance('hello world', 'hello world')).toBe(0);
      expect(levenshteinDistance('hello world', 'hello')).toBe(6);
      expect(levenshteinDistance('hello', 'hello world')).toBe(6);
    });

    it('should handle strings with special characters', () => {
      expect(levenshteinDistance('hello!', 'hello')).toBe(1);
      expect(levenshteinDistance('test@example.com', 'test@example.org')).toBe(3);
    });

    it('should be case-sensitive', () => {
      expect(levenshteinDistance('hello', 'HELLO')).toBe(5);
      expect(levenshteinDistance('Hello', 'hello')).toBe(1);
      expect(levenshteinDistance('TEST', 'test')).toBe(4);
    });
  });

  describe('space optimization', () => {
    it('should handle very long strings efficiently', () => {
      const long1 = 'a'.repeat(1000);
      const long2 = 'a'.repeat(1000);
      expect(levenshteinDistance(long1, long2)).toBe(0);

      const long3 = 'a'.repeat(500) + 'b'.repeat(500);
      expect(levenshteinDistance(long1, long3)).toBe(500);
    });

    it('should handle asymmetric string lengths', () => {
      const short = 'abc';
      const long = 'a'.repeat(100);
      // Replace 'b'->'a', 'c'->'a' = 2 edits + 97 insertions = 99
      expect(levenshteinDistance(short, long)).toBe(99);
    });
  });

  describe('unicode and multi-byte characters', () => {
    it('should handle strings with emojis', () => {
      expect(levenshteinDistance('hello 👋', 'hello 👋')).toBe(0);
      // Emojis are multiple code units in JavaScript strings
      // 'hello' to 'hello 👋' = insert space + emoji (2 code units)
      expect(levenshteinDistance('hello', 'hello 👋')).toBe(3);
    });
  });

  describe('numbers and digits', () => {
    it('should handle numeric strings', () => {
      expect(levenshteinDistance('123', '123')).toBe(0);
      expect(levenshteinDistance('123', '124')).toBe(1);
      expect(levenshteinDistance('12345', '124')).toBe(2); // Delete '3' and '5'
    });
  });
});
