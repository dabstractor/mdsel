# PRP: P2M2 - Selector Resolver

**Phase 2, Milestone 2 - Selector Resolver for mdsel CLI**

---

## Goal

**Feature Goal**: Implement a selector resolver that traverses mdast trees to find nodes matching parsed selector ASTs, with intelligent suggestion generation for failed selectors using Levenshtein distance.

**Deliverable**: A `src/resolver/` module containing:
- Resolution type definitions (ResolutionResult, ResolutionError, Suggestion)
- Single-tree resolver for resolving selectors against one document
- Multi-tree resolver for resolving selectors across multiple documents
- Levenshtein distance implementation for fuzzy matching
- Suggestion generator for failed selector resolution
- Comprehensive test suite covering all resolution scenarios

**Success Definition**: Running `npm run test` passes all resolver tests with 90%+ coverage, and the resolver correctly:
- Resolves selectors like `doc::heading:h2[1]/block:code[0]` against mdast trees
- Returns structured results with matched nodes and metadata
- Generates intelligent suggestions for failed selectors
- Handles namespace filtering (specific vs. all documents)
- Handles index-based selection with 0-based ordinals
- Returns partial results when some path segments match

---

## Why

- **Selector Resolution Engine**: Converts parsed selector ASTs into actual document content
- **Error Recovery**: When selectors fail, suggestions help users correct them quickly
- **Multi-Document Support**: LLM agents can query across multiple Markdown files efficiently
- **Type Safety**: Strongly typed resolution results ensure correct downstream handling
- **Performance**: O(n) traversal with early termination for failed matches

---

## What

Create the Selector Resolver infrastructure:

1. **Resolution Type Definitions** - ResolutionResult, ResolutionError, Suggestion interfaces
2. **Single-Tree Resolver** - Resolve selectors against one mdast tree
3. **Multi-Tree Resolver** - Resolve selectors across multiple trees (with/without namespace)
4. **Levenshtein Distance** - Space-optimized edit distance calculation
5. **Suggestion Generator** - Fuzzy matching against available selectors
6. **Test Suite** - Unit tests for all resolution scenarios

### Success Criteria

- [ ] `resolveSingle()` finds nodes matching selectors in one tree
- [ ] `resolveMulti()` finds nodes matching selectors across multiple trees
- [ ] Namespace filtering works (specific doc vs. all docs)
- [ ] Index-based selection uses 0-based ordinals correctly
- [ ] Failed resolutions return structured errors with suggestions
- [ ] Levenshtein distance calculates edit distance correctly
- [ ] Suggestion generator ranks candidates by similarity
- [ ] Test coverage >= 90% for resolver module
- [ ] All ESLint and TypeScript checks pass

---

## All Needed Context

### Context Completeness Check

_"If someone knew nothing about this codebase, would they have everything needed to implement this successfully?"_ - **YES**, this PRP contains complete type definitions, algorithm specifications, validation commands, and references to all necessary documentation.

### Documentation & References

```yaml
# MUST READ - Architecture Documentation (in codebase)
- file: plan/architecture/selector_grammar.md
  why: Complete selector grammar with resolution rules
  pattern: namespace::type[index]/type[index] format
  gotcha: Section and Page are virtual nodes - not in mdast AST

- file: plan/architecture/system_context.md
  why: Node type mapping between PRD and mdast
  pattern: mdast Root, Heading, Paragraph, Code, List, Table, Blockquote types
  gotcha: 0-based indexing for ordinals

- file: src/selector/types.ts
  why: SelectorAST types from P2M1
  pattern: SelectorAST, PathSegmentNode, HeadingLevel, BlockType
  gotcha: Parser returns AST with namespace, segments, queryParams

- file: src/selector/parser.ts
  why: Parser implementation for understanding AST structure
  pattern: Class-based recursive descent parser
  gotcha: Index is optional in PathSegmentNode

- file: tests/selector/parser.test.ts
  why: Understanding how selectors are parsed
  pattern: Test organization with describe/it blocks
  gotcha: Error testing pattern with try/catch

# External Research References
- url: https://en.wikipedia.org/wiki/Levenshtein_distance
  why: Core algorithm definition
  critical: Dynamic programming approach with O(m*n) time, O(min(m,n)) space
  pattern: Two-row DP optimization for space efficiency

- url: https://github.com/hiddentao/fast-levenshtein
  why: TypeScript implementation reference
  critical: Space-optimized implementation using two rows
  pattern: Swap rows instead of full matrix

- url: https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_Selectors
  why: Selector resolution concepts (right-to-left matching)
  critical: Index-based selection patterns
  pattern: Array indexing with nth-child semantics

- url: https://github.com/syntax-tree/mdast
  why: Complete mdast node type reference
  critical: All node types have type property and children array
  pattern: Tree traversal with parent references
```

### Current Codebase Tree

```bash
/home/dustin/projects/mdsel/
├── package.json                     # Dependencies: vitest, typescript, eslint
├── tsconfig.json                    # TypeScript config (strict, ESM, NodeNext)
├── vitest.config.ts                 # Test config (globals, v8 coverage)
├── eslint.config.js                 # Linting (strictTypeChecked)
├── src/
│   ├── cli/
│   │   └── index.ts                 # CLI entry with placeholder commands
│   ├── parser/                      # COMPLETE from P1M2
│   │   ├── index.ts                 # Exports parseMarkdown, parseFile, types
│   │   ├── types.ts                 # ParserOptions, ParseResult, ParserError
│   │   ├── processor.ts             # createProcessor factory
│   │   └── parse.ts                 # parseMarkdown, parseFile functions
│   ├── selector/                    # COMPLETE from P2M1
│   │   ├── index.ts                 # Exports parseSelector, tokenize, types
│   │   ├── types.ts                 # SelectorAST, PathSegmentNode, SelectorParseError
│   │   ├── tokenizer.ts             # tokenize() function
│   │   └── parser.ts                # parseSelector() function
│   ├── resolver/                    # EMPTY - To be implemented in this milestone
│   └── output/                      # Future: Output formatters (P3)
├── tests/
│   ├── fixtures/                    # Existing from P1M2
│   │   ├── simple.md
│   │   ├── code-blocks.md
│   │   ├── gfm-features.md
│   │   ├── tables.md
│   │   ├── lists.md
│   │   ├── blockquotes.md
│   │   └── mixed.md
│   ├── parser/                      # Existing from P1M2
│   ├── selector/                    # Existing from P2M1
│   └── resolver/                    # To be created
└── dist/                            # Build output (cli.mjs exists)
```

