# Vitest 1.x Advanced Configuration & Troubleshooting

## Advanced Patterns

### Multi-Project Configuration

For monorepos or complex projects with different test types:

```typescript
import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',

    projects: [
      {
        name: 'unit',
        test: {
          include: ['src/**/*.unit.test.ts'],
          exclude: ['**/node_modules/**'],
          environment: 'node',
          testTimeout: 5000,
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
          isolate: true,
          threads: true,
        },
      },
    ],

    coverage: {
      provider: 'v8',
      reporter: ['text', 'html'],
      include: ['src/**/*.ts'],
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

Run specific project:

```bash
vitest run --project unit
vitest run --project integration
vitest run --project e2e
```

### Conditional Configuration

```typescript
import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',

    // Different config for CI vs local
    testTimeout: process.env.CI ? 30000 : 10000,

    // Disable coverage in watch mode
    coverage: {
      provider: 'v8',
      enabled: !process.env.WATCH,
    },

    // More verbose output in CI
    reporter: process.env.CI ? 'verbose' : 'default',
  },
})
```

### Merging with Vite Config

```typescript
import { defineConfig, mergeConfig } from 'vitest/config'
import viteConfig from './vite.config'

export default mergeConfig(
  viteConfig,
  defineConfig({
    test: {
      globals: true,
      environment: 'node',
    },
  })
)
```

---

## Advanced Coverage Configuration

### File-Specific Coverage Thresholds

```typescript
coverage: {
  provider: 'v8',
  reporter: ['text', 'html'],
  include: ['src/**/*.ts'],

  // Global thresholds
  thresholds: {
    // All files must meet these
    lines: 80,
    functions: 80,
    branches: 70,
    statements: 80,

    // Critical files need 100%
    'src/core/**.ts': {
      lines: 100,
      functions: 100,
      branches: 100,
      statements: 100,
    },

    // Utilities should be 95%
    'src/utils/**.ts': {
      lines: 95,
      functions: 95,
    },

    // Legacy code can be lower
    'src/legacy/**.ts': {
      lines: 50,
      functions: 50,
    },

    // Allow uncovered lines in specific files
    'src/cli/**.ts': {
      lines: -10,  // Max 10 uncovered lines
    },
  },
}
```

### Auto-Update Coverage Thresholds

```typescript
coverage: {
  provider: 'v8',
  thresholds: {
    // Auto-update all thresholds
    autoUpdate: true,

    // Format with custom function
    // Rounds down to nearest 5
    // autoUpdate: (newThreshold) => {
    //   return Math.floor(newThreshold / 5) * 5
    // },

    lines: 80,
    functions: 80,
    branches: 70,
    statements: 80,
  },
}
```

When enabled, running coverage will update thresholds in config if current coverage is better.

### Coverage Report Formats

```typescript
coverage: {
  provider: 'v8',
  reporter: [
    'text',           // Human-readable console output
    'text-summary',   // Summary only (1 line)
    'json',           // Machine-readable JSON
    'json-summary',   // JSON summary
    'html',           // HTML report (open coverage/index.html)
    'lcov',           // LCOV format (for Codecov.io, Coveralls)
    'clover',         // Clover XML format (Atlassian)
    'teamcity',       // TeamCity format
  ],
}
```

### Performance-Optimized Coverage

```typescript
coverage: {
  provider: 'v8',
  reporter: ['text', 'html'],
  include: ['src/**/*.ts'],

  // Skip coverage for 100% covered files
  skipFull: true,

  // Check coverage per file
  perFile: true,

  // Custom exclude patterns for faster coverage
  exclude: [
    '**/*.test.ts',
    '**/*.spec.ts',
    '**/node_modules/**',
    '**/dist/**',
    '**/types/**',
    '**/constants/**',
    '**/enums/**',
  ],

  // Output to temp directory during watch
  outputDir: process.env.WATCH ? '.vitest-coverage' : './coverage',
}
```

---

## TypeScript Advanced Configuration

### Type Checking with Separate Config

```typescript
import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    typecheck: {
      enabled: true,
      // Use separate config for tests
      tsconfig: './tsconfig.test.json',
      include: ['src/**/*.test.ts', 'tests/**/*.ts'],
      exclude: ['node_modules', 'dist'],
    },
  },
})
```

Create `tsconfig.test.json`:

```json
{
  "extends": "./tsconfig.json",
  "compilerOptions": {
    "types": ["vitest/globals", "node"]
  },
  "include": ["src/**/*.ts", "tests/**/*.ts", "src/**/*.test.ts"]
}
```

### Strict Type Checking in Tests

```typescript
// tsconfig.json
{
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    "strictFunctionTypes": true,
    "strictPropertyInitialization": true,
    "strictBindCallApply": true,
    "alwaysStrict": true,
    "noImplicitThis": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true,
    "types": ["vitest/globals", "node"]
  }
}
```

---

## Setup and Hooks

### Global Setup File

```typescript
// vitest.config.ts
export default defineConfig({
  test: {
    globalSetup: ['./tests/globalSetup.ts'],
  },
})

// tests/globalSetup.ts
import { beforeAll, afterAll } from 'vitest'

let server: any

export async function setup() {
  console.log('Setting up test environment...')
  // Start test server
  // server = await startTestServer()
  // Initialize database
  // await initializeTestDatabase()
}

export async function teardown() {
  console.log('Cleaning up test environment...')
  // Cleanup server
  // await server.close()
  // Clear database
  // await clearTestDatabase()
}
```

### Per-File Setup

```typescript
// vitest.config.ts
export default defineConfig({
  test: {
    setupFiles: ['./tests/setup.ts'],
  },
})

// tests/setup.ts
import { beforeEach, afterEach, beforeAll, afterAll } from 'vitest'
import { vi } from 'vitest'

