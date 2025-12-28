# PRD: Declarative Markdown Semantic Selection CLI for LLM Agents

## 1. Purpose & Scope

This tool provides **declarative, semantic, path-based selection** over one or more Markdown documents, optimized for **LLM agent consumption** and **token efficiency**.

The tool's sole responsibility is to:

* Parse Markdown into a **stable semantic tree**
* Expose **machine-addressable selectors** for every meaningful chunk
* Allow an LLM to **request exactly the content it wants**, no more, no less
* Avoid summarization, transformation, or editorialization

This is **not** a summarizer, indexer, or state manager.
This is a **document selection substrate**.

---

## 2. Core Design Principles

1. **Declarative Selection First**

   * All content is accessed via selectors
   * No conversational state
   * No implicit memory

2. **Path-Based, Reproducible Semantics**

   * Selection is deterministic for a given document order
   * Reordering content may change selectors (acceptable)

3. **LLM-Optimized Output**

   * Minimal token overhead (compact text by default)
   * JSON available for programmatic use
   * No human-oriented UX

4. **Zero Summarization**

   * Only raw document text
   * Truncation and pagination are mechanical only

---

## 3. Conceptual Model

### 3.1 Documents → Trees → Nodes

Each Markdown file is parsed into a **semantic tree** of **nodes**.

Each node:

* Represents a contiguous chunk of text
* Has **exactly one primary selector shown**
* May be reachable via multiple selectors (via ancestors)

---

## 4. Node Types (Semantic Units)

Nodes are **block-level only**.

### 4.1 Structural Nodes

| Node Type                   | Shorthand | Description                           |
| --------------------------- | --------- | ------------------------------------- |
| `root`                      | -         | Non-heading text before first heading |
| `heading:h1` … `heading:h6` | `h1`…`h6` | Markdown headings                     |
| `section`                   | -         | A heading + all of its content        |
| `block:paragraph`           | `para`    | Free text not otherwise typed         |
| `block:list`                | `list`    | Ordered or unordered list             |
| `block:code`                | `code`    | Fenced code block                     |
| `block:table`               | `table`   | Markdown table                        |
| `block:blockquote`          | `quote`   | Blockquotes                           |

### 4.2 Non-Structural Text

* Any text not matching a recognized block type is treated as **plain text**
* Plain text is chunked only by length (see §6)

No inline selection exists.

---

## 5. Selector System (Core Feature)

### 5.1 Selector Philosophy

Selectors are:

* **Path-based**
* **Ordinal**
* **Stateless**
* **Deterministic**
* **LLM-readable and LLM-writable**

They resemble CSS/XPath conceptually but are purpose-built for Markdown.

---

### 5.2 Namespace Model

Each document is its own namespace.

```
<namespace>::<selector>
```

Examples:

```
doc1::root
doc2::h2.3
```

If no namespace is specified, selection applies across **all provided documents**.

---

### 5.3 Selector Grammar

#### 5.3.1 Full Syntax

```
[namespace::]type[:subtype][index][/path][?query]
```

Where:

* `namespace` = optional document identifier (e.g., `readme::`)
* `type` = `root`, `heading`, `section`, `block`, or shorthand
* `subtype` = heading level (`h1`-`h6`) or block type (`code`, `paragraph`, etc.)
* `index` = 0-based ordinal (see §5.3.2)
* `path` = additional path segments separated by `/`
* `query` = query parameters (e.g., `?full=true`)

#### 5.3.2 Index Notation

Two equivalent notations:

| Notation | Example | Meaning |
|----------|---------|---------|
| Dot | `h2.0` | First h2 |
| Bracket | `h2[0]` | First h2 |
| Range | `h2.1-3` | h2.1, h2.2, h2.3 |
| Comma list | `h2.0,2,4` | h2.0, h2.2, h2.4 |
| No index | `h2` | All h2 headings |

#### 5.3.3 Shorthand Forms

For common node types:

| Shorthand | Expands To |
|-----------|------------|
| `h1`…`h6` | `heading:h1`…`heading:h6` |
| `code` | `block:code` |
| `para` | `block:paragraph` |
| `list` | `block:list` |
| `table` | `block:table` |
| `quote` | `block:blockquote` |

---

#### 5.3.4 Path Composition

Selectors compose left-to-right:

```
doc::h2.1/section.0/code.0
```

