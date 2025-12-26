# Markdown Parser Testing Patterns for TypeScript/Node.js

## Research Overview

This document consolidates best practices for testing markdown parsers, specifically for TypeScript/Node.js projects using Vitest, remark/unified, and MDAST. The research covers test fixture organization, snapshot testing strategies, edge case coverage, and AST-specific testing patterns.

---

## 1. Test Fixture Patterns

### 1.1 Recommended Directory Structure

Based on unified/remark ecosystem conventions:

```
project/
├── src/
│   └── parser.ts
├── test/
│   ├── parser.test.ts
│   ├── fixtures/
│   │   ├── basic/
│   │   │   ├── input.md
│   │   │   └── output.json (optional: expected AST)
│   │   ├── headings/
│   │   │   ├── input.md
│   │   │   └── output.json
│   │   ├── lists/
│   │   │   ├── input.md
│   │   │   └── output.json
│   │   ├── gfm/
│   │   │   ├── tables/
│   │   │   ├── strikethrough/
│   │   │   └── tasklists/
│   │   ├── edge-cases/
│   │   │   ├── empty.md
│   │   │   ├── unicode.md
│   │   │   └── nested-lists.md
│   │   └── __snapshots__/
│   │       └── parser.test.ts.snap
│   └── fixtures.utils.ts (helper for loading fixtures)
└── package.json
```

### 1.2 Fixture File Naming Conventions

**Standard pattern:**
- `input.md` - The markdown source file for testing
- `output.json` - Expected parsed AST output (when using file snapshots)
- `config.json` - Optional parser configuration/options for that fixture

**Descriptive naming for variants:**
```
fixtures/
├── lists/
│   ├── bullet-default/
│   │   └── input.md
│   ├── bullet-dash/
│   │   └── input.md
│   └── ordered-style-paren/
│       └── input.md
```

### 1.3 Fixture Utilities Helper

Create a helper file to load fixtures programmatically:

```typescript
// test/fixtures.utils.ts
import fs from 'fs/promises'
import path from 'path'

export interface FixtureData {
  input: string
  output?: Record<string, unknown>
  config?: Record<string, unknown>
}

export async function loadFixture(
  fixturePath: string
): Promise<FixtureData> {
  const inputPath = path.join(fixturePath, 'input.md')
  const outputPath = path.join(fixturePath, 'output.json')
  const configPath = path.join(fixturePath, 'config.json')

  const input = await fs.readFile(inputPath, 'utf-8')

  let output: Record<string, unknown> | undefined
  try {
    const outputContent = await fs.readFile(outputPath, 'utf-8')
    output = JSON.parse(outputContent)
  } catch {
    // output.json is optional
  }

  let config: Record<string, unknown> | undefined
  try {
    const configContent = await fs.readFile(configPath, 'utf-8')
    config = JSON.parse(configContent)
  } catch {
    // config.json is optional
  }

  return { input, output, config }
}

export async function loadAllFixtures(
  baseDir: string
): Promise<Map<string, FixtureData>> {
  const fixtures = new Map<string, FixtureData>()
  const entries = await fs.readdir(baseDir, { withFileTypes: true })

  for (const entry of entries) {
    if (entry.isDirectory()) {
      const fixturePath = path.join(baseDir, entry.name)
      try {
        const data = await loadFixture(fixturePath)
        fixtures.set(entry.name, data)
      } catch (error) {
        console.warn(`Failed to load fixture ${entry.name}:`, error)
      }
    }
  }

  return fixtures
}
```

### 1.4 Test File Organization Example

```typescript
// test/parser.test.ts
import { describe, it, expect, beforeAll } from 'vitest'
import { parseMarkdown } from '../src/parser'
import { loadAllFixtures, FixtureData } from './fixtures.utils'
import path from 'path'

describe('Markdown Parser', () => {
  let fixtures: Map<string, FixtureData>

  beforeAll(async () => {
    fixtures = await loadAllFixtures(
      path.join(__dirname, 'fixtures')
    )
  })

  describe('Basic fixtures', () => {
    fixtures.forEach((fixture, name) => {
      it(`should parse ${name} correctly`, () => {
        const result = parseMarkdown(fixture.input)
        expect(result).toMatchSnapshot()
      })
    })
  })
})
```

---

## 2. Snapshot Testing Strategies

