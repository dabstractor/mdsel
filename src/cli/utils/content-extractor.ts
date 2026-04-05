/**
 * Content extraction utilities for CLI.
 *
 * Provides functions for extracting markdown and text content from mdast nodes,
 * with support for truncation and word counting.
 *
 * @module cli/utils/content-extractor
 */

import { toString } from 'mdast-util-to-string';
import { toMarkdown } from 'mdast-util-to-markdown';
import { gfmToMarkdown } from 'mdast-util-gfm';
import type { Root, RootContent } from 'mdast';

/** Default preview length in characters */
const PREVIEW_LENGTH = 80;

/** Truncation marker appended to truncated content */
const TRUNCATION_MARKER = '[truncated]';

/**
 * Content node type (Root or any RootContent node).
 */
export type ContentNode = Root | RootContent;

/**
 * Result of content truncation.
 */
export interface TruncatedContent {
  /** The content (possibly truncated) */
  content: string;
  /** Whether the content was truncated */
  truncated: boolean;
  /** Word count of the returned content */
  wordCount: number;
}

/**
 * Extract markdown string from an mdast node.
 *
 * Handles synthetic section nodes by wrapping children in a root.
 *
 * @param node - The mdast node to convert
 * @returns Markdown string with trailing whitespace trimmed
 *
 * @example
 * ```typescript
 * const md = extractMarkdown(headingNode);
 * // "## Installation"
 * ```
 */
export function extractMarkdown(node: ContentNode | SectionNode): string {
  // Handle synthetic section nodes created by heading selector
  if (isSectionNode(node)) {
    const root: Root = { type: 'root', children: node.children };
    return toMarkdown(root, { extensions: [gfmToMarkdown()] }).trimEnd();
  }
  return toMarkdown(node, { extensions: [gfmToMarkdown()] }).trimEnd();
}

/**
 * Synthetic section node type (heading + content below it).
 */
interface SectionNode {
  type: 'section';
  depth: number;
  children: RootContent[];
  position?: unknown;
}

function isSectionNode(node: unknown): node is SectionNode {
  return (
    typeof node === 'object' &&
    node !== null &&
    'type' in node &&
    (node as { type: unknown }).type === 'section' &&
    'children' in node
  );
}

/**
 * Extract plain text from an mdast node.
 *
 * @param node - The mdast node to convert
 * @returns Plain text content
 *
 * @example
 * ```typescript
 * const text = extractText(headingNode);
 * // "Installation"
 * ```
 */
export function extractText(node: ContentNode): string {
  return toString(node);
}

/**
 * Count words in text using whitespace splitting.
 *
 * @param text - The text to count words in
 * @returns Word count
 *
 * @example
 * ```typescript
 * countWords("Hello world");  // 2
 * countWords("");             // 0
 * countWords("  ");           // 0
 * ```
 */
export function countWords(text: string): number {
  const trimmed = text.trim();
  if (trimmed === '') return 0;
  return trimmed.split(/\s+/).filter((w) => w.length > 0).length;
}

/**
 * Get a content preview truncated to max length.
 *
 * @param text - The text to preview
 * @param maxLen - Maximum length (default: 80)
 * @returns Truncated preview with "..." if needed
 *
 * @example
 * ```typescript
 * getContentPreview("Short text");           // "Short text"
 * getContentPreview("Very long text...", 10); // "Very long ..."
 * ```
 */
export function getContentPreview(text: string, maxLen: number = PREVIEW_LENGTH): string {
  // Normalize whitespace - replace newlines and multiple spaces with single space
  const normalized = text.replace(/\s+/g, ' ').trim();
  if (normalized.length <= maxLen) return normalized;
  return normalized.slice(0, maxLen) + '...';
}

/**
 * Options for truncating content.
 */
export interface TruncateOptions {
  /** Return only the first N lines */
  head?: number;
  /** Return only the last N lines */
  tail?: number;
}

/**
 * Specification for `?until=` AST-level truncation.
 *
 * Describes the node type and optional 0-based index at which to stop.
 */
export interface UntilSpec {
  /** The category of node to match against */
  nodeType: 'heading' | 'block';
  /** Heading level (h1-h6) or mdast block type (code, paragraph, etc.) */
  subtype: string;
  /** 0-based occurrence index. When undefined, stop at the first match. */
  index?: number;
}

/** Map from shorthand until-value to mdast node type */
const BLOCK_UNTIL_MAP: Record<string, string> = {
  para: 'paragraph',
  paragraph: 'paragraph',
  code: 'code',
  list: 'list',
  table: 'table',
  quote: 'blockquote',
  blockquote: 'blockquote',
};

/**
 * Parse an `until` query-param value string into an `UntilSpec`.
 *
 * Accepts shorthand like `h2`, `h2.1`, `code`, `code.0`, `table`, etc.
 * Returns `null` if the value is empty or unrecognised.
 *
 * @example
 * parseUntilSpec('h2')      // { nodeType: 'heading', subtype: 'h2' }
 * parseUntilSpec('h2.1')    // { nodeType: 'heading', subtype: 'h2', index: 1 }
 * parseUntilSpec('code.0')  // { nodeType: 'block', subtype: 'code', index: 0 }
 */
