import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseMarkdown, parseFile, ParserError } from '../../src/parser/index.js';
import type { Heading, Paragraph, Code, List, Blockquote, Table } from 'mdast';

const __dirname = dirname(fileURLToPath(import.meta.url));
const FIXTURES_DIR = join(__dirname, '../fixtures');

describe('parseMarkdown', () => {
  it('should parse heading with correct depth', () => {
    const result = parseMarkdown('# Title');
    const heading = result.ast.children[0] as Heading;

    expect(heading.type).toBe('heading');
    expect(heading.depth).toBe(1);
  });

  it('should parse all heading levels', () => {
    const markdown = '# H1\n## H2\n### H3\n#### H4\n##### H5\n###### H6';
    const result = parseMarkdown(markdown);

    const headings = result.ast.children.filter((n): n is Heading => n.type === 'heading');
    expect(headings.map((h) => h.depth)).toEqual([1, 2, 3, 4, 5, 6]);
  });

  it('should parse paragraph with inline content', () => {
    const result = parseMarkdown('Hello **world** with *emphasis*.');
    const paragraph = result.ast.children[0] as Paragraph;

    expect(paragraph.type).toBe('paragraph');
    expect(paragraph.children.length).toBeGreaterThan(0);
  });

  it('should parse fenced code block with language', () => {
    const result = parseMarkdown('```javascript\nconst x = 1;\n```');
    const code = result.ast.children[0] as Code;

    expect(code.type).toBe('code');
    expect(code.lang).toBe('javascript');
    expect(code.value).toBe('const x = 1;');
  });

  it('should parse unordered list', () => {
    const result = parseMarkdown('- Item 1\n- Item 2\n- Item 3');
    const list = result.ast.children[0] as List;

    expect(list.type).toBe('list');
    expect(list.ordered).toBe(false);
    expect(list.children.length).toBe(3);
  });

  it('should parse ordered list', () => {
    const result = parseMarkdown('1. First\n2. Second');
    const list = result.ast.children[0] as List;

    expect(list.type).toBe('list');
    expect(list.ordered).toBe(true);
  });

  it('should parse blockquote', () => {
    const result = parseMarkdown('> Quote text');
    const blockquote = result.ast.children[0] as Blockquote;

    expect(blockquote.type).toBe('blockquote');
    expect(blockquote.children.length).toBeGreaterThan(0);
  });

  it('should parse GFM table with alignment', () => {
    const markdown = '| Left | Center | Right |\n|:-----|:------:|------:|\n| A | B | C |';
    const result = parseMarkdown(markdown);
    const table = result.ast.children[0] as Table;

    expect(table.type).toBe('table');
    expect(table.align).toEqual(['left', 'center', 'right']);
  });

  it('should return empty children for empty string', () => {
    const result = parseMarkdown('');

    expect(result.ast.type).toBe('root');
    expect(result.ast.children).toEqual([]);
  });

  it('should include position information on all nodes', () => {
    const result = parseMarkdown('# Hello\n\nWorld');

    for (const child of result.ast.children) {
      expect(child.position).toBeDefined();
      expect(child.position?.start.line).toBeGreaterThan(0);
      expect(child.position?.start.column).toBeGreaterThan(0);
      expect(child.position?.start.offset).toBeGreaterThanOrEqual(0);
    }
  });

  it('should not include filePath for string parsing', () => {
    const result = parseMarkdown('# Test');
    expect(result.filePath).toBeUndefined();
  });
});

describe('parseFile', () => {
  it('should read and parse a markdown file', async () => {
    const result = await parseFile(join(FIXTURES_DIR, 'simple.md'));

    expect(result.ast.type).toBe('root');
    expect(result.ast.children.length).toBeGreaterThan(0);
  });

  it('should include filePath in result', async () => {
    const filePath = join(FIXTURES_DIR, 'simple.md');
    const result = await parseFile(filePath);

    expect(result.filePath).toBe(filePath);
  });

  it('should throw ParserError with FILE_NOT_FOUND for missing file', async () => {
    const nonexistentPath = join(FIXTURES_DIR, 'does-not-exist.md');

    await expect(parseFile(nonexistentPath)).rejects.toThrow(ParserError);

    try {
      await parseFile(nonexistentPath);
    } catch (error) {
      expect(error).toBeInstanceOf(ParserError);
      expect((error as ParserError).code).toBe('FILE_NOT_FOUND');
      expect((error as ParserError).filePath).toBe(nonexistentPath);
    }
  });

  it('should handle empty file correctly', async () => {
    const result = await parseFile(join(FIXTURES_DIR, 'empty.md'));

    expect(result.ast.type).toBe('root');
    expect(result.ast.children).toEqual([]);
  });

  it('should parse GFM tables from file', async () => {
    const result = await parseFile(join(FIXTURES_DIR, 'gfm-table.md'));
    const table = result.ast.children.find((n): n is Table => n.type === 'table');

    expect(table).toBeDefined();
    expect(table?.children.length).toBeGreaterThan(0);
  });

  it('should parse all features in complex file', async () => {
    const result = await parseFile(join(FIXTURES_DIR, 'complex.md'));

    const types = new Set(result.ast.children.map((n) => n.type));

    expect(types.has('heading')).toBe(true);
    expect(types.has('paragraph')).toBe(true);
    expect(types.has('table')).toBe(true);
    expect(types.has('code')).toBe(true);
    expect(types.has('list')).toBe(true);
    expect(types.has('blockquote')).toBe(true);
  });
});
