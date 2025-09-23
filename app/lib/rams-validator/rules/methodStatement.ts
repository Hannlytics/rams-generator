// app/lib/rams-validator/rules/methodStatement.ts

// Proper TypeScript interfaces
interface RamsFormData {
  methodStatement?: string;
  scopeOfWork?: string;
  sequenceOfOperations?: string;
}

interface ValidationSuggestion {
  field: string;
  severity: 'low' | 'medium' | 'high';
  message: string;
}

export function validateMethodStatement(stepData: RamsFormData): ValidationSuggestion[] {
  const suggestions: ValidationSuggestion[] = [];
  
  // Check if method statement is too brief
  if (stepData.methodStatement && stepData.methodStatement.length < 50) {
    suggestions.push({
      field: "methodStatement",
      severity: "medium",
      message: "The method statement is brief. Consider adding more detail about the sequence of operations and specific safety controls.",
    });
  }
  
  // Check if method statement is missing
  if (!stepData.methodStatement || stepData.methodStatement.trim().length === 0) {
    suggestions.push({
      field: "methodStatement",
      severity: "high",
      message: "Method statement is required. Please provide detailed steps for how the work will be carried out safely.",
    });
  }
  
  // Check if sequence of operations is missing when method statement exists
  if (stepData.methodStatement && stepData.methodStatement.length > 0 && 
      (!stepData.sequenceOfOperations || stepData.sequenceOfOperations.trim().length === 0)) {
    suggestions.push({
      field: "sequenceOfOperations",
      severity: "medium",
      message: "Consider adding a detailed sequence of operations to complement your method statement.",
    });
  }
  
  // Check for generic or vague method statements
  const genericPhrases = [
    'follow standard procedure',
    'work safely',
    'use appropriate ppe',
    'take care',
    'be careful'
  ];
  
  if (stepData.methodStatement) {
    const lowerCaseStatement = stepData.methodStatement.toLowerCase();
    const hasGenericContent = genericPhrases.some(phrase => 
      lowerCaseStatement.includes(phrase)
    );
    
    if (hasGenericContent && stepData.methodStatement.length < 200) {
      suggestions.push({
        field: "methodStatement",
        severity: "medium",
        message: "The method statement appears to contain generic phrases. Consider adding more specific, detailed procedures for this particular task.",
      });
    }
  }
  
  return suggestions;
}