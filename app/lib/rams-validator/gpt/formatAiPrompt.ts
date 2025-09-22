// lib/rams-validator/gpt/formatAiPrompt.ts

// This helper function takes all the form data and formats it into a clean,
// readable string for the AI to analyze.
export function formatAiPrompt(stepData: any): string {
    let ramsDocument = "RAMS Document:\n";
    ramsDocument += `Project Name: ${stepData.projectName || 'Not provided'}\n`;
    ramsDocument += `Trade: ${stepData.trade || 'Not provided'}\n`;
    ramsDocument += `Task Type: ${stepData.taskType || 'Not provided'}\n`;
    ramsDocument += `Scope of Work: ${stepData.scopeOfWork || 'Not provided'}\n`;
    ramsDocument += `Method Statement: ${stepData.methodStatement || 'Not provided'}\n`;
    ramsDocument += `Identified Hazards: ${stepData.selectedHazards?.join(', ') || 'None'}\n`;
    ramsDocument += `Control Measures: ${stepData.controls || 'Not provided'}\n`;
    ramsDocument += `PPE: ${stepData.selectedPPE?.join(', ') || 'Not provided'}\n`;
    
    return `
        Here is a RAMS (Risk Assessment & Method Statement) document.

        Check if it complies with the following regulations:
        1. CDM 2015 (Construction Design & Management)
        2. COSHH (Control of Substances Hazardous to Health)
        3. RIDDOR 2013 (Reporting of Injuries, Diseases and Dangerous Occurrences)
        4. PPE Regulations
        5. Fire Safety & Lone Working guidance

        Perform the following:
        - Highlight any missing sections, unclear items, or incorrect sequences.
        - Return structured JSON output.

        RAMS Document:
        """
        ${ramsDocument}
        """

        Return output in this JSON format. If fully compliant, return an empty array []:
        
        [
          {
            "field": "methodStatement", 
            "severity": "high",
            "message": "A brief, clear message about the compliance issue.",
            "suggestion": "A helpful suggestion on how to fix the issue."
          }
        ]
    `;
}

