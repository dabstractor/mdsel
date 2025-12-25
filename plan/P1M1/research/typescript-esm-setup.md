# TypeScript ESM Setup for Node.js 20+ - Best Practices Research

## Overview

This document consolidates best practices and official guidance for setting up TypeScript projects with ESM (ECMAScript Modules) support on Node.js 20+. It covers configuration, common pitfalls, and actionable examples based on official TypeScript documentation and industry standards.

**Date of Research:** December 25, 2025
**Node.js Target:** 20.x and later
**TypeScript Module System:** NodeNext (future-proof)

---

## 1. Official Documentation

### Primary Sources

- **TypeScript Handbook - ECMAScript Modules in Node.js**
  https://www.typescriptlang.org/docs/handbook/esm-node.html

  Official TypeScript documentation covering ESM setup, configuration, and best practices for Node.js environments.

- **TypeScript TSConfig Reference**
  https://www.typescriptlang.org/tsconfig/

  Complete reference for all compiler options and configuration settings available in `tsconfig.json` files.

- **TypeScript Documentation - Modules: Choosing Compiler Options**
  https://www.typescriptlang.org/docs/handbook/modules/guides/choosing-compiler-options.html

  Guidance on selecting the correct `module` and `moduleResolution` settings for different environments.

- **Node.js Official ESM Documentation**
  https://nodejs.org/api/esm.html

  Official Node.js documentation on ECMAScript modules, covering file extensions, import/export behavior, and package.json configuration.

---

## 2. Recommended tsconfig.json Configuration

### 2.1 Complete Best Practices Configuration

```json
{
  "compilerOptions": {
    // Target ES2022 - Node.js 20 supports all ES2022 features
    "target": "ES2022",

    // Use NodeNext for future-proof module resolution
    "module": "NodeNext",
    "moduleResolution": "NodeNext",

    // Output configuration
    "outDir": "./dist",
    "rootDir": "./src",

    // Declaration files for library distribution
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true,

    // Strict type checking - enables all strict checks
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    "strictFunctionTypes": true,
    "strictBindCallApply": true,
    "strictPropertyInitialization": true,
    "noImplicitThis": true,
    "useUnknownInCatchVariables": true,
    "alwaysStrict": true,

    // Additional type safety options
    "noUncheckedIndexedAccess": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true,
    "exactOptionalPropertyTypes": false,

    // ESM interoperability
    "esModuleInterop": true,
    "allowSyntheticDefaultImports": true,
    "verbatimModuleSyntax": true,

    // Module detection and isolation
    "moduleDetection": "force",
    "isolatedModules": true,

    // Other important options
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "allowJs": false,

    // TypeScript file imports (development only)
    // Only enable if using --noEmit or with build tools
    // "allowImportingTsExtensions": true
  },
  "include": ["src"],
  "exclude": ["node_modules", "dist"]
}
```

### 2.2 Configuration Explanation

| Option | Value | Rationale |
|--------|-------|-----------|
| `target` | `ES2022` | Node.js 20+ fully supports ES2022 features including top-level await |
| `module` | `NodeNext` | Future-proof module system setting that stays up-to-date with Node.js |
| `moduleResolution` | `NodeNext` | Aligns TypeScript resolution with Node.js native resolution algorithm |
| `declaration` | `true` | Generate `.d.ts` files for library distribution and IDE support |
| `sourceMap` | `true` | Enable source maps for debugging compiled code |
| `declarationMap` | `true` | Map generated `.d.ts` files back to original `.ts` for better IDE navigation |
| `strict` | `true` | Enable comprehensive type checking (best practice) |
| `verbatimModuleSyntax` | `true` | Prevent accidental CommonJS contamination in ESM code |
| `isolatedModules` | `true` | Ensure each file can be transpiled independently |
| `moduleDetection` | `force` | Force TypeScript to treat all files as modules |

---

## 3. package.json Configuration

### 3.1 ESM-First Project Setup

