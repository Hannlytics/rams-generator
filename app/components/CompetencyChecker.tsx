'use client';

import React, { useState } from 'react';

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

const RadioOption = ({ id, name, value, label, checked, onChange }: { 
  id: string, 
  name: string, 
  value: string, 
  label: string, 
  checked: string, 
  onChange: (value: string) => void 
}) => (
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

interface CompetencyCheckerProps {
  onVerified: (isVerified: boolean) => void;
}

const CompetencyChecker: React.FC<CompetencyCheckerProps> = ({ onVerified }) => {
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

  const handleProceed = () => {
    onVerified(true);
  };

  return (
    <div className="p-4 my-4 border rounded bg-gray-100">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Competency Check</h2>
        <p className="text-gray-600 mb-6">Please confirm your competency level to create RAMS documents.</p>
        
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
                <select 
                    id="qualification" 
                    name="qualification" 
                    value={qualification} 
                    onChange={(e) => setQualification(e.target.value)} 
                    className="mt-1 block w-full pl-3 pr-10 py-3 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-lg shadow-sm"
                >
                    <option value="" disabled>Select your qualification...</option>
                    <option value="none">No formal qualifications</option>
                    <option value="basic">Basic Safety (e.g., Site Passport)</option>
                    <option value="intermediate">Intermediate (e.g., IOSH MS, NEBOSH Cert)</option>
                    <option value="advanced">Advanced (e.g., NEBOSH Diploma, CMIOSH)</option>
                    <option value="advanced-specialist">Advanced + Specialist Training</option>
                </select>
            </div>

            {error && <p className="text-red-600 text-sm">{error}</p>}

            <button 
                type="submit" 
                className="w-full bg-blue-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-300"
            >
                Check My Competency
            </button>
        </form>
        ) : (
        <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
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

            <button 
                onClick={handleProceed} 
                className="mt-8 w-full bg-green-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors duration-300"
            >
                I Confirm I Am Competent
            </button>
            
            <button 
                onClick={() => setResult(null)} 
                className="mt-2 w-full text-sm text-gray-600 hover:text-blue-600 text-center"
            >
                Re-check Competency
            </button>
        </div>
        )}
    </div>
  );
};

export default CompetencyChecker;