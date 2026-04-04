import { describe, it, expect, beforeAll, afterAll, vi } from 'vitest';
import { writeFileSync, unlinkSync, existsSync } from 'fs';
import { join } from 'path';

// Test fixture paths
const fixturesDir = join(process.cwd(), 'tests', 'fixtures');
const simpleFixture = join(fixturesDir, 'simple.md');
const complexFixture = join(fixturesDir, 'complex.md');
const emptyFixture = join(fixturesDir, 'empty.md');
const tempFile = join(fixturesDir, 'temp-test.md');

// Mock console output
let capturedOutput: string[] = [];

beforeAll(() => {
  // Create a temporary test file
  writeFileSync(
    tempFile,
    `# Test Document

## First Section

Content for first section.

## Second Section

Content for second section.

### Subsection

Nested content here.`,
  );

  // Mock process.exit
  vi.spyOn(process, 'exit').mockImplementation((code?: number) => {
    throw new Error(`process.exit(${code})`);
  });

  // Mock console.log to capture output
  vi.spyOn(console, 'log').mockImplementation((...args) => {
    capturedOutput.push(args.join(' '));
  });
});

afterAll(() => {
  // Clean up temporary files
  if (existsSync(tempFile)) {
    unlinkSync(tempFile);
  }

  // Restore mocks
  vi.restoreAllMocks();
});

