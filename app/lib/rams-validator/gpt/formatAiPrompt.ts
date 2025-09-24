// app/lib/rams-validator/gpt/formatAiPrompt.ts

// Proper TypeScript interfaces
interface RamsFormData {
  projectName?: string;
  clientName?: string;
  startDate?: string;
  endDate?: string;
  duration?: string;
  jobReference?: string;
  siteAddress?: string;
  siteContactPerson?: string;
  trade?: string;
  taskType?: string;
  scopeOfWork?: string;
  methodStatement?: string;
  sequenceOfOperations?: string;
  personsAtRisk?: string;
  selectedHazards?: string[];
  customHazards?: string;
  controls?: string;
  acknowledgement?: boolean;
}

interface PromptSection {
  title: string;
  content: string;
  priority: 'high' | 'medium' | 'low';
}

interface FormattedPrompt {
  systemPrompt: string;
  userPrompt: string;
  context: PromptSection[];
  metadata: {
    projectType: string;
    hazardCount: number;
    completionLevel: number;
  };
}

interface PromptOptions {
  includeSystemContext?: boolean;
  focusAreas?: string[];
  maxTokens?: number;
  analysisType?: 'validation' | 'suggestion' | 'completion';
}

export function formatAiPrompt(
  formData: RamsFormData,
  options: PromptOptions = {}
): FormattedPrompt {
  const {
    includeSystemContext = true,
    focusAreas = [],
    analysisType = 'validation'
  } = options;

  const systemPrompt = buildSystemPrompt(analysisType, includeSystemContext);
  const userPrompt = buildUserPrompt(formData, focusAreas);
  const context = extractPromptContext(formData);
  const metadata = generateMetadata(formData);

  return {
    systemPrompt,
    userPrompt,
    context,
    metadata
  };
}

function buildSystemPrompt(
  analysisType: 'validation' | 'suggestion' | 'completion',
  includeContext: boolean
): string {
  const basePrompt = `You are an expert health and safety consultant specializing in Risk Assessment Method Statements (RAMS). Your role is to analyze construction and industrial work activities to identify risks and provide safety recommendations.`;

  const contextPrompt = includeContext ? `

Key areas of focus:
- Hazard identification and risk assessment
- Control measures and safety procedures
- Method statements and work sequences
- Personal protective equipment requirements
- Emergency procedures and contingencies
- Regulatory compliance (CDM, COSHH, etc.)` : '';

  const analysisPrompts = {
    validation: `\n\nAnalyze the provided RAMS data and identify any gaps, inconsistencies, or areas that need improvement.`,
    suggestion: `\n\nProvide specific, actionable recommendations to improve the safety and completeness of this RAMS.`,
    completion: `\n\nHelp complete missing sections of this RAMS based on the work type and identified hazards.`
  };

  return basePrompt + contextPrompt + analysisPrompts[analysisType];
}

function buildUserPrompt(formData: RamsFormData, focusAreas: string[]): string {
  const sections: string[] = [];

  // Project Information
  if (formData.projectName || formData.clientName) {
    sections.push(`PROJECT DETAILS:
- Project: ${formData.projectName || 'Not specified'}
- Client: ${formData.clientName || 'Not specified'}
- Reference: ${formData.jobReference || 'Not specified'}
- Duration: ${formData.duration || 'Not specified'}`);
  }

  // Work Details
  if (formData.trade || formData.taskType || formData.scopeOfWork) {
    sections.push(`WORK DETAILS:
- Trade: ${formData.trade || 'Not specified'}
- Task Type: ${formData.taskType || 'Not specified'}
- Scope: ${formData.scopeOfWork || 'Not specified'}`);
  }

  // Hazards
  if (formData.selectedHazards && formData.selectedHazards.length > 0) {
    const hazardList = formData.selectedHazards.join(', ');
    const customHazards = formData.customHazards ? `\n- Custom Hazards: ${formData.customHazards}` : '';
    sections.push(`IDENTIFIED HAZARDS:
- Selected: ${hazardList}${customHazards}`);
  }

  // Method Statement
  if (formData.methodStatement) {
    sections.push(`METHOD STATEMENT:
${formData.methodStatement}`);
  }

  // Sequence of Operations
  if (formData.sequenceOfOperations) {
    sections.push(`SEQUENCE OF OPERATIONS:
${formData.sequenceOfOperations}`);
  }

  // Control Measures
  if (formData.controls) {
    sections.push(`CONTROL MEASURES:
${formData.controls}`);
  }

  // Persons at Risk
  if (formData.personsAtRisk) {
    sections.push(`PERSONS AT RISK:
${formData.personsAtRisk}`);
  }

  // Focus Areas
  if (focusAreas.length > 0) {
    sections.push(`FOCUS AREAS FOR ANALYSIS:
${focusAreas.map(area => `- ${area}`).join('\n')}`);
  }

  return sections.join('\n\n');
}

