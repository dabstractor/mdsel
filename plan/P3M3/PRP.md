# PRP: P3M3 - CLI Implementation

**Phase 3, Milestone 3 - Commander.js CLI with index and select commands**

---

## Goal

**Feature Goal**: Implement a fully functional CLI using Commander.js that enables LLM agents to index Markdown documents and select specific content using path-based selectors, outputting strict JSON for programmatic consumption.

**Deliverable**: A production-ready `src/cli/index.ts` module that:
- Implements the `index` command to parse documents and emit selector inventory
- Implements the `select` command to retrieve content via selectors with optional truncation bypass
- Handles exit codes (0 success, 1 error, 2 usage error)
- Supports both file arguments and stdin input
- Outputs strict JSON following the CLIResponse envelope
- Comprehensive CLI integration test suite

**Success Definition**: Running `npm run build && mdsel index README.md` and `mdsel select "readme::heading:h1[0]" README.md` produce valid JSON matching the response schemas in `plan/architecture/output_format.md`, and all CLI tests pass with proper exit codes.

---

## Why

- **LLM Agent Interface**: This is the primary interface for LLM agents to interact with Markdown documents
- **Declarative Selection**: Enables agents to request exactly the content they need without exposing irrelevant content
- **Token Efficiency**: Structured JSON output with truncation support minimizes token consumption
- **Integration Point**: CLI orchestrates all previously built modules (parser, selector, resolver, output)
- **Production Readiness**: Exit codes and error handling enable reliable integration in automated pipelines

---

## What

Complete the CLI implementation by replacing placeholder commands with functional implementations:

1. **index command** - Parse files, build document indices, emit selector inventory
2. **select command** - Parse selector, resolve against documents, return matched content
3. **Exit code handling** - Implement proper exit codes for success/error/usage scenarios
4. **stdin support** - Read from stdin when no files provided
5. **Integration tests** - Test CLI behavior end-to-end

### Success Criteria

- [ ] `mdsel index <files...>` outputs valid CLIResponse<IndexResponse> JSON
- [ ] `mdsel select <selector> [files...]` outputs valid CLIResponse<SelectResponse> JSON
- [ ] `--full` flag bypasses truncation for select command
- [ ] Exit code 0 on success, 1 on error, 2 on usage error
- [ ] Supports reading from stdin: `cat file.md | mdsel index`
- [ ] Namespace derived from filename (README.md → readme)
- [ ] Unresolved selectors include suggestions
- [ ] All CLI tests pass with proper assertions
- [ ] ESLint and TypeScript checks pass

---

## All Needed Context

### Context Completeness Check

_"If someone knew nothing about this codebase, would they have everything needed to implement this successfully?"_ - **YES**, this PRP contains complete orchestration patterns, existing module APIs, validation commands, and references to all necessary documentation.

### Documentation & References

```yaml
# MUST READ - Architecture Documentation (in codebase)
- file: plan/architecture/output_format.md
  why: Complete JSON output schema specification with examples
  pattern: CLIResponse envelope, IndexResponse, SelectResponse structures
  gotcha: All responses require success, command, timestamp fields

- file: plan/architecture/selector_grammar.md
  why: Selector syntax rules for parsing and validation
  pattern: namespace::type[index]/path?query format
  gotcha: Index is 0-based, namespace is optional, ?full=true bypasses truncation

- file: plan/docs/PRD.md (sections 9-10)
  why: CLI command surface and exit code requirements
  pattern: index <files...>, select <selector> [files...] --full
  gotcha: Exit code 0=success, 1=error, 2=usage

- file: README.md
  why: Expected CLI usage examples and output format
  pattern: Command invocation examples with expected JSON output
  gotcha: JSON output must match examples exactly

# MUST READ - Existing Module APIs
- file: src/parser/index.ts
  why: parseFile and parseMarkdown functions for reading files
  exports: |
    parseFile(filePath: string, options?: ParserOptions): Promise<ParseResult>
    parseMarkdown(content: string, options?: ParserOptions): ParseResult
    ParserError - custom error class with code and filePath
  gotcha: parseFile throws ParserError with FILE_NOT_FOUND, PARSE_ERROR codes

- file: src/selector/index.ts
  why: parseSelector function for parsing selector strings
  exports: |
    parseSelector(input: string): SelectorAST
    SelectorParseError - custom error class with code and position
  gotcha: parseSelector throws SelectorParseError with detailed error codes

- file: src/resolver/index.ts
  why: resolveMulti and resolveSingle for resolving selectors
  exports: |
    resolveMulti(documents: DocumentTree[], selector: SelectorAST): ResolutionOutcome
    resolveSingle(tree: Root, namespace: string, selector: SelectorAST, availableSelectors: string[]): ResolutionOutcome
    SuggestionEngine - generates Levenshtein-based suggestions
  gotcha: ResolutionOutcome is discriminated union (success: true/false)

- file: src/output/index.ts
  why: Response formatters for CLI output
  exports: |
    formatIndexResponse(documents: DocumentIndex[], summary: IndexSummary): CLIResponse<IndexResponse>
    formatSelectResponse(matches: SelectMatch[], unresolved: UnresolvedSelector[]): CLIResponse<SelectResponse>
    formatErrorResponse(command, errors, partialResults?): CLIResponse<null>
    createErrorEntry(type, code, message, file?, selector?, suggestions?): ErrorEntry
  gotcha: formatSelectResponse sets success:false when unresolved.length > 0

# MUST READ - Existing CLI Placeholder
- file: src/cli/index.ts
  why: Current CLI structure with Commander.js setup
  pattern: program.command('index'), program.command('select') with placeholder actions
  gotcha: Must preserve existing structure, replace action handlers only

# MUST READ - Test Patterns
- file: tests/output/formatters.test.ts
  why: Test structure for CLI-related tests
  pattern: describe/it blocks, expect assertions, JSON validation
  gotcha: Use Vitest globals (describe, it, expect imported or global)

# External Documentation
- url: https://www.npmjs.com/package/commander
  why: Commander.js API reference
  critical: Option parsing, argument handling, action handlers

- url: https://www.npmjs.com/package/mdast-util-to-string
  why: Extract plain text from mdast nodes
  critical: Used for content preview and word counting

- url: https://www.npmjs.com/package/mdast-util-to-markdown
  why: Convert mdast back to markdown string
  critical: Used for content extraction in select command
```