export function parseUntilSpec(value: string): UntilSpec | null {
  const trimmed = value.trim();
  if (!trimmed) return null;

  // Match <type> optionally followed by .<index>
  const re = /^(h[1-6]|code|para(?:graph)?|list|table|quote|blockquote)(?:\.(\d+))?$/;
  const match = re.exec(trimmed);
  if (!match) return null;

  const typeStr = match[1] ?? '';
  const indexStr = match[2];
  const index = indexStr !== undefined ? parseInt(indexStr, 10) : undefined;

  if (/^h[1-6]$/.test(typeStr)) {
    return { nodeType: 'heading', subtype: typeStr, index };
  }

  const mdastType = BLOCK_UNTIL_MAP[typeStr];
  if (!mdastType) return null;
  return { nodeType: 'block', subtype: mdastType, index };
}

/**
 * Apply `until` truncation to a node's children at the AST level.
 *
 * Walks the node's children and returns a new node whose children are
 * sliced just before the first child that matches `untilSpec` (taking
 * the optional index into account).  If the spec matches nothing the
 * original node is returned unchanged.
 *
 * @param node - The node whose children to potentially truncate
 * @param untilSpec - The parsed until specification
 * @returns The (possibly modified) node and whether truncation occurred
 */
export function applyUntilTruncation(
  node: ContentNode | SectionNode,
  untilSpec: UntilSpec,
): { node: ContentNode | SectionNode; truncated: boolean } {
  if (!('children' in node) || !Array.isArray((node as { children?: unknown }).children)) {
    return { node, truncated: false };
  }

  const children = (node as { children: unknown[] }).children;
  let typeCount = 0;

  for (let i = 0; i < children.length; i++) {
    const child = children[i];

    if (matchesUntilSpec(child, untilSpec)) {
      if (untilSpec.index === undefined || typeCount === untilSpec.index) {
        // Truncate here – exclude this child and everything after it
        const truncatedChildren = children.slice(0, i);
        return {
          node: { ...(node as object), children: truncatedChildren } as ContentNode | SectionNode,
          truncated: true,
        };
      }
      typeCount++;
    }
  }

  return { node, truncated: false };
}

/**
 * Check whether an mdast child node matches an `UntilSpec`.
 */
function matchesUntilSpec(child: unknown, spec: UntilSpec): boolean {
  if (typeof child !== 'object' || child === null || !('type' in child)) {
    return false;
  }
  const c = child as { type: string; depth?: number };

  if (spec.nodeType === 'heading') {
    const depth = parseInt(spec.subtype.slice(1), 10);
    return c.type === 'heading' && c.depth === depth;
  }

  // block
  return c.type === spec.subtype;
}

/**
 * Truncate content by line count.
 *
 * By default returns full content. Use head or tail to limit output.
 *
 * @param content - The content to potentially truncate
 * @param options - Options for head/tail truncation
 * @returns Truncated content result
 *
 * @example
 * ```typescript
 * // Full content (default)
 * truncateContent(longContent);
 * // { content: "All content...", truncated: false, wordCount: 1500 }
 *
 * // First 10 lines
 * truncateContent(longContent, { head: 10 });
 * // { content: "First 10 lines...\n[truncated]", truncated: true, wordCount: ... }
 *
 * // Last 5 lines
 * truncateContent(longContent, { tail: 5 });
 * // { content: "[truncated]\nLast 5 lines...", truncated: true, wordCount: ... }
 * ```
 */
export function truncateContent(
  content: string,
  options: TruncateOptions = {},
): TruncatedContent {
  const lines = content.split('\n');
  const totalLines = lines.length;

  // Head truncation: return first N lines
  if (options.head !== undefined && options.head > 0) {
    if (options.head >= totalLines) {
      return { content, truncated: false, wordCount: countWords(content) };
    }
    const truncatedLines = lines.slice(0, options.head);
    const truncatedContent = truncatedLines.join('\n') + '\n' + TRUNCATION_MARKER;
    return {
      content: truncatedContent,
      truncated: true,
      wordCount: countWords(truncatedContent),
    };
  }

  // Tail truncation: return last N lines
  if (options.tail !== undefined && options.tail > 0) {
    if (options.tail >= totalLines) {
      return { content, truncated: false, wordCount: countWords(content) };
    }
    const truncatedLines = lines.slice(-options.tail);
    const truncatedContent = TRUNCATION_MARKER + '\n' + truncatedLines.join('\n');
    return {
      content: truncatedContent,
      truncated: true,
      wordCount: countWords(truncatedContent),
    };
  }

  // Default: return full content
  return { content, truncated: false, wordCount: countWords(content) };
}
