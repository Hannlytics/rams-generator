'use client';

import React, { useState } from 'react';
import { AlertTriangle, CheckCircle, XCircle, Wrench, Book, Shield } from 'lucide-react';

// Types
interface ComplianceRule {
  id: string;
  regulation: 'CDM' | 'COSHH' | 'RIDDOR' | 'PPE' | 'FIRE_SAFETY' | 'ASBESTOS';
  checkType: 'required_section' | 'keyword_check' | 'format_check' | 'completeness';
  field: string;
  condition: (value: any, formData: any) => boolean;
  message: string;
  autoFixTemplate: string;
  severity: 'low' | 'medium' | 'high';
  references?: string[];
}

interface ValidationResult {
  passed: boolean;
  violations: ComplianceViolation[];
  score: number;
  gptReview?: GPTReview;
}

interface ComplianceViolation {
  ruleId: string;
  field: string;
  regulation: string;
  severity: 'low' | 'medium' | 'high';
  message: string;
  suggestion: string;
  autoFixContent: string;
  references: string[];
}

interface GPTReview {
  languageScore: number;
  toneScore: number;
  completenessScore: number;
  suggestions: string[];
}

interface SmartComplianceEngineProps {
  formData: any;
  onAutoFix: (field: string, content: string) => void;
}