```json
{
  "name": "your-project-name",
  "version": "1.0.0",
  "type": "module",
  "description": "Your project description",

  "main": "./dist/index.js",
  "module": "./dist/index.js",
  "types": "./dist/index.d.ts",

  "exports": {
    ".": {
      "types": "./dist/index.d.ts",
      "import": "./dist/index.js"
    }
  },

  "files": [
    "dist",
    "README.md",
    "LICENSE"
  ],

  "scripts": {
    "build": "tsc",
    "dev": "tsx src/index.ts",
    "start": "node dist/index.js",
    "type-check": "tsc --noEmit",
    "test": "jest"
  },

  "devDependencies": {
    "typescript": "^5.4",
    "tsx": "^4.7"
  }
}
```

### 3.2 Key package.json Fields

- **`"type": "module"`** - Critical setting that tells Node.js to treat `.js` files as ES modules (uses `import`/`export` syntax)
- **`"exports"`** - Controls what consumers can import from your package; blocks deep imports unless explicitly allowed
- **`"types"`** - Tells TypeScript where to find type definitions
- **`"main"` and `"module"`** - Both point to the same `.js` file for ES-only projects

### 3.3 Important Notes About "type": "module"

When `"type": "module"` is set:

1. All `.js` and `.d.ts` files in the project are treated as ES modules
2. `.json` files must use import assertions: `import pkg from './package.json' assert { type: 'json' }`
3. Use `.cjs` files to explicitly mark code as CommonJS (overrides `"type": "module"`)
4. Use `.mjs` files to explicitly mark code as ES modules (optional, but clear)
5. Use `.mts` for TypeScript files that should compile to `.mjs`
6. Use `.cts` for TypeScript files that should compile to `.cjs`

---

## 4. Import Path Requirements in ESM

### 4.1 Mandatory File Extensions

**Critical Rule:** When using ESM in Node.js, you MUST include file extensions in all relative import paths.

#### Correct ESM Imports

```typescript
// Import from local modules - MUST include .js extension
import { MyClass } from './utils/MyClass.js';
import { helper } from './helpers/index.js';

// Import from packages
import express from 'express';
import { readFile } from 'fs/promises';

// Import JSON with assertion (Node.js 17.5+)
import config from './config.json' assert { type: 'json' };

// Dynamic imports
const module = await import('./dynamic-module.js');
```

#### Incorrect ESM Imports (Will Fail)

```typescript
// WRONG - Missing extension
import { MyClass } from './utils/MyClass';
import { helper } from './helpers';

// WRONG - Using require (requires "type": "module" workaround)
const express = require('express');
```

### 4.2 Why Extensions Are Required

- Node.js ESM resolution is strict and explicit
- TypeScript compiles `.ts` to `.js`, so imports must reference the output file extension
- This prevents ambiguity and aligns with web standards
- CommonJS allowed omission, but ESM does not

---

## 5. Declaration Files (.d.ts) Best Practices

### 5.1 Basic Declaration Configuration

```json
{
  "compilerOptions": {
    "declaration": true,
    "declarationDir": "./dist",
    "declarationMap": true,
    "sourceMap": true,
    "emitDeclarationOnly": false
  }
}
```

### 5.2 Declaration File Generation

- **`declaration: true`** - Generates `.d.ts` files alongside compiled JavaScript
- **`declarationMap: true`** - Creates `.d.ts.map` files for IDE "Go to Definition" support
- **`declarationDir`** - Optionally separate output directory for declarations
- **`emitDeclarationOnly: true`** - Only emit declaration files, skip JavaScript output (useful in monorepos)

### 5.3 Declaration File Extensions for ESM

TypeScript supports specific declaration file extensions for proper ESM/CJS distinction:

```typescript
// src/index.ts -> dist/index.d.ts (for ESM with "type": "module")
// src/index.mts -> dist/index.d.mts (explicitly ESM declaration)
// src/index.cts -> dist/index.d.cts (explicitly CommonJS declaration)
```

---

## 6. Source Maps Configuration

### 6.1 Source Map Settings

```json
{
  "compilerOptions": {
    "sourceMap": true,
    "sourceRoot": "./src",
    "mapRoot": "./dist"
  }
}
```

### 6.2 Source Map Benefits

