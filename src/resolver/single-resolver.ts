import type { Root } from 'mdast';
import type { SelectorAST, PathSegmentNode } from '../selector/types.js';
import type {
  ResolutionOutcome,
  ResolutionSuccess,
  ResolutionFailure,
  ResolutionResult,
  ResolutionError,
  ResolutionContext
} from './types.js';
import { SuggestionEngine } from './suggestions.js';
import { DEFAULT_MAX_DEPTH } from '../utils/validation.js';

/**
 * Internal result type for path segment resolution.
 */
interface SegmentResolutionSuccess {
  success: true;
  node: any;
  path: any[];
}

interface SegmentResolutionFailure {
  success: false;
  errorType: ResolutionError['type'];
  errorMessage: string;
  failedAtSegment: number;
  partialResults?: ResolutionResult[];
}

type SegmentResolutionOutcome = SegmentResolutionSuccess | SegmentResolutionFailure;

/**
 * Resolve a selector against a single document tree.
 *
 * Traverses the mdast tree left-to-right, matching each path segment
 * against nodes in the tree. Index selection is 0-based and scoped
 * to nodes of the same type within the current context.
 *
 * @param tree - The mdast tree
 * @param namespace - Document namespace (e.g., filename without extension)
 * @param selector - The parsed selector AST
 * @param availableSelectors - All available selectors in this document (for suggestions)
 * @returns Resolution outcome (success or error)
 *
 * @example
 * ```typescript
 * const { ast } = parseMarkdown('# Hello\\n\\nWorld');
 * const selector = parseSelector('heading:h1[0]');
 * const result = resolveSingle(ast, 'doc', selector, ['doc::heading:h1[0]']);
 * if (result.success) {
 *   console.log(result.results[0].node); // The heading node
 * }
 * ```
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
      return createNamespaceError(selector, [namespace], availableSelectors);
    }

    // Start resolution from root
    const context: ResolutionContext = {
      namespace,
      path: [],
      currentNode: tree,
      segmentIndex: 0,
      totalSegments: selector.segments.length
    };

    const result = resolvePathSegments(context, selector.segments);

    if (result.success) {
      const resolutionResult: ResolutionResult = {
        namespace,
        node: result.node,
        selector: selectorToString(selector),
        path: result.path,
        wordCount: estimateWordCount(result.node),
        childrenAvailable: hasChildren(result.node)
      };

      return {
        success: true,
        results: [resolutionResult]
      };
    } else {
      // Generate suggestions for failed resolution
      const engine = new SuggestionEngine(availableSelectors);
      const suggestions = engine.getSuggestions(selectorToString(selector));

      const error: ResolutionError = {
        type: result.errorType,
        message: result.errorMessage,
        selector: selectorToString(selector),
        suggestions
      };

      // Add failed segment if available
      const failedSegment = selector.segments[result.failedAtSegment];
      if (failedSegment) {
        error.failedSegment = failedSegment;
      }

      return {
        success: false,
        error,
        partialResults: result.partialResults
      };
    }
  } catch (error) {
    const errorOut: ResolutionError = {
      type: 'INVALID_PATH',
      message: error instanceof Error ? error.message : 'Unknown error',
      selector: selectorToString(selector),
      suggestions: []
    };

    return {
      success: false,
      error: errorOut
    };
  }
}

/**
 * Resolve path segments against the tree.
 *
 * Processes each segment sequentially, narrowing the search scope
 * with each successful match.
 */
function resolvePathSegments(
  context: ResolutionContext,
  segments: PathSegmentNode[]
): SegmentResolutionOutcome {
  let currentNode = context.currentNode;
  const path = [...context.path];
  const partialResults: ResolutionResult[] = [];
  const maxDepth = DEFAULT_MAX_DEPTH;

  for (let i = 0; i < segments.length; i++) {
    const segment = segments[i];
    if (!segment) {
      return {
        success: false,
        errorType: 'SELECTOR_NOT_FOUND',
        errorMessage: `Invalid segment at index ${i}`,
        failedAtSegment: i
      };
    }
    context.segmentIndex = i;

    // Check depth limit before processing segment
    if (i >= maxDepth) {
      return {
        success: false,
        errorType: 'SELECTOR_NOT_FOUND',
        errorMessage: `Selector depth ${i + 1} exceeds maximum of ${maxDepth}`,
        failedAtSegment: i,
        partialResults
      };
    }

    // Handle root segment specially
    if (segment.nodeType === 'root') {
      // Root is the starting point - don't search, validate and continue
      if (currentNode.type !== 'root') {
        return {
          success: false,
          errorType: 'SELECTOR_NOT_FOUND',
          errorMessage: 'Root segment can only be used at the beginning',
          failedAtSegment: i
        };
      }
      // Root matches the current node, continue to next segment
      path.push(currentNode);
      continue;
    }

    // Find matching children for current segment
    const matches = findMatchingChildren(currentNode, segment);

    if (matches.length === 0) {
      return {
        success: false,
        errorType: 'SELECTOR_NOT_FOUND',
        errorMessage: `No matches found for segment at index ${i}`,
        failedAtSegment: i,
        partialResults
      };
    }

    // Apply index if specified
    let selectedIndex = 0;
    if (segment.index !== undefined) {
      if (segment.index >= matches.length) {
        const subtype = segment.subtype ? ':' + segment.subtype : '';
        return {
          success: false,
          errorType: 'INDEX_OUT_OF_RANGE',
          errorMessage: `Index ${segment.index} out of range (only ${matches.length} ${segment.nodeType}${subtype}(s) found)`,
          failedAtSegment: i,
          partialResults
        };
      }
      selectedIndex = segment.index;
    }

    currentNode = matches[selectedIndex];
    path.push(currentNode);

    // Track partial results for error recovery
    partialResults.push({
      namespace: context.namespace,
      node: currentNode,
      selector: segmentToString(segment),
      path: [...path],
      wordCount: estimateWordCount(currentNode),
      childrenAvailable: hasChildren(currentNode)
    });
  }

  return {
    success: true,
    node: currentNode,
    path
  };
}