### 2.1 When to Use Snapshot Testing

**Good use cases for markdown AST:**
- Testing the complete structure of parsed AST output
- Detecting unintended changes to parsing logic
- Documenting expected parser behavior across versions
- GFM feature support (tables, strikethrough, tasklists)

**Caution:**
- Snapshots can become brittle if they capture too much
- Avoid snapshotting dynamic data (timestamps, generated IDs, position info)
- Use explicit assertions alongside snapshots for critical functionality

### 2.2 Three Snapshot Methods in Vitest

#### Method 1: `toMatchSnapshot()` - Separate Snapshot Files

Best for large, complex AST structures.

```typescript
import { describe, it, expect } from 'vitest'
import { parseMarkdown } from '../src/parser'

describe('Markdown Parser - Snapshots', () => {
  it('should parse complex document structure', () => {
    const markdown = `
# Heading 1

This is a paragraph with **bold** and *italic*.

- Item 1
- Item 2
  - Nested item
    `
    const ast = parseMarkdown(markdown)
    expect(ast).toMatchSnapshot()
  })
})
```

Creates file: `parser.test.ts.snap`

#### Method 2: `toMatchInlineSnapshot()` - Inline in Test File

Best for smaller AST outputs or quick reference.

```typescript
it('should parse heading with inline snapshot', () => {
  const result = parseMarkdown('# Title')
  expect(result).toMatchInlineSnapshot(`
    {
      "type": "root",
      "children": [
        {
          "type": "heading",
          "depth": 1,
          "children": [
            {
              "type": "text",
              "value": "Title"
            }
          ]
        }
      ]
    }
  `)
})
```

#### Method 3: `toMatchFileSnapshot()` - File-Based Snapshots

Best for AST output with syntax highlighting.

```typescript
it('should parse and match file snapshot', async () => {
  const markdown = await fs.readFile('test/fixtures/complex.md', 'utf-8')
  const ast = parseMarkdown(markdown)

  // Saves to: test/fixtures/__snapshots__/complex.ast.json
  await expect(JSON.stringify(ast, null, 2)).toMatchFileSnapshot(
    './fixtures/__snapshots__/complex.ast.json'
  )
})
```

### 2.3 Custom Serializer for MDAST Nodes

Serialize MDAST nodes in a clean, readable format by excluding noise like position data:

```typescript
// test/setup.ts
import { expect } from 'vitest'

expect.addSnapshotSerializer({
  test: (value: unknown) => {
    // Detect MDAST nodes by their type property
    return (
      typeof value === 'object' &&
      value !== null &&
      'type' in value &&
      typeof (value as any).type === 'string'
    )
  },

  serialize: (value: unknown) => {
    const node = value as any

    // Create a clean copy without position data
    const cleaned = {
      type: node.type,
      ...(node.depth && { depth: node.depth }),
      ...(node.ordered !== undefined && { ordered: node.ordered }),
      ...(node.start !== undefined && { start: node.start }),
      ...(node.tight !== undefined && { tight: node.tight }),
      ...(node.checked !== undefined && { checked: node.checked }),
      ...(node.children && {
        children: node.children.map((child: any) => removePositions(child))
      }),
      ...(node.value && { value: node.value }),
      ...(node.url && { url: node.url }),
      ...(node.title && { title: node.title }),
      ...(node.alt && { alt: node.alt }),
      ...(node.lang && { lang: node.lang }),
      ...(node.meta && { meta: node.meta }),
    }

    return JSON.stringify(cleaned, null, 2)
  }
})

function removePositions(node: any): any {
  const { position, ...rest } = node
  if (rest.children) {
    rest.children = rest.children.map(removePositions)
  }
  return rest
}
```

### 2.4 Handling Dynamic Values in Snapshots

Use `expect.any()` for values that change:

```typescript
it('should parse with dynamic values', () => {
  const ast = parseMarkdown('# Test')

  expect(ast).toMatchSnapshot({
    // Ignore position data which varies by file path
    position: expect.any(Object),
    children: expect.arrayContaining([
      expect.objectContaining({
        position: expect.any(Object)
      })
    ])
  })
})
```

### 2.5 Updating Snapshots

Commands for updating snapshots:

```bash
# Update all snapshots in watch mode
vitest watch
# Then press 'u' in the terminal

# Or directly from CLI
vitest --run -u
```