### Desired Codebase Tree After P2M2 Completion

```bash
/home/dustin/projects/mdsel/
├── src/
│   ├── cli/
│   │   └── index.ts                 # Unchanged
│   ├── parser/                      # Unchanged
│   ├── selector/                    # Unchanged
│   ├── resolver/
│   │   ├── index.ts                 # Public API exports
│   │   ├── types.ts                 # ResolutionResult, ResolutionError, Suggestion types
│   │   ├── levenshtein.ts           # Levenshtein distance implementation
│   │   ├── suggestions.ts           # Suggestion generator
│   │   ├── single-resolver.ts       # Single-tree resolver
│   │   └── multi-resolver.ts        # Multi-tree resolver
│   └── output/                      # Empty (future)
├── tests/
│   ├── fixtures/                    # Unchanged
│   ├── resolver/
│   │   ├── levenshtein.test.ts      # Levenshtein distance tests
│   │   ├── suggestions.test.ts      # Suggestion generator tests
│   │   ├── single-resolver.test.ts  # Single-tree resolver tests
│   │   └── multi-resolver.test.ts   # Multi-tree resolver tests
└── ...
```

### Known Gotchas & Library Quirks

```typescript
// CRITICAL: ESM imports MUST use .js extension in source files
import { resolveSingle } from './single-resolver.js';     // CORRECT
import { resolveSingle } from './single-resolver';        // WRONG - runtime error

// CRITICAL: mdast node types use 'type' property for discrimination
// Root, Heading, Paragraph, Code, List, Table, Blockquote all have:
// - type: string (e.g., 'heading', 'paragraph')
// - children: Node[] (except text nodes)
// - position: Position (optional)

// CRITICAL: Index-based selection is 0-based, per-type, not global
// For selector "heading:h2[1]":
// - Find all h2 headings
// - Return the SECOND one (index 1)
// NOT: The second heading overall

// CRITICAL: Namespace matching rules
// "doc::heading:h2[0]" - Only search in "doc" namespace
// "heading:h2[0]" - Search in ALL namespaces (return first match from each)
// Namespace is derived from file basename (path/to/foo.md -> "foo")

// CRITICAL: Section and Page are virtual nodes NOT in mdast
// They are created by semantic tree builder (P1M3 - not implemented yet)
// For P2M2, we work directly with mdast nodes:
// - Root (type: 'root')
// - Heading (type: 'heading', depth: 1-6)
// - Paragraph (type: 'paragraph')
// - Code (type: 'code', lang: string | undefined)
// - List (type: 'list', ordered: boolean)
// - Table (type: 'table')
// - Blockquote (type: 'blockquote')

// CRITICAL: Path traversal is LEFT-TO-RIGHT, not right-to-left like CSS
// "heading:h2[1]/block:code[0]" means:
// 1. Find second h2 heading
// 2. Within that heading's descendants, find first code block
// Each segment narrows the search scope from previous segment's results

// CRITICAL: Levenshtein distance space optimization
// Use two-row DP instead of full matrix
// Swap rows after each iteration to reuse arrays

// CRITICAL: Suggestion ranking uses multiple factors
// Primary: Similarity ratio (normalized distance)
// Secondary: Absolute distance (prefer fewer edits)
// Tertiary: Selector length (prefer shorter)
// Filter: Minimum ratio threshold (0.4-0.6 depending on query length)

// GOTCHA: Empty mdast tree is valid (Root with empty children)
// Handle gracefully - return empty results

// GOTCHA: Node without children (text, inline nodes)
// Skip during traversal - only block-level nodes are selectable

// GOTCHA: Heading depth mapping from selector to mdast
// Selector "heading:h2" maps to mdast node with { type: 'heading', depth: 2 }
// Extract numeric depth from "h2" -> 2

// GOTCHA: Block type mapping from selector to mdast
// Selector "block:code" maps to mdast node with { type: 'code' }
// Selector "block:list" maps to mdast node with { type: 'list' }
// Block type matches mdast type property directly

// GOTCHA: Multi-document resolution without namespace
// Returns array of results (one per document that matches)
// Each result includes the namespace for identification
```

---

## Implementation Blueprint

### Data Models and Structure

