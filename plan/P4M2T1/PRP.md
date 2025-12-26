name: "P4.M2.T1: Finalize Build Configuration"
description: |

---

## Goal

**Feature Goal**: Ensure the mdsel CLI package builds cleanly for npm distribution with proper package.json configuration, shebang handling, and executable permissions.

**Deliverable**: Production-ready npm package configuration that builds successfully and can be installed globally via `npm install -g mdsel`.

**Success Definition**:
- `npm run build` completes without errors
- `npm pack` produces a valid tarball with only necessary files
- Built CLI has correct shebang (`#!/usr/bin/env node`) and executable permissions
- `prepublishOnly` hook validates build passes tests before publishing

## Why

- **Distribution Readiness**: Package must be installable via npm for users to consume the CLI tool
- **Clean Artifacts**: Only compiled output should be distributed, not source files
- **Standard Compliance**: Following npm package best practices ensures compatibility with package managers and tools
- **Install Experience**: Proper shebang and permissions enable global CLI installation (`npm install -g mdsel`)

## What

Configure npm package settings for clean distribution build.

### Current Issues Identified

1. **Misconfigured entry points**: `package.json` `main` and `types` point to `./dist/index.mjs` and `./dist/index.d.ts` which don't exist (only `cli.mjs` and `cli.d.ts` are built)
2. **Missing exports field**: No modern `exports` field for ESM package consumers
3. **Hardcoded version**: CLI version is hardcoded in `src/cli/index.ts` instead of reading from `package.json`

### Success Criteria

- [ ] Build produces valid npm package with correct entry points
- [ ] CLI binary has proper shebang and is executable
- [ ] Package tarball contains only `dist/` directory (and README/LICENSE)
- [ ] `npm run build && npm pack` succeeds without errors
- [ ] `prepublishOnly` hook validates code quality before publish

## All Needed Context

### Documentation & References

```yaml
# MUST READ - Package configuration references
- url: https://docs.npmjs.com/cli/v10/configuring-npm/package-json#bin
  why: Understanding the bin field for CLI executables
  critical: npm automatically handles executable permissions for bin entries

- url: https://docs.npmjs.com/cli/v10/configuring-npm/package-json#files
  why: Understanding what files are included in published packages
  critical: Only dist/ should be included; source files must be excluded

- url: https://tsup.egoist.dev/#banner
  why: tsup banner configuration for shebang injection
  critical: banner.js adds #!/usr/bin/env node to compiled output

- url: https://nodejs.org/api/packages.html#exports
  why: Modern exports field for ESM packages
  critical: Optional but recommended for future compatibility

- file: /home/dustin/projects/mdsel/package.json
  why: Current package configuration to understand what needs fixing
  pattern: bin field is correct; main/types need fixing
  gotcha: main and types point to non-existent files

- file: /home/dustin/projects/mdsel/tsup.config.ts
  why: Current build configuration
  pattern: Banner adds shebang correctly
  gotcha: Only builds CLI, no library exports

- file: /home/dustin/projects/mdsel/src/cli/index.ts
  why: CLI entry point that needs version fix
  pattern: Commander.js CLI structure
  gotcha: Version is hardcoded to '1.0.0'

- docfile: /home/dustin/projects/mdsel/plan/architecture/external_deps.md
  why: Context on why tsup and Commander.js were chosen
  section: CLI Framework section
```

### Current Codebase Tree

```bash
mdsel/
├── coverage/           # Test coverage output (not in package)
├── dist/               # Build output - ONLY this in published package
│   ├── cli.d.ts        # CLI TypeScript declarations
│   ├── cli.mjs         # CLI binary (with shebang)
│   ├── cli.mjs.map     # Source map
│   ├── src/            # Built source modules
│   └── tests/          # Built test modules
├── plan/               # Project planning docs (not in package)
├── src/                # Source files (NOT in package)
│   ├── cli/
│   │   └── index.ts    # CLI entry point
│   ├── lib/            # Library modules
│   ├── lexer/          # Lexer modules
│   ├── output/         # Output formatters
│   ├── parser/         # Parser modules
│   ├── resolver/       # Selector resolver
│   ├── selector/       # Selector types
│   └── utils/          # Utility functions
├── tests/              # Test files (NOT in package)
├── coverage/           # Coverage reports (not in package)
├── eslint.config.js    # ESLint config (not in package)
├── package.json        # Package configuration
├── package-lock.json   # Lock file (not in package)
├── PRD.md              # Product requirements doc (not in package)
├── README.md           # README (auto-included in package)
├── tasks.json          # Task tracking (not in package)
├── tsconfig.json       # TypeScript config (not in package)
├── tsup.config.ts      # tsup build config (not in package)
└── vitest.config.ts    # Vitest config (not in package)
```

