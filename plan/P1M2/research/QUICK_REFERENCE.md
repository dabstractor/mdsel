# Parser Testing Patterns - Quick Reference

## File Structure Template

```
project/
├── test/
│   ├── parser.test.ts          # Main test file
│   ├── fixtures.utils.ts       # Helper to load fixtures
│   ├── ast-helpers.ts          # Tree traversal utilities
│   ├── fixtures/               # Test fixtures
│   │   ├── basic/input.md
│   │   ├── headings/input.md
│   │   ├── lists/input.md
│   │   ├── gfm/
│   │   │   ├── tables/input.md
│   │   │   ├── strikethrough/input.md
│   │   │   └── tasklists/input.md
│   │   └── edge-cases/
│   │       ├── empty.md
│   │       ├── unicode.md
│   │       └── nested-lists.md
│   └── __snapshots__/
│       └── parser.test.ts.snap
```

## Snapshot Methods Comparison

| Method | Use Case | Storage |
|--------|----------|---------|
| `toMatchSnapshot()` | Large AST outputs | `.snap` file |
| `toMatchInlineSnapshot()` | Small outputs | Test file |
| `toMatchFileSnapshot()` | Structured data (JSON) | Custom file with extension |

## Common Test Patterns

### Basic Snapshot Test
```typescript
it('should parse markdown', () => {
  const ast = parseMarkdown('# Title')
  expect(ast).toMatchSnapshot()
})
```

### Tree Structure Test
```typescript
it('should have correct nesting', () => {
  const ast = parseMarkdown('- Item\n  - Nested')
  const headings = findNodesByType(ast, 'list')
  expect(headings).toHaveLength(1)
})
```

### Edge Case Test
```typescript
it('should handle empty file', () => {
  const ast = parseMarkdown('')
  expect(ast.children).toHaveLength(0)
})
```

### File I/O Mock Test
```typescript
vi.mock('node:fs')
beforeEach(() => vol.reset())

it('should read file', () => {
  vol.fromJSON({ '/test.md': 'content' })
  const result = parseMarkdownFile('/test.md')
  expect(result).toBeDefined()
})
```

## Essential Commands

```bash
# Run tests
vitest

# Update snapshots
vitest -u

# Watch mode with snapshot update
vitest watch
# Then press 'u'

# Coverage report
vitest --coverage
```

## AST Helper Functions

```typescript
// Find all nodes of type
findNodesByType(ast, 'heading')

// Calculate tree depth
getTreeDepth(ast)

// Count total nodes
countNodes(ast)

// Find first matching node
findNode(ast, node => node.type === 'heading')
```

## Edge Cases Checklist

- [ ] Empty files
- [ ] Files with only whitespace
- [ ] Only headings (no body)
- [ ] Deeply nested lists (5+ levels)
- [ ] Mixed list types (ordered + unordered)
- [ ] GFM tables (basic, alignment, special chars)
- [ ] GFM strikethrough
- [ ] GFM task lists
- [ ] GFM autolinks
- [ ] Emoji and ZWJ sequences
- [ ] Combining marks (accents)
- [ ] RTL text
- [ ] Zero-width characters
- [ ] Unicode scripts
- [ ] Code blocks with various languages
- [ ] Empty code blocks
- [ ] Inline code with special characters

## Custom MDAST Serializer Template

```typescript
expect.addSnapshotSerializer({
  test: (value) => typeof value === 'object' && value?.type,
  serialize: (value) => {
    const cleaned = {
      type: value.type,
      ...(value.children && { children: value.children }),
      ...(value.value && { value: value.value })
    }
    return JSON.stringify(cleaned, null, 2)
  }
})
```

## Fixture Loading Helper Template

```typescript
async function loadFixture(path: string) {
  return {
    input: await fs.readFile(`${path}/input.md`),
    output: await fs.readFile(`${path}/output.json`),
    config: await fs.readFile(`${path}/config.json`)
  }
}
```

## File System Mock Setup

```typescript
// __mocks__/fs.cjs
module.exports = require('memfs').fs

// __mocks__/fs/promises.cjs
module.exports = require('memfs').fs.promises

// In test
vi.mock('node:fs')
vi.mock('node:fs/promises')
beforeEach(() => vol.reset())
```

## GFM Configuration

```typescript
// Enable all GFM features
parseMarkdown(markdown, {
  gfm: true,
  tables: true,
  strikethrough: true,
  tasklist: true,
  autolink: true
})
```

## Performance Benchmarks

- Small document (< 1000 chars): < 10ms
- Medium document (< 10KB): < 100ms
- Large document (< 100KB): < 1s
- Deeply nested (20+ levels): < 100ms

## Tips & Tricks

1. **Use custom serializers** to remove position data and keep snapshots clean
2. **Group tests by feature** (headings, lists, GFM, etc.)
3. **Test both with and without options** (e.g., gfm: true/false)
4. **Use fixtures for complex test cases** instead of inline strings
5. **Snapshot size**: Keep snapshots focused - avoid snapshotting entire documents
6. **Combine assertions**: Use snapshots + explicit type checks
7. **Mock file I/O**: Never test actual file system in unit tests
8. **Tree helpers**: Use `findNodesByType` to locate specific nodes for assertions
9. **Update snapshots carefully**: Review snapshot changes in git diff
10. **Unicode testing**: Include emoji, combining marks, RTL text, and ZWJ sequences

## Common Pitfalls

- Not excluding position data from snapshots (causes brittle tests)
- Testing against actual file system (use memfs instead)
- Large snapshots that are hard to review
- Not testing with various options enabled/disabled
- Missing edge cases (empty files, deep nesting, unicode)
- Snapshot updates without reviewing changes
- Not using fixtures for complex test data