### Current Codebase Tree

```bash
/home/dustin/projects/mdsel/
├── package.json                     # Commander.js ^12.1.0 already installed
├── tsconfig.json                    # ESM, NodeNext, strict
├── vitest.config.ts                 # globals: true, node environment
├── eslint.config.js
├── README.md                        # CLI usage examples
├── src/
│   ├── cli/
│   │   └── index.ts                 # PLACEHOLDER - To be implemented
│   ├── parser/                      # COMPLETE - parseFile, parseMarkdown
│   │   ├── index.ts
│   │   ├── types.ts
│   │   ├── processor.ts
│   │   └── parse.ts
│   ├── selector/                    # COMPLETE - parseSelector
│   │   ├── index.ts
│   │   ├── types.ts
│   │   ├── tokenizer.ts
│   │   └── parser.ts
│   ├── resolver/                    # COMPLETE - resolveMulti, resolveSingle
│   │   ├── index.ts
│   │   ├── types.ts
│   │   ├── levenshtein.ts
│   │   ├── suggestions.ts
│   │   ├── single-resolver.ts
│   │   └── multi-resolver.ts
│   ├── output/                      # COMPLETE - formatters
│   │   ├── index.ts
│   │   ├── types.ts
│   │   ├── formatters.ts
│   │   └── utils.ts
│   ├── lexer/                       # Internal lexer module
│   └── utils/
│       └── validation.ts
├── tests/
│   ├── fixtures/                    # Test markdown files
│   │   ├── simple.md
│   │   ├── complex.md
│   │   ├── empty.md
│   │   └── edge-cases/
│   ├── parser/
│   ├── selector/
│   ├── resolver/
│   ├── output/
│   └── edge-cases/
└── dist/                            # Build output
```

### Desired Codebase Tree After P3M3 Completion

```bash
/home/dustin/projects/mdsel/
├── src/
│   ├── cli/
│   │   ├── index.ts                 # Main CLI entry point with index/select commands
│   │   ├── commands/
│   │   │   ├── index-command.ts     # index command implementation
│   │   │   └── select-command.ts    # select command implementation
│   │   ├── utils/
│   │   │   ├── file-reader.ts       # File reading and stdin handling
│   │   │   ├── namespace.ts         # Namespace derivation from filename
│   │   │   ├── content-extractor.ts # Extract content from nodes
│   │   │   └── exit-codes.ts        # Exit code constants
│   │   └── types.ts                 # CLI-specific types
│   ├── parser/                      # Unchanged
│   ├── selector/                    # Unchanged
│   ├── resolver/                    # Unchanged
│   └── output/                      # Unchanged
├── tests/
│   ├── cli/
│   │   ├── index-command.test.ts    # index command tests
│   │   ├── select-command.test.ts   # select command tests
│   │   └── exit-codes.test.ts       # Exit code tests
│   └── ...                          # Existing tests
└── ...
```

### Known Gotchas & Library Quirks

