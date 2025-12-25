# PRP: P1M1 - Project Bootstrap

**Phase 1, Milestone 1 - Foundation Setup for mdsel CLI**

---

## Goal

**Feature Goal**: Establish a production-ready TypeScript/ESM Node.js project structure with build tooling, test framework, and code quality enforcement for the `mdsel` Markdown semantic selection CLI.

**Deliverable**: A fully configured project skeleton ready for feature development with:
- Executable CLI entry point (`mdsel`)
- TypeScript compilation with ESM output
- Test runner with coverage reporting
- Linting and formatting enforcement

**Success Definition**: Running `npm install && npm run build && npm test` completes successfully with zero errors, producing a runnable CLI binary in `dist/`.

---

## Why

- Establishes consistent development environment for all future phases
- Ensures type safety from the start with strict TypeScript
- Provides fast feedback loops via Vitest for TDD approach
- Enforces code quality standards automatically via ESLint + Prettier
- Creates deterministic, reproducible builds for the CLI distribution

---

## What

Create the foundational project infrastructure:

1. **package.json** with ESM module type, dependencies, and npm scripts
2. **tsconfig.json** with NodeNext module system and strict mode
3. **tsup.config.ts** for bundling CLI to distributable format
4. **vitest.config.ts** for test runner with coverage
5. **eslint.config.js** with TypeScript-ESLint flat config
6. **.prettierrc.json** for consistent code formatting
7. **Directory structure** for modular source code organization

### Success Criteria

- [ ] `npm install` completes without errors
- [ ] `npm run build` produces `dist/cli.mjs` with shebang
- [ ] `npm run test` runs Vitest and passes placeholder test
- [ ] `npm run lint` runs ESLint with no errors
- [ ] `npm run format:check` runs Prettier with no formatting issues
- [ ] `node dist/cli.mjs --help` outputs CLI help text
- [ ] TypeScript compiler reports zero type errors

---

## All Needed Context

### Context Completeness Check

_"If someone knew nothing about this codebase, would they have everything needed to implement this successfully?"_ - **YES**, this PRP contains all configuration files, exact versions, and implementation patterns needed.

### Documentation & References

```yaml
# MUST READ - Core configuration patterns
- file: plan/P1M1/research/quick-config-reference.md
  why: Complete tsconfig.json configuration for ESM + NodeNext
  pattern: Use "target": "ES2022", "module": "NodeNext", "moduleResolution": "NodeNext"
  gotcha: All relative imports MUST use .js extension in source files

- file: plan/P1M1/research/TSUP_QUICK_REFERENCE.md
  why: CLI bundler configuration with shebang handling
  pattern: Use banner option for shebang, format esm, target node18
  gotcha: tsup does NOT read tsconfig.json - all options must be in tsup.config.ts

- file: plan/P1M1/research/VITEST_QUICK_START.md
  why: Test runner configuration with TypeScript globals
  pattern: globals: true, environment: 'node', coverage provider 'v8'
  gotcha: Must add "types": ["vitest/globals"] to tsconfig.json

- file: plan/P1M1/research/eslint-quick-reference.md
  why: ESLint flat config with TypeScript-ESLint
  pattern: Use typescript-eslint unified package with strictTypeChecked
  gotcha: Must use import.meta.dirname for tsconfigRootDir

- file: plan/P1M1/research/PRETTIER_QUICK_REFERENCE.md
  why: Code formatting configuration
  pattern: singleQuote: true, semi: true, tabWidth: 2, trailingComma: 'all'
  gotcha: Put "prettier" last in ESLint extends to avoid rule conflicts

- file: plan/architecture/external_deps.md
  why: Verified dependency versions for remark/unified ecosystem
  pattern: unified ^11, remark-parse ^11, remark-gfm ^4, commander ^12
  gotcha: All packages are ESM-first, require Node.js 18+

# Official Documentation URLs
- url: https://www.typescriptlang.org/docs/handbook/esm-node.html
  why: TypeScript ESM in Node.js official guidance
  critical: Must use .js extensions in imports even for .ts source files

- url: https://typescript-eslint.io/getting-started/
  why: TypeScript-ESLint setup for flat config
  critical: Use projectService: true for type-aware linting

- url: https://vitest.dev/config/
  why: Vitest configuration reference
  critical: Coverage requires @vitest/coverage-v8 package

- url: https://tsup.egoist.dev/
  why: tsup bundler documentation
  critical: CLI tools need banner with shebang for executability
```

