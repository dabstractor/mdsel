# Selector Resolution Edge Cases Research

This document researches and documents edge cases for selector resolution in the mdsel tool, analyzing the existing implementation and identifying potential issues and areas for improvement.

## Analysis of Current Implementation

Based on examination of `/home/dustin/projects/mdsel/src/resolver/single-resolver.ts`, the current implementation has several edge case handling mechanisms:

1. **Index validation** - Checks if `segment.index >= matches.length` before accessing array elements
2. **Namespace matching** - Validates namespace existence before proceeding
3. **Error suggestions** - Uses Levenshtein distance for fuzzy matching when selectors fail
4. **Partial results tracking** - Maintains partial resolution state for error recovery
5. **Empty input handling** - Parser throws `EMPTY_SELECTOR` error for empty selectors

However, several edge cases are not explicitly handled or are handled incompletely.

---

## Category 1: Repeated Heading Titles

### Edge Case 1.1: Same heading text at different levels
**Description**: Multiple headings with identical text but different heading levels (h1, h2, etc.)
**Example**:
```
# Introduction
## Introduction
### Introduction
```
**Selector**: `heading:introduction[0]` (if implemented text-based selection)
**Current behavior**: Currently not supported - only level-based selection works
**Expected behavior**: Should maintain current behavior (level-based selection only) unless text-based features are added
**Recommendation**: Keep current design. If text-based selection is needed, implement as separate feature with clear disambiguation strategy

### Edge Case 1.2: Same heading text at same level
**Description**: Multiple headings with identical text at the same level
**Example**:
```
## Section A
Content
## Section A
More content
```
**Selector**: `heading:h2[0]` vs `heading:h2[1]`
**Current behavior**: Correctly resolves - uses ordinal position [0] and [1]
**Expected behavior**: Should resolve correctly using position-based indexing
**Recommendation**: ✅ Already handled correctly by current implementation

### Edge Case 1.3: Deep nesting with identical titles
**Description**: Same title appearing in nested sections at different depths
**Example**:
```
# Overview
## Overview
### Overview
#### Overview
```
**Selector**: `heading:h1[0]/heading:h2[0]/heading:h3[0]`
**Current behavior**: Should resolve correctly using position-based indexing
**Expected behavior**: Each level should resolve to the correct heading
**Recommendation**: ✅ Already handled correctly by current implementation

### Edge Case 1.4: Suggestion generation for repeated titles
**Description**: When suggestions are generated for heading selectors with repeated text
**Example**: User types `heading:introduction` but multiple "Introduction" headings exist
**Current behavior**: Suggestions would be based on selector string similarity only
**Expected behavior**: Could provide contextual suggestions about which heading instance was intended
**Recommendation**: Enhance suggestion engine to consider heading text content when available, not just selector syntax

---

## Category 2: Deeply Nested Sections

### Edge Case 2.1: Maximum heading level chains
**Description**: Full h1 > h2 > h3 > h4 > h5 > h6 nesting chain
**Example**:
```
# H1
## H2
### H3
#### H4
##### H5
###### H6
Content
```
**Selector**: `heading:h1[0]/heading:h2[0]/heading:h3[0]/heading:h4[0]/heading:h5[0]/heading:h6[0]`
**Current behavior**: Should resolve correctly with current implementation
**Expected behavior**: Should successfully navigate the full depth
**Potential issue**: Deep recursion might hit call stack limits in some JavaScript environments
**Recommendation**: ✅ Already handled, but consider adding test for maximum nesting depth

### Edge Case 2.2: Index out of range at deep levels
**Description**: Requesting index beyond available nodes at deep nesting levels
**Example**:
```
# H1
## H2 (only one H2, but requesting [1])
```
**Selector**: `heading:h1[0]/heading:h2[1]`
**Current behavior**: Returns `INDEX_OUT_OF_RANGE` error
**Expected behavior**: Should return clear error message with available count
**Recommendation**: ✅ Already handled correctly in `single-resolver.ts` line 189-197

### Edge Case 2.3: Performance with deep traversal
**Description**: Performance impact when traversing very deep trees
**Example**: Document with 1000 levels of nesting (theoretically possible in markdown)
**Current behavior**: Current implementation uses iterative traversal, should handle well
**Expected behavior**: Should maintain reasonable performance
**Potential issue**: No depth limit checks - could lead to stack overflow with extreme nesting
**Recommendation**: Add maximum depth validation to prevent stack overflow