```typescript
// src/resolver/types.ts

import type { Root } from 'mdast';
import type { SelectorAST, PathSegmentNode } from '../selector/types.js';

/**
 * Resolution result for a successful selector match.
 */
export interface ResolutionResult {
  /** The namespace of the document where the match was found */
  namespace: string;
  /** The matched node from the mdast tree */
  node: any;
  /** The selector that was resolved (for reference) */
  selector: string;
  /** Full path to the matched node (if available) */
  path: string[];
  /** Word count of the matched node's content */
  wordCount: number;
  /** Child nodes available for further selection */
  childrenAvailable: boolean;
}

/**
 * Resolution error for failed selector resolution.
 */
export interface ResolutionError {
  /** Error type code */
  type: 'NAMESPACE_NOT_FOUND' | 'SELECTOR_NOT_FOUND' | 'INVALID_PATH' | 'INDEX_OUT_OF_RANGE';
  /** Human-readable error message */
  message: string;
  /** The selector that failed */
  selector: string;
  /** Position in the selector where resolution failed (if known) */
  failedSegment?: PathSegmentNode;
  /** Suggested alternatives (if available) */
  suggestions: Suggestion[];
}

/**
 * Combined resolution result (success or error).
 */
export type ResolutionOutcome = ResolutionSuccess | ResolutionFailure;

export interface ResolutionSuccess {
  success: true;
  results: ResolutionResult[];
}

export interface ResolutionFailure {
  success: false;
  error: ResolutionError;
  /** Partial results if some segments matched */
  partialResults?: ResolutionResult[];
}

/**
 * Suggestion for correcting a failed selector.
 */
export interface Suggestion {
  /** Suggested selector string */
  selector: string;
  /** Edit distance from original query */
  distance: number;
  /** Similarity ratio (0-1, higher is better) */
  ratio: number;
  /** Explanation of why this was suggested */
  reason: 'exact_match' | 'fuzzy_match' | 'typo_correction' | 'index_adjustment';
}

/**
 * Document tree with namespace for multi-document resolution.
 */
export interface DocumentTree {
  /** Namespace (typically filename without extension) */
  namespace: string;
  /** The mdast tree */
  tree: Root;
  /** Available selectors in this document (for suggestions) */
  availableSelectors: string[];
}

/**
 * Resolution context for tracking state during traversal.
 */
export interface ResolutionContext {
  /** Current namespace being resolved */
  namespace: string;
  /** Current path of nodes visited */
  path: any[];
  /** Current depth in the selector path */
  segmentIndex: number;
  /** Total segments in the selector */
  totalSegments: number;
}
```

### Implementation Tasks (Ordered by Dependencies)

```yaml
Task 1: CREATE src/resolver/types.ts
  - IMPLEMENT: ResolutionResult, ResolutionError, Suggestion interfaces
  - IMPLEMENT: ResolutionOutcome, ResolutionSuccess, ResolutionFailure types
  - IMPLEMENT: DocumentTree, ResolutionContext interfaces
  - FOLLOW pattern: src/selector/types.ts (JSDoc comments, import type for mdast)
  - NAMING: PascalCase for types, camelCase for properties
  - IMPORTS: Use `import type` for mdast types
  - PLACEMENT: /src/resolver/types.ts
  - VALIDATION: npx tsc --noEmit passes

Task 2: CREATE src/resolver/levenshtein.ts
  - IMPLEMENT: levenshteinDistance(str1, str2) function
  - FOLLOW pattern: Two-row DP optimization for space efficiency
  - PATTERN:
    - Use shorter string for inner array
    - Swap rows after each iteration
    - Return final distance value
  - NAMING: camelCase for function
  - PLACEMENT: /src/resolver/levenshtein.ts
  - VALIDATION: Unit tests pass for known test cases

Task 3: CREATE src/resolver/suggestions.ts
  - IMPLEMENT: SuggestionEngine class with getSuggestions method
  - IMPLEMENT: findTopNSuggestions, isGoodEnoughMatch helper functions
  - FOLLOW pattern: Rank by ratio, then distance, then length
  - PATTERN:
    - Normalize query and candidates (lowercase, trim)
    - Calculate Levenshtein distance for each candidate
    - Filter by minimum threshold (ratio >= 0.4)
    - Sort by ratio (desc), distance (asc), length (asc)
    - Return top N results
  - DEPENDENCIES: Task 1 (imports types), Task 2 (uses levenshteinDistance)
  - PLACEMENT: /src/resolver/suggestions.ts
  - VALIDATION: Suggestion tests pass with correct ranking

Task 4: CREATE src/resolver/single-resolver.ts
  - IMPLEMENT: resolveSingle(tree, namespace, selector) function
  - IMPLEMENT: resolvePathSegments(context, segments) helper
  - IMPLEMENT: findMatchingChildren(parent, segment) helper
  - IMPLEMENT: countNodesByType(parent, nodeType, subtype) helper
  - FOLLOW pattern: Left-to-right path traversal, index-based selection
  - PATTERN:
    - Start with root node as context
    - For each path segment:
      - Filter children by node type and subtype
      - Select by index if specified
      - Update context to matched node(s)
      - Early exit if no matches
    - Return ResolutionSuccess with matched nodes
    - On failure, return ResolutionError with suggestions
  - DEPENDENCIES: Task 1 (imports types)
  - PLACEMENT: /src/resolver/single-resolver.ts
  - VALIDATION: Unit tests pass for all selector types

Task 5: CREATE src/resolver/multi-resolver.ts
  - IMPLEMENT: resolveMulti(documents, selector) function
  - IMPLEMENT: filterByNamespace(documents, namespace) helper
  - IMPLEMENT: mergeOutcomes(outcomes) helper
  - FOLLOW pattern: Namespace filtering + delegate to single-resolver
  - PATTERN:
    - If selector has namespace: filter documents, resolve in matching doc
    - If no namespace: resolve in all documents, merge results
    - Merge outcomes across documents
    - Generate suggestions from all available selectors
  - DEPENDENCIES: Task 1 (imports types), Task 4 (uses resolveSingle)
  - PLACEMENT: /src/resolver/multi-resolver.ts
  - VALIDATION: Unit tests pass for namespace filtering

Task 6: CREATE src/resolver/index.ts
  - IMPLEMENT: Public API exports
  - EXPORTS:
    - { resolveSingle } from './single-resolver.js'
    - { resolveMulti } from './multi-resolver.js'
    - { SuggestionEngine } from './suggestions.js'
    - { levenshteinDistance } from './levenshtein.js'
    - All types from './types.js'
  - NAMING: Barrel file pattern
  - DEPENDENCIES: Tasks 1-5
  - PLACEMENT: /src/resolver/index.ts
  - VALIDATION: Can import from 'src/resolver/index.js' in test files

Task 7: CREATE tests/resolver/levenshtein.test.ts
  - IMPLEMENT: Unit tests for Levenshtein distance
  - TEST CASES:
    - Returns 0 for identical strings
    - Returns length for completely different strings
    - Returns 1 for single character difference
    - Returns correct distance for known test cases (kitten/sitting = 3)
    - Handles empty strings
    - Handles strings with spaces
    - Is case-sensitive (or normalize before calling)
  - FOLLOW pattern: tests/selector/*.test.ts (Vitest describe/it/expect)
  - COVERAGE: All branches of levenshteinDistance
  - PLACEMENT: /tests/resolver/levenshtein.test.ts
  - VALIDATION: npm run test -- tests/resolver/levenshtein.test.ts passes

Task 8: CREATE tests/resolver/suggestions.test.ts
  - IMPLEMENT: Unit tests for suggestion engine
  - TEST CASES:
    - Returns exact match for identical query
    - Returns closest matches for fuzzy query
    - Sorts by ratio (highest first)
    - Handles empty candidate list
    - Filters out low-ratio matches
    - Returns max results as specified
  - FOLLOW pattern: tests/selector/*.test.ts
  - COVERAGE: All suggestion ranking logic
  - PLACEMENT: /tests/resolver/suggestions.test.ts
  - VALIDATION: npm run test -- tests/resolver/suggestions.test.ts passes

Task 9: CREATE tests/resolver/single-resolver.test.ts
  - IMPLEMENT: Unit tests for single-tree resolver
  - TEST CASES for valid selectors:
    - Resolves root selector
    - Resolves heading by level and index
    - Resolves block by type and index
    - Resolves path with multiple segments
    - Resolves namespaced selector
    - Returns correct node with word count
  - TEST CASES for invalid selectors:
    - Returns error for non-existent namespace
    - Returns error for out-of-range index
    - Returns error for invalid node type
    - Generates suggestions for failed selectors
  - USE fixtures: tests/fixtures/*.md (parse with parseFile)
  - COVERAGE: All resolution paths and error handling
  - PLACEMENT: /tests/resolver/single-resolver.test.ts
  - VALIDATION: npm run test -- tests/resolver/single-resolver.test.ts passes

Task 10: CREATE tests/resolver/multi-resolver.test.ts
  - IMPLEMENT: Unit tests for multi-tree resolver
  - TEST CASES:
    - Resolves in specific namespace when provided
    - Resolves across all namespaces when no namespace
    - Returns results from multiple documents
    - Returns error for non-existent namespace
    - Merges partial results correctly
    - Generates suggestions from all documents
  - USE fixtures: tests/fixtures/*.md
  - COVERAGE: All multi-document scenarios
  - PLACEMENT: /tests/resolver/multi-resolver.test.ts
  - VALIDATION: npm run test -- tests/resolver/multi-resolver.test.ts passes
```

