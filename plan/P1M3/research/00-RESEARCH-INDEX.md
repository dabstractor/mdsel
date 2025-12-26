# P1M3 Semantic Tree Builder - Research Index

This directory contains comprehensive research for implementing the Semantic Tree Builder (Phase 1, Milestone 3).

## Research Files

### Core Libraries & Patterns
- **[01-mdast-traversal.md](./01-mdast-traversal.md)** - Tree traversal patterns using unist-util-visit, parent tracking, type narrowing
- **[02-word-counting.md](./02-word-counting.md)** - Text extraction, word counting algorithms, mdast-util-to-string usage
- **[03-selector-generation.md](./03-selector-generation.md)** - Ordinal indexing, path construction, virtual node generation
- **[04-pagination.md](./04-pagination.md)** - Word-based pagination, smart truncation, pagination state management
- **[05-data-structures.md](./05-data-structures.md)** - TypeScript tree data structures, discriminated unions, immutability

### External Documentation URLs

#### Core Libraries
- **unist-util-visit**: https://github.com/syntax-tree/unist-util-visit
- **unist-util-visit-parents**: https://github.com/syntax-tree/unist-util-visit-parents
- **unist-util-is**: https://github.com/syntax-tree/unist-util-is
- **mdast-util-to-string**: https://github.com/syntax-tree/mdast-util-to-string

#### Type References
- **mdast node types**: https://github.com/syntax-tree/mdast#nodes
- **remark-gfm extensions**: https://github.com/remarkjs/remark-gfm#readme
- **unified TypeScript patterns**: https://unifiedjs.com/learn/recipe/tree-traversal-typescript/

#### Project Architecture
- **Selector Grammar**: `plan/architecture/selector_grammar.md`
- **System Context**: `plan/architecture/system_context.md`
- **Output Format**: `plan/architecture/output_format.md`

## Key Implementation Insights

### 1. Tree Traversal
Use `unist-util-visit` for traversing mdast trees. For parent tracking, use `unist-util-visit-parents` which provides ancestor chains during traversal.

### 2. Word Counting
Use `mdast-util-to-string` for extracting text content. Count words by splitting on whitespace: `text.trim().split(/\s+/).length`.

### 3. Selector Generation
Selectors use 0-based ordinal indexing: count siblings of same type to determine index. Path format: `heading:h2[index]/section[index]/block:code[index]`.

### 4. Section Virtualization
A "section" is a heading + all content until the next heading of equal or higher level. Use a stack-based approach to track nested sections.

### 5. Pagination
Split content into virtual pages based on word count (default: 500 words/page). Add truncation marker `[truncated]` when content exceeds limit.

## Gotchas & Common Pitfalls

1. **ESM Imports**: All imports must use `.js` extension (even for `.ts` files)
2. **Type Guards**: Use discriminated unions (`node.type === 'heading'`) for type narrowing
3. **Circular References**: Parent references create circular structures - handle during JSON serialization
4. **Position Info**: Not all nodes have position after transformations - always check for existence
5. **Empty Content**: Empty markdown returns Root with empty children array, not null
6. **GFM Tables**: Tables only parse when remark-gfm plugin is enabled
7. **Selector Ordinals**: 0-based indexing - first item is `[0]`, not `[1]`

## Next Steps

After reviewing research, proceed to implement following the PRP at `plan/P1M3/PRP.md`.
