/**
 * Index command implementation for CLI.
 *
 * Parses markdown files and emits selector inventory as JSON.
 *
 * @module cli/commands/index-command
 */

import type { DocumentIndex, IndexSummary, ErrorEntry, CLIResponse } from '../../output/types.js';
import { parseFile, ParserError, parseMarkdown } from '../../parser/index.js';
import { formatIndexResponse, formatErrorResponse, createErrorEntry } from '../../output/index.js';
import { deriveNamespace } from '../utils/namespace.js';
import { buildDocumentIndex } from '../utils/selector-builder.js';
import { isStdinPiped, readStdin } from '../utils/file-reader.js';
import { ExitCode, exitWithCode } from '../utils/exit-codes.js';

/**
 * Execute the index command.
 *
 * Parses the specified markdown files and outputs a JSON response
 * containing the selector inventory for each document.
 *
 * @param files - Array of file paths to index
 *
 * @example
 * ```bash
 * mdsel index README.md
 * mdsel index README.md CONTRIBUTING.md
 * ```
 */
export async function indexCommand(files: string[]): Promise<void> {
  const documents: DocumentIndex[] = [];
  const errors: ErrorEntry[] = [];

  // Handle stdin if no files provided and stdin is piped
  if (files.length === 0 && isStdinPiped()) {
    await indexStdin();
    return;
  }

  // Validate files array
  if (files.length === 0) {
    const error = createErrorEntry(
      'PARSE_ERROR',
      'NO_FILES',
      'No files provided. Specify files to index or pipe content via stdin.',
    );
    console.log(JSON.stringify(formatErrorResponse('index', [error])));
    exitWithCode(ExitCode.ERROR);
    return;
  }

  // Process each file
  for (const file of files) {
    try {
      const result = await parseFile(file);
      const namespace = deriveNamespace(file);
      const index = buildDocumentIndex(result.ast, namespace, file);
      documents.push(index);
    } catch (error) {
      if (error instanceof ParserError) {
        errors.push(
          createErrorEntry(
            error.code as 'FILE_NOT_FOUND' | 'PARSE_ERROR',
            error.code,
            error.message,
            error.filePath,
          ),
        );
      } else if (error instanceof Error) {
        errors.push(createErrorEntry('PROCESSING_ERROR', 'UNKNOWN', error.message, file));
      }
    }
  }

  // Handle complete failure
  if (documents.length === 0 && errors.length > 0) {
    console.log(JSON.stringify(formatErrorResponse('index', errors)));
    exitWithCode(ExitCode.ERROR);
    return;
  }

  // Handle partial success
  if (errors.length > 0) {
    const summary = calculateSummary(documents);
    const response = formatErrorResponse(
      'index',
      errors,
      documents as unknown[], // Using unknown[] as safe conversion
    ) as CLIResponse; // Cast to access optional fields
    // Add partial results to response
    response.partial_results = documents as unknown[];
    response.data = { documents, summary } as unknown;
    response.warnings = [
      `${String(errors.length)} of ${String(files.length)} file(s) could not be processed`,
    ];
    console.log(JSON.stringify(response));
    exitWithCode(ExitCode.ERROR); // Still exit with error code for partial success
    return;
  }

  // Complete success
  const summary = calculateSummary(documents);
  const response = formatIndexResponse(documents, summary);
  console.log(JSON.stringify(response));
  exitWithCode(ExitCode.SUCCESS);
}

/**
 * Index content from stdin.
 */
async function indexStdin(): Promise<void> {
  const documents: DocumentIndex[] = [];
  const errors: ErrorEntry[] = [];

  try {
    const content = await readStdin();
    const result = parseMarkdown(content);
    const namespace = 'stdin';
    const index = buildDocumentIndex(result.ast, namespace, '<stdin>');
    documents.push(index);

    const summary = calculateSummary(documents);
    const response = formatIndexResponse(documents, summary);
    console.log(JSON.stringify(response));
    exitWithCode(ExitCode.SUCCESS);
  } catch (error) {
    if (error instanceof Error) {
      errors.push(createErrorEntry('PARSE_ERROR', 'PARSE_ERROR', error.message, '<stdin>'));
    }
    console.log(JSON.stringify(formatErrorResponse('index', errors)));
    exitWithCode(ExitCode.ERROR);
  }
}

/**
 * Calculate summary statistics for indexed documents.
 */
function calculateSummary(documents: DocumentIndex[]): IndexSummary {
  let totalNodes = 0;
  let totalSelectors = 0;

  for (const doc of documents) {
    // Count root node if present
    if (doc.root) {
      totalNodes++;
      totalSelectors++;
    }
    // Count headings
    totalNodes += doc.headings.length;
    totalSelectors += doc.headings.length;
    // Count blocks
    const blockCount =
      doc.blocks.paragraphs +
      doc.blocks.code_blocks +
      doc.blocks.lists +
      doc.blocks.tables +
      doc.blocks.blockquotes;
    totalNodes += blockCount;
    totalSelectors += blockCount;
  }

  return {
    total_documents: documents.length,
    total_nodes: totalNodes,
    total_selectors: totalSelectors,
  };
}
