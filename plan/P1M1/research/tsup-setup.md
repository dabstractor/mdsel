# tsup 8.x Configuration Guide for TypeScript Node.js CLI Projects

## Overview

**tsup** is a fast, minimalist TypeScript bundler powered by esbuild. It's designed to bundle TypeScript libraries with minimal configuration while providing excellent support for:

- Multiple output formats (ESM, CommonJS, IIFE)
- TypeScript declaration file generation
- Node.js CLI tools with shebang support
- Tree shaking and minification
- Fast builds via esbuild

**Important Note**: As of 2025, tsup is no longer actively maintained. The maintainers recommend considering **tsdown** as an alternative, though tsup remains widely used (11k+ GitHub stars, 123,000+ projects).

**Official Documentation**: https://tsup.egoist.dev/
**GitHub Repository**: https://github.com/egoist/tsup

---

## 1. tsup Installation

### Basic Setup

```bash
npm install tsup --save-dev
# or
yarn add tsup --dev
# or
pnpm add tsup -D
```

Add build script to `package.json`:

```json
{
  "scripts": {
    "build": "tsup",
    "dev": "tsup --watch"
  }
}
```

---

## 2. Core Configuration Structure (tsup.config.ts)

### Minimal Configuration

```typescript
import { defineConfig } from 'tsup'

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['esm'],
  dts: true,
  clean: true,
})
```

### Complete Configuration Template

```typescript
import { defineConfig } from 'tsup'

export default defineConfig({
  // Entry Points Configuration
  entry: ['src/index.ts', 'src/cli.ts'],

  // Output Format
  format: ['esm', 'cjs'],

  // Target Configuration
  target: 'node18',
  platform: 'node',

  // Declaration Files
  dts: {
    entry: 'src/index.ts',
    resolve: true,
  },

  // Output Directory & Files
  outDir: 'dist',
  clean: true,

  // Bundling Options
  splitting: false,
  bundle: true,
  minify: false,
  sourcemap: true,
  treeshake: true,

  // Output Extensions
  outExtension({ format }) {
    return {
      js: format === 'esm' ? '.mjs' : '.cjs',
    }
  },

  // CLI Banner (for executables)
  banner: {
    js: '#!/usr/bin/env node',
  },

  // External Dependencies (not bundled)
  external: [],

  // Node.js ESM Shims
  shims: true,
})
```

---

## 3. Entry Point Configuration for CLI Tools

### Single CLI Entry Point

```typescript
import { defineConfig } from 'tsup'

export default defineConfig({
  entry: ['src/cli.ts'],
  format: ['esm'],
  target: 'node18',
  dts: true,
  clean: true,
})
```

### Multiple Entry Points (Library + CLI)

```typescript
import { defineConfig } from 'tsup'

export default defineConfig({
  entry: {
    index: 'src/index.ts',      // Library main export
    cli: 'src/bin/cli.ts',      // CLI entry point
  },
  format: ['esm', 'cjs'],
  target: 'node18',
  dts: true,
  clean: true,
})
```

### Entry Point Options

The `entry` option can be:

1. **Array of strings**: Multiple files to bundle separately
   ```typescript
   entry: ['src/index.ts', 'src/cli.ts']
   ```

2. **Object mapping**: Name entries to files
   ```typescript
   entry: {
     index: 'src/index.ts',
     utils: 'src/utils.ts',
   }
   ```

3. **Glob patterns**: All matching files
   ```typescript
   entry: ['src/**/*.ts', '!src/**/*.test.ts']
   ```

---

## 4. ESM Output Format Configuration

### ESM Only

```typescript
export default defineConfig({
  entry: ['src/index.ts'],
  format: ['esm'],
  outExtension({ format }) {
    return {
      js: '.mjs',  // Explicit .mjs extension for ESM
    }
  },
})
```

### Dual ESM/CommonJS

```typescript
export default defineConfig({
  entry: ['src/index.ts'],
  format: ['esm', 'cjs'],
  outExtension({ format }) {
    return {
      js: format === 'esm' ? '.mjs' : '.cjs',
    }
  },
})
```