---

## 3. Edge Case Coverage

### 3.1 Comprehensive Edge Cases Test Suite

#### Empty Files

```typescript
describe('Edge Cases - Empty Files', () => {
  it('should handle completely empty file', () => {
    const ast = parseMarkdown('')
    expect(ast).toMatchSnapshot()
    expect(ast.children).toHaveLength(0)
  })

  it('should handle file with only whitespace', () => {
    const ast = parseMarkdown('   \n\n  \t  \n')
    expect(ast.children).toHaveLength(0)
  })

  it('should handle file with only newlines', () => {
    const ast = parseMarkdown('\n\n\n')
    expect(ast.children).toHaveLength(0)
  })
})
```

#### Only Headings

```typescript
describe('Edge Cases - Headings Only', () => {
  it('should parse multiple heading levels only', () => {
    const markdown = `
# H1
## H2
### H3
#### H4
##### H5
###### H6
    `.trim()

    const ast = parseMarkdown(markdown)
    expect(ast).toMatchSnapshot()
    expect(ast.children).toHaveLength(6)
    ast.children.forEach((child, index) => {
      expect(child).toMatchObject({
        type: 'heading',
        depth: index + 1
      })
    })
  })

  it('should handle heading with no trailing content', () => {
    const ast = parseMarkdown('# Only Heading')
    expect(ast.children).toHaveLength(1)
  })
})
```

#### Deeply Nested Lists

```typescript
describe('Edge Cases - Deeply Nested Lists', () => {
  it('should handle deeply nested unordered lists', () => {
    const markdown = `
- Level 1
  - Level 2
    - Level 3
      - Level 4
        - Level 5
          - Level 6
    `.trim()

    const ast = parseMarkdown(markdown)
    expect(ast).toMatchSnapshot()

    // Verify nesting depth
    let current = ast.children[0] as any
    for (let i = 0; i < 5; i++) {
      expect(current.type).toBe('list')
      current = current.children[0]?.children[0]
    }
  })

  it('should handle mixed list markers', () => {
    const markdown = `
1. First
   - Nested unordered
     1. Nested ordered
        - Very nested unordered
    `.trim()

    const ast = parseMarkdown(markdown)
    expect(ast).toMatchSnapshot()
  })

  it('should handle list without blank lines between nesting', () => {
    // This is a common edge case - nested lists without blank lines
    const markdown = `
- Item 1
  - Nested 1
  - Nested 2
- Item 2
    `.trim()

    const ast = parseMarkdown(markdown)
    expect(ast).toMatchSnapshot()
  })

  it('should handle inconsistent indentation in lists', () => {
    // 2 spaces vs 4 spaces
    const markdown = `
- Item with 2 spaces
  - Child 1
    - Grandchild (4 spaces)
  - Child 2
    `.trim()

    const ast = parseMarkdown(markdown)
    expect(ast).toMatchSnapshot()
  })
})
```

#### GFM Features

```typescript
describe('Edge Cases - GFM Features', () => {
  describe('Tables', () => {
    it('should parse basic GFM table', () => {
      const markdown = `
| Header 1 | Header 2 |
|----------|----------|
| Cell 1   | Cell 2   |
| Cell 3   | Cell 4   |
      `.trim()

      const ast = parseMarkdown(markdown, { gfm: true })
      expect(ast).toMatchSnapshot()
      expect(ast.children[0]).toMatchObject({ type: 'table' })
    })

    it('should handle table with alignment', () => {
      const markdown = `
| Left | Center | Right |
|:-----|:------:|------:|
| L1   |   C1   |    R1 |
      `.trim()

      const ast = parseMarkdown(markdown, { gfm: true })
      expect(ast).toMatchSnapshot()
    })

    it('should handle table with special characters in cells', () => {
      const markdown = `
