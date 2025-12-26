# P4.M2: Build & Distribution - Prepare for npm publication

---

## Goal

**Feature Goal**: Validate and finalize the mdsel npm package for publication, ensuring all build configuration, distribution settings, and documentation are production-ready.

**Deliverable**: A fully validated npm package that can be published to the npm registry with `npm publish` and installed globally with `npm install -g mdsel`.

**Success Definition**:
- Clean build with no errors or warnings
- Valid npm tarball with correct file contents
- CLI executable with proper shebang and permissions
- All validation checks pass (lint, type-check, tests)
- Documentation is accurate and complete

## User Persona

**Target User**: Node.js developers, LLM agents, and CLI tool users who need to query Markdown documents programmatically.

**Use Case**: Installing the mdsel CLI globally to index and select content from Markdown files via semantic selectors.

**User Journey**:
1. User discovers mdsel via npm or documentation
2. User runs `npm install -g mdsel`
3. User runs `mdsel index README.md` to discover selectors
4. User runs `mdsel select "heading:h2[0]" README.md` to retrieve content
5. User integrates mdsel into their LLM workflows

**Pain Points Addressed**:
- LLM context window limitations: mdsel enables precise content extraction
- Manual Markdown parsing: semantic selectors provide machine-addressable content
- Lack of structured Markdown APIs: JSON output enables programmatic consumption

## Why

- **Distribution Readiness**: Package must be installable via npm for global CLI usage
- **Clean Artifacts**: Only compiled output (`dist/`) should be distributed, not source files
- **Standard Compliance**: Following npm package best practices ensures compatibility
- **Install Experience**: Proper shebang and permissions enable global CLI installation
- **Version Synchronization**: Dynamic version loading from package.json prevents drift
- **Documentation Accuracy**: Users need accurate usage examples and API reference

## What

Validate and finalize npm package configuration for production publication.

### Current State Assessment

The codebase is **already well-configured** for npm distribution. Key configurations in place:

**package.json** (src: package.json:1-64):
- `bin: { "mdsel": "./dist/cli.mjs" }` - Correct CLI binary entry
- `exports: { "./cli": { ... } }` - Modern ESM exports
- `files: ["dist"]` - Clean distribution whitelist
- `engines: { "node": ">=18.0.0" }` - Minimum Node.js version
- `prepublishOnly` hook validates build before publish

**tsup.config.ts** (src: tsup.config.ts:1-18):
- Single entry: `cli: 'src/cli/index.ts'`
- ESM output with `.mjs` extension
- Shebang banner: `#!/usr/bin/env node`
- Source maps and type declarations included

**CLI Entry Point** (src: src/cli/index.ts:1-47):
- Dynamic version loading from package.json (line 10)
- ESM-compatible `createRequire` pattern
- Commander.js CLI framework

**README.md** (src: README.md:1-363):
- Comprehensive installation instructions
- Quick start examples
- Complete selector grammar reference
- JSON output schema documentation
- Error handling and exit codes

### Success Criteria

- [ ] Build completes without errors: `npm run build`
- [ ] All tests pass: `npm run test:run`
- [ ] Linting passes: `npm run lint`
- [ ] Type checking passes: `npm run type-check`
- [ ] Tarball contains only necessary files: `npm pack && tar -tzf`
- [ ] CLI has correct shebang: `head -1 dist/cli.mjs`
- [ ] CLI shows correct version: `mdsel --version`
- [ ] Global install works: `npm install -g ./mdsel-*.tgz`

## All Needed Context

### Context Completeness Check

**"No Prior Knowledge" Test**: If someone knew nothing about this codebase, would they have everything needed?

- [x] Codebase structure understood
- [x] Build configuration patterns documented
- [x] npm package best practices researched
- [x] External documentation URLs provided
- [x] Specific file patterns identified
- [x] Validation commands verified

### Documentation & References