- **Debugging**: Maps compiled `.js` back to original `.ts` source in debuggers
- **Error Reporting**: Stack traces point to original TypeScript source
- **Performance**: Should be disabled in production builds if disk space is a concern
- **File Size**: `.js.map` files are typically 2-3x larger than their `.js` counterparts

### 6.3 Source Map Usage in Node.js

```bash
# Debug Node.js scripts with source maps
node --enable-source-maps dist/index.js

# In development/CI
NODE_OPTIONS=--enable-source-maps npm start
```

---

## 7. Common Pitfalls and Solutions

### Pitfall 1: Missing File Extensions

**Problem:**
```
ERR_MODULE_NOT_FOUND: Cannot find module './utils' imported from /app/dist/index.js
```

**Solution:**
```typescript
// WRONG
import { helper } from './utils';

// CORRECT
import { helper } from './utils/index.js';
// or if utils is a file
import { helper } from './utils.js';
```

### Pitfall 2: Importing JSON Files

**Problem:**
```
TypeError [ERR_IMPORT_ASSERTION_TYPE_MISSING]: Module needs an import attribute of type "json"
```

**Solution:**
```typescript
// CORRECT - Use import assertion (Node.js 17.5+)
import config from './config.json' assert { type: 'json' };

// Alternative - Manual import for Node.js <17.5
import { readFileSync } from 'fs';
const config = JSON.parse(readFileSync('./config.json', 'utf-8'));
```

### Pitfall 3: Using `__dirname` in ESM

**Problem:**
```
ReferenceError: __dirname is not defined in ES module scope
```

**Solution:**
```typescript
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Now you can use __dirname and __filename
console.log(__dirname);
```

### Pitfall 4: Mixing require() and import

**Problem:**
```typescript
// This won't work in ESM
const express = require('express');
```

**Solution:**
```typescript
// Use import syntax exclusively
import express from 'express';
```

### Pitfall 5: Blocking Exports with "exports" Field

**Problem:**
```typescript
// If package.json has "exports" field, deep imports don't work
import { internal } from 'my-package/dist/internal.js'; // Error!
```

**Solution:**
```json
{
  "exports": {
    ".": "./dist/index.js",
    "./internal": "./dist/internal.js"
  }
}
```

### Pitfall 6: Incorrect TypeScript File Extensions

**Problem:**
```typescript
import { helper } from './utils.ts'; // Error in ESM with "type": "module"
```

**Solution:**
```typescript
// Use .js extension (the compiled output)
import { helper } from './utils.js';

// OR use allowImportingTsExtensions (development/no-emit only)
// In tsconfig.json with --noEmit or --emitDeclarationOnly
```

### Pitfall 7: Default vs Named Exports

**Problem:**
```typescript
// CommonJS style default export doesn't always work
export default MyClass; // May cause issues in some cases
```

**Best Practice:**
```typescript
// Use named exports for better compatibility
export class MyClass { }
export function helper() { }

// Default exports are OK but named is more explicit
export { MyClass as default };
```

### Pitfall 8: Module Type Confusion

**Problem:**
```json
{
  "exports": {
    "import": "./dist/index.cjs",  // WRONG
    "require": "./dist/index.js"   // WRONG - swapped
  }
}
```

**Correct:**
```json
{
  "exports": {
    "import": "./dist/index.js",   // ESM goes here
    "require": "./dist/index.cjs"  // CJS goes here
  }
}
```

---

## 8. Running TypeScript Code in Development

### 8.1 Recommended Approaches

**Option 1: Using `tsx` (Recommended)**
```bash
npm install -D tsx

# In package.json
"scripts": {
  "dev": "tsx src/index.ts",
  "dev:watch": "tsx watch src/index.ts"
}
```

**Option 2: Using `ts-node` with ESM**
```bash
npm install -D ts-node

# In tsconfig.json
{
  "compilerOptions": {
    "module": "NodeNext",
    "moduleResolution": "NodeNext"
  },
  "ts-node": {
    "esm": true
  }
}

# Run with
node --loader ts-node/esm src/index.ts
```

**Option 3: Build then Run**
```bash
npm run build
npm start
```

### 8.2 Why tsx is Recommended

- Zero configuration needed
- Handles ESM correctly by default
- Faster than ts-node
- Better error messages
- Active development and maintenance

