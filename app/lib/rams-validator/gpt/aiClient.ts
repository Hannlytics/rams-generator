// app/lib/rams-validator/gpt/aiClient.ts

import { createValidationPrompt, createSuggestionPrompt, createCompletionPrompt } from './formatAiPrompt';

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

interface AIConfig {
  apiKey?: string;
  model: string;
  maxTokens: number;
  temperature: number;
  timeout: number;
}

interface AIMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

interface AIRequest {
  model: string;
  messages: AIMessage[];
  max_tokens: number;
  temperature: number;
}

interface AIResponse {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: AIChoice[];
  usage: AIUsage;
}

interface AIChoice {
  index: number;
  message: AIMessage;
  finish_reason: string;
}

interface AIUsage {
  prompt_tokens: number;
  completion_tokens: number;
  total_tokens: number;
}

interface ValidationSuggestion {
  field: string;
  severity: 'low' | 'medium' | 'high';
  message: string;
  suggestion?: string;
}

interface AIAnalysisResult {
  success: boolean;
  suggestions: ValidationSuggestion[];
  analysis: string;
  confidence: number;
  tokensUsed: number;
  error?: string;
}

interface AIError {
  code: string;
  message: string;
  type: string;
}

// Default configuration
const defaultConfig: AIConfig = {
  model: 'gpt-3.5-turbo',
  maxTokens: 1000,
  temperature: 0.3,
  timeout: 30000
};

export class AIClient {
  private config: AIConfig;
  private apiKey: string;
  private baseUrl: string;

  constructor(config: Partial<AIConfig> = {}) {
    this.config = { ...defaultConfig, ...config };
    this.apiKey = this.config.apiKey || process.env.OPENAI_API_KEY || '';
    this.baseUrl = 'https://api.openai.com/v1';
    
    if (!this.apiKey) {
      console.warn('AI API key not provided. AI features will be disabled.');
    }
  }