```yaml
# MUST READ - Official npm documentation
- url: https://docs.npmjs.com/cli/v10/configuring-npm/package-json#bin
  why: Understanding bin field for CLI executables
  critical: npm automatically handles executable permissions for bin entries

- url: https://docs.npmjs.com/cli/v10/configuring-npm/package-json#files
  why: Understanding what files are included in published packages
  critical: Only dist/ should be included; source files must be excluded

- url: https://docs.npmjs.com/cli/v10/configuring-npm/package-json#exports
  why: Modern exports field for ESM package consumers
  critical: Provides explicit import paths and subpath exports

- url: https://tsup.egoist.dev/#banner
  why: tsup banner configuration for shebang injection
  section: Banner option
  critical: banner.js adds #!/usr/bin/env node to compiled output

- url: https://nodejs.org/api/packages.html#subpath-exports
  why: Understanding subpath exports for package organization
  critical: Modern ESM packages use exports field for explicit imports

- url: https://docs.npmjs.com/cli/v10/commands/npm-publish
  why: Understanding npm publish process and validation
  section: Description and publish workflow
  critical: prepublishOnly hook runs before publish

- url: https://docs.npmjs.com/cli/v10/commands/npm-pack
  why: Testing package contents before publish
  critical: npm pack creates tarball identical to what gets published

- file: /home/dustin/projects/mdsel/package.json
  why: Current package configuration - all fields are correct
  pattern: bin, exports, files, engines, prepublishOnly
  gotcha: Package is already well-configured; focus on validation

- file: /home/dustin/projects/mdsel/tsup.config.ts
  why: Current build configuration
  pattern: Single entry, ESM format, shebang banner
  gotcha: Banner adds shebang to ALL JS files in entry

- file: /home/dustin/projects/mdsel/src/cli/index.ts
  why: CLI entry point with dynamic version loading
  pattern: createRequire for ESM package.json reading
  gotcha: Path is '../package.json' relative to dist/cli/index.js

- file: /home/dustin/projects/mdsel/README.md
  why: User-facing documentation
  pattern: Installation, quick start, selector grammar, output format
  gotcha: Documentation is already comprehensive and accurate

- docfile: /home/dustin/projects/mdsel/plan/architecture/external_deps.md
  why: Technology stack decisions context
  section: CLI Framework and Build System

- docfile: /home/dustin/projects/mdsel/plan/P4M2T1/PRP.md
  why: Detailed PRP for P4.M2.T1 (Finalize Build Configuration)
  section: Implementation Tasks and Validation Loop

- docfile: /home/dustin/projects/mdsel/npm-cli-best-practices-2024.md
  why: Researched npm CLI best practices
  section: package.json configuration, build validation
```

### Current Codebase Tree

```bash
mdsel/
├── dist/                    # Build output - PUBLISHED to npm
│   ├── cli.d.ts            # TypeScript declarations
│   ├── cli.mjs             # CLI binary (with shebang)
│   ├── cli.mjs.map         # Source map
│   ├── src/                # Built source modules (if any)
│   └── tests/              # Built test modules (should exclude)
├── src/                     # Source files - NOT PUBLISHED
│   ├── cli/
│   │   ├── index.ts        # CLI entry point (dynamic version)
│   │   ├── commands/       # index, select commands
│   │   └── utils/          # exit codes, file reading
│   ├── lexer/              # Selector tokenizer
│   ├── parser/             # Markdown parser (remark)
│   ├── resolver/           # Selector resolution engine
│   ├── selector/           # Selector grammar parser
│   ├── output/             # JSON formatters
│   └── utils/              # Validation utilities
├── tests/                  # Test files - NOT PUBLISHED
│   ├── edge-cases/
│   ├── fixtures/
│   ├── output/
│   ├── parser/
│   ├── resolver/
│   └── selector/
├── plan/                   # Planning docs - NOT PUBLISHED
├── coverage/               # Coverage reports - NOT PUBLISHED
├── package.json            # Package configuration - PUBLISHED
├── tsconfig.json           # TypeScript config - NOT PUBLISHED
├── tsup.config.ts          # Build config - NOT PUBLISHED
├── vitest.config.ts        # Test config - NOT PUBLISHED
├── eslint.config.js        # Lint config - NOT PUBLISHED
└── README.md               # Documentation - PUBLISHED
```

### Desired Codebase Tree (After Implementation)

```bash
# No structural changes needed - configuration is already correct
# Focus is on VALIDATION not implementation

dist/                       # Verified clean build output
├── cli.d.ts               # Verified type definitions
├── cli.mjs                # Verified CLI binary (shebang + executable)
└── cli.mjs.map            # Verified source maps

mdsel-1.0.0.tgz            # Validated npm tarball
```

### Known Gotchas & Library Quirks