describe('selectCommand', () => {
  beforeEach(() => {
    capturedOutput = [];
  });

  describe('Happy path tests', () => {
    it('should select heading by selector', async () => {
      const { selectCommand } = await import('../commands/select-command.js');
      const selector = `simple::heading:h1[0]`;
      const normalizedSelector = `simple::heading:h1.0`; // Output uses dot notation

      await expect(selectCommand(selector, [simpleFixture], { json: true })).rejects.toThrow('process.exit(0)');

      expect(capturedOutput).toHaveLength(1);
      const response = JSON.parse(capturedOutput[0]);

      expect(response).toBeDefined();
      expect(response.success).toBe(true);
      expect(response.command).toBe('select');
      expect(response.data).toBeDefined();
      expect(response.data.matches).toHaveLength(1);

      const match = response.data.matches[0];
      expect(match.selector).toBe(normalizedSelector);
      expect(match.type).toBe('section'); // heading resolves to section
      expect(match.content).toContain('# Main Title');
      expect(match.truncated).toBe(false);
    });

    it('should select deeper heading correctly', async () => {
      const { selectCommand } = await import('../commands/select-command.js');
      const selector = `simple::heading:h2[0]`;
      const normalizedSelector = `simple::heading:h2.0`; // Output uses dot notation

      await expect(selectCommand(selector, [simpleFixture], { json: true })).rejects.toThrow('process.exit(0)');

      expect(capturedOutput).toHaveLength(1);
      const response = JSON.parse(capturedOutput[0]);

      expect(response.data.matches).toHaveLength(1);
      const match = response.data.matches[0];
      expect(match.selector).toBe(normalizedSelector);
      expect(match.type).toBe('section'); // heading resolves to section
      expect(match.content).toContain('## First Section');
    });

    it('should include children_available when content has children', async () => {
      const { selectCommand } = await import('../commands/select-command.js');
      const selector = `complex::heading:h1[0]`;

      await expect(selectCommand(selector, [complexFixture], { json: true })).rejects.toThrow('process.exit(0)');

      expect(capturedOutput).toHaveLength(1);
      const response = JSON.parse(capturedOutput[0]);

      expect(response.data.matches[0].children_available).toBeDefined();
      expect(Array.isArray(response.data.matches[0].children_available)).toBe(true);
      expect(response.data.matches[0].children_available.length).toBeGreaterThan(0);

      const firstChild = response.data.matches[0].children_available[0];
      expect(firstChild).toHaveProperty('selector');
      expect(firstChild).toHaveProperty('type');
      expect(firstChild).toHaveProperty('preview');
    });

    it('should handle multiple files with same selector', async () => {
      const { selectCommand } = await import('../commands/select-command.js');
      const selector = 'heading:h1[0]';

      await expect(selectCommand(selector, [simpleFixture, complexFixture], { json: true })).rejects.toThrow(
        'process.exit(0)',
      );

      expect(capturedOutput).toHaveLength(1);
      const response = JSON.parse(capturedOutput[0]);

      expect(response.data.matches.length).toBeGreaterThan(1);
    });

    it('should return full content by default', async () => {
      const { selectCommand } = await import('../commands/select-command.js');
      const selector = `simple::heading:h1[0]`;

      await expect(selectCommand(selector, [simpleFixture], { json: true })).rejects.toThrow('process.exit(0)');

      expect(capturedOutput).toHaveLength(1);
      const response = JSON.parse(capturedOutput[0]);

      expect(response.data.matches[0].truncated).toBe(false);
    });

    it('should truncate with head query parameter', async () => {
      const { selectCommand } = await import('../commands/select-command.js');
      const selector = `simple::heading:h1[0]?head=1`;

      await expect(selectCommand(selector, [simpleFixture], { json: true })).rejects.toThrow('process.exit(0)');

      expect(capturedOutput).toHaveLength(1);
      const response = JSON.parse(capturedOutput[0]);

      expect(response.data.matches[0].truncated).toBe(true);
      expect(response.data.matches[0].content).toContain('[truncated]');
    });

    it('should truncate with tail query parameter', async () => {
      const { selectCommand } = await import('../commands/select-command.js');
      const selector = `simple::heading:h1[0]?tail=1`;

      await expect(selectCommand(selector, [simpleFixture], { json: true })).rejects.toThrow('process.exit(0)');

      expect(capturedOutput).toHaveLength(1);
      const response = JSON.parse(capturedOutput[0]);

      expect(response.data.matches[0].truncated).toBe(true);
      expect(response.data.matches[0].content).toContain('[truncated]');
    });
  });

  describe('Error handling tests', () => {
    it('should handle invalid selector returns error response', async () => {
      const { selectCommand } = await import('../commands/select-command.js');
      const invalidSelector = 'invalid::selector::format';

      await expect(selectCommand(invalidSelector, [simpleFixture], { json: true })).rejects.toThrow(
        'process.exit(1)',
      );

      expect(capturedOutput).toHaveLength(1);
      const response = JSON.parse(capturedOutput[0]);

      expect(response.success).toBe(false);
      expect(response.command).toBe('select');
      expect(response.errors).toBeDefined();
      expect(response.errors).toHaveLength(1);
      expect(response.errors[0].type).toBe('INVALID_SELECTOR');
      expect(response.errors[0].message).toContain('selector');
    });

    it('should handle empty selector', async () => {
      const { selectCommand } = await import('../commands/select-command.js');
      const emptySelector = '';

      await expect(selectCommand(emptySelector, [simpleFixture], { json: true })).rejects.toThrow(
        'process.exit(1)',
      );

      expect(capturedOutput).toHaveLength(1);
      const response = JSON.parse(capturedOutput[0]);

      expect(response.success).toBe(false);
      expect(response.errors[0].type).toBe('INVALID_SELECTOR');
    });

    it('should handle malformed selector', async () => {
      const { selectCommand } = await import('../commands/select-command.js');
      const malformedSelector = 'heading:['; // Unclosed bracket

      await expect(selectCommand(malformedSelector, [simpleFixture], { json: true })).rejects.toThrow(
        'process.exit(1)',
      );

      expect(capturedOutput).toHaveLength(1);
      const response = JSON.parse(capturedOutput[0]);

      expect(response.success).toBe(false);
      expect(response.errors[0].type).toBe('INVALID_SELECTOR');
    });

    it('should handle unresolved selector returns suggestions', async () => {
      const { selectCommand } = await import('../commands/select-command.js');
      const unresolvedSelector = `simple::heading:h1[99]`; // Index out of range
      const normalizedSelector = `simple::heading:h1.99`; // Output uses dot notation

      await expect(selectCommand(unresolvedSelector, [simpleFixture], { json: true })).rejects.toThrow(
        'process.exit(1)',
      );

      expect(capturedOutput).toHaveLength(1);
      const response = JSON.parse(capturedOutput[0]);

      expect(response.success).toBe(false);
      expect(response.data).toBeDefined();
      expect(response.data.unresolved).toHaveLength(1);
      expect(response.data.unresolved[0].selector).toBe(normalizedSelector);
      expect(response.data.unresolved[0].reason).toContain('Index 99 out of range');
      expect(response.unresolved_selectors).toEqual([normalizedSelector]);

      // Should have suggestions
      const suggestions = response.data.unresolved[0].suggestions;
      expect(Array.isArray(suggestions)).toBe(true);
      expect(suggestions.length).toBeGreaterThan(0);
    });

    it('should handle selector that matches nothing', async () => {
      const { selectCommand } = await import('../commands/select-command.js');
      const noMatchSelector = `simple::heading:h3[99]`; // No h3 headings in simple.md

      await expect(selectCommand(noMatchSelector, [simpleFixture], { json: true })).rejects.toThrow(
        'process.exit(1)',
      );

      expect(capturedOutput).toHaveLength(1);
      const response = JSON.parse(capturedOutput[0]);

      expect(response.success).toBe(false);
      expect(response.data.unresolved).toHaveLength(1);
    });
  });

  describe('File handling tests', () => {
    it('should handle FILE_NOT_FOUND when file does not exist', async () => {
      const { selectCommand } = await import('../commands/select-command.js');
      const missingFile = join(fixturesDir, 'missing.md');
      const selector = 'heading:h1[0]';

      await expect(selectCommand(selector, [missingFile], { json: true })).rejects.toThrow('process.exit(1)');

      expect(capturedOutput).toHaveLength(1);
      const response = JSON.parse(capturedOutput[0]);

      expect(response.success).toBe(false);
      expect(response.errors).toBeDefined();
      expect(response.errors[0].type).toBe('FILE_NOT_FOUND');
      expect(response.errors[0].message).toContain('missing.md');
    });

    it('should handle multiple valid files successfully', async () => {
      const { selectCommand } = await import('../commands/select-command.js');
      const selector = 'heading:h1[0]';

      await expect(selectCommand(selector, [simpleFixture, complexFixture], { json: true })).rejects.toThrow(
        'process.exit(0)',
      );

      expect(capturedOutput).toHaveLength(1);
      const response = JSON.parse(capturedOutput[0]);

      expect(response.success).toBe(true);
      expect(response.data.matches.length).toBe(2);
    });

    it('should handle case where files contain no matching selectors', async () => {
      const { selectCommand } = await import('../commands/select-command.js');
      const selector = 'heading:h6[0]'; // No h6 in either fixture

      await expect(selectCommand(selector, [simpleFixture, complexFixture], { json: true })).rejects.toThrow(
        'process.exit(1)',
      );

      expect(capturedOutput).toHaveLength(1);
      const response = JSON.parse(capturedOutput[0]);

      expect(response.success).toBe(false);
      expect(response.data.unresolved).toHaveLength(1);
      expect(response.data.unresolved[0].selector).toBe(selector);
    });
  });

  describe('Command validation tests', () => {
    it('should require at least one file', async () => {
      const { selectCommand } = await import('../commands/select-command.js');
      const selector = 'heading:h1[0]';

      await expect(selectCommand(selector, [], { json: true })).rejects.toThrow('process.exit(1)');

      expect(capturedOutput).toHaveLength(1);
      const response = JSON.parse(capturedOutput[0]);

      expect(response.success).toBe(false);
      expect(response.errors).toHaveLength(1);
      expect(response.errors[0].type).toBe('PARSE_ERROR');
      expect(response.errors[0].code).toBe('NO_FILES');
    });
  });

  describe('Response structure tests', () => {
    it('should return valid JSON with correct structure', async () => {
      const { selectCommand } = await import('../commands/select-command.js');
      const selector = `simple::heading:h1[0]`;

      await expect(selectCommand(selector, [simpleFixture], { json: true })).rejects.toThrow('process.exit(0)');

      expect(capturedOutput).toHaveLength(1);
      const response = JSON.parse(capturedOutput[0]);

      expect(response).toBeDefined();
      expect(response.success).toBe(true);
      expect(response.command).toBe('select');
      expect(response.data).toBeDefined();
      expect(response.timestamp).toBeDefined();
      expect(typeof response.timestamp).toBe('string');
    });

    it('should have ISO 8601 timestamp', async () => {
      const { selectCommand } = await import('../commands/select-command.js');
      const selector = `simple::heading:h1[0]`;

      await expect(selectCommand(selector, [simpleFixture], { json: true })).rejects.toThrow('process.exit(0)');

      expect(capturedOutput).toHaveLength(1);
      const response = JSON.parse(capturedOutput[0]);

      expect(response.timestamp).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/);
    });

    it('should serialize to valid JSON', async () => {
      const { selectCommand } = await import('../commands/select-command.js');
      const selector = `simple::heading:h1[0]`;

      await expect(selectCommand(selector, [simpleFixture], { json: true })).rejects.toThrow('process.exit(0)');

      expect(capturedOutput).toHaveLength(1);
      expect(() => JSON.parse(capturedOutput[0])).not.toThrow();
    });

    it('should return matches array with correct structure', async () => {
      const { selectCommand } = await import('../commands/select-command.js');
      const selector = `simple::heading:h1[0]`;

      await expect(selectCommand(selector, [simpleFixture], { json: true })).rejects.toThrow('process.exit(0)');

      expect(capturedOutput).toHaveLength(1);
      const response = JSON.parse(capturedOutput[0]);

      const match = response.data.matches[0];
      expect(match).toHaveProperty('selector');
      expect(match).toHaveProperty('type');
      expect(match).toHaveProperty('content');
      expect(match).toHaveProperty('truncated');
      expect(match).toHaveProperty('children_available');
    });

    it('should handle empty matches gracefully', async () => {
      const { selectCommand } = await import('../commands/select-command.js');
      const selector = 'heading:h6[0]'; // No matches

      await expect(selectCommand(selector, [simpleFixture], { json: true })).rejects.toThrow('process.exit(1)');

      expect(capturedOutput).toHaveLength(1);
      const response = JSON.parse(capturedOutput[0]);

      expect(response.data.matches).toEqual([]);
      expect(response.data.unresolved).toHaveLength(1);
    });
  });

  describe('?until= query parameter tests', () => {
    const untilFixture = join(fixturesDir, 'until-test.md');

    it('should stop before first h2 with ?until=h2', async () => {
      const { selectCommand } = await import('../commands/select-command.js');
      const selector = 'h1.0?until=h2';

      await expect(selectCommand(selector, [untilFixture], { json: true })).rejects.toThrow('process.exit(0)');

      expect(capturedOutput).toHaveLength(1);
      const response = JSON.parse(capturedOutput[0]);

      expect(response.success).toBe(true);
      const match = response.data.matches[0];
      expect(match.truncated).toBe(true);
      // Should contain h1 heading and intro paragraph
      expect(match.content).toContain('# Project Name');
      expect(match.content).toContain('introductory paragraph');
      // Should NOT contain the ## Installation subsection
      expect(match.content).not.toContain('## Installation');
    });

    it('should stop before first code block with ?until=code', async () => {
      const { selectCommand } = await import('../commands/select-command.js');
      const selector = 'h2.0?until=code';

      await expect(selectCommand(selector, [untilFixture], { json: true })).rejects.toThrow('process.exit(0)');

      expect(capturedOutput).toHaveLength(1);
      const response = JSON.parse(capturedOutput[0]);

      expect(response.success).toBe(true);
      const match = response.data.matches[0];
      expect(match.truncated).toBe(true);
      expect(match.content).toContain('## Installation');
      expect(match.content).toContain('Install instructions here');
      // Code block should be excluded
      expect(match.content).not.toContain('npm install');
    });

    it('should stop before first table with ?until=table', async () => {
      const { selectCommand } = await import('../commands/select-command.js');
      const selector = 'h2.1?until=table';

      await expect(selectCommand(selector, [untilFixture], { json: true })).rejects.toThrow('process.exit(0)');

      expect(capturedOutput).toHaveLength(1);
      const response = JSON.parse(capturedOutput[0]);

      expect(response.success).toBe(true);
      const match = response.data.matches[0];
      expect(match.truncated).toBe(true);
      expect(match.content).toContain('## Plugins');
      // Table should be excluded
      expect(match.content).not.toContain('| Plugin');
    });

    it('should stop before h2 at index 1 with ?until=h2.1', async () => {
      const { selectCommand } = await import('../commands/select-command.js');
      const selector = 'h1.0?until=h2.1';

      await expect(selectCommand(selector, [untilFixture], { json: true })).rejects.toThrow('process.exit(0)');

      expect(capturedOutput).toHaveLength(1);
      const response = JSON.parse(capturedOutput[0]);

      expect(response.success).toBe(true);
      const match = response.data.matches[0];
      expect(match.truncated).toBe(true);
      // Should include h1 and first h2 (Installation) but not second h2 (Plugins)
      expect(match.content).toContain('# Project Name');
      expect(match.content).toContain('## Installation');
      expect(match.content).not.toContain('## Plugins');
    });

    it('should return full content when ?until= does not match', async () => {
      const { selectCommand } = await import('../commands/select-command.js');
      // No h6 or blockquote nodes in until-test.md h1.0 section
      const selector = 'h1.0?until=quote';

      await expect(selectCommand(selector, [untilFixture], { json: true })).rejects.toThrow('process.exit(0)');

      expect(capturedOutput).toHaveLength(1);
      const response = JSON.parse(capturedOutput[0]);

      expect(response.success).toBe(true);
      const match = response.data.matches[0];
      expect(match.truncated).toBe(false);
      // Full content including all subsections
      expect(match.content).toContain('## Installation');
      expect(match.content).toContain('## Plugins');
      expect(match.content).toContain('## Contributing');
    });

    it('should combine ?until= with ?head= for further truncation', async () => {
      const { selectCommand } = await import('../commands/select-command.js');
      const selector = 'h1.0?until=h2&head=1';

      await expect(selectCommand(selector, [untilFixture], { json: true })).rejects.toThrow('process.exit(0)');

      expect(capturedOutput).toHaveLength(1);
      const response = JSON.parse(capturedOutput[0]);

      expect(response.success).toBe(true);
      const match = response.data.matches[0];
      expect(match.truncated).toBe(true);
      expect(match.content).toContain('[truncated]');
    });

    it('should set truncated=true in JSON output when until truncates', async () => {
      const { selectCommand } = await import('../commands/select-command.js');
      const selector = 'h1.0?until=h2';

      await expect(selectCommand(selector, [untilFixture], { json: true })).rejects.toThrow('process.exit(0)');

      expect(capturedOutput).toHaveLength(1);
      const response = JSON.parse(capturedOutput[0]);

      expect(response.data.matches[0].truncated).toBe(true);
    });

    it('should work with text output format when ?until= truncates', async () => {
      const { selectCommand } = await import('../commands/select-command.js');
      const selector = 'h1.0?until=h2';

      await expect(selectCommand(selector, [untilFixture], {})).rejects.toThrow('process.exit(0)');

      expect(capturedOutput).toHaveLength(1);
      const text = capturedOutput[0];
      expect(text).toContain('# Project Name');
      expect(text).not.toContain('## Installation');
    });
  });
});
