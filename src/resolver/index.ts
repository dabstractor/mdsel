// Public API for the resolver module

// Resolver functions
export { resolveSingle } from './single-resolver.js';
export { resolveMulti } from './multi-resolver.js';

// Suggestion engine
export { SuggestionEngine, type SuggestionOptions } from './suggestions.js';

// Levenshtein distance
export { levenshteinDistance } from './levenshtein.js';

// Type exports
export type {
  ResolutionResult,
  ResolutionError,
  ResolutionSuccess,
  ResolutionFailure,
  ResolutionOutcome,
  Suggestion,
  DocumentTree,
  WordCountOptions,
  ResolutionContext
} from './types.js';
