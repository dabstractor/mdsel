# PRP: P4.M2.T2 - Create Minimal Documentation

---

## Goal

**Feature Goal**: Replace the outdated README.md with accurate, minimal npm package documentation that enables users to understand and use the mdsel CLI tool effectively.

**Deliverable**: A new README.md file at the project root containing:
- Clear project description aligned with PRD
- Installation instructions
- Usage examples for `index` and `select` commands
- Selector grammar reference
- JSON output format documentation
- Error handling and exit codes

**Success Definition**:
- README accurately describes the actual CLI behavior (not the outdated pagination content)
- All examples use correct command syntax (`mdsel index` and `mdsel select`)
- Selector grammar examples match the implementation in `src/selector/`
- JSON output examples match the types in `src/output/types.ts`
- User can install and run basic commands from documentation alone

## User Persona

**Target User**: LLM agents and developers integrating mdsel into document processing workflows.

**Use Case**: An LLM agent needs to extract specific sections from Markdown documentation without loading entire files into context.

**User Journey**:
1. User installs mdsel via npm
2. User runs `mdsel index` on a document to discover available selectors
3. User runs `mdsel select` with a selector to retrieve specific content
4. User receives structured JSON output for further processing

**Pain Points Addressed**:
- Current README describes non-existent pagination features
- No clear documentation of selector syntax
- Missing JSON output format reference
- No error handling guidance

## Why

- **npm Publication**: The package is configured for distribution with `bin.mdsel` pointing to `./dist/cli.mjs`
- **Developer Adoption**: Users need clear documentation to integrate mdsel into their workflows
- **LLM Integration**: The tool is designed for LLM consumption; documentation must be precise and machine-readable in concept
- **Maintenance**: Current README is misleading with pagination features that don't exist

## What

Replace the content of `README.md` with minimal, accurate documentation including:

### Success Criteria

- [ ] README describes `index` and `select` commands (not `paginate`)
- [ ] Selector grammar examples match `src/selector/types.ts` implementation
- [ ] JSON output examples match `src/output/types.ts` interfaces
- [ ] Installation instructions work with `npm install -g mdsel`
- [ ] All examples are copy-paste executable
- [ ] Error codes and response formats are documented

## All Needed Context

### Context Completeness Check

*"If someone knew nothing about this codebase, would they have everything needed to implement this successfully?"*

**Yes** - This PRP provides:
- Exact command syntax from `src/cli/index.ts`
- Selector grammar from `src/selector/types.ts`
- JSON output schemas from `src/output/types.ts`
- Package metadata from `package.json`

### Documentation & References

```yaml
# MUST READ - Include these in your context window
- file: README.md
  why: Current content to understand what needs to be replaced
  pattern: Outdated pagination content that doesn't match PRD
  gotcha: Current README describes `paginate` command that doesn't exist

- file: PRD.md
  why: Single source of truth for product requirements
  section: Sections 5-9 cover selector system, CLI surface, output format
  critical: Tool is for LLM agents, not humans - declarative selection only

- file: package.json
  why: npm package metadata for installation instructions
  pattern: bin.mdsel, keywords, description, engines.node
  critical: Node >=18.0.0 required, ESM module

- file: src/cli/index.ts
  why: Exact command definitions and arguments
  pattern: program.command('index'), program.command('select')
  critical: select accepts --full option

- file: src/output/types.ts
  why: Complete JSON response schema definitions
  pattern: CLIResponse, IndexResponse, SelectResponse, ErrorEntry
  critical: All responses include success, command, timestamp fields

- file: src/selector/types.ts
  why: Selector grammar token types and node types
  pattern: TokenType enum, SelectorNodeType enum, HeadingLevel, BlockType
  critical: Valid heading levels are h1-h6, block types are paragraph|list|code|table|blockquote

- docfile: plan/architecture/selector_grammar.md
  why: Detailed selector syntax and examples
  section: Full grammar specification with namespace, path composition, query params

- docfile: plan/architecture/output_format.md
  why: JSON output design rationale
  section: Response envelope structure, ISO 8601 timestamps

- docfile: plan/docs/JSON_OUTPUT_GUIDE.md
  why: Comprehensive JSON output format documentation
  section: null field handling, timestamp format, error response structure
```

### Current Codebase Tree

