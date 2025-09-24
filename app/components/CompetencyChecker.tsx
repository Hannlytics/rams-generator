 'use client';
import { useState } from 'react';

export function CompetencyChecker({ onVerified }: { onVerified: (verified: boolean) => void }) {
  const [responses, setResponses] = useState<Record<string, string>>({});
  const [showResults, setShowResults] = useState(false);

  const questions = [
    {
      id: 'cdm_knowledge',
      question: 'Are you familiar with CDM Regulations 2015 and your duties under them?',
      options: ['Yes - I understand my legal duties', 'Somewhat familiar', 'No - I need training']
    },
    {
      id: 'rams_experience',
      question: 'How many years of experience do you have creating/reviewing RAMS?',
      options: ['5+ years professional experience', '2-5 years experience', 'Less than 2 years', 'No formal experience']
    },
    {
      id: 'qualifications',
      question: 'What safety qualifications do you hold?',
      options: ['NEBOSH/IOSH + construction experience', 'Basic safety qualifications', 'No formal qualifications']
    }
  ];

  const handleSubmit = () => {
    const competencyScore = Object.values(responses).reduce((score, response, index) => {
      if (index === 0 && response === 'Yes - I understand my legal duties') return score + 3;
      if (index === 1 && response === '5+ years professional experience') return score + 3;
      if (index === 2 && response === 'NEBOSH/IOSH + construction experience') return score + 3;
      return score + 1;
    }, 0);

    setShowResults(true);
    onVerified(competencyScore >= 7);
  };

  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
      <h3 className="text-lg font-bold text-blue-800 mb-4">
        Competency Verification (CDM 2015 Requirement)
      </h3>
      
      <p className="text-sm text-blue-700 mb-4">
        CDM Regulations require that only competent persons create risk assessments. Please verify your competency:
      </p>

      {questions.map((q, index) => (
        <div key={q.id} className="mb-4">
          <p className="font-medium text-blue-800 mb-2">{index + 1}. {q.question}</p>
          <div className="space-y-1">
            {q.options.map((option) => (
              <label key={option} className="flex items-center">
                <input
                  type="radio"
                  name={q.id}
                  value={option}
                  onChange={(e) => setResponses({...responses, [q.id]: e.target.value})}
                  className="mr-2"
                />
                <span className="text-sm text-blue-700">{option}</span>
              </label>
            ))}
          </div>
        </div>
      ))}

      <button
        onClick={handleSubmit}
        disabled={Object.keys(responses).length < questions.length}
        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-400"
      >
        Verify Competency
      </button>

      {showResults && (
        <div className="mt-4 p-3 bg-white border border-blue-200 rounded">
          <p className="text-sm">
            Based on your responses, please ensure you have appropriate oversight from a qualified professional before implementing any RAMS created with this tool.
          </p>
        </div>
      )}
    </div>
  );
}
