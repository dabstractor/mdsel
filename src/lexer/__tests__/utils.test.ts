import { filterTokens, formatTokensForDebug, findTokenAtPosition, getTokenRange, DEFAULT_PARSER_OPTIONS } from '../utils';
import { Token, TokenType, Position } from '../token';

describe('Lexer Utils', () => {
  const createToken = (type: TokenType, value: string, line: number, column: number): Token => ({
    type,
    value,
    start: { line, column, offset: 0 },
    end: { line, column: column + value.length, offset: value.length }
  });

  describe('filterTokens', () => {
    it('should remove whitespace by default', () => {
      const tokens = [
        createToken(TokenType.IDENTIFIER, 'heading', 1, 1),
        createToken(TokenType.WHITESPACE, ' ', 1, 8),
        createToken(TokenType.HEADING_KEYWORD, 'heading', 1, 9)
      ];

      const filtered = filterTokens(tokens);
      expect(filtered).toHaveLength(2);
      expect(filtered[0].value).toBe('heading');
      expect(filtered[1].value).toBe('heading');
    });

    it('should keep whitespace when includeWhitespace is true', () => {
      const tokens = [
        createToken(TokenType.IDENTIFIER, 'heading', 1, 1),
        createToken(TokenType.WHITESPACE, ' ', 1, 8),
        createToken(TokenType.HEADING_KEYWORD, 'heading', 1, 9)
      ];

      const filtered = filterTokens(tokens, { includeWhitespace: true });
      expect(filtered).toHaveLength(3);
      expect(filtered[1].value).toBe(' ');
    });

    it('should throw error for error tokens by default', () => {
      const tokens = [
        createToken(TokenType.IDENTIFIER, 'heading', 1, 1),
        createToken(TokenType.ERROR, 'Unknown character', 1, 8)
      ];

      expect(() => filterTokens(tokens)).toThrow('Unknown character');
    });

    it('should not throw error when throwOnError is false', () => {
      const tokens = [
        createToken(TokenType.IDENTIFIER, 'heading', 1, 1),
        createToken(TokenType.ERROR, 'Unknown character', 1, 8)
      ];

      const filtered = filterTokens(tokens, { throwOnError: false });
      expect(filtered).toHaveLength(1);
      expect(filtered[0].value).toBe('heading');
    });
  });

  describe('formatTokensForDebug', () => {
    it('should format tokens for debugging', () => {
      const tokens = [
        createToken(TokenType.HEADING_KEYWORD, 'heading', 1, 1),
        createToken(TokenType.PUNCTUATION, ':', 1, 8),
        createToken(TokenType.IDENTIFIER, 'h2', 1, 9)
      ];

      const formatted = formatTokensForDebug(tokens);
      expect(formatted).toContain('1:1        HEADING_KEYWORD      "heading"');
      expect(formatted).toContain('1:8        PUNCTUATION          ":"');
      expect(formatted).toContain('1:9        IDENTIFIER           "h2"');
    });

    it('should truncate long values', () => {
      const longValue = 'a'.repeat(30);
      const tokens = [createToken(TokenType.STRING, longValue, 1, 1)];
      const formatted = formatTokensForDebug(tokens);
      expect(formatted).toContain('"aaaaaaaaaaaaaaaaaaaa..."');
    });
  });

  describe('findTokenAtPosition', () => {
    it('should find token at specific position', () => {
      const tokens = [
        createToken(TokenType.IDENTIFIER, 'heading', 1, 1),
        createToken(TokenType.HEADING_KEYWORD, 'heading', 1, 9)
      ];

      const position: Position = { line: 1, column: 5, offset: 4 };
      const found = findTokenAtPosition(tokens, position);
      expect(found?.value).toBe('heading');
    });

    it('should return null for position not in any token', () => {
      const tokens = [createToken(TokenType.IDENTIFIER, 'heading', 1, 1)];
      const position: Position = { line: 1, column: 20, offset: 19 };
      const found = findTokenAtPosition(tokens, position);
      expect(found).toBeNull();
    });
  });

  describe('getTokenRange', () => {
    it('should get tokens between start and end types', () => {
      const tokens = [
        createToken(TokenType.PUNCTUATION, '(', 1, 1),
        createToken(TokenType.IDENTIFIER, 'test', 1, 2),
        createToken(TokenType.PUNCTUATION, ')', 1, 6)
      ];

      const range = getTokenRange(tokens, TokenType.PUNCTUATION, TokenType.PUNCTUATION);
      expect(range).toHaveLength(3);
      expect(range[0].value).toBe('(');
      expect(range[1].value).toBe('test');
      expect(range[2].value).toBe(')');
    });

    it('should return empty array when start not found', () => {
      const tokens = [createToken(TokenType.IDENTIFIER, 'test', 1, 1)];
      const range = getTokenRange(tokens, TokenType.PUNCTUATION, TokenType.PUNCTUATION);
      expect(range).toHaveLength(0);
    });

    it('should return empty array when end not found', () => {
      const tokens = [createToken(TokenType.PUNCTUATION, '(', 1, 1)];
      const range = getTokenRange(tokens, TokenType.PUNCTUATION, TokenType.PUNCTUATION);
      expect(range).toHaveLength(0);
    });
  });
});