```bash
/home/dustin/projects/mdsel/
├── README.md              # TO BE REPLACED - outdated pagination content
├── package.json           # npm package config with bin entry
├── PRD.md                 # Product requirements
├── tsconfig.json          # TypeScript config
├── tsup.config.ts         # Build config
├── src/
│   ├── cli/
│   │   └── index.ts       # CLI entry point with index/select commands
│   ├── selector/
│   │   ├── types.ts       # Selector AST and token types
│   │   ├── tokenizer.ts   # Lexical analysis
│   │   └── parser.ts      # Selector parsing
│   ├── resolver/
│   │   └── resolver.ts    # Selector resolution with suggestions
│   ├── parser/
│   │   └── markdown.ts    # Markdown to semantic tree
│   ├── output/
│   │   ├── types.ts       # Response type definitions
│   │   ├── formatters.ts  # Response formatting functions
│   │   └── utils.ts       # Timestamp and utility functions
│   └── tree/
│       └── builder.ts     # Semantic tree construction
├── tests/                 # Test suite
└── plan/                  # Planning documents
```

### Desired Codebase Tree

```bash
/home/dustin/projects/mdsel/
├── README.md              # NEW - accurate minimal documentation
│   ├── Project description (from PRD)
│   ├── Installation (npm install -g mdsel)
│   ├── Quick Start (index + select examples)
│   ├── Commands (index, select with options)
│   ├── Selectors (grammar reference)
│   ├── Output Format (JSON schemas)
│   ├── Error Handling (exit codes, error responses)
│   ├── Development (test, build, lint)
│   └── License
```

### Known Gotchas & Library Quirks

```markdown
# CRITICAL: Current README is completely outdated
# - Describes `paginate` command that doesn't exist
# - Describes interactive features that aren't implemented
# - Must be completely rewritten, not incrementally updated

# CRITICAL: This is an ESM-only package
# - package.json has "type": "module"
# - Cannot be used with require() - only import

# CRITICAL: CLI entry point is ./dist/cli.mjs
# - Build must run before CLI can be used: npm run build
# - prepublishOnly hook ensures build + test before publish

# CRITICAL: Selector syntax is specific
# - Heading levels: h1, h2, h3, h4, h5, h6 (NOT h0, h7+)
# - Block types: paragraph, list, code, table, blockquote
# - Index is 0-based ordinal among siblings
# - Namespace is optional, defaults to all documents

# CRITICAL: JSON output is strict
# - All responses include: success, command, timestamp
# - Timestamp is ISO 8601 format
# - Errors are arrays, never single objects
# - null fields are omitted from output (see JSON_OUTPUT_GUIDE.md)
```

## Implementation Blueprint

### README Structure and Content

The README follows the minimal npm documentation pattern:

```markdown
# mdsel

[Description from package.json and PRD]

## Installation

npm install -g mdsel

## Quick Start

[Basic index and select examples]

## Commands

### index
[Command syntax, arguments, output]

### select
[Command syntax, arguments, options, output]

## Selectors

[Grammar reference with examples]

## Output Format

[JSON schema examples for index/select/error responses]

## Error Handling

[Exit codes, error response format]

## Development

[test, build, lint commands]

## License

MIT
```

### Implementation Tasks

