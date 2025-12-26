# npm Package Distribution Best Practices for TypeScript CLI Tools

## Files Field vs .npmignore

### Current Configuration
```json
"files": ["dist"]
```

This is the **recommended approach** over `.npmignore`:
- Explicit whitelist of what to include
- Easier to understand
- Smaller package size by default

### What Gets Included
With `files: ["dist"]`:
- ✓ `dist/cli.mjs` (CLI binary)
- ✓ `dist/cli.d.ts` (TypeScript declarations)
- ✓ `dist/*.map` (Source maps)
- ✓ `dist/src/` (Any source files built to dist)
- ✓ `README.md` (automatically included)
- ✓ `LICENSE` (automatically included)

### What Gets Excluded
- ✗ Source files (`src/`)
- ✗ Test files (`tests/`)
- ✗ Config files (`tsconfig.json`, `vitest.config.ts`)
- ✗ Documentation (except README)
- ✗ Development files

## Build Output Structure

### Current tsup Output
```
dist/
├── cli.mjs         # CLI binary (executable)
├── cli.mjs.map     # Source map
└── cli.d.ts        # TypeScript declarations
```

### Alternative: Library + CLI Structure

If this package were to also export a library:
```
dist/
├── cli.mjs         # CLI binary
├── cli.cjs         # CommonJS version (optional)
├── index.mjs       # Library entry point
├── index.d.ts      # Library types
└── src/            # Transpiled sources (if using splitting)
```

## Dual Package (ESM/CJS) Considerations

### Current Approach: ESM-Only
```json
"type": "module"
```

**Pros:**
- Simpler configuration
- Modern, future-proof
- Smaller package size

**Cons:**
- Older Node.js versions (< 16) can't use it
- Some CommonJS-only tools can't import it

### Adding CJS Support (Optional)

If broader compatibility is needed:

```json
{
  "type": "module",
  "main": "./dist/cli.cjs",
  "module": "./dist/cli.mjs",
  "exports": {
    ".": {
      "require": "./dist/cli.cjs",
      "import": "./dist/cli.mjs"
    }
  }
}
```

tsup config:
```typescript
export default defineConfig({
  entry: ['src/cli/index.ts'],
  format: ['cjs', 'esm'],
  outExtension({ format }) {
    return {
      js: format === 'esm' ? '.mjs' : '.cjs',
    };
  },
});
```

## Package Size Optimization

### Current State
- `dist/cli.mjs` is ~873 bytes (excellent size)
- Dependencies are declared but bundled by user's Node.js

### Best Practices
1. **Don't minify CLI tools** - keep them readable for debugging
2. **Source maps are helpful** - include them
3. **Tree-shaking** - tsup does this by default
4. **External dependencies** - don't bundle node_modules

## Version Management

### Current Issue: Hardcoded Version
```typescript
// src/cli/index.ts
program.version('1.0.0');
```

This version is hardcoded and will get out of sync with package.json.

### Best Practice: Dynamic Version
```typescript
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const pkg = require('../package.json');

program.version(pkg.version);
```

Or use a build-time replacement tool.

## Scripts Validation

### Current Scripts (All Correct)
```json
{
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
}
```

The `prepublishOnly` hook ensures:
1. Code is built before publishing
2. Tests pass before publishing
3. Prevents publishing broken code

## Sources

- [npm files field](https://docs.npmjs.com/cli/v10/configuring-npm/package-json#files)
- [npm publish best practices](https://docs.npmjs.com/cli/v10/commands/npm-publish)
- [tsup documentation](https://tsup.egoist.dev/)
- [Node.js package exports](https://nodejs.org/api/packages.html#packages_exports)
- [ESM vs CJS](https://nodejs.org/api/esm.html#esm_ecmascript_modules)
