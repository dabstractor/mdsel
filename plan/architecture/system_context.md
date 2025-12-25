# System Context: mdsel - Markdown Semantic Selection CLI

## Project Overview

**mdsel** is a declarative, semantic, path-based selection CLI for Markdown documents, optimized for LLM agent consumption and token efficiency.

## Current Codebase State

**Status:** Greenfield project - no existing code

- **Git Repository:** Initialized with single commit (PRD.md only)
- **Language:** Not yet selected (recommended: TypeScript/Node.js)
- **Dependencies:** None installed
- **Test Framework:** Not configured
- **Build System:** Not configured

## Architecture Decisions

### Technology Stack (Recommended)

| Component | Technology | Justification |
|-----------|------------|---------------|
| **Runtime** | Node.js 20+ LTS | Mature ecosystem, excellent for CLI tools |
| **Language** | TypeScript 5.3+ | Type safety, better tooling, LLM-friendly |
| **Markdown Parser** | remark + mdast | Industry standard AST format, explicit hierarchy |
| **CLI Framework** | Commander.js | Proven reliability, natural subcommand structure |
| **Test Framework** | Vitest | Fast, modern, excellent TypeScript support |
| **Build** | tsup | Simple bundling, ESM/CJS dual output |

### Core Design Principles

1. **Declarative Selection First** - All content accessed via selectors, no conversational state
2. **Path-Based Reproducibility** - Deterministic selectors for given document order
3. **LLM-Optimized Output** - Strict JSON, minimal verbosity, machine-readable
4. **Zero Summarization** - Raw document text only, mechanical truncation

## System Boundaries

### In Scope
- Markdown parsing to semantic tree (mdast)
- Path-based selector system
- CLI interface (`index`, `select` commands)
- JSON output formatting
- Truncation and pagination
- Soft failure handling with suggestions

### Out of Scope
- Summarization or semantic interpretation
- Cross-document inference
- Inline selection (only block-level)
- Token accounting
- State persistence
- Human-oriented UX

## Node Type Mapping

| PRD Node Type | mdast Node Type | Selector Format |
|---------------|-----------------|-----------------|
| `root` | `root` | `root` |
| `heading:h1`-`heading:h6` | `heading` (depth 1-6) | `heading:h{n}[index]` |
| `section` | Virtual (heading + descendants) | `section[index]` |
| `block:paragraph` | `paragraph` | `block:paragraph[index]` |
| `block:list` | `list` | `block:list[index]` |
| `block:code` | `code` | `block:code[index]` |
| `block:table` | `table` | `block:table[index]` |
| `block:blockquote` | `blockquote` | `block:blockquote[index]` |

## Data Flow

```
Input Files (.md)
      │
      ▼
┌─────────────────────────────────────┐
│        Markdown Parser              │
│    (remark-parse + remark-gfm)      │
└─────────────────────────────────────┘
      │
      ▼ mdast AST
┌─────────────────────────────────────┐
│       Semantic Tree Builder         │
│   (converts mdast → selector tree)  │
└─────────────────────────────────────┘
      │
      ▼ SemanticTree
┌─────────────────────────────────────┐
│        Selector Engine              │
│ (parse selectors, resolve to nodes) │
└─────────────────────────────────────┘
      │
      ▼
┌─────────────────────────────────────┐
│      Output Formatter               │
│  (JSON serialization, truncation)   │
└─────────────────────────────────────┘
      │
      ▼
stdout (JSON)
```

## API Contract

### CLI Commands

```bash
# Index: emit selector inventory
mdsel index <file1.md> [file2.md ...]

# Select: retrieve content via selectors
mdsel select <selector> [--full]
mdsel select "doc::heading:h2[1]/block:code[0]"
```

### JSON Output Schema

```typescript
interface CLIResponse<T = unknown> {
  success: boolean;
  command: 'index' | 'select';
  timestamp: string;  // ISO 8601
  data: T;
  partial_results?: unknown[];
  unresolved_selectors?: string[];
  warnings?: string[];
  errors?: ErrorEntry[];
}

interface ErrorEntry {
  file?: string;
  selector?: string;
  type: string;
  message: string;
  code: string;
  suggestions?: string[];
}
```

## Configuration

### Environment Variables (Planned)

| Variable | Purpose | Default |
|----------|---------|---------|
| `MDSEL_MAX_WORDS` | Truncation threshold | 500 |
| `MDSEL_PAGE_SIZE` | Pagination page size | 100 |

### Default Settings

- `MAX_WORDS`: 500 (truncation threshold)
- Page size: 100 words per virtual page
- Index ordinals: 0-based
- Selector format: `namespace::path/to/node[index]`
