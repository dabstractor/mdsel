import { Command } from 'commander';
import { createRequire } from 'module';
import { indexCommand } from './commands/index-command.js';
import { selectCommand } from './commands/select-command.js';
import { ExitCode } from './utils/exit-codes.js';

// ESM-compatible way to read package.json
// Path is relative to the built dist/cli.mjs file
const require = createRequire(import.meta.url);
const pkg = require('../package.json') as { description: string; version: string };

const program = new Command();

program
  .name('mdsel')
  .description(pkg.description)
  .version(pkg.version);

program
  .command('index')
  .description('Parse documents and emit selector inventory')
  .argument('<files...>', 'Markdown files to index')
  .action(async (files: string[]) => {
    try {
      await indexCommand(files);
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
      await selectCommand(selector, files, options);
    } catch (error) {
      console.error('Unexpected error:', error);
      process.exit(ExitCode.ERROR);
    }
  });

program.parse();