### Desired Codebase Tree After Implementation

```bash
# No structural changes - only file modifications:
package.json            # MODIFIED: Fix main/types, add exports
src/cli/index.ts        # MODIFIED: Dynamic version from package.json
```

### Known Gotchas & Library Quirks

```javascript
// CRITICAL: package.json main/types point to non-existent files
// Current: main: "./dist/index.mjs", types: "./dist/index.d.ts"
// Actual files: cli.mjs, cli.d.ts
// Fix: Either remove main/types (CLI-only) or point to cli.mjs/cli.d.ts

// CRITICAL: Version is hardcoded in CLI source
// Current: program.version('1.0.0')
// Fix: Read from package.json at runtime or build time

// GOTCHA: ESM-only approach means Node.js < 16 cannot use this package
// Decision: Acceptable per engines field (>=18.0.0)

// GOTCHA: files: ["dist"] includes everything in dist/
// Make sure no test artifacts end up in dist/

// NOTE: tsup banner.js adds shebang to ALL JS files in entry
// Since we only have one entry (cli), this is correct
// If adding library entries, would need conditional banner
```

## Implementation Blueprint

### Data Models and Structure

No new data models. This task is purely configuration.

### Implementation Tasks (ordered by dependencies)

```yaml
Task 1: MODIFY package.json - Fix entry points
  - FIX: Remove or update "main" field (CLI-only packages don't need main)
  - FIX: Remove or update "types" field
  - DECISION: For CLI-only package, remove both main and types
  - ALTERNATIVE: If keeping, set to "./dist/cli.mjs" and "./dist/cli.d.ts"

Task 2: MODIFY package.json - Add exports field (optional but recommended)
  - ADD: exports field for modern package consumers
  - PATTERN:
    "exports": {
      "./cli": {
        "types": "./dist/cli.d.ts",
        "import": "./dist/cli.mjs"
      }
    }
  - NOTE: This is optional for CLI-only but good practice

Task 3: MODIFY package.json - Add publishConfig (optional)
  - ADD: publishConfig.access: "public" for scoped packages
  - SKIP: If package name is not scoped (@username/package)

Task 4: MODIFY src/cli/index.ts - Dynamic version
  - IMPLEMENT: Read version from package.json instead of hardcoded
  - PATTERN (ESM):
    import { createRequire } from 'module';
    const require = createRequire(import.meta.url);
    const pkg = require('../../package.json');
    program.version(pkg.version);
  - GOTCHA: Relative path from dist/cli/index.js to package.json is ../../

Task 5: VALIDATE - Run build and verify output
  - RUN: npm run build
  - VERIFY: dist/cli.mjs exists and has shebang (head -1 dist/cli.mjs)
  - VERIFY: dist/cli.mjs has execute permissions (ls -la dist/cli.mjs)
  - VERIFY: No build errors

Task 6: VALIDATE - Create test tarball
  - RUN: npm pack
  - VERIFY: Tarball created (mdsel-1.0.0.tgz)
  - VERIFY: tar -tzf mdsel-1.0.0.tgz shows only dist/, README, LICENSE
  - VERIFY: No src/, tests/, or config files in tarball

Task 7: VALIDATE - Test install from tarball
  - RUN: npm install -g ./mdsel-1.0.0.tgz
  - VERIFY: mdsel --version works
  - VERIFY: mdsel --help works
  - CLEANUP: npm uninstall -g mdsel
```

### Implementation Patterns & Key Details

```typescript
// Task 4: Dynamic version pattern
// File: src/cli/index.ts

import { Command } from 'commander';
import { createRequire } from 'module';

// ESM-compatible way to read package.json
const require = createRequire(import.meta.url);
const pkg = require('../../package.json');

const program = new Command();
program
  .name('mdsel')
  .description(pkg.description)  // Also use dynamic description
  .version(pkg.version);          // Dynamic version from package.json
```

```json
// Task 1 & 2: package.json modifications
{
  "name": "mdsel",
  "version": "1.0.0",
  "description": "Declarative Markdown semantic selection CLI for LLM agents",
  "type": "module",
  // REMOVE or UPDATE these fields:
  // "main": "./dist/index.mjs",  // REMOVE (CLI-only doesn't need main)
  // "types": "./dist/index.d.ts", // REMOVE (CLI-only doesn't need types)
  "bin": {
    "mdsel": "./dist/cli.mjs"
  },
  "exports": {
    "./cli": {
      "types": "./dist/cli.d.ts",
      "import": "./dist/cli.mjs"
    }
  },
  "files": ["dist"],
  // ... rest unchanged
}
```

