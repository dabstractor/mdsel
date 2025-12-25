# ESLint 8.x with TypeScript - Quick Reference

## One-Minute Setup

```bash
npm install --save-dev eslint @typescript-eslint/parser @typescript-eslint/eslint-plugin typescript
```

## Minimal Flat Config (eslint.config.js)

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

## Production-Ready Flat Config

```javascript
// @ts-check
import eslint from '@eslint/js';
import { defineConfig } from 'eslint/config';
import tseslint from 'typescript-eslint';

export default defineConfig(
  { ignores: ['dist', 'node_modules', '**/*.d.ts'] },
  eslint.configs.recommended,
  tseslint.configs.strictTypeChecked,
  tseslint.configs.stylisticTypeChecked,
  {
    languageOptions: {
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },
  {
    files: ['**/*.js', '**/*.mjs', '**/*.cjs'],
    extends: [tseslint.configs.disableTypeChecked],
  },
);
```

## Configuration Location
- **Modern**: `eslint.config.js` (ESLint 8.21+, 9.x)
- **Legacy**: `.eslintrc.json` (ESLint 8.0-8.20, deprecated)

## Key Parser Options

| Option | Value | Purpose |
|--------|-------|---------|
| `projectService` | `true` | Enable type-aware linting (modern) |
| `tsconfigRootDir` | `import.meta.dirname` | Root directory for tsconfig |

## Shared Config Progression

```
Basic: recommended
     ↓
Advanced: recommendedTypeChecked
     ↓
Strict: strictTypeChecked
     ↓
Stylistic: stylisticTypeChecked
```

## Common Rules

```javascript
rules: {
  '@typescript-eslint/no-explicit-any': 'error',           // Enforce type safety
  '@typescript-eslint/no-floating-promises': 'error',      // Handle Promise rejections
  '@typescript-eslint/explicit-function-return-types': 'warn',  // Type clarity
  '@typescript-eslint/no-unused-vars': ['error', {         // Dead code
    argsIgnorePattern: '^_',
    varsIgnorePattern: '^_',
  }],
  '@typescript-eslint/prefer-nullish-coalescing': 'warn',  // Use ?? over ||
  '@typescript-eslint/prefer-optional-chain': 'warn',      // Use ?. over &&
}
```

## Ignoring Files (Flat Config)

```javascript
// Always in its own object
{
  ignores: [
    'dist/',
    'build/',
    'node_modules/',
    'coverage/',
    '**/*.d.ts',
    '*.config.js',
  ],
}
```

## File-Specific Rules

```javascript
// Disable type-checking for JS files
{
  files: ['**/*.js', '**/*.mjs', '**/*.cjs'],
  extends: [tseslint.configs.disableTypeChecked],
}

// Custom rules for test files
{
  files: ['**/*.test.ts', '**/__tests__/**/*.ts'],
  rules: {
    '@typescript-eslint/no-explicit-any': 'off',
  },
}
```

## Performance Tips

1. **Use `projectService: true`** instead of explicit `project` paths
2. **Cache is handled automatically** by IDE plugins
3. **For very large codebases**: Use `strict` instead of `strict-type-checked`
4. **Ignore generated files**: Add `**/*.d.ts` to ignores

## Conflict Resolution

Disable in `tsconfig.json`:
```json
{
  "compilerOptions": {
    "noUnusedLocals": false,
    "noUnusedParameters": false
  }
}
```

## Run Commands

```bash
# Lint all files
npm run lint -- .

# Fix auto-fixable issues
npm run lint -- . --fix

# Check specific file
npm run lint -- src/index.ts
```

## Official Documentation URLs

| Resource | URL |
|----------|-----|
| Getting Started | https://typescript-eslint.io/getting-started/ |
| Shared Configs | https://typescript-eslint.io/users/configs/ |
| Type-Aware Linting | https://typescript-eslint.io/getting-started/typed-linting/ |
| @typescript-eslint/parser | https://typescript-eslint.io/packages/parser/ |
| ESLint Flat Config | https://eslint.org/docs/latest/use/configure/configuration-files |
| Migration Guide | https://eslint.org/docs/latest/use/configure/migration-guide |

## Version Requirements

- **ESLint**: 8.21+ (for flat config) or 9.x
- **@typescript-eslint/parser**: 7.x - 8.x
- **@typescript-eslint/eslint-plugin**: 7.x - 8.x
- **TypeScript**: 5.x (minimum 4.9)
- **Node.js**: 16.x+ (recommended 18.x+)

## Troubleshooting

| Issue | Solution |
|-------|----------|
| `.eslintignore` not working | Use `ignores` in flat config instead |
| Type-checked linting slow | Use `projectService: true` and rely on IDE caching |
| Cannot find `typescript` | `npm install --save-dev typescript` |
| Config not loading | Ensure file is `eslint.config.js`, not `.eslintrc` |
| JSX not recognized | Add `ecmaFeatures: { jsx: true }` to `parserOptions` |

## Migration Path (if upgrading)

1. Rename `.eslintrc.json` to `.eslintrc.json.backup`
2. Create `eslint.config.js` with flat config
3. Test with `npx eslint .`
4. Verify all files lint correctly
5. Remove `.eslintignore` (migrate patterns to ignores)
6. Delete backup files

## Full Documentation

See **eslint-setup.md** for comprehensive 16-section guide with:
- Complete examples
- Shared config reference
- Strict rules documentation
- Type-aware linting details
- Node.js project setup
- Troubleshooting section

---

**Quick Reference Version**: 1.0
**Updated**: December 25, 2025
**ESLint**: 8.x / 9.x
**TypeScript-ESLint**: 7.x - 8.x