```javascript
// CRITICAL: Version path resolution
// File: src/cli/index.ts
// Line: const pkg = require('../package.json')
// This path is relative to dist/cli/index.js (built file)
// After build: dist/cli.mjs -> ../package.json resolves correctly

// CRITICAL: Shebang is added by tsup banner
// File: tsup.config.ts
// Line: banner: { js: '#!/usr/bin/env node' }
// This adds shebang to FIRST LINE of ALL JS files in entry
// Since we only have one entry (cli), this is correct

// GOTCHA: files: ["dist"] includes EVERYTHING in dist/
// Make sure no test artifacts end up in dist/ after build
// Verify with: tar -tzf mdsel-*.tgz

// GOTCHA: ESM-only means Node.js < 16 cannot use this package
// Acceptable per engines field (>=18.0.0)

// GOTCHA: exports field uses "./cli" subpath
// This is intentional for library usage: import * from 'mdsel/cli'
// Main CLI binary is still installed via bin field

// NOTE: prepublishOnly runs on local npm install
// This is correct - validates build before any install
```

## Implementation Blueprint

### Data Models and Structure

No new data models. This milestone is about validation of existing configuration.

### Implementation Tasks (ordered by dependencies)

```yaml
Task 1: VERIFY package.json configuration
  - CHECK: bin field points to existing file: ./dist/cli.mjs
  - CHECK: exports field has correct paths
  - CHECK: files field contains only ["dist"]
  - CHECK: engines field specifies node >=18.0.0
  - CHECK: prepublishOnly hook exists and runs build && test
  - VERIFY: No "main" or "types" fields (CLI-only package)
  - COMMAND: cat package.json | jq '.bin, .exports, .files, .engines'

Task 2: VERIFY tsup.config.ts configuration
  - CHECK: entry: { cli: 'src/cli/index.ts' }
  - CHECK: format: ['esm']
  - CHECK: target: 'node18'
  - CHECK: dts: true
  - CHECK: banner: { js: '#!/usr/bin/env node' }
  - CHECK: outExtension produces .mjs files
  - COMMAND: cat tsup.config.ts

Task 3: VERIFY src/cli/index.ts dynamic version loading
  - CHECK: createRequire(import.meta.url) pattern
  - CHECK: require('../package.json') path (relative to dist/cli/)
  - CHECK: program.version(pkg.version) uses dynamic version
  - CHECK: program.description(pkg.description) uses dynamic description
  - COMMAND: cat src/cli/index.ts | head -20

Task 4: RUN clean build and verify output
  - RUN: rm -rf dist && npm run build
  - VERIFY: dist/cli.mjs exists
  - VERIFY: dist/cli.d.ts exists
  - VERIFY: dist/cli.mjs.map exists
  - VERIFY: First line is shebang: head -1 dist/cli.mjs
  - VERIFY: No build errors or warnings

Task 5: RUN all validation checks
  - RUN: npm run lint
  - RUN: npm run type-check
  - RUN: npm run test:run
  - VERIFY: All checks pass with exit code 0

Task 6: CREATE and validate npm tarball
  - RUN: npm pack
  - VERIFY: mdsel-1.0.0.tgz created
  - RUN: tar -tzf mdsel-1.0.0.tgz | sort
  - VERIFY_CONTAINS: package/dist/cli.mjs
  - VERIFY_CONTAINS: package/dist/cli.d.ts
  - VERIFY_CONTAINS: package/dist/cli.mjs.map
  - VERIFY_CONTAINS: package/README.md
  - VERIFY_CONTAINS: package/package.json
  - VERIFY_EXCLUDES: src/
  - VERIFY_EXCLUDES: tests/
  - VERIFY_EXCLUDES: tsconfig.json
  - VERIFY_EXCLUDES: tsup.config.ts

Task 7: TEST global install from tarball
  - RUN: npm install -g ./mdsel-1.0.0.tgz
  - RUN: mdsel --version
  - EXPECT: "1.0.0"
  - RUN: mdsel --help
  - EXPECT: Help text with index and select commands
  - RUN: mdsel index README.md
  - EXPECT: JSON output with document index
  - CLEANUP: npm uninstall -g mdsel

Task 8: VERIFY README.md accuracy
  - CHECK: Installation instructions are correct
  - CHECK: Command examples match actual CLI
  - CHECK: Selector grammar is accurate
  - CHECK: JSON output schemas are correct
  - CHECK: Error codes are documented
  - COMMAND: grep -E "(npm install|mdsel |heading:|block:)" README.md

Task 9: FINAL validation checklist
  - VERIFY: npm run build (no errors)
  - VERIFY: npm run lint (no errors)
  - VERIFY: npm run type-check (no errors)
  - VERIFY: npm run test:run (all tests pass)
  - VERIFY: npm pack (valid tarball)
  - VERIFY: tar -tzf (correct files only)
  - VERIFY: npm install -g ./mdsel-*.tgz (install works)
  - VERIFY: mdsel --version (correct version)
  - VERIFY: mdsel --help (help text)
```

