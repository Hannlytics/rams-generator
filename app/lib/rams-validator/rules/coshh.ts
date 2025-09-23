// app/lib/rams-validator/rules/coshh.ts

// Temporary local interface definition to avoid import issues
interface RamsFormData {
  selectedHazards?: string[];
  controls?: string;
}

export function validateCoshh(stepData: RamsFormData) {
  const suggestions = [];
  if (stepData.selectedHazards?.includes('Hazardous Substances (COSHH)') && !stepData.controls?.toLowerCase().includes('coshh')) {
    suggestions.push({
      field: "controls",
      severity: "high",
      message: "Hazardous Substances are selected, but no specific COSHH assessment or controls are mentioned in the control measures.",
    });
  }
  return suggestions;
}