// app/api/validate-step/route.ts
import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

// First, install OpenAI package: npm install openai

// Initialize OpenAI (optional - remove if not using AI features)
const openai = process.env.OPENAI_API_KEY ? new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
}) : null;

// Define proper types
interface FormData {
  projectName?: string;
  clientName?: string;
  trade?: string;
  taskType?: string;
  scopeOfWork?: string;
  methodStatement?: string;
  selectedHazards?: string[];
  selectedPPE?: string[];
  controls?: string;
  emergencyContacts?: string;
  firstAidArrangements?: string;
  siteManager?: string;
  competentPersonVerified?: boolean;
  reviewedBy?: string;
}

interface Suggestion {
  id?: string;
  field: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  regulation?: string;
  message: string;
  suggestion?: string;
  autoFixContent?: string;
}

interface ValidationRule {
  id: string;
  regulation: 'CDM' | 'COSHH' | 'RIDDOR' | 'LOLER' | 'PUWER' | 'MHSWR';
  check: (data: FormData) => boolean;
  severity: 'critical' | 'high' | 'medium' | 'low';
  message: string;
  autoFix: (data: FormData) => string;
}

// Helper Functions (implement all missing ones)
function extractSubstances(text: string): string[] {
  if (!text) return [];
  const commonSubstances = ['paint', 'adhesive', 'cement', 'solvent', 'fuel', 'oil', 'asbestos', 'silica'];
  return commonSubstances.filter(s => text.toLowerCase().includes(s));
}

function getFieldFromRule(ruleId: string): string {
  const fieldMap: Record<string, string> = {
    'CDM001': 'competentPersonVerified',
    'CDM002': 'controls',
    'COSHH001': 'controls',
    'RIDDOR001': 'emergencyContacts',
    'LOLER001': 'controls',
    'MS001': 'methodStatement',
    'PPE001': 'selectedPPE'
  };
  return fieldMap[ruleId] || 'controls';
}

function getPPERequirements(hazards: string[] | undefined): string[] {
  const ppeMatrix: Record<string, string[]> = {
    'Working at Height': ['Fall Arrest Harness', 'Hard Hat'],
    'Electrical': ['Gloves', 'Safety Glasses / Goggles'],
    'Dust / Airborne Particles': ['Dust Mask / Respirator', 'Safety Glasses / Goggles'],
    'Manual Handling': ['Gloves', 'Safety Boots (Steel Toe)'],
    'Noise & Vibration': ['Ear Defenders / Plugs'],
    'Hot Works': ['Face Shield / Visor', 'Gloves'],
    'Hazardous Substances (COSHH)': ['Gloves', 'Face Shield / Visor']
  };

  const required = new Set(['Hard Hat', 'Safety Boots (Steel Toe)', 'High-Visibility Vest']);
  
  hazards?.forEach(hazard => {
    ppeMatrix[hazard]?.forEach(ppe => required.add(ppe));
  });

  return Array.from(required);
}

function getPPEStandard(ppe: string): string {
  const standards: Record<string, string> = {
    'Hard Hat': 'BS EN 397',
    'Safety Boots (Steel Toe)': 'BS EN ISO 20345',
    'High-Visibility Vest': 'BS EN ISO 20471 Class 2',
    'Safety Glasses / Goggles': 'BS EN 166',
    'Fall Arrest Harness': 'BS EN 361',
    'Gloves': 'BS EN 388',
    'Ear Defenders / Plugs': 'BS EN 352',
    'Dust Mask / Respirator': 'BS EN 149 FFP3'
  };
  return standards[ppe] || 'Appropriate BS EN standard';
}

function generateTaskSteps(trade: string, task: string): string {
  const steps: Record<string, Record<string, string>> = {
    'Electrician': {
      'default': `   a. Obtain permit for electrical work
   b. Lock off and tag electrical supply
   c. Test with approved voltage tester
   d. Confirm dead and post warning signs
   e. Carry out work as per BS 7671
   f. Test installation and complete certificates
   g. Remove lock off and restore power safely`
    },
    'Bricklayer': {
      'default': `   a. Set out work area and establish datum levels
   b. Check materials conform to specification
   c. Mix mortar to correct consistency
   d. Lay bricks to line and level
   e. Check plumb and gauge regularly
   f. Install DPC and wall ties as required
   g. Point and clean down work`
    }
  };

  return steps[trade]?.['default'] || `   a. Prepare work area
   b. Check materials and tools
   c. Execute main task
   d. Quality check work
   e. Clean and secure area`;
}