### Why Use `.mjs` and `.cjs` Extensions?

- **`.mjs`**: Explicitly marks the file as an ES module
- **`.cjs`**: Explicitly marks the file as CommonJS
- Node.js module resolution works correctly regardless of `"type": "module"` in package.json
- Better cross-platform compatibility

---

## 5. Declaration File Generation (dts: true)

### Basic Declaration Generation

```typescript
export default defineConfig({
  entry: ['src/index.ts'],
  dts: true,  // Generates .d.ts files automatically
})
```

### Advanced Declaration Options

```typescript
export default defineConfig({
  entry: ['src/index.ts'],
  dts: {
    entry: 'src/index.ts',      // Specific entry for type declarations
    resolve: true,              // Resolve external types
    compilerOptions: {
      preserveConstEnums: true,
      declaration: true,
      declarationMap: true,     // Generate .d.ts.map for sourcemaps
    },
  },
})
```

### Declaration File Output

For entry point `src/index.ts`:
- Generates: `dist/index.d.ts`
- For dual format: `dist/index.d.ts` (shared), `dist/index.d.mts`, `dist/index.d.cts`

---

## 6. Target Node18+ Configuration

### Node.js 18 Target

```typescript
export default defineConfig({
  target: 'node18',
  platform: 'node',
})
```

### Target Version Reference

Available target versions:
- `'node14'` - Node.js 14.x
- `'node16'` - Node.js 16.x
- `'node18'` - Node.js 18.x (recommended)
- `'node20'` - Node.js 20.x
- `'esnext'` - Latest ECMAScript features

### Important Notes

- **tsup does NOT read `tsconfig.json`** automatically
- Must explicitly set `target` in tsup.config.ts
- Target should match your Node.js version
- Use `node18+` for modern ES2022 features

---

## 7. Clean Output Directory

### Enable Clean

```typescript
export default defineConfig({
  outDir: 'dist',
  clean: true,  // Deletes dist/ before each build
})
```

### Behavior

- First run: Creates output directory and builds
- Subsequent runs: Removes all files in `dist/`, then rebuilds
- Prevents stale files from previous builds

### Important Caveat

If multiple tsup instances use the same `outDir`, the clean step may delete files from other configurations. Solution: Use separate output directories or avoid using `clean: true` with shared directories.

---

## 8. Shebang Preservation for CLI Binaries

### Automatic Shebang Handling

tsup automatically preserves shebangs in source files:

```typescript
// src/cli.ts
#!/usr/bin/env node

import { main } from './index'

main()
```

**Result**: The shebang is preserved in output files and permission bits are set automatically.

### Adding Shebang via Banner

```typescript
export default defineConfig({
  entry: ['src/cli.ts'],
  banner: {
    js: '#!/usr/bin/env node',
  },
})
```

### Recommended Shebang Format

```bash
#!/usr/bin/env node
```

**Why `env`?**
- Universal across different Unix systems
- Doesn't depend on Node.js being at `/usr/bin/node`
- Works with Node version managers (nvm, fnm, etc.)

### Making CLI Executable

After building:

```bash
chmod +x dist/cli.js
```

Or tsup sets this automatically when the source contains a shebang.

---

## 9. Complete CLI Tool Configuration Example

### Directory Structure

```
project/
├── src/
│   ├── index.ts          # Library exports
│   ├── cli.ts            # CLI entry point
│   └── commands/
│       ├── build.ts
│       └── serve.ts
├── tsup.config.ts
├── package.json
└── dist/
    ├── index.mjs/.cjs    # Library outputs
    ├── index.d.ts        # Type declarations
    ├── cli.mjs/.cjs      # CLI executable
    └── cli.d.ts
```

### tsup.config.ts for CLI Tool

