// lib/rams-validator/gpt/aiClient.ts
import { formatAiPrompt } from './formatAiPrompt';

// This function handles the actual communication with the AI model.
export async function getAiSuggestions(stepData: any): Promise<any[]> {
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

    try {
        const aiResponse = await fetch(apiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        if (!aiResponse.ok) {
            console.error("AI API Error:", await aiResponse.text());
            return []; // Return empty array on API error
        }

        const aiResult = await aiResponse.json();
        const aiSuggestionsText = aiResult.candidates?.[0]?.content?.parts?.[0]?.text;
        
        if (aiSuggestionsText) {
            const parsedAiSuggestions = JSON.parse(aiSuggestionsText);
            if(Array.isArray(parsedAiSuggestions)) {
                return parsedAiSuggestions;
            }
        }
        return [];
    } catch (error) {
        console.error("Failed to fetch or parse AI response:", error);
        return []; // Return empty array on exception
    }
}

