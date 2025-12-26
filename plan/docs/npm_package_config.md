# npm Package Configuration Research

## package.json Essential Fields for CLI Distribution

### Key Fields

| Field | Current Value | Best Practice | Notes |
|-------|---------------|---------------|-------|
| `name` | "mdsel" | Correct | Short, memorable name |
| `version` | "1.0.0" | Correct | Semantic versioning |
| `description` | ✓ | Correct | Clear description for LLM focus |
| `type` | "module" | Correct | ESM-first is modern |
| `main` | "./dist/index.mjs" | **ISSUE** | Points to non-existent file (cli.mjs exists) |
| `types` | "./dist/index.d.ts" | **ISSUE** | Points to non-existent file (cli.d.ts exists) |
| `bin` | "./dist/cli.mjs" | Correct | Single binary entry point |
| `files` | ["dist"] | Correct | Only include compiled output |
| `exports` | Missing | **RECOMMENDED** | Modern ESM exports field |
| `engines` | ">=18.0.0" | Correct | Node 18+ for ESM support |
| `license` | "MIT" | Correct | Permissive license |

### Recommended Changes

1. **Fix main/types entry points** - Since this is a CLI-only package (no library exports):
   - Either remove `main` and `types` (CLI packages don't need them)
   - Or point to actual files: `"./dist/cli.mjs"` and `"./dist/cli.d.ts"`

2. **Add exports field** for modern package consumers:
   ```json
   "exports": {
     "./cli": {
       "types": "./dist/cli.d.ts",
       "import": "./dist/cli.mjs"
     }
   }
   ```

3. **Consider adding publishConfig**:
   ```json
   "publishConfig": {
     "access": "public"
   }
   ```

## Sources

- [npm package.json docs](https://docs.npmjs.com/cli/v10/configuring-npm/package-json)
- [Node.js ESM docs](https://nodejs.org/api/esm.html)
- [package.json exports field](https://nodejs.org/api/packages.html#exports)
- [tsup CLI documentation](https://tsup.egoist.dev/)