```typescript
// CRITICAL: ESM imports MUST use .js extension in source files
import { parseFile } from '../parser/index.js';     // CORRECT
import { parseFile } from '../parser/index';        // WRONG - runtime error

// CRITICAL: Commander.js action handlers receive parsed arguments
program
  .command('select <selector> [files...]')
  .option('--full', 'Bypass truncation')
  .action((selector: string, files: string[], options: { full?: boolean }) => {
    // selector = first argument, files = variadic, options = parsed flags
  });

// CRITICAL: Namespace derivation from filename
// README.md → 'readme' (lowercase, no extension)
// API_GUIDE.md → 'api_guide' (preserve underscores, lowercase)
function deriveNamespace(filePath: string): string {
  const basename = path.basename(filePath, path.extname(filePath));
  return basename.toLowerCase();
}

// CRITICAL: Exit codes must be explicit
// Success: process.exit(0)
// Error: process.exit(1)
// Usage error (invalid args): process.exit(2)

// CRITICAL: JSON output to stdout, errors to stderr
console.log(JSON.stringify(response));  // Output to stdout
console.error('Error message');         // Errors to stderr

// CRITICAL: stdin detection for piped input
if (!process.stdin.isTTY && files.length === 0) {
  // Read from stdin
  const content = await readStdin();
}

// GOTCHA: Commander.js parses process.argv automatically
program.parse();  // Uses process.argv by default

// GOTCHA: ?full=true in selector OR --full flag bypass truncation
const isFull = options.full ||
  selectorAst.queryParams?.some(p => p.key === 'full' && p.value === 'true');

// GOTCHA: ResolutionOutcome is discriminated union
if (outcome.success) {
  // outcome.results is available
} else {
  // outcome.error is available
}

// GOTCHA: mdast-util-to-string for text extraction
import { toString } from 'mdast-util-to-string';
const text = toString(node);  // Returns plain text

// GOTCHA: mdast-util-to-markdown for markdown extraction
import { toMarkdown } from 'mdast-util-to-markdown';
const md = toMarkdown(node);  // Returns markdown string

// GOTCHA: Word counting - split on whitespace, filter empty
function countWords(text: string): number {
  return text.trim().split(/\s+/).filter(w => w.length > 0).length;
}

// GOTCHA: Content preview - first 80 characters
function getPreview(text: string, maxLen = 80): string {
  if (text.length <= maxLen) return text;
  return text.slice(0, maxLen) + '...';
}

// GOTCHA: Truncation marker for large content
const TRUNCATION_MARKER = '[truncated]';
const MAX_WORDS = 500;

// GOTCHA: Pagination - internal 0-indexed, display 1-indexed
// page[0] internally → current_page: 1 in output
```

---

## Implementation Blueprint

### Data Models and Structure

```typescript
// src/cli/types.ts

import type { Root } from 'mdast';

/**
 * Exit codes for CLI commands.
 */
export const ExitCode = {
  SUCCESS: 0,
  ERROR: 1,
  USAGE_ERROR: 2,
} as const;

export type ExitCodeValue = typeof ExitCode[keyof typeof ExitCode];

/**
 * Parsed document with namespace.
 */
export interface ParsedDocument {
  namespace: string;
  filePath: string;
  tree: Root;
  availableSelectors: string[];
}

/**
 * Options for the select command.
 */
export interface SelectOptions {
  full?: boolean;
}

/**
 * Content extraction result.
 */
export interface ExtractedContent {
  markdown: string;
  text: string;
  wordCount: number;
  truncated: boolean;
}
```

### Implementation Tasks (Ordered by Dependencies)

