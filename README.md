# mdsel - Markdown Selector with Pagination

A powerful CLI tool for selecting and paginating markdown content with advanced word and sentence-based pagination capabilities.

## Features

- **Word-Based Pagination**: Split markdown content into pages by word count
- **Sentence-Aware Truncation**: Intelligent truncation at sentence boundaries
- **Markdown Preservation**: Code blocks and formatting remain intact across page boundaries
- **Interactive Navigation**: Navigate through pages using intuitive commands
- **Flexible Query Parameters**: Support for `?page=`, `?full=true`, and `?words_per_page=`
- **Terminal Optimization**: Auto-detect terminal size for optimal word count per page
- **JSON Output**: Structured output for programmatic consumption
- **Comprehensive Metadata**: Detailed pagination statistics and state information

## Installation

```bash
npm install -g mdsel
```

Or use locally:

```bash
npm install
npm link
```

## Usage

### Basic Pagination

```bash
# Paginate a markdown file (default: 500 words per page)
mdsel paginate document.md

# Show specific page
mdsel paginate document.md -p 3

# Show full content without pagination
mdsel paginate document.md -f

# Custom words per page
mdsel paginate document.md -w 1000
```

### Terminal-Aware Pagination

```bash
# Automatically optimize for terminal size
mdsel paginate document.md -t

# See estimated optimal words per page
mdsel info document.md --estimate
```

### JSON Output

```bash
# Output in JSON format
mdsel paginate document.md -j

# Include metadata
mdsel paginate document.md -j -m
```

### Interactive Navigation

When viewing paginated content interactively:

```
Page 2 of 5
──────────────────────────────────────────────────────────────────────────────────────────────────────
... content of page 2 ...

──────────────────────────────────────────────────────────────────────────────────────────────────────
Navigation: [n]ext [p]revious [1-5] page [q]uit
>
```

Commands:
- `n` or `next`: Next page
- `p` or `previous`: Previous page
- `1-5`: Go to specific page number
- `q` or `quit`: Exit viewer

### Sentence-Based Pagination

```bash
# Use sentence boundaries instead of word boundaries
mdsel paginate document.md -s

# Good for articles and documents with clear sentence structure
```

## API Usage

### Pagination Configuration

```typescript
import {
  PaginationManager,
  PaginationController,
  paginateByWords,
  paginateBySentences,
  smartTruncate
} from 'mdsel';

// Basic word-based pagination
const result = paginateByWords(content, {
  wordsPerPage: 500,
  preserveBoundaries: true,
  addTruncationMarker: true
});

// Sentence-aware pagination
const sentenceResult = paginateBySentences(content, 300);

// Smart truncation
const truncated = smartTruncate(content, {
  maxWords: 200,
  preserveMarkdown: true,
  marker: '[...]',
  markerPlacement: 'end'
});
```

### State Management

```typescript
// Create pagination manager
const manager = new PaginationManager(content, 500);

// Navigate through pages
const currentPage = manager.getPage(1);
const nextPage = manager.nextPage();
const previousPage = manager.previousPage();

// Get state information
const state = manager.getState();
console.log(`Page ${state.currentPage} of ${state.totalPages}`);

// Go to specific page
manager.goToPage(3);
```

### Query Handling

```typescript
// Create controller for handling query parameters
const controller = new PaginationController(content, 500);

// Handle ?page=2&full=false query
const result = controller.handleQuery({
  page: '2',
  full: 'false',
  words_per_page: '300'
});

// Access pagination metadata
console.log(result.pagination);
console.log(result.content);

// For full content requests
const fullResult = controller.handleQuery({ full: 'true' });
```

## Pagination Metadata

The pagination system provides comprehensive metadata in JSON format:

```json
{
  "pagination": {
    "current_page": 2,
    "total_pages": 5,
    "total_words": 2500,
    "words_per_page": 500,
    "is_truncated": true,
    "last_page_word_count": 300,
    "has_next_page": true,
    "has_previous_page": true
  },
  "content": "... current page content ...",
  "metadata": {
    "timestamp": "2024-01-01T12:00:00.000Z",
    "content_hash": "abc123..."
  }
}
```

## Algorithm Details

### Word-Based Pagination

1. **Code Block Preservation**: Markdown code blocks are temporarily removed to prevent splitting
2. **Word Boundary Detection**: When `preserveBoundaries` is true, the algorithm looks for natural break points (spaces, punctuation)
3. **Reconstruction**: After pagination, code blocks are restored to their original positions

### Sentence-Aware Pagination

1. **Sentence Splitting**: Content is split at sentence boundaries (periods, exclamation, question marks)
2. **Page Assembly**: Sentences are grouped until the word limit is reached
3. **Perfect Boundaries**: Pages always end at complete sentences

### Smart Truncation

1. **Markdown-Aware**: Preserves headers, bold, italic, and other markdown elements
2. **Sentence Detection**: Finds the best truncation point at sentence boundaries
3. **Flexible Markers**: Supports custom truncation markers and placement options

## Query Parameters

| Parameter | Description | Example |
|-----------|-------------|---------|
| `page` | Page number to display | `?page=3` |
| `full` | Bypass pagination and show all content | `?full=true` |
| `words_per_page` | Override default words per page | `?words_per_page=1000` |

## Configuration Options

### PaginationManager

```typescript
interface PaginationConfig {
  wordsPerPage: number;        // Target words per page
  preserveBoundaries: boolean; // Split at word/sentence boundaries
  addTruncationMarker?: boolean; // Add [truncated] marker
}
```

### Smart Truncation

```typescript
interface TruncationOptions {
  maxWords: number;                    // Maximum words before truncation
  preserveMarkdown: boolean;           // Preserve markdown formatting
  marker?: string;                     // Custom truncation marker
  markerPlacement?: 'beginning' | 'end' | 'both'; // Marker placement
}
```

## Examples

### Blog Post Reader

```bash
# Read a long blog post with optimal terminal sizing
mdsel blog-post.md -t -s

# Export to JSON for integration with other tools
mdsel blog-post.md -j -m > blog-pagination.json
```

### Documentation Viewer

```bash
# View API documentation with custom page size
mdsel api-docs.md -w 300 -p 1

# Show all documentation at once
mdsel api-docs.md -f -j
```

### Content Analysis

```bash
# Get statistics about a document
mdsel info document.md -w -s

# Estimate optimal pagination settings
mdsel info document.md --estimate
```

## Development

### Running Tests

```bash
npm test
```

### Building

```bash
npm run build
```

### Linting

```bash
npm run lint
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Add tests for new functionality
4. Ensure all tests pass
5. Submit a pull request

## License

MIT License - see LICENSE file for details.