# ESLint 8.x with TypeScript Configuration - Research Guide

## Executive Summary

ESLint 8.x introduced the new **flat config** format as the recommended approach for configuration. This guide covers the latest best practices for configuring ESLint 8.x with TypeScript in Node.js projects, including both flat config (modern) and legacy eslintrc formats.

## 1. Overview of ESLint 8.x for TypeScript

### Key Changes in ESLint 8.x
- **Flat Config Format**: New standard configuration format replacing legacy eslintrc
- **Simplified Configuration**: Single JavaScript file (`eslint.config.js` or `eslint.config.mjs`) with full control
- **Project Service**: Newer, more efficient TypeScript integration via `projectService: true`
- **File-specific Rules**: Easy to define separate rules for JS vs TS files

**Official Documentation**: https://typescript-eslint.io/getting-started/

## 2. Installation and Dependencies

### Required Packages

```bash
npm install --save-dev eslint @typescript-eslint/parser @typescript-eslint/eslint-plugin typescript
```

### Package Versions (as of 2025)
- **eslint**: ^8.x (or ^9.x for latest)
- **@typescript-eslint/parser**: ^8.x or ^7.x
- **@typescript-eslint/eslint-plugin**: ^8.x or ^7.x
- **typescript**: ^5.x

### Optional Dependencies
- **jiti**: Required for Node.js < 22.10.0 if using TypeScript config files (`npm install --save-dev jiti@^2.0.0`)

**Reference**: https://typescript-eslint.io/packages/parser/

## 3. Configuration: Flat Config Format (Recommended)

### Basic Flat Config Setup

Create `eslint.config.js` or `eslint.config.mjs` in your project root:

```javascript
// @ts-check
import eslint from '@eslint/js';
import { defineConfig } from 'eslint/config';
import tseslint from 'typescript-eslint';

export default defineConfig(
  eslint.configs.recommended,
  tseslint.configs.recommended,
);
```

### Key Points
- Use `.mjs` extension for ESM format, or `.js` if `"type": "module"` in `package.json`
- `@ts-check` comment enables TypeScript checking within the config file
- `defineConfig()` helper provides IDE autocomplete support
- `eslint.configs.recommended` enables ESLint core recommended rules
- `tseslint.configs.recommended` enables TypeScript-specific recommended rules

**Reference**: https://typescript-eslint.io/getting-started/

## 4. Shared Configurations

### Configuration Tiers

TypeScript-ESLint provides tiered configurations by strictness level:

#### Without Type Information
| Config | Purpose |
|--------|---------|
| `recommended` | Core rules for code correctness (default) |
| `strict` | Recommended + additional strict rules (opinionated) |
| `stylistic` | Code style preferences |

#### With Type Information (requires `projectService: true`)
| Config | Purpose |
|--------|---------|
| `recommendedTypeChecked` | Recommended + type-aware rules |
| `strictTypeChecked` | Strict + type-aware rules (opinionated) |
| `stylisticTypeChecked` | Stylistic + type-aware rules |

### Configuration Stability
- ✓ Stable: `recommended`, `stylistic`, `recommendedTypeChecked`, `stylisticTypeChecked`
- ✗ Unstable: `strict`, `strictTypeChecked` (rules/options may change outside major versions)

**Reference**: https://typescript-eslint.io/users/configs/

## 5. TypeScript-ESLint Parser Configuration

### @typescript-eslint/parser

The parser converts TypeScript code into an AST (Abstract Syntax Tree) that ESLint can understand.

#### Parser Options

| Option | Purpose |
|--------|---------|
| `projectService: true` | Use TypeScript's type checking service (recommended) |
| `project` | Path to tsconfig.json (if not using projectService) |
| `tsconfigRootDir` | Absolute path to project root directory |

### Flat Config with Type-Aware Linting

```javascript
// @ts-check
import eslint from '@eslint/js';
import { defineConfig } from 'eslint/config';
import tseslint from 'typescript-eslint';

export default defineConfig(
  eslint.configs.recommended,
  tseslint.configs.recommended,
  tseslint.configs.recommendedTypeChecked,
  {
    languageOptions: {
      parserOptions: {
        projectService: true,
      },
    },
  },
);
```

**References**:
- https://typescript-eslint.io/packages/parser/
- https://typescript-eslint.io/getting-started/typed-linting/

## 6. Type-Aware Linting (Typed Linting)

### What is Type-Aware Linting?

Rules that analyze your code using TypeScript's type information, enabling detection of:
- Nuanced bugs and edge cases
- Type-safety violations
- Best practice violations that require semantic analysis

### Performance Impact

Type-aware linting requires TypeScript to build your entire project before linting:
- **Small projects**: Negligible impact (few seconds)
- **Large projects**: Can take significantly longer
- **IDE integration**: Caching mitigates performance penalties

