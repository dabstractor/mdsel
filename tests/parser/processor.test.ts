import { createProcessor } from '../../src/parser/processor.js';
import type { Table, Paragraph } from 'mdast';

describe('createProcessor', () => {
  it('should return a processor with parse method', () => {
    const processor = createProcessor();
    expect(typeof processor.parse).toBe('function');
  });

  it('should parse markdown to Root node', () => {
    const processor = createProcessor();
    const ast = processor.parse('# Hello');

    expect(ast.type).toBe('root');
    expect(ast.children).toBeDefined();
    expect(ast.children.length).toBeGreaterThan(0);
  });

  it('should parse GFM tables when gfm option is true (default)', () => {
    const processor = createProcessor({ gfm: true });
    const markdown = '| A | B |\n|---|---|\n| 1 | 2 |';
    const ast = processor.parse(markdown);

    const table = ast.children[0] as Table;
    expect(table.type).toBe('table');
    expect(table.children.length).toBe(2); // header row + data row
  });

  it('should NOT parse tables when gfm option is false', () => {
    const processor = createProcessor({ gfm: false });
    const markdown = '| A | B |\n|---|---|\n| 1 | 2 |';
    const ast = processor.parse(markdown);

    // Without GFM, tables parse as paragraphs
    const firstChild = ast.children[0] as Paragraph;
    expect(firstChild.type).toBe('paragraph');
  });

  it('should be deterministic (same input produces same output)', () => {
    const processor = createProcessor();
    const markdown = '# Title\n\nParagraph.';

    const ast1 = processor.parse(markdown);
    const ast2 = processor.parse(markdown);

    expect(JSON.stringify(ast1)).toBe(JSON.stringify(ast2));
  });

  it('should include position information on nodes', () => {
    const processor = createProcessor();
    const ast = processor.parse('# Hello');

    const heading = ast.children[0];
    expect(heading?.position).toBeDefined();
    expect(heading?.position?.start).toEqual({ line: 1, column: 1, offset: 0 });
  });
});