### Current Codebase Tree

```bash
/home/dustin/projects/mdsel/
├── PRD.md                           # Product requirements (read-only reference)
├── tasks.json                       # Task tracking (read-only reference)
└── plan/
    ├── architecture/
    │   ├── external_deps.md         # Dependency versions
    │   ├── output_format.md
    │   ├── selector_grammar.md
    │   └── system_context.md
    └── P1M1/
        ├── research/                # Research documentation
        │   ├── quick-config-reference.md
        │   ├── typescript-esm-setup.md
        │   ├── TSUP_QUICK_REFERENCE.md
        │   ├── VITEST_QUICK_START.md
        │   ├── eslint-quick-reference.md
        │   ├── PRETTIER_QUICK_REFERENCE.md
        │   └── ...
        ├── RESEARCH_INDEX.md
        └── PRP.md                   # This file
```

### Desired Codebase Tree After P1M1 Completion

```bash
/home/dustin/projects/mdsel/
├── package.json                     # Project manifest with dependencies
├── package-lock.json                # Lock file (generated by npm install)
├── tsconfig.json                    # TypeScript compiler configuration
├── tsup.config.ts                   # Build bundler configuration
├── vitest.config.ts                 # Test runner configuration
├── eslint.config.js                 # ESLint flat config
├── .prettierrc.json                 # Prettier formatting rules
├── .prettierignore                  # Files to skip formatting
├── .gitignore                       # Git ignore patterns
├── src/
│   ├── cli/
│   │   └── index.ts                 # CLI entry point (placeholder)
│   ├── parser/                      # Future: Markdown parser module
│   ├── tree/                        # Future: Semantic tree builder
│   ├── selector/                    # Future: Selector engine
│   └── output/                      # Future: Output formatters
├── tests/
│   ├── setup.ts                     # Test setup file
│   └── placeholder.test.ts          # Placeholder test to verify setup
├── dist/                            # Build output (gitignored)
│   └── cli.mjs                      # Built CLI executable
├── PRD.md
├── tasks.json
└── plan/                            # Existing plan directory
```

### Known Gotchas & Library Quirks

```typescript
// CRITICAL: ESM imports MUST use .js extension even for .ts source files
// TypeScript compiles .ts to .js, so imports must reference output extension
import { parseMarkdown } from './parser/index.js';  // CORRECT
import { parseMarkdown } from './parser/index';     // WRONG - will fail at runtime

// CRITICAL: __dirname and __filename not available in ESM
// Use import.meta helpers instead
import { fileURLToPath } from 'url';
import { dirname } from 'path';
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// CRITICAL: tsup ignores tsconfig.json for build settings
// All target, module, and output settings must be in tsup.config.ts

// CRITICAL: Vitest globals require tsconfig.json types entry
// Add "types": ["vitest/globals", "node"] to compilerOptions

// CRITICAL: ESLint flat config uses import.meta.dirname (Node 20.11+)
// For older Node versions, use dirname(fileURLToPath(import.meta.url))

// GOTCHA: Commander.js async action handlers must return Promise
// Use .action(async () => { ... }) for async operations

// GOTCHA: package.json "type": "module" makes all .js files ESM
// Use .cjs extension for any CommonJS files (e.g., config files for legacy tools)
```

---

## Implementation Blueprint

### Data Models and Structure

