# Parser Testing Patterns Research - Summary

## Overview

This research provides comprehensive guidance on testing markdown parsers in TypeScript/Node.js projects, specifically tailored for the mdsel project using Vitest, remark/unified, and MDAST.

## Documents

### 1. parser-testing-patterns.md (1300+ lines)
**Comprehensive reference** covering all aspects of markdown parser testing:

- **Section 1**: Test fixture patterns with directory structure templates
- **Section 2**: Snapshot testing strategies (3 methods + custom serializers)
- **Section 3**: Edge case coverage (empty files, nested lists, GFM features, unicode)
- **Section 4**: Vitest-specific AST testing patterns with helper utilities
- **Section 5**: File I/O mocking with memfs examples
- **Section 6**: Real-world integration and performance test examples
- **Section 7**: Summary checklist and references

### 2. QUICK_REFERENCE.md
**Quick lookup guide** for developers:

- File structure templates
- Snapshot methods comparison table
- Common test pattern snippets
- Essential commands
- AST helper functions
- Complete edge case checklist
- Tips & tricks
- Common pitfalls to avoid

## Key Findings by Topic

### 1. Test Fixture Organization
- **Pattern**: `test/fixtures/{feature}/input.md` + optional `output.json`
- **Tools**: Helper utility to load fixtures programmatically
- **Benefits**: Organized, maintainable, separates test data from logic
- **Examples**: basic/, headings/, lists/, gfm/, edge-cases/

### 2. Snapshot Testing
- **Best for MDAST**: `toMatchSnapshot()` with custom serializer
- **Custom Serializer**: Excludes position data for cleaner snapshots
- **Update Strategy**: Review changes in git diff before committing
- **Vitest Commands**: `vitest -u` or press 'u' in watch mode

### 3. Edge Cases Covered
- **Structural**: Empty files, whitespace-only, single feature documents
- **Lists**: Deeply nested (5+ levels), mixed types, inconsistent indentation
- **GFM**: Tables (alignment, special chars), strikethrough, task lists, autolinks
- **Unicode**: Emoji, ZWJ sequences, combining marks, RTL text, zero-width chars
- **Code**: Various languages, empty blocks, inline code with special chars

### 4. Vitest AST Testing
- **Tree Traversal**: `findNodesByType()`, `getTreeDepth()`, `countNodes()`
- **Assertions**: Combine snapshots with explicit type/structure checks
- **Organization**: Group by feature, not by file location
- **Performance**: Include benchmarks for parsing speed

### 5. File I/O Mocking
- **Technology**: memfs for in-memory file system
- **Setup**: Create `__mocks__/fs.cjs` and `__mocks__/fs/promises.cjs`
- **Usage**: `vi.mock('node:fs')` + `vol.reset()` in beforeEach
- **Testing**: File reads/writes without touching actual disk

## Implementation Checklist for mdsel

### Phase 1: Foundation
- [ ] Create test fixture directory structure
- [ ] Implement fixtures.utils.ts helper
- [ ] Implement ast-helpers.ts with tree traversal functions
- [ ] Configure Vitest snapshot testing

### Phase 2: Basic Parser Tests
- [ ] Write tests for basic markdown (paragraphs, headings, emphasis)
- [ ] Add fixture examples for all basic features
- [ ] Implement custom MDAST serializer
- [ ] Snapshot basic parser outputs

### Phase 3: Advanced Features
- [ ] Add GFM support tests (tables, strikethrough, tasklists)
- [ ] Create fixtures for GFM edge cases
- [ ] Test configuration options (gfm: true/false)
- [ ] Verify all GFM features produce correct AST

### Phase 4: Edge Cases
- [ ] Test empty files and whitespace handling
- [ ] Test deeply nested lists (up to 10 levels)
- [ ] Test unicode/emoji edge cases
- [ ] Test code blocks with various languages
- [ ] Create comprehensive edge case fixture suite

### Phase 5: File I/O & Integration
- [ ] Set up memfs mocking infrastructure
- [ ] Write file reading/writing tests
- [ ] Test bulk file processing
- [ ] Performance benchmarks

### Phase 6: Polish
- [ ] Document all test patterns used
- [ ] Review snapshot coverage
- [ ] Optimize test execution time
- [ ] Create test data documentation

## Research Quality Metrics

- **Sources Consulted**: 15+ official sources (Vitest docs, remark/unified repos, markdown parsers)
- **Code Examples**: 30+ working examples with TypeScript types
- **Edge Cases**: 20+ specific edge case categories
- **Documentation**: 1500+ lines of detailed guidance

## Recommended Tools & Packages

### Testing
- `vitest` - Fast test framework with excellent snapshot support
- `@vitest/ui` - Visual test runner
- `memfs` - In-memory file system for testing

### Parsing
- `remark` - Markdown processor with plugin ecosystem
- `remark-gfm` - GitHub Flavored Markdown support
- `remark-parse` - Parse markdown to MDAST
- `remark-stringify` - Stringify MDAST back to markdown

### Utilities
- `mdast-util-*` - Various MDAST manipulation utilities
- `unist-util-visit` - Visit nodes in trees

## Key Statistics

| Metric | Value |
|--------|-------|
| Total lines of guidance | 1520+ |
| Code examples | 30+ |
| Edge cases documented | 20+ |
| Test patterns shown | 15+ |
| GFM features covered | 5 (tables, strikethrough, tasklists, autolinks, footnotes) |
| File system operations | 8 patterns |
| Unicode edge cases | 9 categories |

## Critical Points to Remember

1. **Always exclude position data** from snapshots - it causes false failures
2. **Use fixtures for complex tests** - inline strings get unwieldy
3. **Test with options disabled AND enabled** - behavior should differ
4. **Never mock file I/O partially** - use memfs consistently
5. **Group tests by feature** - easier to find and maintain
6. **Review snapshot changes** - they're code too, commit with care
7. **Include performance tests** - ensure parsing stays fast
8. **Unicode matters** - test emoji, combining marks, RTL, ZWJ
9. **Nest deeply** - test lists with 5+ nesting levels
10. **GFM is complex** - tables especially have many edge cases

## Next Steps

1. Read `parser-testing-patterns.md` for detailed implementation guidance
2. Use `QUICK_REFERENCE.md` during development for quick lookups
3. Start with fixture structure and basic tests (Sections 1-2)
4. Add edge cases progressively (Section 3)
5. Implement file I/O mocking for integration tests (Section 5)
6. Review real-world examples (Section 6)

## Related Project Files

These research findings should inform:
- Test strategy in P1M2
- Parser implementation approach
- Fixture organization
- CI/CD test configuration
- Documentation of testing approach

---

**Research Date**: December 2025
**Framework**: Vitest
**Parser**: remark/unified with MDAST
**Project**: mdsel (Markdown Selector CLI)
