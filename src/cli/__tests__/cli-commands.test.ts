import { describe, it, expect } from 'vitest';
import { join } from 'path';
import { execSync } from 'child_process';

// Test fixture paths
const fixturesDir = join(process.cwd(), 'tests', 'fixtures');
const simpleFixture = join(fixturesDir, 'simple.md');

// Use built CLI (tests require `npm run build` first)
const CLI = 'node dist/cli.mjs';

describe('CLI explicit commands', () => {
  describe('index command', () => {
    it('should recognize "index" as a command, not a selector', () => {
      // This is the regression test - "index" should be treated as a command
      const result = execSync(`${CLI} index ${simpleFixture} --json`, {
        encoding: 'utf-8',
      });

      const response = JSON.parse(result);
      expect(response.success).toBe(true);
      expect(response.command).toBe('index');
      expect(response.data.documents).toHaveLength(1);
    });

    it('should work with multiple files', () => {
      const complexFixture = join(fixturesDir, 'complex.md');
      const result = execSync(`${CLI} index ${simpleFixture} ${complexFixture} --json`, {
        encoding: 'utf-8',
      });

      const response = JSON.parse(result);
      expect(response.success).toBe(true);
      expect(response.command).toBe('index');
      expect(response.data.documents).toHaveLength(2);
    });
  });

  describe('select command', () => {
    it('should recognize "select" as a command, not a selector', () => {
      // This is the regression test - "select" should be treated as a command
      const result = execSync(`${CLI} select "heading:h1.0" ${simpleFixture} --json`, {
        encoding: 'utf-8',
      });

      const response = JSON.parse(result);
      expect(response.success).toBe(true);
      expect(response.command).toBe('select');
      expect(response.data.matches).toHaveLength(1);
    });

    it('should work with shorthand selectors', () => {
      const result = execSync(`${CLI} select h1.0 ${simpleFixture} --json`, {
        encoding: 'utf-8',
      });

      const response = JSON.parse(result);
      expect(response.success).toBe(true);
      expect(response.command).toBe('select');
    });

    it('should work with comma-separated selectors', () => {
      const result = execSync(`${CLI} select "h1.0,h2.0" ${simpleFixture} --json`, {
        encoding: 'utf-8',
      });

      const response = JSON.parse(result);
      expect(response.success).toBe(true);
      expect(response.command).toBe('select');
      expect(response.data.matches.length).toBeGreaterThanOrEqual(2);
    });
  });

  describe('unified syntax equivalence', () => {
    it('explicit index should produce same result as implicit', () => {
      const explicitResult = execSync(`${CLI} index ${simpleFixture} --json`, {
        encoding: 'utf-8',
      });
      const implicitResult = execSync(`${CLI} ${simpleFixture} --json`, {
        encoding: 'utf-8',
      });

      const explicit = JSON.parse(explicitResult);
      const implicit = JSON.parse(implicitResult);

      // Compare data (timestamps will differ)
      expect(explicit.command).toBe(implicit.command);
      expect(explicit.success).toBe(implicit.success);
      expect(explicit.data.documents).toEqual(implicit.data.documents);
    });

    it('explicit select should produce same result as implicit', () => {
      const explicitResult = execSync(`${CLI} select h1.0 ${simpleFixture} --json`, {
        encoding: 'utf-8',
      });
      const implicitResult = execSync(`${CLI} ${simpleFixture} h1.0 --json`, {
        encoding: 'utf-8',
      });

      const explicit = JSON.parse(explicitResult);
      const implicit = JSON.parse(implicitResult);

      // Compare data (timestamps will differ)
      expect(explicit.command).toBe(implicit.command);
      expect(explicit.success).toBe(implicit.success);
      expect(explicit.data.matches).toEqual(implicit.data.matches);
    });
  });
});