### Enabling Type-Aware Linting

1. Add `projectService: true` to `languageOptions.parserOptions`
2. Include type-checked shared configs (`recommendedTypeChecked`, etc.)
3. Optional: Configure separate rules for JS files to avoid type-checking non-TS code

```javascript
export default defineConfig(
  {
    ignores: ['dist', 'node_modules', '**/*.d.ts'],
  },
  eslint.configs.recommended,
  tseslint.configs.recommendedTypeChecked,
  {
    languageOptions: {
      parserOptions: {
        projectService: true,
      },
    },
  },
  // Disable type-checked rules for JS files
  {
    files: ['**/*.js', '**/*.mjs', '**/*.cjs'],
    extends: [tseslint.configs.disableTypeChecked],
  },
);
```

**Reference**: https://typescript-eslint.io/getting-started/typed-linting/

## 7. File Ignoring Configuration

### Global Ignores (Flat Config)

In flat config, use a dedicated ignores object without other properties:

```javascript
import { defineConfig } from 'eslint/config';
import tseslint from 'typescript-eslint';

export default defineConfig(
  // Global ignores must be in separate object
  {
    ignores: [
      'dist/',
      'build/',
      'node_modules/',
      '.git/',
      'coverage/',
      '**/*.d.ts',
      '.next/',
      'out/',
    ],
  },
  // ... other configs
);
```

### Important Notes
- Only global ignores can match directories (e.g., `dist/`, `node_modules/`)
- File-specific ignores only match file names
- Default ignores: `['**/node_modules/', '.git/']`
- Flat config does NOT support `.eslintignore` files

**Reference**: https://eslint.org/docs/latest/use/configure/ignore

## 8. Recommended Strict Configuration for Node.js

### Production-Ready Configuration

```javascript
// @ts-check
import eslint from '@eslint/js';
import { defineConfig } from 'eslint/config';
import tseslint from 'typescript-eslint';

export default defineConfig(
  // Global ignores
  {
    ignores: [
      'dist/',
      'build/',
      'node_modules/',
      '.git/',
      'coverage/',
      '**/*.d.ts',
      '**/*.config.js',
      '**/*.config.mjs',
    ],
  },

  // ESLint core recommended
  eslint.configs.recommended,

  // TypeScript-ESLint strict with type checking
  tseslint.configs.strictTypeChecked,
  tseslint.configs.stylisticTypeChecked,

  // Configure parser for type-aware linting
  {
    languageOptions: {
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },

  // Disable type-checked rules for JavaScript files
  {
    files: ['**/*.js', '**/*.mjs', '**/*.cjs'],
    extends: [tseslint.configs.disableTypeChecked],
    rules: {
      '@typescript-eslint/no-require-imports': 'off',
      '@typescript-eslint/no-var-requires': 'off',
    },
  },

  // Additional custom rules
  {
    files: ['**/*.ts', '**/*.tsx'],
    rules: {
      '@typescript-eslint/no-floating-promises': 'error',
      '@typescript-eslint/explicit-function-return-types': [
        'warn',
        {
          allowExpressions: true,
          allowTypedFunctionExpressions: true,
          allowHigherOrderFunctions: true,
        },
      ],
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
        },
      ],
    },
  },
);
```

## 9. Legacy Configuration Format (.eslintrc)

### For Projects Using ESLint 8 with eslintrc

If upgrading from ESLint 7 or required to use legacy format:

```json
{
  "root": true,
  "parser": "@typescript-eslint/parser",
  "parserOptions": {
    "project": true,
    "tsconfigRootDir": "${workspaceFolder}"
  },
  "plugins": ["@typescript-eslint"],
  "extends": [
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended",
    "plugin:@typescript-eslint/recommended-type-checked",
    "plugin:@typescript-eslint/strict-type-checked",
    "plugin:@typescript-eslint/stylistic-type-checked"
  ],
  "rules": {
    "@typescript-eslint/no-floating-promises": "error",
    "@typescript-eslint/explicit-function-return-types": [
      "warn",
      {
        "allowExpressions": true,
        "allowHigherOrderFunctions": true
      }
    ],
    "@typescript-eslint/no-explicit-any": "error",
    "@typescript-eslint/no-unused-vars": [
      "error",
      {
        "argsIgnorePattern": "^_",
        "varsIgnorePattern": "^_"
      }
    ]
  },
  "overrides": [
    {
      "files": ["*.js", "*.mjs", "*.cjs"],
      "extends": ["eslint:recommended"],
      "rules": {
        "@typescript-eslint/no-var-requires": "off"
      }
    }
  ],
  "ignorePatterns": ["dist/", "build/", "node_modules/", "**/*.d.ts"]
}
```

