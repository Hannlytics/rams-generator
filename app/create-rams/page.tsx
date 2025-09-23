'use client';
import { useState, FormEvent, FC } from 'react';
import AddressLookup from '../components/AddressLookup';

// --- TYPE DEFINITIONS ---
interface Suggestion {
  field: string;
  severity: 'low' | 'medium' | 'high';
  message: string;
  suggestion?: string;
  autoFixContent?: string; // Field for the auto-fix text
}

// Defines the structure of all the data in our form
interface RamsFormData {
  [key: string]: any; // Allows for flexible properties
  selectedHazards?: string[];
  selectedPPE?: string[];
}

// --- CONSTANTS (Data for dropdowns, etc.) ---
const TRADES = [
    'General Builder', 'Electrician', 'Plumber', 'Bricklayer', 'Carpenter / Joiner', 
    'Painter & Decorator', 'Plasterer', 'Roofing Contractor', 'Groundworker', 'Scaffolder', 
    'Demolition Operative', 'Steel Erector', 'Floor Layer', 'Glazier', 'Tiler', 
    'Dryliner / Ceiling Fixer', 'Landscaper', 'HVAC Engineer', 'Cleaner (Post-construction)'
];

const TASK_TYPES: { [key: string]: string[] } = {
    'General Builder': ['Small Extension', 'Refurbishment', 'Structural Repairs', 'General Maintenance'],
    'Electrician': ['EICR', 'PAT Testing', 'New Circuit Installation', 'Fault Finding'],
    'Plumber': ['Leak Repair', 'Central Heating Maintenance', 'Drainage', 'Gas Safety Certificate'],
    'Carpenter / Joiner': ['First Fix (Studwork)', 'Second Fix (Doors, Skirting)', 'Roof Trusses', 'Custom Joinery'],
};

const COMMON_HAZARDS = [
    "Working at Height", "Electrical", "Manual Handling", "Power Tools / Equipment", 
    "Hazardous Substances (COSHH)", "Slips, Trips and Falls", "Noise & Vibration", 
    "Dust / Airborne Particles", "Hot Works", "Confined Spaces", "Lone Working", 
    "Vehicular Movement", "Fire / Emergency Risks", "Public Interface (e.g., schools, retail)", 
    "Other / Custom Hazards"
];

const PPE_OPTIONS = [
    'Hard Hat', 'Safety Boots (Steel Toe)', 'High-Visibility Vest', 'Safety Glasses / Goggles', 
    'Gloves', 'Ear Defenders / Plugs', 'Dust Mask / Respirator', 'Fall Arrest Harness', 
    'Face Shield / Visor', 'Coveralls / Protective Suit', 'Knee Pads', 'Welding Shield', 
    'Thermal Gear / Waterproofs', 'Life Jacket'
];

const TOTAL_STEPS = 6;

// --- HELPER COMPONENTS ---

const ProgressBar: FC<{ currentStep: number }> = ({ currentStep }) => (
    <div className="w-full bg-gray-200 rounded-full h-2.5 mb-8">
        <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: `${(currentStep / TOTAL_STEPS) * 100}%` }}></div>
    </div>
);

const SuggestionBox: FC<{ suggestion: Suggestion; onApplyFix: (field: string, content: string) => void }> = ({ suggestion, onApplyFix }) => {
    const severityClasses = {
        low: 'bg-yellow-100 border-yellow-400 text-yellow-700',
        medium: 'bg-orange-100 border-orange-400 text-orange-700',
        high: 'bg-red-100 border-red-400 text-red-700',
    };
    return (
        <div className={`p-3 mt-2 border-l-4 rounded-r-lg ${severityClasses[suggestion.severity]}`}>
            <p className="font-bold">{suggestion.message}</p>
            {suggestion.suggestion && <p className="text-sm">{suggestion.suggestion}</p>}
            {suggestion.autoFixContent && (
                <button
                    onClick={() => onApplyFix(suggestion.field, suggestion.autoFixContent || '')}
                    className="mt-2 px-3 py-1 text-xs font-semibold text-white bg-green-600 rounded-md hover:bg-green-700"
                >
                    Apply Fix
                </button>
            )}
        </div>
    );
};