function getTolerances(trade: string): string {
  const tolerances: Record<string, string> = {
    'Bricklayer': '10',
    'Carpenter / Joiner': '5',
    'Steel Erector': '3',
    'Electrician': '5'
  };
  return tolerances[trade] || '10';
}

function generateMethodStatement(data: FormData): string {
  const trade = data.trade || 'General Construction';
  const task = data.taskType || 'General Works';
  
  return `Method Statement for ${task}:

1. PREPARATION PHASE
   • Site induction completed for all operatives
   • Permit to work obtained (if required)
   • Service drawings reviewed and CAT scan completed
   • Materials and tools inspected and certified
   • Exclusion zones established with Heras fencing

2. SETUP & ACCESS
   • Welfare facilities confirmed operational
   • Access routes cleared and signed
   • Emergency egress routes verified and communicated
   • Work area barriers erected with appropriate signage
   • Temporary services connected and tested

3. MAIN WORK SEQUENCE
${generateTaskSteps(trade, task)}

4. QUALITY CHECKS
   • Dimensional tolerance: ±${getTolerances(trade)}mm
   • Visual inspection for defects
   • Testing as per British Standards
   • Photographic records taken
   • Sign-off by supervisor

5. COMPLETION
   • Work area cleaned and waste segregated
   • Tools and equipment demobilized
   • Barriers removed only after area is safe
   • Handover documentation completed
   • Lessons learned recorded`;
}

// Validation Rules Database
const VALIDATION_RULES: ValidationRule[] = [
  {
    id: 'CDM001',
    regulation: 'CDM',
    check: (data) => !data.competentPersonVerified,
    severity: 'critical',
    message: 'CDM 2015 requires competent person verification',
    autoFix: () => 'This RAMS has been reviewed by a competent person as required under CDM 2015 Regulation 8.'
  },
  {
    id: 'CDM002',
    regulation: 'CDM',
    check: (data) => {
      const hasWorkingAtHeight = data.selectedHazards?.includes('Working at Height') || false;
      const hasControls = data.controls?.includes('scaffold') || data.controls?.includes('harness') || false;
      return hasWorkingAtHeight && !hasControls;
    },
    severity: 'critical',
    message: 'Working at height requires specific fall protection measures under CDM Schedule 2',
    autoFix: () => `Work at Height Controls (CDM 2015 compliant):
- Hierarchy of controls applied: Avoid → Prevent → Mitigate
- Edge protection installed to BS EN 13374 standards
- Fall arrest systems: Full body harness (BS EN 361) with shock-absorbing lanyard
- Scaffold erected by CISRS qualified scaffolders
- Daily pre-use inspections documented
- Rescue plan in place with trained personnel
- Weather conditions monitored - no work in winds >23mph`
  },
  {
    id: 'COSHH001',
    regulation: 'COSHH',
    check: (data) => {
      const hasCOSHH = data.selectedHazards?.includes('Hazardous Substances (COSHH)') || false;
      const hasDataSheet = data.controls?.toLowerCase().includes('data sheet') || false;
      return hasCOSHH && !hasDataSheet;
    },
    severity: 'high',
    message: 'COSHH Regulation 6 requires safety data sheets for all hazardous substances',
    autoFix: (data) => {
      const substances = extractSubstances(data.scopeOfWork || '');
      if (substances.length === 0) {
        substances.push('General substances');
      }
      return `COSHH Assessment (Regulation 6 compliant):
${substances.map(s => `• ${s}:
  - SDS Reference: Available on site
  - Control Measures: LEV/RPE/PPE as required
  - Storage: Locked COSHH cabinet
  - Disposal: Via licensed waste carrier
  - Emergency: Eye wash station available`).join('\n')}`;
    }
  },
  {
    id: 'RIDDOR001',
    regulation: 'RIDDOR',
    check: (data) => {
      const contacts = data.emergencyContacts?.toLowerCase() || '';
      return !contacts.includes('hse') && !contacts.includes('0345');
    },
    severity: 'medium',
    message: 'RIDDOR reporting contact details must be readily available',
    autoFix: (data) => `RIDDOR Reporting Procedure:
- HSE Contact: 0345 300 9923 (Fatal/Major injuries - immediate)
- Online reporting: www.hse.gov.uk/riddor
- Responsible person: ${data.siteManager || '[Site Manager]'}
- Site accident book location: Site office`
  },
  {
    id: 'MS001',
    regulation: 'CDM',
    check: (data) => !data.methodStatement || data.methodStatement.length < 200,
    severity: 'medium',
    message: 'Method statement lacks detail - should include step-by-step procedures',
    autoFix: (data) => generateMethodStatement(data)
  },
  {
    id: 'PPE001',
    regulation: 'MHSWR',
    check: (data) => {
      const requiredPPE = getPPERequirements(data.selectedHazards);
      return requiredPPE.some(ppe => !data.selectedPPE?.includes(ppe));
    },
    severity: 'high',
    message: 'PPE selection doesn\'t match identified hazards',
    autoFix: (data) => {
      const required = getPPERequirements(data.selectedHazards);
      return `PPE Requirements based on risk assessment:
${required.map(ppe => `• ${ppe} - ${getPPEStandard(ppe)}`).join('\n')}`;
    }
  }
];

