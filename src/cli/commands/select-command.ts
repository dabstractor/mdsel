/**
 * Select command implementation for CLI.
 *
 * Resolves selectors against markdown files and outputs matching content.
 * Default output is minimal text; use --json for JSON format.
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
import { formatSelectText, formatErrorText } from '../../output/text-formatters.js';
import { deriveNamespace } from '../utils/namespace.js';
import { buildAvailableSelectors } from '../utils/selector-builder.js';
import { extractMarkdown, truncateContent, type TruncateOptions } from '../utils/content-extractor.js';
import { ExitCode, exitWithCode } from '../utils/exit-codes.js';

/**
 * Options for the select command.
 */
export interface SelectOptions {
  /** Output JSON instead of text */
  json?: boolean;
}

/**
 * Execute the select command.
 *
 * Parses the selector, resolves it against the specified documents,
 * and outputs the matched content.
 * Default output is minimal text; use --json for JSON format.
 *
 * @param selector - The selector string to resolve
 * @param files - Array of file paths to search
 * @param options - Command options
 *
 * @example
 * ```bash
 * mdsel README.md h1.0
 * mdsel README.md CONTRIBUTING.md h2.0
 * mdsel --json docs.md "section[5]?head=10"
 * ```
 */
export async function selectCommand(
  selector: string,
  files: string[],
  options: SelectOptions = {},
): Promise<void> {
  const useJson = options.json === true;

  // Validate files
  if (files.length === 0) {
    const error = createErrorEntry(
      'PARSE_ERROR',
      'NO_FILES',
      'No files provided. Specify files to search.',
    );
    outputError([error], useJson);
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
      outputError([errorEntry], useJson);
      exitWithCode(ExitCode.ERROR);
      return;
    }
    throw error;
  }

  // Parse head/tail query params for truncation
  const truncateOptions: TruncateOptions = {};
  if (selectorAst.queryParams) {
    for (const param of selectorAst.queryParams) {
      if (param.key === 'head') {
        const value = parseInt(param.value, 10);
        if (!isNaN(value) && value > 0) {
          truncateOptions.head = value;
        }
      } else if (param.key === 'tail') {
        const value = parseInt(param.value, 10);
        if (!isNaN(value) && value > 0) {
          truncateOptions.tail = value;
        }
      }
    }
  }

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
    outputError(parseErrors, useJson);
    exitWithCode(ExitCode.ERROR);
    return;
  }

  // Resolve selector
  const outcome = resolveMulti(documents, selectorAst);

  // Format response based on outcome
  if (outcome.success) {
    const matches = formatMatches(outcome.results, truncateOptions);
    if (useJson) {
      const response = formatSelectResponse(matches, []);
      console.log(JSON.stringify(response));
    } else {
      console.log(formatSelectText(matches, []));
    }
    exitWithCode(ExitCode.SUCCESS);
    return;
  }

  // Selector resolution failed
  const err = outcome.error;
  const unresolved = [
    {
      selector: err.selector,
      reason: err.message,
      suggestions: err.suggestions.map((s) => s.selector),
    },
  ];
  if (useJson) {
    const response = formatSelectResponse([], unresolved);
    console.log(JSON.stringify(response));
  } else {
    console.log(formatSelectText([], unresolved));
  }
  exitWithCode(ExitCode.ERROR);
}

/**
 * Output error in appropriate format.
 */
function outputError(errors: ErrorEntry[], useJson: boolean): void {
  if (useJson) {
    // JSON errors to stdout for consistent parsing
    console.log(JSON.stringify(formatErrorResponse('select', errors)));
  } else {
    // Text errors to stderr per Unix convention
    console.error(formatErrorText(errors));
  }
}

// Block types that are selectable (map mdast type to selector shorthand)
const SELECTABLE_BLOCKS: Record<string, string> = {
  paragraph: 'para',
  code: 'code',
  list: 'list',
  table: 'table',
  blockquote: 'quote',
};

/**
 * Format resolution results into SelectMatch objects.
 */