// --- MAIN PAGE COMPONENT ---
export default function NewRamsPage() {
    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState<RamsFormData>({});
    const [loading, setLoading] = useState(false);
    const [validating, setValidating] = useState(false);
    const [suggestions, setSuggestions] = useState<Suggestion[]>([]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        
        if (type === 'checkbox') {
            const { checked } = e.target as HTMLInputElement;
            if (name === 'acknowledgement') {
                setFormData({ ...formData, [name]: checked });
                return;
            }
            const currentValues = (formData[name] as string[]) || [];
            if (checked) {
                setFormData({ ...formData, [name]: [...currentValues, value] });
            } else {
                setFormData({ ...formData, [name]: currentValues.filter((item: string) => item !== value) });
            }
        } else {
            setFormData({ ...formData, [name]: value });
        }
    };
    
    const handleApplyFix = (field: string, content: string) => {
        setFormData({ ...formData, [field]: content });
        setSuggestions(suggestions.filter(s => s.field !== field));
    };
    
    const handleValidation = async () => {
        setValidating(true);
        setSuggestions([]);
        try {
            const response = await fetch('/api/validate-step', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });
            const result = await response.json();
            if (result.suggestions) {
                setSuggestions(result.suggestions);
            }
        } catch (error) {
            console.error("Validation failed:", error);
        } finally {
            setValidating(false);
        }
    };

    const nextStep = () => setStep(prev => Math.min(prev + 1, TOTAL_STEPS));
    const prevStep = () => setStep(prev => Math.max(prev - 1, 1));

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        setLoading(true);
        console.log("Final Form Data:", formData);
        setTimeout(() => setLoading(false), 2000);
    };

    const renderStep = () => {
        switch (step) {
             case 1:
                return (
                    <div>
                        <h2 className="text-xl font-semibold mb-4">Project Information</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                           <input name="projectName" value={formData.projectName || ''} placeholder="Project Name *" onChange={handleInputChange} className="w-full px-4 py-2 border rounded" />
                           <input name="clientName" value={formData.clientName || ''} placeholder="Client Name *" onChange={handleInputChange} className="w-full px-4 py-2 border rounded" />
                           <input name="startDate" value={formData.startDate || ''} type="date" placeholder="Start Date" onChange={handleInputChange} className="w-full px-4 py-2 border rounded" />
                           <input name="endDate" value={formData.endDate || ''} type="date" placeholder="End Date" onChange={handleInputChange} className="w-full px-4 py-2 border rounded" />
                           <input name="duration" value={formData.duration || ''} placeholder="Duration (e.g., 5 days)" onChange={handleInputChange} className="w-full px-4 py-2 border rounded" />
                           <input name="jobReference" value={formData.jobReference || ''} placeholder="Job Reference / Number" onChange={handleInputChange} className="w-full px-4 py-2 border rounded" />
                        </div>
                        <AddressLookup value={formData.siteAddress || ''} onChange={(addr) => setFormData({...formData, siteAddress: addr})} />
                        <input name="siteContactPerson" value={formData.siteContactPerson || ''} placeholder="Site Contact Person" onChange={handleInputChange} className="w-full mt-4 px-4 py-2 border rounded" />
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
                        <textarea name="scopeOfWork" value={formData.scopeOfWork || ''} placeholder="Scope of Work *" onChange={handleInputChange} className="w-full mt-4 px-4 py-2 border rounded" rows={3}></textarea>
                        {suggestions.filter(s => s.field === 'scopeOfWork').map(s => <SuggestionBox key={s.message} suggestion={s} onApplyFix={handleApplyFix} />)}
                        <textarea name="methodStatement" value={formData.methodStatement || ''} placeholder="Method Statement (Step-by-step description)" onChange={handleInputChange} className="w-full mt-4 px-4 py-2 border rounded" rows={4}></textarea>
                        {suggestions.filter(s => s.field === 'methodStatement').map(s => <SuggestionBox key={s.message} suggestion={s} onApplyFix={handleApplyFix} />)}
                         <textarea name="sequenceOfOperations" value={formData.sequenceOfOperations || ''} placeholder="Sequence of Operations" onChange={handleInputChange} className="w-full mt-4 px-4 py-2 border rounded" rows={4}></textarea>
                    </div>
                );
            case 3:
                 return(
                    <div>
                        <h2 className="text-xl font-semibold mb-4">Risk Assessment</h2>
                        <input name="personsAtRisk" value={formData.personsAtRisk || ''} placeholder="Persons at Risk (e.g., Operatives, public)" onChange={handleInputChange} className="w-full mb-4 px-4 py-2 border rounded" />
                        {suggestions.filter(s => s.field === 'personsAtRisk').map(s => <SuggestionBox key={s.message} suggestion={s} onApplyFix={handleApplyFix} />)}
                        <label className="block text-sm font-medium mb-2">Common Hazards (select all that apply)</label>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mb-4">
                            {COMMON_HAZARDS.map(hazard => (
                                <label key={hazard} className="flex items-center">
                                    <input type="checkbox" name="selectedHazards" value={hazard} checked={formData.selectedHazards?.includes(hazard)} onChange={handleInputChange} className="mr-2" />
                                    <span className="text-sm">{hazard}</span>
                                </label>
                            ))}
                        </div>
                    </div>
                );
            case 4:
                return(
                     <div>
                        <h2 className="text-xl font-semibold mb-4">PPE & Control Measures</h2>
                        <label className="block text-sm font-medium mb-2">PPE Requirements (select all that apply)</label>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mb-4">
                            {PPE_OPTIONS.map(ppe => (
                                <label key={ppe} className="flex items-center">
                                    <input type="checkbox" name="selectedPPE" value={ppe} checked={formData.selectedPPE?.includes(ppe)} onChange={handleInputChange} className="mr-2" />
                                    <span className="text-sm">{ppe}</span>
                                </label>
                            ))}
                        </div>
                        <textarea name="controls" value={formData.controls || ''} placeholder="Control Measures *" onChange={handleInputChange} className="w-full mt-4 px-4 py-2 border rounded" rows={4}></textarea>
                        {suggestions.filter(s => s.field === 'controls').map(s => <SuggestionBox key={s.message} suggestion={s} onApplyFix={handleApplyFix} />)}
                    </div>
                );
            case 5:
                 return (
                    <div>
                        <h2 className="text-xl font-semibold mb-4">Emergency Planning</h2>
                         <textarea name="firstAidArrangements" value={formData.firstAidArrangements || ''} placeholder="First Aid Arrangements" onChange={handleInputChange} className="w-full mt-4 px-4 py-2 border rounded" rows={3}></textarea>
                         <textarea name="firePrecautions" value={formData.firePrecautions || ''} placeholder="Fire Precautions" onChange={handleInputChange} className="w-full mt-4 px-4 py-2 border rounded" rows={3}></textarea>
                         <textarea name="emergencyContacts" value={formData.emergencyContacts || ''} placeholder="Emergency Contacts" onChange={handleInputChange} className="w-full mt-4 px-4 py-2 border rounded" rows={3}></textarea>
                    </div>
                );
            case 6:
                return (
                     <div>
                        <h2 className="text-xl font-semibold mb-4">Review & Sign-off</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                           <input name="siteManager" value={formData.siteManager || ''} placeholder="Site Manager *" onChange={handleInputChange} className="w-full px-4 py-2 border rounded" />
                           <input name="contactNumber" value={formData.contactNumber || ''} placeholder="Contact Number *" onChange={handleInputChange} className="w-full px-4 py-2 border rounded" />
                           <input name="preparedBy" value={formData.preparedBy || ''} placeholder="Prepared By" onChange={handleInputChange} className="w-full px-4 py-2 border rounded" />
                           {suggestions.filter(s => s.field === 'preparedBy').map(s => <SuggestionBox key={s.message} suggestion={s} onApplyFix={handleApplyFix} />)}
                           <input name="reviewedBy" value={formData.reviewedBy || ''} placeholder="Reviewed By (Supervisor)" onChange={handleInputChange} className="w-full px-4 py-2 border rounded" />
                           <input name="reviewDate" value={formData.reviewDate || ''} type="date" placeholder="Review Date" onChange={handleInputChange} className="w-full px-4 py-2 border rounded" />
                           <input name="revisionNumber" value={formData.revisionNumber || ''} type="number" placeholder="Revision Number" defaultValue="1" onChange={handleInputChange} className="w-full px-4 py-2 border rounded" />
                        </div>
                         <label className="flex items-center mt-4">
                           <input type="checkbox" name="acknowledgement" checked={formData.acknowledgement || false} onChange={handleInputChange} className="mr-2" />
                           <span className="text-sm">I acknowledge that I have read and understood this Method Statement and Risk Assessment.</span>
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
            <p className="text-gray-600 mb-6">Step {step} of {TOTAL_STEPS}</p>
            <ProgressBar currentStep={step} />

            <form onSubmit={handleSubmit} className="space-y-6 bg-white p-8 rounded-lg shadow-md">
                {renderStep()}
                
                <div className="mt-8 pt-6 border-t flex justify-between items-center">
                    <div>
                        {step > 1 && (
                            <button type="button" onClick={prevStep} className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300">
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
                        {validating ? 'Checking...' : 'Check this Step'}
                    </button>
                    
                    <div>
                        {step < TOTAL_STEPS && (
                            <button type="button" onClick={nextStep} className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                                Next
                            </button>
                        )}
                        {step === TOTAL_STEPS && (
                            <button type="submit" disabled={loading} className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-green-300">
                                {loading ? 'Generating...' : 'Generate RAMS Document'}
                            </button>
                        )}
                    </div>
                </div>
            </form>
        </main>
    );
}

