// app/api/validate-step/route.ts
import { NextResponse } from 'next/server';

// Define specific types for form data values
type FormDataValue = string | string[] | boolean | number | undefined;
type FormDataRecord = {
  [key: string]: FormDataValue;
  // Known fields with specific types
  step?: number;
  siteManager?: string;
  firstAidArrangements?: string;
  emergencyContacts?: string;
  contactNumber?: string;
  reviewedBy?: string;
  scopeOfWork?: string;
  selectedHazards?: string[] | string;
  controls?: string;
  selectedPPE?: string[] | string;
  projectName?: string;
  clientName?: string;
};

// Validation Rule interface with properly typed functions
interface ValidationRule {
  field: string;
  check: (value: FormDataValue, formData: FormDataRecord) => boolean;
  message: string;
  severity: 'low' | 'medium' | 'high';
  regulation?: string;
  autoFix?: (formData: FormDataRecord) => string | string[];
}

// Suggestion interface for validation feedback
interface Suggestion {
  field: string;
  severity: 'low' | 'medium' | 'high';
  message: string;
  suggestion?: string;
  autoFixContent?: string | string[];
  regulation?: string;
}

// Request body interface
interface ValidationRequest {
  step: number;
  formData: FormDataRecord;
  regulations?: string[];
}

// Type guards for safe type checking
function isString(value: FormDataValue): value is string {
  return typeof value === 'string';
}

function isStringArray(value: FormDataValue): value is string[] {
  return Array.isArray(value) && value.every(item => typeof item === 'string');
}

function isNumber(value: FormDataValue): value is number {
  return typeof value === 'number';
}

function isBoolean(value: FormDataValue): value is boolean {
  return typeof value === 'boolean';
}

// Helper to safely get string value
function getStringValue(value: FormDataValue): string {
  if (isString(value)) return value;
  if (isNumber(value)) return value.toString();
  if (isBoolean(value)) return value.toString();
  if (isStringArray(value)) return value.join(', ');
  return '';
}

// Helper to safely get array value
function getArrayValue(value: FormDataValue): string[] {
  if (isStringArray(value)) return value;
  if (isString(value)) return [value];
  return [];
}

// Helper to safely check if value contains a substring
function containsString(value: FormDataValue, searchString: string, caseInsensitive = false): boolean {
  const strValue = getStringValue(value);
  if (!strValue) return false;
  
  if (caseInsensitive) {
    return strValue.toLowerCase().includes(searchString.toLowerCase());
  }
  return strValue.includes(searchString);
}

// Helper to safely check array inclusion
function arrayIncludes(value: FormDataValue, searchItem: string): boolean {
  const arrValue = getArrayValue(value);
  return arrValue.includes(searchItem);
}

// CDM 2015 Validation Rules
const CDM_RULES: ValidationRule[] = [
  {
    field: 'siteManager',
    check: (value: FormDataValue): boolean => {
      const strValue = getStringValue(value);
      return strValue.length > 0;
    },
    message: 'CDM 2015 requires a designated Site Manager for all construction projects',
    severity: 'high',
    regulation: 'CDM',
    autoFix: (): string => 'TBC - To be confirmed'
  },
  {
    field: 'firstAidArrangements',
    check: (value: FormDataValue): boolean => {
      const strValue = getStringValue(value);
      return strValue.length > 20;
    },
    message: 'CDM Regulation 13 requires adequate first aid arrangements to be documented',
    severity: 'medium',
    regulation: 'CDM',
    autoFix: (formData: FormDataRecord): string => {
      const siteManager = getStringValue(formData.siteManager) || 'Site Manager';
      return `First aid kit location: Site office
Trained first aider: ${siteManager}
Nearest hospital: To be confirmed on site induction
Emergency number: 999`;
    }
  },
  {
    field: 'emergencyContacts',
    check: (value: FormDataValue): boolean => {
      return containsString(value, '999');
    },
    message: 'Emergency contacts must include UK emergency services (999)',
    severity: 'medium',
    regulation: 'CDM',
    autoFix: (formData: FormDataRecord): string => {
      const contactNumber = getStringValue(formData.contactNumber) || '[To be added]';
      return `Emergency Services: 999
Site Manager: ${contactNumber}
Client Contact: [To be added]
HSE Incident Contact: 0345 300 9923`;
    }
  },
  {
    field: 'reviewedBy',
    check: (value: FormDataValue, formData: FormDataRecord): boolean => {
      // Only required if it's final step
      if (formData.step === 6) {
        const strValue = getStringValue(value);
        return strValue.length > 0;
      }
      return true;
    },
    message: 'CDM requires review by a competent supervisor before work commences',
    severity: 'high',
    regulation: 'CDM',
    autoFix: (): string => 'Awaiting supervisor review'
  }
];

