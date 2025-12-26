import {
  type SelectorAST,
  type PathSegmentNode,
  type QueryParam,
  type Token,
  TokenType,
  SelectorNodeType,
  SelectorParseError,
  type HeadingLevel,
  type BlockType,
  type SelectorErrorCode,
} from './types.js';
import { tokenize } from './tokenizer.js';

const validHeadingLevels: HeadingLevel[] = ['h1', 'h2', 'h3', 'h4', 'h5', 'h6'];
const validBlockTypes: BlockType[] = ['paragraph', 'list', 'code', 'table', 'blockquote'];

/**
 * Parses a selector string into an AST.
 *
 * @param input - The selector string to parse
 * @returns The parsed selector AST
 * @throws {SelectorParseError} When selector syntax is invalid
 *
 * @example
 * ```typescript
 * const ast = parseSelector('doc::heading:h2[1]/block:code[0]');
 * console.log(ast.namespace); // 'doc'
 * console.log(ast.segments.length); // 2
 * ```
 */
export function parseSelector(input: string): SelectorAST {
  // Handle empty input
  const trimmed = input.trim();
  if (trimmed === '') {
    throw new SelectorParseError(
      'EMPTY_SELECTOR',
      'Selector cannot be empty',
      { line: 1, column: 1, offset: 0 },
      input
    );
  }

  const tokens = tokenize(input);
  const parser = new Parser(tokens, input);
  return parser.parse();
}

/**
 * Recursive descent parser for selector grammar.
 */
class Parser {
  private tokens: Token[];
  private current = 0;
  private input: string;

  constructor(tokens: Token[], input: string) {
    this.tokens = tokens;
    this.input = input;
  }

  parse(): SelectorAST {
    const segments: PathSegmentNode[] = [];
    let namespace: string | undefined;
    let queryParams: QueryParam[] | undefined;

    const startPos = this.peek().position;

    // Parse optional namespace (identifier "::")
    if (this.check(TokenType.IDENTIFIER) && this.peekType(1) === TokenType.NAMESPACE_SEP) {
      const nsToken = this.advance();
      namespace = nsToken.value;
      this.consume(TokenType.NAMESPACE_SEP, "Expected '::' after namespace");
    }

    // Check if there's at least one path segment
    if (this.check(TokenType.EOF)) {
      throw this.error('INVALID_SYNTAX', 'Expected at least one path segment');
    }

    // Parse path segments (one or more, separated by /)
    do {
      segments.push(this.parsePathSegment());
    } while (this.match(TokenType.SLASH));

    // Detect trailing slash (if we matched / but got no path segment)
    if (segments.length > 0) {
      const lastSegment = segments[segments.length - 1];
      // This is handled by the loop - if we match SLASH but then hit EOF or invalid token,
      // the next parsePathSegment() call will error appropriately
    }

    // Parse optional query params
    if (this.match(TokenType.QUESTION)) {
      queryParams = this.parseQueryParams();
    }

    // Should be at EOF
    if (!this.check(TokenType.EOF)) {
      throw this.error('INVALID_SYNTAX', `Unexpected token '${this.peek().value}' after selector`);
    }

    return {
      type: SelectorNodeType.SELECTOR,
      namespace,
      segments,
      queryParams,
      position: startPos,
    };
  }