### Implementation Patterns & Key Details

```bash
# Pattern: Build validation
rm -rf dist && npm run build
# Expected: Clean dist/ with cli.mjs, cli.d.ts, cli.mjs.map
# Gotcha: Watch for any unexpected files in dist/

# Pattern: Shebang verification
head -1 dist/cli.mjs
# Expected: #!/usr/bin/env node
# Gotcha: Must be EXACTLY this format for portability

# Pattern: Tarball inspection
tar -tzf mdsel-1.0.0.tgz | sort
# Expected output:
# package/
# package/dist/
# package/dist/cli.d.ts
# package/dist/cli.mjs
# package/dist/cli.mjs.map
# package/package.json
# package/README.md
# Gotcha: Should NOT contain src/, tests/, or config files

# Pattern: Global install test
npm install -g ./mdsel-1.0.0.tgz
mdsel --version
# Expected: 1.0.0 (from package.json)
# Gotcha: Version must match package.json version

# Pattern: Cleanup after testing
npm uninstall -g mdsel
rm -f mdsel-*.tgz
# Important: Don't leave test artifacts in repository
```

### Integration Points

```yaml
PACKAGE_JSON:
  - status: Already configured correctly
  - fields: bin, exports, files, engines, prepublishOnly
  - validation: Verify all paths point to existing files

BUILD_CONFIG:
  - status: Already configured correctly
  - tool: tsup with ESM output and shebang banner
  - validation: Verify build produces clean dist/

CLI_ENTRY:
  - status: Already configured correctly
  - feature: Dynamic version loading from package.json
  - validation: Test CLI shows correct version

README:
  - status: Already comprehensive and accurate
  - sections: Installation, commands, selectors, output format, errors
  - validation: Verify examples match actual CLI behavior
```

## Validation Loop

### Level 1: Syntax & Style (Immediate Feedback)

```bash
# Run linter - auto-fix any issues
npm run lint
# Expected: No errors, maybe auto-fix warnings

# Check formatting
npm run format:check
# Expected: No formatting issues

# Type checking
npm run type-check
# Expected: No type errors

# If any fail, read output and fix before proceeding
# Expected: All checks pass with exit code 0
```

### Level 2: Unit Tests (Component Validation)

```bash
# Run full test suite
npm run test:run

# Run with coverage
npm run test:coverage

# Expected output:
# Tests:      XX passed, XX total
# Coverage:   XX% statements, XX% branches, XX% functions, XX% lines

# If any tests fail, debug root cause before proceeding
# Expected: All tests pass
```

### Level 3: Build Validation (System Validation)

```bash
# Clean build (remove existing dist first)
rm -rf dist
npm run build

# Verify build output exists
ls -la dist/
# Expected: cli.d.ts, cli.mjs, cli.mjs.map

# Verify shebang is present
head -1 dist/cli.mjs
# Expected: #!/usr/bin/env node

# Verify CLI works directly
node dist/cli.mjs --version
# Expected: 1.0.0

node dist/cli.mjs --help
# Expected: Help text with index and select commands

# Verify CLI can process a file
echo "# Test\n\nHello world" | node dist/cli.mjs index -
# Expected: JSON output with document index

# Expected: All verifications pass
```

### Level 4: Distribution Validation

```bash
# Create test tarball (this is what gets published to npm)
npm pack

# List tarball contents (sorted for readability)
tar -tzf mdsel-1.0.0.tgz | sort

# Expected contents:
# package/
# package/dist/
# package/dist/cli.d.ts
# package/dist/cli.mjs
# package/dist/cli.mjs.map
# package/package.json
# package/README.md

# Verify EXCLUDED (should NOT be present):
# - package/src/
# - package/tests/
# - package/tsconfig.json
# - package/tsup.config.ts
# - package/vitest.config.ts
# - package/eslint.config.js
# - package/plan/
# - package/coverage/

# Check tarball size (should be small, ~50KB)
du -h mdsel-1.0.0.tgz
# Expected: < 100KB

# Test global install from tarball
npm install -g ./mdsel-1.0.0.tgz

# Verify CLI is installed and working
mdsel --version
# Expected: 1.0.0

mdsel --help
# Expected: Help text

# Test with actual file
mdsel index README.md
# Expected: JSON output

# Test select command
mdsel select "heading:h1[0]" README.md
# Expected: JSON output with selected content

# Cleanup
npm uninstall -g mdsel
rm -f mdsel-*.tgz

# Expected: All tests pass, CLI works perfectly when installed globally
```

