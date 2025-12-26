# Word Counting and Text Extraction from MDAST

## Core Library

### mdast-util-to-string
- **URL**: https://github.com/syntax-tree/mdast-util-to-string
- **Purpose**: Extract text content from mdast nodes
- **Installation**: `npm install mdast-util-to-string`

## Basic Text Extraction

### Using mdast-util-to-string (Recommended)

```typescript
import { toString } from 'mdast-util-to-string';
import type { Node, Heading, Paragraph, Code } from 'mdast';

// Extract text from any node
const text = toString(node);

// With options
const text = toString(node, {
  includeImageAlt: true,  // Include alt text for images
  includeHtml: true       // Include HTML content
});
```

### Manual Text Extraction (For Control)

```typescript
function extractText(node: Node): string {
  // For leaf nodes with direct text content
  if ('value' in node && typeof node.value === 'string') {
    return node.value;
  }

  // For parent nodes, concatenate text from children
  if ('children' in node && Array.isArray(node.children)) {
    return node.children
      .map(child => extractText(child))
      .join('');
  }

  return '';
}
```

## Word Counting Algorithms

### Basic Word Count

```typescript
import { toString } from 'mdast-util-to-string';

export function countWords(node: Node): number {
  const text = toString(node);

  // Split on whitespace, filter empty strings
  const words = text.trim().split(/\s+/).filter(w => w.length > 0);

  return words.length;
}
```

### Word Count with Options

```typescript
export interface WordCountOptions {
  /** Include code block content in word count */
  countCode?: boolean;
  /** Include inline code in word count */
  countInlineCode?: boolean;
}

export function countWords(node: Node, options: WordCountOptions = {}): number {
  const { countCode = false, countInlineCode = true } = options;

  // Skip code blocks unless explicitly included
  if (node.type === 'code' && !countCode) {
    return 0;
  }

  // For code blocks, count directly
  if (node.type === 'code' && countCode) {
    return node.value.trim().split(/\s+/).filter(w => w.length > 0).length;
  }

  // Extract text (this excludes code blocks automatically)
  const text = toString(node);

  return text.trim().split(/\s+/).filter(w => w.length > 0).length;
}
```

### Counting Words by Node Type

```typescript
import { visit } from 'unist-util-visit';

export interface DocumentWordCount {
  total: number;
  byType: {
    headings: number;
    paragraphs: number;
    codeBlocks: number;
    lists: number;
    tables: number;
    blockquotes: number;
  };
}

export function countDocumentWords(tree: Root): DocumentWordCount {
  const result: DocumentWordCount = {
    total: 0,
    byType: {
      headings: 0,
      paragraphs: 0,
      codeBlocks: 0,
      lists: 0,
      tables: 0,
      blockquotes: 0
    }
  };

  visit(tree, (node) => {
    const wordCount = countWords(node, { countCode: false });

    switch (node.type) {
      case 'heading':
        result.byType.headings += wordCount;
        break;
      case 'paragraph':
        result.byType.paragraphs += wordCount;
        break;
      case 'code':
        result.byType.codeBlocks += countWords(node, { countCode: true });
        break;
      case 'list':
        result.byType.lists += wordCount;
        break;
      case 'table':
        result.byType.tables += wordCount;
        break;
      case 'blockquote':
        result.byType.blockquotes += wordCount;
        break;
    }

    result.total += wordCount;
  });

  return result;
}
```

## Counting Words in Tables

```typescript
import { visit } from 'unist-util-visit';

export function countTableWords(tableNode: Table): number {
  let wordCount = 0;

  visit(tableNode, 'tableCell', (cell) => {
    wordCount += countWords(cell);
  });

  return wordCount;
}
```

## Counting Words in Lists

```typescript
import { visit } from 'unist-util-visit';

export function countListWords(listNode: List): number {
  let wordCount = 0;

  visit(listNode, 'listItem', (item) => {
    wordCount += countWords(item);
  });

  return wordCount;
}
```

## Section Word Count

```typescript
import type { Root } from 'mdast';

export interface Section {
  heading: Heading;
  content: Node[];
  wordCount: number;
}

export function calculateSectionWordCount(section: Section): number {
  let count = countWords(section.heading);

  for (const node of section.content) {
    count += countWords(node);
  }

  return count;
}
```

## Truncation Detection

```typescript
export interface TruncationInfo {
  isTruncated: boolean;
  wordCount: number;
  maxWords: number;
  truncatedWordCount: number;
}

export function checkTruncation(node: Node, maxWords: number = 500): TruncationInfo {
  const wordCount = countWords(node);

  return {
    isTruncated: wordCount > maxWords,
    wordCount,
    maxWords,
    truncatedWordCount: Math.min(wordCount, maxWords)
  };
}
```

## Smart Word Boundary Detection

For pagination, you may want to truncate at sentence boundaries:

```typescript
export function findSentenceBoundary(text: string, maxWords: number): number {
  const words = text.split(/\s+/);
  const targetLength = Math.min(maxWords, words.length);

  // Look for sentence endings near target
  const sentenceEndings = ['. ', '! ', '? ', '.\n', '!\n', '?\n'];

  for (let i = targetLength; i > Math.max(0, targetLength - 20); i--) {
    const word = words[i];
    if (sentenceEndings.some(ending => word.endsWith(ending))) {
      return i + 1;
    }
  }

  // No sentence boundary found, truncate at word boundary
  return targetLength;
}
```

## Gotchas and Best Practices

1. **Code Block Handling**: Decide whether to count code content based on your use case
2. **Inline Elements**: `mdast-util-to-string` handles inline formatting correctly
3. **Empty Content**: Always check for empty strings before splitting
4. **Whitespace**: Use `/\s+/` regex to handle multiple spaces, tabs, newlines
5. **Internationalization**: Simple word splitting may not work for all languages
6. **Performance**: For large documents, consider caching word counts

## Integration with Section Virtualization

```typescript
// When building sections, calculate word counts
export function buildSectionsWithWordCounts(tree: Root): Section[] {
  const sections: Section[] = [];

  // ... build sections ...

  // Calculate word counts
  for (const section of sections) {
    section.wordCount = calculateSectionWordCount(section);

    // Recursively count nested sections
    for (const child of section.children) {
      section.wordCount += calculateSectionWordCount(child);
    }
  }

  return sections;
}
```

## References

- mdast-util-to-string: https://github.com/syntax-tree/mdast-util-to-string
- MDAST node types: https://github.com/syntax-tree/mdast
