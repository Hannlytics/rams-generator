// components/ValidationPanel.tsx
'use client';

import { useState } from 'react';

interface Suggestion {
  field: string;
  fieldPath?: string;
  severity: 'low' | 'medium' | 'high';
  message: string;
  suggestion?: string;
  autoFixContent?: string;
  regulation?: string;
}

interface ValidationPanelProps {
  suggestions: Suggestion[];
  onAutoFix: (field: string, value: string) => void;
  onDismiss?: (index: number) => void;
}

export const ValidationPanel = ({ suggestions, onAutoFix, onDismiss }: ValidationPanelProps) => {
  const [appliedFixes, setAppliedFixes] = useState<Set<number>>(new Set());

  const handleAutoFix = (suggestion: Suggestion, index: number) => {
    if (suggestion.autoFixContent) {
      onAutoFix(suggestion.field, suggestion.autoFixContent);
      setAppliedFixes(prev => new Set(prev).add(index));
      
      // Auto-dismiss after 2 seconds
      setTimeout(() => {
        if (onDismiss) {
          onDismiss(index);
        }
      }, 2000);
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch(severity) {
      case 'high': 
        return (
          <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      case 'medium': 
        return (
          <svg className="w-5 h-5 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        );
      default: 
        return (
          <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
    }
  };

  const getSeverityStyles = (severity: string) => {
    switch(severity) {
      case 'high': 
        return 'bg-red-50 border-red-200 text-red-800';
      case 'medium': 
        return 'bg-yellow-50 border-yellow-200 text-yellow-800';
      default: 
        return 'bg-blue-50 border-blue-200 text-blue-800';
    }
  };

  if (suggestions.length === 0) {
    return (
      <div className="flex items-center gap-2 p-4 bg-green-50 border border-green-200 rounded-lg">
        <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <span className="text-green-800">All validations passed! Document is compliant.</span>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <h3 className="font-semibold text-gray-800 flex items-center gap-2">
        <svg className="w-5 h-5 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
        Compliance Validation Results
      </h3>
      
      {suggestions.map((suggestion, index) => (
        <div 
          key={index} 
          className={`p-4 border rounded-lg transition-all ${
            appliedFixes.has(index) ? 'opacity-50' : ''
          } ${getSeverityStyles(suggestion.severity)}`}
        >
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-3 flex-1">
              {getSeverityIcon(suggestion.severity)}
              
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-semibold">{suggestion.field}</span>
                  {suggestion.regulation && (
                    <span className="px-2 py-0.5 bg-gray-700 text-white text-xs rounded-full">
                      {suggestion.regulation}
                    </span>
                  )}
                </div>
                
                <p className="text-sm mb-2">{suggestion.message}</p>
                
                {suggestion.suggestion && (
                  <p className="text-sm italic">
                    💡 <strong>Suggestion:</strong> {suggestion.suggestion}
                  </p>
                )}
              </div>
            </div>

            {suggestion.autoFixContent && !appliedFixes.has(index) && (
              <button
                onClick={() => handleAutoFix(suggestion, index)}
                className="ml-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg 
                          flex items-center gap-2 text-sm font-medium transition-colors"
                type="button"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                </svg>
                Auto-Fix
              </button>
            )}
            
            {appliedFixes.has(index) && (
              <span className="ml-4 px-4 py-2 bg-green-100 text-green-700 rounded-lg 
                             flex items-center gap-2 text-sm font-medium">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Fixed!
              </span>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

// Export the Suggestion type so it can be used in other files
export type { Suggestion };