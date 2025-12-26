import type {
  Root,
  RootContent,
  Heading,
  Paragraph,
  Code,
  List,
  ListItem,
  Blockquote,
  Table,
  TableRow,
  TableCell,
  Text,
  ThematicBreak,
} from 'mdast';
import type { Position, Point } from 'unist';

/**
 * Configuration options for the Markdown parser.
 */
export interface ParserOptions {
  /**
   * Enable GitHub Flavored Markdown extensions.
   * Includes: tables, strikethrough, task lists, autolinks.
   * @default true
   */
  gfm?: boolean;
}

/**
 * Result of parsing a Markdown document.
 */
export interface ParseResult {
  /** The parsed mdast Abstract Syntax Tree */
  ast: Root;
  /** Source file path (only present when using parseFile) */
  filePath?: string;
}

/**
 * Error codes for parser failures.
 */
export type ParserErrorCode = 'FILE_NOT_FOUND' | 'FILE_READ_ERROR' | 'PARSE_ERROR';

/**
 * Custom error class for parser-related failures.
 */
export class ParserError extends Error {
  public readonly code: ParserErrorCode;
  public readonly filePath?: string;

  constructor(code: ParserErrorCode, message: string, filePath?: string) {
    super(message);
    this.name = 'ParserError';
    this.code = code;
    this.filePath = filePath;
    // Maintains proper stack trace in V8 environments (Node.js)
    Error.captureStackTrace(this, ParserError);
  }
}

// Re-export commonly used mdast types for convenience
export type {
  Root,
  RootContent,
  Position,
  Point,
  Heading,
  Paragraph,
  Code,
  List,
  ListItem,
  Blockquote,
  Table,
  TableRow,
  TableCell,
  Text,
  ThematicBreak,
};