| Code | Description |
|------|-------------|
| \`foo\` | Some *emphasis* |
| **bold** | [Link](https://example.com) |
      `.trim()

      const ast = parseMarkdown(markdown, { gfm: true })
      expect(ast).toMatchSnapshot()
    })

    it('should handle single-cell table edge case', () => {
      const markdown = `
| Cell |
|------|
| Data |
      `.trim()

      const ast = parseMarkdown(markdown, { gfm: true })
      expect(ast).toMatchSnapshot()
    })
  })

  describe('Strikethrough', () => {
    it('should parse strikethrough text', () => {
      const markdown = '~~strikethrough~~'
      const ast = parseMarkdown(markdown, { gfm: true })
      expect(ast).toMatchSnapshot()
    })

    it('should handle nested strikethrough', () => {
      const markdown = '~~**bold strikethrough** and *italic strikethrough*~~'
      const ast = parseMarkdown(markdown, { gfm: true })
      expect(ast).toMatchSnapshot()
    })

    it('should not match single tilde', () => {
      const markdown = '~not strikethrough~'
      const ast = parseMarkdown(markdown, { gfm: true })
      const text = ast.children[0]?.children?.[0]?.value ?? ''
      expect(text).toBe('~not strikethrough~')
    })
  })

  describe('Task Lists', () => {
    it('should parse task list with checkboxes', () => {
      const markdown = `
- [ ] Unchecked task
- [x] Checked task
- [ ] Another unchecked
      `.trim()

      const ast = parseMarkdown(markdown, { gfm: true })
      expect(ast).toMatchSnapshot()
    })

    it('should handle task list mixed with regular list items', () => {
      const markdown = `
- [ ] Task 1
- Regular item
- [x] Task 2
      `.trim()

      const ast = parseMarkdown(markdown, { gfm: true })
      expect(ast).toMatchSnapshot()
    })
  })

  describe('Autolinks', () => {
    it('should autolink URLs without angle brackets', () => {
      const markdown = 'Visit www.example.com for more info'
      const ast = parseMarkdown(markdown, { gfm: true })
      expect(ast).toMatchSnapshot()
    })

    it('should handle URL in parentheses', () => {
      const markdown = '(see https://example.com)'
      const ast = parseMarkdown(markdown, { gfm: true })
      expect(ast).toMatchSnapshot()
    })
  })
})
```

#### Unicode and Special Characters

```typescript
describe('Edge Cases - Unicode and Special Characters', () => {
  it('should handle emoji in text', () => {
    const markdown = 'Hello 👋 World 🌍 🚀'
    const ast = parseMarkdown(markdown)
    expect(ast).toMatchSnapshot()
  })

  it('should handle emoji sequences (zero-width joiner)', () => {
    // Family emoji: combination of 4 emojis with ZWJ
    const markdown = 'Family: 👨‍👩‍👧‍👦 (father, mother, daughter, son)'
    const ast = parseMarkdown(markdown)
    expect(ast).toMatchSnapshot()
  })

  it('should handle combining marks', () => {
    const markdown = 'Café (é = e + combining acute accent)'
    const ast = parseMarkdown(markdown)
    expect(ast).toMatchSnapshot()
  })

  it('should handle RTL text', () => {
    const markdown = 'English and العربية mixed text'
    const ast = parseMarkdown(markdown)
    expect(ast).toMatchSnapshot()
  })

  it('should handle zero-width characters', () => {
    const markdown = 'Word‌with‌zero‌width‌joiner' // Contains ZWJ
    const ast = parseMarkdown(markdown)
    expect(ast).toMatchSnapshot()
  })

  it('should handle special markdown characters literally', () => {
    const markdown = 'Literal: [ ] ( ) * _ ~ ` # \\ /'
    const ast = parseMarkdown(markdown)
    expect(ast).toMatchSnapshot()
  })

  it('should handle various dash types', () => {
    const markdown = `
- Hyphen: -
- En dash: –
- Em dash: —
- Minus sign: −
    `.trim()

    const ast = parseMarkdown(markdown)
    expect(ast).toMatchSnapshot()
  })

  it('should handle Unicode in code blocks', () => {
    const markdown = `
\`\`\`python
# Emoji in code
message = "Hello 👋"
\`\`\`
    `.trim()

    const ast = parseMarkdown(markdown)
    expect(ast).toMatchSnapshot()
  })

  it('should handle mixed scripts', () => {
    const markdown = '日本語 中文 한국어 العربية हिन्दी Ελληνικά'
    const ast = parseMarkdown(markdown)
    expect(ast).toMatchSnapshot()
  })
})
```

#### Code Blocks

```typescript
describe('Edge Cases - Code Blocks', () => {
  it('should parse fenced code block with language', () => {
    const markdown = `
\`\`\`typescript
const x: number = 42
\`\`\`
    `.trim()

    const ast = parseMarkdown(markdown)
    expect(ast).toMatchSnapshot()
    expect(ast.children[0]).toMatchObject({
      type: 'code',
      lang: 'typescript'
    })
  })

  it('should handle empty code block', () => {
    const markdown = `
\`\`\`
\`\`\`
    `.trim()

    const ast = parseMarkdown(markdown)
    expect(ast).toMatchSnapshot()
  })

  it('should handle code block with no language specified', () => {
    const markdown = `
\`\`\`
plain code
\`\`\`
    `.trim()

    const ast = parseMarkdown(markdown)
    expect(ast).toMatchSnapshot()
  })

  it('should handle backticks inside code block', () => {
    const markdown = `
\`\`\`
const code = \`template literal\`
\`\`\`
    `.trim()

    const ast = parseMarkdown(markdown)
    expect(ast).toMatchSnapshot()
  })

  it('should preserve whitespace in code blocks', () => {
    const markdown = `
\`\`\`python
def function():
    if condition:
        do_something()
\`\`\`
    `.trim()

    const ast = parseMarkdown(markdown)
    const code = ast.children[0] as any
    expect(code.value).toContain('    if')
  })

  it('should handle indented code blocks (4 spaces)', () => {
    const markdown = `
paragraph

    indented code
    with multiple lines
    `.trim()

    const ast = parseMarkdown(markdown)
    expect(ast).toMatchSnapshot()
  })

  it('should handle inline code with special characters', () => {
    const markdown = 'Use `foo(bar)` or `<div>`'
    const ast = parseMarkdown(markdown)
    expect(ast).toMatchSnapshot()
  })
})
```

---

## 4. Vitest Patterns for AST Testing

### 4.1 Test Suite Organization

```typescript
// test/parser.test.ts
import { describe, it, expect, beforeAll, afterEach } from 'vitest'
import { parseMarkdown } from '../src/parser'

