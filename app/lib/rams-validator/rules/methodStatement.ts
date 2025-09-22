// lib/rams-validator/rules/methodStatement.ts

// This rule checks if the method statement is too brief.
export function validateMethodStatement(stepData: any) {
  const suggestions = [];
  if (stepData.methodStatement && stepData.methodStatement.length < 50) {
    suggestions.push({
      field: "methodStatement",
      severity: "medium",
      message: "The method statement is brief. Consider adding more detail about the sequence of operations and specific safety controls.",
    });
  }
  return suggestions;
}

