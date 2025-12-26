import { describe, it, expect } from 'vitest';
import { tokenize, TokenType, type Token, SelectorParseError } from '../../src/selector/index.js';

describe('tokenize', () => {
  describe('basic tokenization', () => {
    it('should tokenize identifier', () => {
      const tokens = tokenize('test');
      expect(tokens).toHaveLength(2); // IDENTIFIER + EOF
      expect(tokens[0].type).toBe(TokenType.IDENTIFIER);
      expect(tokens[0].value).toBe('test');
      expect(tokens[1].type).toBe(TokenType.EOF);
    });

    it('should tokenize namespace separator', () => {
      const tokens = tokenize('doc::');
      expect(tokens).toHaveLength(3); // IDENTIFIER + NAMESPACE_SEP + EOF
      expect(tokens[0].type).toBe(TokenType.IDENTIFIER);
      expect(tokens[0].value).toBe('doc');
      expect(tokens[1].type).toBe(TokenType.NAMESPACE_SEP);
      expect(tokens[1].value).toBe('::');
      expect(tokens[2].type).toBe(TokenType.EOF);
    });

    it('should tokenize colon', () => {
      const tokens = tokenize(':');
      expect(tokens).toHaveLength(2); // COLON + EOF
      expect(tokens[0].type).toBe(TokenType.COLON);
      expect(tokens[0].value).toBe(':');
    });

    it('should tokenize slash', () => {
      const tokens = tokenize('/');
      expect(tokens).toHaveLength(2); // SLASH + EOF
      expect(tokens[0].type).toBe(TokenType.SLASH);
      expect(tokens[0].value).toBe('/');
    });

    it('should tokenize question mark', () => {
      const tokens = tokenize('?');
      expect(tokens).toHaveLength(2); // QUESTION + EOF
      expect(tokens[0].type).toBe(TokenType.QUESTION);
      expect(tokens[0].value).toBe('?');
    });

    it('should tokenize ampersand', () => {
      const tokens = tokenize('&');
      expect(tokens).toHaveLength(2); // AMPERSAND + EOF
      expect(tokens[0].type).toBe(TokenType.AMPERSAND);
      expect(tokens[0].value).toBe('&');
    });

    it('should tokenize equals', () => {
      const tokens = tokenize('=');
      expect(tokens).toHaveLength(2); // EQUALS + EOF
      expect(tokens[0].type).toBe(TokenType.EQUALS);
      expect(tokens[0].value).toBe('=');
    });

    it('should tokenize open bracket', () => {
      const tokens = tokenize('[');
      expect(tokens).toHaveLength(2); // OPEN_BRACKET + EOF
      expect(tokens[0].type).toBe(TokenType.OPEN_BRACKET);
      expect(tokens[0].value).toBe('[');
    });

    it('should tokenize close bracket', () => {
      const tokens = tokenize(']');
      expect(tokens).toHaveLength(2); // CLOSE_BRACKET + EOF
      expect(tokens[0].type).toBe(TokenType.CLOSE_BRACKET);
      expect(tokens[0].value).toBe(']');
    });

    it('should tokenize number', () => {
      const tokens = tokenize('123');
      expect(tokens).toHaveLength(2); // NUMBER + EOF
      expect(tokens[0].type).toBe(TokenType.NUMBER);
      expect(tokens[0].value).toBe('123');
    });
  });

  describe('keyword tokenization', () => {
    it('should tokenize root keyword', () => {
      const tokens = tokenize('root');
      expect(tokens[0].type).toBe(TokenType.ROOT);
      expect(tokens[0].value).toBe('root');
    });

    it('should tokenize heading keyword', () => {
      const tokens = tokenize('heading');
      expect(tokens[0].type).toBe(TokenType.HEADING);
      expect(tokens[0].value).toBe('heading');
    });

    it('should tokenize section keyword', () => {
      const tokens = tokenize('section');
      expect(tokens[0].type).toBe(TokenType.SECTION);
      expect(tokens[0].value).toBe('section');
    });

    it('should tokenize block keyword', () => {
      const tokens = tokenize('block');
      expect(tokens[0].type).toBe(TokenType.BLOCK);
      expect(tokens[0].value).toBe('block');
    });

    it('should tokenize page keyword', () => {
      const tokens = tokenize('page');
      expect(tokens[0].type).toBe(TokenType.PAGE);
      expect(tokens[0].value).toBe('page');
    });
  });

  describe('string tokenization', () => {
    it('should tokenize double-quoted string', () => {
      const tokens = tokenize('"hello world"');
      expect(tokens).toHaveLength(2); // STRING + EOF
      expect(tokens[0].type).toBe(TokenType.STRING);
      expect(tokens[0].value).toBe('hello world');
    });

    it('should tokenize single-quoted string', () => {
      const tokens = tokenize("'hello world'");
      expect(tokens).toHaveLength(2); // STRING + EOF
      expect(tokens[0].type).toBe(TokenType.STRING);
      expect(tokens[0].value).toBe('hello world');
    });

    it('should tokenize empty string', () => {
      const tokens = tokenize('""');
      expect(tokens[0].type).toBe(TokenType.STRING);
      expect(tokens[0].value).toBe('');
    });
  });

  describe('complex selectors', () => {
    it('should tokenize heading:h2[1]', () => {
      const tokens = tokenize('heading:h2[1]');
      const types = tokens.map((t) => t.type);
      expect(types).toEqual([
        TokenType.HEADING,
        TokenType.COLON,
        TokenType.IDENTIFIER, // h2
        TokenType.OPEN_BRACKET,
        TokenType.NUMBER,
        TokenType.CLOSE_BRACKET,
        TokenType.EOF,
      ]);
    });

    it('should tokenize block:code[0]', () => {
      const tokens = tokenize('block:code[0]');
      const types = tokens.map((t) => t.type);
      expect(types).toEqual([
        TokenType.BLOCK,
        TokenType.COLON,
        TokenType.IDENTIFIER, // code
        TokenType.OPEN_BRACKET,
        TokenType.NUMBER,
        TokenType.CLOSE_BRACKET,
        TokenType.EOF,
      ]);
    });

    it('should tokenize doc::heading:h2[1]/section[0]', () => {
      const tokens = tokenize('doc::heading:h2[1]/section[0]');
      const types = tokens.map((t) => t.type);
      expect(types).toEqual([
        TokenType.IDENTIFIER, // doc
        TokenType.NAMESPACE_SEP,
        TokenType.HEADING,
        TokenType.COLON,
        TokenType.IDENTIFIER, // h2
        TokenType.OPEN_BRACKET,
        TokenType.NUMBER,
        TokenType.CLOSE_BRACKET,
        TokenType.SLASH,
        TokenType.SECTION,
        TokenType.OPEN_BRACKET,
        TokenType.NUMBER,
        TokenType.CLOSE_BRACKET,
        TokenType.EOF,
      ]);
    });

    it('should tokenize selector with query params', () => {
      const tokens = tokenize('section[1]?full=true&expand=false');
      const types = tokens.map((t) => t.type);
      expect(types).toEqual([
        TokenType.SECTION,
        TokenType.OPEN_BRACKET,
        TokenType.NUMBER,
        TokenType.CLOSE_BRACKET,
        TokenType.QUESTION,
        TokenType.IDENTIFIER, // full
        TokenType.EQUALS,
        TokenType.IDENTIFIER, // true
        TokenType.AMPERSAND,
        TokenType.IDENTIFIER, // expand
        TokenType.EQUALS,
        TokenType.IDENTIFIER, // false
        TokenType.EOF,
      ]);
    });

    it('should tokenize complex selector with namespace and query params', () => {
      const tokens = tokenize('doc::heading:h1[0]/block:paragraph[0]?full=true');
      const values = tokens.map((t) => t.value);
      expect(values).toContain('doc');
      expect(values).toContain('::');
      expect(values).toContain('heading');
      expect(values).toContain(':');
      expect(values).toContain('h1');
      expect(values).toContain('[');
      expect(values).toContain('0');
      expect(values).toContain(']');
      expect(values).toContain('/');
      expect(values).toContain('block');
      expect(values).toContain('paragraph');
      expect(values).toContain('?');
      expect(values).toContain('full');
      expect(values).toContain('=');
      expect(values).toContain('true');
    });
  });

  describe('position tracking', () => {
    it('should track position for single token', () => {
      const tokens = tokenize('root');
      expect(tokens[0].position).toEqual({
        line: 1,
        column: 1,
        offset: 0,
      });
    });

    it('should track position for multiple tokens', () => {
      const tokens = tokenize('heading:h2');
      expect(tokens[0].position).toEqual({ line: 1, column: 1, offset: 0 }); // heading
      expect(tokens[1].position).toEqual({ line: 1, column: 8, offset: 7 }); // :
      expect(tokens[2].position).toEqual({ line: 1, column: 9, offset: 8 }); // h2
    });

    it('should track position with newlines', () => {
      const tokens = tokenize('heading\n:h2');
      expect(tokens[0].position).toEqual({ line: 1, column: 1, offset: 0 }); // heading
      expect(tokens[1].position).toEqual({ line: 2, column: 1, offset: 8 }); // :
      expect(tokens[2].position).toEqual({ line: 2, column: 2, offset: 9 }); // h2
    });

    it('should track column position correctly', () => {
      const tokens = tokenize('doc::heading:h2[1]');
      // doc at column 1
      expect(tokens[0].position.column).toBe(1);
      // :: at column 4
      expect(tokens[1].position.column).toBe(4);
      // heading at column 6
      expect(tokens[2].position.column).toBe(6);
      // : at column 13
      expect(tokens[3].position.column).toBe(13);
    });

    it('should track offset position correctly', () => {
      const tokens = tokenize('root[0]');
      expect(tokens[0].position.offset).toBe(0); // root
      expect(tokens[1].position.offset).toBe(4); // [
      expect(tokens[2].position.offset).toBe(5); // 0
      expect(tokens[3].position.offset).toBe(6); // ]
    });
  });

  describe('edge cases', () => {
    it('should handle empty input', () => {
      const tokens = tokenize('');
      expect(tokens).toHaveLength(1);
      expect(tokens[0].type).toBe(TokenType.EOF);
    });

    it('should handle whitespace-only input', () => {
      const tokens = tokenize('   ');
      expect(tokens).toHaveLength(1);
      expect(tokens[0].type).toBe(TokenType.EOF);
    });

    it('should skip whitespace between tokens', () => {
      const tokens = tokenize('heading : h2');
      const values = tokens.map((t) => t.value);
      expect(values).toEqual(['heading', ':', 'h2', '']);
    });

    it('should handle identifier with underscore', () => {
      const tokens = tokenize('my_identifier');
      expect(tokens[0].type).toBe(TokenType.IDENTIFIER);
      expect(tokens[0].value).toBe('my_identifier');
    });

    it('should handle identifier with hyphen', () => {
      const tokens = tokenize('my-identifier');
      expect(tokens[0].type).toBe(TokenType.IDENTIFIER);
      expect(tokens[0].value).toBe('my-identifier');
    });

    it('should handle identifier with numbers', () => {
      const tokens = tokenize('test123');
      expect(tokens[0].type).toBe(TokenType.IDENTIFIER);
      expect(tokens[0].value).toBe('test123');
    });

    it('should check multi-char tokens before single-char', () => {
      const tokens = tokenize('::');
      expect(tokens).toHaveLength(2); // NAMESPACE_SEP + EOF
      expect(tokens[0].type).toBe(TokenType.NAMESPACE_SEP);
      expect(tokens[0].value).toBe('::');
    });
  });

  describe('error handling', () => {
    it('should throw SelectorParseError for invalid character', () => {
      expect(() => tokenize('heading$')).toThrow(SelectorParseError);
    });

    it('should include position in error', () => {
      try {
        tokenize('test$');
        expect.fail('Should have thrown SelectorParseError');
      } catch (error) {
        expect(error).toBeInstanceOf(SelectorParseError);
        if (error instanceof SelectorParseError) {
          expect(error.code).toBe('INVALID_SYNTAX');
          expect(error.position).toEqual({
            line: 1,
            column: 5,
            offset: 4,
          });
        }
      }
    });

    it('should format error message with context', () => {
      try {
        tokenize('test$');
        expect.fail('Should have thrown SelectorParseError');
      } catch (error) {
        expect(error).toBeInstanceOf(SelectorParseError);
        if (error instanceof SelectorParseError) {
          const str = error.toString();
          expect(str).toContain("Invalid character '$'");
          expect(str).toContain('line 1, column 5');
          expect(str).toContain('test$');
          expect(str).toContain('    ^');
        }
      }
    });

    it('should throw for @ character', () => {
      expect(() => tokenize('@')).toThrow(SelectorParseError);
    });

    it('should throw for # character', () => {
      expect(() => tokenize('#')).toThrow(SelectorParseError);
    });

    it('should throw for % character', () => {
      expect(() => tokenize('%')).toThrow(SelectorParseError);
    });
  });

  describe('special cases', () => {
    it('should tokenize zero', () => {
      const tokens = tokenize('0');
      expect(tokens[0].type).toBe(TokenType.NUMBER);
      expect(tokens[0].value).toBe('0');
    });

    it('should tokenize large number', () => {
      const tokens = tokenize('999999');
      expect(tokens[0].type).toBe(TokenType.NUMBER);
      expect(tokens[0].value).toBe('999999');
    });

    it('should handle consecutive separators', () => {
      const tokens = tokenize('::/');
      const types = tokens.map((t) => t.type);
      expect(types).toContain(TokenType.NAMESPACE_SEP);
      expect(types).toContain(TokenType.SLASH);
    });

    it('should handle query param with empty value', () => {
      const tokens = tokenize('section[0]?full=');
      const types = tokens.map((t) => t.type);
      expect(types).toContain(TokenType.QUESTION);
      expect(types).toContain(TokenType.IDENTIFIER); // full
      expect(types).toContain(TokenType.EQUALS);
    });

    it('should tokenize query param with string value', () => {
      const tokens = tokenize('section[0]?format="json"');
      const types = tokens.map((t) => t.type);
      expect(types).toContain(TokenType.QUESTION);
      expect(types).toContain(TokenType.IDENTIFIER); // format
      expect(types).toContain(TokenType.EQUALS);
      expect(types).toContain(TokenType.STRING); // json
    });
  });
});
