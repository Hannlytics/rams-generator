// lib/rams-validator/rules/coshh.ts

// This rule checks if COSHH is mentioned as a hazard but not addressed in the controls.
export function validateCoshh(stepData: any) {
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

