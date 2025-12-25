# Vitest 1.x Configuration Research - TypeScript Node.js Project

**Date**: December 25, 2025
**Framework**: Vitest 1.x
**Target**: TypeScript Node.js CLI/Application Projects
**Version Requirements**: Vite ≥v6.0.0, Node ≥v20.0.0

---

## Table of Contents

1. [Official Documentation Links](#official-documentation-links)
2. [Configuration Overview](#configuration-overview)
3. [Complete vitest.config.ts Examples](#complete-vitestconfigts-examples)
4. [TypeScript Integration](#typescript-integration)
5. [Test Glob Patterns](#test-glob-patterns)
6. [Coverage Configuration (V8 Provider)](#coverage-configuration-v8-provider)
7. [ESM Module Support](#esm-module-support)
8. [Best Practices](#best-practices)

---

## Official Documentation Links

All documentation links point to the official Vitest v1.x documentation:

- **Main Documentation**: https://vitest.dev
- **Configuration Guide**: https://vitest.dev/config/
- **Getting Started**: https://vitest.dev/guide/
- **Coverage Configuration**: https://vitest.dev/config/coverage
- **Coverage Guide**: https://vitest.dev/guide/coverage.html
- **CLI Guide**: https://vitest.dev/guide/cli
- **Test Projects**: https://vitest.dev/guide/projects
- **Advanced API**: https://vitest.dev/advanced/api/

### GitHub Resources

- **Main Repository**: https://github.com/vitest-dev/vitest
- **Vitest Coverage V8 Package**: https://www.npmjs.com/package/@vitest/coverage-v8

---

## Configuration Overview

### File Selection

Vitest supports several approaches to configuration:

1. **Separate `vitest.config.ts`** (Recommended for TypeScript projects)
   - Highest priority, overrides Vite configuration
   - Best for explicit test configuration
   - Supports: `.js`, `.mjs`, `.cjs`, `.ts`, `.cts`, `.mts` (NOT `.json`)

2. **Vite `vite.config.ts` with test property**
   - Unified configuration for both Vite and tests
   - Good if sharing Vite plugins with tests
   - Requires type reference: `/// <reference types="vitest/config" />`

3. **Merge Vite and Vitest configs**
   - Use `mergeConfig()` from `vitest/config` to combine both

### Module System

```typescript
// vitest.config.ts - Supports native ESM
import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    // test configuration
  },
})
```

### Extending Defaults

```typescript
import { configDefaults, defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    exclude: [...configDefaults.exclude, 'packages/template/*'],
  },
})
```

---

## Complete vitest.config.ts Examples

### Example 1: Basic TypeScript Node.js Configuration

```typescript
import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    // Enable global test APIs (describe, it, expect)
    globals: true,

    // Node.js environment for CLI/backend apps
    environment: 'node',

    // Test file patterns
    include: ['tests/**/*.test.ts', 'src/**/*.test.ts'],
    exclude: ['node_modules', 'dist'],

    // TypeScript support
    typecheck: {
      enabled: true,
      tsconfig: './tsconfig.json',
    },

    // Coverage configuration
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      include: ['src/**/*.ts'],
      exclude: ['**/*.test.ts', '**/*.spec.ts', 'node_modules'],
    },
  },
})
```

### Example 2: Comprehensive Configuration with Thresholds

```typescript
import { defineConfig, configDefaults } from 'vitest/config'

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',

    // Glob patterns for test discovery
    include: ['tests/**/*.{test,spec}.ts', 'src/**/*.{test,spec}.ts'],
    exclude: [...configDefaults.exclude, '**/node_modules/**'],

    // Test execution
    testTimeout: 10000,
    hookTimeout: 10000,
    teardownTimeout: 10000,

    // Setup files run before tests
    setupFiles: ['./tests/setup.ts'],

    // Global test configuration
    globals: true,
    isolate: true,
    threads: true,

    // TypeScript configuration
    typecheck: {
      enabled: true,
      tsconfig: './tsconfig.json',
    },

    // Coverage configuration with v8 provider
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'json-summary', 'html', 'lcov'],
      reportOnFailure: true,

      // Files to include in coverage
      include: ['src/**/*.ts'],
      exclude: [
        '**/*.test.ts',
        '**/*.spec.ts',
        '**/node_modules/**',
        '**/dist/**',
        '**/types/**',
        '**/constants/**',
      ],

      // Coverage thresholds - fail if coverage drops below
      thresholds: {
        lines: 85,
        functions: 85,
        branches: 85,
        statements: 85,
      },

      // Auto-update thresholds when coverage improves
      // autoUpdate: true,

      // Minimum coverage for specific files
      // 'src/utils/**.ts': { lines: 100, functions: 100 },

      // Output configuration
      outputDir: './coverage',
      reportsDirectory: './coverage',
    },
  },
})
```

### Example 3: Multi-Project Configuration

```typescript
import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',

    // Define multiple test projects
    projects: [
      {
        name: 'unit',
        test: {
          include: ['src/**/*.unit.test.ts'],
          environment: 'node',
        },
      },
      {
        name: 'integration',
        test: {
          include: ['tests/**/*.integration.test.ts'],
          environment: 'node',
          testTimeout: 30000,
        },
      },
      {
        name: 'e2e',
        test: {
          include: ['tests/**/*.e2e.test.ts'],
          environment: 'node',
          testTimeout: 60000,
        },
      },
    ],
  },
})
```

### Example 4: With Global Setup/Teardown

```typescript
import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    include: ['tests/**/*.test.ts'],

    // Global setup/teardown files
    globalSetup: ['./tests/globalSetup.ts'],

    // Per-test file setup/teardown
    setupFiles: ['./tests/setup.ts'],

    // File-level isolation
    isolate: true,

    coverage: {
      provider: 'v8',
      reporter: ['text', 'html'],
      include: ['src/**/*.ts'],
      exclude: ['**/*.test.ts', '**/node_modules/**'],
    },
  },
})
```

---

## TypeScript Integration

### vitest.config.ts with TypeScript Support

```typescript
import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',

    // Enable TypeScript type checking
    typecheck: {
      enabled: true,
      tsconfig: './tsconfig.json',
      // Optional: check only test files
      include: ['tests/**/*.test.ts'],
      // Optional: exclude type checking for certain patterns
      exclude: ['node_modules/**'],
    },

    // Include TypeScript test files
    include: ['**/*.test.ts', '**/*.spec.ts'],
  },
})
```

### tsconfig.json Configuration

```json
{
  "compilerOptions": {
    "target": "ESNext",
    "module": "ESNext",
    "lib": ["ESNext"],
    "moduleResolution": "bundler",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true,
    "outDir": "./dist",

    // Include Vitest global types
    "types": ["vitest/globals", "node"]
  },
  "include": ["src/**/*.ts", "tests/**/*.ts"],
  "exclude": ["node_modules", "dist"]
}
```

### TypeScript Global Types Setup File

When using `globals: true`, ensure your `tsconfig.json` includes:

```json
{
  "compilerOptions": {
    "types": ["vitest/globals"]
  }
}
```

This enables TypeScript to recognize global test functions without imports:

```typescript
// No imports needed when globals: true and types configured
describe('My Tests', () => {
  it('should work', () => {
    expect(true).toBe(true)
  })
})
```

---

## Test Glob Patterns

### Standard Patterns

The default Vitest test discovery pattern:

```typescript
include: ['**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}']
```

### Custom Patterns for Node.js CLI Projects

```typescript
export default defineConfig({
  test: {
    // Option 1: Separate tests directory
    include: ['tests/**/*.test.ts'],
    exclude: ['node_modules', 'dist'],

    // Option 2: Colocated with source
    include: ['src/**/*.test.ts', 'src/**/*.spec.ts'],
    exclude: ['node_modules', 'dist'],

    // Option 3: Multiple patterns
    include: [
      'tests/unit/**/*.test.ts',
      'tests/integration/**/*.test.ts',
      'src/**/__tests__/**/*.test.ts',
    ],
    exclude: ['**/node_modules/**', '**/dist/**', '**/.git/**'],

    // Option 4: Using configDefaults
    // include: [...configDefaults.include, 'src/**/*.test.ts'],
  },
})
```

### Exclude Patterns

```typescript
export default defineConfig({
  test: {
    exclude: [
      '**/node_modules/**',
      '**/dist/**',
      '**/.{idea,git,cache,output,temp}/**',
      '**/e2e/**',              // Separate e2e tests
      '**/fixtures/**',          // Test fixtures
      '**/mocks/**',             // Mock files
    ],
  },
})
```

---

## Coverage Configuration (V8 Provider)

### Why V8 Provider?

- **Default provider** in Vitest
- **Native to Node.js** - no additional instrumentation
- **Faster execution** - lower memory overhead
- **Accurate reports** - AST-based remapping since Vitest 3.2.0
- **Maintained** - actively developed with Vitest

### Basic V8 Setup

```typescript
export default defineConfig({
  test: {
    coverage: {
      provider: 'v8',
    },
  },
})
```

### Installation

If not auto-installed, manually install:

```bash
npm install -D @vitest/coverage-v8
```

### Complete V8 Configuration

```typescript
import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    coverage: {
      // Provider selection
      provider: 'v8',

      // Enable/disable coverage
      enabled: true,

      // Output configuration
      outputDir: './coverage',
      reportsDirectory: './coverage',
      clean: true,          // Clean coverage dir before run
      cleanOnRerun: true,   // Clean before each rerun

      // File selection
      include: ['src/**/*.ts'],
      exclude: [
        '**/*.test.ts',
        '**/*.spec.ts',
        '**/node_modules/**',
        '**/dist/**',
      ],

      // Report formats
      reporter: [
        'text',           // Console output
        'text-summary',   // Summary in console
        'json',           // JSON format
        'json-summary',   // JSON summary
        'html',           // HTML report
        'lcov',           // LCOV format (for CI)
      ],

      // Coverage thresholds
      thresholds: {
        // Global thresholds
        lines: 85,
        functions: 85,
        branches: 85,
        statements: 85,

        // Thresholds for specific files
        // 'src/utils/**.ts': { lines: 100, functions: 100 },
        // 'src/index.ts': { lines: 90 },
      },

      // Auto-update thresholds
      // autoUpdate: true,
      // autoUpdateThreshold: (newThreshold) => Math.floor(newThreshold),

      // Reporting options
      reportOnFailure: true,
      perFile: false,      // Report per file
      skipFull: false,     // Skip 100% covered files
    },
  },
})
```

### Coverage Thresholds Options

```typescript
coverage: {
  thresholds: {
    // Positive number = minimum coverage percentage required
    lines: 85,          // At least 85% of lines must be covered
    functions: 85,
    branches: 85,
    statements: 85,

    // Negative number = maximum uncovered items allowed
    lines: -10,         // Allow up to 10 uncovered lines
    functions: -5,

    // File-specific patterns
    'src/critical/**.ts': { lines: 95, functions: 95 },
    'src/utils/**.ts': { lines: 100 },

    // Shortcut for 100% coverage
    // 'src/core/**.ts': { 100: true },
  },
}
```

### Ignoring Code in Coverage

```typescript
// V8 provider syntax
const value = getValue() /* v8 ignore if -- @preserve */

// Multiple lines
/* v8 ignore start -- @preserve */
if (shouldNotBeCovered) {
  doSomething()
}
/* v8 ignore end */
```

### Running Coverage

```bash
# Run coverage once
npm run test -- --coverage

# Run specific coverage reporter
npm run test -- --coverage.reporter=html

# Watch mode with coverage
npm run test -- --coverage --watch
```

---

## ESM Module Support

### package.json Configuration

For ESM projects, configure:

```json
{
  "name": "my-project",
  "version": "1.0.0",
  "type": "module",
  "main": "./dist/index.js",
  "exports": {
    ".": {
      "import": "./dist/index.js",
      "require": "./dist/index.cjs"
    }
  },
  "scripts": {
    "test": "vitest",
    "test:ui": "vitest --ui",
    "test:coverage": "vitest run --coverage"
  },
  "devDependencies": {
    "vitest": "^1.x",
    "@vitest/coverage-v8": "^1.x"
  }
}
```

### vitest.config.ts with ESM

```typescript
import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',

    // ESM configuration
    include: ['**/*.test.ts'],
    exclude: ['node_modules', 'dist'],

    // TypeScript with ESM
    typecheck: {
      enabled: true,
      tsconfig: './tsconfig.json',
    },

    coverage: {
      provider: 'v8',
      reporter: ['text', 'html'],
      include: ['src/**/*.ts'],
    },
  },
})
```

### tsconfig.json for ESM

```json
{
  "compilerOptions": {
    "target": "ESNext",
    "module": "ESNext",
    "lib": ["ESNext"],
    "moduleResolution": "bundler",
    "strict": true,
    "esModuleInterop": true,
    "allowSyntheticDefaultImports": true,
    "types": ["vitest/globals", "node"]
  },
  "include": ["src/**/*.ts", "tests/**/*.ts"],
  "exclude": ["node_modules", "dist"]
}
```

### Handling ESM Dependencies

When a dependency is ESM-only or has both ESM/CJS:

```typescript
// vitest.config.ts
export default defineConfig({
  test: {
    // Inline specific ESM-only dependencies
    ssr: {
      // Vite config merged into vitest
      noExternal: ['esm-only-package'],
    },
  },
})
```

---

## Best Practices

### 1. Project Structure

Recommended layout for Node.js CLI projects:

```
project/
├── src/
│   ├── index.ts
│   ├── cli.ts
│   ├── commands/
│   │   ├── build.ts
│   │   └── serve.ts
│   └── utils/
│       └── helpers.ts
├── tests/
│   ├── unit/
│   │   ├── cli.test.ts
│   │   └── utils/
│   │       └── helpers.test.ts
│   ├── integration/
│   │   └── commands.test.ts
│   ├── setup.ts
│   └── globalSetup.ts
├── vitest.config.ts
├── tsconfig.json
├── package.json
└── README.md
```

### 2. Configuration Checklist

```typescript
// vitest.config.ts
import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    // ✓ Enable globals for no-import test APIs
    globals: true,

    // ✓ Set node environment for CLI apps
    environment: 'node',

    // ✓ Define test file patterns
    include: ['tests/**/*.test.ts', 'src/**/*.test.ts'],
    exclude: ['node_modules', 'dist'],

    // ✓ Enable TypeScript checking
    typecheck: {
      enabled: true,
      tsconfig: './tsconfig.json',
    },

    // ✓ Setup files for test initialization
    setupFiles: ['./tests/setup.ts'],

    // ✓ Configure v8 coverage
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html', 'lcov'],
      include: ['src/**/*.ts'],
      exclude: ['**/*.test.ts', '**/node_modules/**'],
      thresholds: {
        lines: 85,
        functions: 85,
        branches: 85,
        statements: 85,
      },
    },
  },
})
```

### 3. TypeScript Integration

Always include:

```json
{
  "compilerOptions": {
    "types": ["vitest/globals"]
  }
}
```

This enables:
- Global `describe`, `it`, `test`, `expect` without imports
- IntelliSense for test APIs
- Type-safe assertions

### 4. Coverage Best Practices

```typescript
coverage: {
  provider: 'v8',

  // Include only source files
  include: ['src/**/*.ts'],

  // Exclude test and build files
  exclude: [
    '**/*.test.ts',
    '**/*.spec.ts',
    '**/node_modules/**',
    '**/dist/**',
  ],

  // Set realistic thresholds
  thresholds: {
    lines: 80,      // 80% for lines
    functions: 80,  // 80% for functions
    branches: 70,   // 70% for branches (harder)
    statements: 80, // 80% for statements
  },

  // Auto-update when improving
  // autoUpdate: true,

  // Report on CI failures
  reportOnFailure: true,
}
```

### 5. Package.json Scripts

```json
{
  "scripts": {
    "test": "vitest",
    "test:ui": "vitest --ui",
    "test:coverage": "vitest run --coverage",
    "test:watch": "vitest --watch",
    "test:debug": "vitest --inspect-brk --no-file-parallelism",
    "test:ci": "vitest run --coverage --reporter=verbose"
  }
}
```

### 6. Setup File Example (tests/setup.ts)

```typescript
import { beforeAll, afterAll, afterEach } from 'vitest'

// Global setup before all tests
beforeAll(() => {
  console.log('Setting up test environment...')
})

// Cleanup after each test
afterEach(() => {
  // Reset mocks, clear state, etc.
})

// Global teardown after all tests
afterAll(() => {
  console.log('Cleaning up test environment...')
})
```

### 7. Mocking Best Practices

```typescript
import { test, expect, vi, beforeEach } from 'vitest'

test('example with mocks', () => {
  // Mock functions
  const mockFn = vi.fn()
  mockFn.mockReturnValue(42)

  // Mock modules
  vi.mock('./module', () => ({
    default: { value: 'mocked' },
  }))

  // Assertions
  expect(mockFn()).toBe(42)
})

// Auto-reset after each test (default behavior)
beforeEach(() => {
  vi.clearAllMocks()
})
```

### 8. Watch Mode Optimization

For faster feedback during development:

```typescript
export default defineConfig({
  test: {
    // Run related tests on file change
    related: ['src/**/*.ts'],

    // Reduce timeouts in watch mode
    testTimeout: 5000,

    // Disable coverage in watch mode
    coverage: {
      enabled: false,
    },
  },
})
```

---

## Command Reference

### Common CLI Commands

```bash
# Run all tests once
npm test -- run

# Run tests in watch mode (development)
npm test

# Run with UI dashboard
npm test -- --ui

# Run with coverage report
npm test -- run --coverage

# Run specific test file
npm test -- src/utils.test.ts

# Run tests matching pattern
npm test -- --grep "validation"

# Run tests in debug mode
npm test -- --inspect-brk --no-file-parallelism

# Run with reporter
npm test -- run --reporter=verbose

# Generate HTML coverage report
npm test -- run --coverage && open coverage/index.html
```

---

## Related Configuration Files

### .gitignore

```
node_modules/
dist/
coverage/
.vitest/
.vite/
```

### .npmrc (if using npm)

```
# Use exact versions
save-exact=true

# Prefer offline
offline=false
```

---

## Summary

**Key Takeaways**:

1. Use separate `vitest.config.ts` for TypeScript Node.js projects
2. Enable globals for cleaner test code
3. Set environment to 'node' for CLI applications
4. Include TypeScript type checking with tsconfig reference
5. Use V8 coverage provider (default, fast, accurate)
6. Define realistic coverage thresholds (80-85%)
7. Include only source files in coverage reporting
8. Configure ESM support via package.json and tsconfig.json
9. Use setup files for test initialization
10. Enable auto-updates for threshold configuration

---

## References

- Official Vitest Documentation: https://vitest.dev
- Coverage Configuration: https://vitest.dev/config/coverage
- Getting Started Guide: https://vitest.dev/guide/
- GitHub Repository: https://github.com/vitest-dev/vitest
- Coverage V8 Package: https://www.npmjs.com/package/@vitest/coverage-v8

