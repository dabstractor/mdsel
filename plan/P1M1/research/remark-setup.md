# Remark and Unified Markdown Parsing in TypeScript: Best Practices

## Research Overview

This document consolidates best practices for using remark and unified for Markdown parsing in TypeScript, with focus on setup, types, tree traversal, and GFM parsing pipelines.

---

## 1. Unified Architecture and Core Concepts

### What is Unified?

**Unified** is an open-source collective providing the interface for parsing, inspecting, transforming, and serializing content. Rather than working directly with raw content, developers operate on **syntax trees** (Abstract Syntax Trees) - intermediate structured representations that make manipulation systematic and reliable.

**Key Stats:**
- 312 open-source projects in the collective
- 478 maintained packages
- 2.9 billion monthly npm downloads
- Powers: Prettier, Gatsby, Node.js documentation, alex

**Source:** https://unifiedjs.com

### The Plugin Architecture

Unified uses a **processor** pattern where you chain plugins that transform content:

```typescript
import { unified } from 'unified'

const processor = unified()
  .use(plugin1)
  .use(plugin2)
  .use(plugin3)

const result = await processor.process(content)
```

---

## 2. Remark: Markdown Processing

### What is Remark?

**Remark** is a unified processor with support for parsing markdown as input and serializing markdown as output. It's the markdown-focused tool in the unified ecosystem.

**Official Documentation:** https://remark.js.org/
**Unified Package Info:** https://unifiedjs.com/explore/package/remark/
**GitHub Repository:** https://github.com/remarkjs/remark

### Core Packages

| Package | Purpose | Link |
|---------|---------|------|
| remark-parse | Parse markdown → mdast | https://unifiedjs.com/explore/package/remark-parse/ |
| remark-stringify | Serialize mdast → markdown | https://www.npmjs.com/package/remark-stringify |
| remark | Combined parser + stringifier shortcut | https://www.npmjs.com/package/remark |
| remark-cli | Command-line interface | https://www.npmjs.com/package/remark-cli |

### Key Features

- **100% CommonMark compliant** - Follows official CommonMark specification
- **GFM support** - GitHub Flavored Markdown via plugins
- **150+ plugins** - Extensive ecosystem for extensions
- **Full TypeScript support** - Native types included
- **ESM only** - Modern JavaScript modules (Node.js 16+)

---

## 3. Installation and Basic Setup

### Install Required Packages

```bash
# Core unified + remark with TypeScript support
npm install unified remark-parse remark-stringify remark-gfm

# For type definitions
npm install --save-dev @types/mdast

# Tree traversal utilities
npm install unist-util-visit

# Optional: for markdown to HTML conversion
npm install remark-rehype rehype-stringify
```

### Package.json Configuration

For TypeScript projects using ESM:

```json
{
  "name": "my-markdown-project",
  "type": "module",
  "engines": {
    "node": ">=16.0.0"
  },
  "dependencies": {
    "unified": "^10.1.0",
    "remark-parse": "^11.0.0",
    "remark-stringify": "^11.0.0",
    "remark-gfm": "^4.0.0",
    "@types/mdast": "^4.0.0",
    "unist-util-visit": "^5.0.0"
  },
  "devDependencies": {
    "@types/node": "^20.0.0",
    "typescript": "^5.0.0"
  }
}
```

---

## 4. Processor Setup with TypeScript

### Basic Parser Setup

```typescript
import { unified } from 'unified'
import remarkParse from 'remark-parse'
import type { Root } from 'mdast'

// Create a processor for parsing
const processor = unified()
  .use(remarkParse)

// Parse markdown to AST
const markdown = '# Hello World\n\nThis is **bold** text.'
const ast: Root = processor.parse(markdown) as Root

console.log(JSON.stringify(ast, null, 2))
```