  private parsePathSegment(): PathSegmentNode {
    const startPos = this.peek().position;
    let nodeType: 'root' | 'heading' | 'section' | 'block' | 'page';
    let subtype: HeadingLevel | BlockType | undefined;
    let index: number | undefined;

    // Parse node type
    if (this.match(TokenType.ROOT)) {
      nodeType = 'root';
    } else if (this.match(TokenType.HEADING)) {
      nodeType = 'heading';
      // Expect colon and heading level
      if (!this.match(TokenType.COLON)) {
        throw this.error('INVALID_SYNTAX', `Expected ':' after 'heading'`);
      }
      if (!this.check(TokenType.IDENTIFIER)) {
        throw this.error('INVALID_HEADING_LEVEL', `Expected heading level (h1-h6) after 'heading:'`);
      }
      const levelToken = this.advance();
      const level = levelToken.value as HeadingLevel;
      if (!validHeadingLevels.includes(level)) {
        throw new SelectorParseError(
          'INVALID_HEADING_LEVEL',
          `Invalid heading level '${level}' - must be h1-h6`,
          levelToken.position,
          this.input
        );
      }
      subtype = level;
    } else if (this.match(TokenType.BLOCK)) {
      nodeType = 'block';
      // Expect colon and block type
      if (!this.match(TokenType.COLON)) {
        throw this.error('INVALID_SYNTAX', `Expected ':' after 'block'`);
      }
      if (!this.check(TokenType.IDENTIFIER)) {
        throw this.error('INVALID_BLOCK_TYPE', `Expected block type after 'block:'`);
      }
      const typeToken = this.advance();
      const type = typeToken.value as BlockType;
      if (!validBlockTypes.includes(type)) {
        throw new SelectorParseError(
          'INVALID_BLOCK_TYPE',
          `Invalid block type '${type}' - must be one of: ${validBlockTypes.join(', ')}`,
          typeToken.position,
          this.input
        );
      }
      subtype = type;
    } else if (this.match(TokenType.SECTION)) {
      nodeType = 'section';
    } else if (this.match(TokenType.PAGE)) {
      nodeType = 'page';
    } else if (this.check(TokenType.IDENTIFIER)) {
      // Unknown identifier
      throw new SelectorParseError(
        'INVALID_SYNTAX',
        `Unexpected identifier '${this.peek().value}' - expected node type (root, heading, section, block, or page)`,
        this.peek().position,
        this.input
      );
    } else if (this.check(TokenType.SLASH) || this.check(TokenType.EOF)) {
      throw this.error('INVALID_SYNTAX', 'Expected path segment (root, heading, section, block, or page)');
    } else {
      throw this.error('INVALID_SYNTAX', `Expected node type (root, heading, section, block, or page)`);
    }

    // Parse optional index [number]
    if (this.match(TokenType.OPEN_BRACKET)) {
      if (!this.check(TokenType.NUMBER)) {
        throw this.error('INVALID_INDEX', `Expected number inside brackets`);
      }
      const indexToken = this.advance();
      const numValue = parseInt(indexToken.value, 10);
      if (numValue < 0) {
        throw this.error('INVALID_INDEX', `Index must be non-negative`);
      }
      index = numValue;

      if (!this.match(TokenType.CLOSE_BRACKET)) {
        throw this.error('UNCLOSED_BRACKET', `Unclosed bracket, expected ']'`);
      }
    }

    return {
      type: SelectorNodeType.PATH_SEGMENT,
      nodeType,
      subtype,
      index,
      position: startPos,
    };
  }

  private parseQueryParams(): QueryParam[] {
    const params: QueryParam[] = [];

    // Must have at least one param
    const startPos = this.peek().position;

    // Parse key
    if (!this.check(TokenType.IDENTIFIER)) {
      throw this.error('MALFORMED_QUERY', `Expected parameter name`);
    }
    const key = this.advance().value;

    // Expect equals
    if (!this.match(TokenType.EQUALS)) {
      throw this.error('MALFORMED_QUERY', `Expected '=' after parameter name '${key}'`);
    }

    // Parse value (identifier, string, or number, or empty)
    let value: string;
    if (this.check(TokenType.STRING)) {
      value = this.advance().value;
    } else if (this.check(TokenType.IDENTIFIER)) {
      value = this.advance().value;
    } else if (this.check(TokenType.NUMBER)) {
      value = this.advance().value;
    } else {
      // Empty value allowed
      value = '';
    }

    params.push({ key, value, position: startPos });

    // Parse additional params with & separator
    while (this.match(TokenType.AMPERSAND)) {
      const paramStart = this.peek().position;

      if (!this.check(TokenType.IDENTIFIER)) {
        throw this.error('MALFORMED_QUERY', `Expected parameter name`);
      }
      const paramKey = this.advance().value;

      if (!this.match(TokenType.EQUALS)) {
        throw this.error('MALFORMED_QUERY', `Expected '=' after parameter name '${paramKey}'`);
      }

      let paramValue: string;
      if (this.check(TokenType.STRING)) {
        paramValue = this.advance().value;
      } else if (this.check(TokenType.IDENTIFIER)) {
        paramValue = this.advance().value;
      } else if (this.check(TokenType.NUMBER)) {
        paramValue = this.advance().value;
      } else {
        paramValue = '';
      }

      params.push({ key: paramKey, value: paramValue, position: paramStart });
    }

    return params;
  }

  private check(type: TokenType): boolean {
    return this.peek().type === type;
  }

  private peekType(offset = 0): TokenType {
    const pos = this.current + offset;
    return pos < this.tokens.length ? this.tokens[pos]?.type ?? TokenType.EOF : TokenType.EOF;
  }

  private match(...types: TokenType[]): boolean {
    for (const type of types) {
      if (this.check(type)) {
        this.advance();
        return true;
      }
    }
    return false;
  }

  private advance(): Token {
    if (!this.check(TokenType.EOF)) {
      this.current++;
    }
    return this.previous();
  }

  private peek(): Token {
    return this.tokens[this.current] ?? this.tokens[this.tokens.length - 1]!;
  }

  private previous(): Token {
    return this.tokens[this.current - 1] ?? this.tokens[0]!;
  }

  private consume(type: TokenType, message: string): Token {
    if (this.check(type)) {
      return this.advance();
    }
    throw this.error('INVALID_SYNTAX', message);
  }

  private error(code: SelectorErrorCode, message: string): SelectorParseError {
    return new SelectorParseError(code, message, this.peek().position, this.input);
  }
}