---

## 9. Strict Mode Deep Dive

### 9.1 What "strict": true Enables

```json
{
  "compilerOptions": {
    "strict": true
    // Equivalent to enabling:
    // - noImplicitAny
    // - strictNullChecks
    // - strictFunctionTypes
    // - strictBindCallApply
    // - strictPropertyInitialization
    // - noImplicitThis
    // - useUnknownInCatchVariables
    // - alwaysStrict
  }
}
```

### 9.2 Additional Strict Checks (Beyond "strict": true)

```json
{
  "compilerOptions": {
    "strict": true,
    "noUncheckedIndexedAccess": true,      // Arrays/objects need bounds checking
    "noImplicitReturns": true,             // Functions must have explicit returns
    "noFallthroughCasesInSwitch": true,    // Switch cases must break or return
    "exactOptionalPropertyTypes": false     // Keep false unless building library
  }
}
```

### 9.3 Catch Variable Typing

```typescript
// With useUnknownInCatchVariables: true
try {
  // code
} catch (err) {
  // err is type 'unknown', must type-guard
  if (err instanceof Error) {
    console.log(err.message);
  }
}

// Without (err is type 'any')
try {
  // code
} catch (err) {
  console.log(err.message); // Unsafe, but allowed
}
```

---

## 10. Complete Example Project Structure

```
my-project/
├── package.json
├── tsconfig.json
├── src/
│   ├── index.ts              # Main entry point
│   ├── utils/
│   │   ├── index.ts
│   │   └── helpers.ts
│   └── types/
│       └── index.ts
├── dist/                     # Generated by tsc
│   ├── index.js
│   ├── index.d.ts
│   ├── index.d.ts.map
│   └── ...
├── README.md
└── LICENSE
```

### 10.1 Minimal src/index.ts

```typescript
import { greet } from './utils/index.js';

export async function main(): Promise<void> {
  const message = greet('World');
  console.log(message);
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
```

### 10.2 src/utils/index.ts

```typescript
import type { Person } from '../types/index.js';

export function greet(name: string): string {
  return `Hello, ${name}!`;
}

export function createPerson(name: string, age: number): Person {
  return { name, age };
}
```

### 10.3 src/types/index.ts

```typescript
export interface Person {
  name: string;
  age: number;
}

export type Status = 'active' | 'inactive' | 'pending';
```

---

## 11. Alternative: Node.js 23.6+ Direct TypeScript Execution

### 11.1 Using --experimental-strip-types

Starting with Node.js 23.6, you can run TypeScript directly without compilation:

```bash
# package.json
{
  "type": "module",
  "scripts": {
    "dev": "node --experimental-strip-types src/index.ts",
    "start": "node --experimental-strip-types --enable-source-maps src/index.ts"
  }
}
```

### 11.2 Limitations and Considerations

- **Only strips TypeScript syntax** - no type checking
- **Should use alongside `tsc --noEmit`** for type safety
- **Best for development** - still compile for production
- **Requires Node.js 23.6+** - check compatibility for your environment

### 11.3 Recommended CI/Development Setup

```bash
# Development (with type checking)
npm run type-check
npm run dev

# Build for production
npm run build

# Run production build
npm start
```

---

## 12. Comparison: Node16 vs NodeNext

| Aspect | Node16 | NodeNext |
|--------|--------|----------|
| **Future-proof** | No | Yes |
| **Updates** | Frozen at Node 16 | Follows Node evolution |
| **Best for** | Legacy support | Modern projects |
| **Node.js 20+** | Works but outdated | Recommended |
| **Recommendation** | Only if supporting Node 16 | Use this |

---

## 13. TypeScript ESM vs CJS Interoperability

### 13.1 Supporting Both CJS and ESM (Dual Publishing)

If you need to distribute your library in both formats:

```bash
# Two separate builds
npm run build:esm    # tsc -p tsconfig.esm.json
npm run build:cjs    # tsc -p tsconfig.cjs.json
npm run build        # Run both
```

**tsconfig.esm.json:**
```json
{
  "extends": "./tsconfig.json",
  "compilerOptions": {
    "module": "NodeNext",
    "outDir": "./dist/esm"
  }
}
```

