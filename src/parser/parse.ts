import { readFile, access } from 'node:fs/promises';
import { createProcessor } from './processor.js';
import { ParserError, type ParserOptions, type ParseResult } from './types.js';

/**
 * Parses a Markdown string into an mdast Abstract Syntax Tree.
 *
 * @param content - The Markdown content to parse
 * @param options - Parser configuration options
 * @returns The parsed AST wrapped in a ParseResult
 *
 * @example
 * ```typescript
 * const result = parseMarkdown('# Hello\n\nWorld');
 * console.log(result.ast.children[0].type); // 'heading'
 * ```
 */
export function parseMarkdown(content: string, options?: ParserOptions): ParseResult {
  const processor = createProcessor(options);
  const ast = processor.parse(content);

  return { ast };
}

/**
 * Reads a Markdown file and parses it into an mdast Abstract Syntax Tree.
 *
 * @param filePath - Path to the Markdown file
 * @param options - Parser configuration options
 * @returns The parsed AST wrapped in a ParseResult, including the file path
 * @throws {ParserError} When the file cannot be read or parsed
 *
 * @example
 * ```typescript
 * const result = await parseFile('./README.md');
 * console.log(result.filePath); // './README.md'
 * console.log(result.ast.type); // 'root'
 * ```
 */
export async function parseFile(filePath: string, options?: ParserOptions): Promise<ParseResult> {
  // Check file exists first for better error messages
  try {
    await access(filePath);
  } catch {
    throw new ParserError('FILE_NOT_FOUND', `File not found: ${filePath}`, filePath);
  }

  // Read file content
  let content: string;
  try {
    content = await readFile(filePath, 'utf-8');
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown read error';
    throw new ParserError('FILE_READ_ERROR', `Failed to read file: ${message}`, filePath);
  }

  // Parse the content
  const result = parseMarkdown(content, options);

  return {
    ...result,
    filePath,
  };
}
