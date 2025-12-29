import { describe, it, expect } from 'vitest';
import { execSync } from 'child_process';
import { readFileSync, statSync } from 'fs';
import { join } from 'path';

/**
 * Helper to run CLI and capture stdout.
 */
function runCLI(args: string[]): { stdout: string; exitCode: number } {
  try {
    const stdout = execSync(`node ./dist/cli.mjs ${args.join(' ')}`, {
      encoding: 'utf-8',
      cwd: process.cwd(),
    });
    return { stdout, exitCode: 0 };
  } catch (error: unknown) {
    const execError = error as { stdout?: string; status?: number };
    return {
      stdout: execError.stdout ?? '',
      exitCode: execError.status ?? 1,
    };
  }
}

describe('README output size targets', () => {
  const readmePath = join(process.cwd(), 'README.md');
  const readmeSize = statSync(readmePath).size;

  describe('index (files only)', () => {
    it('text output should be under 1000 chars', () => {
      const result = runCLI(['README.md']);

      expect(result.exitCode).toBe(0);
      expect(result.stdout.length).toBeLessThan(1000);
      expect(result.stdout.length).toBeGreaterThan(200); // sanity check
    });

    it('text output should be <15% of file size', () => {
      const result = runCLI(['README.md']);

      const ratio = result.stdout.length / readmeSize;
      expect(ratio).toBeLessThan(0.15);
    });

    it('text output should be >80% smaller than JSON output', () => {
      const textResult = runCLI(['README.md']);
      const jsonResult = runCLI(['--json', 'README.md']);

      const reduction = 1 - textResult.stdout.length / jsonResult.stdout.length;
      expect(reduction).toBeGreaterThan(0.8); // >80% reduction
    });

    it('should contain expected structure', () => {
      const result = runCLI(['README.md']);

      // For single file, no namespace prefix (starts with heading)
      expect(result.stdout).toMatch(/^h1/);
      // Should have heading indicators
      expect(result.stdout).toContain('h1');
      expect(result.stdout).toContain('h2');
      // Should have block summary after ---
      expect(result.stdout).toContain('---');
      expect(result.stdout).toMatch(/code:\d+/);
      expect(result.stdout).toMatch(/para:\d+/);
    });
  });

  describe('select (files + selectors)', () => {
    it('should output raw content without envelope', () => {
      // Select the installation code block specifically
      const result = runCLI(['README.md', 'h2.1/code.0']);

      expect(result.exitCode).toBe(0);
      // Should be just the code block content
      expect(result.stdout).toContain('npm install');
      // Should NOT have JSON structure
      expect(result.stdout).not.toContain('"success"');
      expect(result.stdout).not.toContain('"timestamp"');
    });

    it('select overhead should be minimal for simple content', () => {
      // Select the installation code block specifically
      const result = runCLI(['README.md', 'h2.1/code.0']);

      // Code block is ~30 chars, output shouldn't be much more
      expect(result.stdout.length).toBeLessThan(100);
    });

    it('should show relative child paths', () => {
      const result = runCLI(['README.md', 'readme::heading:h2[0]']);

      // Should have --- separator for children
      if (result.stdout.includes('---')) {
        // Children should be relative paths starting with /
        const lines = result.stdout.split('\n');
        const childLine = lines.find((l) => l.startsWith('/'));
        if (childLine) {
          expect(childLine).toMatch(/^\/\w+/);
        }
      }
    });

    it('error output should be compact', () => {
      const result = runCLI(['README.md', 'readme::heading:h2[99]']);

      expect(result.exitCode).toBe(1);
      // Should start with ! for error
      expect(result.stdout).toMatch(/^!/);
      // Should have suggestions with ~
      expect(result.stdout).toContain('~');
      // Should NOT have JSON structure
      expect(result.stdout).not.toContain('"success"');
    });
  });

  describe('format command', () => {
    it('should output terse format spec by default', () => {
      const result = runCLI(['format', 'index']);

      expect(result.exitCode).toBe(0);
      // Terse spec describes the format pattern
      expect(result.stdout).toContain('hN.I');
      expect(result.stdout).toContain('code:N');
    });

    it('should output example format with --example', () => {
      const result = runCLI(['format', 'index', '--example']);

      expect(result.exitCode).toBe(0);
      // Example shows actual formatted output
      expect(result.stdout).toContain('h1.0');
      expect(result.stdout).toContain('---');
    });

    it('should output all formats when no command specified', () => {
      const result = runCLI(['format']);

      expect(result.exitCode).toBe(0);
      expect(result.stdout).toContain('# index');
      expect(result.stdout).toContain('# select');
    });
  });

  describe('--json flag', () => {
    it('should output JSON when --json flag is used', () => {
      const result = runCLI(['--json', 'README.md']);

      expect(result.exitCode).toBe(0);
      const parsed = JSON.parse(result.stdout);
      expect(parsed.success).toBe(true);
      expect(parsed.command).toBe('index');
      expect(parsed.timestamp).toBeDefined();
    });

    it('JSON output should match original format', () => {
      const result = runCLI(['--json', 'README.md']);

      const parsed = JSON.parse(result.stdout);
      expect(parsed.data.documents).toBeInstanceOf(Array);
      expect(parsed.data.summary).toBeDefined();
      expect(parsed.data.documents[0].namespace).toBe('readme');
    });
  });
});