```typescript
import { defineConfig } from 'tsup'

export default defineConfig({
  // Multiple entry points
  entry: {
    index: 'src/index.ts',      // Library
    cli: 'src/cli.ts',          // CLI executable
  },

  // Output formats
  format: ['esm', 'cjs'],

  // Target Node.js version
  target: 'node18',
  platform: 'node',

  // TypeScript declarations
  dts: {
    entry: 'src/index.ts',      // Type defs only for library
    resolve: true,
  },

  // Output configuration
  outDir: 'dist',
  clean: true,
  outExtension({ format }) {
    return {
      js: format === 'esm' ? '.mjs' : '.cjs',
    }
  },

  // Bundling options
  splitting: false,             // Single bundle per entry
  bundle: true,
  minify: false,                // For debugging; use true for production
  sourcemap: true,
  treeshake: true,

  // CLI-specific
  banner: {
    js: '#!/usr/bin/env node',
  },
  shims: true,                  // ESM compatibility shims

  // Don't bundle these
  external: ['chalk', 'minimist'],
})
```

### package.json for CLI Tool

```json
{
  "name": "my-cli-tool",
  "version": "1.0.0",
  "type": "module",
  "description": "A TypeScript CLI tool",

  "main": "./dist/index.cjs",
  "module": "./dist/index.mjs",
  "types": "./dist/index.d.ts",

  "bin": {
    "my-cli": "./dist/cli.mjs"
  },

  "exports": {
    ".": {
      "import": {
        "types": "./dist/index.d.ts",
        "default": "./dist/index.mjs"
      },
      "require": {
        "types": "./dist/index.d.ts",
        "default": "./dist/index.cjs"
      }
    },
    "./package.json": "./package.json"
  },

  "scripts": {
    "build": "tsup",
    "dev": "tsup --watch",
    "dev:cli": "node dist/cli.mjs",
    "test": "vitest",
    "lint": "eslint src",
    "prepare": "npm run build"
  },

  "files": [
    "dist"
  ],

  "keywords": ["cli", "typescript"],
  "author": "Your Name",
  "license": "MIT",

  "devDependencies": {
    "tsup": "^8.0.0",
    "typescript": "^5.0.0"
  },

  "dependencies": {
    "chalk": "^5.0.0",
    "minimist": "^1.2.0"
  }
}
```

### TypeScript Source Files

```typescript
// src/index.ts - Library exports
export function formatOutput(text: string): string {
  return text.toUpperCase()
}

export async function processFile(path: string): Promise<string> {
  // Implementation
  return 'processed'
}
```

```typescript
// src/cli.ts - CLI entry point
#!/usr/bin/env node

import * as fs from 'fs/promises'
import * as path from 'path'
import { formatOutput, processFile } from './index'

async function main() {
  const args = process.argv.slice(2)

  if (args.length === 0) {
    console.log('Usage: my-cli <file>')
    process.exit(1)
  }

  try {
    const result = await processFile(args[0])
    console.log(formatOutput(result))
  } catch (error) {
    console.error('Error:', error)
    process.exit(1)
  }
}

main()
```

---

## 10. Development & Build Workflow

### Build Scripts

```json
{
  "scripts": {
    "build": "tsup",
    "dev": "tsup --watch",
    "dev:cli": "node dist/cli.mjs -- --help",
    "prepublishOnly": "npm run build"
  }
}
```

### Development Workflow

```bash
# Watch mode for development
npm run dev

# Test CLI during development
npm run dev:cli

# Full build
npm run build

# Build only (clean, bundle, generate types)
npx tsup
```

### CLI Debugging

```bash
# Run built CLI directly
node dist/cli.mjs

# With Node debugger
node --inspect dist/cli.mjs

# With environment variables
DEBUG=* node dist/cli.mjs
```

---

## 11. Advanced Configuration Options

### Code Splitting

```typescript
export default defineConfig({
  splitting: false,  // No code splitting (single bundle)
  // OR
  splitting: true,   // Split into chunks (for large apps)
})
```

### Minification

```typescript
export default defineConfig({
  minify: false,     // Development
  // OR
  minify: 'terser',  // Production minification

  // Conditional based on environment
  minify: process.env.NODE_ENV === 'production',
})
```

