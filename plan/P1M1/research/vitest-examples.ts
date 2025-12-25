/**
 * Vitest 1.x Configuration Examples for TypeScript Node.js Projects
 * Reference: https://vitest.dev
 */

// ============================================================================
// EXAMPLE 1: Minimal Configuration (Node.js CLI)
// ============================================================================

// vitest.config.ts
import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    include: ['tests/**/*.test.ts', 'src/**/*.test.ts'],
    exclude: ['node_modules', 'dist'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html'],
      include: ['src/**/*.ts'],
    },
  },
})

// ============================================================================
// EXAMPLE 2: Production Configuration with Thresholds
// ============================================================================

// vitest.config.ts
import { defineConfig, configDefaults } from 'vitest/config'

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',

    // Test discovery
    include: ['tests/**/*.{test,spec}.ts', 'src/**/*.{test,spec}.ts'],
    exclude: [...configDefaults.exclude, '**/node_modules/**'],

    // Test timeouts
    testTimeout: 10000,
    hookTimeout: 10000,

    // Setup and teardown
    setupFiles: ['./tests/setup.ts'],
    globalSetup: ['./tests/globalSetup.ts'],

    // TypeScript support
    typecheck: {
      enabled: true,
      tsconfig: './tsconfig.json',
    },

    // Coverage configuration with v8 provider
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'json-summary', 'html', 'lcov'],
      reportOnFailure: true,

      // What to include in coverage
      include: ['src/**/*.ts'],
      exclude: [
        '**/*.test.ts',
        '**/*.spec.ts',
        '**/node_modules/**',
        '**/dist/**',
        '**/types/**',
      ],

      // Coverage quality gates
      thresholds: {
        lines: 85,
        functions: 85,
        branches: 85,
        statements: 85,
      },

      // Output directory
      outputDir: './coverage',
      clean: true,
      cleanOnRerun: true,
    },
  },
})

// ============================================================================
// EXAMPLE 3: ESM Project Configuration
// ============================================================================

// package.json
{
  "type": "module",
  "name": "my-cli-app",
  "version": "1.0.0",
  "main": "./dist/index.js",
  "scripts": {
    "test": "vitest",
    "test:ui": "vitest --ui",
    "test:coverage": "vitest run --coverage",
  },
  "devDependencies": {
    "vitest": "^1.0.0",
    "@vitest/coverage-v8": "^1.0.0",
    "typescript": "^5.0.0",
  }
}

// tsconfig.json
{
  "compilerOptions": {
    "target": "ESNext",
    "module": "ESNext",
    "lib": ["ESNext"],
    "moduleResolution": "bundler",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "types": ["vitest/globals", "node"]
  },
  "include": ["src/**/*.ts", "tests/**/*.ts"],
  "exclude": ["node_modules", "dist"]
}

// vitest.config.ts
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
    },
  },
})

// ============================================================================
// EXAMPLE 4: Multi-Project Configuration (Unit/Integration/E2E)
// ============================================================================

// vitest.config.ts
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
          isolate: true,
        },
      },
    ],

    coverage: {
      provider: 'v8',
      reporter: ['text', 'html'],
      include: ['src/**/*.ts'],
    },
  },
})

// ============================================================================
// EXAMPLE 5: Coverage Configuration Details
// ============================================================================

coverage: {
  // Provider selection (v8 is default and recommended for Node.js)
  provider: 'v8',

  // Enable/disable coverage
  enabled: true,

  // What files to include in coverage
  include: ['src/**/*.ts'],

  // What files to exclude from coverage
  exclude: [
    '**/*.test.ts',
    '**/*.spec.ts',
    '**/node_modules/**',
    '**/dist/**',
    '**/types/**',      // Type definitions
    '**/constants/**',  // Constants files
  ],

  // Report formats
  reporter: [
    'text',           // Console output
    'text-summary',   // Summary only in console
    'json',           // JSON format for CI/CD
    'json-summary',   // JSON summary
    'html',           // HTML report (open coverage/index.html)
    'lcov',           // LCOV format (for Codecov, Coveralls)
    'clover',         // Clover format
  ],

  // Coverage thresholds - fail if below these percentages
  thresholds: {
    // Global thresholds (all files)
    lines: 85,
    functions: 85,
    branches: 85,
    statements: 85,

    // File-specific thresholds using glob patterns
    'src/critical/**.ts': { lines: 95, functions: 95 },
    'src/utils/**.ts': { lines: 90 },

    // Negative numbers = max uncovered items allowed
    // 'src/legacy/**.ts': { lines: -10 }
  },

  // Auto-update thresholds when coverage improves
  // autoUpdate: true,

  // Minimum coverage before checking thresholds
  // perFile: true,

  // Output configuration
  outputDir: './coverage',
  reportsDirectory: './coverage',
  clean: true,        // Clean dir before run
  cleanOnRerun: true, // Clean on watch rerun

  // Report on test failure
  reportOnFailure: true,

  // Skip files with 100% coverage in reports
  skipFull: false,
}