  private async makeRequest(request: AIRequest): Promise<AIResponse> {
    if (!this.apiKey) {
      throw new Error('AI API key not configured');
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.config.timeout);

    try {
      const response = await fetch(`${this.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify(request),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`AI API Error: ${response.status} - ${errorData.error?.message || 'Unknown error'}`);
      }

      const data: AIResponse = await response.json();
      return data;
    } catch (error) {
      clearTimeout(timeoutId);
      
      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          throw new Error('AI request timed out');
        }
        throw error;
      }
      
      throw new Error('Unknown error occurred during AI request');
    }
  }

  private parseAISuggestions(content: string): ValidationSuggestion[] {
    const suggestions: ValidationSuggestion[] = [];
    
    try {
      // Try to parse as JSON first
      const parsed = JSON.parse(content);
      if (Array.isArray(parsed)) {
        return parsed.filter(this.isValidSuggestion);
      }
      if (parsed.suggestions && Array.isArray(parsed.suggestions)) {
        return parsed.suggestions.filter(this.isValidSuggestion);
      }
    } catch {
      // If JSON parsing fails, parse as text
      return this.parseTextSuggestions(content);
    }

    return suggestions;
  }

  private parseTextSuggestions(content: string): ValidationSuggestion[] {
    const suggestions: ValidationSuggestion[] = [];
    const lines = content.split('\n');
    
    let currentSuggestion: Partial<ValidationSuggestion> = {};
    
    for (const line of lines) {
      const trimmedLine = line.trim();
      
      // Look for field patterns
      if (trimmedLine.toLowerCase().includes('field:')) {
        if (currentSuggestion.field) {
          this.addParsedSuggestion(suggestions, currentSuggestion);
          currentSuggestion = {};
        }
        currentSuggestion.field = trimmedLine.split(':')[1]?.trim() || 'general';
      }
      
      // Look for severity patterns
      if (trimmedLine.toLowerCase().includes('severity:')) {
        const severity = trimmedLine.split(':')[1]?.trim().toLowerCase();
        if (severity === 'high' || severity === 'medium' || severity === 'low') {
          currentSuggestion.severity = severity;
        }
      }
      
      // Look for message patterns
      if (trimmedLine.toLowerCase().includes('message:') || trimmedLine.toLowerCase().includes('issue:')) {
        currentSuggestion.message = trimmedLine.split(':')[1]?.trim() || trimmedLine;
      }
      
      // Look for suggestion patterns
      if (trimmedLine.toLowerCase().includes('suggestion:') || trimmedLine.toLowerCase().includes('recommendation:')) {
        currentSuggestion.suggestion = trimmedLine.split(':')[1]?.trim() || trimmedLine;
      }
    }
    
    // Add the last suggestion if it exists
    this.addParsedSuggestion(suggestions, currentSuggestion);
    
    return suggestions;
  }

  private addParsedSuggestion(suggestions: ValidationSuggestion[], suggestion: Partial<ValidationSuggestion>): void {
    if (suggestion.field && suggestion.message) {
      suggestions.push({
        field: suggestion.field,
        severity: suggestion.severity || 'medium',
        message: suggestion.message,
        suggestion: suggestion.suggestion
      });
    }
  }

  private isValidSuggestion(item: unknown): item is ValidationSuggestion {
    return (
      typeof item === 'object' &&
      item !== null &&
      'field' in item &&
      'message' in item &&
      typeof (item as ValidationSuggestion).field === 'string' &&
      typeof (item as ValidationSuggestion).message === 'string'
    );
  }

  async analyzeRAMS(formData: RamsFormData, analysisType: 'validation' | 'suggestion' | 'completion' = 'validation'): Promise<AIAnalysisResult> {
    try {
      let prompt: string;
      
      switch (analysisType) {
        case 'validation':
          prompt = createValidationPrompt(formData);
          break;
        case 'suggestion':
          prompt = createSuggestionPrompt(formData);
          break;
        case 'completion':
          prompt = createCompletionPrompt(formData, []);
          break;
        default:
          prompt = createValidationPrompt(formData);
      }

      const messages: AIMessage[] = [
        {
          role: 'system',
          content: 'You are a health and safety expert analyzing RAMS documents. Provide structured feedback with specific suggestions for improvement.'
        },
        {
          role: 'user',
          content: prompt
        }
      ];

      const request: AIRequest = {
        model: this.config.model,
        messages,
        max_tokens: this.config.maxTokens,
        temperature: this.config.temperature
      };

      const response = await this.makeRequest(request);
      
      if (!response.choices || response.choices.length === 0) {
        throw new Error('No response received from AI service');
      }

      const content = response.choices[0].message.content;
      const suggestions = this.parseAISuggestions(content);
      
      return {
        success: true,
        suggestions,
        analysis: content,
        confidence: this.calculateConfidence(suggestions),
        tokensUsed: response.usage?.total_tokens || 0
      };

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      
      return {
        success: false,
        suggestions: [],
        analysis: '',
        confidence: 0,
        tokensUsed: 0,
        error: errorMessage
      };
    }
  }

  private calculateConfidence(suggestions: ValidationSuggestion[]): number {
    if (suggestions.length === 0) return 100;
    
    const severityWeights = { high: 0.3, medium: 0.6, low: 0.9 };
    const avgConfidence = suggestions.reduce((sum, suggestion) => {
      return sum + (severityWeights[suggestion.severity] || 0.5);
    }, 0) / suggestions.length;
    
    return Math.round(avgConfidence * 100);
  }

  async validateRAMS(formData: RamsFormData): Promise<AIAnalysisResult> {
    return this.analyzeRAMS(formData, 'validation');
  }

  async getSuggestions(formData: RamsFormData): Promise<AIAnalysisResult> {
    return this.analyzeRAMS(formData, 'suggestion');
  }

  async completeRAMS(formData: RamsFormData): Promise<AIAnalysisResult> {
    return this.analyzeRAMS(formData, 'completion');
  }

  isConfigured(): boolean {
    return Boolean(this.apiKey);
  }

  getConfig(): AIConfig {
    return { ...this.config };
  }

  updateConfig(newConfig: Partial<AIConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }
}

// Export singleton instance
export const aiClient = new AIClient();

// Export utility functions
export function createAIClient(config?: Partial<AIConfig>): AIClient {
  return new AIClient(config);
}

export type { 
  RamsFormData, 
  AIConfig, 
  ValidationSuggestion, 
  AIAnalysisResult, 
  AIError 
};