# CLI Shebang and Executable Permissions Research

## Current Status

The current build configuration correctly adds the shebang:

```bash
#!/usr/bin/env node
```

This is verified in `/home/dustin/projects/mdsel/dist/cli.mjs`:
- Shebang is present as first line
- File has executable permissions (`-rwxr-xr-x`)

## tsup Banner Configuration

The shebang is added via tsup's `banner` option:

```typescript
// tsup.config.ts
export default defineConfig({
  banner: {
    js: '#!/usr/bin/env node',
  },
});
```

## Best Practices for CLI Tools

### 1. Shebang Format

Use `#!/usr/bin/env node` instead of `#!/usr/bin/node`:
- More portable across different systems
- Respects user's PATH for node location

### 2. Executable Permissions

Build output should have execute permissions:
- Source files: `644` (not executable)
- Built CLI: `755` (executable)

Current tsup builds preserve execute permissions correctly.

### 3. Binary Field in package.json

```json
"bin": {
  "mdsel": "./dist/cli.mjs"
}
```

npm automatically handles executable permissions when installing packages.

### 4. No Additional Script Needed

Unlike some projects that use a separate wrapper script, tsup's banner approach:
- Adds shebang directly to the compiled output
- No additional wrapper files needed
- Simpler package structure

## Real-World Examples

### tsup itself
```typescript
// tsup's own CLI source
#!/usr/bin/env node
import { handleError } from './errors'
import { main } from './cli-main'
main().catch(handleError)
```

### commander.js pattern
Standard pattern for TypeScript CLI tools using Commander.js:
```typescript
#!/usr/bin/env node
import { Command } from 'commander';
const program = new Command();
// ... rest of CLI logic
program.parse();
```

## Sources

- [tsup banner documentation](https://tsup.egoist.dev/#banner)
- [npm bin field docs](https://docs.npmjs.com/cli/v10/configuring-npm/package-json#bin)
- [Shebang Wikipedia](https://en.wikipedia.org/wiki/Shebang_(Unix))