This milestone creates configuration files, not data models. The key "models" are the configuration schemas:

```typescript
// package.json structure (validated by npm)
interface PackageJson {
  name: string;              // "mdsel"
  version: string;           // "1.0.0"
  type: "module";            // ESM mode
  bin: Record<string, string>; // CLI entry point
  scripts: Record<string, string>;
  dependencies: Record<string, string>;
  devDependencies: Record<string, string>;
}

// tsconfig.json compilerOptions (TypeScript schema)
interface TsConfigCompilerOptions {
  target: "ES2022";
  module: "NodeNext";
  moduleResolution: "NodeNext";
  outDir: string;
  rootDir: string;
  declaration: boolean;
  strict: boolean;
  // ... see full config below
}
```

### Implementation Tasks (Ordered by Dependencies)

```yaml
Task 1: CREATE package.json
  - IMPLEMENT: Project manifest with ESM configuration
  - NAMING: Package name "mdsel", bin entry "mdsel" → "./dist/cli.mjs"
  - DEPENDENCIES:
    runtime: unified@^11, remark-parse@^11, remark-gfm@^4, unist-util-visit@^5, commander@^12
    dev: typescript@^5.7, tsup@^8, vitest@^2, @vitest/coverage-v8@^2, @types/node@^22
    dev: eslint@^9, typescript-eslint@^8, prettier@^3, eslint-config-prettier@^9
  - SCRIPTS: build, dev, test, test:coverage, lint, lint:fix, format, format:check, type-check
  - PLACEMENT: /package.json
  - VALIDATION: npm install completes without errors

Task 2: CREATE tsconfig.json
  - IMPLEMENT: TypeScript configuration for ESM Node.js
  - FOLLOW pattern: plan/P1M1/research/quick-config-reference.md
  - KEY SETTINGS:
    target: "ES2022"
    module: "NodeNext"
    moduleResolution: "NodeNext"
    strict: true
    declaration: true
    types: ["vitest/globals", "node"]
  - DEPENDENCIES: Task 1 (package.json must exist for npm install)
  - PLACEMENT: /tsconfig.json
  - VALIDATION: npx tsc --noEmit returns zero exit code

Task 3: CREATE directory structure
  - IMPLEMENT: Source and test directories
  - DIRECTORIES:
    src/cli/        # CLI entry point
    src/parser/     # Future: Markdown parser
    src/tree/       # Future: Semantic tree
    src/selector/   # Future: Selector engine
    src/output/     # Future: Output formatters
    tests/          # Test files
  - DEPENDENCIES: Task 2
  - PLACEMENT: /src/, /tests/
  - VALIDATION: ls -la src/ shows all directories

Task 4: CREATE src/cli/index.ts (placeholder)
  - IMPLEMENT: Minimal CLI entry point with Commander.js
  - CONTENT:
    - Shebang comment (#!/usr/bin/env node)
    - Import commander
    - Basic program setup with name, version, description
    - Placeholder "index" command
    - Placeholder "select" command
    - Parse and execute
  - FOLLOW pattern: Commander.js basic setup
  - DEPENDENCIES: Task 3
  - PLACEMENT: /src/cli/index.ts
  - VALIDATION: npx tsx src/cli/index.ts --help shows help

Task 5: CREATE tsup.config.ts
  - IMPLEMENT: Build configuration for CLI bundling
  - FOLLOW pattern: plan/P1M1/research/TSUP_QUICK_REFERENCE.md
  - KEY SETTINGS:
    entry: ['src/cli/index.ts']
    format: ['esm']
    target: 'node18'
    dts: true
    clean: true
    outExtension: { js: '.mjs' }
    banner: { js: '#!/usr/bin/env node' }
  - DEPENDENCIES: Task 4
  - PLACEMENT: /tsup.config.ts
  - VALIDATION: npm run build produces dist/cli.mjs with shebang

Task 6: CREATE vitest.config.ts
  - IMPLEMENT: Test runner configuration
  - FOLLOW pattern: plan/P1M1/research/VITEST_QUICK_START.md
  - KEY SETTINGS:
    globals: true
    environment: 'node'
    include: ['tests/**/*.test.ts', 'src/**/*.test.ts']
    coverage.provider: 'v8'
    coverage.include: ['src/**/*.ts']
    coverage.exclude: ['**/*.test.ts', '**/node_modules/**']
  - DEPENDENCIES: Task 2
  - PLACEMENT: /vitest.config.ts
  - VALIDATION: npm run test runs without config errors

Task 7: CREATE tests/setup.ts
  - IMPLEMENT: Test setup file for global configuration
  - CONTENT: Empty file or minimal setup hooks
  - DEPENDENCIES: Task 6
  - PLACEMENT: /tests/setup.ts

Task 8: CREATE tests/placeholder.test.ts
  - IMPLEMENT: Placeholder test to verify test framework
  - CONTENT:
    describe('Project Setup', () => {
      it('should have working test framework', () => {
        expect(1 + 1).toBe(2);
      });
    });
  - DEPENDENCIES: Task 7
  - PLACEMENT: /tests/placeholder.test.ts
  - VALIDATION: npm run test passes

Task 9: CREATE eslint.config.js
  - IMPLEMENT: ESLint flat config with TypeScript-ESLint
  - FOLLOW pattern: plan/P1M1/research/eslint-quick-reference.md
  - KEY SETTINGS:
    Global ignores: ['dist', 'node_modules', 'coverage', '**/*.d.ts']
    Extends: eslint.configs.recommended, tseslint.configs.strictTypeChecked
    Parser options: projectService: true, tsconfigRootDir: import.meta.dirname
  - DEPENDENCIES: Task 2
  - PLACEMENT: /eslint.config.js
  - VALIDATION: npm run lint runs without config errors

Task 10: CREATE .prettierrc.json
  - IMPLEMENT: Prettier configuration for consistent formatting
  - FOLLOW pattern: plan/P1M1/research/PRETTIER_QUICK_REFERENCE.md
  - KEY SETTINGS:
    semi: true
    singleQuote: true
    tabWidth: 2
    trailingComma: 'all'
    printWidth: 100
    endOfLine: 'lf'
  - DEPENDENCIES: Task 1
  - PLACEMENT: /.prettierrc.json
  - VALIDATION: npm run format:check passes

Task 11: CREATE .prettierignore
  - IMPLEMENT: Files to exclude from Prettier formatting
  - CONTENT:
    dist/
    node_modules/
    coverage/
    *.md
    package-lock.json
  - DEPENDENCIES: Task 10
  - PLACEMENT: /.prettierignore

Task 12: CREATE .gitignore
  - IMPLEMENT: Git ignore patterns
  - CONTENT:
    node_modules/
    dist/
    coverage/
    *.log
    .DS_Store
    *.local
  - DEPENDENCIES: None
  - PLACEMENT: /.gitignore
  - VALIDATION: git status shows expected files only
```