### Integration Points

```yaml
PACKAGE_JSON:
  - modify: package.json
  - fields: main, types, exports (optional)
  - patterns: Follow npm package.json best practices

CLI_ENTRY:
  - modify: src/cli/index.ts
  - change: Dynamic version loading from package.json
  - pattern: ESM createRequire pattern

BUILD_CONFIG:
  - no changes: tsup.config.ts is already correct
  - shebang: Already handled by banner configuration
  - permissions: Already handled by npm install
```

## Validation Loop

### Level 1: Syntax & Style (Immediate Feedback)

```bash
# Run after each file modification
npm run lint           # ESLint check
npm run format:check   # Prettier check
npm run type-check     # TypeScript type checking

# Expected: Zero errors
```

### Level 2: Unit Tests (Component Validation)

```bash
# No new unit tests for this task (configuration only)
# Run existing tests to ensure nothing broke
npm run test:run

# Expected: All existing tests pass
```

### Level 3: Build Validation (System Validation)

```bash
# Clean build
rm -rf dist && npm run build

# Verify build output
ls -la dist/                    # Should show cli.mjs, cli.d.ts, cli.mjs.map
head -1 dist/cli.mjs            # Should show: #!/usr/bin/env node
test -x dist/cli.mjs && echo "Executable" || echo "NOT executable"  # Should print "Executable"

# Verify CLI works
node dist/cli.mjs --version     # Should show: 1.0.0
node dist/cli.mjs --help        # Should show help text

# Expected: All verifications pass
```

### Level 4: Distribution Validation

```bash
# Create test tarball
npm pack

# Verify tarball contents
tar -tzf mdsel-1.0.0.tgz | sort

# Expected output:
# package/
# package/README.md
# package/package.json
# package/dist/
# package/dist/cli.d.ts
# package/dist/cli.mjs
# package/dist/cli.mjs.map

# Verify EXCLUDED (should NOT be in tarball):
# - src/
# - tests/
# - tsconfig.json
# - tsup.config.ts
# - vitest.config.ts
# - eslint.config.js

# Test global install from tarball
npm install -g ./mdsel-1.0.0.tgz
mdsel --version      # Should work and show 1.0.0
mdsel --help         # Should show help
npm uninstall -g mdsel

# Expected: All tests pass, CLI works when installed globally
```

## Final Validation Checklist

### Technical Validation

- [ ] `npm run build` completes without errors
- [ ] `npm pack` produces valid tarball
- [ ] tar -tzf shows only dist/, README, LICENSE in package
- [ ] `npm install -g ./mdsel-1.0.0.tgz` succeeds
- [ ] `mdsel --version` shows correct version after install
- [ ] dist/cli.mjs has shebang as first line
- [ ] dist/cli.mjs has executable permissions (755)
- [ ] `npm run lint` passes
- [ ] `npm run type-check` passes
- [ ] All existing tests still pass

### Feature Validation

- [ ] CLI works when installed globally via npm
- [ ] CLI shows correct version from package.json
- [ ] Only necessary files are included in npm package
- [ ] prepublishOnly hook validates build before publish

### Code Quality Validation

- [ ] No hardcoded version in CLI source
- [ ] package.json follows npm best practices
- [ ] Build is reproducible (clean build produces same output)
- [ ] Source files are excluded from distribution

### Documentation & Deployment

- [ ] README.md still accurate (if it mentions install instructions)
- [ ] No sensitive files in package (keys, tokens, etc.)
- [ ] Package name is available on npm (check before publish)

## Anti-Patterns to Avoid

- Don't include `src/` in the `files` field - only `dist/`
- Don't hardcode version in CLI code - read from package.json
- Don't use `#!/usr/bin/node` - use `#!/usr/bin/env node` for portability
- Don't skip `npm pack` validation - test before publishing
- Don't publish without running full test suite
- Don't forget to verify executable permissions on built CLI
- Don't skip the prepublishOnly hook validation

---

## Confidence Score

**8/10** - One-pass implementation success likelihood

**Reasoning**: This is a straightforward configuration task with well-established patterns. The main risks are:
1. ESM package.json import complexity (mitigated by createRequire pattern)
2. Tarball content verification (catchable with validation steps)

**Dependencies**: None - this task is independent and can be completed in any order with other P4 tasks.
