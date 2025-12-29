import { Command } from 'commander';
import { createRequire } from 'module';
import { existsSync } from 'fs';
import { indexCommand } from './commands/index-command.js';
import { selectCommand, selectMultiCommand } from './commands/select-command.js';
import { formatCommand } from './commands/format-command.js';
import { ExitCode } from './utils/exit-codes.js';
import { isStdinPiped } from './utils/file-reader.js';

// ESM-compatible way to read package.json
// Path is relative to the built dist/cli.mjs file
const require = createRequire(import.meta.url);
const pkg = require('../package.json') as { description: string; version: string };

/**
 * Determine if an argument is a file path or a selector.
 * Files: end with .md/.markdown, or exist on disk
 * Selectors: everything else
 */
function isFilePath(arg: string): boolean {
  // Common markdown extensions
  if (/\.(md|markdown)$/i.test(arg)) {
    return true;
  }
  // Check if file exists on disk
  if (existsSync(arg)) {
    return true;
  }
  return false;
}

/**
 * Partition arguments into files and selectors.
 */
function partitionArgs(args: string[]): { files: string[]; selectors: string[] } {
  const files: string[] = [];
  const selectors: string[] = [];

  for (const arg of args) {
    if (isFilePath(arg)) {
      files.push(arg);
    } else {
      selectors.push(arg);
    }
  }

  return { files, selectors };
}

const program = new Command();

program
  .name('mdsel')
  .description(pkg.description)
  .version(pkg.version)
  .option('--json', 'Output JSON instead of minimal text')
  .argument('[args...]', 'Files and/or selectors')
  .action(async (args: string[]) => {
    try {
      const globalOpts = program.opts<{ json?: boolean }>();

      // No arguments at all - show help (unless stdin is piped)
      if (args.length === 0) {
        if (isStdinPiped()) {
          // Handle stdin input
          await indexCommand([], { json: globalOpts.json });
          return;
        }
        program.outputHelp();
        process.exit(0);
      }

      // Partition into files and selectors
      const { files, selectors } = partitionArgs(args);

      // No files found - show error
      if (files.length === 0) {
        console.error('Error: No markdown files provided.');
        console.error('Usage: mdsel <file.md> [selector...]');
        process.exit(ExitCode.ERROR);
      }

      // Files only → index
      if (selectors.length === 0) {
        await indexCommand(files, { json: globalOpts.json });
        return;
      }

      // Files + selectors → select
      if (selectors.length === 1) {
        await selectCommand(selectors[0]!, files, { json: globalOpts.json });
      } else {
        await selectMultiCommand(selectors, files, { json: globalOpts.json });
      }
    } catch (error) {
      console.error('Unexpected error:', error);
      process.exit(ExitCode.ERROR);
    }
  });

// Keep format as explicit command (not file/selector based)
program
  .command('format')
  .description('Output format specification for tool descriptions')
  .argument('[command]', 'Command to describe (index, select, or omit for all)')
  .option('--example', 'Show example output instead of terse spec')
  .action((command: string | undefined, options: { example?: boolean }) => {
    formatCommand(command, options);
  });

program.parse();
