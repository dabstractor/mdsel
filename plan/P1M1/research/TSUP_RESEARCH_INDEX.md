# tsup 8.x Research Index

## Research Overview

This directory contains comprehensive research on configuring **tsup 8.x** as a bundler for TypeScript Node.js CLI projects. The research focuses on production-ready configurations with examples and best practices.

## Document Structure

### 1. **tsup-setup.md** (Main Reference - 938 lines)
Comprehensive guide covering:

- Installation and setup
- Core configuration structure (tsup.config.ts)
- Entry point configuration for CLI tools
- ESM output format configuration
- Declaration file generation (dts)
- Node.js 18+ target settings
- Clean output directory behavior
- Shebang preservation for CLI binaries
- Complete CLI tool configuration examples
- Development and build workflows
- Advanced configuration options
- package.json integration
- Common patterns and templates
- Troubleshooting guide
- Official resources and references

**Key Sections:**
- Section 9: Complete CLI Tool Configuration Example (with full file structure)
- Section 10: Development & Build Workflow
- Section 14: Common Patterns (for quick reference)
- Section 18: Official Resources & URLs

### 2. **TSUP_QUICK_REFERENCE.md** (Quick Access)
One-page reference for frequently needed configurations:

- One-minute setup
- Essential configuration table
- ESM and dual format examples
- Shebang handling
- Declaration file options
- Build scripts and development workflow
- Troubleshooting quick table
- Complete minimal CLI example

**Use this for:** Quick lookups while coding

### 3. **TSUP_RESEARCH_INDEX.md** (This File)
Navigation guide for all research materials.

---

## Key Findings

### Official Documentation Sources

1. **Main Documentation**: https://tsup.egoist.dev/
2. **GitHub Repository**: https://github.com/egoist/tsup
3. **npm Package**: https://www.npmjs.com/package/tsup
4. **Type Documentation**: https://www.jsdocs.io/package/tsup

### Critical Configuration Points for CLI Tools

#### 1. Entry Point Configuration
```typescript
entry: ['src/cli.ts']
// or for library + CLI
entry: {
  index: 'src/index.ts',
  cli: 'src/cli.ts',
}
```

#### 2. ESM Output Format
```typescript
format: ['esm'],
outExtension({ format }) {
  return { js: '.mjs' }
}
```

#### 3. Declaration Files
```typescript
dts: true
// or with options
dts: { entry: 'src/index.ts', resolve: true }
```

#### 4. Node.js 18+ Target
```typescript
target: 'node18',
platform: 'node'
```

#### 5. Clean Output
```typescript
clean: true,  // Removes dist/ before each build
```

#### 6. Shebang for CLI
```typescript
// Option 1: In source file
// #!/usr/bin/env node

// Option 2: Via banner
banner: { js: '#!/usr/bin/env node' }
```

### Best Practice Configuration (CLI Tool)

```typescript
// tsup.config.ts
import { defineConfig } from 'tsup'

export default defineConfig({
  entry: ['src/cli.ts'],
  format: ['esm'],
  target: 'node18',
  platform: 'node',
  dts: true,
  outDir: 'dist',
  clean: true,
  outExtension({ format }) {
    return { js: '.mjs' }
  },
  splitting: false,
  sourcemap: true,
  treeshake: true,
  shims: true,
  banner: { js: '#!/usr/bin/env node' },
  external: [],  // List any external deps here
})
```

```json
// package.json
{
  "type": "module",
  "bin": "./dist/cli.mjs",
  "scripts": {
    "build": "tsup",
    "dev": "tsup --watch"
  },
  "files": ["dist"]
}
```

### Important Notes from Research

1. **tsup is no longer actively maintained** (as of 2025)
   - Still widely used: 11k+ GitHub stars, 123k+ projects
   - Maintainers recommend tsdown as alternative
   - Consider migration path for new projects

2. **tsup does NOT read tsconfig.json** for build options
   - Must set target, format, etc. explicitly in tsup.config.ts
   - tsconfig.json used only for TypeScript compilation

3. **Shebang preservation works automatically**
   - If source file has `#!/usr/bin/env node`, it's preserved
   - File permissions are set automatically
   - Can also use banner option as backup

4. **ESM vs CommonJS**
   - Use `.mjs` extension for explicit ESM
   - Use `.cjs` extension for explicit CommonJS
   - Don't rely on package.json "type" field alone

5. **Declaration file generation**
   - `dts: true` generates .d.ts files automatically
   - With multiple formats, generates .d.ts, .d.mts, .d.cts
   - Use `dts.entry` to specify which file gets declarations

---

## Configuration Quick Selectors

### For: Simple CLI Tool
See **tsup-setup.md** Section 9 or **TSUP_QUICK_REFERENCE.md** complete example

### For: Library + CLI
See **tsup-setup.md** Section 9 (Multiple Entry Points)

### For: Node.js Backend Server
See **tsup-setup.md** Section 14 (Pattern 4)

### For: Dual ESM/CommonJS Publishing
See **tsup-setup.md** Section 4 and 9

