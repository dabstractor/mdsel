# Prettier 3.x Quick Reference Card

## Official Documentation
- **Configuration**: https://prettier.io/docs/configuration
- **Options**: https://prettier.io/docs/options
- **Ignoring Code**: https://prettier.io/docs/ignore
- **CLI**: https://prettier.io/docs/cli.html
- **ESLint Integration**: https://github.com/prettier/eslint-config-prettier

## Core Configuration Options

| Option | Default | Recommended TypeScript | Purpose |
|--------|---------|----------------------|---------|
| `printWidth` | 80 | 100 | Line length guideline |
| `tabWidth` | 2 | 2 | Spaces per indentation |
| `useTabs` | false | false | Use tabs instead of spaces |
| `semi` | true | true | Add semicolons |
| `singleQuote` | false | true | Use single quotes |
| `jsxSingleQuote` | false | false | Single quotes in JSX |
| `trailingComma` | "all" | "all" | Trailing commas in multi-line |
| `bracketSpacing` | true | true | Spaces in object literals |
| `arrowParens` | "always" | "always" | Parentheses around arrow functions |
| `endOfLine` | "lf" | "lf" | Line ending normalization |

## Configuration File Formats (Priority Order)

1. `"prettier"` in `package.json`
2. `.prettierrc`
3. `.prettierrc.json`
4. `.prettierrc.js` / `prettier.config.js`
5. `.prettierrc.mjs` / `prettier.config.mjs`
6. `.prettierrc.cjs` / `prettier.config.cjs`
7. `.prettierrc.ts` / `prettier.config.ts` (3.5+, requires Node 22.6+)
8. `.prettierrc.toml`

## Recommended .prettierrc.json

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

## Essential .prettierignore Patterns

```
# Dependencies & locks
node_modules/
package-lock.json
yarn.lock
pnpm-lock.yaml

# Build & output
dist/
build/
out/
.next/

# Testing
coverage/
.nyc_output/

# Environment & configuration
.env*
.vscode/
.idea/

# Logs & temporary
*.log
tmp/
temp/
```

## npm Scripts

### Basic
```json
{
  "format": "prettier --write \"src/**/*.{ts,tsx}\"",
  "format:check": "prettier --check \"src/**/*.{ts,tsx}\""
}
```

### Complete
```json
{
  "format": "prettier --write \"src/**/*.{ts,tsx}\"",
  "format:check": "prettier --check \"src/**/*.{ts,tsx}\"",
  "format:list": "prettier --list-different \"src/**/*.{ts,tsx}\"",
  "lint": "eslint \"src/**/*.{ts,tsx}\"",
  "lint:fix": "eslint --fix \"src/**/*.{ts,tsx}\"",
  "check": "npm run format:check && npm run lint"
}
```

## ESLint Integration (eslint.config.mjs)

```javascript
import eslint from '@eslint/js';
import prettier from 'eslint-config-prettier';
import typescript from 'typescript-eslint';

export default [
  { ignores: ['node_modules/*', 'dist/*'] },
  eslint.configs.recommended,
  ...typescript.configs.recommended,
  prettier, // MUST be last
];
```

## Common prettier-ignore Comments

### TypeScript/JavaScript
```typescript
// prettier-ignore
const badly = { formatted: 'code' }

// prettier-ignore-start
const foo = {
  a: 1,
  b: 2
}
// prettier-ignore-end
```

### HTML
```html
<!-- prettier-ignore -->
<div  id="foo">Not formatted</div>
```

### CSS
```css
/* prettier-ignore */
.bad { color: red; }
```

## CLI Flags Reference

| Flag | Usage |
|------|-------|
| `--write` | Format files in place |
| `--check` | Verify formatting (exit 1 if issues) |
| `--list-different` | List files that need formatting |
| `--cache` | Enable caching for faster runs |
| `--ignore-unknown` | Skip unrecognized file types |
| `--debug-check` | Detect correctness issues |
| `--find-config-path` | Locate configuration file |

## TypeScript-Specific Notes

1. **Parser**: Automatically detected, no need to specify
2. **Config Files**: Prettier 3.5+ supports `.prettierrc.ts` (Node 22.6+ required)
3. **JSX/TSX**: Use separate `jsxSingleQuote` option for attribute quotes
4. **Quote Selection**: Prettier chooses quotes to minimize escapes

## ESLint + Prettier Integration Checklist

- [ ] Install: `npm install --save-dev eslint-config-prettier`
- [ ] Add `prettier` to extends array (last position)
- [ ] Verify: `npx eslint-config-prettier path/to/file.ts`
- [ ] Sync quote options between ESLint and Prettier
- [ ] Test: `npm run check` (format + lint)

## Configuration Override Example

```json
{
  "semi": true,
  "singleQuote": true,
  "printWidth": 100,
  "overrides": [
    {
      "files": "*.test.ts",
      "options": { "printWidth": 120 }
    },
    {
      "files": "*.config.ts",
      "options": { "tabWidth": 4 }
    }
  ]
}
```

## Performance Tips

- Use `--cache` flag for faster formatting in large projects
- Add `.prettierignore` to exclude unnecessary files
- Run `--check` in CI/CD instead of modifying files
- Consider pre-commit hooks for automatic formatting

## Version Support

- **Prettier**: 3.0+ (3.5+ for TypeScript config files)
- **Node.js**: 18+ (22.6+ for `.prettierrc.ts`)
- **TypeScript**: 5.x
- **ESLint**: 9.x (legacy ESLintrc also supported)

## Troubleshooting

### Quote Conflicts
- ESLint `quotes: ['error', 'single']` should match Prettier `singleQuote: true`
- ESLint `quotes: ['error', 'double']` should match Prettier `singleQuote: false`

### Formatting Not Applied
- Check `.prettierignore` patterns
- Verify configuration file exists and is valid
- Check file is in supported language

### ESLint Conflicts
- Run: `npx eslint-config-prettier path/to/file.ts`
- Ensure `prettier` is last in extends array
- Check for custom plugin name conflicts

---

**Quick Reference Created**: December 25, 2025
**For Full Details**: See prettier-setup.md
