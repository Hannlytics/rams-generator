'use client';
import { useState, ChangeEvent, useRef, useEffect } from 'react';
import AddressLookup from '../components/AddressLookup';
import LegalDisclaimer from '../components/LegalDisclaimer';
import { EducationalTooltip } from '../components/EducationalTooltips';
import CompetencyChecker from '../components/CompetencyChecker';
import { ResponsibleAIBanner } from '../components/ResponsibleAIBanner';

// --- TYPE DEFINITIONS ---
interface Suggestion {
  field: string;
  severity: 'low' | 'medium' | 'high';
  message: string;
  suggestion?: string;
  autoFixContent?: string;
}

interface SpeechRecognitionResult {
  [index: number]: SpeechRecognitionAlternative;
  length: number;
}

interface SpeechRecognitionAlternative {
  transcript: string;
  confidence: number;
}

interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList;
}

interface SpeechRecognitionResultList {
  [index: number]: SpeechRecognitionResult;
  length: number;
}

export interface RamsFormData {
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
  selectedPPE?: string[];
  controls?: string;
  specialEquipment?: string;
  toolingSafety?: string;
  signageAndBarriers?: string;
  firstAidArrangements?: string;
  firePrecautions?: string;
  emergencyContacts?: string;
  siteManager?: string;
  contactNumber?: string;
  preparedBy?: string;
  reviewedBy?: string;
  reviewDate?: string;
  revisionNumber?: string;
  acknowledgement?: boolean;
  aiGenerated?: boolean;
  competentPersonVerified?: boolean;
}

interface APIResponse {
  success?: boolean;
  suggestions?: Suggestion[];
  formData?: Partial<RamsFormData>;
  error?: string;
}

interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start(): void;
  stop(): void;
  abort(): void;
}

declare global {
  interface Window {
    SpeechRecognition: new () => SpeechRecognition;
    webkitSpeechRecognition: new () => SpeechRecognition;
  }
}

// --- CONSTANTS ---
const TRADES: string[] = [
    'General Builder', 'Electrician', 'Plumber', 'Bricklayer', 'Carpenter / Joiner', 
    'Painter & Decorator', 'Plasterer', 'Roofing Contractor', 'Groundworker', 'Scaffolder', 
    'Demolition Operative', 'Steel Erector', 'Floor Layer', 'Glazier', 'Tiler', 
    'Dryliner / Ceiling Fixer', 'Landscaper', 'HVAC Engineer', 'Cleaner (Post-construction)'
];

const TASK_TYPES: Record<string, string[]> = {
    'General Builder': ['Small Extension', 'Refurbishment', 'Structural Repairs', 'General Maintenance'],
    'Electrician': ['EICR', 'PAT Testing', 'New Circuit Installation', 'Fault Finding'],
    'Plumber': ['Leak Repair', 'Central Heating Maintenance', 'Drainage', 'Gas Safety Certificate'],
    'Carpenter / Joiner': ['First Fix (Studwork)', 'Second Fix (Doors, Skirting)', 'Roof Trusses', 'Custom Joinery'],
};

const COMMON_HAZARDS: string[] = [
    "Working at Height", "Electrical", "Manual Handling", "Power Tools / Equipment", 
    "Hazardous Substances (COSHH)", "Slips, Trips and Falls", "Noise & Vibration", 
    "Dust / Airborne Particles", "Hot Works", "Confined Spaces", "Lone Working", 
    "Vehicular Movement", "Fire / Emergency Risks", "Public Interface", "Other / Custom Hazards"
];

const PPE_OPTIONS: string[] = [
    'Hard Hat', 'Safety Boots (Steel Toe)', 'High-Visibility Vest', 'Safety Glasses / Goggles', 
    'Gloves', 'Ear Defenders / Plugs', 'Dust Mask / Respirator', 'Fall Arrest Harness', 
    'Face Shield / Visor', 'Coveralls / Protective Suit', 'Knee Pads', 'Welding Shield', 
    'Thermal Gear / Waterproofs', 'Life Jacket'
];

const TOTAL_STEPS: number = 6;

