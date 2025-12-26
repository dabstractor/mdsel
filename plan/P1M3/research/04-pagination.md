# Pagination and Truncation for Markdown Content

## Configuration Constants

From `plan/architecture/system_context.md` and `plan/architecture/output_format.md`:

```typescript
const PAGINATION_DEFAULTS = {
  MAX_WORDS: 500,        // Truncation threshold per node
  PAGE_SIZE: 500,        // Words per virtual page
  PREVIEW_LENGTH: 80,    // Characters in content_preview
  TRUNCATION_MARKER: '[truncated]'
};
```

## Word-Based Pagination

### Basic Pagination Algorithm

```typescript
export interface PageInfo {
  pageIndex: number;
  totalPages: number;
  wordCount: number;
  hasMore: boolean;
}

export interface PaginatedContent {
  content: string;
  truncated: boolean;
  pagination?: PageInfo;
}

export function paginateByWords(
  text: string,
  wordsPerPage: number = PAGINATION_DEFAULTS.PAGE_SIZE,
  pageIndex: number = 0
): PaginatedContent {
  const words = text.trim().split(/\s+/);
  const totalPages = Math.ceil(words.length / wordsPerPage);

  if (pageIndex >= totalPages) {
    return {
      content: '',
      truncated: false,
      pagination: {
        pageIndex,
        totalPages,
        wordCount: 0,
        hasMore: false
      }
    };
  }

  const startIndex = pageIndex * wordsPerPage;
  const endIndex = Math.min(startIndex + wordsPerPage, words.length);
  const pageWords = words.slice(startIndex, endIndex);

  return {
    content: pageWords.join(' '),
    truncated: endIndex < words.length,
    pagination: {
      pageIndex,
      totalPages,
      wordCount: words.length,
      hasMore: endIndex < words.length
    }
  };
}
```

### Smart Truncation at Sentence Boundaries

```typescript
export function findSentenceBoundary(
  text: string,
  targetWordCount: number,
  lookback: number = 20
): number {
  const words = text.split(/\s+/);
  const targetLength = Math.min(targetWordCount, words.length);

  // Sentence-ending patterns
  const sentenceEndings = ['. ', '! ', '? ', '.\n', '!\n', '?\n', '.\t', '!\t', '?\t'];

  // Look backward for sentence boundary
  for (let i = targetLength; i >= Math.max(0, targetLength - lookback); i--) {
    if (i >= words.length) continue;

    const word = words[i];
    for (const ending of sentenceEndings) {
      if (word.endsWith(ending)) {
        return i + 1; // Include the word with ending
      }
    }
  }

  // No sentence boundary found, use word boundary
  return targetLength;
}

export function smartPaginate(
  text: string,
  wordsPerPage: number = PAGINATION_DEFAULTS.PAGE_SIZE,
  pageIndex: number = 0
): PaginatedContent {
  const words = text.trim().split(/\s+/);
  const totalPages = Math.ceil(words.length / wordsPerPage);

  if (pageIndex >= totalPages) {
    return {
      content: '',
      truncated: false,
      pagination: {
        pageIndex,
        totalPages,
        wordCount: 0,
        hasMore: false
      }
    };
  }

  const startIndex = pageIndex * wordsPerPage;
  const targetLength = Math.min(startIndex + wordsPerPage, words.length);

  // Find sentence boundary for cleaner truncation
  const actualLength = findSentenceBoundary(words.join(' '), wordsPerPage);

  const endIndex = Math.min(targetLength, startIndex + actualLength, words.length);
  const pageWords = words.slice(startIndex, endIndex);

  return {
    content: pageWords.join(' '),
    truncated: endIndex < words.length,
    pagination: {
      pageIndex,
      totalPages,
      wordCount: words.length,
      hasMore: endIndex < words.length
    }
  };
}
```

### Truncation with Marker

```typescript
export function truncateWithMarker(
  text: string,
  maxWords: number = PAGINATION_DEFAULTS.MAX_WORDS,
  marker: string = PAGINATION_DEFAULTS.TRUNCATION_MARKER
): string {
  const words = text.trim().split(/\s+/);

  if (words.length <= maxWords) {
    return text.trim();
  }

  // Find smart boundary
  const boundaryIndex = findSentenceBoundary(text, maxWords);
  const truncatedWords = words.slice(0, boundaryIndex);

  // Add marker at appropriate position
  let result = truncatedWords.join(' ');

  // Add marker after last sentence ending
  if (!result.endsWith('.') && !result.endsWith('!') && !result.endsWith('?')) {
    result += '.'; // Ensure sentence end
  }

  result += ' ' + marker;

  return result;
}
```

## Pagination State Management

### Pagination State Structure

```typescript
export interface PaginationState {
  currentPage: number;
  totalPages: number;
  totalWords: number;
  wordsPerPage: number;
  hasMore: boolean;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export function createPaginationState(
  totalWords: number,
  wordsPerPage: number = PAGINATION_DEFAULTS.PAGE_SIZE,
  currentPage: number = 0
): PaginationState {
  const totalPages = Math.ceil(totalWords / wordsPerPage);

  return {
    currentPage,
    totalPages,
    totalWords,
    wordsPerPage,
    hasMore: totalWords > 0,
    hasNextPage: currentPage < totalPages - 1,
    hasPreviousPage: currentPage > 0
  };
}
```