describe('Markdown Parser with MDAST', () => {
  describe('Node Type Validation', () => {
    it('should create nodes with correct type properties', () => {
      const ast = parseMarkdown('# Title')
      expect(ast).toHaveProperty('type', 'root')
      expect(ast.children[0]).toHaveProperty('type', 'heading')
    })
  })

  describe('Tree Structure Validation', () => {
    it('should build proper parent-child relationships', () => {
      const ast = parseMarkdown('# Title\n\nParagraph')
      expect(ast.type).toBe('root')
      expect(ast.children).toBeInstanceOf(Array)
      expect(ast.children.length).toBeGreaterThan(0)

      ast.children.forEach(child => {
        expect(child).toHaveProperty('type')
      })
    })

    it('should properly nest child nodes', () => {
      const markdown = '- Item 1\n  - Nested'
      const ast = parseMarkdown(markdown)

      const list = ast.children[0] as any
      expect(list.type).toBe('list')
      expect(list.children).toBeDefined()
      expect(list.children.length).toBeGreaterThan(0)
    })
  })

  describe('AST Validation Helpers', () => {
    // Helper function to assert node structure
    function assertNode(
      node: any,
      expectedType: string,
      expectedProps?: Record<string, unknown>
    ) {
      expect(node).toHaveProperty('type', expectedType)
      if (expectedProps) {
        Object.entries(expectedProps).forEach(([key, value]) => {
          expect(node).toHaveProperty(key, value)
        })
      }
    }

    it('should validate heading depth using helper', () => {
      const ast = parseMarkdown('## Subtitle')
      assertNode(ast.children[0], 'heading', { depth: 2 })
    })
  })
})
```

### 4.2 Tree Traversal Utilities

```typescript
// test/ast-helpers.ts
export interface ASTNode {
  type: string
  children?: ASTNode[]
  [key: string]: unknown
}

/**
 * Walk the AST tree and collect all nodes of a specific type
 */
export function findNodesByType(
  node: ASTNode,
  type: string
): ASTNode[] {
  const matches: ASTNode[] = []

  function traverse(current: ASTNode) {
    if (current.type === type) {
      matches.push(current)
    }
    if (current.children) {
      current.children.forEach(traverse)
    }
  }

  traverse(node)
  return matches
}

/**
 * Calculate tree depth
 */