function formatMatches(results: ResolutionResult[], truncateOpts: TruncateOptions): SelectMatch[] {
  return results.map((result) => {
    const { content, truncated } = truncateContent(extractMarkdown(result.node), truncateOpts);

    // Build children_available list - only include selectable block types
    const childrenAvailable: ChildInfo[] = [];
    if (result.childrenAvailable && result.node.children) {
      // Track counts per type for indexing
      const typeCounts: Record<string, number> = {};

      for (const child of result.node.children) {
        const childType = String(child.type);

        // Check if it's a heading
        if (childType === 'heading' && 'depth' in child) {
          const level = `h${child.depth as number}`;
          const idx = typeCounts[level] ?? 0;
          typeCounts[level] = idx + 1;

          const childText = extractMarkdown(child);
          const childPreview = childText.slice(0, 80).replace(/^#+\s*/, '');
          childrenAvailable.push({
            selector: `${level}[${idx}]`,
            type: 'heading',
            preview: childPreview,
          });
        }
        // Check if it's a selectable block
        else if (childType in SELECTABLE_BLOCKS) {
          const shorthand = SELECTABLE_BLOCKS[childType];
          const idx = typeCounts[shorthand] ?? 0;
          typeCounts[shorthand] = idx + 1;

          const childText = extractMarkdown(child);
          const childPreview = childText.slice(0, 80);
          childrenAvailable.push({
            selector: `${shorthand}[${idx}]`,
            type: childType,
            preview: childPreview,
          });
        }
        // Skip inline types (text, emphasis, strong, link, etc.)
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

/**
 * Execute the select command with multiple selectors.
 *
 * Parses each selector, resolves them against the specified documents,
 * and outputs all matched content.
 *
 * @param selectors - Array of selector strings to resolve
 * @param files - Array of file paths to search
 * @param options - Command options
 *
 * @example
 * ```bash
 * mdsel README.md h1.0 h2.0 h2.1
 * mdsel README.md code.0 para.0
 * ```
 */
export async function selectMultiCommand(
  selectors: string[],
  files: string[],
  options: SelectOptions = {},
): Promise<void> {
  const useJson = options.json === true;

  // Validate files
  if (files.length === 0) {
    const error = createErrorEntry(
      'PARSE_ERROR',
      'NO_FILES',
      'No files provided. Specify files to search.',
    );
    outputError([error], useJson);
    exitWithCode(ExitCode.ERROR);
    return;
  }

  // Parse all files and build DocumentTree[]
  const documents: DocumentTree[] = [];
  const parseErrors: ErrorEntry[] = [];

  for (const file of files) {
    try {
      const result = await parseFile(file);
      const namespace = deriveNamespace(file);
      const availableSelectors = buildAvailableSelectors(result.ast, namespace);
      documents.push({
        namespace,
        tree: result.ast,
        availableSelectors,
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
    outputError(parseErrors, useJson);
    exitWithCode(ExitCode.ERROR);
    return;
  }

  // Process each selector
  const allMatches: SelectMatch[] = [];
  const allUnresolved: Array<{ selector: string; reason: string; suggestions: string[] }> = [];

  for (const selector of selectors) {
    // Parse selector
    let selectorAst: ReturnType<typeof parseSelector>;
    try {
      selectorAst = parseSelector(selector);
    } catch (error) {
      if (error instanceof SelectorParseError) {
        allUnresolved.push({
          selector,
          reason: error.message,
          suggestions: [],
        });
        continue;
      }
      throw error;
    }

    // Parse head/tail query params for truncation
    const truncateOptions: TruncateOptions = {};
    if (selectorAst.queryParams) {
      for (const param of selectorAst.queryParams) {
        if (param.key === 'head') {
          const value = parseInt(param.value, 10);
          if (!isNaN(value) && value > 0) {
            truncateOptions.head = value;
          }
        } else if (param.key === 'tail') {
          const value = parseInt(param.value, 10);
          if (!isNaN(value) && value > 0) {
            truncateOptions.tail = value;
          }
        }
      }
    }

    // Resolve selector
    const outcome = resolveMulti(documents, selectorAst);

    if (outcome.success) {
      const matches = formatMatches(outcome.results, truncateOptions);
      allMatches.push(...matches);
    } else {
      const err = outcome.error;
      allUnresolved.push({
        selector: err.selector,
        reason: err.message,
        suggestions: err.suggestions.map((s) => s.selector),
      });
    }
  }

  // Output results
  if (useJson) {
    const response = formatSelectResponse(allMatches, allUnresolved);
    console.log(JSON.stringify(response));
  } else {
    console.log(formatSelectText(allMatches, allUnresolved));
  }

  // Exit with error if any selectors failed
  exitWithCode(allUnresolved.length > 0 ? ExitCode.ERROR : ExitCode.SUCCESS);
}
