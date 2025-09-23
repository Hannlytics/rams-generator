// app/lib/rams-validator/rules/coshh.ts

// Proper TypeScript interfaces
interface RamsFormData {
  selectedHazards?: string[];
  controls?: string;
}

interface ValidationSuggestion {
  field: string;
  severity: string;
  message: string;
}

export function validateCoshh(stepData: RamsFormData): ValidationSuggestion[] {
  const suggestions: ValidationSuggestion[] = [];
  
  if (stepData.selectedHazards?.includes('Hazardous Substances (COSHH)') && !stepData.controls?.toLowerCase().includes('coshh')) {
    suggestions.push({
      field: "controls",
      severity: "high",
      message: "Hazardous Substances are selected, but no specific COSHH assessment or controls are mentioned in the control measures.",
    });
  }
  
  return suggestions;
}