export function getTreeDepth(node: ASTNode): number {
  if (!node.children || node.children.length === 0) {
    return 1
  }
  return 1 + Math.max(...node.children.map(getTreeDepth))
}

/**
 * Count total nodes in tree
 */
export function countNodes(node: ASTNode): number {
  let count = 1
  if (node.children) {
    count += node.children.reduce((sum, child) => sum + countNodes(child), 0)
  }
  return count
}

/**
 * Find first node matching predicate
 */
export function findNode(
  node: ASTNode,
  predicate: (n: ASTNode) => boolean
): ASTNode | undefined {
  if (predicate(node)) {
    return node
  }
  if (node.children) {
    for (const child of node.children) {
      const result = findNode(child, predicate)
      if (result) return result
    }
  }
  return undefined
}
```

Using the helpers in tests:

```typescript
import { findNodesByType, getTreeDepth, countNodes } from './ast-helpers'

it('should have correct tree depth for nested lists', () => {
  const markdown = `
- Level 1
  - Level 2
    - Level 3
  `.trim()

  const ast = parseMarkdown(markdown)
  expect(getTreeDepth(ast)).toBeGreaterThanOrEqual(4)
})

it('should count all nodes correctly', () => {
  const markdown = '# Title\n\nParagraph\n\n- Item'
  const ast = parseMarkdown(markdown)
  expect(countNodes(ast)).toBeGreaterThan(5)
})

it('should find all headings in document', () => {
  const markdown = `
# H1
## H2
# Another H1
  `.trim()

  const ast = parseMarkdown(markdown)
  const headings = findNodesByType(ast, 'heading')
  expect(headings).toHaveLength(3)
})
```

### 4.3 Testing Parser Options

```typescript
describe('Parser Configuration Options', () => {
  it('should respect GFM option for tables', () => {
    const markdown = '| A | B |\n|---|---|\n| 1 | 2 |'

    const withoutGfm = parseMarkdown(markdown, { gfm: false })
    expect(findNodesByType(withoutGfm, 'table')).toHaveLength(0)

    const withGfm = parseMarkdown(markdown, { gfm: true })
    expect(findNodesByType(withGfm, 'table')).toHaveLength(1)
  })

  it('should respect custom option values', () => {
    const markdown = 'Text'
    const result = parseMarkdown(markdown, {
      normalize: true,
      commonmark: false
    })
    expect(result).toBeDefined()
  })
})
```

---

## 5. File I/O Mocking Patterns

### 5.1 Using memfs for File System Mocking

Setup in your test configuration:

```typescript
// vitest.config.ts
import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    coverage: {
      provider: 'istanbul'
    }
  }
})
```

Create mock files:

```typescript
// __mocks__/fs.cjs
const { fs } = require('memfs')
module.exports = fs

// __mocks__/fs/promises.cjs
const { fs } = require('memfs')
module.exports = fs.promises
```

### 5.2 Mocking File Reads in Tests

```typescript
// test/file-reading.test.ts
import { beforeEach, describe, it, expect, vi } from 'vitest'
import { fs, vol } from 'memfs'
import { parseMarkdownFile } from '../src/parser'

vi.mock('node:fs')
vi.mock('node:fs/promises')

describe('Markdown File Operations', () => {
  beforeEach(() => {
    // Clear in-memory filesystem before each test
    vol.reset()
  })

  it('should read and parse markdown file', () => {
    const filePath = '/test/document.md'
    const content = '# Test\n\nParagraph'

    // Create file in in-memory filesystem
    vol.fromJSON({
      '/test/document.md': content
    })

    const result = parseMarkdownFile(filePath)
    expect(result).toBeDefined()
    expect(result.children).toHaveLength(2)
  })

  it('should handle file not found error', () => {
    expect(() => {
      parseMarkdownFile('/nonexistent/file.md')
    }).toThrow()
  })

  it('should handle permission errors', () => {
    vol.fromJSON({
      '/restricted.md': 'content'
    })

    // Note: memfs doesn't fully simulate permission errors
    // For full permission testing, use additional mocking
    const result = parseMarkdownFile('/restricted.md')
    expect(result).toBeDefined()
  })

  it('should handle multiple files', async () => {
    vol.fromJSON({
      '/docs/file1.md': '# File 1',
      '/docs/file2.md': '# File 2',
      '/docs/subdir/file3.md': '# File 3'
    })

    const files = ['/docs/file1.md', '/docs/file2.md', '/docs/subdir/file3.md']
    const results = files.map(parseMarkdownFile)

    expect(results).toHaveLength(3)
    results.forEach(result => {
      expect(result.children[0]).toHaveProperty('type', 'heading')
    })
  })
})
```

### 5.3 Mocking fs.promises for Async Operations

```typescript
// test/async-file-operations.test.ts
import { beforeEach, describe, it, expect, vi } from 'vitest'
import { fs, vol } from 'memfs'
import { parseMarkdownFileAsync } from '../src/parser'