### Implementation Patterns & Key Details

#### src/resolver/types.ts (Task 1)

```typescript
import type { Root } from 'mdast';
import type { SelectorAST, PathSegmentNode } from '../selector/types.js';

/**
 * Resolution result for a successful selector match.
 */
export interface ResolutionResult {
  /** The namespace of the document where the match was found */
  namespace: string;
  /** The matched node from the mdast tree */
  node: any;
  /** The selector that was resolved */
  selector: string;
  /** Full path to the matched node */
  path: any[];
  /** Approximate word count of the matched node */
  wordCount: number;
  /** Whether child nodes are available for further selection */
  childrenAvailable: boolean;
}

/**
 * Resolution error for failed selector resolution.
 */
export interface ResolutionError {
  /** Error type code */
  type: 'NAMESPACE_NOT_FOUND' | 'SELECTOR_NOT_FOUND' | 'INVALID_PATH' | 'INDEX_OUT_OF_RANGE';
  /** Human-readable error message */
  message: string;
  /** The selector that failed */
  selector: string;
  /** Position in the selector where resolution failed */
  failedSegment?: PathSegmentNode;
  /** Suggested alternatives */
  suggestions: Suggestion[];
}

/**
 * Suggestion for correcting a failed selector.
 */
export interface Suggestion {
  /** Suggested selector string */
  selector: string;
  /** Edit distance from original */
  distance: number;
  /** Similarity ratio (0-1) */
  ratio: number;
  /** Reason for suggestion */
  reason: 'exact_match' | 'fuzzy_match' | 'typo_correction' | 'index_adjustment';
}

/**
 * Successful resolution outcome.
 */
export interface ResolutionSuccess {
  success: true;
  results: ResolutionResult[];
}

/**
 * Failed resolution outcome.
 */
export interface ResolutionFailure {
  success: false;
  error: ResolutionError;
  partialResults?: ResolutionResult[];
}

/**
 * Combined resolution outcome.
 */
export type ResolutionOutcome = ResolutionSuccess | ResolutionFailure;

/**
 * Document tree for multi-document resolution.
 */
export interface DocumentTree {
  namespace: string;
  tree: Root;
  availableSelectors: string[];
}

/**
 * Word count options (for consistency with future tree module).
 */
export interface WordCountOptions {
  countCode?: boolean;
}
```

#### src/resolver/levenshtein.ts (Task 2)