**Reference**: https://eslint.org/docs/latest/use/configure/configuration-files

## 10. Recommended Strict Rules

### Essential Type-Safe Rules

| Rule | Purpose | Severity |
|------|---------|----------|
| `no-floating-promises` | Prevent forgotten Promise handling | error |
| `no-explicit-any` | Avoid `any` type (use `unknown` instead) | error |
| `explicit-function-return-types` | Require explicit return types on functions | warn |
| `no-unused-vars` | Catch unused variables (respects `_` prefix) | error |
| `no-unnecessary-type-assertion` | Remove redundant type assertions | error |
| `await-thenable` | Only await Promises and thenable values | error |
| `no-misused-promises` | Ensure Promises are used correctly | error |
| `no-floating-promises` | Catch unhandled Promise rejections | error |
| `prefer-nullish-coalescing` | Use `??` over `\|\|` for null checks | warn |
| `prefer-optional-chain` | Use `?.` for optional access | warn |

### Style Rules (with Type Information)

| Rule | Purpose | Severity |
|------|---------|----------|
| `naming-convention` | Enforce consistent naming patterns | warn |
| `member-ordering` | Sort class members logically | warn |
| `no-non-null-assertion` | Discourage `!` non-null assertions | warn |

### TypeScript Compiler Options to Disable

When using ESLint with TypeScript, disable these compiler options in `tsconfig.json`:
- `noUnusedLocals`: Replaced by ESLint rules (more configurable)
- `noUnusedParameters`: Replaced by ESLint rules (handles `_` prefix)

These cause redundancy with ESLint's configurable rules.

**Reference**: https://typescript-eslint.io/users/configs/

## 11. Flat Config vs Legacy Config

### Comparison Table

| Aspect | Flat Config (ESLint 8.21+) | Legacy Config (.eslintrc) |
|--------|---------------------------|--------------------------|
| **File** | `eslint.config.js` / `.mjs` | `.eslintrc.json` / `.eslintrc.js` |
| **Format** | JavaScript/ESM | JSON or CommonJS |
| **Extends** | Array-based composition | String array extending |
| **Ignores** | Separate config object | `ignorePatterns` property |
| **.eslintignore** | Not supported | Supported |
| **Globals** | Under `languageOptions` | Top-level `globals` |
| **envs** | Not supported | Supported (use individual configs) |
| **Root** | Always `true` | Can be overridden |
| **Type Safety** | Full IDE support with `@ts-check` | Limited |
| **IDE Autocomplete** | Yes (with `defineConfig()`) | Limited |

### Migration Path

1. **Easiest**: Use TypeScript-ESLint shared configs in flat config
2. **Benefits**: Better performance, simpler structure, easier override patterns
3. **Recommended**: New projects should use flat config; existing projects should migrate

**Reference**: https://eslint.org/docs/latest/use/configure/migration-guide

## 12. Node.js Project-Specific Considerations

### ESM vs CommonJS

#### For ESM Projects (Recommended)
```javascript
// eslint.config.mjs
import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';

export default [
  // ... config
];
```

Or in `package.json`:
```json
{
  "type": "module"
}
```

Then use `eslint.config.js`.

#### For CommonJS Projects
```javascript
// eslint.config.mjs (must use .mjs)
import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';

export default [
  // ... config
];
```

### Node.js API Examples

ESLint exports config types you can extend:

```javascript
import eslint from '@eslint/js';
import { defineConfig } from 'eslint/config';
import tseslint from 'typescript-eslint';

export default defineConfig(
  eslint.configs.recommended,
  ...tseslint.configs.recommended,
);
```

### TypeScript Config File Support

| Node.js Version | Support | Requirements |
|-----------------|---------|--------------|
| >= 22.10.0 | Native TypeScript | Enable `unstable_native_nodejs_ts_config` flag |
| < 22.10.0 | Via jiti | Install `jiti@^2.0.0` as dev dependency |
| All versions | ESM JavaScript | No additional setup needed |

**Reference**: https://typescript-eslint.io/getting-started/

## 13. Complete Example: Node.js Project Setup

### File Structure
```
project/
├── src/
│   ├── index.ts
│   ├── utils/
│   │   └── helper.ts
│   └── __tests__/
│       └── helper.test.ts
├── dist/
├── eslint.config.js
├── tsconfig.json
├── package.json
└── .gitignore
```