### For: Development Workflow
See **tsup-setup.md** Section 10 or **TSUP_QUICK_REFERENCE.md** Build Scripts section

### For: Troubleshooting
See **tsup-setup.md** Section 16 or **TSUP_QUICK_REFERENCE.md** Troubleshooting table

---

## External Resources Referenced

### Documentation & Guides
- [Using tsup to bundle your TypeScript package - LogRocket Blog](https://blog.logrocket.com/tsup/)
- [Tsup: A Guide to the TypeScript Bundler - Built In](https://builtin.com/articles/tsup)
- [How to Create an npm Package with tsup](https://casperiv.dev/blog/how-to-create-an-npm-package-tsup-esm-cjs-nodejs)
- [Tsup Guide: Bundle your TypeScript library - Generalist Programmer](https://generalistprogrammer.com/tutorials/tsup-npm-package-guide)

### Related Technologies
- [Node.js Shebang Guide](https://alexewerlof.medium.com/node-shebang-e1d4b02f731d)
- [Creating TypeScript CLI Tools - Spencer Miskoviak](https://www.skovy.dev/blog/creating-a-cli-with-typescript)
- [Dual Publishing ESM/CJS with tsup - johnnyreilly](https://johnnyreilly.com/dual-publishing-esm-cjs-modules-with-tsup-and-are-the-types-wrong)
- [TypeScript in 2025: ESM and CJS publishing - Liran Tal](https://lirantal.com/blog/typescript-in-2025-with-esm-and-cjs-npm-publishing)

### Community Examples
- [How to bundle a tree-shakable TypeScript library - DEV Community](https://dev.to/orabazu/how-to-bundle-a-tree-shakable-typescript-library-with-tsup-and-publish-with-npm-3c46)
- [Building NPM packages with tsup - DEV Community](https://dev.to/tigawanna/building-and-publishing-npm-packages-with-typescript-multiple-entry-points-tailwind-tsup-and-npm-9e7)
- [TypeScript CLI starter kit - GitHub](https://github.com/kucherenko/cli-typescript-starter)

---

## Configuration Templates by Use Case

### Template 1: Minimal CLI
**Location**: tsup-setup.md Section 9 (Minimal Example)
**Lines of config**: ~15 lines

### Template 2: Library + CLI
**Location**: tsup-setup.md Section 9 (Complete Example)
**Lines of config**: ~35 lines

### Template 3: Dual ESM/CJS Library
**Location**: tsup-setup.md Section 14 (Pattern 3)
**Lines of config**: ~12 lines

### Template 4: Production Server
**Location**: tsup-setup.md Section 14 (Pattern 4)
**Lines of config**: ~10 lines

---

## Performance & Best Practices

### Build Performance
- tsup is powered by esbuild, one of the fastest bundlers
- Typical CLI tool builds in <100ms
- Watch mode enables fast iteration during development

### File Size Optimization
- Use `minify: true` for production builds
- Enable `treeshake: true` for unused code removal
- Use `splitting: false` for CLI tools (single bundle)
- List external dependencies to avoid bloating bundle

### Type Safety
- Always enable `dts: true` for published packages
- Use `dts.resolve: true` to resolve external types
- Declare types in package.json exports

### Cross-Platform Compatibility
- Use `#!/usr/bin/env node` shebang (not `/usr/bin/node`)
- Works on Unix/Linux/macOS and Windows
- npm generates .cmd wrapper scripts on Windows

---

## Maintenance & Migration Notes

### tsup Maintenance Status
- **Status**: Not actively maintained (as of 2025)
- **Recommendation**: Use for existing projects, consider alternatives for new ones
- **Migration Path**: tsdown (official recommendation)

### Staying Current
- Monitor GitHub for security issues
- Subscribe to npm for deprecation notices
- Check release notes before major version bumps

### Alternative Tools (if migration needed)
1. **tsdown** - Official recommendation from tsup maintainers
2. **esbuild** - Lower level, more control
3. **Vite** - For web/frontend projects
4. **Rollup** - For library bundling
5. **Webpack** - For complex applications

---

## Quick Links to Documents

| Document | Purpose | Best For |
|----------|---------|----------|
| **tsup-setup.md** | Comprehensive reference | Deep learning, complete configurations |
| **TSUP_QUICK_REFERENCE.md** | Quick lookup | While coding, finding specific options |
| **TSUP_RESEARCH_INDEX.md** | Navigation (this file) | Understanding research structure |

---

## Next Steps

1. **Choose your configuration template** from Section 14 of tsup-setup.md
2. **Create tsup.config.ts** using the appropriate template
3. **Configure package.json** with build scripts and bin field
4. **Test locally** with `npm run dev` and `npm run build`
5. **Verify CLI** works with `node dist/cli.mjs`
6. **Publish** to npm when ready

---

## Document Metadata

- **Research Date**: December 25, 2025
- **tsup Version Covered**: 8.x (latest 8.5.1)
- **Node.js Target**: 18+
- **Total Documentation**: ~1,200 lines across 3 documents
- **Configuration Examples**: 20+
- **Official Sources**: 4
- **Community Resources**: 10+

---

End of Index
