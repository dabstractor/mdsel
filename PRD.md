# PRD: Declarative Markdown Semantic Selection CLI for LLM Agents

## 1. Purpose & Scope

This tool provides **declarative, semantic, path-based selection** over one or more Markdown documents, optimized for **LLM agent consumption** and **token efficiency**.

The tool’s sole responsibility is to:

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

   * Strictly structured output
   * Minimal verbosity
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

| Node Type                   | Description                           |
| --------------------------- | ------------------------------------- |
| `root`                      | Non-heading text before first heading |
| `heading:h1` … `heading:h6` | Markdown headings                     |
| `section`                   | A heading + all of its content        |
| `block:paragraph`           | Free text not otherwise typed         |
| `block:list`                | Ordered or unordered list             |
| `block:code`                | Fenced code block                     |
| `block:table`               | Markdown table                        |
| `block:blockquote`          | Blockquotes                           |

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
doc2::heading:h2[3]
```

If no namespace is specified, selection applies across **all provided documents**.

---

### 5.3 Selector Grammar

#### 5.3.1 Base Components

```
root
heading:hN[index]
section[index]
block:type[index]
```

Where:

* `hN` = heading level (1–6)
* `index` = 0-based ordinal among siblings of same type

---

#### 5.3.2 Path Composition

Selectors compose left-to-right:

```
doc::heading:h2[1]/section[0]/block:code[0]
```

Meaning:

* Second H2
* Its first section
* Its first code block

---

#### 5.3.3 Implicit Expansion

Selecting a parent yields all children.

Example:

```
doc::heading:h2[1]
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
section[2] → page[0], page[1], page[2]
```

The selector surface exposes:

```
doc::section[2]/page[1]
```

The agent may request:

* A specific page
* The entire node explicitly

---

### 6.3 Full Retrieval

The agent may explicitly request:

```
doc::section[2]?full=true
```

This bypasses truncation.
This is allowed but discouraged by design.

---

## 7. Initial Overview Algorithm

When requested to **index** or **overview**, the tool returns:

For each document:

* Namespace
* Root node (truncated)
* All headings with:

  * Selector
  * Heading text
  * Node type
  * Child count
  * Truncation indicator

No summaries.
No inference.
No semantic compression beyond omission.

---

## 8. Discovery of “Other Key Tokens”

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
```

Returns:

* Namespaces
* Selectors
* Node metadata
* Truncation flags

---

#### `select`

Retrieve content via selectors.

```
mdsel select doc::heading:h2[1]
mdsel select block:code[0]
```

Selectors may be:

* Fully qualified
* Partially qualified (applies across all namespaces)

---

### 9.2 Output Format

**Strict structured output (JSON)**

No free text.
No prose.

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

---

### 10.2 Suggestions

Suggestions are **fuzzy but bounded**.

Based on:

* Known selector grammar
* Existing selectors
* Levenshtein / prefix similarity

Example:

```
Did you mean:
- doc::heading:h3[2]
- doc::section[5]
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