/**
 * Find children matching a path segment.
 *
 * Returns an array of matching nodes, indexed by their position
 * among siblings of the same type.
 */
function findMatchingChildren(parent: any, segment: PathSegmentNode): any[] {
  if (!parent?.children || !Array.isArray(parent.children)) {
    return [];
  }

  const matches: any[] = [];

  switch (segment.nodeType) {
    case 'heading':
      // Match heading by level (depth)
      if (segment.subtype?.startsWith('h')) {
        const depth = parseInt(segment.subtype.slice(1), 10);
        for (const child of parent.children) {
          if (child.type === 'heading' && child.depth === depth) {
            matches.push(child);
          }
        }
      }
      break;

    case 'section':
    case 'page':
      // Virtual nodes not in mdast - would require semantic tree builder
      // For now, return empty - these will fail with suggestions
      break;

    case 'block':
      // Match by block type (direct mdast type mapping)
      if (segment.subtype) {
        for (const child of parent.children) {
          if (child.type === segment.subtype) {
            matches.push(child);
          }
        }
      }
      break;
  }

  return matches;
}

/**
 * Estimate word count for a node.
 *
 * Extracts text content and splits by whitespace.
 * For code nodes, counts the code content.
 * For container nodes, recursively counts descendant text.
 */
function estimateWordCount(node: any): number {
  if (!node) return 0;

  // Handle nodes with direct value (text, code, inline code)
  if (node.value && typeof node.value === 'string') {
    return node.value.trim().split(/\s+/).filter((w: string) => w.length > 0).length;
  }

  // Handle nodes with children (container nodes)
  if (node.children && Array.isArray(node.children)) {
    let count = 0;
    for (const child of node.children) {
      count += estimateWordCount(child);
    }
    return count;
  }

  return 0;
}

/**
 * Check if node has children available for further selection.
 */
function hasChildren(node: any): boolean {
  return node?.children && Array.isArray(node.children) && node.children.length > 0;
}

/**
 * Convert selector AST back to string (for error messages).
 */
function selectorToString(selector: SelectorAST): string {
  let result = '';

  if (selector.namespace) {
    result += `${selector.namespace}::`;
  }

  result += selector.segments.map(segmentToString).join('/');

  if (selector.queryParams && selector.queryParams.length > 0) {
    const params = selector.queryParams.map(p => `${p.key}=${p.value}`).join('&');
    result += `?${params}`;
  }

  return result;
}

/**
 * Convert single path segment to string.
 */
function segmentToString(segment: PathSegmentNode): string {
  let segStr = segment.nodeType;
  if (segment.subtype) {
    segStr += `:${segment.subtype}`;
  }
  if (segment.index !== undefined) {
    segStr += `[${segment.index}]`;
  }
  return segStr;
}

/**
 * Create namespace error outcome with suggestions.
 */
function createNamespaceError(
  selector: SelectorAST,
  availableNamespaces: string[],
  availableSelectors: string[]
): ResolutionFailure {
  // Generate namespace suggestions
  const engine = new SuggestionEngine(availableNamespaces);
  const nsSuggestions = engine.getSuggestions(selector.namespace || '');

  const suggestions = nsSuggestions.map(s => ({
    selector: `${s.selector}::${selectorToString(selector).replace(/^[^:]+::/, '')}`,
    distance: s.distance,
    ratio: s.ratio,
    reason: s.reason
  }));

  return {
    success: false,
    error: {
      type: 'NAMESPACE_NOT_FOUND',
      message: `Namespace '${selector.namespace}' not found. Available namespaces: ${availableNamespaces.join(', ')}`,
      selector: selectorToString(selector),
      suggestions
    }
  };
}