const SmartComplianceEngine: React.FC<SmartComplianceEngineProps> = ({ formData, onAutoFix }) => {
  const [validationResults, setValidationResults] = useState<ValidationResult | null>(null);
  const [validating, setValidating] = useState(false);
  const [expandedViolations, setExpandedViolations] = useState<Set<string>>(new Set());

  const complianceRules: ComplianceRule[] = [
    {
      id: 'CDM001',
      regulation: 'CDM',
      checkType: 'required_section',
      field: 'methodStatement',
      condition: (value) => value && value.length > 50,
      message: 'CDM 2015 requires detailed method statements for all construction work',
      autoFixTemplate: 'The work will be carried out in accordance with CDM 2015 regulations. [Specific method details to be added]. All operatives will be briefed on the safe system of work prior to commencement.',
      severity: 'high',
      references: ['CDM 2015 Regulation 8', 'HSG150 Health and safety in construction']
    },
    {
      id: 'CDM002',
      regulation: 'CDM',
      checkType: 'required_section',
      field: 'emergencyContacts',
      condition: (value) => value && value.includes('999') && value.includes('Site Manager'),
      message: 'CDM requires emergency procedures and key contacts to be documented',
      autoFixTemplate: 'Emergency Services: 999\nSite Manager: [Name] - [Number]\nFirst Aider: [Name] - [Number]\nNearest Hospital: [Name & Address]\nHSE Incident Contact: 0845 300 9923',
      severity: 'high',
      references: ['CDM 2015 Part 4']
    },
    {
      id: 'COSHH001',
      regulation: 'COSHH',
      checkType: 'keyword_check',
      field: 'scopeOfWork',
      condition: (value, formData) => {
        const hazardousKeywords = ['paint', 'adhesive', 'solvent', 'chemical', 'dust', 'fumes'];
        const hasHazardous = hazardousKeywords.some(keyword => 
          value?.toLowerCase().includes(keyword)
        );
        return !hasHazardous || (formData.controls?.includes('COSHH'));
      },
      message: 'COSHH assessment required - hazardous substances detected in scope',
      autoFixTemplate: 'COSHH Assessment completed for all hazardous substances. Safety Data Sheets (SDS) available on site. Control measures: adequate ventilation, appropriate PPE (see PPE section), spill kits available. All operatives trained in safe handling procedures.',
      severity: 'high',
      references: ['COSHH Regulations 2002', 'HSE INDG136']
    },
    {
      id: 'COSHH002',
      regulation: 'COSHH',
      checkType: 'completeness',
      field: 'controls',
      condition: (value, formData) => {
        if (formData.selectedHazards?.includes('Hazardous Substances (COSHH)')) {
          return value?.includes('ventilation') && value?.includes('PPE') && value?.includes('storage');
        }
        return true;
      },
      message: 'COSHH controls incomplete - must specify ventilation, PPE, and storage',
      autoFixTemplate: 'Ventilation: Ensure adequate natural/mechanical ventilation. PPE: Refer to PPE section for specific requirements. Storage: All chemicals stored in original containers, labeled, and secured. Incompatible substances separated.',
      severity: 'medium',
      references: ['COSHH Regulation 7 - Control Measures']
    },
    {
      id: 'RIDDOR001',
      regulation: 'RIDDOR',
      checkType: 'required_section',
      field: 'emergencyContacts',
      condition: (value) => value && (value.toLowerCase().includes('riddor') || value?.includes('HSE')),
      message: 'RIDDOR reporting procedures must be documented',
      autoFixTemplate: 'RIDDOR Reporting: Any incident resulting in >7 days absence, specified injuries, or dangerous occurrences must be reported to HSE within 15 days. Contact: HSE Incident Contact Centre 0845 300 9923 or online at www.hse.gov.uk/riddor',
      severity: 'medium',
      references: ['RIDDOR 2013', 'HSE INDG453']
    },
    {
      id: 'PPE001',
      regulation: 'PPE',
      checkType: 'completeness',
      field: 'selectedPPE',
      condition: (value, formData) => {
        const requiredPPE: string[] = [];
        if (formData.selectedHazards?.includes('Working at Height')) {
          requiredPPE.push('Fall Arrest Harness', 'Hard Hat');
        }
        if (formData.selectedHazards?.includes('Noise & Vibration')) {
          requiredPPE.push('Ear Defenders / Plugs');
        }
        return requiredPPE.every((ppe: string) => value?.includes(ppe));
      },
      message: 'PPE selection incomplete based on identified hazards',
      autoFixTemplate: 'Based on risk assessment, the following PPE is mandatory: [Auto-populated based on hazards]. All PPE must be CE marked, in good condition, and operatives trained in its use.',
      severity: 'high',
      references: ['PPE Regulations 2022', 'HSE INDG174']
    }
  ];

 const performGPTValidation = async (formData: any): Promise<GPTReview> => {
  try {
    const response = await fetch('/api/gpt-validate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData),
    });
    
    if (!response.ok) {
      throw new Error('GPT validation failed');
    }
    
    const gptReview = await response.json();
    return gptReview;
    
  } catch (error) {
    console.error('GPT Validation Error:', error);
    // Fallback to simulated scores if API fails
    return {
      languageScore: 75,
      toneScore: 75,
      completenessScore: 65,
      suggestions: [
        "GPT validation temporarily unavailable",
        "Please ensure all sections follow UK safety regulations"
      ]
    };
  }
};

  const runComplianceValidation = async () => {
    setValidating(true);
    const violations: ComplianceViolation[] = [];

    for (const rule of complianceRules) {
      const fieldValue = formData[rule.field];
      if (!rule.condition(fieldValue, formData)) {
        violations.push({
          ruleId: rule.id,
          field: rule.field,
          regulation: rule.regulation,
          severity: rule.severity,
          message: rule.message,
          suggestion: `Regulation ${rule.regulation} requires this section`,
          autoFixContent: rule.autoFixTemplate,
          references: rule.references || []
        });
      }
    }

    const gptReview = await performGPTValidation(formData);

    const totalRules = complianceRules.length;
    const passedRules = totalRules - violations.length;
    const ruleScore = (passedRules / totalRules) * 50;
    const gptScore = ((gptReview.languageScore + gptReview.toneScore + gptReview.completenessScore) / 3) * 0.5;
    const totalScore = Math.round(ruleScore + gptScore);

    const result: ValidationResult = {
      passed: violations.length === 0 && totalScore >= 80,
      violations,
      score: totalScore,
      gptReview
    };

    setValidationResults(result);
    setValidating(false);
  };

  const applyAutoFix = (violation: ComplianceViolation) => {
    onAutoFix(violation.field, violation.autoFixContent);
    setTimeout(() => runComplianceValidation(), 500);
  };

  const toggleViolation = (ruleId: string) => {
    const newExpanded = new Set(expandedViolations);
    if (newExpanded.has(ruleId)) {
      newExpanded.delete(ruleId);
    } else {
      newExpanded.add(ruleId);
    }
    setExpandedViolations(newExpanded);
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 border border-gray-200">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Shield className="w-8 h-8 text-blue-600" />
          <div>
            <h2 className="text-xl font-bold text-gray-800">Smart Compliance Engine</h2>
            <p className="text-sm text-gray-600">CDM • COSHH • RIDDOR • PPE Validator</p>
          </div>
        </div>
        <button
          onClick={runComplianceValidation}
          disabled={validating}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-blue-300 transition-colors flex items-center gap-2"
        >
          {validating ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
              Validating...
            </>
          ) : (
            <>
              <Shield className="w-4 h-4" />
              Run Compliance Check
            </>
          )}
        </button>
      </div>

      {validationResults && (
        <div className="space-y-4">
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Compliance Score</p>
                <p className="text-3xl font-bold text-gray-800">{validationResults.score}%</p>
              </div>
              <div className={`flex items-center gap-2 px-4 py-2 rounded-full ${
                validationResults.passed ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
              }`}>
                {validationResults.passed ? (
                  <>
                    <CheckCircle className="w-5 h-5" />
                    <span className="font-medium">Compliant</span>
                  </>
                ) : (
                  <>
                    <AlertTriangle className="w-5 h-5" />
                    <span className="font-medium">{validationResults.violations.length} Issues Found</span>
                  </>
                )}
              </div>
            </div>

            {validationResults.gptReview && (
              <div className="mt-4 grid grid-cols-3 gap-4">
                <div className="text-center">
                  <p className="text-xs text-gray-600">Language</p>
                  <p className="text-lg font-semibold">{validationResults.gptReview.languageScore}%</p>
                </div>
                <div className="text-center">
                  <p className="text-xs text-gray-600">Tone</p>
                  <p className="text-lg font-semibold">{validationResults.gptReview.toneScore}%</p>
                </div>
                <div className="text-center">
                  <p className="text-xs text-gray-600">Completeness</p>
                  <p className="text-lg font-semibold">{validationResults.gptReview.completenessScore}%</p>
                </div>
              </div>
            )}
          </div>

          {validationResults.violations.length > 0 && (
            <div className="space-y-2">
              <h3 className="font-semibold text-gray-800 flex items-center gap-2">
                <XCircle className="w-5 h-5 text-red-500" />
                Compliance Violations
              </h3>
              {validationResults.violations.map((violation) => (
                <div
                  key={violation.ruleId}
                  className={`border rounded-lg overflow-hidden ${
                    violation.severity === 'high' ? 'border-red-300 bg-red-50' :
                    violation.severity === 'medium' ? 'border-yellow-300 bg-yellow-50' :
                    'border-blue-300 bg-blue-50'
                  }`}
                >
                  <div 
                    className="p-4 cursor-pointer"
                    onClick={() => toggleViolation(violation.ruleId)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className={`px-2 py-1 text-xs font-semibold rounded ${
                            violation.severity === 'high' ? 'bg-red-200 text-red-800' :
                            violation.severity === 'medium' ? 'bg-yellow-200 text-yellow-800' :
                            'bg-blue-200 text-blue-800'
                          }`}>
                            {violation.regulation}
                          </span>
                          <span className="text-xs text-gray-600">
                            {violation.field.replace(/([A-Z])/g, ' $1').trim()}
                          </span>
                        </div>
                        <p className="text-sm text-gray-800 font-medium">{violation.message}</p>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          applyAutoFix(violation);
                        }}
                        className="px-3 py-1.5 bg-white border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50 flex items-center gap-1"
                      >
                        <Wrench className="w-4 h-4" />
                        Auto-Fix
                      </button>
                    </div>

                    {expandedViolations.has(violation.ruleId) && (
                      <div className="mt-3 pt-3 border-t border-gray-200">
                        <div className="bg-white rounded p-3 mb-2">
                          <p className="text-xs font-semibold text-gray-600 mb-1">Suggested Fix:</p>
                          <p className="text-sm text-gray-700 italic">{violation.autoFixContent}</p>
                        </div>
                        {violation.references.length > 0 && (
                          <div className="flex items-center gap-2">
                            <Book className="w-4 h-4 text-gray-500" />
                            <p className="text-xs text-gray-600">
                              References: {violation.references.join(' • ')}
                            </p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {validationResults.gptReview?.suggestions && validationResults.gptReview.suggestions.length > 0 && (
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
              <h3 className="font-semibold text-purple-800 mb-2 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5" />
                AI Review Suggestions
              </h3>
              <ul className="space-y-1">
                {validationResults.gptReview.suggestions.map((suggestion, index) => (
                  <li key={index} className="text-sm text-purple-700 flex items-start gap-2">
                    <span className="text-purple-500 mt-0.5">•</span>
                    <span>{suggestion}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      <div className="mt-6 pt-4 border-t border-gray-200">
        <p className="text-xs text-gray-500 flex items-center gap-1">
          <Shield className="w-3 h-3" />
          Powered by Hybrid Compliance Engine v2.0 • Supports CDM 2015, COSHH 2002, RIDDOR 2013, PPE 2022
        </p>
      </div>
    </div>
  );
};

export default SmartComplianceEngine;