```yaml
Task 1: CREATE plan/P4M2T2/research/README_RESEARCH.md
  - DOCUMENT: Current README issues (pagination content, wrong commands)
  - DOCUMENT: Required sections for npm README
  - REFERENCE: package.json for bin, description, keywords
  - RESEARCH: npm docs for README best practices
  - STORE: Links to reference READMEs from similar CLI tools

Task 2: CREATE plan/P4M2T2/research/SELECTOR_GRAMMAR_EXAMPLES.md
  - EXTRACT: All valid node types from src/selector/types.ts
  - DOCUMENT: Heading levels (h1-h6), Block types, Index semantics
  - CREATE: Example selectors for each node type
  - REFERENCE: plan/architecture/selector_grammar.md for syntax rules
  - INCLUDE: Namespace, path composition, query parameter examples

Task 3: CREATE plan/P4M2T2/research/JSON_OUTPUT_EXAMPLES.md
  - EXTRACT: Response types from src/output/types.ts
  - CREATE: Example index response with all fields populated
  - CREATE: Example select response with matches and pagination
  - CREATE: Example error response with suggestions
  - VERIFY: Examples match formatters in src/output/formatters.ts

Task 4: WRITE README.md - Header and Installation
  - TITLE: "# mdsel" - use package.json name
  - DESCRIPTION: From package.json: "Declarative Markdown semantic selection CLI for LLM agents"
  - BADGES: (Optional) npm version, build status if CI configured
  - INSTALL: Show global install with npm install -g mdsel
  - REQUIREMENTS: Node >=18.0.0 from package.json engines

Task 5: WRITE README.md - Quick Start
  - EXAMPLE 1: Basic index command showing JSON structure overview
  - EXAMPLE 2: Basic select command retrieving a heading
  - EXAMPLE 3: Multi-file index example
  - OUTPUT: Show abbreviated JSON output for each example

Task 6: WRITE README.md - Commands Section
  - SUBSECTION: index command
    * Syntax: mdsel index <file...>
    * Description: From src/cli/index.ts program.command('index').description()
    * Output: Reference IndexResponse from src/output/types.ts
  - SUBSECTION: select command
    * Syntax: mdsel select <selector> [file...]
    * Options: --full flag description
    * Output: Reference SelectResponse from src/output/types.ts

Task 7: WRITE README.md - Selectors Reference
  - SYNTAX: namespace::type[index]?query format
  - NODE TYPES TABLE: From src/selector/types.ts
    * root, heading:h1-h6, section, block:paragraph, block:list, block:code, block:table, block:blockquote
  - EXAMPLES: Progressive complexity
    * root
    * heading:h1[0]
    * docs::heading:h2[1]
    * section[0]/block:code[0]
    * heading:h2[0]?full=true

Task 8: WRITE README.md - Output Format Section
  - RESPONSE ENVELOPE: CLIResponse fields (success, command, timestamp, data, errors)
  - INDEX RESPONSE: IndexResponse schema with example
  - SELECT RESPONSE: SelectResponse schema with example
  - ERROR RESPONSE: ErrorEntry schema with example
  - NOTE: ISO 8601 timestamps, null field omission

Task 9: WRITE README.md - Error Handling
  - EXIT CODES: 0=success, 1=error, 2=usage error (standard CLI conventions)
  - ERROR TYPES: From src/output/types.ts ErrorType enum
  - SUGGESTIONS: Explain fuzzy matching behavior
  - EXAMPLE: Error response with suggestions array

Task 10: WRITE README.md - Development Section
  - SCRIPTS: From package.json scripts section
    * npm test - Run tests
    * npm run build - Build project
    * npm run lint - Lint code
    * npm run format - Format code
  - REQUIREMENTS: Node >=18.0.0, npm

Task 11: VALIDATE README.md
  - CHECK: All command examples use correct syntax (index/select, not paginate)
  - CHECK: All selector examples use valid types from src/selector/types.ts
  - CHECK: All JSON examples match types from src/output/types.ts
  - CHECK: Installation instructions work (npm install -g . for local testing)
  - CHECK: Links and references are accurate
  - FIX: Any discrepancies between README and implementation
```

### Implementation Patterns & Key Details

```markdown
# README Section Order (progressive disclosure)
1. What is it? (Description)
2. How do I get it? (Installation)
3. How do I use it? (Quick Start)
4. What else can I do? (Commands detailed reference)
5. How do I select specific content? (Selectors)
6. What does the output look like? (Output Format)
7. What if something goes wrong? (Error Handling)
8. How do I contribute? (Development)

# Code Block Formatting
# - Use bash for commands: ```bash
# - Use json for output: ```json
# - Use typescript for type references: ```typescript

# Selector Examples Pattern
# Start simple, add complexity progressively:
# 1. Single node: root
# 2. Indexed node: heading:h1[0]
# 3. Namespaced: docs::heading:h2[1]
# 4. Path composition: section[0]/block:code[0]
# 5. Query params: heading:h2[0]?full=true

# JSON Output Pattern
# - Show full structure for index response (it's the overview)
# - Show partial structure for select response (focus on matches)
# - Show error case with suggestions
# - Use realistic content, not "foo/bar" placeholders
```

### Integration Points

```yaml
PACKAGE_JSON:
  - reference: package.json for version, description, bin entry
  - ensure: README examples work with "mdsel" command from bin field

CLI_IMPLEMENTATION:
  - reference: src/cli/index.ts for exact command syntax
  - ensure: select --full option is documented

OUTPUT_TYPES:
  - reference: src/output/types.ts for JSON schemas
  - ensure: All response fields are documented

