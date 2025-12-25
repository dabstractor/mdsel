# tsup 8.x Quick Reference for CLI Tools

## One-Minute Setup

```typescript
// tsup.config.ts
import { defineConfig } from 'tsup'

export default defineConfig({
  entry: ['src/cli.ts'],
  format: ['esm'],
  target: 'node18',
  dts: true,
  clean: true,
  banner: { js: '#!/usr/bin/env node' },
})
```

```json
// package.json
{
  "type": "module",
  "bin": "./dist/cli.mjs",
  "scripts": {
    "build": "tsup",
    "dev": "tsup --watch"
  }
}
```

## Essential Configuration Options

| Option | Purpose | Example |
|--------|---------|---------|
| `entry` | Source files to bundle | `['src/cli.ts']` |
| `format` | Output formats | `['esm', 'cjs']` |
| `target` | JavaScript version | `'node18'` |
| `dts` | Generate .d.ts files | `true` |
| `clean` | Remove dist before build | `true` |
| `banner` | Add file header | `{ js: '#!/usr/bin/env node' }` |
| `outDir` | Output directory | `'dist'` |
| `minify` | Minify output | `false` (dev) or `true` (prod) |
| `sourcemap` | Generate source maps | `true` |
| `splitting` | Code splitting | `false` (for CLI tools) |

## ESM Output Configuration

```typescript
export default defineConfig({
  entry: ['src/cli.ts'],
  format: ['esm'],
  outExtension({ format }) {
    return {
      js: '.mjs',  // Ensures .mjs for ESM
    }
  },
})
```

## Dual ESM/CommonJS

```typescript
export default defineConfig({
  format: ['esm', 'cjs'],
  outExtension({ format }) {
    return {
      js: format === 'esm' ? '.mjs' : '.cjs',
    }
  },
})
```

## CLI with Library Exports

```typescript
export default defineConfig({
  entry: {
    index: 'src/index.ts',    // Library
    cli: 'src/cli.ts',        // CLI
  },
  format: ['esm', 'cjs'],
  dts: { entry: 'src/index.ts' },
  target: 'node18',
  clean: true,
})
```

## Shebang Handling

### Option 1: In Source File
```typescript
// src/cli.ts
#!/usr/bin/env node

console.log("Hello, CLI!")
```

### Option 2: Via Banner
```typescript
export default defineConfig({
  banner: {
    js: '#!/usr/bin/env node',
  },
})
```

## Declaration Files (dts)

```typescript
// Simple
dts: true

// With options
dts: {
  entry: 'src/index.ts',
  resolve: true,
  compilerOptions: {
    declarationMap: true,
  },
}
```

## Node.js 18+ Target

```typescript
export default defineConfig({
  target: 'node18',  // or 'node20', 'node22', etc.
  platform: 'node',
})
```

## Clean Output Directory

```typescript
export default defineConfig({
  outDir: 'dist',
  clean: true,  // Deletes dist/ before each build
})
```

## Build Scripts

```json
{
  "scripts": {
    "build": "tsup",
    "dev": "tsup --watch",
    "dev:cli": "node dist/cli.mjs"
  }
}
```

## Development Workflow

```bash
# Watch mode for development
npm run dev

# In another terminal, test CLI
npm run dev:cli

# Full build
npm run build

# Test CLI directly
node dist/cli.mjs --help
```

## External Dependencies

```typescript
export default defineConfig({
  external: [
    'chalk',      // npm packages
    'minimist',
    'fs',         // Node.js built-ins
    'path',
  ],
})
```

## Troubleshooting

| Problem | Solution |
|---------|----------|
| Shebang not working | Add to source file or use `banner` option |
| .d.ts files not generated | Set `dts: true` |
| ESM not working | Set `format: ['esm']`, use `.mjs` extension |
| Files not cleaned | Ensure `clean: true` in config |
| Wrong target features | Set `target: 'node18'` explicitly (tsup ignores tsconfig.json) |

## Important Notes

- tsup is **no longer actively maintained** - consider migration to tsdown in the future
- tsup **does NOT read tsconfig.json** - set all options in tsup.config.ts
- For CLI tools, use `#!/usr/bin/env node` shebang (works across Unix/Windows)
- Always set `platform: 'node'` for Node.js projects
- Use `.mjs` and `.cjs` extensions for explicit ESM/CommonJS distinction

## Official Resources

- **Documentation**: https://tsup.egoist.dev/
- **GitHub**: https://github.com/egoist/tsup
- **npm**: https://www.npmjs.com/package/tsup
- **Type Docs**: https://www.jsdocs.io/package/tsup

## Complete Example: Minimal CLI

```typescript
// src/cli.ts
#!/usr/bin/env node

const args = process.argv.slice(2)
console.log('Args:', args)
```

```typescript
// tsup.config.ts
import { defineConfig } from 'tsup'

export default defineConfig({
  entry: ['src/cli.ts'],
  format: ['esm'],
  target: 'node18',
  dts: true,
  clean: true,
})
```

```json
// package.json
{
  "name": "my-cli",
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

Build and test:
```bash
npm run build
node dist/cli.mjs hello world
```