```yaml
Task 1: CREATE src/cli/utils/exit-codes.ts
  - IMPLEMENT: ExitCode constants (SUCCESS=0, ERROR=1, USAGE_ERROR=2)
  - IMPLEMENT: exitWithCode(code: ExitCodeValue) helper
  - PATTERN: Constants object with named exports
  - PLACEMENT: /src/cli/utils/exit-codes.ts
  - VALIDATION: Import and use in CLI handlers

Task 2: CREATE src/cli/utils/namespace.ts
  - IMPLEMENT: deriveNamespace(filePath: string): string
    - Extract basename without extension
    - Convert to lowercase
    - Preserve underscores and hyphens
  - FOLLOW pattern: README.md → 'readme', API_GUIDE.md → 'api_guide'
  - PLACEMENT: /src/cli/utils/namespace.ts
  - VALIDATION: Unit test with various filenames

Task 3: CREATE src/cli/utils/file-reader.ts
  - IMPLEMENT: readStdin(): Promise<string>
    - Read all data from process.stdin
    - Return concatenated string
    - Handle encoding (UTF-8)
  - IMPLEMENT: isStdinPiped(): boolean
    - Return !process.stdin.isTTY
  - FOLLOW pattern: Node.js stdin reading patterns
  - PLACEMENT: /src/cli/utils/file-reader.ts
  - VALIDATION: Can read piped input in tests

Task 4: CREATE src/cli/utils/content-extractor.ts
  - IMPLEMENT: extractMarkdown(node: Content | Root): string
    - Use mdast-util-to-markdown
    - Return markdown string with trimmed whitespace
  - IMPLEMENT: extractText(node: Content | Root): string
    - Use mdast-util-to-string
    - Return plain text
  - IMPLEMENT: countWords(text: string): number
    - Split on /\s+/, filter empty, return length
  - IMPLEMENT: getContentPreview(text: string, maxLen?: number): string
    - Default maxLen = 80
    - Return text + '...' if truncated
  - IMPLEMENT: truncateContent(content: string, options: { full?: boolean }): ExtractedContent
    - If full: return as-is
    - If wordCount > MAX_WORDS: truncate and add [truncated] marker
  - DEPENDENCIES: mdast-util-to-string, mdast-util-to-markdown (already installed)
  - PLACEMENT: /src/cli/utils/content-extractor.ts
  - VALIDATION: Unit tests for each function

Task 5: CREATE src/cli/utils/selector-builder.ts
  - IMPLEMENT: buildAvailableSelectors(tree: Root, namespace: string): string[]
    - Traverse tree and collect all valid selector paths
    - Include heading:hN[i], block:type[i], root, section[i]
    - Used for suggestion generation
  - IMPLEMENT: buildDocumentIndex(tree: Root, namespace: string, filePath: string): DocumentIndex
    - Create NodeDescriptor for root
    - Create HeadingDescriptor for each heading
    - Count blocks by type
    - Calculate word counts
  - DEPENDENCIES: Content extractor from Task 4
  - PLACEMENT: /src/cli/utils/selector-builder.ts
  - VALIDATION: Unit tests with fixture files

Task 6: CREATE src/cli/commands/index-command.ts
  - IMPLEMENT: indexCommand(files: string[]): Promise<void>
    - Validate files array not empty (exit 2 if empty and no stdin)
    - For each file: parseFile, deriveNamespace, buildDocumentIndex
    - Handle stdin if no files and stdin is piped
    - Aggregate results into IndexResponse
    - Output formatIndexResponse to stdout
    - Handle errors with formatErrorResponse
    - Exit with appropriate code
  - DEPENDENCIES: Tasks 1-5, parser, output modules
  - PATTERN:
    ```typescript
    const documents: DocumentIndex[] = [];
    const errors: ErrorEntry[] = [];

    for (const file of files) {
      try {
        const result = await parseFile(file);
        const namespace = deriveNamespace(file);
        const index = buildDocumentIndex(result.ast, namespace, file);
        documents.push(index);
      } catch (error) {
        if (error instanceof ParserError) {
          errors.push(createErrorEntry(error.code as ErrorType, ...));
        }
      }
    }

    if (documents.length === 0 && errors.length > 0) {
      console.log(JSON.stringify(formatErrorResponse('index', errors)));
      process.exit(ExitCode.ERROR);
    }

    const response = formatIndexResponse(documents, summary);
    console.log(JSON.stringify(response));
    process.exit(ExitCode.SUCCESS);
    ```
  - PLACEMENT: /src/cli/commands/index-command.ts
  - VALIDATION: CLI integration tests with fixture files

Task 7: CREATE src/cli/commands/select-command.ts
  - IMPLEMENT: selectCommand(selector: string, files: string[], options: SelectOptions): Promise<void>
    - Parse selector with parseSelector
    - Handle selector parse errors (exit 1 with error response)
    - Parse all files, derive namespaces
    - Check for ?full=true in selector OR --full flag
    - Use resolveMulti to find matches
    - Extract and truncate content (unless full)
    - Format response with formatSelectResponse
    - Include unresolved selectors with suggestions
    - Exit with appropriate code
  - DEPENDENCIES: Tasks 1-6, selector, resolver modules
  - PATTERN:
    ```typescript
    // Parse selector
    let selectorAst: SelectorAST;
    try {
      selectorAst = parseSelector(selector);
    } catch (error) {
      if (error instanceof SelectorParseError) {
        const errorEntry = createErrorEntry(
          'INVALID_SELECTOR',
          error.code,
          error.message,
          undefined,
          selector
        );
        console.log(JSON.stringify(formatErrorResponse('select', [errorEntry])));
        process.exit(ExitCode.ERROR);
      }
      throw error;
    }

    // Check for full flag
    const isFull = options.full ||
      selectorAst.queryParams?.some(p => p.key === 'full' && p.value === 'true');

    // Parse files and build DocumentTree[]
    const documents: DocumentTree[] = [];
    for (const file of files) {
      const result = await parseFile(file);
      const namespace = deriveNamespace(file);
      const selectors = buildAvailableSelectors(result.ast, namespace);
      documents.push({ namespace, tree: result.ast, availableSelectors: selectors });
    }

    // Resolve selector
    const outcome = resolveMulti(documents, selectorAst);

    // Format response
    if (outcome.success) {
      const matches = outcome.results.map(r => formatMatch(r, isFull));
      console.log(JSON.stringify(formatSelectResponse(matches, [])));
      process.exit(ExitCode.SUCCESS);
    } else {
      const unresolved = [{
        selector: outcome.error.selector,
        reason: outcome.error.message,
        suggestions: outcome.error.suggestions.map(s => s.selector)
      }];
      console.log(JSON.stringify(formatSelectResponse([], unresolved)));
      process.exit(ExitCode.ERROR);
    }
    ```
  - PLACEMENT: /src/cli/commands/select-command.ts
  - VALIDATION: CLI integration tests with various selectors

Task 8: MODIFY src/cli/index.ts
  - REPLACE: Placeholder index command action with indexCommand call
  - REPLACE: Placeholder select command action with selectCommand call
  - ADD: Error handling wrapper for unhandled errors
  - ADD: Help text with usage examples
  - PRESERVE: Existing program setup (name, description, version)
  - PATTERN:
    ```typescript
    import { Command } from 'commander';
    import { createRequire } from 'module';
    import { indexCommand } from './commands/index-command.js';
    import { selectCommand } from './commands/select-command.js';
    import { ExitCode } from './utils/exit-codes.js';

    const require = createRequire(import.meta.url);
    const pkg = require('../package.json') as { description: string; version: string };

    const program = new Command();

    program
      .name('mdsel')
      .description(pkg.description)
      .version(pkg.version);

    program
      .command('index')
      .description('Parse documents and emit selector inventory')
      .argument('<files...>', 'Markdown files to index')
      .action(async (files: string[]) => {
        try {
          await indexCommand(files);
        } catch (error) {
          console.error('Unexpected error:', error);
          process.exit(ExitCode.ERROR);
        }
      });

    program
      .command('select')
      .description('Retrieve content via selectors')
      .argument('<selector>', 'Selector string')
      .argument('[files...]', 'Markdown files to search')
      .option('--full', 'Bypass truncation and return full content')
      .action(async (selector: string, files: string[], options: { full?: boolean }) => {
        try {
          await selectCommand(selector, files, options);
        } catch (error) {
          console.error('Unexpected error:', error);
          process.exit(ExitCode.ERROR);
        }
      });

    program.parse();
    ```
  - PLACEMENT: /src/cli/index.ts
  - VALIDATION: mdsel --help shows commands, mdsel index --help shows options

Task 9: CREATE tests/cli/index-command.test.ts
  - IMPLEMENT: Unit tests for index command
    - TEST: Indexes single file correctly
    - TEST: Indexes multiple files correctly
    - TEST: Returns proper JSON structure
    - TEST: Includes all headings in response
    - TEST: Includes block counts summary
    - TEST: Handles FILE_NOT_FOUND error
    - TEST: Handles PARSE_ERROR for invalid markdown
    - TEST: Empty file produces empty index
  - FOLLOW pattern: tests/output/formatters.test.ts
  - USE fixtures: tests/fixtures/*.md
  - PLACEMENT: /tests/cli/index-command.test.ts
  - VALIDATION: npm run test -- tests/cli/index-command.test.ts

Task 10: CREATE tests/cli/select-command.test.ts
  - IMPLEMENT: Unit tests for select command
    - TEST: Selects heading by selector
    - TEST: Selects code block by selector
    - TEST: Cross-document selection works
    - TEST: Namespace-qualified selection works
    - TEST: --full flag bypasses truncation
    - TEST: ?full=true query param bypasses truncation
    - TEST: Invalid selector returns error with suggestions
    - TEST: Unresolved selector returns suggestions
    - TEST: Path composition works (heading:h2[0]/block:code[0])
  - FOLLOW pattern: tests/resolver/*.test.ts
  - USE fixtures: tests/fixtures/*.md
  - PLACEMENT: /tests/cli/select-command.test.ts
  - VALIDATION: npm run test -- tests/cli/select-command.test.ts

Task 11: CREATE tests/cli/exit-codes.test.ts
  - IMPLEMENT: Tests for exit code behavior
    - TEST: Success returns exit code 0
    - TEST: Error returns exit code 1
    - TEST: Invalid arguments return exit code 2
    - TEST: Partial success (some files fail) behavior
  - NOTE: May need to spawn child process for true exit code testing
  - PLACEMENT: /tests/cli/exit-codes.test.ts
  - VALIDATION: npm run test -- tests/cli/exit-codes.test.ts
```