### Implementation Patterns & Key Details

#### package.json (Task 1)

```json
{
  "name": "mdsel",
  "version": "1.0.0",
  "description": "Declarative Markdown semantic selection CLI for LLM agents",
  "type": "module",
  "main": "./dist/index.mjs",
  "types": "./dist/index.d.ts",
  "bin": {
    "mdsel": "./dist/cli.mjs"
  },
  "files": ["dist"],
  "scripts": {
    "build": "tsup",
    "dev": "tsup --watch",
    "test": "vitest",
    "test:run": "vitest run",
    "test:coverage": "vitest run --coverage",
    "lint": "eslint .",
    "lint:fix": "eslint . --fix",
    "format": "prettier --write .",
    "format:check": "prettier --check .",
    "type-check": "tsc --noEmit",
    "prepublishOnly": "npm run build && npm run test:run"
  },
  "keywords": ["markdown", "selector", "cli", "llm", "ast"],
  "author": "",
  "license": "MIT",
  "engines": {
    "node": ">=18.0.0"
  },
  "dependencies": {
    "commander": "^12.1.0",
    "remark-gfm": "^4.0.0",
    "remark-parse": "^11.0.0",
    "unified": "^11.0.5",
    "unist-util-visit": "^5.0.0"
  },
  "devDependencies": {
    "@types/node": "^22.10.2",
    "@vitest/coverage-v8": "^2.1.8",
    "eslint": "^9.17.0",
    "eslint-config-prettier": "^9.1.0",
    "prettier": "^3.4.2",
    "tsup": "^8.3.5",
    "typescript": "^5.7.2",
    "typescript-eslint": "^8.18.2",
    "vitest": "^2.1.8"
  }
}
```

