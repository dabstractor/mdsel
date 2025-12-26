# TypeScript CLI Package Distribution Best Practices (2024-2025)

## 1. Official npm documentation on package.json configuration for CLI tools

### Key Official Documentation Sources:
- [npm package.json documentation](https://docs.npmjs.com/cli/v10/configuring-npm/package-json)
- [npm CLI entry point documentation](https://docs.npmjs.com/cli/v10/cli-commands-bin/)
- [npm best practices](https://docs.npmjs.com/about-best-practices)

### Essential package.json fields for CLI tools:

```json
{
  "name": "@your-org/your-cli",
  "version": "1.0.0",
  "description": "A TypeScript CLI tool for amazing tasks",
  "bin": {
    "your-cli": "./dist/index.js"
  },
  "main": "./dist/index.js",
  "types": "./dist/index.d.ts",
  "exports": {
    ".": {
      "import": "./dist/index.mjs",
      "require": "./dist/index.js",
      "types": "./dist/index.d.ts"
    },
    "./cli": "./dist/cli/index.js"
  },
  "files": [
    "dist",
    "README.md"
  ],
  "scripts": {
    "build": "tsup",
    "prepublishOnly": "npm run build",
    "dev": "tsup --watch",
    "test": "vitest"
  }
}
```

## 2. Best practices for TypeScript package distribution

### TypeScript-Specific Best Practices:

1. **Use TypeScript 5.0+ features**
   - Use `module: "ESNext"` or `"NodeNext"`
   - Enable `target: "ESNext"` for modern JavaScript output
   - Use `moduleResolution: "bundler"` for better performance

2. **Dual Package Hazard Prevention**
   ```json
   "engines": {
     "node": ">=18.0.0"
   },
   "publishConfig": {
     "provenance": true,
     "registry": "https://registry.npmjs.org"
   }
   ```

3. **Type Declaration Files**
   - Always include `types` field
   - Ensure `.d.ts` files are included in `files`
   - Use `@types/node` development dependencies

## 3. tsup usage for CLI package builds

### tsup Configuration (tsup.config.ts):

```typescript
import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts', 'src/cli.ts'],
  format: ['esm', 'cjs'],
  dts: true,
  splitting: false,
  sourcemap: true,
  clean: true,
  platform: 'node',
  target: 'node18',
  minify: process.env.NODE_ENV === 'production',
  shims: {
    // Handle process.env and other Node.js globals
    'process': 'process',
    'buffer': 'buffer'
  }
});
```

### Build Process:
- Use `tsup` with ESM and CJS dual outputs
- Generate TypeScript declaration files
- Include source maps for debugging
- Minify in production only

## 4. Node.js shebang and executable permissions

### Shebang Configuration:

```typescript
#!/usr/bin/env node

// Add this at the top of your main entry point
// This ensures the script runs with Node.js
```

### File Permissions:
```bash
# After build, make the file executable
chmod +x dist/index.js

# Ensure proper permissions in package.json
{
  "bin": {
    "your-cli": "./dist/index.js"
  }
}
```

### Alternative approach with build-time shebang:
```json
{
  "scripts": {
    "build": "tsup && shebangify dist/index.js"
  },
  "devDependencies": {
    "shebangify": "^0.0.11"
  }
}
```

## 5. npm publish workflows and best practices

### Automated Publishing:

```json
{
  "scripts": {
    "release": "standard-version",
    "publish": "npm publish --provenance"
  },
  "devDependencies": {
    "standard-version": "^9.5.0",
    "@jsdevtools/npm-publish": "^2.0.0"
  }
}
```

### CI/CD Workflow Example:

```yaml
# .github/workflows/publish.yml
name: Publish to npm
on:
  release:
    types: [published]

jobs:
  publish:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          registry-url: 'https://registry.npmjs.org'
      - run: npm ci
      - run: npm test
      - run: npm run build
      - run: npm publish
        env:
          NODE_AUTH_TOKEN: ${{ secrets.NPM_TOKEN }}
          NPM_CONFIG_PROVENANCE: true
```

### Best Practices:
- Use `npm ci` instead of `npm install` for CI
- Enable provenance signing for builds
- Use semantic versioning with `standard-version`
- Always run tests before publishing

## 6. Examples of well-configured TypeScript CLI packages

### Example 1: Simple CLI Tool

```json
{
  "name": "my-cli-tool",
  "version": "1.0.0",
  "description": "A simple TypeScript CLI tool",
  "type": "module",
  "bin": {
    "my-cli": "dist/index.js"
  },
  "main": "dist/index.js",
  "exports": {
    ".": "./dist/index.js"
  },
  "scripts": {
    "build": "tsup",
    "start": "node dist/index.js",
    "test": "vitest"
  },
  "devDependencies": {
    "tsup": "^8.0.1",
    "typescript": "^5.3.0",
    "vitest": "^1.0.0"
  },
  "engines": {
    "node": ">=18.0.0"
  }
}
```

### Example 2: Complex CLI with Subcommands

```json
{
  "name": "@company/cli-suite",
  "version": "2.0.0",
  "description": "Enterprise CLI suite with TypeScript",
  "bin": {
    "company-cli": "dist/cli/index.js",
    "company-cli": "dist/cli/index.js"
  },
  "exports": {
    ".": "./dist/index.js",
    "./cli": "./dist/cli/index.js",
    "./utils": "./dist/utils/index.js"
  },
  "files": [
    "dist",
    "LICENSE",
    "README.md"
  ],
  "scripts": {
    "build": "tsup && npm run build:cli",
    "build:cli": "cd packages/cli && npm run build",
    "test": "npm run test:unit && npm run test:e2e",
    "test:unit": "vitest",
    "test:e2e": "playwright test"
  },
  "keywords": ["cli", "typescript", "automation", "company"],
  "repository": {
    "type": "git",
    "url": "https://github.com/company/cli-suite.git"
  }
}
```

## Common Pitfalls to Avoid

1. **Missing Shebang**: Always include `#!/usr/bin/env node` at the top of CLI entry points
2. **Wrong File Extension**: Use `.js` extensions for compiled TypeScript, not `.ts`
3. **Missing Types**: Always include TypeScript declarations
4. **Insufficient Testing**: Test your CLI with various Node.js versions
5. **Incorrect Permissions**: Ensure compiled files are executable
6. **Missing Engines Field**: Specify minimum Node.js version requirements
7. **Dual Package Hazards**: Be careful with ESM/CJS dual package scenarios
8. **Missing License**: Always include a license file
9. **Poor Error Handling**: Implement proper error handling with try-catch
10. **Global Dependencies**: Avoid depending on globally installed packages

## Recommended Dependencies for TypeScript CLI Tools

```json
{
  "devDependencies": {
    "typescript": "^5.3.0",
    "tsup": "^8.0.1",
    "vitest": "^1.0.0",
    "@types/node": "^20.0.0",
    "@types/jest": "^29.5.0",
    "standard-version": "^9.5.0",
    "prettier": "^3.0.0",
    "eslint": "^8.45.0",
    "@typescript-eslint/eslint-plugin": "^6.0.0"
  }
}
```

## Testing Strategy for CLI Tools

```json
{
  "scripts": {
    "test": "vitest run",
    "test:cli": "tsx src/cli.test.ts",
    "test:e2e": "mkdir -p tmp && npm run build && ./dist/index.js --version > tmp/version.txt && cat tmp/version.txt"
  },
  "devDependencies": {
    "tsx": "^4.0.0",
    "execa": "^7.0.0"
  }
}
```

Remember to always test your CLI package across different Node.js versions and operating systems before publishing.