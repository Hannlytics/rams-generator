'use client';

import React, { useState } from 'react';

// --- Helper Components for Icons ---
const ClockIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-3 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const ShieldCheckIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-3 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 20.917V21h18v-.083A12.02 12.02 0 0018.382 5.984z" />
  </svg>
);

const DocumentTextIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-3 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
  </svg>
);


// --- CompetencyChecker Component (Integrated) ---
type CompetencyLevel = {
  level: string;
  description: string;
  permissions: {
    draft: string;
    review: string;
    approve: string;
    audit: string;
  };
};

const competencyLevels: { [key: string]: CompetencyLevel } = {
    'Trainee': {
        level: 'Trainee',
        description: 'You must work under supervision. Any RAMS you create require full review and approval by a qualified professional.',
        permissions: { draft: 'assist', review: 'no', approve: 'no', audit: 'no' }
    },
    'Junior Practitioner': {
        level: 'Junior Practitioner',
        description: 'You may draft RAMS for low-risk tasks but must obtain review/approval from a competent HSE professional.',
        permissions: { draft: 'low-risk', review: 'no', approve: 'no', audit: 'no' }
    },
    'Practitioner': {
        level: 'Practitioner / Supervisor',
        description: 'You are competent to draft and review RAMS for routine tasks. High-risk RAMS require senior approval.',
        permissions: { draft: 'yes', review: 'yes', approve: 'low-medium', audit: 'no' }
    },
    'Senior Manager': {
        level: 'Senior HSE Manager',
        description: 'You are competent to approve RAMS at all risk levels and provide oversight.',
        permissions: { draft: 'yes', review: 'yes', approve: 'yes', audit: 'yes' }
    },
    'Specialist': {
        level: 'Specialist / Consultant',
        description: 'You are recognised as a subject-matter expert. You may audit RAMS and provide external sign-off.',
        permissions: { draft: 'yes', review: 'yes', approve: 'yes', audit: 'expert' }
    }
};

const RadioOption = ({ id, name, value, label, checked, onChange }: { id: string, name: string, value: string, label: string, checked: string, onChange: (value: string) => void }) => (
    <label 
        htmlFor={id} 
        className={`flex items-center p-4 w-full bg-white border rounded-lg cursor-pointer transition-all duration-200 ${
            checked === value 
            ? 'border-blue-500 ring-2 ring-blue-200' 
            : 'border-gray-300 hover:border-blue-400'
        }`}
    >
        <input 
            type="radio" 
            id={id}
            name={name} 
            value={value}
            checked={checked === value}
            onChange={(e) => onChange(e.target.value)}
            className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
        />
        <span className="ml-3 text-sm font-medium text-gray-800">{label}</span>
    </label>
);

