# TypeScript ESM Research Index

Complete research on setting up TypeScript with ESM module support for Node.js 20+.

## Document Structure

### 1. **quick-config-reference.md** (START HERE)
- One-page reference with copy-paste ready configurations
- Minimal tsconfig.json example
- Minimal package.json example
- Common mistakes to avoid
- Troubleshooting quick reference
- **Best for:** Quick setup and quick reference

### 2. **typescript-esm-setup.md** (COMPREHENSIVE GUIDE)
- Complete best practices research (817 lines)
- Official documentation links
- Detailed configuration explanations
- 14 major sections covering all aspects:
  1. Official Documentation sources
  2. Recommended tsconfig.json configuration
  3. package.json configuration
  4. Import path requirements in ESM
  5. Declaration files (.d.ts) best practices
  6. Source maps configuration
  7. Common pitfalls and solutions
  8. Running TypeScript in development
  9. Strict mode deep dive
  10. Complete example project structure
  11. Node.js 23.6+ direct TypeScript execution
  12. Comparison: Node16 vs NodeNext
  13. ESM vs CJS interoperability
  14. Development tools configuration
  15. Complete checklist
  16. Additional resources
  17. Key takeaways

- **Best for:** Deep understanding and comprehensive reference

## Key Files Created

```
/home/dustin/projects/mdsel/plan/P1M1/research/
├── 00-TYPESCRIPT-ESM-INDEX.md          ← You are here
├── quick-config-reference.md           ← START: Copy-paste configs
├── typescript-esm-setup.md             ← FULL: Comprehensive guide
├── commander-setup.md                  ← CLI framework guide
├── eslint-setup.md                     ← Linting configuration
├── prettier-setup.md                   ← Code formatting
├── vitest-setup.md                     ← Testing framework
├── README.md                           ← Research overview
└── RESEARCH_SUMMARY.md                 ← Summary of all research
```

## Quick Start (5 Minutes)

1. Open `quick-config-reference.md`
2. Copy the minimal tsconfig.json (Section 1)
3. Copy the minimal package.json (Section 2)
4. Review import examples (Section 3)
5. Check mistakes to avoid (Section 4)

## Complete Learning Path (30 Minutes)

1. Read `typescript-esm-setup.md` sections 1-5 (Setup & Config)
2. Read sections 6-7 (Source maps & Gotchas)
3. Read sections 8-9 (Development & Strict mode)
4. Review section 15 (Checklist)
5. Bookmark section 16 (Resources)

## Core Concepts

### TypeScript Configuration for Node.js 20+ ESM

**Three Critical Settings:**
- `"module": "NodeNext"` - Future-proof module system
- `"moduleResolution": "NodeNext"` - Aligns with Node.js resolution
- `"target": "ES2022"` - Modern JavaScript features

### package.json Critical Setting

- `"type": "module"` - Declares the entire project as ESM

### Import Rules in ESM

- **MUST include .js extensions** in all relative imports
- Use `.js` even though source is `.ts` (because TypeScript compiles to .js)
- Exceptions: node_modules packages, can omit extension

### Common Pitfalls

1. Missing `.js` extensions in imports
2. Using `.ts` extension in imports
3. Forgetting `"type": "module"` in package.json
4. Using `require()` instead of `import`
5. Using `__dirname` without polyfill
6. Importing JSON without assertion
7. Misunderstanding the "exports" field

## Official Sources Referenced