// COSHH Validation Rules
const COSHH_RULES: ValidationRule[] = [
  {
    field: 'selectedHazards',
    check: (value: FormDataValue, formData: FormDataRecord): boolean => {
      const scopeOfWork = getStringValue(formData.scopeOfWork).toLowerCase();
      const requiresCOSHH = scopeOfWork.includes('paint') ||
                           scopeOfWork.includes('chemical') ||
                           scopeOfWork.includes('adhesive') ||
                           scopeOfWork.includes('solvent');
      
      if (!requiresCOSHH) return true;
      return arrayIncludes(value, 'Hazardous Substances (COSHH)');
    },
    message: 'COSHH assessment required - hazardous substances detected in scope',
    severity: 'high',
    regulation: 'COSHH',
    autoFix: (formData: FormDataRecord): string[] => {
      const current = getArrayValue(formData.selectedHazards);
      if (!current.includes('Hazardous Substances (COSHH)')) {
        return [...current, 'Hazardous Substances (COSHH)'];
      }
      return current;
    }
  },
  {
    field: 'controls',
    check: (value: FormDataValue, formData: FormDataRecord): boolean => {
      const hasCOSHH = arrayIncludes(formData.selectedHazards, 'Hazardous Substances (COSHH)');
      if (!hasCOSHH) return true;
      return containsString(value, 'data sheet', true);
    },
    message: 'COSHH Regulation 6 requires reference to Safety Data Sheets',
    severity: 'medium',
    regulation: 'COSHH',
    autoFix: (formData: FormDataRecord): string => {
      const currentControls = getStringValue(formData.controls);
      return `${currentControls}
- All operatives to review relevant Safety Data Sheets before work
- Ensure adequate ventilation when using chemical products
- PPE as specified in product SDS to be worn at all times
- Spill kit available on site`;
    }
  },
  {
    field: 'selectedPPE',
    check: (value: FormDataValue, formData: FormDataRecord): boolean => {
      const hasCOSHH = arrayIncludes(formData.selectedHazards, 'Hazardous Substances (COSHH)');
      if (!hasCOSHH) return true;
      
      const ppeArray = getArrayValue(value);
      return ppeArray.includes('Gloves') || ppeArray.includes('Safety Glasses / Goggles');
    },
    message: 'COSHH work requires appropriate PPE (gloves and eye protection)',
    severity: 'high',
    regulation: 'COSHH',
    autoFix: (formData: FormDataRecord): string[] => {
      const current = getArrayValue(formData.selectedPPE);
      const needed: string[] = [];
      
      if (!current.includes('Gloves')) {
        needed.push('Gloves');
      }
      if (!current.includes('Safety Glasses / Goggles')) {
        needed.push('Safety Glasses / Goggles');
      }
      
      return [...current, ...needed];
    }
  }
];

// RIDDOR Validation Rules
const RIDDOR_RULES: ValidationRule[] = [
  {
    field: 'emergencyContacts',
    check: (value: FormDataValue): boolean => {
      return containsString(value, 'hse', true);
    },
    message: 'Include HSE contact for RIDDOR reportable incidents',
    severity: 'low',
    regulation: 'RIDDOR',
    autoFix: (formData: FormDataRecord): string => {
      const current = getStringValue(formData.emergencyContacts);
      if (current.toUpperCase().includes('HSE')) return current;
      
      return `${current}
HSE Incident Contact Centre: 0345 300 9923
Online reporting: www.hse.gov.uk/riddor`;
    }
  }
];

// Working at Height Regulations
const WAH_RULES: ValidationRule[] = [
  {
    field: 'selectedPPE',
    check: (value: FormDataValue, formData: FormDataRecord): boolean => {
      const hasWAH = arrayIncludes(formData.selectedHazards, 'Working at Height');
      if (!hasWAH) return true;
      
      return arrayIncludes(value, 'Fall Arrest Harness');
    },
    message: 'Working at Height Regulations require appropriate fall protection',
    severity: 'high',
    regulation: 'WAH',
    autoFix: (formData: FormDataRecord): string[] => {
      const current = getArrayValue(formData.selectedPPE);
      if (!current.includes('Fall Arrest Harness')) {
        return [...current, 'Fall Arrest Harness'];
      }
      return current;
    }
  },
  {
    field: 'controls',
    check: (value: FormDataValue, formData: FormDataRecord): boolean => {
      const hasWAH = arrayIncludes(formData.selectedHazards, 'Working at Height');
      if (!hasWAH) return true;
      
      const controlsStr = getStringValue(value).toLowerCase();
      return controlsStr.includes('scaffold') || controlsStr.includes('ladder');
    },
    message: 'Working at Height requires documented access equipment controls',
    severity: 'medium',
    regulation: 'WAH',
    autoFix: (formData: FormDataRecord): string => {
      const currentControls = getStringValue(formData.controls);
      return `${currentControls}
- All work at height to be properly planned and supervised
- Access equipment inspected before use
- Scaffolding to be erected by competent persons only
- Edge protection in place where required
- Rescue plan established before work commences`;
    }
  }
];

