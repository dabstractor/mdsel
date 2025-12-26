# TypeScript CLI Package Distribution - Comprehensive Guide (2024-2025)

## 1. Official npm Documentation - Package.json for CLI Tools

### Essential package.json Configuration

From the official npm documentation, here are the key fields for CLI tools:

#### bin Field
```json
{
  "bin": {
    "my-cli": "./dist/index.js"
  }
}
```

The `bin` field maps command names to file paths. When the package is installed globally, npm creates symbolic links to these files, making them available as commands.

#### Main and Exports Fields
```json
{
  "main": "./dist/index.js",
  "exports": {
    ".": {
      "import": "./dist/index.mjs",
      "require": "./dist/index.js",
      "types": "./dist/index.d.ts"
    }
  }
}
```

#### Files Field
```json
{
  "files": [
    "dist",
    "README.md",
    "LICENSE"
  ]
}
```

The `files` field specifies which files to include when publishing the package.

### Source Links:
- [npm package.json documentation](https://docs.npmjs.com/cli/v10/configuring-npm/package-json)
- [npm bin field documentation](https://docs.npmjs.com/cli/v10/cli-commands-bin/)
- [npm best practices](https://docs.npmjs.com/about-best-practices)

## 2. TypeScript Package Distribution Best Practices

### Modern TypeScript Configuration (tsconfig.json)
```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "declaration": true,
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "allowSyntheticDefaultImports": true,
    "sourceMap": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist"]
}
```

### Package.json with Modern TypeScript Settings
```json
{
  "name": "my-typescript-cli",
  "version": "1.0.0",
  "description": "A modern TypeScript CLI tool",
  "type": "module",
  "main": "./dist/index.js",
  "types": "./dist/index.d.ts",
  "bin": {
    "mycli": "./dist/index.js"
  },
  "exports": {
    ".": {
      "import": "./dist/index.js",
      "require": "./dist/index/index.cjs",
      "types": "./dist/index.d.ts"
    }
  },
  "files": ["dist"],
  "engines": {
    "node": ">=18.0.0"
  },
  "scripts": {
    "build": "tsup",
    "dev": "tsup --watch",
    "prepublishOnly": "npm run build",
    "test": "vitest run",
    "lint": "eslint src --ext .ts",
    "format": "prettier --write src"
  },
  "keywords": ["cli", "typescript", "node"],
  "author": "Your Name",
  "license": "MIT",
  "devDependencies": {
    "@types/node": "^20.0.0",
    "typescript": "^5.3.0",
    "tsup": "^8.0.1",
    "vitest": "^1.0.0",
    "eslint": "^8.50.0",
    "@typescript-eslint/eslint-plugin": "^6.0.0",
    "prettier": "^3.0.0"
  },
  "dependencies": {
    "commander": "^11.0.0"
  }
}
```

## 3. tsup Configuration for CLI Builds

### tsup.config.ts
```typescript
import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts', 'src/cli.ts'],
  format: ['esm', 'cjs'],
  dts: true,
  sourcemap: true,
  clean: true,
  minify: process.env.NODE_ENV === 'production',
  splitting: false,
  platform: 'node',
  target: 'node18',
  shims: {
    'fs/promises': 'fs',
    'path': 'path'
  },
  esbuildOptions: (options) => {
    options.banner = {
      js: '#!/usr/bin/env node\n'
    };
  }
});
```

### Advanced tsup Configuration
```typescript
import { defineConfig } from 'tsup';

export default defineConfig([
  {
    entry: ['src/index.ts'],
    format: ['esm'],
    dts: true,
    sourcemap: true,
    outDir: 'dist',
    minify: true,
    platform: 'node',
    target: 'node18',
    inject: ['./shebang.js']
  },
  {
    entry: ['src/cli.ts'],
    format: ['cjs'],
    dts: false,
    outDir: 'dist/cli',
    platform: 'node',
    target: 'node18',
  }
]);

// shebang.js
export default `#!/usr/bin/env node\n`;
```

## 4. Node.js Shebang and Executable Permissions

### Shebang Implementation Options

#### Option 1: Runtime Shebang (Recommended)
```typescript
#!/usr/bin/env node

// src/index.ts
import { program } from 'commander';

program.version('1.0.0');
program.parse();
```

#### Option 2: Build-time Shebang
```bash
# After build
echo '#!/usr/bin/env node' | cat - dist/index.js > temp && mv temp dist/index.js
chmod +x dist/index.js
```

#### Option 3: Using tsup banner
```typescript
// tsup.config.ts
export default defineConfig({
  entry: ['src/index.ts'],
  format: ['esm'],
  esbuildOptions: (options) => {
    options.banner = {
      js: '#!/usr/bin/env node\n'
    };
  }
});
```

### Permission Management
```bash
# Make scripts executable after build
postbuild: chmod +x dist/*.js

# In package.json
{
  "scripts": {
    "build": "tsup && node scripts/postbuild.js"
  }
}
```

### postbuild.js
```javascript
import { chmodSync } from 'fs';
import { join } from 'path';

const distDir = join(process.cwd(), 'dist');
const executableFiles = ['index.js', 'cli.js'];

executableFiles.forEach(file => {
  const filePath = join(distDir, file);
  try {
    chmodSync(filePath, '755');
    console.log(`Made ${file} executable`);
  } catch (error) {
    console.warn(`Could not make ${file} executable:`, error.message);
  }
});
```

## 5. npm Publish Workflows and Best Practices

### Automated Publishing with GitHub Actions

```yaml
# .github/workflows/publish.yml
name: Publish to npm

on:
  push:
    tags:
      - 'v*'
  release:
    types: [published]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      - run: npm ci
      - run: npm test
      - run: npm run build

  publish:
    needs: test
    runs-on: ubuntu-latest
    if: github.event_name == 'release' || startsWith(github.ref, 'refs/tags/v')
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          registry-url: 'https://registry.npmjs.org'
          cache: 'npm'
      - run: npm ci
      - run: npm test
      - run: npm run build
      - run: npm publish
        env:
          NODE_AUTH_TOKEN: ${{ secrets.NPM_TOKEN }}
          NPM_CONFIG_PROVENANCE: true
```

### Release Management

```json
{
  "devDependencies": {
    "standard-version": "^9.5.0"
  },
  "scripts": {
    "release": "standard-version",
    "release:patch": "standard-version --release-as patch",
    "release:minor": "standard-version --release-as minor",
    "release:major": "standard-version --release-as major",
    "publish": "npm publish --provenance --access public"
  }
}
```

### .versionrc Configuration
```json
{
  "types": [
    { "type": "feat", "section": "Features" },
    { "type": "fix", "section": "Bug Fixes" },
    { "type": "chore", "hidden": true },
    { "type": "docs", "section": "Documentation" },
    { "type": "style", "section": "Styles", "hidden": true },
    { "type": "refactor", "section": "Code Refactoring", "hidden": true },
    { "type": "perf", "section": "Performance Improvements" },
    { "type": "test", "section": "Tests", "hidden": true }
  ]
}
```

## 6. Real-World TypeScript CLI Package Examples

### Example 1: Modern CLI with TypeScript (like Vite/Rollup)

```json
{
  "name": "example-cli",
  "version": "0.1.0",
  "type": "module",
  "bin": {
    "example": "dist/cli.js"
  },
  "files": [
    "dist"
  ],
  "main": "dist/index.js",
  "types": "dist/index.d.ts",
  "scripts": {
    "dev": "tsup --watch",
    "build": "tsup",
    "prepublishOnly": "npm run build"
  },
  "dependencies": {
    "commander": "^11.0.0"
  },
  "devDependencies": {
    "@types/node": "^20.0.0",
    "tsup": "^8.0.0",
    "typescript": "^5.0.0",
    "vitest": "^0.34.0"
  }
}
```

### Example 2: Complex Multi-Command CLI

```json
{
  "name": "@company/cli",
  "version": "1.0.0",
  "description": "Company's CLI toolkit",
  "bin": {
    "company-cli": "dist/main.js",
    "company": "dist/main.js"
  },
  "main": "dist/index.js",
  "types": "dist/index.d.ts",
  "exports": {
    ".": "./dist/index.js",
    "./commands": "./dist/commands/index.js",
    "./utils": "./dist/utils/index.js"
  },
  "files": [
    "dist",
    "README.md",
    "LICENSE"
  ],
  "scripts": {
    "build": "tsup",
    "build:watch": "tsup --watch",
    "test": "vitest run",
    "test:watch": "vitest",
    "lint": "eslint . --ext .ts,.js",
    "lint:fix": "eslint . --ext .ts,.js --fix",
    "format": "prettier --write .",
    "format:check": "prettier --check ."
  },
  "engines": {
    "node": ">=18.13.0"
  },
  "keywords": [
    "cli",
    "typescript",
    "company"
  ]
}
```

### Example 3: Package with Multiple Entry Points

```json
{
  "name": "multi-entry-cli",
  "version": "2.0.0",
  "description": "CLI with multiple entry points",
  "bin": {
    "main-cli": "dist/cli/main.js",
    "helper-cli": "dist/cli/helper.js"
  },
  "main": "dist/index.js",
  "types": "dist/index.d.ts",
  "exports": {
    ".": {
      "import": "./dist/index.js",
      "require": "./dist/index.cjs"
    },
    "./cli/main": "./dist/cli/main.js",
    "./cli/helper": "./dist/cli/helper.js"
  },
  "files": [
    "dist"
  ],
  "scripts": {
    "build": "tsup",
    "dev": "tsup --watch"
  }
}
```

## 7. Common Pitfalls and Solutions

### Pitfall 1: Missing Shebang
```typescript
// ❌ Wrong
export function main() {
  console.log('Hello');
}

// ✅ Correct
#!/usr/bin/env node
import { program } from 'commander';

program.version('1.0.0').parse();
```

### Pitfall 2: Incorrect File Permissions
```bash
# Fix in postbuild script
import { chmod } from 'fs/promises';

await chmod('dist/index.js', '755');
```

### Pitfall 3: Missing TypeScript Declarations
```json
{
  "types": "dist/index.d.ts",
  "files": ["dist", "!**/*.test.*"]
}
```

### Pitfall 4: Dual Package Hazards
```json
{
  "engines": {
    "node": ">=18.0.0"
  },
  "publishConfig": {
    "provenance": true
  }
}
```

### Pitfall 5: Missing Build Script
```json
{
  "scripts": {
    "prepublishOnly": "npm run build",
    "build": "tsup"
  }
}
```

## 8. Testing Strategy for CLI Tools

### Unit Tests with Vitest
```typescript
// src/cli.test.ts
import { execa } from 'execa';
import { test, expect } from 'vitest';

test('cli version command', async () => {
  const { stdout } = await execa('./dist/cli.js', ['--version']);
  expect(stdout).toMatch(/\d+\.\d+\.\d+/);
});
```

### Integration Tests
```typescript
// src/integration.test.ts
import { spawn } from 'child_process';
import { test, expect } from 'vitest';

test('cli help command', async () => {
  const cli = spawn('./dist/cli.js', ['--help']);

  return new Promise((resolve) => {
    let output = '';
    cli.stdout.on('data', (data) => {
      output += data.toString();
    });
    cli.on('close', (code) => {
      expect(code).toBe(0);
      expect(output).toContain('Usage:');
      resolve();
    });
  });
});
```

### CLI Testing Configuration
```json
{
  "devDependencies": {
    "execa": "^8.0.0",
    "vitest": "^1.0.0",
    "@vitest/coverage-v8": "^1.0.0"
  },
  "scripts": {
    "test": "vitest run",
    "test:watch": "vitest",
    "test:coverage": "vitest run --coverage"
  }
}
```

This comprehensive guide covers all the essential aspects of distributing TypeScript CLI packages in 2024-2025, following current best practices and official documentation.