// Before each test
beforeEach(() => {
  // Reset mocks
  vi.clearAllMocks()
  // Clear environment
  delete process.env.CUSTOM_VAR
})

// After each test
afterEach(() => {
  // Cleanup
})
```

---

## Mocking Patterns

### Module Mocking

```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest'

describe('module mocking', () => {
  beforeEach(() => {
    vi.resetModules()
  })

  it('should mock module', async () => {
    vi.mock('./utils', () => ({
      getValue: () => 42,
      doSomething: vi.fn(),
    }))

    const { getValue, doSomething } = await import('./utils')
    expect(getValue()).toBe(42)
  })
})
```

### Spy on Functions

```typescript
import { vi, expect } from 'vitest'

const obj = {
  method() {
    return 'original'
  },
}

// Spy without changing behavior
const spy = vi.spyOn(obj, 'method')
obj.method()
expect(spy).toHaveBeenCalled()

// Spy and override
vi.spyOn(obj, 'method').mockReturnValue('mocked')
expect(obj.method()).toBe('mocked')
```

---

## Environment-Specific Configuration

### Node.js Environment

```typescript
export default defineConfig({
  test: {
    environment: 'node',
    // Node-specific options
    testTimeout: 10000,
    hookTimeout: 10000,
  },
})
```

### jsdom Environment (for DOM testing)

```typescript
export default defineConfig({
  test: {
    environment: 'jsdom',
    setupFiles: ['./tests/dom-setup.ts'],
  },
})
```

### happy-dom Environment (lighter DOM)

```typescript
export default defineConfig({
  test: {
    environment: 'happy-dom',
  },
})
```

---

## CI/CD Integration

### GitHub Actions Example

```yaml
name: Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    strategy:
      matrix:
        node-version: [18, 20]

    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: ${{ matrix.node-version }}

      - run: npm ci
      - run: npm run test:ci

      - name: Upload coverage
        uses: codecov/codecov-action@v3
        with:
          files: ./coverage/lcov.info
```

### Vitest Config for CI

```typescript
export default defineConfig({
  test: {
    globals: true,
    environment: 'node',

    // Disable watch in CI
    watch: false,

    // Verbose output
    reporter: process.env.CI ? 'verbose' : 'default',

    // Use different coverage settings
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'lcov'],
      include: ['src/**/*.ts'],
      thresholds: {
        lines: 85,
        functions: 85,
        branches: 85,
        statements: 85,
      },
    },

    // Fail on coverage below threshold
    // (thresholds already do this)
  },
})
```

---

## Debugging Tests

### Debug Mode

```bash
# Stop at debugger statements
vitest --inspect-brk --no-file-parallelism

# Then open chrome://inspect in Chrome
```

### Verbose Logging

```typescript
// In test
console.log('Debug info:', value)

// Run with
npm test -- --reporter=verbose
```

### Watch Specific Tests

```bash
# Run tests matching pattern
vitest --grep "should validate email"

# Watch specific file
vitest src/utils.test.ts
```

---

## Performance Optimization

### Thread Pool Configuration

```typescript
export default defineConfig({
  test: {
    // Use worker threads (faster for I/O)
    threads: true,
    maxThreads: 4,
    minThreads: 1,

    // Or disable for debugging
    // threads: false,

    // Don't parallelize files
    fileParallelism: false,
  },
})
```

### Test Timeout Configuration

```typescript
export default defineConfig({
  test: {
    // Global timeout
    testTimeout: 10000,

    // Hook timeouts
    hookTimeout: 10000,
    teardownTimeout: 10000,

    // Isolate tests (slower but safer)
    isolate: true,

    // Pool configuration
    pool: 'threads',
    poolOptions: {
      threads: {
        singleThread: false,
      },
    },
  },
})
```

### Watch Mode Optimization

```typescript
export default defineConfig({
  test: {
    // Only run related tests
    related: ['src/**/*.ts'],

    // Reduce timeouts in watch
    testTimeout: process.env.WATCH ? 5000 : 10000,

    // Disable coverage in watch
    coverage: {
      enabled: false,
    },
  },
})
```

---

## Troubleshooting Common Issues

### Issue: Tests not found

**Solution**: Check glob patterns

```typescript
// Debug patterns
include: ['tests/**/*.test.ts']  // ✓ correct
include: ['test/**/*.test.ts']   // ✗ wrong directory
```

### Issue: TypeScript errors in tests

**Solution**: Add types to tsconfig.json

```json
{
  "compilerOptions": {
    "types": ["vitest/globals"]
  }
}
```

### Issue: Coverage not collected

**Solution**: Install and run with coverage flag

```bash
npm install -D @vitest/coverage-v8
vitest run --coverage
```

### Issue: Module import errors

**Solution**: Configure ESM or CommonJS properly

```typescript
// For ESM-only packages
ssr: {
  noExternal: ['esm-package-name'],
}
```

### Issue: Tests slow on first run

**Solution**: Warm up and use threads

```typescript
export default defineConfig({
  test: {
    threads: true,
    maxThreads: 4,
  },
})
```

### Issue: Mock not resetting

**Solution**: Reset in beforeEach

```typescript
beforeEach(() => {
  vi.clearAllMocks()
  vi.resetModules()
})
```

---

## Related Files

- Main documentation: `/plan/P1M1/research/vitest-setup.md`
- Quick start: `/plan/P1M1/research/VITEST_QUICK_START.md`
- Code examples: `/plan/P1M1/research/vitest-examples.ts`

---

## Official References

- **Vitest Docs**: https://vitest.dev
- **Configuration**: https://vitest.dev/config/
- **Advanced API**: https://vitest.dev/advanced/api/
- **GitHub**: https://github.com/vitest-dev/vitest
