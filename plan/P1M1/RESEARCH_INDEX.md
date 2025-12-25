# Development Tools Research Index
## Phase 1, Month 1 - Complete Research Documentation

**Research Completed**: December 25, 2025
**Location**: `/home/dustin/projects/mdsel/plan/P1M1/research/`

---

## Prettier 3.x Documentation

### Primary Research Document
- **File**: `prettier-setup.md` (19 KB, 758 lines)
- **Contents**:
  - Official documentation links to all resources
  - Configuration file formats and precedence rules
  - All core options with TypeScript-specific guidance
  - 4 complete setup examples (minimal, standard, with ESLint, overrides)
  - Comprehensive .prettierignore patterns
  - ESLint integration with both flat config and legacy formats
  - NPM scripts from basic to advanced CI/CD
  - Code-level prettier-ignore comments for all supported languages

### Quick Reference
- **File**: `PRETTIER_QUICK_REFERENCE.md` (5.5 KB, 180+ lines)
- **Contents**:
  - One-page reference with all official docs links
  - Configuration options table (defaults vs TypeScript recommended)
  - Copy-paste configuration examples
  - Essential .prettierignore template
  - Complete npm scripts examples
  - ESLint integration code snippet
  - CLI flags reference
  - Troubleshooting guide for common issues

---

## Research Methodology

All research was conducted using:

1. **Official Prettier Documentation** (prettier.io)
   - Configuration pages: https://prettier.io/docs/configuration
   - Options reference: https://prettier.io/docs/options
   - Ignore documentation: https://prettier.io/docs/ignore
   - CLI guide: https://prettier.io/docs/cli.html

2. **Official ESLint Integration** 
   - GitHub repository: https://github.com/prettier/eslint-config-prettier
   - npm package: https://www.npmjs.com/package/eslint-config-prettier

3. **Release Notes**
   - Prettier 3.7 (November 2025): TypeScript/Flow improvements
   - Prettier 3.6 (June 2025): Fast CLI and new plugins
   - Prettier 3.5 (February 2025): TypeScript config file support
   - Prettier 3.0 (July 2023): ESM support

---

## Key Findings Summary

### Configuration Recommendations for TypeScript

**Recommended Settings** (from official docs):
```json
{
  "semi": true,
  "singleQuote": true,
  "tabWidth": 2,
  "useTabs": false,
  "trailingComma": "all",
  "printWidth": 100,
  "bracketSpacing": true,
  "arrowParens": "always",
  "endOfLine": "lf",
  "jsxSingleQuote": false
}
```

### Critical Best Practices

1. **Configuration Files**
   - Use `.prettierrc.json` (all versions) or `.prettierrc.ts` (3.5+, Node 22.6+)
   - Never put `parser` at top level (disables automatic detection)
   - Configuration resolves from file location upward

2. **Quote Selection Strategy**
   > "When it comes to double or single quotes, Prettier chooses the one which results in the fewest number of escapes."

3. **ESLint Integration**
   - Always place `"prettier"` last in extends array
   - Install: `npm install --save-dev eslint-config-prettier`
   - Verify: `npx eslint-config-prettier path/to/file.ts`

4. **.prettierignore Usage**
   - Uses gitignore syntax
   - Prettier automatically ignores: `.git`, `.svn`, `.hg`, `node_modules`
   - Support for code-level comments: `// prettier-ignore`

5. **NPM Scripts**
   - Basic: `prettier --write "src/**/*.{ts,tsx}"`
   - Verification: `prettier --check "src/**/*.{ts,tsx}"` (for CI)
   - With caching: `prettier --write --cache .`

### TypeScript-Specific Insights

- **Parser Detection**: Automatic for `.ts` and `.tsx` files
- **Config File Support**: Prettier 3.5+ supports `.prettierrc.ts` with Node 22.6+
- **JSX Quotes**: Separate `jsxSingleQuote` option (recommended: false)
- **Formatting Improvements**: Prettier 3.7 improved class/interface consistency

### ESLint Integration Details

- **Plugin Names**: Works with `@typescript-eslint` official plugin names
- **Rule Conflicts**: Turns off formatting rules automatically
- **Verification Tool**: Exit codes - 0 (OK), 1 (error), 2 (conflicts)

