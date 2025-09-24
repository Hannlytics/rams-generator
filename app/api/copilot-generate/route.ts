// app/api/copilot-generate/route.ts
import { NextRequest, NextResponse } from 'next/server';

interface OpenAIMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

interface OpenAIResponse {
  choices: {
    message: {
      content: string;
    };
  }[];
  usage?: {
    total_tokens: number;
  };
}

export async function POST(request: NextRequest) {
  try {
    const { prompt } = await request.json();
    
    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json({
        success: false,
        error: 'OpenAI API key not configured'
      }, { status: 500 });
    }

    const systemPrompt = `You are a UK construction safety expert specializing in RAMS (Risk Assessment Method Statements). 

IMPORTANT: You must respond with ONLY valid JSON in this exact format:
{
  "projectName": "string",
  "trade": "string", 
  "taskType": "string",
  "scopeOfWork": "string",
  "methodStatement": "string",
  "personsAtRisk": "string",
  "selectedHazards": ["string1", "string2"],
  "controls": "string",
  "specialConsiderations": "string"
}

Guidelines:
- Use UK construction terminology and regulations
- Reference CDM 2015, COSHH, and relevant standards
- Include specific control measures, not generic advice  
- Hazards must be from: "Working at Height", "Electrical", "Manual Handling", "Power Tools / Equipment", "Hazardous Substances (COSHH)", "Slips, Trips and Falls", "Noise & Vibration", "Dust / Airborne Particles", "Hot Works", "Confined Spaces", "Lone Working", "Vehicular Movement", "Fire / Emergency Risks"
- Method statements should be step-by-step and detailed
- Always include disclaimer that this requires professional review
- Be specific to UK construction practices and regulations`;

    const messages: OpenAIMessage[] = [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: prompt }
    ];

    const openAIResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4',
        messages: messages,
        max_tokens: 2000,
        temperature: 0.3,
        response_format: { type: "json_object" }
      }),
    });

    if (!openAIResponse.ok) {
      const errorData = await openAIResponse.text();
      console.error('OpenAI API error:', errorData);
      return NextResponse.json({
        success: false,
        error: 'Failed to generate RAMS content'
      }, { status: 500 });
    }

    const data: OpenAIResponse = await openAIResponse.json();
    const generatedContent = data.choices[0]?.message?.content;

    if (!generatedContent) {
      return NextResponse.json({
        success: false,
        error: 'No content generated'
      }, { status: 500 });
    }

    try {
      const parsedContent = JSON.parse(generatedContent);
      
      // Add safety disclaimer
      parsedContent.aiGenerated = true;
      parsedContent.disclaimer = "This RAMS was AI-generated and must be reviewed by a competent person before use";
      
      return NextResponse.json({
        success: true,
        formData: parsedContent
      });

    } catch (parseError) {
      console.error('JSON parsing error:', parseError);
      return NextResponse.json({
        success: false,
        error: 'Failed to parse generated content'
      }, { status: 500 });
    }

  } catch (error) {
    console.error('Copilot generation error:', error);
    return NextResponse.json({
      success: false,
      error: 'Internal server error'
    }, { status: 500 });
  }
}