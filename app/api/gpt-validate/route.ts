import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

// Initialize OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    const formData = await request.json();

    // Construct the validation prompt
    const prompt = `
    As a construction safety compliance expert, analyze this RAMS document data for quality and compliance.
    
    Form Data:
    - Project: ${formData.projectName || 'Not provided'}
    - Client: ${formData.clientName || 'Not provided'}
    - Scope: ${formData.scopeOfWork || 'Not provided'}
    - Method Statement: ${formData.methodStatement || 'Not provided'}
    - Controls: ${formData.controls || 'Not provided'}
    - Emergency Contacts: ${formData.emergencyContacts || 'Not provided'}
    - Hazards: ${JSON.stringify(formData.selectedHazards || [])}
    - PPE: ${JSON.stringify(formData.selectedPPE || [])}

    Evaluate and return JSON with:
    1. languageScore (0-100): Professional language, technical accuracy, clarity
    2. toneScore (0-100): Appropriate safety-focused tone, not too casual
    3. completenessScore (0-100): All required sections present and detailed
    4. suggestions: Array of specific improvement suggestions (max 5)

    Respond ONLY with valid JSON, no additional text.
    `;

    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: "You are a UK construction safety compliance expert specializing in CDM 2015, COSHH, RIDDOR, and PPE regulations. Respond only with valid JSON."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.3, // Lower temperature for more consistent responses
      max_tokens: 500,
    });

    const responseContent = completion.choices[0].message.content;
    
    // Parse the GPT response
    let gptReview;
    try {
      gptReview = JSON.parse(responseContent || '{}');
    } catch (error) {
      // Fixed: Using the error variable properly
      console.error('Failed to parse GPT response:', responseContent);
      console.error('Parse error details:', error);
      
      // Fallback if GPT doesn't return valid JSON
      gptReview = {
        languageScore: 70,
        toneScore: 70,
        completenessScore: 60,
        suggestions: ["Unable to process full validation. Please ensure all fields are complete."]
      };
    }

    // Ensure all required fields exist with proper type checking
    const validatedReview = {
      languageScore: typeof gptReview.languageScore === 'number' ? gptReview.languageScore : 70,
      toneScore: typeof gptReview.toneScore === 'number' ? gptReview.toneScore : 70,
      completenessScore: typeof gptReview.completenessScore === 'number' ? gptReview.completenessScore : 60,
      suggestions: Array.isArray(gptReview.suggestions) 
        ? gptReview.suggestions.slice(0, 5) // Max 5 suggestions
        : ["Please review all sections for completeness"]
    };

    return NextResponse.json(validatedReview);

  } catch (error) {
    console.error('GPT Validation Error:', error);
    
    // Return fallback scores if API fails
    return NextResponse.json({
      languageScore: 75,
      toneScore: 75,
      completenessScore: 65,
      suggestions: [
        "GPT validation temporarily unavailable. Manual review recommended.",
        "Ensure all safety procedures follow current UK regulations."
      ]
    }, { status: 200 }); // Return 200 even on error to avoid breaking the frontend
  }
}