**Output Structure:**
```json
{
  "type": "root",
  "children": [
    {
      "type": "heading",
      "depth": 1,
      "children": [
        {
          "type": "text",
          "value": "Hello World"
        }
      ]
    },
    {
      "type": "paragraph",
      "children": [
        {
          "type": "text",
          "value": "This is "
        },
        {
          "type": "strong",
          "children": [
            {
              "type": "text",
              "value": "bold"
            }
          ]
        },
        {
          "type": "text",
          "value": " text."
        }
      ]
    }
  ]
}
```

### Full Processing Pipeline

```typescript
import { unified } from 'unified'
import remarkParse from 'remark-parse'
import remarkStringify from 'remark-stringify'
import type { Root } from 'mdast'
import { VFile } from 'vfile'

const processor = unified()
  .use(remarkParse)
  .use(remarkStringify)

const markdown = '# Hello\n\nWorld'

// Using async processing
const file = await processor.process(new VFile({ value: markdown }))
console.log(String(file))
```

---

## 5. GFM (GitHub Flavored Markdown) Support

### What is GFM?

GitHub Flavored Markdown extends CommonMark with:
- **Tables** - Pipe-delimited columns and rows
- **Strikethrough** - `~~deleted text~~`
- **Footnotes** - Reference-style footnotes with `[^1]`
- **Autolink literals** - Automatic URL detection
- **Task lists** - Checkboxes in lists

**GitHub Repository:** https://github.com/remarkjs/remark-gfm

### GFM Processor Setup

```typescript
import { unified } from 'unified'
import remarkParse from 'remark-parse'
import remarkGfm from 'remark-gfm'
import remarkStringify from 'remark-stringify'
import type { Root } from 'mdast'

const processor = unified()
  .use(remarkParse)
  .use(remarkGfm)  // Enable GFM extensions
  .use(remarkStringify)

// Example with all GFM features
const gfmMarkdown = `
# GFM Example

## Tables

| Feature | Status |
|---------|--------|
| Tables  | Supported |
| Lists   | Supported |

## Strikethrough

This is ~~deleted~~ text.

## Task Lists

- [x] Completed task
- [ ] Incomplete task

## Footnotes

Here is a footnote[^1].

[^1]: This is the footnote content.

## Autolinks

Visit https://example.com for more info.
`

const result = processor.parse(gfmMarkdown) as Root
console.log(JSON.stringify(result, null, 2))
```

### GFM Configuration Options

```typescript
interface RemarkGfmOptions {
  // Strikethrough configuration
  singleTilde?: boolean  // Default: true - allow ~single~ strikethrough

  // Table configuration
  tablePipeAlign?: boolean      // Default: true - align pipe characters
  tableCellPadding?: boolean    // Default: true - pad cells with spaces

  // Footnote configuration
  firstLineBlank?: boolean      // Default: false - blank line before definitions

  // Size detection for table alignment
  stringLength?: (value: string) => number  // Default: d => d.length
}

// Usage with options
const processor = unified()
  .use(remarkParse)
  .use(remarkGfm, {
    singleTilde: false,        // Require ~~ for strikethrough
    tablePipeAlign: true,
    tableCellPadding: true
  })
  .use(remarkStringify)
```

### Complete GFM Pipeline with HTML Output

```typescript
import { unified } from 'unified'
import remarkParse from 'remark-parse'
import remarkGfm from 'remark-gfm'
import remarkRehype from 'remark-rehype'
import rehypeStringify from 'rehype-stringify'
import { read } from 'to-vfile'
import type { Root } from 'mdast'

const processor = unified()
  .use(remarkParse)
  .use(remarkGfm)
  .use(remarkRehype)
  .use(rehypeStringify)

// Process a markdown file
const markdown = `
# My Document

| Column 1 | Column 2 |
|----------|----------|
| Data 1   | Data 2   |

**Bold** and ~~strikethrough~~ text.
`

const file = await processor.process(markdown)
console.log(String(file))
```

---

## 6. MDAST Node Types and TypeScript Integration

