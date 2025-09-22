// app/api/validate-step/route.ts
import { NextResponse } from 'next/server';

// Import all the new, modular functions with corrected relative paths
import { validateMethodStatement } from '../../lib/rams-validator/rules/methodStatement';
import { validateCoshh } from '../../lib/rams-validator/rules/coshh';
import { getAiSuggestions } from '../../lib/rams-validator/gpt/aiClient';
import { mergeSuggestions } from '../../lib/rams-validator/utils/mergeValidation';

export async function POST(request: Request) {
  try {
    const stepData = await request.json();
    
    // --- 1. RUN ALL RULE-BASED VALIDATORS ---
    const ruleSuggestions = [
      ...validateMethodStatement(stepData),
      ...validateCoshh(stepData),
      // ...import and add other rule validators here as you create them
    ];

    // --- 2. GET AI-POWERED SUGGESTIONS ---
    const aiSuggestions = await getAiSuggestions(stepData);
    
    // --- 3. MERGE AND RETURN ALL SUGGESTIONS ---
    const allSuggestions = mergeSuggestions(ruleSuggestions, aiSuggestions);

    return NextResponse.json({ suggestions: allSuggestions });

  } catch (_error) { // FIX: Prefixed 'error' with an underscore to mark as unused
    console.error('Validation API Error:', _error);
    return NextResponse.json({ error: 'Failed to validate step' }, { status: 500 });
  }
}