### External Dependencies

```typescript
export default defineConfig({
  // Don't bundle these packages
  external: [
    'chalk',
    'minimist',
    'fs',              // Node.js built-ins
    'path',
  ],
})
```

### Environment-Based Configuration

```typescript
import { defineConfig } from 'tsup'

const isProd = process.env.NODE_ENV === 'production'

export default defineConfig({
  minify: isProd,
  sourcemap: !isProd,
  clean: true,
  dts: true,
  entry: ['src/index.ts'],
  format: ['esm', 'cjs'],
  target: 'node18',
})
```

---

## 12. CLI vs. Configuration File

### Using CLI Only

```bash
tsup src/index.ts --format esm,cjs --target node18 --clean --dts
```

### Using tsup.config.ts

```bash
npx tsup  # Reads tsup.config.ts automatically
```

### Benefits of Configuration File

- Cleaner npm scripts
- Version control-friendly
- Easier to maintain complex configs
- IDE autocompletion with TypeScript

---

## 13. Package.json Integration Example

### Minimal CLI Tool

```json
{
  "name": "minimal-cli",
  "version": "1.0.0",
  "type": "module",
  "bin": "./dist/cli.mjs",
  "scripts": {
    "build": "tsup",
    "dev": "tsup --watch"
  },
  "devDependencies": {
    "tsup": "^8.0.0",
    "typescript": "^5.0.0"
  }
}
```

### Full-Featured Library + CLI

```json
{
  "name": "feature-complete-tool",
  "version": "1.0.0",
  "type": "module",

  "description": "A TypeScript CLI tool and library",
  "main": "./dist/index.cjs",
  "module": "./dist/index.mjs",
  "types": "./dist/index.d.ts",

  "bin": {
    "my-tool": "./dist/cli.mjs"
  },

  "exports": {
    ".": {
      "types": "./dist/index.d.ts",
      "import": "./dist/index.mjs",
      "require": "./dist/index.cjs"
    }
  },

  "files": ["dist"],

  "scripts": {
    "build": "tsup",
    "dev": "tsup --watch",
    "pretest": "npm run build",
    "test": "vitest",
    "prepublishOnly": "npm run test"
  },

  "keywords": ["cli", "typescript"],
  "devDependencies": {
    "tsup": "^8.0.0",
    "typescript": "^5.0.0",
    "vitest": "^0.34.0"
  }
}
```

---

## 14. Common Patterns

### Pattern 1: Simple Library

```typescript
export default defineConfig({
  entry: ['src/index.ts'],
  format: ['esm', 'cjs'],
  dts: true,
  clean: true,
})
```

### Pattern 2: CLI Tool

```typescript
export default defineConfig({
  entry: ['src/cli.ts'],
  format: ['esm'],
  dts: true,
  clean: true,
  banner: { js: '#!/usr/bin/env node' },
})
```

### Pattern 3: Library + CLI

```typescript
export default defineConfig({
  entry: {
    index: 'src/index.ts',
    cli: 'src/cli.ts',
  },
  format: ['esm', 'cjs'],
  dts: { entry: 'src/index.ts' },
  clean: true,
  target: 'node18',
})
```

### Pattern 4: Node.js Backend

```typescript
export default defineConfig({
  entry: ['src/server.ts'],
  format: ['cjs'],
  target: 'node18',
  splitting: false,
  minify: false,
  sourcemap: true,
  dts: true,
})
```

---

## 15. TypeScript Configuration (tsconfig.json)