### Implementation Patterns & Key Details

#### src/cli/utils/content-extractor.ts (Task 4)

```typescript
import { toString } from 'mdast-util-to-string';
import { toMarkdown } from 'mdast-util-to-markdown';
import type { Root, Content } from 'mdast';

const MAX_WORDS = 500;
const PREVIEW_LENGTH = 80;
const TRUNCATION_MARKER = '[truncated]';

/**
 * Extract markdown string from an mdast node.
 */
export function extractMarkdown(node: Content | Root): string {
  return toMarkdown(node).trimEnd();
}

/**
 * Extract plain text from an mdast node.
 */
export function extractText(node: Content | Root): string {
  return toString(node);
}

/**
 * Count words in text using whitespace splitting.
 */
export function countWords(text: string): number {
  const trimmed = text.trim();
  if (trimmed === '') return 0;
  return trimmed.split(/\s+/).filter(w => w.length > 0).length;
}

/**
 * Get a content preview truncated to max length.
 */
export function getContentPreview(text: string, maxLen: number = PREVIEW_LENGTH): string {
  if (text.length <= maxLen) return text;
  return text.slice(0, maxLen) + '...';
}

/**
 * Truncate content at word boundaries.
 */
export function truncateContent(
  content: string,
  options: { full?: boolean } = {}
): { content: string; truncated: boolean; wordCount: number } {
  const wordCount = countWords(content);

  if (options.full || wordCount <= MAX_WORDS) {
    return { content, truncated: false, wordCount };
  }

  // Truncate at word boundary
  const words = content.trim().split(/\s+/);
  const truncatedWords = words.slice(0, MAX_WORDS);
  const truncatedContent = truncatedWords.join(' ') + ' ' + TRUNCATION_MARKER;

  return {
    content: truncatedContent,
    truncated: true,
    wordCount: MAX_WORDS,
  };
}
```