Meaning:

* Second H2
* Its first section
* Its first code block

---

#### 5.3.5 Implicit Expansion

Selecting a parent yields all children.

Example:

```
doc::h2.1
```

Returns:

* The heading text
* All descendant blocks (subject to truncation rules)

---

### 5.4 Repeated Headings

Identical heading titles are **not disambiguated by name**.

They are disambiguated **only by ordinal position**.

Selecting a heading selector returns **that instance only**.

---

## 6. Truncation & Pagination

### 6.1 Truncation Rules

* Any node exceeding `MAX_WORDS` is truncated
* Truncation is **mechanical only**
* No attempt is made to preserve Markdown validity
* No fence balancing
* No syntactic guarantees

---

### 6.2 Pagination Model (Implicit)

Large nodes are split into **virtual pages**.

Example:

```
section.2 → page[0], page[1], page[2]
```

The selector surface exposes:

```
doc::section.2/page.1
```

The agent may request:

* A specific page
* The entire node explicitly

---

### 6.3 Full Retrieval

The agent may explicitly request:

```
doc::section.2?full=true
```

This bypasses truncation.
This is allowed but discouraged by design.

---

## 7. Initial Overview Algorithm

When requested to **index** or **overview**, the tool returns:

For each document:

* Namespace
* All headings with:

  * Selector (shorthand form: `h2.0`)
  * Heading text
  * Indentation by depth

* Block summary counts

No summaries.
No inference.
No semantic compression beyond omission.

---

## 8. Discovery of "Other Key Tokens"

### 8.1 Detection Strategy

* Markdown AST parsing for known block types
* Regex-based detection allowed for:

  * Code fences
  * Tables
  * Blockquotes
* No TODO/FIXME granularity
* No inline emphasis extraction

Everything not classified is plain text.

---

### 8.2 Discoverability Guarantee

Every block of text is:

* Either directly selectable
* Or reachable via a parent selector

Nothing is undiscoverable.

---

## 9. CLI Command Surface

### 9.1 Core Commands

#### `index`

Parse documents and emit selector inventory.

```
mdsel index file1.md file2.md
mdsel index file1.md --json
```

Returns (text format):

```
h1.0 Title
 h2.0 Installation
 h2.1 Usage
---
code:5 para:12 list:3 table:1
```

Returns (JSON format with `--json`):

* Namespaces
* Selectors
* Node metadata
* Truncation flags

---

#### `select`

Retrieve content via selectors.

```
mdsel select h2.1 file.md
mdsel select code.0 file.md
mdsel select h2.0-2 file.md
```

Selectors may be:

* Fully qualified (`readme::h2.0`)
* Partially qualified (applies across all namespaces)

---

### 9.2 Output Format

**Default: Compact text** (optimized for LLM token efficiency)

* No JSON overhead
* Minimal verbosity
* Suitable for direct context injection

**Optional: JSON** (with `--json` flag)

* Structured output for programmatic use
* Full metadata included

Fields include:

* `selector`
* `type`
* `content`
* `truncated`
* `children_available`
* `pagination`

---

## 10. Failure & Ambiguity Handling

### 10.1 Failure Model

All failures are **soft**.

Response includes:

* `partial_results` (if any)
* `unresolved_selectors`
* `warnings`

Text format:
```
!selector
reason
~suggestion1 ~suggestion2
```

---

### 10.2 Suggestions

Suggestions are **fuzzy but bounded**.

Based on:

* Known selector grammar
* Existing selectors
* Levenshtein / prefix similarity

Example (text):

```
!h3.99
Index out of range
~h3.0 ~h3.1 ~h3.2
```

---

## 11. Statelessness

* Tool maintains **no session memory**
* Each invocation is independent
* Agent is responsible for context tracking

---

## 12. Non-Goals (Explicitly Out of Scope)

* Summarization
* Semantic interpretation
* Cross-document inference
* Inline selection
* Token accounting
* State persistence
* Human usability

---

## 13. Implementation Guarantees

1. Deterministic output for identical input
2. Every text chunk is selectable
3. No hidden transformations
4. No LLM calls
5. Selector grammar is finite and enumerable

---

## 14. Success Criteria

The tool is successful if:

* An LLM can navigate a large Markdown corpus
* Without ever seeing irrelevant content
* Using only declarative selectors
* With minimal token overhead