### Core mdast Types

**mdast** stands for **Markdown Abstract Syntax Tree**. It's a standardized format for representing markdown as JSON-like structures.

**GitHub:** https://github.com/syntax-tree/mdast
**Type Package:** https://www.npmjs.com/package/@types/mdast
**Unified Explorer:** https://unifiedjs.com/explore/package/mdast/

### Common Node Types

```typescript
import type {
  // Root and containers
  Root,
  Paragraph,
  Blockquote,
  Heading,
  List,
  ListItem,

  // Inline content
  Text,
  Strong,
  Emphasis,
  InlineCode,
  Break,
  Link,
  LinkReference,
  Image,
  ImageReference,

  // Block content
  Code,
  Html,
  ThematicBreak,

  // GFM extensions (when using remark-gfm)
  Table,
  TableRow,
  TableCell,
  Delete,           // Strikethrough
  FootnoteDefinition,
  FootnoteReference,
  TaskListItem,     // Checkbox lists
} from 'mdast'

// Type hierarchy
interface Heading {
  type: 'heading'
  depth: 1 | 2 | 3 | 4 | 5 | 6
  children: PhrasingContent[]
}

interface Paragraph {
  type: 'paragraph'
  children: PhrasingContent[]
}

interface Text {
  type: 'text'
  value: string
}

interface Strong {
  type: 'strong'
  children: PhrasingContent[]
}

// GFM-specific types
interface Table {
  type: 'table'
  align?: Array<'left' | 'right' | 'center' | null>
  children: TableRow[]
}

interface TableRow {
  type: 'tableRow'
  children: TableCell[]
}

interface TableCell {
  type: 'tableCell'
  align?: 'left' | 'right' | 'center' | null
  children: PhrasingContent[]
}

interface Delete {
  type: 'delete'
  children: PhrasingContent[]
}
```

### Content Type Unions

```typescript
import type {
  FlowContent,      // Top-level block content
  PhrasingContent,  // Inline text content
  BlockContent,     // Flow + frontmatter + list items
} from 'mdast'

// FlowContent includes: Blockquote, Code, Heading, Html, List, ThematicBreak, Paragraph
// + GFM: Table, FootnoteDefinition

// PhrasingContent includes: Break, Emphasis, Html, Image, ImageReference, InlineCode, Link, LinkReference, Strong, Text
// + GFM: Delete, FootnoteReference
```

### Type Registration for Extensions

When using GFM or custom extensions, ensure types are registered:

```typescript
// At the top of your file, before using types
/**
 * @typedef {import('remark-gfm')}
 */

import type { Root, Table, Delete } from 'mdast'
import { remark } from 'remark'
import remarkGfm from 'remark-gfm'

const processor = remark().use(remarkGfm)
```

---

## 7. Tree Traversal with unist-util-visit

### Installation

```bash
npm install unist-util-visit
```

**GitHub:** https://github.com/syntax-tree/unist-util-visit
**Unified Explorer:** https://unifiedjs.com/explore/package/unist-util-visit/
**TypeScript Recipe:** https://unifiedjs.com/learn/recipe/tree-traversal-typescript/

### Basic Tree Traversal

```typescript
import type { Root, Heading, Paragraph } from 'mdast'
import { visit } from 'unist-util-visit'
import { remark } from 'remark'

const markdown = '# Title\n\nParagraph text.'
const tree: Root = remark().parse(markdown) as Root

// Visit all nodes of a specific type
visit(tree, 'heading', (node: Heading) => {
  console.log('Found heading level', node.depth)
})

// Visit all paragraphs
visit(tree, 'paragraph', (node: Paragraph) => {
  console.log('Found paragraph')
})
```

### Advanced Traversal with Type Narrowing