### Edge Case 2.4: Empty intermediate nodes
**Description**: Nodes at deep levels with no children
**Example**:
```
# H1
Content
## H2
More content
### H3 (no children, but requesting heading:h3[0])
```
**Selector**: `heading:h1[0]/heading:h2[0]/heading:h3[0]`
**Current behavior**: Should fail at heading:h3[0] with `SELECTOR_NOT_FOUND`
**Expected behavior**: Should fail gracefully with appropriate error
**Recommendation**: ✅ Already handled correctly

---

## Category 3: Boundary Conditions

### Edge Case 3.1: Negative indices
**Description**: Attempting to use negative indices in selector brackets
**Example**: `heading:h1[-1]`, `block:code[-5]`
**Current behavior**: Parser rejects negative indices in `parseSelector()` (line 186-188 in parser.ts)
**Expected behavior**: Should reject negative indices with clear error
**Recommendation**: ✅ Already handled correctly

### Edge Case 3.2: Index at boundary (exactly number of items)
**Description**: Using index equal to the count of available items
**Example**: Document has 3 H1 headings, selector `heading:h1[3]`
**Current behavior**: Returns `INDEX_OUT_OF_RANGE` error (indices are 0-based)
**Expected behavior**: Should return clear error indicating valid range is 0-2
**Recommendation**: ✅ Already handled correctly

### Edge Case 3.3: Index far beyond range
**Description**: Using extremely large index values
**Example**: `heading:h1[999999]`
**Current behavior**: Returns `INDEX_OUT_OF_RANGE` error
**Expected behavior**: Should handle gracefully without performance issues
**Potential issue**: Error message could be confusing for very large numbers
**Recommendation**: ✅ Already handled, but consider optimizing error message for extreme cases

### Edge Case 3.4: Empty selectors
**Description**: Completely empty selector string
**Example**: `""`
**Current behavior**: Parser throws `EMPTY_SELECTOR` error
**Expected behavior**: Should reject with clear error message
**Recommendation**: ✅ Already handled correctly

### Edge Case 3.5: Trailing slashes
**Description**: Selector ending with a slash
**Example**: `heading:h1[0]/`
**Current behavior**: Parser expects valid path segment after slash, throws error
**Expected behavior**: Should reject trailing slash with clear error
**Recommendation**: ✅ Already handled correctly by parser

### Edge Case 3.6: Invalid characters in selectors
**Description**: Using invalid characters in selector components
**Example**: `heading:h1[0]/block:code[0]/invalid@type[0]`
**Current behavior**: Parser throws `INVALID_SYNTAX` or similar error
**Expected behavior**: Should reject with clear error message
**Recommendation**: ✅ Already handled by tokenizer and parser

---

## Category 4: Namespace Issues

### Edge Case 4.1: Undefined namespace
**Description**: Requesting a namespace that doesn't exist
**Example**: `nonexistent::heading:h1[0]`
**Current behavior**: Returns `NAMESPACE_NOT_FOUND` error with suggestions
**Expected behavior**: Should provide helpful namespace suggestions
**Recommendation**: ✅ Already handled with Levenshtein suggestions

### Edge Case 4.2: Empty namespace
**Description**: Selector with empty namespace (`::heading:h1[0]`)
**Current behavior**: Currently not handled explicitly
**Expected behavior**: Should either reject or treat as cross-document selection
**Recommendation**: Add explicit handling for empty namespace edge case

### Edge Case 4.3: Special characters in filenames
**Description**: Namespace derived from filename with special characters
**Example**: `my-documen🚀t.md` → namespace `my-documen🚀t`
**Current behavior**: Namespace validation may not handle Unicode properly
**Expected behavior**: Should handle Unicode filenames consistently
**Recommendation**: Add Unicode normalization for namespace comparisons

### Edge Case 4.4: Multiple documents with same basename
**Description**: Different extensions, same base name
**Example**: `doc.md`, `doc.txt`, `doc.html` all have namespace `doc`
**Current behavior**: Would namespace collision occur?
**Expected behavior**: Should handle namespace collisions gracefully
**Recommendation**: Consider including file extension in namespace or adding disambiguation

---

## Category 5: Unusual mdast Structures

### Edge Case 5.1: Root with no children
**Description**: Empty markdown document or document with no content
**Example**: `""` or just whitespace
**Selector**: `root`
**Current behavior**: Should resolve to root node with empty children array
**Expected behavior**: Should resolve successfully but have no child content
**Recommendation**: ✅ Should work correctly with current implementation