#### tsconfig.json (Task 2)

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "NodeNext",
    "moduleResolution": "NodeNext",
    "outDir": "./dist",
    "rootDir": "./src",
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true,
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    "strictFunctionTypes": true,
    "strictBindCallApply": true,
    "strictPropertyInitialization": true,
    "noImplicitThis": true,
    "useUnknownInCatchVariables": true,
    "alwaysStrict": true,
    "noUncheckedIndexedAccess": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true,
    "esModuleInterop": true,
    "allowSyntheticDefaultImports": true,
    "verbatimModuleSyntax": true,
    "moduleDetection": "force",
    "isolatedModules": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "types": ["vitest/globals", "node"]
  },
  "include": ["src"],
  "exclude": ["node_modules", "dist"]
}
```

#### src/cli/index.ts (Task 4)

```typescript
#!/usr/bin/env node

import { Command } from 'commander';

const program = new Command();

program
  .name('mdsel')
  .description('Declarative Markdown semantic selection CLI for LLM agents')
  .version('1.0.0');

program
  .command('index')
  .description('Parse documents and emit selector inventory')
  .argument('<files...>', 'Markdown files to index')
  .action(async (files: string[]) => {
    // Placeholder - will be implemented in P1.M2
    console.log(JSON.stringify({ status: 'not_implemented', files }, null, 2));
  });

program
  .command('select')
  .description('Retrieve content via selectors')
  .argument('<selector>', 'Selector string')
  .argument('[files...]', 'Markdown files to search')
  .option('--full', 'Bypass truncation and return full content')
  .action(async (selector: string, files: string[], options: { full?: boolean }) => {
    // Placeholder - will be implemented in P2.M2
    console.log(JSON.stringify({ status: 'not_implemented', selector, files, options }, null, 2));
  });

program.parse();
```

#### tsup.config.ts (Task 5)

```typescript
import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/cli/index.ts'],
  format: ['esm'],
  target: 'node18',
  dts: true,
  clean: true,
  sourcemap: true,
  outExtension() {
    return {
      js: '.mjs',
    };
  },
  banner: {
    js: '#!/usr/bin/env node',
  },
});
```

#### vitest.config.ts (Task 6)

```typescript
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    include: ['tests/**/*.test.ts', 'src/**/*.test.ts'],
    exclude: ['node_modules', 'dist'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html', 'json'],
      include: ['src/**/*.ts'],
      exclude: ['**/*.test.ts', '**/*.d.ts', '**/node_modules/**', '**/dist/**'],
    },
  },
});
```

#### eslint.config.js (Task 9)

```javascript
// @ts-check
import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';
import prettier from 'eslint-config-prettier';

