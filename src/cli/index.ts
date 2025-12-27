import { Command } from 'commander';
import { createRequire } from 'module';
import { indexCommand } from './commands/index-command.js';
import { selectCommand } from './commands/select-command.js';
import { formatCommand } from './commands/format-command.js';
import { ExitCode } from './utils/exit-codes.js';

// ESM-compatible way to read package.json
// Path is relative to the built dist/cli.mjs file
const require = createRequire(import.meta.url);
const pkg = require('../package.json') as { description: string; version: string };

const program = new Command();

program
  .name('mdsel')
  .description(pkg.description)
  .version(pkg.version)
  .option('--json', 'Output JSON instead of minimal text');

program
  .command('index')
  .description('Parse documents and emit selector inventory')
  .argument('<files...>', 'Markdown files to index')
  .action(async (files: string[]) => {
    try {
      const globalOpts = program.opts<{ json?: boolean }>();
      await indexCommand(files, { json: globalOpts.json });
    } catch (error) {
      console.error('Unexpected error:', error);
      process.exit(ExitCode.ERROR);
    }
  });

program
  .command('select')
  .description('Retrieve content via selectors')
  .argument('<selector>', 'Selector string')
  .argument('[files...]', 'Markdown files to search')
  .option('--full', 'Bypass truncation and return full content')
  .action(async (selector: string, files: string[], options: { full?: boolean }) => {
    try {
      const globalOpts = program.opts<{ json?: boolean }>();
      await selectCommand(selector, files, { ...options, json: globalOpts.json });
    } catch (error) {
      console.error('Unexpected error:', error);
      process.exit(ExitCode.ERROR);
    }
  });

program
  .command('format')
  .description('Output format specification for tool descriptions')
  .argument('[command]', 'Command to describe (index, select, or omit for all)')
  .option('--example', 'Show example output instead of terse spec')
  .action((command: string | undefined, options: { example?: boolean }) => {
    formatCommand(command, options);
  });

program.parse();