```typescript
import type { Root, Node } from 'mdast'
import { visit, SKIP, CONTINUE, EXIT } from 'unist-util-visit'
import { remark } from 'remark'

const tree = remark().parse('# Hello\n\n**bold** text') as Root

// Visit with type checking and control flow
visit(tree, (node: Node, index, parent) => {
  if (node.type === 'heading' && node.depth === 1) {
    console.log('Found top-level heading')

    // Control flow constants
    return SKIP      // Skip children of this node
    // or CONTINUE  // Continue traversal (default)
    // or EXIT      // Stop all traversal
  }
})
```

### Finding Nodes with Specific Criteria

```typescript
import type { Root, Heading } from 'mdast'
import { visit } from 'unist-util-visit'
import { remark } from 'remark'

const tree = remark().parse('# H1\n\n## H2\n\n### H3') as Root

// Find all headings and increase depth
const headings: Heading[] = []
visit(tree, 'heading', (node: Heading) => {
  headings.push(node)
  if (node.depth < 6) {
    node.depth += 1  // Modify tree in-place
  }
})

console.log(headings.length)  // 3
```

### Visiting with Parent Information

```typescript
import type { Root } from 'mdast'
import { visitParents } from 'unist-util-visit'
import { remark } from 'remark'

const tree = remark().parse('**bold _italic_**') as Root

// visitParents provides ancestor chain
visitParents(tree, (node, ancestors) => {
  if (node.type === 'emphasis') {
    // ancestors contains all parent nodes up to root
    console.log('Parents:', ancestors.map(a => a.type))
    // Output: ['strong', 'paragraph', 'root']
  }
})
```

### Control Flow Examples

```typescript
import type { Root } from 'mdast'
import { visit, SKIP, EXIT } from 'unist-util-visit'
import { remark } from 'remark'

const tree = remark().parse(
  '> Quote with **bold**\n\n- List item with `code`'
) as Root

// Skip children - don't traverse inside blockquotes
visit(tree, 'blockquote', () => {
  console.log('Found blockquote, skipping children')
  return SKIP
})

// Exit early - stop after finding first strong node
visit(tree, 'strong', () => {
  console.log('Found strong, stopping traversal')
  return EXIT
})
```

### Practical Example: Extract Headings

```typescript
import type { Root, Heading } from 'mdast'
import { visit } from 'unist-util-visit'
import { remark } from 'remark'
import { toString } from 'mdast-util-to-string'

interface HeadingInfo {
  level: number
  text: string
}

function extractHeadings(markdown: string): HeadingInfo[] {
  const tree = remark().parse(markdown) as Root
  const headings: HeadingInfo[] = []

  visit(tree, 'heading', (node: Heading) => {
    headings.push({
      level: node.depth,
      text: toString(node)
    })
  })

  return headings
}

const md = '# Main\n## Section\n### Subsection'
console.log(extractHeadings(md))
// Output:
// [
//   { level: 1, text: 'Main' },
//   { level: 2, text: 'Section' },
//   { level: 3, text: 'Subsection' }
// ]
```

---

## 8. Complete Real-World Examples

### Example 1: Markdown Validator with GFM

```typescript
import type { Root, Heading } from 'mdast'
import { remark } from 'remark'
import remarkGfm from 'remark-gfm'
import { visit } from 'unist-util-visit'

interface ValidationResult {
  isValid: boolean
  errors: string[]
  warnings: string[]
}

function validateMarkdown(markdown: string): ValidationResult {
  const result: ValidationResult = {
    isValid: true,
    errors: [],
    warnings: []
  }

  try {
    const processor = remark().use(remarkGfm)
    const tree = processor.parse(markdown) as Root

    let headingCount = 0
    let h1Count = 0

    visit(tree, 'heading', (node: Heading) => {
      headingCount++
      if (node.depth === 1) {
        h1Count++
      }
    })

    // Validation rules
    if (h1Count === 0) {
      result.errors.push('Document must have at least one H1 heading')
      result.isValid = false
    }

    if (h1Count > 1) {
      result.warnings.push('Document has multiple H1 headings')
    }

    if (headingCount === 0) {
      result.warnings.push('Document has no headings')
    }

  } catch (error) {
    result.errors.push(`Parse error: ${String(error)}`)
    result.isValid = false
  }

  return result
}

// Usage
const md = `# Title

