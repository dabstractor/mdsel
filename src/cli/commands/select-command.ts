/**
 * Select command implementation for CLI.
 *
 * Resolves selectors against markdown files and outputs matching content.
 *
 * @module cli/commands/select-command
 */

/* eslint-disable */
import type { SelectMatch, ChildInfo, ErrorEntry } from '../../output/types.js';
import type { ResolutionResult } from '../../resolver/types.js';
import { parseFile, ParserError } from '../../parser/index.js';
import { parseSelector, SelectorParseError } from '../../selector/index.js';
import { resolveMulti, type DocumentTree } from '../../resolver/index.js';
import { formatSelectResponse, formatErrorResponse, createErrorEntry } from '../../output/index.js';
import { deriveNamespace } from '../utils/namespace.js';
import { buildAvailableSelectors } from '../utils/selector-builder.js';
import { extractMarkdown, truncateContent } from '../utils/content-extractor.js';
import { ExitCode, exitWithCode } from '../utils/exit-codes.js';

/**
 * Options for the select command.
 */
export interface SelectOptions {
  /** Bypass truncation and return full content */
  full?: boolean;
}

/**
 * Execute the select command.
 *
 * Parses the selector, resolves it against the specified documents,
 * and outputs a JSON response containing the matched content.
 *
 * @param selector - The selector string to resolve
 * @param files - Array of file paths to search
 * @param options - Command options
 *
 * @example
 * ```bash
 * mdsel select "readme::heading:h1[0]" README.md
 * mdsel select "heading:h2[0]" README.md CONTRIBUTING.md
 * mdsel select "docs::section[5]?full=true" docs.md --full
 * ```
 */
export async function selectCommand(
  selector: string,
  files: string[],
  options: SelectOptions = {},
): Promise<void> {
  // Validate files
  if (files.length === 0) {
    const error = createErrorEntry(
      'PARSE_ERROR',
      'NO_FILES',
      'No files provided. Specify files to search.',
    );
    console.log(JSON.stringify(formatErrorResponse('select', [error])));
    exitWithCode(ExitCode.ERROR);
    return;
  }

  // Parse selector
  let selectorAst: ReturnType<typeof parseSelector>;
  try {
    selectorAst = parseSelector(selector);
  } catch (error) {
    if (error instanceof SelectorParseError) {
      const errorEntry = createErrorEntry(
        'INVALID_SELECTOR',
        error.code,
        error.message,
        undefined,
        selector,
      );
      console.log(JSON.stringify(formatErrorResponse('select', [errorEntry])));
      exitWithCode(ExitCode.ERROR);
      return;
    }
    throw error;
  }

  // Check for full flag (either --full OR ?full=true in selector)
  const hasFullQueryParam =
    selectorAst.queryParams?.some((p) => p.key === 'full' && p.value === 'true') ?? false;
  const isFull = options.full === true || hasFullQueryParam;

  // Parse all files and build DocumentTree[]
  const documents: DocumentTree[] = [];
  const parseErrors: ErrorEntry[] = [];

  for (const file of files) {
    try {
      const result = await parseFile(file);
      const namespace = deriveNamespace(file);
      const selectors = buildAvailableSelectors(result.ast, namespace);
      documents.push({
        namespace,
        tree: result.ast,
        availableSelectors: selectors,
      });
    } catch (error) {
      if (error instanceof ParserError) {
        parseErrors.push(
          createErrorEntry(
            error.code as 'FILE_NOT_FOUND' | 'PARSE_ERROR',
            error.code,
            error.message,
            error.filePath,
          ),
        );
      } else if (error instanceof Error) {
        parseErrors.push(createErrorEntry('PROCESSING_ERROR', 'UNKNOWN', error.message, file));
      }
    }
  }

  // If no documents could be parsed, return error
  if (documents.length === 0) {
    console.log(JSON.stringify(formatErrorResponse('select', parseErrors)));
    exitWithCode(ExitCode.ERROR);
    return;
  }

  // Resolve selector
  const outcome = resolveMulti(documents, selectorAst);

  // Format response based on outcome
  if (outcome.success) {
    const matches = formatMatches(outcome.results, isFull);
    const response = formatSelectResponse(matches, []);
    console.log(JSON.stringify(response));
    exitWithCode(ExitCode.SUCCESS);
    return;
  }

  // Selector resolution failed
  const error = outcome.error;
  const unresolved = [
    {
      selector: error.selector,
      reason: error.message,
      suggestions: error.suggestions.map((s) => s.selector),
    },
  ];
  const response = formatSelectResponse([], unresolved);
  console.log(JSON.stringify(response));
  exitWithCode(ExitCode.ERROR);
}

/**
 * Format resolution results into SelectMatch objects.
 */
function formatMatches(results: ResolutionResult[], isFull: boolean): SelectMatch[] {
  return results.map((result) => {
    const { content, truncated } = truncateContent(extractMarkdown(result.node), { full: isFull });

    // Build children_available list
    const childrenAvailable: ChildInfo[] = [];
    if (result.childrenAvailable && result.node.children) {
      for (const child of result.node.children) {
        const childText = extractMarkdown(child);
        const childPreview = childText.slice(0, 80);
        childrenAvailable.push({
          selector: `${String(result.selector)}/${String(child.type)}`,
          type: String(child.type),
          preview: childPreview,
        });
      }
    }

    return {
      selector: String(result.selector),
      type: String(result.node.type),
      content,
      truncated,
      children_available: childrenAvailable,
    };
  });
}
