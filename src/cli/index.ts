import { Command } from 'commander';

const program = new Command();

program
  .name('mdsel')
  .description('Declarative Markdown semantic selection CLI for LLM agents')
  .version('1.0.0');

program
  .command('index')
  .description('Parse documents and emit selector inventory')
  .argument('<files...>', 'Markdown files to index')
  .action((files: string[]) => {
    // Placeholder - will be implemented in P1.M2
    console.log(JSON.stringify({ status: 'not_implemented', files }, null, 2));
  });

program
  .command('select')
  .description('Retrieve content via selectors')
  .argument('<selector>', 'Selector string')
  .argument('[files...]', 'Markdown files to search')
  .option('--full', 'Bypass truncation and return full content')
  .action((selector: string, files: string[], options: { full?: boolean }) => {
    // Placeholder - will be implemented in P2.M2
    console.log(JSON.stringify({ status: 'not_implemented', selector, files, options }, null, 2));
  });

program.parse();