```typescript
/**
 * Calculate Levenshtein distance between two strings.
 *
 * Uses space-optimized dynamic programming with two rows.
 *
 * @param str1 - First string
 * @param str2 - Second string
 * @returns Edit distance (number of single-character edits)
 *
 * @example
 * ```typescript
 * levenshteinDistance('kitten', 'sitting'); // Returns: 3
 * levenshteinDistance('hello', 'hello');   // Returns: 0
 * ```
 */
export function levenshteinDistance(str1: string, str2: string): number {
  const len1 = str1.length;
  const len2 = str2.length;

  // Use shorter string for inner array (space optimization)
  if (len1 < len2) {
    return levenshteinDistance(str2, str1);
  }

  // Create two rows for DP
  let prevRow: number[] = Array.from({ length: len2 + 1 }, (_, i) => i);
  let currRow: number[] = new Array(len2 + 1);

  for (let i = 1; i <= len1; i++) {
    currRow[0] = i;

    for (let j = 1; j <= len2; j++) {
      const cost = str1[i - 1] === str2[j - 1] ? 0 : 1;
      currRow[j] = Math.min(
        currRow[j - 1] + 1,        // insertion
        prevRow[j] + 1,            // deletion
        prevRow[j - 1] + cost      // substitution
      );
    }

    // Swap rows for next iteration
    [prevRow, currRow] = [currRow, prevRow];
  }

  return prevRow[len2];
}
```

#### src/resolver/suggestions.ts (Task 3)

```typescript
import { levenshteinDistance } from './levenshtein.js';
import type { Suggestion } from './types.js';

/**
 * Configuration for suggestion engine.
 */
export interface SuggestionOptions {
  /** Maximum number of suggestions to return. Default: 5 */
  maxResults?: number;
  /** Minimum similarity ratio (0-1). Default: 0.4 */
  minRatio?: number;
  /** Whether to include exact matches. Default: true */
  includeExact?: boolean;
}

/**
 * Engine for generating selector suggestions using fuzzy matching.
 */
export class SuggestionEngine {
  private candidates: string[];

  constructor(candidates: string[]) {
    this.candidates = candidates;
  }

  /**
   * Get suggestions for a query selector.
   *
   * @param query - The query selector
   * @param options - Configuration options
   * @returns Ranked array of suggestions
   */
  getSuggestions(query: string, options: SuggestionOptions = {}): Suggestion[] {
    const {
      maxResults = 5,
      minRatio = 0.4,
      includeExact = true
    } = options;

    const normalizedQuery = query.toLowerCase().trim();
    const results: Suggestion[] = [];

    // Find exact matches
    if (includeExact) {
      const exactMatches = this.candidates.filter(
        candidate => candidate.toLowerCase() === normalizedQuery
      );

      exactMatches.forEach(selector => {
        results.push({
          selector,
          distance: 0,
          ratio: 1,
          reason: 'exact_match'
        });
      });
    }

    // Find fuzzy matches
    const fuzzyMatches = this.candidates
      .filter(candidate => {
        if (includeExact && results.some(r => r.selector === candidate)) {
          return false; // Skip exact matches
        }

        const normalizedCandidate = candidate.toLowerCase().trim();
        const distance = levenshteinDistance(normalizedQuery, normalizedCandidate);
        const maxLen = Math.max(normalizedQuery.length, normalizedCandidate.length);
        const ratio = maxLen === 0 ? 1 : (maxLen - distance) / maxLen;

        return ratio >= minRatio;
      })
      .map(candidate => {
        const normalizedCandidate = candidate.toLowerCase().trim();
        const distance = levenshteinDistance(normalizedQuery, normalizedCandidate);
        const maxLen = Math.max(normalizedQuery.length, normalizedCandidate.length);
        const ratio = maxLen === 0 ? 1 : (maxLen - distance) / maxLen;

        return {
          selector: candidate,
          distance,
          ratio,
          reason: distance <= 2 ? 'typo_correction' : 'fuzzy_match'
        } as Suggestion;
      });

    // Combine and sort
    const allResults = [...results, ...fuzzyMatches];

    return allResults
      .sort((a, b) => {
        // Primary: ratio (descending)
        if (Math.abs(b.ratio - a.ratio) > 0.001) {
          return b.ratio - a.ratio;
        }
        // Secondary: distance (ascending)
        if (a.distance !== b.distance) {
          return a.distance - b.distance;
        }
        // Tertiary: selector length (ascending)
        return a.selector.length - b.selector.length;
      })
      .slice(0, maxResults);
  }
}
```

#### src/resolver/single-resolver.ts (Task 4)