Content here.

## Section`

const validation = validateMarkdown(md)
console.log(validation)
```

### Example 2: Extract Table Data

```typescript
import type { Root, Table, TableRow, TableCell } from 'mdast'
import { remark } from 'remark'
import remarkGfm from 'remark-gfm'
import { visit } from 'unist-util-visit'
import { toString } from 'mdast-util-to-string'

function extractTables(markdown: string): Array<string[][]> {
  const processor = remark().use(remarkGfm)
  const tree = processor.parse(markdown) as Root
  const tables: string[][] = []

  visit(tree, 'table', (table: Table) => {
    const rows: string[][] = []

    table.children.forEach((row: TableRow) => {
      const cells: string[] = []
      row.children.forEach((cell: TableCell) => {
        cells.push(toString(cell))
      })
      rows.push(cells)
    })

    tables.push(rows)
  })

  return tables
}

// Usage
const md = `
| Name | Age |
|------|-----|
| Alice| 30  |
| Bob  | 25  |
`

const tables = extractTables(md)
console.log(tables)
// Output: [[['Name', 'Age'], ['Alice', '30'], ['Bob', '25']]]
```

### Example 3: Transform Strikethrough to HTML Comments

```typescript
import type { Root, Delete } from 'mdast'
import { remark } from 'remark'
import remarkGfm from 'remark-gfm'
import remarkRehype from 'remark-rehype'
import rehypeStringify from 'rehype-stringify'
import { visit } from 'unist-util-visit'

function transformStrikethrough(markdown: string): string {
  const processor = remark()
    .use(remarkGfm)
    .use(() => {
      return (tree: Root) => {
        visit(tree, 'delete', (node: Delete) => {
          // Transform delete nodes to custom format
          // This would need proper hast conversion for HTML
          console.log('Found deleted text')
        })
      }
    })
    .use(remarkRehype)
    .use(rehypeStringify)

  return processor.processSync(markdown).toString()
}
```

---

## 9. TypeScript Type Imports Best Practices

### Recommended Import Pattern

```typescript
// Type-only imports (won't be in runtime bundle)
import type { Root, Heading, Paragraph, Text } from 'mdast'
import type { VFile } from 'vfile'

// Runtime imports
import { remark } from 'remark'
import remarkGfm from 'remark-gfm'
import { visit } from 'unist-util-visit'

// This pattern is optimal for bundle size
```

### Registering Extended Types

When using GFM, footnotes, or custom extensions, type registration ensures proper IDE support:

```typescript
/**
 * @typedef {import('remark-gfm')}
 */
/**
 * @typedef {import('remark-footnotes')}
 */

import type { Root, Table, Delete } from 'mdast'
import { remark } from 'remark'
import remarkGfm from 'remark-gfm'

// Now IDE will recognize Table, Delete, etc.
const processor = remark().use(remarkGfm)
```

### Importing GFM Types

```typescript
import type { Delete, FootnoteReference, Table } from 'mdast'

// Available GFM node types in @types/mdast:
// - Table, TableRow, TableCell (with align)
// - Delete (strikethrough)
// - FootnoteReference, FootnoteDefinition
// - TaskListItem (in list items)
```

---

## 10. Deterministic Parsing Guarantees

### CommonMark Specification Compliance

**Remark is 100% compliant with CommonMark**, which was specifically designed to address ambiguities in the original Markdown specification.

**Key Points:**
- **Deterministic:** Same markdown input always produces same AST output
- **Unambiguous:** Clear rules for parsing edge cases (e.g., list nesting, emphasis)
- **Testable:** Official CommonMark spec includes comprehensive test suite
- **Reference:** https://spec.commonmark.org/

### Parsing Guarantees

```typescript
import { remark } from 'remark'
import type { Root } from 'mdast'