### Pagination Manager

```typescript
export class PaginationManager {
  private state: PaginationState;

  constructor(totalWords: number, wordsPerPage: number = PAGINATION_DEFAULTS.PAGE_SIZE) {
    this.state = createPaginationState(totalWords, wordsPerPage, 0);
  }

  getCurrentPage(): number {
    return this.state.currentPage;
  }

  nextPage(): boolean {
    if (!this.state.hasNextPage) {
      return false;
    }
    this.state = createPaginationState(
      this.state.totalWords,
      this.state.wordsPerPage,
      this.state.currentPage + 1
    );
    return true;
  }

  previousPage(): boolean {
    if (!this.state.hasPreviousPage) {
      return false;
    }
    this.state = createPaginationState(
      this.state.totalWords,
      this.state.wordsPerPage,
      this.state.currentPage - 1
    );
    return true;
  }

  goToPage(pageIndex: number): boolean {
    if (pageIndex < 0 || pageIndex >= this.state.totalPages) {
      return false;
    }
    this.state = createPaginationState(
      this.state.totalWords,
      this.state.wordsPerPage,
      pageIndex
    );
    return true;
  }

  getState(): PaginationState {
    return { ...this.state };
  }

  paginate(text: string): PaginatedContent {
    return smartPaginate(text, this.state.wordsPerPage, this.state.currentPage);
  }
}
```

## Full vs Paginated Content

### Query Parameter Handling

```typescript
export interface ContentRequest {
  full?: boolean;
  page?: number;
  wordsPerPage?: number;
}

export function getContent(
  text: string,
  request: ContentRequest
): PaginatedContent {
  const {
    full = false,
    page = 0,
    wordsPerPage = PAGINATION_DEFAULTS.PAGE_SIZE
  } = request;

  // Full content bypasses pagination
  if (full) {
    return {
      content: text,
      truncated: false,
      pagination: undefined
    };
  }

  // Paginated content
  return smartPaginate(text, wordsPerPage, page);
}
```

### Parsing Query Parameters

```typescript
export function parseContentQuery(queryString: string): ContentRequest {
  const params = new URLSearchParams(queryString);

  return {
    full: params.get('full') === 'true',
    page: parseInt(params.get('page') || '0', 10),
    wordsPerPage: parseInt(params.get('words_per_page') || `${PAGINATION_DEFAULTS.PAGE_SIZE}`, 10)
  };
}
```

## Pagination for Virtual Nodes

### Page Selector Generation

```typescript
export interface VirtualPage {
  selector: string;
  pageIndex: number;
  content: string;
  wordCount: number;
}

export function createVirtualPages(
  nodeSelector: string,
  text: string,
  wordsPerPage: number = PAGINATION_DEFAULTS.PAGE_SIZE
): VirtualPage[] {
  const words = text.trim().split(/\s+/);
  const totalPages = Math.ceil(words.length / wordsPerPage);

  const pages: VirtualPage[] = [];

  for (let i = 0; i < totalPages; i++) {
    const startIndex = i * wordsPerPage;
    const endIndex = Math.min(startIndex + wordsPerPage, words.length);
    const pageWords = words.slice(startIndex, endIndex);

    pages.push({
      selector: `${nodeSelector}/page[${i}]`,
      pageIndex: i,
      content: pageWords.join(' '),
      wordCount: endIndex - startIndex
    });
  }

  return pages;
}
```

## Integration with Semantic Nodes

```typescript
import type { Node } from 'mdast';
import { toString } from 'mdast-util-to-string';

export interface SemanticNodeWithPagination {
  selector: string;
  type: string;
  wordCount: number;
  totalPages: number;
  truncated: boolean;
}

export function analyzeNodePagination(
  node: Node,
  selector: string,
  wordsPerPage: number = PAGINATION_DEFAULTS.PAGE_SIZE
): SemanticNodeWithPagination {
  const text = toString(node);
  const wordCount = countWords(text);
  const totalPages = Math.ceil(wordCount / wordsPerPage);

  return {
    selector,
    type: node.type,
    wordCount,
    totalPages,
    truncated: wordCount > PAGINATION_DEFAULTS.MAX_WORDS
  };
}
```

## Pagination Metadata for JSON Output

```typescript
export interface PaginationMetadata {
  current_page: number;
  total_pages: number;
  word_count: number;
  has_more: boolean;
}

export function formatPaginationMetadata(state: PaginationState): PaginationMetadata {
  return {
    current_page: state.currentPage,
    total_pages: state.totalPages,
    word_count: state.totalWords,
    has_more: state.hasNextPage
  };
}
```

## Gotchas and Best Practices

1. **Word Boundary**: Don't split mid-word - always split on whitespace
2. **Sentence Boundaries**: Try to truncate at sentence endings when possible
3. **Empty Content**: Handle empty or null content gracefully
4. **Index Bounds**: Validate page indices before accessing
5. **Truncation Marker**: Add visual indicator when content is truncated
6. **Full Content**: Use `?full=true` to bypass pagination
7. **Consistent Sizing**: Use same page size throughout document
8. **Preview vs Content**: Distinguish between preview (short) and paginated content

## References

- Output Format Spec: `plan/architecture/output_format.md`
- System Context: `plan/architecture/system_context.md`
- Word Counting: `02-word-counting.md`