### Edge Case 5.2: Nodes without position info
**Description**: mdast nodes missing position metadata
**Example**: Manually constructed AST without position fields
**Current behavior**: Current implementation doesn't rely on position for resolution
**Expected behavior**: Should still resolve correctly
**Recommendation**: ✅ Implementation appears robust to missing position data

### Edge Case 5.3: Orphaned nodes
**Description**: Nodes in tree with no proper parent relationships
**Example**: Node with `parent` field pointing to non-existent node
**Current behavior**: Current implementation traverses via `children` array, should be unaffected
**Expected behavior**: Should resolve correctly regardless of orphaned references
**Recommendation**: ✅ Current implementation is robust against parent reference issues

### Edge Case 5.4: Circular references
**Description**: Nodes with circular parent/child relationships
**Example**: Node A contains Node B, Node B contains Node A
**Current behavior**: Current iterative traversal should avoid infinite loops
**Expected behavior**: Should handle without infinite recursion
**Recommendation**: ✅ Implementation uses iterative approach, should be safe

### Edge Case 5.5: Mixed content types
**Description**: Non-standard mdast structures with mixed content
**Example**: Root node containing both block elements and inline elements
**Current behavior**: `findMatchingChildren` filters by expected types
**Expected behavior**: Should only match supported node types
**Recommendation**: ✅ Current implementation is type-safe

---

## Additional Edge Cases Identified

### Edge Case 6.1: Query parameter edge cases
**Description**: Malformed or unusual query parameters
**Examples**:
- `section[0]?full=true&invalid`
- `heading:h1[0]?`
- `block:code[0]?==`
**Current behavior**: Parser should reject malformed queries
**Recommendation**: Enhance query parameter validation

### Edge Case 6.2: Very long selectors
**Description**: Extremely long selector strings
**Example**: Selector with 100+ segments
**Current behavior**: Should work but may hit string length limits
**Expected behavior**: Should handle reasonable lengths gracefully
**Recommendation**: Add maximum length validation

### Edge Case 6.3: Unicode in selector components
**Description**: Unicode characters in namespace, types, or indices
**Example**: `📄::heading:h1[0]`, `heading:h🄰[0]` (invalid but possible)
**Current behavior**: Parser should reject invalid Unicode
**Expected behavior**: Should handle valid Unicode consistently
**Recommendation**: Add Unicode normalization and validation

### Edge Case 6.4: Nested virtual nodes
**Description**: Virtual nodes within virtual nodes
**Example**: `section[0]/page[0]/section[1]`
**Current behavior**: Currently `section` and `page` return empty arrays
**Expected behavior**: Virtual node hierarchy needs clarification
**Recommendation**: Define virtual node nesting behavior or disable nested virtual selection

---

## Recommendations for Implementation

### High Priority
1. **Add maximum depth validation** to prevent stack overflow in deep traversal
2. **Handle empty namespace case** explicitly
3. **Add Unicode normalization** for namespace comparisons
4. **Enhance error messages** for extreme index values

### Medium Priority
1. **Improve suggestion engine** to consider heading text content
2. **Add comprehensive test coverage** for all edge cases
3. **Implement virtual node hierarchy** if needed
4. **Add query parameter validation enhancements**

### Low Priority
1. **Performance optimization** for very deep trees
2. **Add maximum selector length** validation
3. **Consider namespace collision** resolution strategy
4. **Add Unicode validation** for selector components

---

## Testing Recommendations

### Required Test Cases
1. **Repeated headings** with same text at same and different levels
2. **Maximum nesting depth** (h1 through h6 chains)
3. **All boundary conditions**: empty, negative, extreme indices
4. **Special character filenames** for namespace testing
5. **Empty documents** and edge cases
6. **Malformed query parameters**
7. **Unicode in selector components**

### Performance Tests
1. **Deep traversal performance** with 100+ levels
2. **Large index handling** (999999 range)
3. **Long selector strings** (100+ segments)

---

## Conclusion

The current mdsel implementation handles many edge cases well, particularly around index validation and basic error handling. The main areas for improvement are:

1. **Enhanced namespace handling** (empty namespaces, Unicode)
2. **Improved suggestion quality** (content-aware suggestions)
3. **Defensive programming** against extreme cases (depth, length limits)
4. **Comprehensive test coverage** for identified edge cases

The implementation follows good practices with iterative traversal and proper bounds checking, making it robust against many potential issues.