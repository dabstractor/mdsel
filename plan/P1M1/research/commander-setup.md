# Commander.js 12.x with TypeScript - Setup Guide & Best Practices

## Overview

Commander.js is a comprehensive Node.js framework for building command-line interfaces with excellent TypeScript support. This document covers best practices for setting up and using Commander.js 12.x with TypeScript, including practical examples for the mdsel project's `index` and `select` commands.

**Official Resources:**
- GitHub: https://github.com/tj/commander.js
- npm: https://www.npmjs.com/package/commander

## Table of Contents

1. [Installation & TypeScript Setup](#installation--typescript-setup)
2. [Program Setup with TypeScript Types](#program-setup-with-typescript-types)
3. [Subcommand Structure](#subcommand-structure)
4. [Variadic File Arguments](#variadic-file-arguments)
5. [Option Parsing (--json, --full flags)](#option-parsing)
6. [Error Handling & Exit Codes](#error-handling--exit-codes)
7. [JSON Output Best Practices](#json-output-best-practices)
8. [Complete Working Examples](#complete-working-examples)

---

## Installation & TypeScript Setup

### Install Dependencies

```bash
npm install commander
npm install --save-dev typescript @types/node
```

**Important:** Commander.js includes built-in TypeScript definitions since v5.x. Do NOT install `@types/commander` separately.

### TypeScript Configuration (tsconfig.json)

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "commonjs",
    "lib": ["ES2020"],
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true,
    "moduleResolution": "node"
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist"]
}
```

### Package.json Configuration

For CLI applications:

```json
{
  "name": "mdsel",
  "version": "1.0.0",
  "type": "module",
  "bin": {
    "mdsel": "./dist/cli.js"
  },
  "scripts": {
    "build": "tsc",
    "dev": "ts-node src/cli.ts",
    "start": "node dist/cli.js"
  }
}
```

Add a shebang to your compiled CLI entry point:

```typescript
#!/usr/bin/env node
```

---

## Program Setup with TypeScript Types

### Basic Program Structure

```typescript
import { Command } from 'commander';

const program = new Command();

program
  .name('mdsel')
  .version('1.0.0')
  .description('Markdown file selector and indexer')
  .parse(process.argv);
```

### Type-Safe Options Interface

Define options as TypeScript interfaces for better type safety:

```typescript
import { Command } from 'commander';

interface GlobalOptions {
  debug?: boolean;
  quiet?: boolean;
  config?: string;
}

interface CommandOptions extends GlobalOptions {
  json?: boolean;
  full?: boolean;
  output?: string;
}

const program = new Command<CommandOptions>();

program
  .option('-d, --debug', 'Enable debug output')
  .option('-q, --quiet', 'Suppress all output except results')
  .option('-c, --config <path>', 'Path to config file');

// Multi-word options are automatically camelCased
// '--template-engine' becomes `options.templateEngine`
```

### Accessing Parsed Options

```typescript
program.parse(process.argv);
const options: GlobalOptions = program.opts();

if (options.debug) {
  console.log('Debug mode enabled');
}
```

---

## Subcommand Structure

### Basic Subcommand Syntax

```typescript
import { Command } from 'commander';

const program = new Command();

program
  .name('mdsel')
  .version('1.0.0')
  .description('Markdown file selector and indexer');

// 'index' subcommand
program
  .command('index')
  .description('Index markdown files in a directory')
  .argument('<directory>', 'Directory to index')
  .option('-r, --recursive', 'Recursively index subdirectories')
  .option('--json', 'Output as JSON')
  .action((directory, options) => {
    console.log(`Indexing ${directory}`);
    if (options.recursive) {
      console.log('Recursive mode enabled');
    }
  });

// 'select' subcommand
program
  .command('select')
  .description('Select markdown files from index')
  .argument('<pattern>', 'Search pattern')
  .option('--json', 'Output as JSON')
  .option('--full', 'Include full file contents')
  .action((pattern, options) => {
    console.log(`Selecting files matching: ${pattern}`);
  });

program.parse(process.argv);
```

### Organizing Subcommands in Separate Files

For larger projects, organize commands in separate modules:

**File structure:**
```
src/
  cli.ts
  commands/
    index.ts
    select.ts
  types.ts
```

**src/types.ts:**
```typescript
export interface CommandOptions {
  json?: boolean;
  full?: boolean;
  recursive?: boolean;
  debug?: boolean;
}

export interface IndexCommandOptions extends CommandOptions {
  recursive?: boolean;
}

export interface SelectCommandOptions extends CommandOptions {
  json?: boolean;
  full?: boolean;
}
```

**src/commands/index.ts:**
```typescript
import { Command } from 'commander';
import { IndexCommandOptions } from '../types.js';

export function createIndexCommand(): Command {
  return new Command('index')
    .description('Index markdown files in a directory')
    .argument('<directory>', 'Directory to index')
    .option('-r, --recursive', 'Recursively index subdirectories')
    .option('--json', 'Output as JSON')
    .action((directory: string, options: IndexCommandOptions) => {
      // Implementation here
      console.log(`Indexing ${directory}`);
    });
}
```

**src/commands/select.ts:**
```typescript
import { Command } from 'commander';
import { SelectCommandOptions } from '../types.js';

export function createSelectCommand(): Command {
  return new Command('select')
    .description('Select markdown files from index')
    .argument('<pattern>', 'Search pattern')
    .option('--json', 'Output as JSON')
    .option('--full', 'Include full file contents')
    .action((pattern: string, options: SelectCommandOptions) => {
      // Implementation here
      console.log(`Selecting: ${pattern}`);
    });
}
```

**src/cli.ts:**
```typescript
#!/usr/bin/env node

import { Command } from 'commander';
import { createIndexCommand } from './commands/index.js';
import { createSelectCommand } from './commands/select.js';

const program = new Command();

program
  .name('mdsel')
  .version('1.0.0')
  .description('Markdown file selector and indexer');

program.addCommand(createIndexCommand());
program.addCommand(createSelectCommand());

program.parse(process.argv);
```

### Nested Subcommands

Commander supports nested subcommands for hierarchical command structures:

```typescript
const program = new Command();

// Create a parent command
const configCommand = new Command('config')
  .description('Manage configuration');

// Add sub-subcommands
configCommand
  .command('get <key>')
  .description('Get a configuration value')
  .action((key) => {
    console.log(`Getting config: ${key}`);
  });

configCommand
  .command('set <key> <value>')
  .description('Set a configuration value')
  .action((key, value) => {
    console.log(`Setting ${key} = ${value}`);
  });

program.addCommand(configCommand);
program.parse(process.argv);
```

---

## Variadic File Arguments

### Required Variadic Arguments

For commands that require one or more files:

```typescript
program
  .command('process <files...>')
  .description('Process one or more files')
  .action((files: string[]) => {
    console.log('Processing files:', files);
    files.forEach(file => {
      // Process each file
    });
  });
```

Usage:
```bash
mdsel process file1.md file2.md file3.md
```

### Optional Variadic Arguments

For commands where files are optional:

```typescript
program
  .command('select [files...]')
  .description('Select files (optional)')
  .option('--json', 'Output as JSON')
  .action((files: string[] = [], options) => {
    if (files.length === 0) {
      console.log('No files specified, using default');
    } else {
      console.log('Selected files:', files);
    }
  });
```

### Variadic with Other Arguments

Variadic arguments must come last:

```typescript
program
  .command('build <target> <files...>')
  .description('Build target with specified files')
  .action((target: string, files: string[]) => {
    console.log(`Building ${target} with:`, files);
  });
```

Usage:
```bash
mdsel build production file1.md file2.md
```

### Combining Variadic Arguments with Options

```typescript
program
  .command('index <directory> [files...]')
  .description('Index directory with optional file filter')
  .option('-r, --recursive', 'Recursive indexing')
  .option('--exclude <patterns>', 'Exclude patterns (comma-separated)')
  .action((directory: string, files: string[], options) => {
    console.log(`Directory: ${directory}`);
    console.log(`Files: ${files.length > 0 ? files : 'all'}`);
    if (options.recursive) {
      console.log('Recursive mode enabled');
    }
  });
```

---

## Option Parsing

### Boolean Flags

```typescript
program
  .option('--json', 'Output as JSON')
  .option('--no-colors', 'Disable colored output')
  .action((options) => {
    console.log('JSON output:', options.json);    // true or false
    console.log('Colors:', options.colors);       // true or false (inverted from --no-colors)
  });
```

### Options with Values

```typescript
program
  .option('-o, --output <path>', 'Output file path')
  .option('-f, --format <type>', 'Output format (json, csv, txt)')
  .action((options) => {
    console.log('Output path:', options.output);
    console.log('Format:', options.format);
  });
```

### Optional Option Values

```typescript
program
  .option('--timeout [ms]', 'Timeout in milliseconds', '5000')
  .action((options) => {
    const timeout = parseInt(options.timeout);
    console.log('Timeout:', timeout);
  });
```

### Options with Custom Processing Functions

Validate and transform option values:

```typescript
// Custom type coercion
program
  .option('-p, --port <number>', 'Port number', (value) => {
    const port = parseInt(value);
    if (isNaN(port) || port < 1 || port > 65535) {
      throw new Error(`Invalid port: ${value}`);
    }
    return port;
  })
  .action((options) => {
    console.log('Port:', options.port); // Guaranteed to be a valid number
  });

// JSON parsing with error handling
program
  .option('-c, --config <json>', 'JSON configuration', (value) => {
    try {
      return JSON.parse(value);
    } catch (error) {
      throw new Error(`Invalid JSON in config: ${error.message}`);
    }
  })
  .action((options) => {
    console.log('Config:', options.config);
  });

// Custom validation
program
  .option('-l, --level <level>', 'Log level (debug|info|warn|error)', (value) => {
    const validLevels = ['debug', 'info', 'warn', 'error'];
    if (!validLevels.includes(value)) {
      throw new Error(`Invalid level. Must be one of: ${validLevels.join(', ')}`);
    }
    return value;
  })
  .action((options) => {
    console.log('Level:', options.level);
  });
```

### Multi-Value Options

```typescript
program
  .option('-t, --tag <tags...>', 'Tags (can use multiple times)')
  .option('-e, --exclude <patterns...>', 'Exclude patterns')
  .action((options) => {
    console.log('Tags:', options.tag);         // array
    console.log('Exclude patterns:', options.exclude); // array
  });

// Usage:
// mdsel command --tag tag1 --tag tag2 --tag tag3
// OR
// mdsel command -t tag1 -t tag2 -t tag3
```

### Option Groups for Complex CLIs

```typescript
const program = new Command();

program
  .option('-d, --debug', 'Enable debug output')
  .option('-q, --quiet', 'Suppress output');

const selectCommand = program
  .command('select')
  .option('--json', 'Output as JSON')
  .option('--full', 'Include full contents');

const indexCommand = program
  .command('index')
  .option('-r, --recursive', 'Recursive indexing')
  .option('--exclude <patterns...>', 'Exclude patterns');

program.parse(process.argv);
```

---

## Error Handling & Exit Codes

### Exit Codes Best Practices

```typescript
// Exit code 0: Success
process.exit(0);

// Exit code 1: General error
process.exit(1);

// Exit code 2: Misuse of command
process.exit(2);

// Custom exit codes
const EXIT_CODES = {
  SUCCESS: 0,
  GENERAL_ERROR: 1,
  MISUSE: 2,
  NOT_FOUND: 3,
  PERMISSION_DENIED: 4,
  INVALID_INPUT: 5,
  TIMEOUT: 6,
} as const;
```

### Using program.error()

Commander provides an error method that automatically sets exit code 1:

```typescript
program
  .command('divide <a> <b>')
  .action((a, b) => {
    const numA = parseFloat(a);
    const numB = parseFloat(b);

    if (isNaN(numA) || isNaN(numB)) {
      program.error('Arguments must be numbers');
      return; // Never reached, program exits
    }

    if (numB === 0) {
      program.error('Cannot divide by zero', { exitCode: 4 });
      return;
    }

    console.log(numA / numB);
  });
```

### Custom Error Handling with exitOverride()

For more control over error handling:

```typescript
const program = new Command();

program.exitOverride((err) => {
  if (err.code === 'commander.missingArgument') {
    console.error('Error: Missing required argument');
    console.error('Use --help for usage information');
    process.exit(2);
  } else if (err.code === 'commander.unknownOption') {
    console.error(`Error: Unknown option: ${err.message}`);
    process.exit(2);
  } else {
    throw err; // Re-throw if not handled
  }
});

program
  .command('process <file>')
  .action((file) => {
    // Implementation
  });

try {
  program.parse(process.argv);
} catch (error) {
  console.error('Fatal error:', error);
  process.exit(1);
}
```

### Async Error Handling

```typescript
program
  .command('fetch <url>')
  .action(async (url: string, options) => {
    try {
      const response = await fetch(url);
      if (!response.ok) {
        program.error(`HTTP ${response.status}: ${response.statusText}`);
        return;
      }
      const data = await response.json();
      console.log(JSON.stringify(data, null, 2));
    } catch (error) {
      if (error instanceof Error) {
        program.error(`Failed to fetch: ${error.message}`, { exitCode: 3 });
      } else {
        program.error('Unknown error occurred', { exitCode: 1 });
      }
    }
  });
```

### Configurable Error Output

```typescript
program.configureOutput({
  // Redirect error output
  writeErr: (str) => process.stderr.write(`[ERROR] ${str}`),

  // Customize error display
  outputError: (str, write) => {
    write(`Custom Error Handler:\n${str}\n`);
  }
});
```

---

## JSON Output Best Practices

### Basic JSON Output

```typescript
interface Result {
  success: boolean;
  data?: any;
  error?: string;
  timestamp?: string;
}

program
  .command('select <pattern>')
  .option('--json', 'Output as JSON')
  .action((pattern: string, options) => {
    const result: Result = {
      success: true,
      data: {
        pattern,
        matches: ['file1.md', 'file2.md']
      },
      timestamp: new Date().toISOString()
    };

    if (options.json) {
      console.log(JSON.stringify(result, null, 2));
    } else {
      // Human-readable output
      console.log(`Found ${result.data.matches.length} matches for: ${pattern}`);
      result.data.matches.forEach(file => console.log(`  - ${file}`));
    }
  });
```

### Structured Error Responses

```typescript
interface ErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    details?: Record<string, any>;
  };
  timestamp: string;
}

program
  .command('process <file>')
  .option('--json', 'Output as JSON')
  .action((file: string, options) => {
    let result: Result | ErrorResponse;

    try {
      // Process file
      result = {
        success: true,
        data: { processed: true, file },
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      result = {
        success: false,
        error: {
          code: 'PROCESS_ERROR',
          message: error instanceof Error ? error.message : 'Unknown error',
          details: { file }
        },
        timestamp: new Date().toISOString()
      };
    }

    if (options.json) {
      console.log(JSON.stringify(result, null, 2));
    } else {
      if (result.success) {
        console.log(`Successfully processed: ${file}`);
      } else {
        console.error(`Error: ${result.error.message}`);
      }
    }
  });
```

### Streaming JSON Output

For large datasets:

```typescript
program
  .command('export <source>')
  .option('--json', 'Output as JSON')
  .action((source: string, options) => {
    const items = [
      { id: 1, name: 'Item 1' },
      { id: 2, name: 'Item 2' },
      { id: 3, name: 'Item 3' }
    ];

    if (options.json) {
      // Stream JSON array
      console.log('[');
      items.forEach((item, index) => {
        const comma = index < items.length - 1 ? ',' : '';
        console.log(JSON.stringify(item) + comma);
      });
      console.log(']');
    } else {
      // Human-readable
      items.forEach(item => {
        console.log(`${item.id}: ${item.name}`);
      });
    }
  });
```

### JSON with Pretty Printing Options

```typescript
program
  .command('export')
  .option('--json', 'Output as JSON')
  .option('--compact', 'Compact JSON output')
  .action((options) => {
    const data = { message: 'Hello', value: 42 };

    if (options.json) {
      const indent = options.compact ? undefined : 2;
      console.log(JSON.stringify(data, null, indent));
    } else {
      console.log('Data:', data);
    }
  });
```

---

## Complete Working Examples

### Example 1: Simple Two-Command CLI

**src/types.ts:**
```typescript
export interface IndexOptions {
  json?: boolean;
  recursive?: boolean;
}

export interface SelectOptions {
  json?: boolean;
  full?: boolean;
}
```

**src/commands/index.ts:**
```typescript
import { Command } from 'commander';
import { IndexOptions } from '../types.js';

export function createIndexCommand(): Command {
  return new Command('index')
    .description('Index markdown files')
    .argument('<directory>', 'Directory to index')
    .option('-r, --recursive', 'Recursive indexing')
    .option('--json', 'Output as JSON')
    .action((directory: string, options: IndexOptions) => {
      const result = {
        success: true,
        command: 'index',
        directory,
        recursive: options.recursive || false,
        timestamp: new Date().toISOString()
      };

      if (options.json) {
        console.log(JSON.stringify(result, null, 2));
      } else {
        console.log(`Indexing: ${directory}`);
        if (options.recursive) console.log('Recursive: enabled');
      }
    });
}
```

**src/commands/select.ts:**
```typescript
import { Command } from 'commander';
import { SelectOptions } from '../types.js';

export function createSelectCommand(): Command {
  return new Command('select')
    .description('Select markdown files')
    .argument('<pattern>', 'Search pattern')
    .option('--json', 'Output as JSON')
    .option('--full', 'Show full contents')
    .action((pattern: string, options: SelectOptions) => {
      const result = {
        success: true,
        command: 'select',
        pattern,
        files: ['doc1.md', 'doc2.md'],
        timestamp: new Date().toISOString()
      };

      if (options.json) {
        console.log(JSON.stringify(result, null, 2));
      } else {
        console.log(`Found ${result.files.length} files matching: ${pattern}`);
        result.files.forEach(f => console.log(`  - ${f}`));
      }
    });
}
```

**src/cli.ts:**
```typescript
#!/usr/bin/env node

import { Command } from 'commander';
import { createIndexCommand } from './commands/index.js';
import { createSelectCommand } from './commands/select.js';

const program = new Command();

program
  .name('mdsel')
  .version('1.0.0')
  .description('Markdown file selector and indexer')
  .option('-d, --debug', 'Enable debug output');

program.addCommand(createIndexCommand());
program.addCommand(createSelectCommand());

program.parse(process.argv);
```

### Example 2: Advanced Command with Validation

**src/commands/advanced.ts:**
```typescript
import { Command } from 'commander';
import * as fs from 'fs/promises';

interface AdvancedOptions {
  json?: boolean;
  timeout?: number;
  config?: Record<string, any>;
}

export function createAdvancedCommand(): Command {
  return new Command('process')
    .description('Process markdown files with advanced options')
    .argument('<files...>', 'Files to process')
    .option('--json', 'Output as JSON')
    .option('--timeout <ms>', 'Timeout in milliseconds', (val) => {
      const num = parseInt(val);
      if (isNaN(num) || num < 100) {
        throw new Error('Timeout must be a number >= 100');
      }
      return num;
    }, 5000)
    .option('--config <json>', 'Configuration as JSON', (val) => {
      try {
        return JSON.parse(val);
      } catch {
        throw new Error('Invalid JSON in config option');
      }
    })
    .action(async (files: string[], options: AdvancedOptions, command) => {
      const result = {
        success: true,
        processed: 0,
        failed: 0,
        errors: [] as string[],
        timestamp: new Date().toISOString()
      };

      for (const file of files) {
        try {
          // Simulate file processing
          const stat = await fs.stat(file);
          if (stat.isFile()) {
            result.processed++;
          }
        } catch (error) {
          result.failed++;
          result.errors.push(`${file}: ${error}`);
        }
      }

      result.success = result.failed === 0;

      if (options.json) {
        console.log(JSON.stringify(result, null, 2));
      } else {
        console.log(`Processed: ${result.processed}, Failed: ${result.failed}`);
        if (result.errors.length > 0) {
          console.error('Errors:');
          result.errors.forEach(err => console.error(`  - ${err}`));
        }
      }

      process.exit(result.success ? 0 : 1);
    });
}
```

---

## Key Takeaways

1. **Always use TypeScript interfaces** for options to ensure type safety
2. **Organize commands in separate files** for better maintainability
3. **Use custom option processors** for validation and type coercion
4. **Implement proper error handling** with meaningful exit codes
5. **Support both JSON and human-readable output** for flexibility
6. **Test variadic arguments** to ensure they capture all inputs
7. **Document exit codes** for programmatic integration
8. **Add POSIX compliance** - use standard Unix conventions

## References

- **GitHub Repository:** https://github.com/tj/commander.js
- **npm Package:** https://www.npmjs.com/package/commander
- **LogRocket Guide:** https://blog.logrocket.com/building-typescript-cli-node-js-commander/
- **Best Practices:** https://github.com/lirantal/nodejs-cli-apps-best-practices
- **TypeScript CLI Guide:** https://www.xjavascript.com/blog/commander-js-typescript/
- **Integration Tutorial:** https://krython.com/tutorial/typescript/building-a-cli-tool-commander-js-integration/
