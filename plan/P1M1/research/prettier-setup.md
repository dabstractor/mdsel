# Prettier 3.x Configuration Research for TypeScript Projects

**Research Date**: December 25, 2025
**Target Version**: Prettier 3.x
**Use Case**: TypeScript Project Configuration

---

## Table of Contents

1. [Official Documentation Links](#official-documentation-links)
2. [Prettier .prettierrc Configuration](#prettier-prettierrc-configuration)
3. [TypeScript-Specific Considerations](#typescript-specific-considerations)
4. [Recommended Settings](#recommended-settings)
5. [.prettierignore Patterns](#prettierignore-patterns)
6. [ESLint Integration](#eslint-integration)
7. [NPM Scripts](#npm-scripts)
8. [Complete Setup Examples](#complete-setup-examples)

---

## Official Documentation Links

### Primary Resources
- **Configuration Files**: [https://prettier.io/docs/configuration](https://prettier.io/docs/configuration)
- **All Options Reference**: [https://prettier.io/docs/options](https://prettier.io/docs/options)
- **Ignoring Code**: [https://prettier.io/docs/ignore](https://prettier.io/docs/ignore)
- **CLI Documentation**: [https://prettier.io/docs/cli.html](https://prettier.io/docs/cli.html)
- **ESLint Integration**: [https://github.com/prettier/eslint-config-prettier](https://github.com/prettier/eslint-config-prettier)

### Release Notes
- **Prettier 3.7**: [https://prettier.io/blog/2025/11/27/3.7.0](https://prettier.io/blog/2025/11/27/3.7.0) - Improved TypeScript and Flow formatting consistency
- **Prettier 3.6**: [https://prettier.io/blog/2025/06/23/3.6.0](https://prettier.io/blog/2025/06/23/3.6.0) - Experimental fast CLI and new plugins
- **Prettier 3.5**: [https://prettier.io/blog/2025/02/09/3.5.0](https://prettier.io/blog/2025/02/09/3.5.0) - TypeScript config file support
- **Prettier 3.0**: [https://prettier.io/blog/2023/07/05/3.0.0.html](https://prettier.io/blog/2023/07/05/3.0.0.html) - ECMAScript Modules support

---

## Prettier .prettierrc Configuration

### Supported Configuration File Formats

Prettier supports multiple configuration file formats (in order of precedence):

1. `"prettier"` key in `package.json` or `package.yaml`
2. `.prettierrc` (JSON or YAML)
3. `.prettierrc.json`, `.prettierrc.yml`, `.prettierrc.yaml`, `.prettierrc.json5`
4. `.prettierrc.js`, `prettier.config.js`
5. `.prettierrc.mjs`, `prettier.config.mjs` (ES Modules)
6. `.prettierrc.cjs`, `prettier.config.cjs` (CommonJS)
7. `.prettierrc.ts`, `prettier.config.ts` (TypeScript - requires Node.js >= 22.6.0)
8. `.prettierrc.mts`, `prettier.config.mts` (TypeScript ES Modules)
9. `.prettierrc.toml`

**Note**: TypeScript configuration support requires Node.js >= 22.6.0 (or `--experimental-strip-types` for earlier versions).

### Configuration Resolution

- Configuration file search starts from the formatted file's location and traverses upward
- Prettier deliberately avoids global configuration to ensure consistency across team members
- `.editorconfig` files are recognized and converted to Prettier settings (overridable by `.prettierrc`)
- Configuration overrides use ESLint's override format for file-specific settings

---

## Prettier Core Options

### Print Width (default: 80)
- Controls the line length guideline
- **Important**: This is a guideline, not a hard limit
- Prettier will make both shorter and longer lines based on code structure
- Recommended for TypeScript: **100-120 characters**
- Example: `"printWidth": 100`

### Tab Width (default: 2)
- Specifies the number of spaces per indentation level
- Recommended for TypeScript projects: **2 spaces** (industry standard)
- Example: `"tabWidth": 2`

### Semicolons (default: true)
- Adds semicolons at the end of statements
- Recommended: **true** (standard in TypeScript projects)
- Example: `"semi": true`

### Single Quote (default: false)
- Uses single quotes instead of double quotes
- Prettier chooses quotes that minimize escapes
- In case of a tie, defaults to double quotes (unless `singleQuote: true`)
- **TypeScript Consideration**: Both are equally valid; choose based on team preference
- Example: `"singleQuote": true`

### Trailing Commas (default: "all")
- Adds trailing commas in multi-line structures
- Possible values: `"none"`, `"es5"`, `"all"`
- **Recommended**: `"all"` (cleaner git diffs, better for ES modules)
- Example: `"trailingComma": "all"`

### Bracket Spacing (default: true)
- Adds spaces around object literals: `{ foo: bar }` vs `{foo: bar}`
- Recommended: **true**
- Example: `"bracketSpacing": true`

### Arrow Function Parentheses (default: "always")
- Controls parentheses around single arrow function parameters
- Possible values: `"always"`, `"avoid"`
- **Recommended**: `"always"` (better developer experience during editing)
- Example: `"arrowParens": "always"`

### End of Line (default: "lf")
- Normalizes line endings across platforms
- Possible values: `"lf"`, `"crlf"`, `"cr"`, `"auto"`
- **Recommended**: `"lf"` (standard in most projects)
- Example: `"endOfLine": "lf"`

### Prose Wrap (default: "preserve")
- Controls markdown formatting
- Possible values: `"always"`, `"never"`, `"preserve"`
- Useful for README and documentation files

### Parser
- Automatically infers from file extensions
- Prettier supports: JavaScript, TypeScript, CSS, JSON, HTML, Vue, YAML, GraphQL, Markdown
- Never use at top-level of configuration (disables automatic inference)

---

## TypeScript-Specific Considerations

### Parser Selection
- Prettier **automatically detects** `.ts` and `.tsx` files
- No need to specify parser explicitly in configuration
- Uses TypeScript parser by default for TypeScript files

### Configuration File Support
- **Prettier 3.5+** supports TypeScript configuration files:
  - `.prettierrc.ts`
  - `.prettierrc.mts`
  - `prettier.config.ts`
  - `prettier.config.mts`
- Requires Node.js >= 22.6.0 (or `--experimental-strip-types` for earlier versions)

### JSX/TSX Formatting
- `jsxSingleQuote` option controls quotes in JSX attributes
- Separate from regular `singleQuote` option
- Recommended: `false` (use double quotes for JSX, following HTML conventions)
- Example: `"jsxSingleQuote": false`

### TypeScript-Specific Features (Prettier 3.7)
- Improved formatting consistency for classes and interfaces
- Better alignment of TypeScript-specific syntax
- More predictable output for type annotations

### Quote Selection Strategy
> When it comes to double or single quotes, Prettier chooses the one which results in the fewest number of escapes. In case of a tie or the string not containing any quotes, Prettier defaults to double quotes (but that can be changed via the `singleQuote` option).

---

## Recommended Settings

### Recommended Configuration for TypeScript Projects

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

### Alternative Configuration (More Relaxed)

```json
{
  "semi": true,
  "singleQuote": true,
  "tabWidth": 4,
  "useTabs": false,
  "trailingComma": "es5",
  "printWidth": 120,
  "bracketSpacing": true,
  "arrowParens": "avoid",
  "endOfLine": "lf"
}
```

### Configuration with Overrides

```json
{
  "semi": true,
  "singleQuote": true,
  "tabWidth": 2,
  "trailingComma": "all",
  "printWidth": 100,
  "endOfLine": "lf",
  "overrides": [
    {
      "files": "*.test.ts",
      "options": {
        "semi": false
      }
    },
    {
      "files": "*.config.ts",
      "options": {
        "tabWidth": 4
      }
    }
  ]
}
```

---

## .prettierignore Patterns

### Basic Syntax
- Uses **gitignore** standard syntax
- Patterns are relative to `.prettierignore` location
- Comments start with `#`

### Default Ignored Directories
Prettier automatically ignores:
- `.git`
- `.svn`
- `.hg`
- `node_modules` (unless `--with-node-modules` flag is used)

### Recommended .prettierignore Template

```
# Dependencies
node_modules/
package-lock.json
yarn.lock
pnpm-lock.yaml

# Build output
dist/
build/
out/
.next/

# Test coverage
coverage/
.nyc_output/

# IDE and editor
.vscode/
.idea/
*.swp
*.swo
*~
.DS_Store

# Environment
.env
.env.local
.env.*.local

# Generated files
*.generated.ts
*.generated.js

# Documentation
docs/

# Logs
*.log
npm-debug.log*
yarn-error.log*
pnpm-debug.log*

# Temporary files
tmp/
temp/
```

### Common Patterns by File Type

**Exclude build artifacts:**
```
build/
dist/
out/
```

**Exclude package manager lock files:**
```
package-lock.json
yarn.lock
pnpm-lock.yaml
```

**Exclude test files from formatting (if needed):**
```
**/*.test.ts
**/*.spec.ts
```

**Exclude generated files:**
```
*.generated.ts
*.generated.js
*-generated.ts
```

### Negative Patterns for CLI

For one-off commands, use negative patterns without modifying `.prettierignore`:
```bash
prettier . "!**/*.generated.ts" --write
```

### Code-Level Ignoring

Ignore specific code sections using comments:

**TypeScript/JavaScript:**
```typescript
// prettier-ignore
const weirdlyFormatted = { a: 1,    b: 2 }

// prettier-ignore-start
const foo = {
  a:    1,
  bb:   2
}
// prettier-ignore-end
```

**HTML:**
```html
<!-- prettier-ignore -->
<div  id="foo">Code will not be formatted</div>

<!-- prettier-ignore-start -->
<div  id="bar">Multiple lines</div>
<!-- prettier-ignore-end -->
```

**CSS:**
```css
/* prettier-ignore */
.weirdly-formatted { color: red; }
```

---

## ESLint Integration

### Overview

**eslint-config-prettier** disables all ESLint rules that conflict with Prettier's formatting. This prevents duplicate reporting and ensures harmony between tools.

**Official Repository**: [https://github.com/prettier/eslint-config-prettier](https://github.com/prettier/eslint-config-prettier)

### Installation

```bash
npm install --save-dev eslint-config-prettier
```

### Setup for TypeScript Projects

#### For Modern ESLint Flat Config (eslint.config.js/mjs)

```javascript
// eslint.config.mjs
import eslint from '@eslint/js';
import prettier from 'eslint-config-prettier';
import typescript from 'typescript-eslint';

export default [
  {
    ignores: ['node_modules/*', 'dist/*'],
  },
  eslint.configs.recommended,
  ...typescript.configs.recommended,
  prettier, // Must be last!
];
```

#### For Legacy ESLint Config (.eslintrc.json)

```json
{
  "extends": [
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended",
    "prettier"
  ]
}
```

### Important Notes for TypeScript

1. **Plugin Naming**: eslint-config-prettier recognizes official plugin names like `@typescript-eslint`. If you rename plugins to shorter aliases, conflicts may not be detected.

2. **Rule Coverage**: eslint-config-prettier turns off `@typescript-eslint/indent` and other TypeScript ESLint rules automatically. You don't need separate entries like `"prettier/typescript"`.

3. **Quote Consistency**: If ESLint enforces specific quote styles, ensure they match Prettier's settings:
   - ESLint `quotes: ['error', 'single']` should match Prettier `singleQuote: true`
   - ESLint `quotes: ['error', 'double']` should match Prettier `singleQuote: false`

4. **Other Potential Conflicts**:
   - `arrow-body-style`
   - `prefer-arrow-callback`
   - `curly` (avoid "multi-line" or "multi-or-nest" options)

### Verification Tool

eslint-config-prettier ships with a CLI helper to check for conflicts:

```bash
npx eslint-config-prettier path/to/file.ts
```

Exit codes:
- `0`: No conflicts found
- `1`: Error occurred
- `2`: Conflicts detected

---

## NPM Scripts

### Basic Formatting Scripts

```json
{
  "scripts": {
    "format": "prettier --write .",
    "format:check": "prettier --check .",
    "format:src": "prettier --write \"src/**/*.{ts,tsx}\"",
    "format:fix": "prettier --write \"src/**/*.{ts,tsx}\" && eslint --fix \"src/**/*.{ts,tsx}\""
  }
}
```

### TypeScript-Specific Scripts

```json
{
  "scripts": {
    "format": "prettier --write \"src/**/*.{ts,tsx,json}\"",
    "format:check": "prettier --check \"src/**/*.{ts,tsx,json}\"",
    "format:list": "prettier --list-different \"src/**/*.{ts,tsx,json}\"",
    "lint": "eslint \"src/**/*.{ts,tsx}\"",
    "lint:fix": "eslint --fix \"src/**/*.{ts,tsx}\"",
    "check": "npm run format:check && npm run lint"
  }
}
```

### With Caching (Prettier 3.x)

```json
{
  "scripts": {
    "format": "prettier --write --cache .",
    "format:check": "prettier --check --cache .",
    "format:clear-cache": "prettier --cache --cache-strategy=metadata --write ."
  }
}
```

### CI/CD Integration

```json
{
  "scripts": {
    "format:verify": "prettier --check \"src/**/*.{ts,tsx}\" || (echo 'Prettier check failed' && exit 1)",
    "lint:ci": "eslint --format compact \"src/**/*.{ts,tsx}\"",
    "ci": "npm run format:verify && npm run lint:ci"
  }
}
```

### Key CLI Flags

| Flag | Purpose | Example |
|------|---------|---------|
| `--write` | Format files in place | `prettier --write .` |
| `--check` | Verify formatting without modifying (exit code 1 if issues) | `prettier --check src/**/*.ts` |
| `--list-different` | List files that don't match formatting | `prettier --list-different src/**/*.ts` |
| `--cache` | Enable caching for faster runs | `prettier --write --cache .` |
| `--ignore-unknown` | Skip unrecognized file types | `prettier --write --ignore-unknown .` |
| `--debug-check` | Detect potential correctness issues | `prettier --debug-check src/**/*.ts` |

---

## Complete Setup Examples

### Example 1: Minimal TypeScript Project Setup

#### `.prettierrc.json`
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

#### `.prettierignore`
```
node_modules/
dist/
coverage/
.env
```

#### `package.json`
```json
{
  "name": "my-typescript-project",
  "version": "1.0.0",
  "scripts": {
    "format": "prettier --write \"src/**/*.{ts,tsx}\"",
    "format:check": "prettier --check \"src/**/*.{ts,tsx}\""
  },
  "devDependencies": {
    "prettier": "^3.7.0"
  }
}
```

### Example 2: Full Project with ESLint Integration

#### `.prettierrc.json`
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

#### `.prettierignore`
```
# Dependencies
node_modules/
package-lock.json
yarn.lock

# Build
dist/
build/
out/

# Testing
coverage/

# Environment
.env*

# IDE
.vscode/
.idea/

# Logs
*.log
```

#### `eslint.config.mjs`
```javascript
import eslint from '@eslint/js';
import prettier from 'eslint-config-prettier';
import typescript from 'typescript-eslint';

export default [
  {
    ignores: ['node_modules/*', 'dist/*', 'coverage/*'],
  },
  eslint.configs.recommended,
  ...typescript.configs.recommended,
  {
    files: ['**/*.ts', '**/*.tsx'],
    rules: {
      '@typescript-eslint/explicit-function-return-types': 'warn',
      '@typescript-eslint/no-unused-vars': 'error',
    },
  },
  prettier,
];
```

#### `package.json`
```json
{
  "name": "my-typescript-project",
  "version": "1.0.0",
  "scripts": {
    "format": "prettier --write \"src/**/*.{ts,tsx}\"",
    "format:check": "prettier --check \"src/**/*.{ts,tsx}\"",
    "lint": "eslint \"src/**/*.{ts,tsx}\"",
    "lint:fix": "eslint --fix \"src/**/*.{ts,tsx}\"",
    "check": "npm run format:check && npm run lint"
  },
  "devDependencies": {
    "@eslint/js": "^9.x.x",
    "eslint": "^9.x.x",
    "eslint-config-prettier": "^9.x.x",
    "prettier": "^3.7.0",
    "typescript": "^5.x.x",
    "typescript-eslint": "^8.x.x"
  }
}
```

### Example 3: TypeScript Configuration File Format

#### `prettier.config.ts` (Prettier 3.5+)
```typescript
import type { Config } from 'prettier';

const config: Config = {
  semi: true,
  singleQuote: true,
  tabWidth: 2,
  useTabs: false,
  trailingComma: 'all',
  printWidth: 100,
  bracketSpacing: true,
  arrowParens: 'always',
  endOfLine: 'lf',
  jsxSingleQuote: false,
};

export default config;
```

#### `prettier.config.mts` (ES Module variant)
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

### Example 4: Project with Override Configuration

#### `.prettierrc.json`
```json
{
  "semi": true,
  "singleQuote": true,
  "tabWidth": 2,
  "trailingComma": "all",
  "printWidth": 100,
  "endOfLine": "lf",
  "overrides": [
    {
      "files": "*.json",
      "options": {
        "tabWidth": 2
      }
    },
    {
      "files": ["*.yml", "*.yaml"],
      "options": {
        "useTabs": false,
        "tabWidth": 2
      }
    },
    {
      "files": "*.config.ts",
      "options": {
        "tabWidth": 4,
        "printWidth": 120
      }
    },
    {
      "files": "*.test.ts",
      "options": {
        "printWidth": 120
      }
    }
  ]
}
```

---

## Summary and Best Practices

### Key Takeaways

1. **Use a configuration file**: Store all Prettier settings in `.prettierrc` (JSON) or `prettier.config.js` (JavaScript/TypeScript) at project root

2. **Integrate with ESLint**: Use `eslint-config-prettier` to prevent conflicts between tools

3. **Recommended TypeScript Settings**:
   - `semi: true` (standard in TypeScript)
   - `singleQuote: true` (consistent with TypeScript style)
   - `tabWidth: 2` (industry standard)
   - `trailingComma: "all"` (cleaner diffs)
   - `printWidth: 100` (readable without wrapping)
   - `endOfLine: "lf"` (cross-platform consistency)

4. **Always use .prettierignore**: Define ignored patterns to prevent formatting unintended files

5. **Add npm scripts**: Make formatting easily accessible for developers:
   ```json
   {
     "format": "prettier --write \"src/**/*.{ts,tsx}\"",
     "format:check": "prettier --check \"src/**/*.{ts,tsx}\""
   }
   ```

6. **Use TypeScript config files** (Prettier 3.5+) for type-safe configuration

7. **Configure overrides** for special cases (test files, config files, etc.)

8. **Verify integration**: Run `eslint-config-prettier` helper to ensure no conflicts

---

## Additional Resources

### TypeScript-Specific Guides
- [LogRocket: Linting TypeScript using ESLint and Prettier](https://blog.logrocket.com/linting-typescript-eslint-prettier/)
- [DEV Community: How to Set Up ESLint and Prettier in a TypeScript Project](https://dev.to/forhad96/-how-to-set-up-eslint-and-prettier-in-a-typescript-project-3pi2)

### JSON Schema Validation
- **Prettier Configuration Schema**: [https://www.schemastore.org/prettierrc.json](https://www.schemastore.org/prettierrc.json)

### Editor Integration
- **Editor Integration Guide**: [https://prettier.io/docs/editors](https://prettier.io/docs/editors)

---

**Document Generated**: December 25, 2025
**Prettier Version Reference**: 3.5+ (with backward compatibility notes for 3.0+)
