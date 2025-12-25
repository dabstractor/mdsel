# Vitest 1.x - Quick Start Guide

## TL;DR - Fastest Setup for Node.js CLI Project

### 1. Install Dependencies

```bash
npm install -D vitest @vitest/coverage-v8 typescript
```

### 2. Create vitest.config.ts

```typescript
import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    include: ['tests/**/*.test.ts', 'src/**/*.test.ts'],
    exclude: ['node_modules', 'dist'],
    typecheck: {
      enabled: true,
      tsconfig: './tsconfig.json',
    },
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html'],
      include: ['src/**/*.ts'],
      exclude: ['**/*.test.ts', '**/node_modules/**', '**/dist/**'],
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

### 3. Update tsconfig.json

Add to `compilerOptions`:

```json
{
  "compilerOptions": {
    "types": ["vitest/globals", "node"]
  }
}
```

### 4. Add to package.json

```json
{
  "scripts": {
    "test": "vitest",
    "test:coverage": "vitest run --coverage",
    "test:ui": "vitest --ui"
  }
}
```

### 5. Create a Test File

```typescript
// src/example.test.ts
describe('example tests', () => {
  it('should pass', () => {
    expect(1 + 1).toBe(2)
  })
})
```

### 6. Run Tests

```bash
npm test                  # Watch mode
npm run test:coverage     # With coverage report
npm run test:ui           # UI dashboard
```

---

## Common Configurations by Use Case

### Separate Test Directory

```typescript
include: ['tests/**/*.test.ts']
```

### Colocated with Source

```typescript
include: ['src/**/*.test.ts', 'src/**/*.spec.ts']
```

### Multiple Test Types

```typescript
projects: [
  { name: 'unit', test: { include: ['src/**/*.unit.test.ts'] } },
  { name: 'integration', test: { include: ['tests/**/*.integration.test.ts'] } },
]
```

---

## Key Configuration Options

| Option | Purpose | Example |
|--------|---------|---------|
| `globals` | No-import test APIs | `globals: true` |
| `environment` | Runtime environment | `environment: 'node'` |
| `include` | Test file patterns | `include: ['tests/**/*.test.ts']` |
| `exclude` | Exclude patterns | `exclude: ['node_modules', 'dist']` |
| `typecheck.enabled` | Enable TypeScript checking | `enabled: true` |
| `coverage.provider` | Coverage tool | `provider: 'v8'` |
| `coverage.thresholds` | Coverage requirements | `lines: 85` |

---

## Coverage Configuration

### Basic Setup

```typescript
coverage: {
  provider: 'v8',
  reporter: ['text', 'html'],
  include: ['src/**/*.ts'],
  exclude: ['**/*.test.ts', '**/node_modules/**'],
}
```

### With Thresholds

```typescript
coverage: {
  provider: 'v8',
  reporter: ['text', 'json', 'html', 'lcov'],
  include: ['src/**/*.ts'],
  thresholds: {
    lines: 85,
    functions: 85,
    branches: 85,
    statements: 85,
  },
}
```

### With Auto-Update

```typescript
coverage: {
  thresholds: {
    autoUpdate: true,
    lines: 85,
    functions: 85,
    branches: 85,
    statements: 85,
  },
}
```

---

## CLI Commands

```bash
# Run tests once
vitest run

# Run in watch mode
vitest

# Run with coverage
vitest run --coverage

# Run specific file
vitest run src/utils.test.ts

# Run matching pattern
vitest run --grep "validation"

# UI dashboard
vitest --ui

# Debug mode
vitest --inspect-brk --no-file-parallelism

# Generate coverage report
vitest run --coverage
open coverage/index.html
```

---

## TypeScript Integration

### Globals without Imports

When `globals: true` and tsconfig includes `"types": ["vitest/globals"]`:

```typescript
// No imports needed!
describe('tests', () => {
  it('works', () => {
    expect(true).toBe(true)
  })
})
```

### Setup File (Optional)

Create `tests/setup.ts`:

```typescript
import { afterEach } from 'vitest'

afterEach(() => {
  // Reset mocks, clear state, etc.
})
```

Add to config:

```typescript
setupFiles: ['./tests/setup.ts']
```

---

## ESM Configuration

### package.json

```json
{
  "type": "module",
  "scripts": {
    "test": "vitest"
  },
  "devDependencies": {
    "vitest": "^1.0.0",
    "@vitest/coverage-v8": "^1.0.0"
  }
}
```

### tsconfig.json

```json
{
  "compilerOptions": {
    "target": "ESNext",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "types": ["vitest/globals"]
  }
}
```

---

## Troubleshooting

### Tests Not Found

Check `include` and `exclude` patterns:

```typescript
include: ['tests/**/*.test.ts', 'src/**/*.test.ts']
exclude: ['node_modules', 'dist']
```

### TypeScript Errors in Tests

Ensure tsconfig.json includes:

```json
{
  "compilerOptions": {
    "types": ["vitest/globals"]
  }
}
```

### Coverage Not Generated

1. Install coverage provider: `npm install -D @vitest/coverage-v8`
2. Run with: `vitest run --coverage`
3. Check `include` paths in coverage config

### ESM Import Errors

Add to vitest.config.ts:

```typescript
ssr: {
  noExternal: ['esm-only-package-name'],
}
```

---

## Documentation References

- **Official Docs**: https://vitest.dev
- **Configuration**: https://vitest.dev/config/
- **Coverage**: https://vitest.dev/guide/coverage.html
- **CLI**: https://vitest.dev/guide/cli
- **GitHub**: https://github.com/vitest-dev/vitest

---

## Next Steps

1. Create `vitest.config.ts` with basic configuration
2. Update `tsconfig.json` to include Vitest globals type
3. Create first test file in `tests/` or `src/`
4. Run `npm test` to verify setup
5. Configure coverage thresholds for your project
6. Add to CI/CD pipeline with `npm run test:coverage`

---

For detailed configuration options, see `/plan/P1M1/research/vitest-setup.md`

For code examples, see `/plan/P1M1/research/vitest-examples.ts`