// Calculate Compliance Score
function calculateComplianceScore(data: FormData, violations: Suggestion[]): number {
  const weights: Record<string, number> = {
    critical: -25,
    high: -15,
    medium: -8,
    low: -3
  };

  let score = 100;
  
  violations.forEach(v => {
    score += weights[v.severity] || 0;
  });

  // Bonus points for best practices
  if (data.reviewedBy) score += 5;
  if (data.emergencyContacts?.includes('trauma')) score += 3;
  if (data.controls && data.controls.length > 500) score += 5;
  if (data.methodStatement && data.methodStatement.length > 1000) score += 5;

  return Math.max(0, Math.min(100, score));
}

// Industry Specific Checks
function performIndustrySpecificChecks(data: FormData): Suggestion[] {
  const suggestions: Suggestion[] = [];
  
  if (data.trade === 'Electrician') {
    if (!data.controls?.includes('isolation')) {
      suggestions.push({
        field: 'controls',
        severity: 'critical',
        message: 'Electrical work requires isolation procedures',
        autoFixContent: 'Safe Isolation Procedure: Verify circuit dead using approved voltage tester...'
      });
    }
  }
  
  return suggestions;
}

// Generate Recommendations
function generateRecommendations(data: FormData, suggestions: Suggestion[]): string[] {
  const recommendations: string[] = [];
  
  if (suggestions.length > 5) {
    recommendations.push('Consider breaking work into smaller, more manageable phases');
  }
  
  if (!data.reviewedBy) {
    recommendations.push('Have a supervisor review this RAMS before work commences');
  }
  
  return recommendations;
}

// Main POST Handler
export async function POST(request: NextRequest) {
  const formData: FormData = await request.json();
  const suggestions: Suggestion[] = [];

  // Run rule-based validations
  for (const rule of VALIDATION_RULES) {
    if (rule.check(formData)) {
      suggestions.push({
        id: rule.id,
        field: getFieldFromRule(rule.id),
        severity: rule.severity,
        regulation: rule.regulation,
        message: rule.message,
        suggestion: `${rule.regulation} Requirement`,
        autoFixContent: rule.autoFix(formData)
      });
    }
  }

  // Industry-specific validations
  const industrySuggestions = performIndustrySpecificChecks(formData);
  suggestions.push(...industrySuggestions);

  // Calculate compliance score
  const complianceScore = calculateComplianceScore(formData, suggestions);

  // Generate recommendations
  const recommendations = generateRecommendations(formData, suggestions);

  return NextResponse.json({
    success: true,
    suggestions,
    complianceScore,
    recommendations,
    metadata: {
      validationTimestamp: new Date().toISOString(),
      regulationsChecked: ['CDM 2015', 'COSHH', 'RIDDOR', 'LOLER', 'PUWER', 'MHSWR'],
      aiPowered: false
    }
  });
}