### Level 5: Pre-Publish Final Checklist

```bash
# Run all validation checks in sequence
npm run build && npm run lint && npm run type-check && npm run test:run

# If all pass, create final tarball
npm pack

# Inspect final tarball one more time
tar -tzf mdsel-1.0.0.tgz | grep -E "^package/dist|^package/README|^package/package"

# Expected output:
# package/dist/cli.d.ts
# package/dist/cli.mjs
# package/dist/cli.mjs.map
# package/README.md
# package/package.json

# Ready to publish!
# npm publish (when ready)
# or with provenance: npm publish --provenance
```

## Final Validation Checklist

### Technical Validation

- [ ] `npm run build` completes without errors or warnings
- [ ] `npm run lint` passes with exit code 0
- [ ] `npm run type-check` passes with exit code 0
- [ ] `npm run test:run` passes all tests
- [ ] `npm pack` produces valid tarball
- [ ] tar -tzf shows only dist/, README, package.json in package
- [ ] dist/cli.mjs has `#!/usr/bin/env node` as first line
- [ ] `npm install -g ./mdsel-*.tgz` succeeds
- [ ] `mdsel --version` shows correct version from package.json
- [ ] `mdsel --help` shows correct command documentation

### Feature Validation

- [ ] CLI works when installed globally via npm
- [ ] CLI version matches package.json version (dynamic loading)
- [ ] Only necessary files are included in npm package
- [ ] prepublishOnly hook runs build and tests
- [ ] `mdsel index` command produces valid JSON output
- [ ] `mdsel select` command produces valid JSON output
- [ ] Error handling works with proper exit codes

### Code Quality Validation

- [ ] No hardcoded version in CLI source code
- [ ] package.json follows npm best practices
- [ ] Build is reproducible (clean build produces same output)
- [ ] Source files (src/, tests/) are excluded from distribution
- [ ] Config files (tsconfig, vitest, eslint) are excluded
- [ ] TypeScript declarations are included for library consumers

### Documentation & Deployment

- [ ] README.md has accurate installation instructions
- [ ] README.md has working quick start examples
- [ ] README.md has complete selector grammar reference
- [ ] README.md has accurate JSON output schema docs
- [ ] README.md has documented error codes and exit codes
- [ ] No sensitive files in package (no .env, keys, tokens)
- [ ] Package name is available on npm (check with `npm view mdsel`)

### Ready for Publication

- [ ] All Level 1-5 validations pass
- [ ] tarball contents verified correct
- [ ] Global install tested and working
- [ ] Documentation reviewed and accurate
- [ ] No blocking issues or warnings

## Anti-Patterns to Avoid

- Don't include `src/` in the `files` field - only `dist/`
- Don't hardcode version in CLI code - read from package.json
- Don't use `#!/usr/bin/node` - use `#!/usr/bin/env node` for portability
- Don't skip `npm pack` validation - always test before publishing
- Don't publish without running full test suite
- Don't forget to verify executable permissions on built CLI
- Don't skip the prepublishOnly hook validation
- Don't include test artifacts in dist/ directory
- Don't publish with build warnings - fix all warnings first
- Don't forget to check package name availability on npm
- Don't modify files in dist/ manually - always rebuild
- Don't use `.npmignore` when `files` field is set

---

## Confidence Score

**9/10** - One-pass implementation success likelihood

**Reasoning**:
- Configuration is already correct and well-established
- Clear validation steps with deterministic outcomes
- Extensive external research and documentation
- Comprehensive test coverage already in place
- Only validation tasks, no new implementation

**Minor Risks**:
- Tarball content verification requires careful inspection
- Global install testing may reveal environment-specific issues
- Package name availability on npm (external dependency)

**Dependencies**: None - this milestone is independent and can proceed once P1-P3 are complete.