### Recommended tsconfig.json

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "lib": ["ES2022"],
    "declaration": true,
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "moduleResolution": "node"
  },
  "include": ["src"],
  "exclude": ["node_modules", "dist", "**/*.test.ts"]
}
```

**Note**: tsup doesn't use tsconfig.json for bundling options; always set target and format in tsup.config.ts.

---

## 16. Troubleshooting

### Issue: Files not bundled correctly

**Solution**: Ensure `bundle: true` in config (default).

### Issue: Shebang not preserved

**Solution**: Either add shebang to source file OR use banner option:
```typescript
banner: { js: '#!/usr/bin/env node' }
```

### Issue: Declaration files not generated

**Solution**: Set `dts: true` in config.

### Issue: Wrong target features in output

**Solution**: Don't rely on tsconfig.json. Set `target` explicitly in tsup.config.ts.

### Issue: ESM imports not working

**Solution**:
1. Use `format: ['esm']` or include 'esm' in format array
2. Set `"type": "module"` in package.json
3. Use `.mjs` file extensions

---

## 17. Migration Path & Alternatives

### Note on Project Maintenance

As of 2025, tsup is no longer actively maintained. Consider:

- **Continue using tsup**: Still works well, widely used (123k+ projects)
- **Migrate to tsdown**: Official recommendation from tsup maintainers
- **Alternatives**:
  - esbuild (lower level, more control)
  - Vite (for web projects)
  - Rollup (for libraries)
  - Webpack (for complex builds)

---

## 18. Official Resources & References

### Official Documentation
- **Main Site**: https://tsup.egoist.dev/
- **GitHub**: https://github.com/egoist/tsup
- **npm Package**: https://www.npmjs.com/package/tsup
- **Type Documentation**: https://www.jsdocs.io/package/tsup

### Community Resources
- [Using tsup - LogRocket Blog](https://blog.logrocket.com/tsup/)
- [tsup Guide - Built In](https://builtin.com/articles/tsup)
- [How to Create an npm Package with tsup](https://casperiv.dev/blog/how-to-create-an-npm-package-tsup-esm-cjs-nodejs)
- [Building NPM Packages with tsup - DEV Community](https://dev.to/tigawanna/building-and-publishing-npm-packages-with-typescript-multiple-entry-points-tailwind-tsup-and-npm-9e7)

### Related Topics
- [Node.js Shebang Guide](https://alexewerlof.medium.com/node-shebang-e1d4b02f731d)
- [Creating TypeScript CLI Tools](https://www.skovy.dev/blog/creating-a-cli-with-typescript)
- [Dual Publishing ESM/CJS](https://johnnyreilly.com/dual-publishing-esm-cjs-modules-with-tsup-and-are-the-types-wrong)

---

## Summary & Best Practices

### For CLI Tools:

1. **Use Node.js target**: Set `target: 'node18'` minimum
2. **Include shebang**: Add `#!/usr/bin/env node` to source or use banner option
3. **Generate declarations**: Enable `dts: true` for type support
4. **ESM first**: Use `format: ['esm']` for modern Node.js
5. **Clean builds**: Use `clean: true` to prevent stale files
6. **Configure bin field**: Point to compiled CLI in package.json
7. **Use outExtension**: Explicitly set `.mjs`/`.cjs` extensions

### For Libraries:

1. **Dual publishing**: Support both ESM and CommonJS
2. **Type declarations**: Always generate .d.ts files
3. **External dependencies**: List them to avoid bloating bundle
4. **Tree shaking**: Enable for smaller bundles
5. **Sourcemaps**: Enable for production debugging

### Development Workflow:

1. Use `tsup --watch` during development
2. Test CLI locally with `node dist/cli.mjs`
3. Verify package.json exports and bin field
4. Run full build before publishing
5. Include dist/ in published package via files field

---

## Quick Start Template

```bash
# Create project
mkdir my-cli-tool && cd my-cli-tool
npm init -y
npm install tsup typescript -D

# Create source
mkdir src
echo '#!/usr/bin/env node

console.log("Hello, CLI!")' > src/cli.ts

# Create config
cat > tsup.config.ts << 'EOF'
import { defineConfig } from 'tsup'

export default defineConfig({
  entry: ['src/cli.ts'],
  format: ['esm'],
  target: 'node18',
  dts: true,
  clean: true,
  banner: { js: '#!/usr/bin/env node' },
})
EOF

# Build
npm run build

# Test
node dist/cli.mjs
```