const CompetencyChecker = () => {
  const [familiarity, setFamiliarity] = useState('');
  const [experience, setExperience] = useState('');
  const [qualification, setQualification] = useState('');
  const [result, setResult] = useState<CompetencyLevel | null>(null);
  const [error, setError] = useState('');

  const calculateCompetency = (): CompetencyLevel | null => {
    if (experience === 'none' || (experience === '<2' && (qualification === 'none' || qualification === 'basic') && (familiarity === 'no' || familiarity === 'somewhat'))) {
        return competencyLevels['Trainee'];
    }
    if (experience === '<2' && (qualification === 'basic' || qualification === 'intermediate') && (familiarity === 'yes' || familiarity === 'somewhat')) {
        return competencyLevels['Junior Practitioner'];
    }
    if (experience === '2-5' && qualification === 'intermediate' && familiarity === 'yes') {
        return competencyLevels['Practitioner'];
    }
    if (experience === '5+' && qualification === 'advanced' && familiarity === 'yes') {
        return competencyLevels['Senior Manager'];
    }
    if (experience === '10+' && qualification === 'advanced-specialist' && familiarity === 'yes') {
        return competencyLevels['Specialist'];
    }
    if (experience === '2-5' || qualification === 'intermediate') {
        return competencyLevels['Practitioner'];
    }
    if (experience === '<2') {
        return competencyLevels['Junior Practitioner'];
    }
    return competencyLevels['Trainee'];
  };
  
  const handleVerify = (e: React.FormEvent) => {
    e.preventDefault();
    if (!familiarity || !experience || !qualification) {
      setError('Please complete all fields to determine your competency level.');
      return;
    }
    setError('');
    const competencyResult = calculateCompetency();
    setResult(competencyResult);
  };

  const PermissionIndicator = ({ status }: { status: string }) => {
    if (status === 'yes' || status.includes('risk') || status === 'expert') {
      return <span className="text-green-500 font-bold">✅ Authorised</span>;
    }
    if (status === 'assist' || status === 'low-medium') {
      return <span className="text-yellow-500 font-bold">⚠️ Supervision Required</span>;
    }
    return <span className="text-red-500 font-bold">❌ Not Authorised</span>;
  };
  
  const renderPermissionDetail = (permission: string, status: string) => {
    let text = '';
    switch(permission) {
        case 'draft': text = 'Draft RAMS:'; break;
        case 'review': text = 'Review RAMS:'; break;
        case 'approve': text = 'Approve RAMS:'; break;
        case 'audit': text = 'Audit & Oversight:'; break;
    }
    return (
        <div className="flex justify-between items-center py-2 border-b border-gray-200">
            <span className="text-gray-600">{text}</span>
            <PermissionIndicator status={status} />
        </div>
    );
  }

  return (
    <div className="p-8 lg:p-12">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Let&apos;s Get Started</h2>
        <p className="text-gray-600 mb-6">First, a quick check to personalize your experience.</p>
        
        {!result ? (
        <form onSubmit={handleVerify} className="space-y-6">
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">1. How familiar are you with your duties under CDM 2015?</label>
                <div className="space-y-2">
                    <RadioOption id="fam-yes" name="familiarity" value="yes" label="Yes - I fully understand my legal duties." checked={familiarity} onChange={setFamiliarity} />
                    <RadioOption id="fam-somewhat" name="familiarity" value="somewhat" label="Somewhat familiar." checked={familiarity} onChange={setFamiliarity} />
                    <RadioOption id="fam-no" name="familiarity" value="no" label="No - I need training." checked={familiarity} onChange={setFamiliarity} />
                </div>
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">2. What is your level of experience creating/reviewing RAMS?</label>
                <div className="space-y-2">
                    <RadioOption id="exp-10+" name="experience" value="10+" label="10+ years (Specialist)" checked={experience} onChange={setExperience} />
                    <RadioOption id="exp-5+" name="experience" value="5+" label="5+ years (Senior)" checked={experience} onChange={setExperience} />
                    <RadioOption id="exp-2-5" name="experience" value="2-5" label="2–5 years (Practitioner)" checked={experience} onChange={setExperience} />
                    <RadioOption id="exp-<2" name="experience" value="<2" label="Less than 2 years (Junior)" checked={experience} onChange={setExperience} />
                    <RadioOption id="exp-none" name="experience" value="none" label="No formal experience" checked={experience} onChange={setExperience} />
                </div>
            </div>
             <div>
                <label htmlFor="qualification" className="block text-sm font-medium text-gray-700 mb-2">3. What is your primary safety qualification?</label>
                <select id="qualification" name="qualification" value={qualification} onChange={(e) => setQualification(e.target.value)} className="mt-1 block w-full pl-3 pr-10 py-3 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-lg shadow-sm">
                    <option value="" disabled>Select your qualification...</option>
                    <option value="none">No formal qualifications</option>
                    <option value="basic">Basic Safety (e.g., Site Passport)</option>
                    <option value="intermediate">Intermediate (e.g., IOSH MS, NEBOSH Cert)</option>
                    <option value="advanced">Advanced (e.g., NEBOSH Diploma, CMIOSH)</option>
                    <option value="advanced-specialist">Advanced + Specialist Training</option>
                </select>
            </div>

            {error && <p className="text-red-600 text-sm">{error}</p>}

            <button type="submit" className="w-full bg-blue-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-300">
                Check My Competency
            </button>
        </form>
        ) : (
        <div className="bg-gray-50 p-6 rounded-lg border border-gray-200 animate-fade-in">
            <h3 className="text-sm font-semibold text-blue-600 uppercase tracking-wider">Your Competency Profile</h3>
            <p className="text-2xl font-bold text-gray-900 mt-1">{result.level}</p>
            <p className="mt-4 text-center bg-blue-100 text-blue-800 p-4 rounded-md border border-blue-200">
                &quot;{result.description}&quot;
            </p>

            <div className="mt-6">
                <h4 className="font-semibold text-gray-700 mb-2">Your Permissions:</h4>
                {renderPermissionDetail('draft', result.permissions.draft)}
                {renderPermissionDetail('review', result.permissions.review)}
                {renderPermissionDetail('approve', result.permissions.approve)}
                {renderPermissionDetail('audit', result.permissions.audit)}
            </div>

            <button onClick={() => alert('Proceeding to the next step!')} className="mt-8 w-full bg-green-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors duration-300">
                Proceed to RAMS Template
            </button>
             <button onClick={() => setResult(null)} className="mt-2 w-full text-sm text-gray-600 hover:text-blue-600 text-center">
                Re-check Competency
            </button>
        </div>
        )}
    </div>
  );
}


// --- Main Page Component ---
export default function NewRamsPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4 sm:p-6 lg:p-8 font-sans">
      <div className="w-full max-w-6xl mx-auto bg-white rounded-2xl shadow-xl overflow-hidden grid grid-cols-1 md:grid-cols-2">
        
        {/* --- Left Column: Value Proposition --- */}
        <div className="p-8 lg:p-12 bg-blue-600 text-white flex flex-col">
          <div>
            <h1 className="text-3xl lg:text-4xl font-bold mb-4">The Smarter Way to Create Compliant RAMS</h1>
            <p className="text-sm text-blue-300 mb-8">Developed by Hanniel Solutions</p>
            <p className="text-lg text-blue-100 mb-8">
              Our guided tool helps you generate professional, CDM 2015-compliant Risk Assessments and Method Statements. Save time, reduce paperwork, and keep your team safe.
            </p>
            <ul className="space-y-6 text-lg">
              <li className="flex items-center">
                <ClockIcon />
                <div>
                  <h3 className="font-semibold">Save Time</h3>
                  <p className="text-blue-200 text-base">Generate documents in a fraction of the time.</p>
                </div>
              </li>
              <li className="flex items-center">
                <ShieldCheckIcon />
                <div>
                  <h3 className="font-semibold">Ensure Compliance</h3>
                  <p className="text-blue-200 text-base">Stay aligned with current HSE regulations.</p>
                </div>
              </li>
              <li className="flex items-center">
                <DocumentTextIcon />
                 <div>
                  <h3 className="font-semibold">Professional Output</h3>
                  <p className="text-blue-200 text-base">Export your RAMS as clean, branded PDF documents.</p>
                </div>
              </li>
            </ul>
          </div>
          <div className="mt-auto pt-8">
            <p className="text-xs text-blue-300 text-center">
                &copy; {new Date().getFullYear()} Hanniel Solutions. All Rights Reserved. This tool is proprietary intellectual property.
            </p>
          </div>
        </div>

        {/* --- Right Column: Interactive Module --- */}
        <CompetencyChecker />

      </div>
    </div>
  );
}

