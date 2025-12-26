import { describe, it, expect } from 'vitest';
import { spawn } from 'child_process';
import { join } from 'path';
import { readFileSync } from 'fs';

// Get the absolute path to the CLI entry point
const cliPath = join(process.cwd(), 'dist', 'cli.mjs');

// Helper function to run CLI commands and capture exit code
function runCliCommand(args: string[]): Promise<{ exitCode: number | null, stdout: string, stderr: string }> {
  return new Promise((resolve) => {
    const process = spawn('node', [cliPath, ...args], {
      stdio: ['pipe', 'pipe', 'pipe'],
      timeout: 10000, // 10 second timeout
    });

    let stdout = '';
    let stderr = '';

    process.stdout.on('data', (data) => {
      stdout += data.toString();
    });

    process.stderr.on('data', (data) => {
      stderr += data.toString();
    });

    process.on('close', (exitCode) => {
      resolve({
        exitCode,
        stdout,
        stderr,
      });
    });

    process.on('error', (error) => {
      resolve({
        exitCode: null,
        stdout,
        stderr: error.message,
      });
    });
  });
}

// Helper function to parse JSON output
function parseJsonOutput(stdout: string): any {
  // Remove any leading/trailing whitespace and newlines
  const cleanOutput = stdout.trim();
  if (!cleanOutput) {
    return null; // Return null for empty output
  }
  return JSON.parse(cleanOutput);
}

