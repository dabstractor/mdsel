# External Dependencies: mdsel

## Core Dependencies

### Markdown Parsing Stack

| Package | Version | Purpose | npm Weekly Downloads |
|---------|---------|---------|---------------------|
| `unified` | ^11.0.0 | Core processing pipeline | 15M+ |
| `remark-parse` | ^11.0.0 | Markdown → mdast parser | 2.3M |
| `remark-gfm` | ^4.0.0 | GFM extensions (tables, strikethrough) | 1.5M |
| `unist-util-visit` | ^5.0.0 | Tree traversal | 15M+ |
| `unist-util-select` | ^5.0.0 | CSS-like selector queries | 500k+ |

**Why remark/mdast?**
- Industry standard AST format for Markdown
- Explicit `depth` property on headings (1-6)
- Clean separation: parsing → AST → transformation
- Rich ecosystem of utilities
- Deterministic parsing for reproducible selectors

### CLI Framework

| Package | Version | Purpose | npm Weekly Downloads |
|---------|---------|---------|---------------------|
| `commander` | ^12.0.0 | CLI argument parsing, subcommands | 238M |

**Why Commander.js?**
- Natural subcommand structure (`index`, `select`)
- Excellent variadic argument support (`<files...>`)
- Battle-tested (238M weekly downloads)
- Simple JSON output patterns
- Automatic help generation

### Alternative Considered: Citty

| Package | Version | Purpose | npm Weekly Downloads |
|---------|---------|---------|---------------------|
| `citty` | ^0.1.6 | Modern CLI builder | 15M+ |

**Reasons for preferring Commander.js:**
- More mature ecosystem
- Better documentation
- Wider adoption ensures stability
- Citty could be considered for v2 if modern patterns desired

## Development Dependencies

### Build & Transpilation

| Package | Version | Purpose |
|---------|---------|---------|
| `typescript` | ^5.3.0 | Type checking, transpilation |
| `tsup` | ^8.0.0 | Bundle for ESM/CJS output |
| `@types/node` | ^20.0.0 | Node.js type definitions |

### Testing

| Package | Version | Purpose |
|---------|---------|---------|
| `vitest` | ^1.0.0 | Test runner with TypeScript support |
| `@vitest/coverage-v8` | ^1.0.0 | Coverage reporting |

### Code Quality

| Package | Version | Purpose |
|---------|---------|---------|
| `eslint` | ^8.0.0 | Linting |
| `@typescript-eslint/parser` | ^6.0.0 | TypeScript ESLint parser |
| `@typescript-eslint/eslint-plugin` | ^6.0.0 | TypeScript-specific rules |
| `prettier` | ^3.0.0 | Code formatting |

## mdast Node Types Reference

The mdast specification defines these node types relevant to our PRD:

### Block-Level Nodes (Supported)

```typescript
// Heading
interface Heading {
  type: 'heading';
  depth: 1 | 2 | 3 | 4 | 5 | 6;  // ← Explicit hierarchy
  children: PhrasingContent[];
}

// Paragraph
interface Paragraph {
  type: 'paragraph';
  children: PhrasingContent[];
}

// Code (Fenced)
interface Code {
  type: 'code';
  lang?: string;  // Language identifier
  meta?: string;  // Additional info string
  value: string;  // Code content
}

// List
interface List {
  type: 'list';
  ordered?: boolean;
  start?: number;
  spread?: boolean;
  children: ListItem[];
}

// Table (GFM extension)
interface Table {
  type: 'table';
  align?: ('left' | 'right' | 'center' | null)[];
  children: TableRow[];
}

// Blockquote
interface Blockquote {
  type: 'blockquote';
  children: (BlockContent | DefinitionContent)[];
}
```

### Root Node

```typescript
interface Root {
  type: 'root';
  children: RootContent[];
}
```

## Integration Patterns

### Parsing Pipeline

```typescript
import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkGfm from 'remark-gfm';

const processor = unified()
  .use(remarkParse)
  .use(remarkGfm);  // Enables tables

const tree = processor.parse(markdownContent);
processor.runSync(tree);
// tree is now mdast format
```

### Tree Traversal

```typescript
import { visit } from 'unist-util-visit';

visit(tree, 'heading', (node) => {
  // node.depth gives h1-h6 level
  console.log(`h${node.depth}: ${toString(node)}`);
});
```

### Selector Queries (Reference Only)

```typescript
import { selectAll } from 'unist-util-select';

// Get all h2 headings
const h2s = selectAll('heading[depth=2]', tree);

// Get all code blocks
const codeBlocks = selectAll('code', tree);
```

**Note:** We will NOT use `unist-util-select` directly for our selector system. Our PRD defines a custom selector grammar that differs from CSS-like syntax. We will implement our own selector parser and resolver.

## Version Compatibility

### Node.js Requirements

- **Minimum:** Node.js 18.x (for native ESM support)
- **Recommended:** Node.js 20.x LTS or 22.x LTS
- **Reason:** All dependencies are ESM-first in latest versions

### TypeScript Configuration

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "NodeNext",
    "moduleResolution": "NodeNext",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "declaration": true,
    "outDir": "dist"
  }
}
```

## Security Considerations

- **No network access:** Tool is offline-only
- **File system read-only:** Only reads provided markdown files
- **No code execution:** Markdown is parsed but never evaluated
- **Safe dependencies:** All packages from established maintainers