```typescript
import type { Root } from 'mdast';
import type { SelectorAST } from '../selector/types.js';
import type {
  ResolutionOutcome,
  ResolutionSuccess,
  ResolutionFailure,
  ResolutionResult,
  ResolutionError
} from './types.js';
import { SuggestionEngine } from './suggestions.js';

/**
 * Resolve a selector against a single document tree.
 *
 * @param tree - The mdast tree
 * @param namespace - Document namespace (e.g., filename without extension)
 * @param selector - The parsed selector AST
 * @param availableSelectors - All available selectors in this document (for suggestions)
 * @returns Resolution outcome (success or error)
 */
export function resolveSingle(
  tree: Root,
  namespace: string,
  selector: SelectorAST,
  availableSelectors: string[]
): ResolutionOutcome {
  try {
    // Check namespace match
    if (selector.namespace && selector.namespace !== namespace) {
      return createNamespaceError(selector, [namespace]);
    }

    // Start resolution from root
    const context = {
      namespace,
      path: [],
      currentNode: tree,
      segmentIndex: 0,
      totalSegments: selector.segments.length
    };

    const result = resolvePathSegments(context, selector.segments);

    if (result.success) {
      return {
        success: true,
        results: [{
          namespace,
          node: result.node,
          nodeType: result.nodeType,
          selector: selectorToString(selector),
          path: result.path,
          wordCount: estimateWordCount(result.node),
          childrenAvailable: hasChildren(result.node)
        }]
      };
    } else {
      // Generate suggestions
      const engine = new SuggestionEngine(availableSelectors);
      const suggestions = engine.getSuggestions(selectorToString(selector));

      return {
        success: false,
        error: {
          type: 'SELECTOR_NOT_FOUND',
          message: result.error,
          selector: selectorToString(selector),
          failedSegment: selector.segments[result.failedAtSegment],
          suggestions
        }
      };
    }
  } catch (error) {
    return {
      success: false,
      error: {
        type: 'INVALID_PATH',
        message: error instanceof Error ? error.message : 'Unknown error',
        selector: selectorToString(selector),
        suggestions: []
      }
    };
  }
}

/**
 * Resolve path segments against the tree.
 */
function resolvePathSegments(
  context: ResolutionContext,
  segments: SelectorAST['segments']
): ResolutionSuccess | ResolutionFailure {
  let currentNode = context.currentNode;
  const path = [...context.path];

  for (let i = 0; i < segments.length; i++) {
    const segment = segments[i];

    const matches = findMatchingChildren(currentNode, segment);

    if (matches.length === 0) {
      return {
        success: false,
        error: `No match found for segment at index ${i}`,
        failedAtSegment: i
      };
    }

    // Apply index if specified
    if (segment.index !== undefined) {
      if (segment.index >= matches.length) {
        return {
          success: false,
          error: `Index ${segment.index} out of range (only ${matches.length} matches)`,
          failedAtSegment: i
        };
      }
      currentNode = matches[segment.index];
    } else {
      currentNode = matches[0]; // Default to first match
    }

    path.push(currentNode);
  }

  return {
    success: true,
    node: currentNode,
    path
  };
}

/**
 * Find children matching a path segment.
 */
function findMatchingChildren(parent: any, segment: PathSegmentNode): any[] {
  if (!parent || !parent.children) {
    return [];
  }

  let matches: any[] = [];

  switch (segment.nodeType) {
    case 'root':
      // Root is the starting point, not searched
      matches = [];
      break;

    case 'heading':
      if (segment.subtype && segment.subtype.startsWith('h')) {
        const depth = parseInt(segment.subtype.slice(1), 10);
        matches = parent.children.filter(
          (child: any) => child.type === 'heading' && child.depth === depth
        );
      }
      break;

    case 'section':
    case 'page':
      // Virtual nodes not in mdast - would require semantic tree
      matches = [];
      break;

    case 'block':
      if (segment.subtype) {
        matches = parent.children.filter(
          (child: any) => child.type === segment.subtype
        );
      }
      break;
  }

  // Count same-type siblings for index calculation
  const allOfType = parent.children.filter((child: any) => child.type === (segment.subtype || segment.nodeType));
  return allOfType;
}

/**
 * Estimate word count for a node (simplified).
 */
function estimateWordCount(node: any): number {
  if (!node) return 0;

  // Simple heuristic: extract text and split by whitespace
  const text = node.value || '';
  return text.trim().split(/\s+/).filter(w => w.length > 0).length;
}

/**
 * Check if node has children.
 */
function hasChildren(node: any): boolean {
  return node && node.children && node.children.length > 0;
}

/**
 * Convert selector AST back to string (for error messages).
 */
function selectorToString(selector: SelectorAST): string {
  let result = '';

  if (selector.namespace) {
    result += `${selector.namespace}::`;
  }

  result += selector.segments.map(seg => {
    let segStr = seg.nodeType;
    if (seg.subtype) {
      segStr += `:${seg.subtype}`;
    }
    if (seg.index !== undefined) {
      segStr += `[${seg.index}]`;
    }
    return segStr;
  }).join('/');

  return result;
}

/**
 * Create namespace error outcome.
 */
function createNamespaceError(selector: SelectorAST, availableNamespaces: string[]): ResolutionFailure {
  return {
    success: false,
    error: {
      type: 'NAMESPACE_NOT_FOUND',
      message: `Namespace '${selector.namespace}' not found`,
      selector: selectorToString(selector),
      suggestions: availableNamespaces.map(ns => ({
        selector: `${ns}::${selectorToString(selector).replace(/^[^:]+::/, '')}`,
        distance: 0,
        ratio: 1,
        reason: 'typo_correction' as const
      }))
    }
  };
}

// Internal types
interface ResolutionContext {
  namespace: string;
  path: any[];
  currentNode: any;
  segmentIndex: number;
  totalSegments: number;
}
```

#### src/resolver/multi-resolver.ts (Task 5)