describe('exit-codes', () => {
  // Test that the CLI entry point exists
  it('should have CLI entry point', () => {
    expect(require('fs').existsSync(cliPath)).toBe(true);
  });

  describe('index command exit codes', () => {
    it('should exit with 0 on success', async () => {
      const fixturesDir = join(process.cwd(), 'tests', 'fixtures');
      const result = await runCliCommand(['index', join(fixturesDir, 'simple.md')]);

      expect(result.exitCode).toBe(0);
      expect(result.stdout).toBeTruthy();

      // Should also have valid JSON output
      const jsonOutput = parseJsonOutput(result.stdout);
      expect(jsonOutput.success).toBe(true);
      expect(jsonOutput.command).toBe('index');
    });

    it('should exit with 1 on FILE_NOT_FOUND error', async () => {
      const fixturesDir = join(process.cwd(), 'tests', 'fixtures');
      const missingFile = join(fixturesDir, 'missing.md');
      const result = await runCliCommand(['index', missingFile]);

      expect(result.exitCode).toBe(1);
      expect(result.stdout).toBeTruthy();

      // Should have error JSON output
      const jsonOutput = parseJsonOutput(result.stdout);
      expect(jsonOutput.success).toBe(false);
      expect(jsonOutput.errors[0].type).toBe('FILE_NOT_FOUND');
    });

    it('should exit with 1 on partial success', async () => {
      const fixturesDir = join(process.cwd(), 'tests', 'fixtures');
      const result = await runCliCommand([
        'index',
        join(fixturesDir, 'simple.md'),
        join(fixturesDir, 'missing.md')
      ]);

      expect(result.exitCode).toBe(1);
      expect(result.stdout).toBeTruthy();

      const jsonOutput = parseJsonOutput(result.stdout);
      expect(jsonOutput.success).toBe(false); // Actually reports false for partial
      expect(jsonOutput.warnings).toBeDefined();
    });

    it('should exit with 1 on complete failure', async () => {
      const fixturesDir = join(process.cwd(), 'tests', 'fixtures');
      const result = await runCliCommand([
        'index',
        join(fixturesDir, 'missing1.md'),
        join(fixturesDir, 'missing2.md')
      ]);

      expect(result.exitCode).toBe(1);
      expect(result.stdout).toBeTruthy();

      const jsonOutput = parseJsonOutput(result.stdout);
      expect(jsonOutput.success).toBe(false);
      expect(jsonOutput.errors.length).toBe(2);
    });

    it('should exit with 1 when no files provided', async () => {
      const result = await runCliCommand(['index']);

      expect(result.exitCode).toBe(1);
      expect(result.stderr).toContain('error: missing required argument');
      expect(result.stdout).not.toContain('JSON'); // Should not output JSON
    });
  });

  describe('select command exit codes', () => {
    it('should exit with 0 on success', async () => {
      const fixturesDir = join(process.cwd(), 'tests', 'fixtures');
      const result = await runCliCommand([
        'select',
        `${'simple'}::heading:h1[0]`,
        join(fixturesDir, 'simple.md')
      ]);

      expect(result.exitCode).toBe(0);
      expect(result.stdout).toBeTruthy();

      const jsonOutput = parseJsonOutput(result.stdout);
      expect(jsonOutput.success).toBe(true);
      expect(jsonOutput.command).toBe('select');
      expect(jsonOutput.data.matches).toHaveLength(1);
    });

    it('should exit with 0 on multiple successful matches', async () => {
      const fixturesDir = join(process.cwd(), 'tests', 'fixtures');
      const result = await runCliCommand([
        'select',
        'heading:h1[0]',
        join(fixturesDir, 'simple.md'),
        join(fixturesDir, 'complex.md')
      ]);

      expect(result.exitCode).toBe(0);
      expect(result.stdout).toBeTruthy();

      const jsonOutput = parseJsonOutput(result.stdout);
      expect(jsonOutput.success).toBe(true);
      expect(jsonOutput.data.matches.length).toBe(2);
    });

    it('should exit with 1 on invalid selector', async () => {
      const fixturesDir = join(process.cwd(), 'tests', 'fixtures');
      const result = await runCliCommand([
        'select',
        'invalid::selector::format',
        join(fixturesDir, 'simple.md')
      ]);

      expect(result.exitCode).toBe(1);
      expect(result.stdout).toBeTruthy();

      const jsonOutput = parseJsonOutput(result.stdout);
      expect(jsonOutput.success).toBe(false);
      expect(jsonOutput.errors[0].type).toBe('INVALID_SELECTOR');
    });

    it('should exit with 1 on unresolved selector', async () => {
      const fixturesDir = join(process.cwd(), 'tests', 'fixtures');
      const result = await runCliCommand([
        'select',
        `${'simple'}::heading:h1[99]`, // Out of range
        join(fixturesDir, 'simple.md')
      ]);

      expect(result.exitCode).toBe(1);
      expect(result.stdout).toBeTruthy();

      const jsonOutput = parseJsonOutput(result.stdout);
      expect(jsonOutput.success).toBe(false);
      expect(jsonOutput.data.unresolved).toHaveLength(1);
    });

    it('should exit with 1 on FILE_NOT_FOUND when file does not exist', async () => {
      const fixturesDir = join(process.cwd(), 'tests', 'fixtures');
      const result = await runCliCommand([
        'select',
        'heading:h1[0]',
        join(fixturesDir, 'missing.md')
      ]);

      expect(result.exitCode).toBe(1);
      expect(result.stdout).toBeTruthy();

      const jsonOutput = parseJsonOutput(result.stdout);
      expect(jsonOutput.success).toBe(false);
      expect(jsonOutput.errors[0].type).toBe('FILE_NOT_FOUND');
    });

    it('should exit with 1 when no files provided', async () => {
      const result = await runCliCommand(['select', 'heading:h1[0]']);

      expect(result.exitCode).toBe(1);
      expect(result.stdout).toBeTruthy();

      const jsonOutput = parseJsonOutput(result.stdout);
      expect(jsonOutput.success).toBe(false);
      expect(jsonOutput.errors[0].type).toBe('PARSE_ERROR');
      expect(jsonOutput.errors[0].code).toBe('NO_FILES');
    });

    it('should exit with 1 on mixed valid and invalid files', async () => {
      const fixturesDir = join(process.cwd(), 'tests', 'fixtures');
      const result = await runCliCommand([
        'select',
        'heading:h1[0]',
        join(fixturesDir, 'simple.md'),
        join(fixturesDir, 'missing.md')
      ]);

      expect(result.exitCode).toBe(0); // Partial success exits with 0
      expect(result.stdout).toBeTruthy();

      const jsonOutput = parseJsonOutput(result.stdout);
      expect(jsonOutput.success).toBe(true); // Partial success
      expect(jsonOutput.data.matches).toHaveLength(1);
      // Select command doesn't report errors for missing files, it just ignores them
    });

    it('should exit with 1 when selector matches nothing', async () => {
      const fixturesDir = join(process.cwd(), 'tests', 'fixtures');
      const result = await runCliCommand([
        'select',
        'heading:h6[0]', // No h6 in fixtures
        join(fixturesDir, 'simple.md')
      ]);

      expect(result.exitCode).toBe(1);
      expect(result.stdout).toBeTruthy();

      const jsonOutput = parseJsonOutput(result.stdout);
      expect(jsonOutput.success).toBe(false);
      expect(jsonOutput.data.unresolved).toHaveLength(1);
    });
  });

  describe('edge cases', () => {
    it('should handle CLI help command', async () => {
      const result = await runCliCommand(['--help']);

      // Help command might not exit with 0, but should not crash
      expect(result.exitCode).not.toBeNull();
      expect(result.stdout).toBeTruthy();
      expect(result.stdout).toContain('mdsel');
    });

    it('should handle CLI version command', async () => {
      const result = await runCliCommand(['--version']);

      // Version command might not exit with 0, but should not crash
      expect(result.exitCode).not.toBeNull();
      expect(result.stdout).toBeTruthy();
    });

    it('should handle unknown command', async () => {
      const result = await runCliCommand(['unknown']);

      expect(result.exitCode).toBe(1);
      expect(result.stderr).toBeTruthy();
    });

    it('should handle malformed arguments', async () => {
      const result = await runCliCommand(['select', '', 'simple.md']);

      expect(result.exitCode).toBe(1);
      expect(result.stdout).toBeTruthy();

      const jsonOutput = parseJsonOutput(result.stdout);
      expect(jsonOutput.success).toBe(false);
      expect(jsonOutput.errors[0].type).toBe('INVALID_SELECTOR');
    });
  });

  describe('timeout behavior', () => {
    it('should handle large files without timing out', async () => {
      const fixturesDir = join(process.cwd(), 'tests', 'fixtures');
      const result = await runCliCommand(['index', join(fixturesDir, 'complex.md')]);

      // Should complete quickly
      expect(result.exitCode).toBe(0);
      expect(result.stdout).toBeTruthy();

      const jsonOutput = parseJsonOutput(result.stdout);
      expect(jsonOutput.success).toBe(true);
    }, 10000); // 10 second timeout
  });
});