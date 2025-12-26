import { describe, it, expect } from 'vitest';
import { SuggestionEngine } from '../../src/resolver/suggestions.js';

describe('SuggestionEngine', () => {
  describe('exact matches', () => {
    it('should return exact match when query matches a candidate exactly', () => {
      const engine = new SuggestionEngine(['heading:h1[0]', 'heading:h2[0]', 'block:code[0]']);
      const suggestions = engine.getSuggestions('heading:h1[0]');

      expect(suggestions.length).toBeGreaterThanOrEqual(1);
      expect(suggestions[0].selector).toBe('heading:h1[0]');
      expect(suggestions[0].distance).toBe(0);
      expect(suggestions[0].ratio).toBe(1);
      expect(suggestions[0].reason).toBe('exact_match');
    });

    it('should return exact match when query has different case', () => {
      const engine = new SuggestionEngine(['Heading:H1[0]', 'heading:h2[0]']);
      const suggestions = engine.getSuggestions('heading:h1[0]');

      // Case-insensitive match returns exact_match
      expect(suggestions.length).toBeGreaterThanOrEqual(1);
      expect(suggestions[0].selector).toBe('Heading:H1[0]');
      expect(suggestions[0].distance).toBe(0);
      expect(suggestions[0].ratio).toBe(1);
      expect(suggestions[0].reason).toBe('exact_match');
    });

    it('should handle exact match with extra whitespace', () => {
      const engine = new SuggestionEngine(['heading:h1[0]']);
      const suggestions = engine.getSuggestions('  heading:h1[0]  ');

      expect(suggestions).toHaveLength(1);
      expect(suggestions[0].selector).toBe('heading:h1[0]');
      expect(suggestions[0].distance).toBe(0);
      expect(suggestions[0].ratio).toBe(1);
    });

    it('should exclude exact matches when includeExact is false', () => {
      const engine = new SuggestionEngine(['heading:h1[0]', 'heading:h2[0]']);
      const suggestions = engine.getSuggestions('heading:h1[0]', { includeExact: false });

      // Should not contain the exact match 'heading:h1[0]'
      // But may contain other similar selectors
      const hasExactMatch = suggestions.some(s => s.selector.toLowerCase() === 'heading:h1[0]');
      expect(hasExactMatch).toBe(false);
    });
  });

  describe('fuzzy matching', () => {
    it('should return closest matches for fuzzy query', () => {
      const engine = new SuggestionEngine(['heading:h1[0]', 'heading:h2[0]', 'block:code[0]']);
      const suggestions = engine.getSuggestions('headng:h1[0]'); // typo: missing 'i'

      expect(suggestions.length).toBeGreaterThan(0);
      expect(suggestions[0].selector).toBe('heading:h1[0]');
      expect(suggestions[0].distance).toBe(1);
      expect(suggestions[0].ratio).toBeCloseTo(0.94, 1);
      expect(suggestions[0].reason).toBe('typo_correction');
    });

    it('should rank by ratio (highest first)', () => {
      const engine = new SuggestionEngine(['heading:h1[0]', 'heading:h2[0]', 'block:code[0]', 'section[0]']);
      const suggestions = engine.getSuggestions('headng:h1[0]');

      // Check that suggestions are sorted by ratio descending
      for (let i = 1; i < suggestions.length; i++) {
        expect(suggestions[i - 1].ratio).toBeGreaterThanOrEqual(suggestions[i].ratio);
      }
    });

    it('should use distance as secondary sort key', () => {
      const engine = new SuggestionEngine(['heading:h1[0]', 'heading:h1[1]', 'heading:h2[0]']);
      const suggestions = engine.getSuggestions('headng:h1[0]');

      // First should be heading:h1[0] with distance 1
      expect(suggestions[0].selector).toBe('heading:h1[0]');
      expect(suggestions[0].distance).toBe(1);
    });

    it('should use length as tertiary sort key', () => {
      const engine = new SuggestionEngine(['head[0]', 'heading:h1[0]']);
      const suggestions = engine.getSuggestions('hea');

      // When ratios are equal, shorter selector comes first
      expect(suggestions[0].selector).toBe('head[0]');
    });
  });

  describe('filtering', () => {
    it('should filter out low-ratio matches', () => {
      const engine = new SuggestionEngine(['heading:h1[0]', 'block:code[0]', 'paragraph[0]']);
      const suggestions = engine.getSuggestions('xyz', { minRatio: 0.5 });

      // Should filter out matches with ratio < 0.5
      for (const suggestion of suggestions) {
        expect(suggestion.ratio).toBeGreaterThanOrEqual(0.5);
      }
    });

    it('should return empty array when no matches meet threshold', () => {
      const engine = new SuggestionEngine(['heading:h1[0]', 'block:code[0]']);
      const suggestions = engine.getSuggestions('xyz123', { minRatio: 0.8 });

      expect(suggestions).toHaveLength(0);
    });

    it('should respect custom minRatio option', () => {
      const engine = new SuggestionEngine(['heading:h1[0]', 'heading:h2[0]']);
      const lowThreshold = engine.getSuggestions('head', { minRatio: 0.1 });
      const highThreshold = engine.getSuggestions('head', { minRatio: 0.9 });

      expect(lowThreshold.length).toBeGreaterThanOrEqual(highThreshold.length);
    });
  });

  describe('max results', () => {
    it('should limit results to maxResults', () => {
      const candidates = [
        'heading:h1[0]',
        'heading:h1[1]',
        'heading:h2[0]',
        'heading:h2[1]',
        'heading:h3[0]',
        'block:code[0]'
      ];
      const engine = new SuggestionEngine(candidates);

      const suggestions3 = engine.getSuggestions('hea', { maxResults: 3 });
      expect(suggestions3.length).toBeLessThanOrEqual(3);

      const suggestions5 = engine.getSuggestions('hea', { maxResults: 5 });
      expect(suggestions5.length).toBeLessThanOrEqual(5);
    });

    it('should use default maxResults of 5', () => {
      const engine = new SuggestionEngine([
        'heading:h1[0]',
        'heading:h1[1]',
        'heading:h2[0]',
        'heading:h2[1]',
        'heading:h3[0]',
        'heading:h3[1]'
      ]);

      const suggestions = engine.getSuggestions('hea');
      expect(suggestions.length).toBeLessThanOrEqual(5);
    });
  });

  describe('reason classification', () => {
    it('should classify as typo_correction for distance <= 2', () => {
      const engine = new SuggestionEngine(['heading:h1[0]', 'block:code[0]']);

      const suggestions = engine.getSuggestions('headng:h1[0]'); // distance 1
      expect(suggestions[0].reason).toBe('typo_correction');
    });

    it('should classify as fuzzy_match for distance > 2', () => {
      const engine = new SuggestionEngine(['heading:h1[0]']);

      const suggestions = engine.getSuggestions('hea'); // distance > 2
      if (suggestions.length > 0) {
        expect(suggestions[0].reason).toBe('fuzzy_match');
      }
    });
  });

  describe('edge cases', () => {
    it('should handle empty candidate list', () => {
      const engine = new SuggestionEngine([]);
      const suggestions = engine.getSuggestions('heading:h1[0]');

      expect(suggestions).toHaveLength(0);
    });

    it('should handle empty query', () => {
      const engine = new SuggestionEngine(['heading:h1[0]', 'block:code[0]']);
      const suggestions = engine.getSuggestions('', { minRatio: 0 });

      // Empty query matches everything with distance equal to string length
      // But with default minRatio=0.4, empty query against longer strings gives ratio 0
      // So we need to lower minRatio to 0 to get matches
      expect(suggestions.length).toBeGreaterThanOrEqual(2);
    });

    it('should handle single character query', () => {
      const engine = new SuggestionEngine(['heading:h1[0]', 'block:code[0]', 'section[0]']);
      const suggestions = engine.getSuggestions('h', { minRatio: 0 });

      // Single character 'h' should match 'heading:h1[0]'
      // Set minRatio to 0 to allow even very distant matches
      expect(suggestions.length).toBeGreaterThanOrEqual(1);
      expect(suggestions[0].selector).toContain('heading');
    });

    it('should handle candidates with special characters', () => {
      const engine = new SuggestionEngine(['doc::heading:h1[0]', 'file::block:code[0]']);
      const suggestions = engine.getSuggestions('doc::headng:h1[0]');

      expect(suggestions.length).toBeGreaterThan(0);
      expect(suggestions[0].selector).toBe('doc::heading:h1[0]');
    });
  });

  describe('real-world selector scenarios', () => {
    it('should suggest corrections for typos in heading selectors', () => {
      const engine = new SuggestionEngine([
        'doc::heading:h1[0]',
        'doc::heading:h2[0]',
        'doc::heading:h2[1]',
        'doc::block:code[0]'
      ]);

      const suggestions = engine.getSuggestions('doc::headng:h2[0]'); // typo

      expect(suggestions.length).toBeGreaterThan(0);
      expect(suggestions[0].selector).toContain('heading:h2');
      expect(suggestions[0].distance).toBe(1);
      expect(suggestions[0].reason).toBe('typo_correction');
    });

    it('should suggest alternatives for wrong block type', () => {
      const engine = new SuggestionEngine([
        'doc::block:code[0]',
        'doc::block:paragraph[0]',
        'doc::block:list[0]'
      ]);

      const suggestions = engine.getSuggestions('doc::block:cde[0]');

      expect(suggestions.length).toBeGreaterThan(0);
      expect(suggestions[0].selector).toBe('doc::block:code[0]');
    });

    it('should suggest index adjustments', () => {
      const engine = new SuggestionEngine(['heading:h1[0]', 'heading:h1[1]', 'heading:h1[2]']);

      const suggestions = engine.getSuggestions('heading:h1[5]');

      // Should suggest the closest available indices
      expect(suggestions.length).toBeGreaterThan(0);
      // The closest match would be heading:h1[2] (distance 3 from [5])
      expect(suggestions[0].selector).toContain('heading:h1[');
    });
  });
});