#### src/cli/utils/selector-builder.ts (Task 5)

```typescript
import type { Root, Content, Heading, Paragraph, Code, List, Table, Blockquote } from 'mdast';
import type { DocumentIndex, HeadingDescriptor, NodeDescriptor, BlockSummary } from '../../output/types.js';
import { extractText, countWords, getContentPreview } from './content-extractor.js';

/**
 * Build list of available selectors for a document.
 */
export function buildAvailableSelectors(tree: Root, namespace: string): string[] {
  const selectors: string[] = [];
  const headingCounts: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0 };
  const blockCounts: Record<string, number> = {
    paragraph: 0,
    code: 0,
    list: 0,
    table: 0,
    blockquote: 0,
  };

  // Add root selector
  selectors.push(`${namespace}::root`);

  // Traverse children
  for (const child of tree.children) {
    if (child.type === 'heading') {
      const depth = (child as Heading).depth;
      const index = headingCounts[depth]++;
      selectors.push(`${namespace}::heading:h${depth}[${index}]`);
    } else {
      const blockType = mapNodeTypeToBlockType(child.type);
      if (blockType) {
        const index = blockCounts[blockType]++;
        selectors.push(`${namespace}::block:${blockType}[${index}]`);
      }
    }
  }

  return selectors;
}

/**
 * Build document index for index command output.
 */
export function buildDocumentIndex(
  tree: Root,
  namespace: string,
  filePath: string
): DocumentIndex {
  const headings: HeadingDescriptor[] = [];
  const blockCounts: BlockSummary = {
    paragraphs: 0,
    code_blocks: 0,
    lists: 0,
    tables: 0,
    blockquotes: 0,
  };

  const headingIndices: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0 };

  // Process root content (before first heading)
  let root: NodeDescriptor | null = null;
  const preHeadingContent: Content[] = [];
  let foundHeading = false;

  for (const child of tree.children) {
    if (child.type === 'heading') {
      foundHeading = true;
      const heading = child as Heading;
      const depth = heading.depth as 1 | 2 | 3 | 4 | 5 | 6;
      const index = headingIndices[depth]++;
      const text = extractText(heading);

      headings.push({
        selector: `${namespace}::heading:h${depth}[${index}]`,
        type: `heading:h${depth}`,
        depth,
        text,
        content_preview: getContentPreview(text),
        truncated: false,
        children_count: 0, // Would need section analysis for accurate count
        word_count: countWords(text),
        section_word_count: countWords(text), // Simplified
        section_truncated: false,
      });
    } else {
      if (!foundHeading) {
        preHeadingContent.push(child);
      }
      // Count blocks
      countBlock(child, blockCounts);
    }
  }

  // Build root descriptor if there's pre-heading content
  if (preHeadingContent.length > 0) {
    const rootText = preHeadingContent.map(c => extractText(c)).join('\n');
    root = {
      selector: `${namespace}::root`,
      type: 'root',
      content_preview: getContentPreview(rootText),
      truncated: false,
      children_count: preHeadingContent.length,
      word_count: countWords(rootText),
    };
  }

  return {
    namespace,
    file_path: filePath,
    root,
    headings,
    blocks: blockCounts,
  };
}

function mapNodeTypeToBlockType(type: string): string | null {
  switch (type) {
    case 'paragraph': return 'paragraph';
    case 'code': return 'code';
    case 'list': return 'list';
    case 'table': return 'table';
    case 'blockquote': return 'blockquote';
    default: return null;
  }
}

function countBlock(node: Content, counts: BlockSummary): void {
  switch (node.type) {
    case 'paragraph': counts.paragraphs++; break;
    case 'code': counts.code_blocks++; break;
    case 'list': counts.lists++; break;
    case 'table': counts.tables++; break;
    case 'blockquote': counts.blockquotes++; break;
  }
}
```

