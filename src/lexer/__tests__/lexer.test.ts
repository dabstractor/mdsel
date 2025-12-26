import { Lexer, LexerError } from '../lexer';
import { Token, TokenType } from '../token';

describe('Lexer', () => {
  describe('Basic tokenization', () => {
    it('should tokenize namespace selector', () => {
      const lexer = new Lexer('namespace::path');
      const tokens = lexer.tokenize();

      expect(tokens).toHaveLength(3);
      expect(tokens[0].type).toBe(TokenType.NAMESPACE_KEYWORD);
      expect(tokens[0].value).toBe('namespace');
      expect(tokens[1].type).toBe(TokenType.NAMESPACE_SEPARATOR);
      expect(tokens[1].value).toBe('::');
      expect(tokens[2].type).toBe(TokenType.IDENTIFIER);
      expect(tokens[2].value).toBe('path');
    });

    it('should tokenize heading selector', () => {
      const lexer = new Lexer('heading:h2');
      const tokens = lexer.tokenize();

      expect(tokens).toHaveLength(3);
      expect(tokens[0].type).toBe(TokenType.HEADING_KEYWORD);
      expect(tokens[0].value).toBe('heading');
      expect(tokens[1].type).toBe(TokenType.PUNCTUATION);
      expect(tokens[1].value).toBe(':');
      expect(tokens[2].type).toBe(TokenType.IDENTIFIER);
      expect(tokens[2].value).toBe('h2');
    });

    it('should tokenize block selector with index', () => {
      const lexer = new Lexer('block:code[0]');
      const tokens = lexer.tokenize();

      expect(tokens).toHaveLength(5);
      expect(tokens[0].type).toBe(TokenType.BLOCK_KEYWORD);
      expect(tokens[0].value).toBe('block');
      expect(tokens[1].type).toBe(TokenType.PUNCTUATION);
      expect(tokens[1].value).toBe(':');
      expect(tokens[2].type).toBe(TokenType.IDENTIFIER);
      expect(tokens[2].value).toBe('code');
      expect(tokens[3].type).toBe(TokenType.OPEN_BRACKET);
      expect(tokens[4].type).toBe(TokenType.CLOSE_BRACKET);
      // Note: Index content should be tokenized as NUMBER
      expect(tokens[3].value).toBe('[');
      expect(tokens[4].value).toBe(']');
    });

    it('should tokenize path selector', () => {
      const lexer = new Lexer('/path/to/section');
      const tokens = lexer.tokenize();

      expect(tokens).toHaveLength(4);
      expect(tokens[0].type).toBe(TokenType.PATH_SEPARATOR);
      expect(tokens[0].value).toBe('/');
      expect(tokens[1].type).toBe(TokenType.IDENTIFIER);
      expect(tokens[1].value).toBe('path');
      expect(tokens[2].type).toBe(TokenType.PATH_SEPARATOR);
      expect(tokens[2].value).toBe('/');
      expect(tokens[3].type).toBe(TokenType.IDENTIFIER);
      expect(tokens[3].value).toBe('section');
    });
  });

  describe('Position tracking', () => {
    it('should track positions correctly', () => {
      const lexer = new Lexer('heading:h2');
      const tokens = lexer.tokenize();

      expect(tokens[0].start.line).toBe(1);
      expect(tokens[0].start.column).toBe(1);
      expect(tokens[0].end.line).toBe(1);
      expect(tokens[0].end.column).toBe(8);
      expect(tokens[0].value).toBe('heading');

      expect(tokens[1].start.column).toBe(8);
      expect(tokens[1].end.column).toBe(9);
      expect(tokens[1].value).toBe(':');

      expect(tokens[2].start.column).toBe(9);
      expect(tokens[2].end.column).toBe(11);
      expect(tokens[2].value).toBe('h2');
    });

    it('should track multi-character tokens correctly', () => {
      const lexer = new Lexer('namespace::path');
      const tokens = lexer.tokenize();

      expect(tokens[1].start.column).toBe(9);
      expect(tokens[1].end.column).toBe(11);
      expect(tokens[1].value).toBe('::');
    });

    it('should handle newlines', () => {
      const lexer = new Lexer('heading:h2\nblock:code');
      const tokens = lexer.tokenize();

      const headingToken = tokens[0];
      const newlineToken = tokens[3];
      const blockToken = tokens[4];

      expect(headingToken.start.line).toBe(1);
      expect(newlineToken.start.line).toBe(1);
      expect(newlineToken.end.line).toBe(2);
      expect(blockToken.start.line).toBe(2);
    });
  });

  describe('Error handling', () => {
    it('should create error tokens for unknown characters', () => {
      const lexer = new Lexer('invalid@token');
      const tokens = lexer.tokenize();

      const errorToken = tokens.find(t => t.type === TokenType.ERROR);
      expect(errorToken).toBeDefined();
      expect(errorToken?.value).toContain('@');
      expect(errorToken?.start.column).toBe(8);
    });

    it('should throw error when using error handling', () => {
      const lexer = new Lexer('invalid@token');
      expect(() => lexer.tokenizeWithErrorHandling()).toThrow(LexerError);
    });
  });

  describe('Complex selectors', () => {
    it('should tokenize complex selector with query params', () => {
      const lexer = new Lexer('block:code[0]?key=value&other=test');
      const tokens = lexer.tokenize();

      // First part: block:code[0]
      expect(tokens[0].type).toBe(TokenType.BLOCK_KEYWORD);
      expect(tokens[1].type).toBe(TokenType.PUNCTUATION);
      expect(tokens[2].type).toBe(TokenType.IDENTIFIER);
      expect(tokens[3].type).toBe(TokenType.OPEN_BRACKET);
      expect(tokens[4].type).toBe(TokenType.NUMBER);
      expect(tokens[5].type).toBe(TokenType.CLOSE_BRACKET);

      // Query params: ?key=value&other=test
      expect(tokens[6].type).toBe(TokenType.QUERY_SEPARATOR);
      expect(tokens[6].value).toBe('?');
      expect(tokens[7].type).toBe(TokenType.IDENTIFIER);
      expect(tokens[7].value).toBe('key');
    });

    it('should tokenize mixed namespace and heading', () => {
      const lexer = new Lexer('ns::heading:h2[1]');
      const tokens = lexer.tokenize();

      expect(tokens).toHaveLength(6);
      expect(tokens[0].value).toBe('ns');
      expect(tokens[1].value).toBe('::');
      expect(tokens[2].value).toBe('heading');
      expect(tokens[3].value).toBe(':');
      expect(tokens[4].value).toBe('h2');
      expect(tokens[5].value).toBe('[');
    });

    it('should handle multiple path separators', () => {
      const lexer = new Lexer('/path/to/deep/section');
      const tokens = lexer.tokenize();

      expect(tokens).toHaveLength(5);
      expect(tokens[0].value).toBe('/');
      expect(tokens[2].value).toBe('/');
      expect(tokens[4].value).toBe('/');
    });
  });

  describe('String literals', () => {
    it('should tokenize quoted strings', () => {
      const lexer = new Lexer('heading:"My Heading"');
      const tokens = lexer.tokenize();

      expect(tokens[2].type).toBe(TokenType.STRING);
      expect(tokens[2].value).toBe('My Heading');
    });

    it('should handle escaped characters in strings', () => {
      const lexer = new Lexer('block:"line\\nwith\\ttabs"');
      const tokens = lexer.tokenize();

      expect(tokens[2].type).toBe(TokenType.STRING);
      expect(tokens[2].value).toBe('line\nwith\ttabs');
    });

    it('should report unterminated string as error', () => {
      const lexer = new Lexer('heading:"unclosed');
      const tokens = lexer.tokenize();

      const errorToken = tokens.find(t => t.type === TokenType.ERROR);
      expect(errorToken).toBeDefined();
      expect(errorToken?.value).toContain('Unterminated string');
    });
  });

  describe('Numbers', () => {
    it('should tokenize numbers correctly', () => {
      const lexer = new Lexer('heading:h2[123]');
      const tokens = lexer.tokenize();

      expect(tokens[3].value).toBe('[');
      expect(tokens[4].value).toBe('123');
      expect(tokens[5].value).toBe(']');
    });
  });

  describe('EOF handling', () => {
    it('should always include EOF token', () => {
      const lexer = new Lexer('simple');
      const tokens = lexer.tokenize();

      const lastToken = tokens[tokens.length - 1];
      expect(lastToken.type).toBe(TokenType.EOF);
      expect(lastToken.value).toBe('');
    });
  });
});