SELECTOR_TYPES:
  - reference: src/selector/types.ts for valid node types
  - ensure: Heading levels h1-h6, block types list is complete

PRD_ALIGNMENT:
  - reference: PRD.md sections 5-9 for selector system, output format
  - ensure: README matches product requirements, not old assumptions
```

## Validation Loop

### Level 1: Content Verification (Immediate)

```bash
# Verify README describes correct commands
grep -E "(mdsel index|mdsel select)" README.md | head -5

# Verify old paginate command is not mentioned
grep -i paginate README.md
# Expected: No results (exit code 1)

# Verify selector types match implementation
grep -oE "heading:h[1-6]|block:(paragraph|list|code|table|blockquote)" README.md | sort -u

# Verify Node version requirement matches package.json
grep -E "node.*>=.*18" README.md
```

### Level 2: Syntax and Link Validation

```bash
# Test all code blocks are properly formatted
# (Manual check: ensure all ```bash, ```json tags are closed)

# Verify package.json fields match README
node -e "const pkg=require('./package.json'); console.log('Description:', pkg.description); console.log('Bin:', Object.keys(pkg.bin)); console.log('Node version:', pkg.engines.node);"

# Expected output matches README content
```

### Level 3: Usability Validation

```bash
# Build the project
npm run build

# Test installation locally (in a clean temp directory)
cd /tmp
mkdir mdsel-test && cd mdsel-test
npm install -g ../mdsel
# Expected: Installation succeeds, mdsel command available

# Test commands from README
mdsel --version
mdsel --help
mdsel index ../mdsel/README.md 2>/dev/null || echo "Expected: index not yet implemented"

# Verify help output matches README documentation
mdsel select --help
# Expected: Shows select command with --full option

# Cleanup
npm uninstall -g mdsel
cd /tmp && rm -rf mdsel-test
```

### Level 4: Documentation Quality Validation

```bash
# Test README rendering on GitHub
# 1. Push README to a branch or fork
# 2. View rendered README.md
# 3. Check: All sections render correctly
# 4. Check: Code blocks have syntax highlighting
# 5. Check: Tables and lists are properly formatted

# Test README with npm registry preview
npm pack --dry-run
# Expected: README would be included in npm package (files: ["dist"] excludes it, but npm auto-includes README)

# Verify JSON examples are valid
# Extract JSON blocks from README and validate with jq
# (Manual: Copy JSON examples to file, run jq . example.json)
```

## Final Validation Checklist

### Technical Validation

- [ ] README describes `index` and `select` commands (not `paginate`)
- [ ] Selector types match `src/selector/types.ts` (h1-h6, paragraph|list|code|table|blockquote)
- [ ] JSON response examples match `src/output/types.ts` interfaces
- [ ] Installation instructions specify Node >=18.0.0
- [ ] All code examples use `mdsel` command from `package.json bin`

### Content Validation

- [ ] Project description matches PRD and package.json
- [ ] Quick start section has working examples
- [ ] Commands section documents `--full` option for select
- [ ] Selectors section has progressive examples
- [ ] Output format shows index/select/error responses
- [ ] Error handling documents exit codes and error types

### Quality Validation

- [ ] No placeholder content (foo, bar, TODO)
- [ ] All examples are copy-paste executable
- [ ] Markdown formatting renders correctly (headings, lists, code blocks)
- [ ] Consistent terminology (selector, namespace, index, type)
- [ ] No deprecated or non-existent features documented

### Integration Validation

- [ ] README aligns with PRD.md sections 5-9
- [ ] Command syntax matches `src/cli/index.ts`
- [ ] Response schemas match `src/output/types.ts`
- [ ] Development commands match `package.json scripts`
- [ ] Package metadata (version, description) is consistent

---

## Anti-Patterns to Avoid

- **Don't document non-existent features**: Current README describes `paginate` command that doesn't exist
- **Don't use placeholder examples**: Use realistic content, not "foo/bar/baz"
- **Don't skip the --full option**: The select command has this flag, document it
- **Don't mix heading levels**: Valid levels are h1-h6 only (h0, h7+ don't exist)
- **Don't assume synchronous output**: All CLI output is JSON, not human-friendly text
- **Don't document interactive features**: This tool is for LLM agents, not interactive use
- **Don't forget error handling**: Document error responses and exit codes
- **Don't use outdated references**: Current README is completely wrong, don't copy from it