### Integration Points

```yaml
PARSER_INTEGRATION:
  - Import: parseFile, parseMarkdown, ParserError from '../parser/index.js'
  - Usage: Parse files before building indices or resolving selectors
  - Error handling: Catch ParserError, map to ErrorEntry

SELECTOR_INTEGRATION:
  - Import: parseSelector, SelectorParseError from '../selector/index.js'
  - Usage: Parse selector string before resolution
  - Error handling: Catch SelectorParseError, map to ErrorEntry with INVALID_SELECTOR

RESOLVER_INTEGRATION:
  - Import: resolveMulti, type DocumentTree, type ResolutionOutcome from '../resolver/index.js'
  - Usage: Resolve parsed selector against parsed documents
  - Error handling: Handle ResolutionFailure with suggestions

OUTPUT_INTEGRATION:
  - Import: formatIndexResponse, formatSelectResponse, formatErrorResponse, createErrorEntry
  - Import: type CLIResponse, type IndexResponse, type SelectResponse, type ErrorEntry
  - Usage: Format all CLI output through these formatters
  - Output: JSON.stringify(response) to stdout
```

---

## Validation Loop

### Level 1: Syntax & Style (Immediate Feedback)

```bash
# After creating each file, run type check
npm run type-check

# Fix any TypeScript errors before proceeding
# Common issues:
# - Missing .js extension in imports
# - Wrong import type (import vs import type)
# - Missing type annotations

# Run linting
npm run lint

# Auto-fix lint issues
npm run lint:fix

# Check formatting
npm run format:check

# Auto-format if needed
npm run format

# Expected: All commands exit with code 0
```

### Level 2: Unit Tests (Component Validation)

```bash
# Run CLI utility tests
npm run test:run -- tests/cli/**/*.test.ts -v

# Run specific test file
npm run test:run -- tests/cli/index-command.test.ts -v
npm run test:run -- tests/cli/select-command.test.ts -v

# Expected output:
# ✓ index command indexes single file correctly
# ✓ index command includes all headings
# ✓ select command selects heading by selector
# ✓ select command returns suggestions for invalid selector
# ...

# Run all tests with coverage
npm run test:coverage

# Expected: Coverage >= 80% for src/cli/**/*.ts
```

### Level 3: Integration Testing (System Validation)

```bash
# Build the project
npm run build

# Verify CLI is executable
./dist/cli.mjs --help

# Test index command with fixture
./dist/cli.mjs index tests/fixtures/simple.md | jq .

# Expected output structure:
# {
#   "success": true,
#   "command": "index",
#   "timestamp": "2025-...",
#   "data": {
#     "documents": [...],
#     "summary": {...}
#   }
# }

# Test select command
./dist/cli.mjs select "simple::heading:h1[0]" tests/fixtures/simple.md | jq .

# Expected output structure:
# {
#   "success": true,
#   "command": "select",
#   "timestamp": "2025-...",
#   "data": {
#     "matches": [...],
#     "unresolved": []
#   }
# }

# Test error handling
./dist/cli.mjs select "invalid[[[" tests/fixtures/simple.md | jq .

# Expected: success: false, errors with INVALID_SELECTOR

# Test exit codes
./dist/cli.mjs index tests/fixtures/simple.md; echo "Exit code: $?"
# Expected: Exit code: 0

./dist/cli.mjs index nonexistent.md; echo "Exit code: $?"
# Expected: Exit code: 1

./dist/cli.mjs; echo "Exit code: $?"
# Expected: Exit code: 2 (no command provided - Commander handles this)
```

### Level 4: End-to-End CLI Testing

