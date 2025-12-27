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
  writeFileSync(tempFile, '# Temporary Title\n\nThis is temporary content for testing.');

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

describe('indexCommand', () => {
  beforeEach(() => {
    capturedOutput = [];
  });

  it('should index single file correctly', async () => {
    // Import after mocks are set up
    const { indexCommand } = await import('../commands/index-command.js');

    await expect(indexCommand([simpleFixture], { json: true })).rejects.toThrow('process.exit(0)');

    expect(capturedOutput).toHaveLength(1);
    const response = JSON.parse(capturedOutput[0]);

    expect(response).toBeDefined();
    expect(response.success).toBe(true);
    expect(response.command).toBe('index');
    expect(response.data).toBeDefined();
    expect(response.data.documents).toHaveLength(1);
    expect(response.data.documents[0].file_path).toContain('simple.md');
    expect(response.data.summary).toBeDefined();
    expect(response.data.summary.total_documents).toBe(1);
  });

  it('should return proper JSON structure with success, command, timestamp, data', async () => {
    const { indexCommand } = await import('../commands/index-command.js');

    await expect(indexCommand([complexFixture], { json: true })).rejects.toThrow('process.exit(0)');

    expect(capturedOutput).toHaveLength(1);
    const response = JSON.parse(capturedOutput[0]);

    // Check all required fields
    expect(response.success).toBe(true);
    expect(response.command).toBe('index');
    expect(response.timestamp).toBeDefined();
    expect(typeof response.timestamp).toBe('string');
    expect(response.data).toBeDefined();

    // Check timestamp format
    expect(response.timestamp).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/);

    // Check data structure
    expect(response.data.documents).toBeDefined();
    expect(response.data.summary).toBeDefined();
  });

  it('should include headings in response', async () => {
    const { indexCommand } = await import('../commands/index-command.js');

    await expect(indexCommand([simpleFixture], { json: true })).rejects.toThrow('process.exit(0)');

    expect(capturedOutput).toHaveLength(1);
    const response = JSON.parse(capturedOutput[0]);
    const document = response.data.documents[0];

    expect(document.headings).toBeDefined();
    expect(Array.isArray(document.headings)).toBe(true);

    // Should have multiple headings in simple.md
    expect(document.headings.length).toBeGreaterThan(0);

    // Check heading structure
    const firstHeading = document.headings[0];
    expect(firstHeading).toHaveProperty('selector');
    expect(firstHeading).toHaveProperty('type');
    expect(firstHeading).toHaveProperty('depth');
    expect(firstHeading).toHaveProperty('text');
    expect(firstHeading).toHaveProperty('content_preview');

    // Verify the heading text matches content
    expect(firstHeading.text).toBe('Main Title');
    expect(firstHeading.depth).toBe(1);
  });

  it('should handle FILE_NOT_FOUND error', async () => {
    const { indexCommand } = await import('../commands/index-command.js');
    const missingFile = join(fixturesDir, 'missing.md');

    await expect(indexCommand([missingFile], { json: true })).rejects.toThrow('process.exit(1)');

    expect(capturedOutput).toHaveLength(1);
    const response = JSON.parse(capturedOutput[0]);

    expect(response.success).toBe(false);
    expect(response.command).toBe('index');
    expect(response.errors).toBeDefined();
    expect(response.errors).toHaveLength(1);
    expect(response.errors[0].type).toBe('FILE_NOT_FOUND');
    expect(response.errors[0].message).toContain('missing.md');
  });

  it('should produce valid index with no headings for empty file', async () => {
    const { indexCommand } = await import('../commands/index-command.js');

    await expect(indexCommand([emptyFixture], { json: true })).rejects.toThrow('process.exit(0)');

    expect(capturedOutput).toHaveLength(1);
    const response = JSON.parse(capturedOutput[0]);

    expect(response.success).toBe(true);
    expect(response.command).toBe('index');
    expect(response.data.documents).toHaveLength(1);

    const document = response.data.documents[0];
    expect(document.file_path).toContain('empty.md');
    expect(document.headings).toHaveLength(0);
    expect(document.blocks).toBeDefined();
  });

  it('should handle multiple files correctly', async () => {
    const { indexCommand } = await import('../commands/index-command.js');

    await expect(indexCommand([simpleFixture, complexFixture], { json: true })).rejects.toThrow('process.exit(0)');

    expect(capturedOutput).toHaveLength(1);
    const response = JSON.parse(capturedOutput[0]);

    expect(response.success).toBe(true);
    expect(response.data.documents).toHaveLength(2);
    expect(response.data.summary.total_documents).toBe(2);

    // Check both files are indexed
    const fileNames = response.data.documents.map((doc) => doc.file_path);
    expect(fileNames.some((path) => path.includes('simple.md'))).toBe(true);
    expect(fileNames.some((path) => path.includes('complex.md'))).toBe(true);
  });

  it('should handle partial success with some files failing', async () => {
    const { indexCommand } = await import('../commands/index-command.js');
    const validFile = simpleFixture;
    const invalidFile = join(fixturesDir, 'missing.md');

    await expect(indexCommand([validFile, invalidFile], { json: true })).rejects.toThrow('process.exit(1)');

    expect(capturedOutput).toHaveLength(1);
    const response = JSON.parse(capturedOutput[0]);

    // Should succeed with partial results but report failure
    expect(response.success).toBe(false);
    expect(response.data.documents).toHaveLength(1);
    expect(response.errors).toBeDefined();
    expect(response.warnings).toBeDefined();
    expect(response.errors.length).toBe(1);
    expect(response.warnings[0]).toContain('1 of 2 file');
  });

  it('should handle complete failure with all files missing', async () => {
    const { indexCommand } = await import('../commands/index-command.js');
    const missing1 = join(fixturesDir, 'missing1.md');
    const missing2 = join(fixturesDir, 'missing2.md');

    await expect(indexCommand([missing1, missing2], { json: true })).rejects.toThrow('process.exit(1)');

    expect(capturedOutput).toHaveLength(1);
    const response = JSON.parse(capturedOutput[0]);

    expect(response.success).toBe(false);
    expect(response.errors).toHaveLength(2);
    expect(response.errors.every((error: any) => error.type === 'FILE_NOT_FOUND')).toBe(true);
  });

  it('should calculate summary statistics correctly', async () => {
    const { indexCommand } = await import('../commands/index-command.js');

    await expect(indexCommand([complexFixture], { json: true })).rejects.toThrow('process.exit(0)');

    expect(capturedOutput).toHaveLength(1);
    const response = JSON.parse(capturedOutput[0]);
    const summary = response.data.summary;

    expect(summary.total_documents).toBe(1);
    expect(summary.total_nodes).toBeGreaterThan(0);
    expect(summary.total_selectors).toBeGreaterThan(0);
    expect(summary.total_selectors).toBe(summary.total_nodes);
  });
});