---

## File Organization

```
/home/dustin/projects/mdsel/plan/P1M1/research/
├── prettier-setup.md                    # Complete guide (758 lines)
├── PRETTIER_QUICK_REFERENCE.md          # One-page reference
├── README.md                            # Research directory index
├── RESEARCH_SUMMARY.md                  # Overall summary
└── [Other tool documentation]
    ├── eslint-setup.md
    ├── eslint-quick-reference.md
    ├── commander-setup.md
    ├── typescript-esm-setup.md
    ├── vitest-setup.md
    ├── tsup-setup.md
    ├── remark-setup.md
    └── [index files]
```

---

## Official Documentation References

### Prettier
- https://prettier.io/docs/configuration
- https://prettier.io/docs/options
- https://prettier.io/docs/ignore
- https://prettier.io/docs/cli.html
- https://prettier.io/docs/editors
- https://www.schemastore.org/prettierrc.json (JSON Schema)

### ESLint Integration
- https://github.com/prettier/eslint-config-prettier
- https://www.npmjs.com/package/eslint-config-prettier

### Blog Posts & Release Notes
- https://prettier.io/blog/2025/11/27/3.7.0 (Prettier 3.7)
- https://prettier.io/blog/2025/02/09/3.5.0 (Prettier 3.5)
- https://prettier.io/blog/2023/07/05/3.0.0.html (Prettier 3.0)

---

## Quick Start Examples

### 1. Minimal Setup
Create `.prettierrc.json`:
```json
{
  "semi": true,
  "singleQuote": true,
  "tabWidth": 2,
  "trailingComma": "all",
  "printWidth": 100,
  "endOfLine": "lf"
}
```

Add to `package.json`:
```json
{
  "scripts": {
    "format": "prettier --write \"src/**/*.{ts,tsx}\"",
    "format:check": "prettier --check \"src/**/*.{ts,tsx}\""
  }
}
```

### 2. With ESLint
Install: `npm install --save-dev eslint-config-prettier`

Add to `eslint.config.mjs`:
```javascript
import prettier from 'eslint-config-prettier';
export default [
  // ... other configs
  prettier  // Must be last!
];
```

### 3. With TypeScript Config (3.5+)
Create `prettier.config.ts`:
```typescript
import type { Config } from 'prettier';

export default {
  semi: true,
  singleQuote: true,
  tabWidth: 2,
  trailingComma: 'all',
  printWidth: 100,
  endOfLine: 'lf',
} satisfies Config;
```

---

## Verification Checklist

- [x] Official Prettier documentation reviewed
- [x] All configuration options documented
- [x] TypeScript-specific considerations covered
- [x] ESLint integration thoroughly explained
- [x] .prettierignore patterns documented with examples
- [x] npm scripts provided for multiple scenarios
- [x] Complete setup examples (4 variants) included
- [x] Quick reference card created
- [x] Troubleshooting guide provided
- [x] All official documentation links verified

---

## Statistics

| Document | Lines | Size | Focus |
|----------|-------|------|-------|
| prettier-setup.md | 758 | 19 KB | Comprehensive guide |
| PRETTIER_QUICK_REFERENCE.md | 180+ | 5.5 KB | One-page reference |
| README.md | 138 | 4.0 KB | Navigation & overview |

**Total Prettier Research**: 1,076+ lines, 28.5+ KB

---

## Version Information Used

- **Prettier**: 3.5+ (with backward compatibility notes for 3.0+)
- **ESLint**: 9.x (legacy ESLintrc also supported)
- **Node.js**: 18+ (22.6+ for TypeScript config files)
- **TypeScript**: 5.x

---

## How to Use This Research

1. **Start Here**: Read `PRETTIER_QUICK_REFERENCE.md` for a quick overview
2. **For Details**: Consult `prettier-setup.md` for comprehensive information
3. **For Setup**: Copy examples from appropriate section based on your needs
4. **For Verification**: Use ESLint integration helper tool

---

**Research Completed By**: Claude Code
**Date**: December 25, 2025
**Status**: Complete and verified against official sources
