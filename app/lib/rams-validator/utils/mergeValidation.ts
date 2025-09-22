// lib/rams-validator/utils/mergeValidation.ts

// This utility function combines the suggestions from the rule-based engine
// and the AI engine into a single, unified list for the front-end.
// For now, it's a simple concatenation, but it could be expanded to
// handle more complex logic like de-duplication.
export function mergeSuggestions(ruleSuggestions: any[], aiSuggestions: any[]): any[] {
  return [...ruleSuggestions, ...aiSuggestions];
}