```bash
# Test stdin piping
cat tests/fixtures/simple.md | ./dist/cli.mjs index | jq .success
# Expected: true

# Test --full flag
./dist/cli.mjs select "simple::heading:h1[0]" tests/fixtures/complex.md --full | jq .data.matches[0].truncated
# Expected: false (even if content is large)

# Test ?full=true query param
./dist/cli.mjs select "simple::heading:h1[0]?full=true" tests/fixtures/complex.md | jq .data.matches[0].truncated
# Expected: false

# Test multiple files
./dist/cli.mjs index tests/fixtures/simple.md tests/fixtures/complex.md | jq .data.summary.total_documents
# Expected: 2

# Test cross-document selection
./dist/cli.mjs select "heading:h1[0]" tests/fixtures/simple.md tests/fixtures/complex.md | jq '.data.matches | length'
# Expected: >= 1 (matches from any document)

# Verify JSON is valid
./dist/cli.mjs index tests/fixtures/simple.md | python3 -c "import json,sys; json.load(sys.stdin)"
# Expected: No error (valid JSON)
```

---

## Final Validation Checklist

### Technical Validation

- [ ] All 4 validation levels completed successfully
- [ ] `npm run test:run` passes all CLI tests
- [ ] `npm run type-check` reports zero TypeScript errors
- [ ] `npm run lint` reports zero ESLint errors
- [ ] `npm run build` completes without errors
- [ ] Coverage >= 80% for `src/cli/**/*.ts`

### Feature Validation

- [ ] `mdsel index <files...>` outputs valid CLIResponse<IndexResponse>
- [ ] `mdsel select <selector> [files...]` outputs valid CLIResponse<SelectResponse>
- [ ] Namespace derived correctly from filename (lowercase, no extension)
- [ ] --full flag bypasses truncation
- [ ] ?full=true query param bypasses truncation
- [ ] Invalid selectors return error with suggestions
- [ ] Exit code 0 on success
- [ ] Exit code 1 on error
- [ ] Output is valid JSON (parseable by jq and Python)

### Code Quality Validation

- [ ] All files use `.js` extension in imports
- [ ] Follows existing code patterns from parser/resolver/output modules
- [ ] JSDoc comments on all public functions
- [ ] Error handling matches existing patterns
- [ ] No console.log for debugging (only for JSON output)

### Files Created Checklist

- [ ] `/src/cli/utils/exit-codes.ts`
- [ ] `/src/cli/utils/namespace.ts`
- [ ] `/src/cli/utils/file-reader.ts`
- [ ] `/src/cli/utils/content-extractor.ts`
- [ ] `/src/cli/utils/selector-builder.ts`
- [ ] `/src/cli/commands/index-command.ts`
- [ ] `/src/cli/commands/select-command.ts`
- [ ] `/src/cli/index.ts` (modified)
- [ ] `/tests/cli/index-command.test.ts`
- [ ] `/tests/cli/select-command.test.ts`
- [ ] `/tests/cli/exit-codes.test.ts`

---

## Anti-Patterns to Avoid

- Do not use `require()` - this is an ESM project
- Do not omit `.js` extensions in import paths
- Do not use console.log for debugging - only for JSON output
- Do not use console.error for JSON output - only for unexpected errors
- Do not hardcode exit codes - use ExitCode constants
- Do not skip error handling - every error should produce valid JSON response
- Do not return plain text - always return JSON via formatters
- Do not ignore stdin - check !process.stdin.isTTY when no files provided
- Do not forget to call process.exit() - Commander doesn't exit automatically after action
- Do not catch errors silently - always produce error response JSON
- Do not use sync fs operations - use async parseFile
- Do not deviate from CLIResponse envelope structure

---

## Confidence Score

**Implementation Success Likelihood: 9/10**

**Rationale:**
- All dependent modules (parser, selector, resolver, output) are complete and tested
- Clear orchestration pattern with existing module APIs
- Commander.js already set up with placeholder commands
- Comprehensive test patterns established in codebase
- JSON output schemas fully specified in architecture docs
- Exit code conventions are standard and well-documented
- stdin handling pattern is well-established in Node.js

**Risk Factors:**
- Minor: stdin handling complexity (mitigated with clear isStdinPiped pattern)
- Minor: Content truncation edge cases (mitigated with explicit word-boundary truncation)
- Minor: Integration complexity (mitigated with modular command structure)

---

## Execution Notes

1. **Follow task order**: Create utilities → commands → update index.ts → tests
2. **Validate after each file**: Run `npm run type-check` after each file creation
3. **Test incrementally**: Run tests for each component before moving to next
4. **Use exact imports**: Copy import statements exactly as shown
5. **Build before CLI testing**: Run `npm run build` before testing CLI directly
6. **Check JSON validity**: Use `jq` or Python to validate JSON output
7. **Exit codes matter**: Test exit codes explicitly in integration tests
8. **ESM everywhere**: All imports use `.js` extension, all files are ESM
9. **Output to stdout only**: All JSON goes to console.log, errors to console.error