// ============================================================================
// EXAMPLE 6: TypeScript Configuration with Type Checking
// ============================================================================

// vitest.config.ts
import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',

    // Enable TypeScript type checking
    typecheck: {
      enabled: true,
      tsconfig: './tsconfig.json',

      // Optional: only check test files
      include: ['tests/**/*.test.ts', 'src/**/*.test.ts'],

      // Optional: ignore certain patterns
      exclude: ['node_modules/**', 'dist/**'],
    },

    include: ['**/*.test.ts', '**/*.spec.ts'],
  },
})

// ============================================================================
// EXAMPLE 7: Setup Files and Hooks
// ============================================================================

// vitest.config.ts
import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',

    // Global setup - runs once before all tests
    globalSetup: ['./tests/globalSetup.ts'],

    // Per-file setup - runs before each test file
    setupFiles: ['./tests/setup.ts'],

    include: ['tests/**/*.test.ts'],
  },
})

// tests/setup.ts
import { afterEach, beforeAll, afterAll } from 'vitest'

beforeAll(() => {
  console.log('Test suite starting...')
})

afterEach(() => {
  // Reset mocks, clear state, etc.
})

afterAll(() => {
  console.log('Test suite finished')
})

// tests/globalSetup.ts
export async function setup() {
  console.log('Setting up test environment...')
  // Initialize databases, start servers, etc.
}

export async function teardown() {
  console.log('Tearing down test environment...')
  // Close databases, stop servers, etc.
}

// ============================================================================
// EXAMPLE 8: Test File Examples
// ============================================================================

// src/utils/add.test.ts
import { describe, it, expect } from 'vitest'
import { add } from './add'

describe('add function', () => {
  it('should add two numbers', () => {
    expect(add(1, 2)).toBe(3)
  })

  it('should handle negative numbers', () => {
    expect(add(-1, -2)).toBe(-3)
  })
})

// With globals: true, you can omit imports:
// src/utils/multiply.test.ts
describe('multiply function', () => {
  it('should multiply two numbers', () => {
    expect(multiply(2, 3)).toBe(6)
  })
})

// ============================================================================
// EXAMPLE 9: Package.json Scripts
// ============================================================================

{
  "scripts": {
    // Run tests in watch mode
    "test": "vitest",

    // Run tests once
    "test:run": "vitest run",

    // Run with coverage
    "test:coverage": "vitest run --coverage",

    // Run specific file
    "test:file": "vitest run src/utils.test.ts",

    // Run matching pattern
    "test:pattern": "vitest run --grep validation",

    // UI dashboard
    "test:ui": "vitest --ui",

    // Debug mode
    "test:debug": "vitest --inspect-brk --no-file-parallelism",

    // CI environment
    "test:ci": "vitest run --coverage --reporter=verbose"
  }
}

// ============================================================================
// EXAMPLE 10: Glob Pattern Examples
// ============================================================================

// Separate tests directory
include: ['tests/**/*.test.ts']

// Colocated with source
include: ['src/**/*.test.ts', 'src/**/*.spec.ts']

// Multiple patterns
include: [
  'tests/unit/**/*.test.ts',
  'tests/integration/**/*.test.ts',
  'src/**/__tests__/**/*.test.ts',
]

// Exclude patterns
exclude: [
  '**/node_modules/**',
  '**/dist/**',
  '**/.git/**',
  '**/.idea/**',
  '**/e2e/**',
  '**/fixtures/**',
]

// ============================================================================
// Official Documentation References
// ============================================================================

/*
Main Documentation: https://vitest.dev
Configuration Guide: https://vitest.dev/config/
Getting Started: https://vitest.dev/guide/
Coverage Configuration: https://vitest.dev/config/coverage
Coverage Guide: https://vitest.dev/guide/coverage.html
CLI Guide: https://vitest.dev/guide/cli
Test Projects: https://vitest.dev/guide/projects
Advanced API: https://vitest.dev/advanced/api/

GitHub Repository: https://github.com/vitest-dev/vitest
Coverage V8 Package: https://www.npmjs.com/package/@vitest/coverage-v8
*/
