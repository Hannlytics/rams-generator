// --- TYPE DEFINITIONS for clarity ---
interface StepData {
    [key: string]: any; 
}

// --- Helper Function to format the prompt for the AI ---
export function formatAiPrompt(stepData: StepData): string {
    // This function takes all the form data and formats it into a clean,
    // readable string for the AI to analyze.
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

        Check if it complies with UK regulations including CDM 2015, COSHH, and PPE.

        Perform the following:
        - Highlight any missing sections, unclear items, or compliance issues.
        - For each issue, provide a suggested improvement as a complete block of text.
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
            "message": "The method statement is too generic and lacks detail.",
            "suggestion": "Expand the method statement to include site setup, waste removal, and emergency procedures.",
            "autoFixContent": "1. Site Setup: Cordon off the work area using barriers and signage. 2. Main Task: Carry out the work as per the manufacturer's instructions. 3. Waste Removal: All waste materials to be disposed of in the designated site skip. 4. Cleanup: The work area will be left clean and tidy at the end of each shift."
          }
        ]
    `;
}