// --- ENHANCED AI COPILOT COMPONENT ---
const EnhancedAICopilot = ({ onGenerate, loading }: { onGenerate: (prompt: string) => void; loading: boolean }) => {
  const [prompt, setPrompt] = useState<string>('');
  const [isListening, setIsListening] = useState<boolean>(false);
  const [chatHistory, setChatHistory] = useState<Array<{role: 'user' | 'assistant', content: string}>>([]);
  const [showChat, setShowChat] = useState<boolean>(false);
  const recognitionRef = useRef<SpeechRecognition | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined' && (window.SpeechRecognition || window.webkitSpeechRecognition)) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      
      if (recognitionRef.current) {
        recognitionRef.current.continuous = true;
        recognitionRef.current.interimResults = true;
        recognitionRef.current.lang = 'en-GB';

        recognitionRef.current.addEventListener('result', (event: Event) => {
          const speechEvent = event as SpeechRecognitionEvent;
          const transcript = Array.from(speechEvent.results)
            .map((result: SpeechRecognitionResult) => result[0].transcript)
            .join('');
          setPrompt(transcript);
        });

        recognitionRef.current.addEventListener('end', () => {
          setIsListening(false);
        });
      }
    }
  }, []);

  const toggleVoiceInput = (): void => {
    if (!recognitionRef.current) {
      alert('Speech recognition not supported in this browser');
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      recognitionRef.current.start();
      setIsListening(true);
    }
  };

  const handleGenerateClick = async (): Promise<void> => {
    if (prompt.trim()) {
      setChatHistory(prev => [...prev, { role: 'user', content: prompt }]);
      
      try {
        await onGenerate(prompt);
        setChatHistory(prev => [...prev, { role: 'assistant', content: 'RAMS draft generated! Please review all content carefully before use.' }]);
      } catch (error) {
        console.error('Generation error:', error);
        setChatHistory(prev => [...prev, { role: 'assistant', content: 'Error generating content. Please try again.' }]);
      }
      
      setPrompt('');
    }
  };

  // Updated to 12 prompts
  const quickPrompts = [
    "Create RAMS for bricklaying on scaffolding",
    "Generate electrical work safety procedures",
    "What PPE needed for demolition work?",
    "RIDDOR requirements for injury reporting",
    "COSHH assessment for adhesives",
    "Working at height risk assessment",
    "Asbestos removal procedures",
    "Manual handling assessment",
    "Confined space entry protocols",
    "Hot works permit requirements",
    "Excavation and trenching safety",
    "Temporary works coordination"
  ];

  return (
    <div className="bg-white p-6 rounded-lg shadow-lg mb-8 border border-blue-200">
      <ResponsibleAIBanner />
      
      <div className="flex justify-between items-center mb-4">
        <label className="block text-lg font-bold text-gray-800">
          AI RAMS Drafting Assistant
        </label>
        <button
          onClick={() => setShowChat(!showChat)}
          className="text-sm text-blue-600 hover:text-blue-800"
        >
          {showChat ? 'Hide Chat' : 'Show Chat History'}
        </button>
      </div>

      {showChat && chatHistory.length > 0 && (
        <div className="mb-4 p-4 bg-gray-50 rounded-lg max-h-60 overflow-y-auto">
          {chatHistory.map((message, index) => (
            <div
              key={index}
              className={`mb-2 p-2 rounded ${
                message.role === 'user' 
                  ? 'bg-blue-100 text-blue-800 ml-8' 
                  : 'bg-green-100 text-green-800 mr-8'
              }`}
            >
              <strong>{message.role === 'user' ? 'You:' : 'AI:'}</strong> {message.content}
            </div>
          ))}
        </div>
      )}

      <div className="mb-4">
        <p className="text-sm font-medium text-gray-600 mb-2">Common requests:</p>
        {/* Changed to grid layout for 3 columns */}
        <div className="grid grid-cols-3 gap-2">
          {quickPrompts.map((quickPrompt, index) => (
            <button
              key={index}
              onClick={() => setPrompt(quickPrompt)}
              className="px-3 py-2 text-xs bg-gray-100 hover:bg-gray-200 rounded-full border text-center"
              disabled={loading}
            >
              {quickPrompt}
            </button>
          ))}
        </div>
      </div>

      <div className="flex gap-2 mb-4">
        <input
          type="text"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && !loading && handleGenerateClick()}
          placeholder="Describe the work or ask about safety requirements..."
          className="flex-grow px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
          disabled={loading}
        />
        
        <button
          type="button"
          onClick={toggleVoiceInput}
          disabled={loading}
          className={`px-4 py-3 rounded-lg border ${
            isListening 
              ? 'bg-red-500 text-white animate-pulse' 
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          {isListening ? 'Stop' : 'Voice'}
        </button>

        <button
          type="button"
          onClick={handleGenerateClick}
          disabled={loading || !prompt.trim()}
          className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 disabled:bg-blue-300"
        >
          {loading ? 'Generating...' : 'Draft RAMS'}
        </button>
      </div>

      <div className="text-xs text-gray-500 space-y-1">
        <p>This AI assistant helps draft initial RAMS content. All output requires professional review.</p>
        <p className="font-semibold">Remember: You remain legally responsible for all safety assessments under CDM 2015.</p>
      </div>
    </div>
  );
};

// --- MAIN PAGE COMPONENT ---
export default function NewRamsPage() {
  const [step, setStep] = useState<number>(1);
  const [formData, setFormData] = useState<RamsFormData>({ revisionNumber: '1' });
  const [loading, setLoading] = useState<boolean>(false);
  const [validating, setValidating] = useState<boolean>(false);
  const [copilotLoading, setCopilotLoading] = useState<boolean>(false);
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [competentPersonVerified, setCompetentPersonVerified] = useState<boolean>(false);
  const [legalTermsAccepted, setLegalTermsAccepted] = useState<boolean>(false);

  const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>): void => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      const { checked } = e.target as HTMLInputElement;
      
      const isMultiSelect = name === 'selectedHazards' || name === 'selectedPPE';

      if (isMultiSelect) {
        const currentValues = (formData[name as keyof RamsFormData] as string[]) || [];
        if (checked) {
          setFormData(prev => ({ ...prev, [name]: [...currentValues, value] }));
        } else {
          setFormData(prev => ({ ...prev, [name]: currentValues.filter((item: string) => item !== value) }));
        }
      } else {
        setFormData(prev => ({ ...prev, [name]: checked }));
      }
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleCopilotGenerate = async (prompt: string): Promise<void> => {
    setCopilotLoading(true);
    try {
      const response = await fetch('/api/copilot-generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt }),
      });
      const result: APIResponse = await response.json();
      if (result.success && result.formData) {
        setFormData(prev => ({
          ...prev, 
          ...result.formData,
          aiGenerated: true,
          competentPersonVerified: competentPersonVerified
        }));
        setStep(2);
      }
    } catch (error) {
      console.error("AI generation failed:", error);
    } finally {
      setCopilotLoading(false);
    }
  };

  const handleValidation = async (): Promise<void> => {
    setValidating(true);
    setSuggestions([]);
    try {
      const response = await fetch('/api/validate-step', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const result: APIResponse = await response.json();
      if (result.suggestions) {
        setSuggestions(result.suggestions);
      }
    } catch (error) {
      console.error("Validation failed:", error);
    } finally {
      setValidating(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await fetch('/api/generate-rams', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const result = await response.json();
      
      if (result.success) {
        console.log('RAMS generated successfully');
      }
    } catch (error) {
      console.error('Form submission failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const nextStep = (): void => setStep(prev => Math.min(prev + 1, TOTAL_STEPS));
  const prevStep = (): void => setStep(prev => Math.max(prev - 1, 1));

  // Show competency checker and legal disclaimer first
  if (!competentPersonVerified || !legalTermsAccepted) {
    return (
      <main className="p-8 max-w-4xl mx-auto bg-gray-50 min-h-screen">
        <h1 className="text-3xl font-bold mb-6 text-center">HANNLYTICS RAMS Generator</h1>
        <p className="text-center text-gray-600 mb-8">Professional Risk Assessment & Method Statement Tool</p>
        
        {!competentPersonVerified && (
          <CompetencyChecker onVerified={setCompetentPersonVerified} />
        )}
        
        {competentPersonVerified && !legalTermsAccepted && (
          <LegalDisclaimer 
            onAccept={() => setLegalTermsAccepted(true)} 
          />
        )}
      </main>
    );
  }

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <div>
            <h2 className="text-xl font-semibold mb-4">Project Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input 
                name="projectName" 
                value={formData.projectName || ''} 
                placeholder="Project Name *" 
                onChange={handleInputChange} 
                className="w-full px-4 py-2 border rounded" 
              />
              <input 
                name="clientName" 
                value={formData.clientName || ''} 
                placeholder="Client Name *" 
                onChange={handleInputChange} 
                className="w-full px-4 py-2 border rounded" 
              />
              <input 
                name="startDate" 
                value={formData.startDate || ''} 
                type="date" 
                onChange={handleInputChange} 
                className="w-full px-4 py-2 border rounded" 
              />
              <input 
                name="endDate" 
                value={formData.endDate || ''} 
                type="date" 
                onChange={handleInputChange} 
                className="w-full px-4 py-2 border rounded" 
              />
              <input 
                name="duration" 
                value={formData.duration || ''} 
                placeholder="Duration (e.g., 5 days)" 
                onChange={handleInputChange} 
                className="w-full px-4 py-2 border rounded" 
              />
              <input 
                name="jobReference" 
                value={formData.jobReference || ''} 
                placeholder="Job Reference" 
                onChange={handleInputChange} 
                className="w-full px-4 py-2 border rounded" 
              />
            </div>
            <AddressLookup 
              value={formData.siteAddress || ''} 
              onChange={(addr) => setFormData({...formData, siteAddress: addr})} 
            />
            <input 
              name="siteContactPerson" 
              value={formData.siteContactPerson || ''} 
              placeholder="Site Contact Person" 
              onChange={handleInputChange} 
              className="w-full mt-4 px-4 py-2 border rounded" 
            />
          </div>
        );

      case 2:
        return (
          <div>
            <h2 className="text-xl font-semibold mb-4">Work Details</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <select name="trade" value={formData.trade || ''} onChange={handleInputChange} className="w-full px-4 py-2 border rounded">
                <option value="">Select trade...</option>
                {TRADES.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
              <select name="taskType" value={formData.taskType || ''} onChange={handleInputChange} className="w-full px-4 py-2 border rounded">
                <option value="">Select task...</option>
                {formData.trade && TASK_TYPES[formData.trade]?.map(task => <option key={task} value={task}>{task}</option>)}
              </select>
            </div>
            <textarea 
              name="scopeOfWork" 
              value={formData.scopeOfWork || ''} 
              placeholder="Scope of Work *" 
              onChange={handleInputChange} 
              className="w-full mt-4 px-4 py-2 border rounded" 
              rows={3}
            />
            <textarea 
              name="methodStatement" 
              value={formData.methodStatement || ''} 
              placeholder="Method Statement (Step-by-step description)" 
              onChange={handleInputChange} 
              className="w-full mt-4 px-4 py-2 border rounded" 
              rows={4}
            />
          </div>
        );

      case 3:
        return (
          <div>
            <h2 className="text-xl font-semibold mb-4">Risk Assessment</h2>
            <input 
              name="personsAtRisk" 
              value={formData.personsAtRisk || ''} 
              placeholder="Persons at Risk" 
              onChange={handleInputChange} 
              className="w-full mb-4 px-4 py-2 border rounded" 
            />
            <label className="block text-sm font-medium mb-2">
              Identified Hazards (select all that apply) - 
              <EducationalTooltip term="CDM">CDM 2015</EducationalTooltip> requires comprehensive hazard identification
            </label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mb-4">
              {COMMON_HAZARDS.map(hazard => (
                <label key={hazard} className="flex items-center">
                  <input 
                    type="checkbox" 
                    name="selectedHazards" 
                    value={hazard} 
                    checked={formData.selectedHazards?.includes(hazard)} 
                    onChange={handleInputChange} 
                    className="mr-2" 
                  />
                  <span className="text-sm">{hazard}</span>
                </label>
              ))}
            </div>
          </div>
        );

      case 4:
        return (
          <div>
            <h2 className="text-xl font-semibold mb-4">
              <EducationalTooltip term="PPE">PPE</EducationalTooltip> & Control Measures
            </h2>
            <label className="block text-sm font-medium mb-2">PPE Requirements</label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mb-4">
              {PPE_OPTIONS.map(ppe => (
                <label key={ppe} className="flex items-center">
                  <input 
                    type="checkbox" 
                    name="selectedPPE" 
                    value={ppe} 
                    checked={formData.selectedPPE?.includes(ppe)} 
                    onChange={handleInputChange} 
                    className="mr-2" 
                  />
                  <span className="text-sm">{ppe}</span>
                </label>
              ))}
            </div>
            <textarea 
              name="controls" 
              value={formData.controls || ''} 
              placeholder="Control Measures *" 
              onChange={handleInputChange} 
              className="w-full mt-4 px-4 py-2 border rounded" 
              rows={4}
            />
          </div>
        );

      case 5:
        return (
          <div>
            <h2 className="text-xl font-semibold mb-4">Emergency Planning</h2>
            <textarea 
              name="firstAidArrangements" 
              value={formData.firstAidArrangements || ''} 
              placeholder="First Aid Arrangements" 
              onChange={handleInputChange} 
              className="w-full mt-4 px-4 py-2 border rounded" 
              rows={3}
            />
            <textarea 
              name="firePrecautions" 
              value={formData.firePrecautions || ''} 
              placeholder="Fire Precautions" 
              onChange={handleInputChange} 
              className="w-full mt-4 px-4 py-2 border rounded" 
              rows={3}
            />
            <textarea 
              name="emergencyContacts" 
              value={formData.emergencyContacts || ''} 
              placeholder="Emergency Contacts" 
              onChange={handleInputChange} 
              className="w-full mt-4 px-4 py-2 border rounded" 
              rows={3}
            />
          </div>
        );

      case 6:
        return (
          <div>
            <h2 className="text-xl font-semibold mb-4">Review & Sign-off</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input 
                name="siteManager" 
                value={formData.siteManager || ''} 
                placeholder="Site Manager *" 
                onChange={handleInputChange} 
                className="w-full px-4 py-2 border rounded" 
              />
              <input 
                name="contactNumber" 
                value={formData.contactNumber || ''} 
                placeholder="Contact Number *" 
                onChange={handleInputChange} 
                className="w-full px-4 py-2 border rounded" 
              />
              <input 
                name="preparedBy" 
                value={formData.preparedBy || ''} 
                placeholder="Prepared By" 
                onChange={handleInputChange} 
                className="w-full px-4 py-2 border rounded" 
              />
              <input 
                name="reviewedBy" 
                value={formData.reviewedBy || ''} 
                placeholder="Reviewed By (Supervisor)" 
                onChange={handleInputChange} 
                className="w-full px-4 py-2 border rounded" 
              />
            </div>
            <label className="flex items-center mt-4">
              <input 
                type="checkbox" 
                name="acknowledgement" 
                checked={formData.acknowledgement || false} 
                onChange={handleInputChange} 
                className="mr-2" 
              />
              <span className="text-sm">
                I acknowledge this RAMS has been reviewed by a competent person and complies with 
                <EducationalTooltip term="CDM"> CDM 2015</EducationalTooltip> requirements.
              </span>
            </label>
          </div>
        );

      default:
        return null;
    }
  };
  
  return (
    <main className="p-8 max-w-4xl mx-auto bg-gray-50 min-h-screen">
      <h1 className="text-3xl font-bold mb-2">Create New RAMS Document</h1>
      
      {formData.aiGenerated && (
        <LegalDisclaimer isAIGenerated={true} />
      )}
      
      <EnhancedAICopilot onGenerate={handleCopilotGenerate} loading={copilotLoading} />

      <p className="text-gray-600 mb-6">Step {step} of {TOTAL_STEPS}</p>

      <form className="space-y-6 bg-white p-8 rounded-lg shadow-md" onSubmit={handleSubmit}>
        {renderStep()}
        
        {/* Display suggestions if any */}
        {suggestions.length > 0 && (
          <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded">
            <h3 className="font-semibold text-yellow-800 mb-2">Validation Suggestions:</h3>
            {suggestions.map((suggestion, index) => (
              <div key={index} className={`mb-2 p-2 rounded ${
                suggestion.severity === 'high' ? 'bg-red-100' :
                suggestion.severity === 'medium' ? 'bg-yellow-100' : 'bg-blue-100'
              }`}>
                <span className="font-medium">{suggestion.field}:</span> {suggestion.message}
                {suggestion.suggestion && (
                  <p className="text-sm mt-1">💡 {suggestion.suggestion}</p>
                )}
              </div>
            ))}
          </div>
        )}
        
        <div className="mt-8 pt-6 border-t flex justify-between items-center">
          <div>
            {step > 1 && (
              <button type="button" onClick={prevStep} className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg">
                Previous
              </button>
            )}
          </div>

          <button
            type="button"
            onClick={handleValidation}
            disabled={validating}
            className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:bg-purple-300"
          >
            {validating ? 'Validating...' : 'Validate Step'}
          </button>
          
          <div>
            {step < TOTAL_STEPS && (
              <button type="button" onClick={nextStep} className="px-6 py-2 bg-blue-600 text-white rounded-lg">
                Next
              </button>
            )}
            {step === TOTAL_STEPS && (
              <button type="submit" disabled={loading} className="px-6 py-2 bg-green-600 text-white rounded-lg">
                {loading ? 'Generating...' : 'Generate RAMS'}
              </button>
            )}
          </div>
        </div>
      </form>
    </main>
  );
}