export default tseslint.config(
  {
    ignores: ['dist/', 'node_modules/', 'coverage/', '**/*.d.ts', '**/*.mjs'],
  },
  eslint.configs.recommended,
  ...tseslint.configs.strictTypeChecked,
  ...tseslint.configs.stylisticTypeChecked,
  {
    languageOptions: {
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
    rules: {
      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
      ],
    },
  },
  {
    files: ['**/*.js', '**/*.mjs', '**/*.cjs'],
    ...tseslint.configs.disableTypeChecked,
  },
  {
    files: ['**/*.test.ts'],
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-unsafe-assignment': 'off',
      '@typescript-eslint/no-unsafe-member-access': 'off',
    },
  },
  prettier,
);
```

#### .prettierrc.json (Task 10)

```json
{
  "semi": true,
  "singleQuote": true,
  "tabWidth": 2,
  "useTabs": false,
  "trailingComma": "all",
  "printWidth": 100,
  "bracketSpacing": true,
  "arrowParens": "always",
  "endOfLine": "lf"
}
```

#### tests/placeholder.test.ts (Task 8)

```typescript
describe('Project Setup', () => {
  it('should have working test framework', () => {
    expect(1 + 1).toBe(2);
  });

  it('should support async tests', async () => {
    const result = await Promise.resolve(42);
    expect(result).toBe(42);
  });
});
```

### Integration Points

```yaml
NPM:
  - Runs: npm install to fetch all dependencies
  - Creates: package-lock.json with resolved versions
  - Verifies: All peer dependencies satisfied

TYPESCRIPT:
  - Compiler: Validates all TypeScript source files
  - Output: Generates .d.ts declaration files
  - Config: tsconfig.json controls compilation

TSUP:
  - Bundles: src/cli/index.ts → dist/cli.mjs
  - Generates: dist/cli.d.ts for type declarations
  - Adds: Shebang for CLI executability

VITEST:
  - Runs: All *.test.ts files in tests/ and src/
  - Reports: Coverage via v8 provider
  - Globals: describe, it, expect available without imports

ESLINT:
  - Lints: All TypeScript files in project
  - Type-aware: Uses TypeScript project for type checking rules
  - Integrates: With Prettier via eslint-config-prettier

PRETTIER:
  - Formats: All supported files (ts, js, json, etc.)
  - Ignores: dist/, node_modules/, coverage/
  - Enforces: Consistent code style

GIT:
  - Ignores: node_modules/, dist/, coverage/, logs
  - Tracks: All configuration and source files
```

---

## Validation Loop

### Level 1: Syntax & Style (Immediate Feedback)

```bash
# Run after each file creation - fix before proceeding
# Install dependencies first
npm install

# Type checking - verify TypeScript configuration
npm run type-check

# Linting - verify ESLint configuration
npm run lint

# Formatting - verify Prettier configuration
npm run format:check

# Expected: All commands exit with code 0
# If errors: Read output, fix configuration, repeat
```

### Level 2: Unit Tests (Component Validation)

```bash
# Run test suite to verify Vitest configuration
npm run test:run

# Run with coverage report
npm run test:coverage

# Expected output:
# ✓ tests/placeholder.test.ts
#   ✓ Project Setup
#     ✓ should have working test framework
#     ✓ should support async tests
#
# Test Files  1 passed (1)
# Tests       2 passed (2)

# If failing: Check vitest.config.ts and tsconfig.json types
```

### Level 3: Build Validation (System Validation)

```bash
# Build the CLI
npm run build

# Verify output exists with correct shebang
head -n 1 dist/cli.mjs
# Expected: #!/usr/bin/env node

# Verify CLI is executable
node dist/cli.mjs --help
# Expected: Shows help with index and select commands

# Verify CLI version
node dist/cli.mjs --version
# Expected: 1.0.0

# Test placeholder commands
node dist/cli.mjs index file.md
# Expected: {"status":"not_implemented","files":["file.md"]}

node dist/cli.mjs select "heading:h1[0]" file.md
# Expected: {"status":"not_implemented","selector":"heading:h1[0]","files":["file.md"],"options":{}}

# If errors: Check tsup.config.ts, verify entry path, check banner configuration
```

### Level 4: Integration Validation

```bash
# Full validation sequence (run all in order)
npm install && npm run type-check && npm run lint && npm run format:check && npm run test:run && npm run build