const processor = remark()

// Same input → Same output (deterministic)
const md1 = '# Title\n\nContent'
const tree1 = processor.parse(md1) as Root

const md2 = '# Title\n\nContent'
const tree2 = processor.parse(md2) as Root

// tree1 and tree2 are structurally identical
console.log(JSON.stringify(tree1) === JSON.stringify(tree2)) // true
```

### GFM Determinism

When using remark-gfm:
- **100% compliant with GFM spec** (GitHub Flavored Markdown)
- Uses `micromark` for tokenization (deterministic)
- Uses `mdast-util-gfm` for AST conversion

```typescript
import { remark } from 'remark'
import remarkGfm from 'remark-gfm'
import type { Root } from 'mdast'

const processor = remark().use(remarkGfm)

// GFM parsing is also deterministic
const md = '| Col1 | Col2 |\n|----|----|\n| A | B |'
const ast1 = processor.parse(md) as Root
const ast2 = processor.parse(md) as Root

console.log(JSON.stringify(ast1) === JSON.stringify(ast2)) // true
```

---

## 11. Built-in Types and @types Packages

### @types/mdast Package

```bash
npm install --save-dev @types/mdast
```

**Latest Version:** 4.0.4
**NPM Package:** https://www.npmjs.com/package/@types/mdast
**GitHub:** https://github.com/syntax-tree/mdast

**What's Included:**
- All standard mdast node type definitions
- GFM extension types (tables, strikethrough, footnotes)
- Content type unions (FlowContent, PhrasingContent, etc.)
- Parent/child relationships
- Full TypeScript 5.0+ support

### Built-in Remark Types

Remark packages include native TypeScript definitions (no @types needed):

```typescript
// remark-parse exports
import type { Options as ParseOptions } from 'remark-parse'

// remark-stringify exports
import type { Options as StringifyOptions } from 'remark-stringify'

// remark-gfm exports
import type { Options as GfmOptions } from 'remark-gfm'
```

### Utility Package Types

```bash
# All these have built-in TypeScript support
npm install unist-util-visit          # visit, SKIP, CONTINUE, EXIT
npm install unist-util-visit-parents  # visitParents
npm install mdast-util-to-string      # toString
npm install mdast-util-to-hast        # toHast
```

---

## 12. Complete TypeScript Project Setup

### tsconfig.json

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "ESNext",
    "lib": ["ES2020"],
    "moduleResolution": "node",
    "esModuleInterop": true,
    "allowSyntheticDefaultImports": true,
    "strict": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true,
    "outDir": "./dist",
    "rootDir": "./src",
    "types": ["node"]
  },
  "include": ["src"],
  "exclude": ["node_modules", "dist"]
}
```

### Example Project Structure

```
markdown-project/
├── package.json
├── tsconfig.json
├── src/
│   ├── parser.ts
│   ├── transformer.ts
│   ├── validator.ts
│   └── index.ts
└── tests/
    └── parser.test.ts
```

### Complete Parser Module

```typescript
// src/parser.ts
import type { Root, Heading } from 'mdast'
import { remark } from 'remark'
import remarkGfm from 'remark-gfm'
import remarkStringify from 'remark-stringify'
import { visit } from 'unist-util-visit'
import { toString } from 'mdast-util-to-string'

export interface ParsedDocument {
  ast: Root
  text: string
  headings: Array<{ level: number; text: string }>
}

export class MarkdownParser {
  private processor = remark()
    .use(remarkGfm)
    .use(remarkStringify)

  parse(markdown: string): ParsedDocument {
    const ast = this.processor.parse(markdown) as Root
    const text = toString(ast)
    const headings: Array<{ level: number; text: string }> = []

    visit(ast, 'heading', (node: Heading) => {
      headings.push({
        level: node.depth,
        text: toString(node)
      })
    })

    return { ast, text, headings }
  }

  async processFile(markdown: string): Promise<string> {
    const file = await this.processor.process(markdown)
    return String(file)
  }
}

export default MarkdownParser
```