vi.mock('node:fs/promises')

describe('Async Markdown File Operations', () => {
  beforeEach(() => {
    vol.reset()
  })

  it('should read and parse file asynchronously', async () => {
    const filePath = '/async/document.md'
    const content = '# Async Test\n\nContent'

    vol.fromJSON({
      '/async/document.md': content
    })

    const result = await parseMarkdownFileAsync(filePath)
    expect(result).toBeDefined()
  })

  it('should handle async errors gracefully', async () => {
    await expect(
      parseMarkdownFileAsync('/nonexistent.md')
    ).rejects.toThrow()
  })

  it('should process multiple files concurrently', async () => {
    vol.fromJSON({
      '/docs/1.md': '# File 1',
      '/docs/2.md': '# File 2',
      '/docs/3.md': '# File 3'
    })

    const promises = [
      parseMarkdownFileAsync('/docs/1.md'),
      parseMarkdownFileAsync('/docs/2.md'),
      parseMarkdownFileAsync('/docs/3.md')
    ]

    const results = await Promise.all(promises)
    expect(results).toHaveLength(3)
  })
})
```

### 5.4 Mocking File System Functions

```typescript
// test/fs-functions.test.ts
import { beforeEach, describe, it, expect, vi } from 'vitest'
import { fs } from 'memfs'

vi.mock('node:fs')

describe('File System Operations', () => {
  beforeEach(() => {
    // Reset filesystem
    fs.rmSync('/', { recursive: true, force: true })
    fs.mkdirSync('/', { recursive: true })
  })

  it('should create directory structure', () => {
    fs.mkdirSync('/test/nested/deep', { recursive: true })
    expect(fs.existsSync('/test/nested/deep')).toBe(true)
  })

  it('should write and read files', () => {
    const filePath = '/output.md'
    const content = '# Generated'

    fs.writeFileSync(filePath, content, 'utf-8')
    const readContent = fs.readFileSync(filePath, 'utf-8')

    expect(readContent).toBe(content)
  })

  it('should list directory contents', () => {
    fs.mkdirSync('/files', { recursive: true })
    fs.writeFileSync('/files/a.md', 'A')
    fs.writeFileSync('/files/b.md', 'B')

    const files = fs.readdirSync('/files')
    expect(files).toEqual(['a.md', 'b.md'])
  })

  it('should handle file stats', () => {
    fs.writeFileSync('/test.md', 'content')
    const stats = fs.statSync('/test.md')

    expect(stats.isFile()).toBe(true)
    expect(stats.isDirectory()).toBe(false)
  })
})
```

---

## 6. Real-World Test Examples

### 6.1 Complete Integration Test

```typescript
// test/integration.test.ts
import { describe, it, expect, beforeAll } from 'vitest'
import { parseMarkdown } from '../src/parser'
import {
  findNodesByType,
  countNodes,
  getTreeDepth
} from './ast-helpers'
import { loadFixture } from './fixtures.utils'
import path from 'path'

