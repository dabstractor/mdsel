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
import type { Root, RootContent } from 'mdast';

/** Maximum words before truncation (default) */
const MAX_WORDS = 500;

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
 * @param node - The mdast node to convert
 * @returns Markdown string with trailing whitespace trimmed
 *
 * @example
 * ```typescript
 * const md = extractMarkdown(headingNode);
 * // "## Installation"
 * ```
 */
export function extractMarkdown(node: ContentNode): string {
  return toMarkdown(node).trimEnd();
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
export function getContentPreview(
  text: string,
  maxLen: number = PREVIEW_LENGTH
): string {
  // Normalize whitespace - replace newlines and multiple spaces with single space
  const normalized = text.replace(/\s+/g, ' ').trim();
  if (normalized.length <= maxLen) return normalized;
  return normalized.slice(0, maxLen) + '...';
}

/**
 * Truncate content at word boundaries.
 *
 * @param content - The content to potentially truncate
 * @param options - Options including full flag
 * @returns Truncated content result
 *
 * @example
 * ```typescript
 * // With full: false (default)
 * truncateContent(longContent);
 * // { content: "First 500 words... [truncated]", truncated: true, wordCount: 500 }
 *
 * // With full: true
 * truncateContent(longContent, { full: true });
 * // { content: "All content...", truncated: false, wordCount: 1500 }
 * ```
 */
export function truncateContent(
  content: string,
  options: { full?: boolean } = {}
): TruncatedContent {
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