# Verify all expected files exist
ls -la package.json tsconfig.json tsup.config.ts vitest.config.ts eslint.config.js .prettierrc.json
ls -la src/cli/index.ts tests/placeholder.test.ts
ls -la dist/cli.mjs dist/cli.d.ts

# Verify git ignore is working
git status --porcelain | grep -v "^?" | wc -l  # Should not show node_modules or dist

# Expected: All commands succeed, all files exist
```

---

## Final Validation Checklist

### Technical Validation

- [ ] All 4 validation levels completed successfully
- [ ] `npm install` completes with no errors or warnings
- [ ] `npm run type-check` reports no TypeScript errors
- [ ] `npm run lint` reports no ESLint errors
- [ ] `npm run format:check` reports no formatting issues
- [ ] `npm run test:run` passes all tests (2/2)
- [ ] `npm run build` produces dist/cli.mjs with shebang

### Feature Validation

- [ ] `node dist/cli.mjs --help` shows usage information
- [ ] `node dist/cli.mjs --version` shows "1.0.0"
- [ ] `node dist/cli.mjs index file.md` returns JSON placeholder
- [ ] `node dist/cli.mjs select "h1[0]" file.md` returns JSON placeholder
- [ ] All placeholder responses are valid JSON

### Code Quality Validation

- [ ] All configuration files follow patterns from research documents
- [ ] Directory structure matches desired codebase tree
- [ ] ESLint uses strictTypeChecked configuration
- [ ] Prettier and ESLint do not conflict (eslint-config-prettier applied)
- [ ] TypeScript strict mode enabled with all strict checks

### Files Created Checklist

- [ ] `/package.json` - Project manifest with all dependencies
- [ ] `/tsconfig.json` - TypeScript compiler configuration
- [ ] `/tsup.config.ts` - Build bundler configuration
- [ ] `/vitest.config.ts` - Test runner configuration
- [ ] `/eslint.config.js` - ESLint flat configuration
- [ ] `/.prettierrc.json` - Prettier formatting rules
- [ ] `/.prettierignore` - Prettier ignore patterns
- [ ] `/.gitignore` - Git ignore patterns
- [ ] `/src/cli/index.ts` - CLI entry point
- [ ] `/tests/setup.ts` - Test setup file
- [ ] `/tests/placeholder.test.ts` - Verification test

---

## Anti-Patterns to Avoid

- Do not use CommonJS (`require`, `module.exports`) - this is an ESM project
- Do not omit `.js` extensions in import paths - ESM requires explicit extensions
- Do not use `__dirname` directly - use `import.meta.dirname` or `fileURLToPath` helper
- Do not skip the `type: "module"` in package.json - required for ESM
- Do not use legacy `.eslintrc.json` - use flat config `eslint.config.js`
- Do not hardcode paths in tsup.config.ts that don't match src structure
- Do not forget to add `vitest/globals` to tsconfig types - tests will fail
- Do not use `project` array in ESLint parser options - use `projectService: true`
- Do not create .d.ts files manually - tsup generates them automatically
- Do not add node_modules, dist, or coverage to git - use .gitignore

---

## Confidence Score

**Implementation Success Likelihood: 9/10**

**Rationale:**
- All configuration patterns are well-documented in research files
- Exact package versions and configuration values provided
- Clear validation steps at each level
- No ambiguous implementation decisions
- Complete file contents provided for all configuration files

**Risk Factors:**
- npm package version drift (minor - pinned versions provided)
- Node.js version compatibility (mitigated by engines field)

---

## Execution Notes

1. **Order matters**: Follow task order strictly due to dependencies
2. **Validate early**: Run validation after each task, not just at the end
3. **Read errors carefully**: Most errors will be configuration issues
4. **Use exact versions**: Copy version strings exactly as provided
5. **ESM everywhere**: All imports use `.js` extension, all files are ESM
