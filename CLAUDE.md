# Claude Development Notes

## Important Reminders

### When changing output format
Always update `FORMAT_SPECS` in `src/output/text-formatters.ts` and any relevant tests to match the new format. The `format` command outputs these specs for LLM tool descriptions.

### Output format rules (current)

**Index output:**
- No filename for single file
- Headings: `hN title` (agent counts for index)
- Indentation shows depth
- Block summary: `code:N para:N list:N table:N`

**Select output:**
- Content only (no children list)
- Multiple results: `selector:` prefix (e.g., `heading:h2.0:`, `heading:h2.1:`)
- Single result: no prefix

**Selectors:**
- Shorthand: `h1`, `h2`, `code`, `para`, `list`, `table`, `quote`
- Index syntax: `.N` or `[N]` (e.g., `h2.0` or `h2[0]`)
- Range: `h2.1-3` or `h2[1-3]` → h2.1, h2.2, h2.3
- Comma list: `h2.0,2,4` or `h2[0,2,4]` → h2.0, h2.2, h2.4
- No index = all matches (e.g., `h2` returns all h2 sections)
- Query params: `?head=N` (first N lines), `?tail=N` (last N lines), `?until=<selector>` (stop before first matching child)