// Manual Handling Validation Rules
const MANUAL_HANDLING_RULES: ValidationRule[] = [
  {
    field: 'controls',
    check: (value: FormDataValue, formData: FormDataRecord): boolean => {
      const hasManualHandling = arrayIncludes(formData.selectedHazards, 'Manual Handling');
      if (!hasManualHandling) return true;
      
      return containsString(value, 'lift', true);
    },
    message: 'Manual Handling Operations require lifting technique controls',
    severity: 'medium',
    regulation: 'MHOR',
    autoFix: (formData: FormDataRecord): string => {
      const currentControls = getStringValue(formData.controls);
      return `${currentControls}
- Use mechanical aids where possible
- Two-person lift for items over 25kg
- Proper lifting techniques to be used
- Regular breaks to prevent fatigue`;
    }
  }
];

// Main POST handler
export async function POST(request: Request) {
  try {
    // Parse and validate request body
    const body = await request.json() as ValidationRequest;
    
    // Validate required fields
    if (typeof body.step !== 'number' || body.step < 0) {
      return NextResponse.json({
        success: false,
        error: 'Invalid step number',
        suggestions: [],
        complianceScore: 0
      }, { status: 400 });
    }
    
    if (!body.formData || typeof body.formData !== 'object') {
      return NextResponse.json({
        success: false,
        error: 'Invalid form data',
        suggestions: [],
        complianceScore: 0
      }, { status: 400 });
    }
    
    const { step, formData } = body;
    const regulations = body.regulations || ['CDM', 'COSHH', 'RIDDOR', 'WAH', 'MHOR'];
    
    const suggestions: Suggestion[] = [];
    
    // Combine all relevant rules based on requested regulations
    const allRules: ValidationRule[] = [];
    
    if (regulations.includes('CDM')) {
      allRules.push(...CDM_RULES);
    }
    if (regulations.includes('COSHH')) {
      allRules.push(...COSHH_RULES);
    }
    if (regulations.includes('RIDDOR')) {
      allRules.push(...RIDDOR_RULES);
    }
    if (regulations.includes('WAH')) {
      allRules.push(...WAH_RULES);
    }
    if (regulations.includes('MHOR')) {
      allRules.push(...MANUAL_HANDLING_RULES);
    }
    
    // Run validation checks
    for (const rule of allRules) {
      try {
        const fieldValue = formData[rule.field];
        
        if (!rule.check(fieldValue, { ...formData, step })) {
          const suggestion: Suggestion = {
            field: rule.field,
            severity: rule.severity,
            message: rule.message,
            regulation: rule.regulation,
            suggestion: `This is a ${rule.severity === 'high' ? 'mandatory' : 'recommended'} requirement under ${rule.regulation || 'safety'} regulations`
          };
          
          if (rule.autoFix) {
            try {
              suggestion.autoFixContent = rule.autoFix(formData);
            } catch (autoFixError) {
              console.warn(`AutoFix failed for field ${rule.field}:`, autoFixError);
            }
          }
          
          suggestions.push(suggestion);
        }
      } catch (ruleError) {
        console.warn(`Validation rule failed for field ${rule.field}:`, ruleError);
        // Continue with other rules even if one fails
      }
    }
    
    // Step-specific validations
    if (step === 1) {
      // Project Information validations
      const projectName = getStringValue(formData.projectName);
      if (projectName.length < 3) {
        suggestions.push({
          field: 'projectName',
          severity: 'high',
          message: 'Project name is required and must be at least 3 characters',
          autoFixContent: 'Construction Project - ' + new Date().toLocaleDateString('en-GB')
        });
      }
      
      const clientName = getStringValue(formData.clientName);
      if (clientName.length === 0) {
        suggestions.push({
          field: 'clientName',
          severity: 'high',
          message: 'Client name is required for legal documentation',
          autoFixContent: 'TBC - To be confirmed'
        });
      }
    }
    
    // Calculate compliance score
    const highSeverityCount = suggestions.filter(s => s.severity === 'high').length;
    const mediumSeverityCount = suggestions.filter(s => s.severity === 'medium').length;
    const lowSeverityCount = suggestions.filter(s => s.severity === 'low').length;
    
    const complianceScore = Math.max(
      0,
      100 - (highSeverityCount * 20) - (mediumSeverityCount * 10) - (lowSeverityCount * 5)
    );
    
    return NextResponse.json({
      success: true,
      suggestions,
      complianceScore,
      summary: {
        high: highSeverityCount,
        medium: mediumSeverityCount,
        low: lowSeverityCount,
        total: suggestions.length
      }
    });
    
  } catch (error) {
    console.error('Validation error:', error);
    
    // Determine error message
    let errorMessage = 'Validation failed';
    if (error instanceof SyntaxError) {
      errorMessage = 'Invalid JSON in request body';
    } else if (error instanceof Error) {
      errorMessage = error.message;
    }
    
    return NextResponse.json({
      success: false,
      error: errorMessage,
      suggestions: [],
      complianceScore: 0
    }, { status: 500 });
  }
}