```typescript
import type { SelectorAST } from '../selector/types.js';
import type { ResolutionOutcome, DocumentTree } from './types.js';
import { resolveSingle } from './single-resolver.js';
import { SuggestionEngine } from './suggestions.js';

/**
 * Resolve a selector against multiple document trees.
 *
 * @param documents - Array of document trees with namespaces
 * @param selector - The parsed selector AST
 * @returns Resolution outcome (success or error)
 */
export function resolveMulti(
  documents: DocumentTree[],
  selector: SelectorAST
): ResolutionOutcome {
  // If selector has namespace, filter to that document only
  if (selector.namespace) {
    const targetDoc = documents.find(doc => doc.namespace === selector.namespace);

    if (!targetDoc) {
      // Namespace not found - generate suggestions from available namespaces
      const availableNamespaces = documents.map(doc => doc.namespace);
      const engine = new SuggestionEngine(availableNamespaces);
      const suggestions = engine.getSuggestions(selector.namespace);

      return {
        success: false,
        error: {
          type: 'NAMESPACE_NOT_FOUND',
          message: `Namespace '${selector.namespace}' not found`,
          selector: selectorToString(selector),
          suggestions: suggestions.map(s => ({
            selector: `${s.selector}::${selectorToString(selector).replace(/^[^:]+::/, '')}`,
            distance: s.distance,
            ratio: s.ratio,
            reason: s.reason
          }))
        }
      };
    }

    return resolveSingle(targetDoc.tree, targetDoc.namespace, selector, targetDoc.availableSelectors);
  }

  // No namespace - resolve across all documents
  const outcomes: ResolutionOutcome[] = [];

  for (const doc of documents) {
    const outcome = resolveSingle(doc.tree, doc.namespace, selector, doc.availableSelectors);
    outcomes.push(outcome);
  }

  // Merge outcomes
  const allResults: any[] = [];
  const allErrors: any[] = [];

  for (const outcome of outcomes) {
    if (outcome.success) {
      allResults.push(...outcome.results);
    } else {
      allErrors.push(outcome.error);
    }
  }

  // If any results found, return success
  if (allResults.length > 0) {
    return {
      success: true,
      results: allResults
    };
  }

  // No results - return error with combined suggestions
  const allSelectors = documents.flatMap(doc => doc.availableSelectors);
  const engine = new SuggestionEngine(allSelectors);
  const suggestions = engine.getSuggestions(selectorToString(selector));

  return {
    success: false,
    error: {
      type: 'SELECTOR_NOT_FOUND',
      message: 'No matches found in any document',
      selector: selectorToString(selector),
      suggestions
    }
  };
}

/**
 * Convert selector AST to string.
 */
function selectorToString(selector: SelectorAST): string {
  let result = '';

  if (selector.namespace) {
    result += `${selector.namespace}::`;
  }

  result += selector.segments.map(seg => {
    let segStr = seg.nodeType;
    if (seg.subtype) {
      segStr += `:${seg.subtype}`;
    }
    if (seg.index !== undefined) {
      segStr += `[${seg.index}]`;
    }
    return segStr;
  }).join('/');

  return result;
}
```

#### src/resolver/index.ts (Task 6)

```typescript
// Public API for the resolver module
export { resolveSingle } from './single-resolver.js';
export { resolveMulti } from './multi-resolver.js';
export { SuggestionEngine, type SuggestionOptions } from './suggestions.js';
export { levenshteinDistance } from './levenshtein.js';

// Type exports
export {
  type ResolutionResult,
  type ResolutionError,
  type ResolutionSuccess,
  type ResolutionFailure,
  type ResolutionOutcome,
  type Suggestion,
  type DocumentTree,
  type WordCountOptions
} from './types.js';
```

### Integration Points

```yaml
PARSER_INTEGRATION:
  - The resolver consumes SelectorAST from parser module
  - Import: { parseSelector, type SelectorAST } from '../selector/index.js'
  - Usage: const ast = parseSelector(selectorString);
           const result = resolveSingle(tree, namespace, ast, selectors);

PARSER_INTEGRATION (Multi-document):
  - Parse selectors first, then resolve
  - Import: { parseFile, type ParseResult } from '../parser/index.js'
  - Usage: const { ast } = await parseFile(filePath);
           const docs = [{ namespace: 'file', tree: ast, availableSelectors }];
  - Combine multiple files for multi-document resolution

SELECTOR_MODULE_DEPENDENCY:
  - Uses SelectorAST from P2M1
  - Must have P2M1 implemented first
  - Type-safe integration with PathSegmentNode

FUTURE_INTEGRATION (P3 - Output Formatting):
  - The formatter will consume ResolutionOutcome
  - Convert to JSON output for CLI
  - Handle success and error cases appropriately
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
# Run Levenshtein tests first (simplest, no dependencies)
npm run test:run -- tests/resolver/levenshtein.test.ts -v

# Expected: All 7+ tests pass
# ✓ Returns 0 for identical strings
# ✓ Returns length for completely different
# ✓ Returns 1 for single character difference
# ✓ Handles known test cases correctly
# ✓ Handles empty strings
# ✓ Is case-sensitive
# ✓ Handles strings with spaces

# Run suggestion engine tests
npm run test:run -- tests/resolver/suggestions.test.ts -v

# Expected: All 5+ tests pass
# ✓ Returns exact match
# ✓ Returns closest matches
# ✓ Sorts by ratio correctly
# ✓ Filters low-ratio matches
# ✓ Returns max results

# Run single-tree resolver tests
npm run test:run -- tests/resolver/single-resolver.test.ts -v

# Expected: All 10+ tests pass
# ✓ Resolves root selector
# ✓ Resolves heading by level and index
# ✓ Resolves block by type and index
# ✓ Resolves path with multiple segments
# ✓ Returns error for out-of-range index
# ✓ Generates suggestions for failed selectors

# Run multi-tree resolver tests
npm run test:run -- tests/resolver/multi-resolver.test.ts -v

# Expected: All 8+ tests pass
# ✓ Resolves in specific namespace
# ✓ Resolves across all namespaces
# ✓ Returns results from multiple documents
# ✓ Returns error for non-existent namespace
# ✓ Merges partial results correctly

# Run all resolver tests with coverage
npm run test:coverage -- --include='src/resolver/**/*.ts'

# Expected: Coverage >= 90% for all files
```

### Level 3: Integration Testing (System Validation)