---

## 13. Key Resources and References

### Official Documentation

- **Unified Main Site:** https://unifiedjs.com
- **Remark Documentation:** https://remark.js.org/
- **GitHub Remark:** https://github.com/remarkjs/remark
- **CommonMark Spec:** https://spec.commonmark.org/
- **GFM Spec:** https://github.github.com/gfm/

### Type Resources

- **@types/mdast:** https://www.npmjs.com/package/@types/mdast
- **mdast GitHub:** https://github.com/syntax-tree/mdast
- **unist-util-visit:** https://unifiedjs.com/explore/package/unist-util-visit/
- **Tree Traversal Recipe:** https://unifiedjs.com/learn/recipe/tree-traversal-typescript/

### GFM Extensions

- **remark-gfm:** https://github.com/remarkjs/remark-gfm
- **mdast-util-gfm:** https://github.com/syntax-tree/mdast-util-gfm
- **micromark-extension-gfm:** https://github.com/micromark/micromark-extension-gfm

### Related Utilities

- **mdast-util-to-string:** Extract text from nodes
- **mdast-util-to-hast:** Convert mdast to hast (HTML AST)
- **unist-util-visit-parents:** Visit with ancestor information
- **remark-rehype:** Bridge to HTML generation

---

## 14. Common Patterns and Recipes

### Pattern 1: Custom Plugin

```typescript
import type { Plugin } from 'unified'
import type { Root } from 'mdast'
import { visit } from 'unist-util-visit'

const myPlugin: Plugin<[], Root> = () => {
  return (tree: Root) => {
    visit(tree, 'heading', (node) => {
      console.log('Processing heading:', node)
    })
  }
}

export default myPlugin
```

### Pattern 2: Chain Multiple Transformations

```typescript
import { remark } from 'remark'
import remarkGfm from 'remark-gfm'
import remarkRehype from 'remark-rehype'
import rehypeHighlight from 'rehype-highlight'
import rehypeSanitize from 'rehype-sanitize'
import rehypeStringify from 'rehype-stringify'

const processor = remark()
  .use(remarkGfm)
  .use(remarkRehype)
  .use(rehypeHighlight)
  .use(rehypeSanitize)
  .use(rehypeStringify)

const result = await processor.process(markdown)
```

### Pattern 3: Extract and Transform

```typescript
import type { Root, Paragraph } from 'mdast'
import { remark } from 'remark'
import { visit } from 'unist-util-visit'

const markdown = 'Text 1\n\nText 2\n\nText 3'
const processor = remark()
const tree = processor.parse(markdown) as Root

const paragraphs: string[] = []
visit(tree, 'paragraph', (node: Paragraph) => {
  const children = node.children
    .map(child => 'value' in child ? child.value : '')
    .join('')
  paragraphs.push(children)
})

console.log(paragraphs) // ['Text 1', 'Text 2', 'Text 3']
```

---

## Summary

This research provides:

1. **Architecture Understanding** - How unified and remark work together
2. **Setup Guide** - Package installation and configuration
3. **Type Safety** - TypeScript integration and best practices
4. **Tree Traversal** - Using unist-util-visit effectively
5. **GFM Support** - Parsing GitHub-flavored markdown
6. **Working Examples** - Real-world TypeScript code patterns
7. **Deterministic Guarantees** - CommonMark compliance ensures consistent parsing
8. **Type References** - Complete @types/mdast package documentation

**Recommended Starting Point:**
Start with Section 4 (Basic Setup) and Section 5 (GFM) for immediate usage, then explore Section 7 (Tree Traversal) for transformation logic.