### Full Flat Config Example
```javascript
// eslint.config.js
// @ts-check
import eslint from '@eslint/js';
import { defineConfig } from 'eslint/config';
import tseslint from 'typescript-eslint';

export default defineConfig(
  // Ignore configuration
  {
    ignores: [
      'dist',
      'build',
      'node_modules',
      '.git',
      'coverage',
      '**/*.d.ts',
      '*.config.js',
      '*.config.mjs',
    ],
  },

  // ESLint core recommended
  eslint.configs.recommended,

  // TypeScript-ESLint with type checking
  ...tseslint.configs.strictTypeChecked,
  ...tseslint.configs.stylisticTypeChecked,

  // Parser configuration for type checking
  {
    languageOptions: {
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },

  // Disable type-checked rules for .js, .mjs, .cjs files
  {
    files: ['**/*.js', '**/*.mjs', '**/*.cjs'],
    ...tseslint.configs.disableTypeChecked,
  },

  // Custom rules for TypeScript
  {
    files: ['**/*.ts', '**/*.tsx'],
    rules: {
      '@typescript-eslint/no-floating-promises': 'error',
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/explicit-function-return-types': [
        'warn',
        {
          allowExpressions: true,
          allowHigherOrderFunctions: true,
          allowTypedFunctionExpressions: true,
        },
      ],
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          caughtErrorsIgnorePattern: '^_',
        },
      ],
      '@typescript-eslint/no-unnecessary-type-assertion': 'warn',
      '@typescript-eslint/prefer-nullish-coalescing': 'warn',
      '@typescript-eslint/prefer-optional-chain': 'warn',
    },
  },

  // Config for test files
  {
    files: ['**/*.test.ts', '**/*.spec.ts', '**/__tests__/**/*.ts'],
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
    },
  },
);
```

### Package.json Scripts
```json
{
  "scripts": {
    "lint": "eslint .",
    "lint:fix": "eslint . --fix",
    "type-check": "tsc --noEmit"
  }
}
```

## 14. Troubleshooting

### Common Issues

#### Issue: "Cannot find module 'typescript'"
**Solution**: Ensure `typescript` is installed as a dev dependency
```bash
npm install --save-dev typescript
```

#### Issue: Type-checked linting is slow
**Solution**:
- Use `projectService: true` instead of explicit `project` paths
- For very large projects, consider using `strict` instead of `strict-type-checked`
- Cache is handled automatically by IDE plugins

#### Issue: "JSX is not available in ESLint by default"
**Solution**: Configure parser for JSX in `parserOptions`
```javascript
{
  languageOptions: {
    parserOptions: {
      projectService: true,
      ecmaFeatures: {
        jsx: true,
      },
    },
  },
}
```

#### Issue: `.eslintignore` not working in flat config
**Solution**: Use the `ignores` property in eslint.config.js instead
```javascript
export default [
  {
    ignores: ['dist/', 'node_modules/'],
  },
  // ... other configs
];
```

## 15. Official Documentation References

### Primary Resources
- **TypeScript-ESLint Getting Started**: https://typescript-eslint.io/getting-started/
- **TypeScript-ESLint Shared Configs**: https://typescript-eslint.io/users/configs/
- **@typescript-eslint/parser**: https://typescript-eslint.io/packages/parser/
- **Type-Aware Linting**: https://typescript-eslint.io/getting-started/typed-linting/

### ESLint Official Documentation
- **ESLint Configuration Files**: https://eslint.org/docs/latest/use/configure/configuration-files
- **ESLint Ignore Files**: https://eslint.org/docs/latest/use/configure/ignore
- **ESLint Parser Configuration**: https://eslint.org/docs/latest/use/configure/parser
- **ESLint Configuration Migration Guide**: https://eslint.org/docs/latest/use/configure/migration-guide

### Community Resources
- **TypeScript-ESLint GitHub**: https://github.com/typescript-eslint/typescript-eslint
- **TypeScript-ESLint Blog**: https://typescript-eslint.io/blog/
- **ESLint Blog**: https://eslint.org/blog/

## 16. Summary of Key Takeaways

1. **Use Flat Config**: ESLint 8.21+ and 9.x recommend flat config (`eslint.config.js`)
2. **Enable Type Checking**: Use `projectService: true` for powerful type-aware linting
3. **Start with Shared Configs**: Use `strict` or `strict-type-checked` to get good defaults
4. **Separate JS and TS Rules**: Disable type-checked rules for non-TS files
5. **Handle Ignores Properly**: Use separate ignores object in flat config
6. **Modern Parser**: Use `@typescript-eslint/parser` v8.x with TypeScript v5.x
7. **Disable Conflicting TSConfig Options**: Turn off `noUnusedLocals` and `noUnusedParameters`
8. **Test File Overrides**: Loosen strict rules for test files where appropriate
9. **IDE Integration**: Leverage IDE caching to mitigate type-check performance overhead
10. **Documentation**: Always refer to https://typescript-eslint.io for the latest guidance

---

**Last Updated**: December 25, 2025
**ESLint Version**: 8.x (with 9.x compatibility notes)
**TypeScript-ESLint Version**: 7.x - 8.x
**Node.js Target**: 16.x+, recommended 18.x+
