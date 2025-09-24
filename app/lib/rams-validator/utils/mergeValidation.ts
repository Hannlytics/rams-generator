// app/lib/rams-validator/utils/mergeValidation.ts

// Proper TypeScript interfaces
interface RamsFormData {
  projectName?: string;
  clientName?: string;
  startDate?: string;
  endDate?: string;
  duration?: string;
  jobReference?: string;
  siteAddress?: string;
  siteContactPerson?: string;
  trade?: string;
  taskType?: string;
  scopeOfWork?: string;
  methodStatement?: string;
  sequenceOfOperations?: string;
  personsAtRisk?: string;
  selectedHazards?: string[];
  customHazards?: string;
  selectedPPE?: string[];
  controls?: string;
  specialEquipment?: string;
  toolingSafety?: string;
  signageAndBarriers?: string;
  firstAidArrangements?: string;
  firePrecautions?: string;
  emergencyContacts?: string;
  siteManager?: string;
  contactNumber?: string;
  preparedBy?: string;
  reviewedBy?: string;
  reviewDate?: string;
  revisionNumber?: string;
  acknowledgement?: boolean;
}

interface ValidationSuggestion {
  field: string;
  severity: 'low' | 'medium' | 'high';
  message: string;
}

interface ValidationResult {
  isValid: boolean;
  suggestions: ValidationSuggestion[];
  errorCount: number;
  warningCount: number;
}

// COSHH validation function
function validateCoshh(stepData: RamsFormData): ValidationSuggestion[] {
  const suggestions: ValidationSuggestion[] = [];
  
  if (stepData.selectedHazards?.includes('Hazardous Substances (COSHH)') && 
      !stepData.controls?.toLowerCase().includes('coshh')) {
    suggestions.push({
      field: "controls",
      severity: "high",
      message: "Hazardous Substances are selected, but no specific COSHH assessment or controls are mentioned in the control measures.",
    });
  }
  
  return suggestions;
}

// Method Statement validation function
function validateMethodStatement(stepData: RamsFormData): ValidationSuggestion[] {
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

// Additional validation functions
function validateProjectInfo(stepData: RamsFormData): ValidationSuggestion[] {
  const suggestions: ValidationSuggestion[] = [];
  
  if (!stepData.projectName || stepData.projectName.trim().length === 0) {
    suggestions.push({
      field: "projectName",
      severity: "high",
      message: "Project name is required.",
    });
  }
  
  if (!stepData.clientName || stepData.clientName.trim().length === 0) {
    suggestions.push({
      field: "clientName",
      severity: "high",
      message: "Client name is required.",
    });
  }
  
  return suggestions;
}

function validateControlMeasures(stepData: RamsFormData): ValidationSuggestion[] {
  const suggestions: ValidationSuggestion[] = [];
  
  if (!stepData.controls || stepData.controls.trim().length === 0) {
    suggestions.push({
      field: "controls",
      severity: "high",
      message: "Control measures are required. Please specify how risks will be managed.",
    });
  } else if (stepData.controls.length < 100) {
    suggestions.push({
      field: "controls",
      severity: "medium",
      message: "Control measures seem brief. Consider adding more detailed risk control information.",
    });
  }
  
  return suggestions;
}

// Available validation rules
const validationRules = [
  validateCoshh,
  validateMethodStatement,
  validateProjectInfo,
  validateControlMeasures
];

// Main export function that the API route will use
export function mergeValidationResults(stepData: RamsFormData): ValidationResult {
  const allSuggestions: ValidationSuggestion[] = [];
  
  // Run all validation rules and collect suggestions
  for (const rule of validationRules) {
    try {
      const suggestions = rule(stepData);
      if (Array.isArray(suggestions)) {
        allSuggestions.push(...suggestions);
      }
    } catch (error) {
      console.warn('Validation rule failed:', error);
      // Continue with other rules even if one fails
    }
  }
  
  // Remove duplicate suggestions based on field and message
  const uniqueSuggestions = removeDuplicateSuggestions(allSuggestions);
  
  // Count errors and warnings
  const errorCount = uniqueSuggestions.filter(s => s.severity === 'high').length;
  const warningCount = uniqueSuggestions.filter(s => s.severity === 'medium' || s.severity === 'low').length;
  
  return {
    isValid: errorCount === 0,
    suggestions: uniqueSuggestions,
    errorCount,
    warningCount,
  };
}

function removeDuplicateSuggestions(suggestions: ValidationSuggestion[]): ValidationSuggestion[] {
  const seen = new Set<string>();
  const unique: ValidationSuggestion[] = [];
  
  for (const suggestion of suggestions) {
    const key = `${suggestion.field}-${suggestion.message}`;
    if (!seen.has(key)) {
      seen.add(key);
      unique.push(suggestion);
    }
  }
  
  return unique;
}

// Additional utility exports
export function validateFormStep(stepData: RamsFormData): ValidationResult {
  return mergeValidationResults(stepData);
}

export function getValidationSummary(result: ValidationResult): string {
  if (result.isValid) {
    return 'All validations passed successfully.';
  }
  
  const parts: string[] = [];
  
  if (result.errorCount > 0) {
    parts.push(`${result.errorCount} error${result.errorCount !== 1 ? 's' : ''}`);
  }
  
  if (result.warningCount > 0) {
    parts.push(`${result.warningCount} warning${result.warningCount !== 1 ? 's' : ''}`);
  }
  
  return `Found ${parts.join(' and ')}.`;
}

export function filterSuggestionsBySeverity(
  suggestions: ValidationSuggestion[],
  severity: 'low' | 'medium' | 'high'
): ValidationSuggestion[] {
  return suggestions.filter(suggestion => suggestion.severity === severity);
}

export function groupSuggestionsByField(
  suggestions: ValidationSuggestion[]
): Record<string, ValidationSuggestion[]> {
  const grouped: Record<string, ValidationSuggestion[]> = {};
  
  for (const suggestion of suggestions) {
    if (!grouped[suggestion.field]) {
      grouped[suggestion.field] = [];
    }
    grouped[suggestion.field].push(suggestion);
  }
  
  return grouped;
}

// Export types for use in other files
export type { RamsFormData, ValidationSuggestion, ValidationResult };