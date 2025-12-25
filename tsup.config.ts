import { defineConfig } from 'tsup';

export default defineConfig({
  entry: { cli: 'src/cli/index.ts' },
  format: ['esm'],
  target: 'node18',
  dts: true,
  clean: true,
  sourcemap: true,
  outExtension() {
    return {
      js: '.mjs',
    };
  },
  banner: {
    js: '#!/usr/bin/env node',
  },
});