describe('Integration Tests', () => {
  it('should parse realistic blog post structure', async () => {
    const fixture = await loadFixture(
      path.join(__dirname, 'fixtures/blog-post')
    )

    const ast = parseMarkdown(fixture.input)

    // Validate structure
    expect(ast.type).toBe('root')
    expect(ast.children.length).toBeGreaterThan(0)

    // Find main sections
    const headings = findNodesByType(ast, 'heading')
    expect(headings.length).toBeGreaterThanOrEqual(2)

    // Check for code blocks
    const codeBlocks = findNodesByType(ast, 'code')
    expect(codeBlocks.length).toBeGreaterThanOrEqual(1)

    // Snapshot the result
    expect(ast).toMatchSnapshot()
  })

  it('should handle document with all GFM features', async () => {
    const markdown = `
# Main Title

Regular paragraph with **bold**, *italic*, and \`code\`.

## Tables

| Feature | Status |
|---------|--------|
| Working | ✓      |

## Lists

- [ ] Task 1
- [x] Task 2
- Regular item

### Nested Lists
- Level 1
  - Level 2
    - Level 3

## Strikethrough

~~Old content~~ New content

## Code

\`\`\`typescript
const example = (x: number) => x * 2
\`\`\`

See www.example.com for more.
    `.trim()

    const ast = parseMarkdown(markdown, { gfm: true })

    expect(countNodes(ast)).toBeGreaterThan(20)
    expect(getTreeDepth(ast)).toBeGreaterThan(3)

    // Verify all element types
    expect(findNodesByType(ast, 'heading')).toBeDefined()
    expect(findNodesByType(ast, 'table')).toBeDefined()
    expect(findNodesByType(ast, 'list')).toBeDefined()
    expect(findNodesByType(ast, 'code')).toBeDefined()
  })
})
```

### 6.2 Performance Test Example

```typescript
// test/performance.test.ts
import { describe, it, expect } from 'vitest'
import { parseMarkdown } from '../src/parser'

describe('Performance Tests', () => {
  it('should parse large document within acceptable time', () => {
    // Generate large markdown document
    let content = '# Title\n\n'
    for (let i = 0; i < 100; i++) {
      content += `## Section ${i}\n\nParagraph content. `.repeat(5) + '\n\n'
      content += `- Item 1\n- Item 2\n- Item 3\n\n`
    }

    const startTime = performance.now()
    const ast = parseMarkdown(content)
    const endTime = performance.now()

    expect(ast).toBeDefined()
    expect(endTime - startTime).toBeLessThan(1000) // Should complete in <1s
  })

  it('should handle deeply nested structures efficiently', () => {
    let markdown = ''
    for (let i = 0; i < 20; i++) {
      markdown += '  '.repeat(i) + `- Level ${i}\n`
    }

    const startTime = performance.now()
    const ast = parseMarkdown(markdown)
    const endTime = performance.now()

    expect(ast).toBeDefined()
    expect(endTime - startTime).toBeLessThan(100)
  })
})
```

---

## 7. Summary and Best Practices

### Key Takeaways

1. **Fixture Organization**: Use hierarchical directory structure with `input.md` and optional `output.json` files for maintainability

2. **Snapshot Testing**: Use `toMatchSnapshot()` for large AST outputs, with custom serializers to exclude position data

3. **Edge Cases**: Test empty files, deeply nested structures, GFM features, unicode/emoji, and code blocks with various languages

4. **Vitest AST Testing**: Leverage tree traversal helpers and explicit assertions alongside snapshots

5. **File I/O Mocking**: Use memfs in combination with `vi.mock()` for reliable, isolated file system testing

6. **Custom Serializers**: Create MDAST node serializers to generate clean, readable snapshots

### Testing Checklist

- [ ] Fixture directory structure documented
- [ ] Snapshot testing strategy chosen (method 1, 2, or 3)
- [ ] Custom MDAST serializer implemented
- [ ] Edge cases covered (empty, nested, GFM, unicode)
- [ ] Tree traversal helpers created
- [ ] File I/O mocking configured with memfs
- [ ] Integration tests include full document parsing
- [ ] Performance tests set reasonable thresholds
- [ ] All snapshots reviewed and committed
- [ ] Tests run with `vitest -u` for new snapshots

---

## References

1. [Vitest Snapshot Testing Guide](https://vitest.dev/guide/snapshot)
2. [Vitest File System Mocking](https://vitest.dev/guide/mocking/file-system)
3. [Vitest Mocking Documentation](https://vitest.dev/guide/mocking)
4. [Remark Repository](https://github.com/remarkjs/remark)
5. [Remark GitHub Repository](https://github.com/remarkjs/remark-gfm)
6. [Unified Documentation](https://unifiedjs.com/)
7. [Test Fixtures Pattern](https://github.com/danielcaldas/test-fixtures-pattern)
8. [Marked Markdown Parser](https://github.com/markedjs/marked)
9. [Unicode and Emoji Testing](https://ashvardanian.com/posts/search-utf8/)
10. [Markdown Test File](https://github.com/mxstbr/markdown-test-file)