```bash
# Verify resolver module can be imported
node --input-type=module -e "
import { resolveSingle, resolveMulti, levenshteinDistance } from './src/resolver/index.js';
import { parseSelector } from './src/selector/index.js';
import { parseMarkdown } from './src/parser/index.js';

console.log('Resolver module loaded successfully');
console.log('resolveSingle:', typeof resolveSingle);
console.log('resolveMulti:', typeof resolveMulti);
console.log('levenshteinDistance:', typeof levenshteinDistance);

// Test Levenshtein
const dist = levenshteinDistance('kitten', 'sitting');
console.log('Levenshtein distance:', dist);

// Test selector parsing
const ast = parseSelector('heading:h2[0]');
console.log('Parsed selector:', ast);

// Test resolution
const { ast: tree } = parseMarkdown('# Test\\n\\nContent here.');
const result = resolveSingle(tree, 'test', ast, ['test::heading:h1[0]']);
console.log('Resolution result:', result);
"

# Expected output:
# Resolver module loaded successfully
# resolveSingle: function
# resolveMulti: function
# levenshteinDistance: function
# Levenshtein distance: 3
# Parsed selector: { type: 'selector', segments: [...] }
# Resolution result: { success: true, results: [...] }

# Test with fixture file
node --input-type=module -e "
import { resolveSingle } from './src/resolver/index.js';
import { parseSelector } from './src/selector/index.js';
import { parseFile } from './src/parser/index.js';

const { ast } = await parseFile('./tests/fixtures/simple.md');
const selector = parseSelector('root');

// Build available selectors (simplified for test)
const availableSelectors = ['root', 'heading:h1[0]', 'heading:h2[0]'];

const result = resolveSingle(ast, 'simple', selector, availableSelectors);
console.log('Result:', result);
"

# Expected: Shows successful resolution
```

### Level 4: Full Test Suite Validation

```bash
# Run complete test suite including resolver
npm run test:run

# Expected: All tests pass (parser + selector + resolver tests)

# Run with coverage report
npm run test:coverage

# Expected:
# - All tests pass
# - src/resolver coverage >= 90%
# - No uncovered error branches

# Build the project to verify no build errors
npm run build

# Verify build output
ls -la dist/

# Expected: dist/ contains compiled JS files
```

---

## Final Validation Checklist

### Technical Validation

- [ ] All 4 validation levels completed successfully
- [ ] `npm run test:run` passes all resolver tests
- [ ] `npm run type-check` reports zero TypeScript errors
- [ ] `npm run lint` reports zero ESLint errors
- [ ] `npm run format:check` reports zero formatting issues
- [ ] Coverage >= 90% for `src/resolver/**/*.ts`

### Feature Validation

- [ ] `resolveSingle()` finds nodes by type and subtype
- [ ] `resolveSingle()` handles index-based selection (0-based)
- [ ] `resolveSingle()` returns error with suggestions for failed selectors
- [ ] `resolveMulti()` filters by namespace correctly
- [ ] `resolveMulti()` resolves across all documents when no namespace
- [ ] `levenshteinDistance()` returns correct edit distance
- [ ] `SuggestionEngine` ranks candidates by similarity ratio
- [ ] Error messages include selector and suggestions

### Code Quality Validation

- [ ] All files use `.js` extension in imports
- [ ] All mdast types use `import type`
- [ ] Follows existing code patterns from selector module
- [ ] JSDoc comments on all public functions
- [ ] Error handling matches SelectorParseError pattern

### Files Created Checklist

- [ ] `/src/resolver/types.ts` - Type definitions
- [ ] `/src/resolver/levenshtein.ts` - Levenshtein distance
- [ ] `/src/resolver/suggestions.ts` - Suggestion engine
- [ ] `/src/resolver/single-resolver.ts` - Single-tree resolver
- [ ] `/src/resolver/multi-resolver.ts` - Multi-tree resolver
- [ ] `/src/resolver/index.ts` - Public exports
- [ ] `/tests/resolver/levenshtein.test.ts`
- [ ] `/tests/resolver/suggestions.test.ts`
- [ ] `/tests/resolver/single-resolver.test.ts`
- [ ] `/tests/resolver/multi-resolver.test.ts`

---

## Anti-Patterns to Avoid

- Do not use `require()` - this is an ESM project
- Do not omit `.js` extensions in import paths
- Do not use 1-based indexing - selectors use 0-based ordinals
- Do not implement right-to-left matching - this selector system is left-to-right
- Do not skip namespace validation - always check namespace when specified
- Do not use full matrix for Levenshtein - use two-row optimization
- Do not hardcode node types - use constants from selector module
- Do not ignore query parameters - parse and pass them through (even if not used yet)
- Do not return generic errors - always use structured ResolutionError
- Do not forget to filter candidates for suggestions - use ratio threshold

---

## Confidence Score

**Implementation Success Likelihood: 9/10**

**Rationale:**
- Complete type definitions with clear interfaces
- Detailed algorithm specifications for Levenshtein distance
- Clear integration patterns with existing P2M1 selector module
- Comprehensive test patterns from existing codebase
- All external dependencies documented with URLs
- Research from 2 specialized agents covering algorithms and patterns
- Follows established patterns from P1M1/P1M2/P2M1 codebase
- No ambiguous implementation decisions

**Risk Factors:**
- Minor: mdast tree traversal complexity (mitigated with detailed examples)
- Minor: Multi-document result merging (mitigated with clear patterns)
- Minor: Suggestion ranking algorithm complexity (mitigated with research)

---

## Execution Notes

1. **Follow task order**: Create types → levenshtein → suggestions → single-resolver → multi-resolver → index → tests
2. **Validate after each file**: Run `npm run type-check` after each file creation
3. **Test incrementally**: Run tests for each component before moving to next
4. **Use exact imports**: Copy import statements exactly as shown
5. **Check coverage last**: Only after all tests pass, verify coverage thresholds
6. **ESM everywhere**: All imports use `.js` extension, all files are ESM
7. **Left-to-right resolution**: Remember this is NOT like CSS - traverse left to right
