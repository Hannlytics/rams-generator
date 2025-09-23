import { NextResponse } from 'next/server';

// This is the core instruction for the Copilot AI.
// It tells the AI to act as an assistant that deconstructs a user's request
// into the structured data our form needs.
const systemPrompt = `
You are an AI assistant for a UK Health & Safety RAMS (Risk Assessment and Method Statement) generator. 
Your task is to take a user's natural language request and deconstruct it into a structured JSON object that can pre-fill a form.

Analyze the user's prompt to identify the following key entities:
- trade: The primary construction trade involved.
- taskType: The specific task being performed.
- scopeOfWork: A brief description of the job.
- methodStatement: A simple, step-by-step method statement based on the task.
- sequenceOfOperations: A numbered list of the operational sequence.
- selectedHazards: A list of likely hazards based on the task (e.g., scaffolding implies "Working at Height").
- selectedPPE: A list of essential PPE for the task.
- controls: Suggested control measures for the identified hazards.

Return ONLY the structured JSON object.

Example Request: "a RAMS for bricklaying on scaffolding with hazardous adhesives"
Example JSON Output:
{
  "trade": "Bricklayer",
  "taskType": "Feature Brickwork",
  "scopeOfWork": "Construction of a brick wall on an external scaffold, using specialized chemical adhesives.",
  "methodStatement": "1. Erect scaffold as per design. 2. Mix adhesive in a ventilated area. 3. Lay bricks course by course. 4. Clean up area and remove waste.",
  "sequenceOfOperations": "1. Scaffold Erection\n2. Material Preparation\n3. Bricklaying\n4. Site Cleanup",
  "selectedHazards": ["Working at Height", "Manual Handling", "Hazardous Substances (COSHH)", "Slips, Trips and Falls"],
  "selectedPPE": ["Hard Hat", "Safety Boots (Steel Toe)", "High-Visibility Vest", "Gloves", "Safety Glasses / Goggles"],
  "controls": "Scaffold to be inspected before use. Manual handling techniques to be used. COSHH data sheet for adhesive to be available on site. Area to be kept tidy."
}
`;

export async function POST(request: Request) {
  try {
    const { prompt } = await request.json();

    if (!prompt) {
      return NextResponse.json({ error: 'Prompt is required' }, { status: 400 });
    }

    const apiKey = ""; // The environment will provide this automatically.
    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-05-20:generateContent?key=${apiKey}`;

    const payload = {
      systemInstruction: { parts: [{ text: systemPrompt }] },
      contents: [{ parts: [{ text: prompt }] }],
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
      const errorText = await aiResponse.text();
      console.error("AI API Error:", errorText);
      return NextResponse.json({ error: 'Failed to get AI response' }, { status: 500 });
    }

    const aiResult = await aiResponse.json();
    const aiResponseText = aiResult.candidates?.[0]?.content?.parts?.[0]?.text;

    if (aiResponseText) {
      try {
        const parsedData = JSON.parse(aiResponseText);
        return NextResponse.json({ formData: parsedData });
      } catch (e) {
        console.error("Failed to parse AI JSON response:", aiResponseText, e);
        return NextResponse.json({ error: 'Failed to parse AI response' }, { status: 500 });
      }
    }
    
    return NextResponse.json({ error: 'No content from AI' }, { status: 500 });

  } catch (error) {
    console.error('Copilot API Error:', error);
    return NextResponse.json({ error: 'Failed to process copilot request' }, { status: 500 });
  }
}