### TypeScript Official Documentation
- [ECMAScript Modules in Node.js](https://www.typescriptlang.org/docs/handbook/esm-node.html)
- [TSConfig Reference](https://www.typescriptlang.org/tsconfig/)
- [Modules: Choosing Compiler Options](https://www.typescriptlang.org/docs/handbook/modules/guides/choosing-compiler-options.html)

### Node.js Official Documentation
- [Node.js ESM Documentation](https://nodejs.org/api/esm.html)

### Community Guides
- [DEV Community: Node.js, TypeScript and ESM](https://dev.to/a0viedo/nodejs-typescript-and-esm-it-doesnt-have-to-be-painful-438e)
- [2ality: TypeScript ESM on Node.js](https://2ality.com/2021/06/typescript-esm-nodejs.html)
- [Modern Node.js + TypeScript Setup for 2025](https://dev.to/woovi/a-modern-nodejs-typescript-setup-for-2025-nlk)
- [Total TypeScript: Configuring TypeScript](https://www.totaltypescript.com/books/total-typescript-essentials/configuring-typescript)

## Configuration Comparison Tables

### Module vs ModuleResolution

| Setting | Value | Use Case |
|---------|-------|----------|
| module | NodeNext | Node.js projects (recommended) |
| module | Node16 | Legacy Node.js support |
| module | ESNext | Bundler-based projects |
| moduleResolution | NodeNext | Node.js projects (recommended) |
| moduleResolution | Node16 | Legacy Node.js support |
| moduleResolution | bundler | Bundler projects only |

### Target Compatibility with Node.js

| Node.js Version | Recommended Target | Features |
|-----------------|-------------------|----------|
| 20+ | ES2022 | Top-level await, optional chaining, nullish coalescing |
| 18 | ES2021 | WeakRef, FinalizationRegistry |
| 16 | ES2020 | Optional chaining, nullish coalescing, BigInt |

## tsconfig.json Options Reference

### Required for ESM
- `target`: "ES2022" or higher
- `module`: "NodeNext"
- `moduleResolution`: "NodeNext"

### Recommended (Strict)
- `strict`: true
- `esModuleInterop`: true
- `skipLibCheck`: true
- `forceConsistentCasingInFileNames`: true
- `isolatedModules`: true
- `resolveJsonModule`: true

### For Libraries
- `declaration`: true
- `declarationMap`: true
- `sourceMap`: true

### For Maximum Safety
- `noUncheckedIndexedAccess`: true
- `noImplicitReturns`: true
- `noFallthroughCasesInSwitch`: true
- `verbatimModuleSyntax`: true

## Development Tools

### Running TypeScript

1. **tsx** (Recommended)
   - Zero config
   - Fastest
   - Best for development

2. **ts-node with ESM flag**
   - `node --loader ts-node/esm`
   - Requires tsconfig setup

3. **Build then run**
   - `npm run build && npm start`
   - Best for production

### Type Checking
- `tsc --noEmit` - Check types without emitting files
- Run in CI to catch errors early

## Project Checklist (Before Coding)

Essential setup items:

```
Setup Phase:
- [ ] Create tsconfig.json (copy from quick-config-reference.md)
- [ ] Create package.json with "type": "module"
- [ ] Run npm install typescript tsx
- [ ] Create src/ directory
- [ ] Create src/index.ts entry point

Development Phase:
- [ ] Verify imports use .js extensions
- [ ] Run npm run type-check (must pass)
- [ ] Run npm run dev (must work)
- [ ] Run npm run build (must succeed)

Quality Phase:
- [ ] Run linter (eslint)
- [ ] Run formatter (prettier)
- [ ] Run tests (vitest)
- [ ] Verify source maps work in debugger
- [ ] Test production build locally
```

## ESM Gotchas Summary

### Extension Requirements
```typescript
// ESM requires explicit extensions (strict Node.js behavior)
import x from './file.js';  // REQUIRED
import x from './file';     // FAILS
```

### __dirname Workaround
```typescript
import { fileURLToPath } from 'url';
const __dirname = dirname(fileURLToPath(import.meta.url));
```

### JSON Import
```typescript
// Modern way (Node.js 17.5+)
import data from './data.json' assert { type: 'json' };
```

### No require()
```typescript
// Use import only
import express from 'express';  // ✓
const express = require('express');  // ✗
```

## Performance Tips

1. Use `skipLibCheck: true` - Skips type-checking node_modules
2. Use `isolatedModules: true` - Faster transpilation
3. Use `tsx` for development - Much faster than ts-node
4. Enable source maps only in development - Improves production size

## Debugging with Source Maps

```bash
# Enable source maps at runtime
node --enable-source-maps dist/index.js

# In development environment
NODE_OPTIONS=--enable-source-maps npm start

# VS Code launch.json
{
  "version": "0.2.0",
  "configurations": [
    {
      "type": "node",
      "request": "launch",
      "name": "Launch Program",
      "program": "${workspaceFolder}/dist/index.js",
      "preLaunchTask": "npm: build",
      "outFiles": ["${workspaceFolder}/dist/**/*.js"]
    }
  ]
}
```

## Related Research Documents

This index is part of a comprehensive TypeScript/Node.js setup research suite:

- **typescript-esm-setup.md** - ESM configuration (YOU ARE HERE - focused section)
- **commander-setup.md** - CLI framework configuration
- **eslint-setup.md** - Code linting setup
- **prettier-setup.md** - Code formatting setup
- **vitest-setup.md** - Unit testing setup

All documents follow the same structure:
1. Official documentation links
2. Recommended configuration
3. Best practices
4. Common pitfalls
5. Complete examples

## Key Takeaways

1. **NodeNext is the future** - Use it for all new projects
2. **Extensions are mandatory** - No shortcuts in ESM
3. **"type": "module" is essential** - In package.json
4. **Strict mode is default** - Recommended and enabled
5. **tsx is best for dev** - Simple, fast, reliable
6. **Build everything for production** - Don't rely on runtime transpilation
7. **Source maps are important** - For debugging and error reporting
8. **Declaration files matter** - Especially for libraries

---

**Last Updated:** December 25, 2025
**Research Scope:** TypeScript 5.4+, Node.js 20+, Best Practices 2025
**Status:** Complete and verified against official documentation
