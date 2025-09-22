import { NextResponse } from 'next/server';

// --- NEW INTERFACE: Defines the structure of the form data ---
interface StepData {
    methodStatement?: string;
    personsAtRisk?: string;
    selectedHazards?: string[];
    controls?: string;
    [key: string]: any; // Allows for other properties not explicitly defined
}

// --- Helper Function to format the prompt for the AI ---
function formatAiPrompt(stepData: StepData): string {
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
    ramsDocument += `PPE: ${stepData.ppe || 'Not provided'}\n`;
    
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


export async function POST(request: Request) {
  try {
    const stepData: StepData = await request.json();
    let suggestions = [];

    // --- 1. FAST, RULE-BASED VALIDATION ---
    if (stepData.methodStatement && stepData.methodStatement.length < 50) {
      suggestions.push({
        field: "methodStatement",
        severity: "medium",
        message: "The method statement is brief. Consider adding more detail about the sequence of operations and specific safety controls.",
      });
    }
    if (stepData.personsAtRisk && !stepData.personsAtRisk.toLowerCase().includes('public') && !stepData.personsAtRisk.toLowerCase().includes('operatives')) {
        suggestions.push({
          field: "personsAtRisk",
          severity: "low",
          message: "Ensure you have considered all groups, such as operatives, visitors, and members of the public.",
        });
    }
    if (stepData.selectedHazards?.includes('Hazardous Substances (COSHH)') && !stepData.controls?.toLowerCase().includes('coshh')) {
        suggestions.push({
            field: "controls",
            severity: "high",
            message: "Hazardous Substances are selected, but no specific COSHH assessment or controls are mentioned in the control measures.",
        });
    }

    // --- 2. ADVANCED AI VALIDATION ---
    const apiKey = ""; // The environment will provide this automatically.
    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-05-20:generateContent?key=${apiKey}`;
    
    const systemPrompt = "You are a UK Health & Safety RAMS compliance validator. Evaluate the following RAMS document against CDM 2015, COSHH, RIDDOR 2013, PPE, and other UK safety laws. Return clear feedback in JSON format.";
    const userPrompt = formatAiPrompt(stepData);

    const payload = {
      systemInstruction: { parts: [{ text: systemPrompt }] },
      contents: [{ parts: [{ text: userPrompt }] }],
      generationConfig: {
        responseMimeType: "application/json",
      },
    };

    const aiResponse = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
    });

    if (!aiResponse.ok) {
        console.error("AI API Error:", await aiResponse.text());
        return NextResponse.json({ suggestions });
    }

    const aiResult = await aiResponse.json();
    const aiSuggestionsText = aiResult.candidates?.[0]?.content?.parts?.[0]?.text;
    
    if (aiSuggestionsText) {
        try {
            const parsedAiSuggestions = JSON.parse(aiSuggestionsText);
            if(Array.isArray(parsedAiSuggestions)) {
               suggestions = [...suggestions, ...parsedAiSuggestions];
            }
        } catch (_e) { // FIX: Prefixed 'e' with underscore to mark as unused
            console.error("Failed to parse AI JSON response:", aiSuggestionsText);
        }
    }
    
    // --- 3. RETURN COMBINED SUGGESTIONS ---
    return NextResponse.json({ suggestions });

  } catch (_error) { // FINAL FIX: Prefixed 'error' with an underscore
    console.error('Validation API Error:', _error);
    return NextResponse.json({ error: 'Failed to validate step' }, { status: 500 });
  }
}

