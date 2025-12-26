# README Research Document - P4.M2.T2

## Current README Issues

### Critical Problems

1. **Non-existent `paginate` command**
   - Current README describes `mdsel paginate document.md` command
   - Actual CLI has `index` and `select` commands only
   - Must be completely rewritten, not incrementally updated

2. **Misleading feature descriptions**
   - Describes word-based pagination with sentence-aware truncation
   - Describes interactive navigation (n/p/q commands)
   - Describes terminal optimization features
   - None of these exist in the actual implementation

3. **Wrong API surface**
   - Shows PaginationManager, PaginationController classes
   - Shows paginateByWords, paginateBySentences functions
   - These don't exist - actual tool uses selector-based selection

4. **Missing core functionality**
   - No documentation of selector grammar
   - No documentation of `index` command
   - No documentation of `select` command
   - No JSON output format reference

## Required README Sections

Based on npm package best practices and PRD requirements:

1. **Project Header**
   - Name: mdsel
   - Tagline: Declarative Markdown semantic selection CLI for LLM agents
   - Brief description from package.json

2. **Installation**
   - Global install: `npm install -g mdsel`
   - Node version requirement: >=18.0.0
   - ESM module note

3. **Quick Start**
   - Basic index example
   - Basic select example
   - Expected JSON output

4. **Commands**
   - `index` command syntax and output
   - `select` command syntax, arguments, and options
   - Reference to output types

5. **Selectors**
   - Grammar reference (namespace::type[index]?query)
   - Node types table (root, heading:h1-h6, section, block:*)
   - Progressive examples

6. **Output Format**
   - Response envelope structure
   - Index response schema
   - Select response schema
   - Error response structure

7. **Error Handling**
   - Exit codes
   - Error types
   - Suggestions behavior

8. **Development**
   - test, build, lint commands
   - Requirements

## Package.json Metadata Reference

```json
{
  "name": "mdsel",
  "version": "1.0.0",
  "description": "Declarative Markdown semantic selection CLI for LLM agents",
  "type": "module",
  "bin": {
    "mdsel": "./dist/cli.mjs"
  },
  "engines": {
    "node": ">=18.0.0"
  },
  "keywords": [
    "markdown",
    "selector",
    "cli",
    "llm",
    "ast"
  ]
}
```

## CLI Command Reference (from src/cli/index.ts)

### index command
```typescript
program
  .command('index')
  .description('Parse documents and emit selector inventory')
  .argument('<files...>', 'Markdown files to index')
```

### select command
```typescript
program
  .command('select')
  .description('Retrieve content via selectors')
  .argument('<selector>', 'Selector string')
  .argument('[files...]', 'Markdown files to search')
  .option('--full', 'Bypass truncation and return full content')
```

## Selector Node Types (from src/selector/types.ts)

### Heading levels
- h1, h2, h3, h4, h5, h6

### Block types
- paragraph
- list
- code
- table
- blockquote

### Node types
- root
- heading:h1-h6
- section
- block:paragraph, block:list, block:code, block:table, block:blockquote
- page (virtual pagination)

## npm README Best Practices

Research findings from popular CLI tools:

1. **Start with what it is** - Clear description in first paragraph
2. **Show installation immediately** - Users need to know how to install
3. **Quick start with examples** - Copy-pasteable commands
4. **Progressive complexity** - Basic to advanced
5. **Link to docs for details** - Keep README focused
6. **Include badges** - Version, CI status (optional)
7. **Show output format** - Especially important for JSON APIs
8. **Document errors** - Error codes and responses

## Reference READMEs

Similar CLI tools for inspiration:
- GitHub CLI (gh) - Clean structure, JSON output docs
- jq - Minimal examples, clear output format
- AWS CLI - Command reference, output types

## Target Audience

**Primary**: LLM agents integrating mdsel into document processing workflows

**Secondary**: Developers building document processing pipelines

**Use Case**: Extract specific sections from Markdown without loading entire files into context

## Success Criteria

- README describes `index` and `select` commands (not `paginate`)
- Selector grammar examples match implementation
- JSON output examples match types
- Installation instructions work
- All examples are copy-paste executable
- Error codes and response formats documented
