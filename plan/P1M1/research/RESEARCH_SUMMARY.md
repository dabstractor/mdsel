# ESLint 8.x with TypeScript - Research Summary

## Research Overview

Comprehensive research on configuring ESLint 8.x with TypeScript for Node.js projects, based on official documentation and 2025 best practices.

## Research Date
December 25, 2025

## Key Findings

### 1. Flat Config is the Modern Standard
- **ESLint 8.21+** and **9.x** recommend `eslint.config.js` (flat config)
- Replaces legacy `.eslintrc.json` format
- Provides better IDE support, type safety, and clearer configuration structure

### 2. TypeScript-ESLint Project Service
- **`projectService: true`** is the recommended modern approach for type-aware linting
- Simpler configuration than explicit `project` paths
- Leverages TypeScript's newer, more efficient APIs
- Better performance characteristics than older `project` option

### 3. Shared Configuration Tiers

**Without Type Checking:**
- `recommended` - Core correctness rules
- `strict` - Recommended + additional strict rules
- `stylistic` - Code formatting preferences

**With Type Checking:**
- `recommendedTypeChecked` - Recommended + type-aware rules
- `strictTypeChecked` - Strict + type-aware rules (unstable/not semver)
- `stylisticTypeChecked` - Stylistic + type-aware rules

### 4. File-Specific Configuration
- Separate rules for TypeScript vs JavaScript files
- Disable type-checked rules for non-TS code
- Test files can have looser rules than production code

### 5. Critical Configuration Points

**Global Ignores (Flat Config):**
```javascript
{
  ignores: ['dist/', 'node_modules/', '**/*.d.ts']
}
```

**Type-Aware Linting Setup:**
```javascript
{
  languageOptions: {
    parserOptions: {
      projectService: true,
      tsconfigRootDir: import.meta.dirname,
    },
  },
}
```

### 6. TypeScript Compiler Options

When using ESLint with TypeScript, disable these compiler options:
- `noUnusedLocals` - Use ESLint's configurable alternatives
- `noUnusedParameters` - ESLint can handle with `_` prefix patterns

## Essential Rules for Production

| Rule | Purpose | Recommended Severity |
|------|---------|----------------------|
| `no-floating-promises` | Catch unhandled Promises | error |
| `no-explicit-any` | Enforce type safety (use `unknown`) | error |
| `explicit-function-return-types` | Require explicit return types | warn |
| `no-unused-vars` | Catch dead code | error |
| `no-unnecessary-type-assertion` | Remove redundant assertions | error |
| `await-thenable` | Only await Promises | error |
| `prefer-nullish-coalescing` | Use `??` over `\|\|` | warn |
| `prefer-optional-chain` | Use `?.` for optional access | warn |

## Performance Considerations

- **Type-aware linting impact**: 30x slower for large codebases (noted in official docs)
- **Mitigation**: IDE plugins cache results, reducing perceived overhead
- **Alternative**: Use `strict` instead of `strict-type-checked` for very large projects

## Official Documentation Sources

### Primary References
1. **TypeScript-ESLint Getting Started**: https://typescript-eslint.io/getting-started/
2. **Shared Configs Guide**: https://typescript-eslint.io/users/configs/
3. **@typescript-eslint/parser**: https://typescript-eslint.io/packages/parser/
4. **Type-Aware Linting**: https://typescript-eslint.io/getting-started/typed-linting/

### ESLint Official Documentation
1. **Configuration Files**: https://eslint.org/docs/latest/use/configure/configuration-files
2. **Ignore Files**: https://eslint.org/docs/latest/use/configure/ignore
3. **Migration Guide**: https://eslint.org/docs/latest/use/configure/migration-guide
4. **Parser Configuration**: https://eslint.org/docs/latest/use/configure/parser

### Community & Discussions
1. **TypeScript-ESLint GitHub**: https://github.com/typescript-eslint/typescript-eslint
2. **Blog Articles**:
   - https://advancedfrontends.com/eslint-flat-config-typescript-javascript/
   - https://finnnannestad.com/blog/linting-and-formatting
   - https://www.xjavascript.com/blog/best-eslint-config-for-typescript/
   - https://medium.com/@leobarri2013/setting-up-prettier-eslint-and-typescript-in-express-2025-6d59f384f00c

## Version Compatibility

| Component | Recommended | Alternative |
|-----------|-------------|-------------|
| ESLint | 8.21+ or 9.x | Legacy 8.x with .eslintrc |
| TypeScript-ESLint | 8.x | 7.x |
| TypeScript | 5.x | 4.9+ |
| Node.js | 18.x, 20.x, 22.x+ | 16.x minimum |

## Quick Start Command

```bash
npm install --save-dev eslint @typescript-eslint/parser @typescript-eslint/eslint-plugin typescript
```

## Implementation Strategy

1. **Start with shared configs** - Use `strict` or `strict-type-checked` as base
2. **Add global ignores** - Exclude build, node_modules, and generated files
3. **Configure parser** - Enable `projectService: true` for type checking
4. **Separate file handlers** - Different rules for JS vs TS files
5. **Override for tests** - Loosen rules in test files as needed
6. **Customize rules** - Add project-specific rules on top of configs

## Flat Config vs Legacy Config

| Feature | Flat Config | Legacy |
|---------|-------------|--------|
| File | `eslint.config.js` | `.eslintrc.json` |
| Format | JavaScript/ESM | JSON |
| IDE Support | Excellent | Limited |
| Performance | Better | Baseline |
| Type Safety | Full (@ts-check) | None |
| Migration | One-way from legacy | Dead format (ESLint 8+) |

**Recommendation**: All new projects should use flat config. Existing projects should migrate when feasible.

## Files Generated

1. **eslint-setup.md** - Comprehensive 16-section guide with:
   - Installation instructions
   - Flat config examples (basic and advanced)
   - Type-aware linting setup
   - Shared configuration reference
   - Strict rules recommendations
   - Complete Node.js project example
   - Troubleshooting guide
   - Official documentation references

## Key Takeaways

1. Use flat config (`eslint.config.js`) for new projects
2. Enable type checking with `projectService: true`
3. Base configuration on `strict` or `strict-type-checked` shared configs
4. Handle JS and TS files separately
5. Ignore non-source directories and type declaration files
6. Leverage IDE caching to mitigate type-check performance cost
7. Refer to official docs at https://typescript-eslint.io for latest guidance

---

**Research Completed**: December 25, 2025
**Information Current As Of**: ESLint 8.50.1+, TypeScript-ESLint 8.x, Node.js 22.x
**Next Steps**: Review eslint-setup.md for implementation guide
