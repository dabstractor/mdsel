import { describe, it, expect } from 'vitest';
import { parseSelector, SelectorParseError, SelectorNodeType, type SelectorAST, type PathSegmentNode } from '../../src/selector/index.js';

describe('parseSelector', () => {
  describe('valid selectors', () => {
    it('should parse root selector', () => {
      const ast = parseSelector('root');
      expect(ast.type).toBe(SelectorNodeType.SELECTOR);
      expect(ast.namespace).toBeUndefined();
      expect(ast.segments).toHaveLength(1);
      expect(ast.segments[0].nodeType).toBe('root');
    });

    it('should parse root with index', () => {
      const ast = parseSelector('root[0]');
      expect(ast.segments[0].nodeType).toBe('root');
      expect(ast.segments[0].index).toBe(0);
    });

    it('should parse namespaced root', () => {
      const ast = parseSelector('doc::root');
      expect(ast.namespace).toBe('doc');
      expect(ast.segments[0].nodeType).toBe('root');
    });

    it('should parse heading with level', () => {
      const ast = parseSelector('heading:h2[1]');
      expect(ast.segments[0].nodeType).toBe('heading');
      expect(ast.segments[0].subtype).toBe('h2');
      expect(ast.segments[0].index).toBe(1);
    });

    it('should parse all heading levels h1-h6', () => {
      for (let i = 1; i <= 6; i++) {
        const level = `h${i}` as const;
        const ast = parseSelector(`heading:${level}[0]`);
        expect(ast.segments[0].subtype).toBe(level);
      }
    });

    it('should parse block with type', () => {
      const ast = parseSelector('block:code[0]');
      expect(ast.segments[0].nodeType).toBe('block');
      expect(ast.segments[0].subtype).toBe('code');
      expect(ast.segments[0].index).toBe(0);
    });

    it('should parse all block types', () => {
      const blockTypes = ['paragraph', 'list', 'code', 'table', 'blockquote'];
      for (const type of blockTypes) {
        const ast = parseSelector(`block:${type}[0]`);
        expect(ast.segments[0].subtype).toBe(type);
      }
    });

    it('should parse section without index', () => {
      const ast = parseSelector('section');
      expect(ast.segments[0].nodeType).toBe('section');
      expect(ast.segments[0].index).toBeUndefined();
    });

    it('should parse section with index', () => {
      const ast = parseSelector('section[5]');
      expect(ast.segments[0].nodeType).toBe('section');
      expect(ast.segments[0].index).toBe(5);
    });

    it('should parse page without index', () => {
      const ast = parseSelector('page');
      expect(ast.segments[0].nodeType).toBe('page');
      expect(ast.segments[0].index).toBeUndefined();
    });

    it('should parse page with index', () => {
      const ast = parseSelector('page[2]');
      expect(ast.segments[0].nodeType).toBe('page');
      expect(ast.segments[0].index).toBe(2);
    });

    describe('path composition', () => {
      it('should parse path with two segments', () => {
        const ast = parseSelector('heading:h2[1]/section[0]');
        expect(ast.segments).toHaveLength(2);
        expect(ast.segments[0].nodeType).toBe('heading');
        expect(ast.segments[1].nodeType).toBe('section');
      });

      it('should parse path with three segments', () => {
        const ast = parseSelector('heading:h2[1]/section[0]/block:code[0]');
        expect(ast.segments).toHaveLength(3);
        expect(ast.segments[0].nodeType).toBe('heading');
        expect(ast.segments[1].nodeType).toBe('section');
        expect(ast.segments[2].nodeType).toBe('block');
      });

      it('should parse complex path with namespace', () => {
        const ast = parseSelector('doc::heading:h1[0]/section[0]/block:paragraph[0]');
        expect(ast.namespace).toBe('doc');
        expect(ast.segments).toHaveLength(3);
        expect(ast.segments[0].nodeType).toBe('heading');
        expect(ast.segments[1].nodeType).toBe('section');
        expect(ast.segments[2].nodeType).toBe('block');
      });

      it('should parse path with all node types', () => {
        const ast = parseSelector('root/heading:h1[0]/section[0]/block:code[0]/page[0]');
        expect(ast.segments).toHaveLength(5);
      });
    });

    describe('query parameters', () => {
      it('should parse selector with single query param', () => {
        const ast = parseSelector('section[1]?full=true');
        expect(ast.queryParams).toBeDefined();
        expect(ast.queryParams).toHaveLength(1);
        expect(ast.queryParams![0].key).toBe('full');
        expect(ast.queryParams![0].value).toBe('true');
      });

      it('should parse selector with multiple query params', () => {
        const ast = parseSelector('section[1]?full=true&expand=false');
        expect(ast.queryParams).toHaveLength(2);
        expect(ast.queryParams![0].key).toBe('full');
        expect(ast.queryParams![0].value).toBe('true');
        expect(ast.queryParams![1].key).toBe('expand');
        expect(ast.queryParams![1].value).toBe('false');
      });

      it('should parse query param with empty value', () => {
        const ast = parseSelector('section[1]?full=');
        expect(ast.queryParams![0].key).toBe('full');
        expect(ast.queryParams![0].value).toBe('');
      });

      it('should parse query param with number value', () => {
        const ast = parseSelector('section[1]?limit=10');
        expect(ast.queryParams![0].key).toBe('limit');
        expect(ast.queryParams![0].value).toBe('10');
      });

      it('should parse complex selector with namespace and query params', () => {
        const ast = parseSelector('doc::heading:h1[0]/block:paragraph[0]?full=true');
        expect(ast.namespace).toBe('doc');
        expect(ast.segments).toHaveLength(2);
        expect(ast.queryParams).toHaveLength(1);
      });
    });

    describe('indices', () => {
      it('should parse index 0', () => {
        const ast = parseSelector('root[0]');
        expect(ast.segments[0].index).toBe(0);
      });

      it('should parse large index', () => {
        const ast = parseSelector('root[9999]');
        expect(ast.segments[0].index).toBe(9999);
      });

      it('should parse selector without index', () => {
        const ast = parseSelector('root');
        expect(ast.segments[0].index).toBeUndefined();
      });
    });

    describe('position tracking', () => {
      it('should track position of path segment', () => {
        const ast = parseSelector('heading:h2[1]');
        expect(ast.segments[0].position).toEqual({
          line: 1,
          column: 1,
          offset: 0,
        });
      });

      it('should track position of second path segment', () => {
        const ast = parseSelector('heading:h2[1]/section[0]');
        expect(ast.segments[1].position).toEqual({
          line: 1,
          column: 15,
          offset: 14,
        });
      });
    });
  });

  describe('error handling - invalid selectors', () => {
    it('should throw EMPTY_SELECTOR for empty input', () => {
      expect(() => parseSelector('')).toThrow(SelectorParseError);
      try {
        parseSelector('');
        expect.fail('Should have thrown SelectorParseError');
      } catch (error) {
        expect(error).toBeInstanceOf(SelectorParseError);
        if (error instanceof SelectorParseError) {
          expect(error.code).toBe('EMPTY_SELECTOR');
        }
      }
    });

    it('should throw EMPTY_SELECTOR for whitespace-only input', () => {
      expect(() => parseSelector('   ')).toThrow(SelectorParseError);
      try {
        parseSelector('   ');
        expect.fail('Should have thrown SelectorParseError');
      } catch (error) {
        expect(error).toBeInstanceOf(SelectorParseError);
        if (error instanceof SelectorParseError) {
          expect(error.code).toBe('EMPTY_SELECTOR');
        }
      }
    });

    it('should reject invalid heading level h7', () => {
      expect(() => parseSelector('heading:h7[0]')).toThrow(SelectorParseError);
      try {
        parseSelector('heading:h7[0]');
        expect.fail('Should have thrown SelectorParseError');
      } catch (error) {
        expect(error).toBeInstanceOf(SelectorParseError);
        if (error instanceof SelectorParseError) {
          expect(error.code).toBe('INVALID_HEADING_LEVEL');
          expect(error.message).toContain('h1-h6');
        }
      }
    });

    it('should reject invalid heading level h0', () => {
      expect(() => parseSelector('heading:h0[0]')).toThrow(SelectorParseError);
      try {
        parseSelector('heading:h0[0]');
        expect.fail('Should have thrown SelectorParseError');
      } catch (error) {
        expect(error).toBeInstanceOf(SelectorParseError);
        if (error instanceof SelectorParseError) {
          expect(error.code).toBe('INVALID_HEADING_LEVEL');
        }
      }
    });

    it('should reject invalid block type', () => {
      expect(() => parseSelector('block:invalid[0]')).toThrow(SelectorParseError);
      try {
        parseSelector('block:invalid[0]');
        expect.fail('Should have thrown SelectorParseError');
      } catch (error) {
        expect(error).toBeInstanceOf(SelectorParseError);
        if (error instanceof SelectorParseError) {
          expect(error.code).toBe('INVALID_BLOCK_TYPE');
          expect(error.message).toContain('paragraph');
          expect(error.message).toContain('list');
          expect(error.message).toContain('code');
          expect(error.message).toContain('table');
          expect(error.message).toContain('blockquote');
        }
      }
    });

    it('should detect unclosed bracket', () => {
      expect(() => parseSelector('heading:h2[0')).toThrow(SelectorParseError);
      try {
        parseSelector('heading:h2[0');
        expect.fail('Should have thrown SelectorParseError');
      } catch (error) {
        expect(error).toBeInstanceOf(SelectorParseError);
        if (error instanceof SelectorParseError) {
          expect(error.code).toBe('UNCLOSED_BRACKET');
          expect(error.message).toContain("']");
        }
      }
    });

    it('should reject negative index in brackets', () => {
      // Note: The tokenizer doesn't handle negative numbers, so "-1" becomes "-" then "1"
      // The parser will error on unexpected "-" token
      expect(() => parseSelector('heading:h2[-1]')).toThrow(SelectorParseError);
    });

    it('should reject empty namespace (double colon without identifier)', () => {
      // This would be "::heading" - but the tokenizer won't match "::" without preceding identifier
      // So this becomes ":" (COLON) ":" (COLON) which is invalid
      expect(() => parseSelector('::heading')).toThrow(SelectorParseError);
    });

    it('should reject missing colon after heading', () => {
      expect(() => parseSelector('headingh2[0]')).toThrow(SelectorParseError);
      try {
        parseSelector('headingh2[0]');
        expect.fail('Should have thrown SelectorParseError');
      } catch (error) {
        expect(error).toBeInstanceOf(SelectorParseError);
        if (error instanceof SelectorParseError) {
          expect(error.code).toBe('INVALID_SYNTAX');
        }
      }
    });

    it('should reject missing colon after block', () => {
      expect(() => parseSelector('blockcode[0]')).toThrow(SelectorParseError);
    });

    it('should reject invalid identifier as node type', () => {
      expect(() => parseSelector('invalid[0]')).toThrow(SelectorParseError);
      try {
        parseSelector('invalid[0]');
        expect.fail('Should have thrown SelectorParseError');
      } catch (error) {
        expect(error).toBeInstanceOf(SelectorParseError);
        if (error instanceof SelectorParseError) {
          expect(error.code).toBe('INVALID_SYNTAX');
          expect(error.message).toContain('node type');
        }
      }
    });

    it('should reject missing heading level', () => {
      expect(() => parseSelector('heading:[0]')).toThrow(SelectorParseError);
      try {
        parseSelector('heading:[0]');
        expect.fail('Should have thrown SelectorParseError');
      } catch (error) {
        expect(error).toBeInstanceOf(SelectorParseError);
        if (error instanceof SelectorParseError) {
          expect(error.code).toBe('INVALID_HEADING_LEVEL');
        }
      }
    });

    it('should reject missing block type', () => {
      expect(() => parseSelector('block:[0]')).toThrow(SelectorParseError);
      try {
        parseSelector('block:[0]');
        expect.fail('Should have thrown SelectorParseError');
      } catch (error) {
        expect(error).toBeInstanceOf(SelectorParseError);
        if (error instanceof SelectorParseError) {
          expect(error.code).toBe('INVALID_BLOCK_TYPE');
        }
      }
    });

    it('should reject non-number in brackets', () => {
      expect(() => parseSelector('heading:h2[abc]')).toThrow(SelectorParseError);
      try {
        parseSelector('heading:h2[abc]');
        expect.fail('Should have thrown SelectorParseError');
      } catch (error) {
        expect(error).toBeInstanceOf(SelectorParseError);
        if (error instanceof SelectorParseError) {
          expect(error.code).toBe('INVALID_INDEX');
        }
      }
    });

    it('should reject empty brackets', () => {
      expect(() => parseSelector('heading:h2[]')).toThrow(SelectorParseError);
      try {
        parseSelector('heading:h2[]');
        expect.fail('Should have thrown SelectorParseError');
      } catch (error) {
        expect(error).toBeInstanceOf(SelectorParseError);
        if (error instanceof SelectorParseError) {
          expect(error.code).toBe('INVALID_INDEX');
        }
      }
    });

    it('should reject malformed query (no equals)', () => {
      expect(() => parseSelector('section[1]?full')).toThrow(SelectorParseError);
      try {
        parseSelector('section[1]?full');
        expect.fail('Should have thrown SelectorParseError');
      } catch (error) {
        expect(error).toBeInstanceOf(SelectorParseError);
        if (error instanceof SelectorParseError) {
          expect(error.code).toBe('MALFORMED_QUERY');
        }
      }
    });

    it('should reject malformed query (equals at end)', () => {
      // This is actually valid - empty value after equals is allowed
      const ast = parseSelector('section[1]?full=');
      expect(ast.queryParams![0].value).toBe('');
    });

    it('should reject unexpected token after selector', () => {
      expect(() => parseSelector('root[0]extra')).toThrow(SelectorParseError);
    });

    it('should reject double slash', () => {
      expect(() => parseSelector('root//section')).toThrow(SelectorParseError);
    });

    it('should reject selector starting with slash', () => {
      expect(() => parseSelector('/root')).toThrow(SelectorParseError);
    });
  });

  describe('error messages with position context', () => {
    it('should format error message for invalid heading level', () => {
      try {
        parseSelector('heading:h7[0]');
        expect.fail('Should have thrown SelectorParseError');
      } catch (error) {
        expect(error).toBeInstanceOf(SelectorParseError);
        if (error instanceof SelectorParseError) {
          const str = error.toString();
          expect(str).toContain('h7');
          expect(str).toContain('line 1');
          expect(str).toContain('column 9');
        }
      }
    });

    it('should format error message for invalid block type', () => {
      try {
        parseSelector('block:foobar[0]');
        expect.fail('Should have thrown SelectorParseError');
      } catch (error) {
        expect(error).toBeInstanceOf(SelectorParseError);
        if (error instanceof SelectorParseError) {
          const str = error.toString();
          expect(str).toContain('foobar');
        }
      }
    });

    it('should format error message for unclosed bracket', () => {
      try {
        parseSelector('heading:h2[0');
        expect.fail('Should have thrown SelectorParseError');
      } catch (error) {
        expect(error).toBeInstanceOf(SelectorParseError);
        if (error instanceof SelectorParseError) {
          const str = error.toString();
          expect(str).toContain('Unclosed bracket');
          expect(str).toContain("']'");
        }
      }
    });
  });

  describe('edge cases', () => {
    it('should handle selector with only namespace (error - no path segment)', () => {
      expect(() => parseSelector('doc::')).toThrow(SelectorParseError);
    });

    it('should handle root with namespace', () => {
      const ast = parseSelector('doc::root');
      expect(ast.namespace).toBe('doc');
      expect(ast.segments[0].nodeType).toBe('root');
    });

    it('should parse zero index', () => {
      const ast = parseSelector('heading:h1[0]');
      expect(ast.segments[0].index).toBe(0);
    });

    it('should parse multiple indices in path', () => {
      const ast = parseSelector('heading:h1[0]/section[1]/block:code[2]');
      expect(ast.segments[0].index).toBe(0);
      expect(ast.segments[1].index).toBe(1);
      expect(ast.segments[2].index).toBe(2);
    });

    it('should parse mix of indexed and non-indexed segments', () => {
      const ast = parseSelector('heading:h1[0]/section/block:code[1]');
      expect(ast.segments[0].index).toBe(0);
      expect(ast.segments[1].index).toBeUndefined();
      expect(ast.segments[2].index).toBe(1);
    });

    it('should handle namespace with underscore', () => {
      const ast = parseSelector('my_doc::root');
      expect(ast.namespace).toBe('my_doc');
    });

    it('should handle namespace with hyphen', () => {
      const ast = parseSelector('my-doc::root');
      expect(ast.namespace).toBe('my-doc');
    });

    it('should handle namespace with numbers', () => {
      const ast = parseSelector('doc123::root');
      expect(ast.namespace).toBe('doc123');
    });
  });
});