function extractPromptContext(formData: RamsFormData): PromptSection[] {
  const context: PromptSection[] = [];

  // High priority context
  if (formData.selectedHazards && formData.selectedHazards.length > 0) {
    context.push({
      title: 'Hazard Profile',
      content: `${formData.selectedHazards.length} hazards identified: ${formData.selectedHazards.join(', ')}`,
      priority: 'high'
    });
  }

  if (formData.trade) {
    context.push({
      title: 'Work Type',
      content: `Trade: ${formData.trade}${formData.taskType ? `, Task: ${formData.taskType}` : ''}`,
      priority: 'high'
    });
  }

  // Medium priority context
  if (formData.siteAddress) {
    context.push({
      title: 'Location',
      content: formData.siteAddress,
      priority: 'medium'
    });
  }

  if (formData.duration) {
    context.push({
      title: 'Duration',
      content: formData.duration,
      priority: 'medium'
    });
  }

  // Low priority context
  if (formData.clientName) {
    context.push({
      title: 'Client',
      content: formData.clientName,
      priority: 'low'
    });
  }

  return context;
}

function generateMetadata(formData: RamsFormData): FormattedPrompt['metadata'] {
  const hazardCount = formData.selectedHazards ? formData.selectedHazards.length : 0;
  
  // Calculate completion level based on filled fields
  const requiredFields = [
    'projectName', 'trade', 'scopeOfWork', 'methodStatement', 
    'selectedHazards', 'controls', 'personsAtRisk'
  ];
  
  const completedFields = requiredFields.filter(field => {
    const value = formData[field as keyof RamsFormData];
    if (Array.isArray(value)) {
      return value.length > 0;
    }
    return Boolean(value);
  });
  
  const completionLevel = Math.round((completedFields.length / requiredFields.length) * 100);
  
  return {
    projectType: formData.trade || 'General',
    hazardCount,
    completionLevel
  };
}

export function createValidationPrompt(formData: RamsFormData): string {
  const formatted = formatAiPrompt(formData, { 
    analysisType: 'validation',
    focusAreas: ['Missing information', 'Safety gaps', 'Regulatory compliance']
  });
  
  return `${formatted.systemPrompt}\n\n${formatted.userPrompt}`;
}

export function createSuggestionPrompt(formData: RamsFormData, specificArea?: string): string {
  const focusAreas = specificArea ? [specificArea] : ['Safety improvements', 'Best practices', 'Risk mitigation'];
  
  const formatted = formatAiPrompt(formData, { 
    analysisType: 'suggestion',
    focusAreas
  });
  
  return `${formatted.systemPrompt}\n\n${formatted.userPrompt}`;
}

export function createCompletionPrompt(formData: RamsFormData, missingFields: string[]): string {
  const formatted = formatAiPrompt(formData, { 
    analysisType: 'completion',
    focusAreas: missingFields
  });
  
  return `${formatted.systemPrompt}\n\n${formatted.userPrompt}\n\nPlease help complete these missing sections: ${missingFields.join(', ')}`;
}