**tsconfig.cjs.json:**
```json
{
  "extends": "./tsconfig.json",
  "compilerOptions": {
    "module": "CommonJS",
    "outDir": "./dist/cjs"
  }
}
```

**package.json exports:**
```json
{
  "exports": {
    ".": {
      "types": "./dist/esm/index.d.ts",
      "import": "./dist/esm/index.js",
      "require": "./dist/cjs/index.js"
    }
  }
}
```

### 13.2 Why Dual Publishing is Complex

- Dual Package Hazard: Can create confusing bugs if users import from both paths
- Separate declaration files needed (different semantics)
- Increased build complexity and maintenance burden
- **Recommendation:** Go ESM-only unless legacy support is critical

---

## 14. Development Tools Configuration

### 14.1 jest.config.js (Testing with ESM)

```javascript
export default {
  preset: 'ts-jest',
  testEnvironment: 'node',
  extensionsToTreatAsEsm: ['.ts'],
  moduleNameMapper: {
    '^(\\.{1,2}/.*)\\.js$': '$1',
  },
  transform: {
    '^.+\\.tsx?$': [
      'ts-jest',
      {
        useESM: true,
      },
    ],
  },
};
```

### 14.2 .eslintrc.json (ESLint with ESM)

```json
{
  "parserOptions": {
    "ecmaVersion": 2022,
    "sourceType": "module"
  },
  "env": {
    "node": true,
    "es2022": true
  }
}
```

---

## 15. Checklist for ESM TypeScript Project

- [ ] `"type": "module"` in package.json
- [ ] `"target": "ES2022"` in tsconfig.json
- [ ] `"module": "NodeNext"` in tsconfig.json
- [ ] `"moduleResolution": "NodeNext"` in tsconfig.json
- [ ] `"strict": true` enabled
- [ ] All import paths include `.js` extensions
- [ ] Using `tsx` or equivalent for development
- [ ] No `require()` statements (use `import`)
- [ ] No `__dirname` without proper implementation
- [ ] JSON imports use assertions if needed
- [ ] Build step configured (`npm run build`)
- [ ] Type checking configured (`npm run type-check`)
- [ ] Source maps enabled for debugging
- [ ] Declaration files generated (`declaration: true`)
- [ ] Tests configured for ESM

---

## 16. Additional Resources

### Official Documentation
- [TypeScript Handbook: ESM in Node.js](https://www.typescriptlang.org/docs/handbook/esm-node.html)
- [Node.js ESM Documentation](https://nodejs.org/api/esm.html)
- [TypeScript TSConfig Reference](https://www.typescriptlang.org/tsconfig/)

### Community Guides
- [2ality - TypeScript ESM on Node.js](https://2ality.com/2021/06/typescript-esm-nodejs.html)
- [DEV Community - Node.js, TypeScript and ESM](https://dev.to/a0viedo/nodejs-typescript-and-esm-it-doesnt-have-to-be-painful-438e)
- [A Modern Node.js + TypeScript Setup for 2025](https://dev.to/woovi/a-modern-nodejs-typescript-setup-for-2025-nlk)

### Tools
- [tsx - No-config TypeScript runner](https://github.com/esbuild-kit/tsx)
- [ts-node - Execute TypeScript directly](https://typestrong.org/ts-node/)
- [TypeScript Official](https://www.typescriptlang.org/)

---

## 17. Key Takeaways

1. **Use NodeNext** for `module` and `moduleResolution` - it's future-proof
2. **Always include .js extensions** in ESM imports - this is non-negotiable
3. **Set "type": "module"** in package.json to declare ESM intent
4. **Enable strict mode** for better type safety and catching errors early
5. **Use tsx for development** - it's the simplest, most reliable approach
6. **Generate declaration files** - essential for library authors and IDE support
7. **Enable source maps** - critical for debugging in production
8. **Avoid mixing CommonJS and ESM** in the same project when possible
9. **Test your configuration** - each environment may have subtle differences
10. **Stay current** - TypeScript and Node.js ESM support continuously improve

---

*This research document was compiled from official TypeScript and Node.js documentation, along with community best practices as of December 2025.*
