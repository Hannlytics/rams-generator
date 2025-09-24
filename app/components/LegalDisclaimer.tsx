 'use client';
import { useState } from 'react';

export default function LegalDisclaimer({ isAIGenerated = false, onAccept }: { isAIGenerated?: boolean; onAccept?: () => void }) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="bg-amber-50 border-2 border-amber-200 rounded-lg p-6 mb-6">
      <div className="flex items-start">
        <div className="flex-shrink-0">
          <svg className="w-6 h-6 text-amber-600" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
          </svg>
        </div>
        <div className="ml-4 flex-1">
          <h3 className="text-lg font-bold text-amber-800 mb-2">
            IMPORTANT LEGAL NOTICE - UK CONSTRUCTION SAFETY COMPLIANCE
          </h3>
          
          <div className="space-y-3 text-sm text-amber-800">
            <p className="font-semibold text-base">
              {isAIGenerated 
                ? "This content was AI-generated and requires professional verification." 
                : "This tool assists with RAMS creation but does not replace professional judgment."}
            </p>

            <div className="bg-white p-4 rounded border border-amber-200">
              <h4 className="font-bold mb-2">Your Legal Responsibilities Under UK Law:</h4>
              <ul className="list-disc ml-5 space-y-1">
                <li><strong>CDM Regulations 2015:</strong> You must ensure a competent person reviews all risk assessments</li>
                <li><strong>Health & Safety at Work Act 1974:</strong> Employers have duty of care for worker safety</li>
                <li><strong>Professional Competence:</strong> RAMS must be created/approved by qualified personnel</li>
                <li><strong>Site-Specific Assessment:</strong> Generic assessments must be adapted to actual conditions</li>
                <li><strong>Ongoing Review:</strong> RAMS must be updated as conditions change</li>
              </ul>
            </div>

            <button 
              onClick={() => setIsExpanded(!isExpanded)}
              className="text-amber-700 underline hover:text-amber-900"
            >
              {isExpanded ? 'Hide Full Terms' : 'Read Full Legal Terms & Conditions'}
            </button>

            {isExpanded && (
              <div className="bg-white p-4 rounded border border-amber-200 mt-3">
                <h4 className="font-bold mb-2">TERMS OF USE - HANNLYTICS RAMS GENERATOR</h4>
                <div className="text-xs space-y-2">
                  <p><strong>1. LIMITATION OF LIABILITY:</strong> This software provides assistance only. Hannlytics Ltd accepts no responsibility for the accuracy, completeness, or suitability of generated content. Users assume all risks and liabilities.</p>
                  
                  <p><strong>2. PROFESSIONAL OVERSIGHT REQUIRED:</strong> All output must be reviewed by qualified construction safety professionals before implementation. AI-generated content is for drafting assistance only.</p>
                  
                  <p><strong>3. REGULATORY COMPLIANCE:</strong> Users are solely responsible for ensuring compliance with current UK regulations including but not limited to CDM 2015, COSHH, and relevant British Standards.</p>
                  
                  <p><strong>4. NO WARRANTIES:</strong> This software is provided &ldquo;as is&rdquo; without warranty of any kind. We disclaim all warranties, express or implied, including fitness for a particular purpose.</p>
                  
                  <p><strong>5. INDEMNIFICATION:</strong> Users agree to indemnify Hannlytics Ltd against any claims arising from use of this software or reliance on its output.</p>
                  
                  <p><strong>6. COMPETENT PERSON REQUIREMENT:</strong> This tool does not replace the need for competent persons as defined in CDM 2015. Professional qualification and site-specific knowledge remain essential.</p>
                </div>
              </div>
            )}

            {onAccept && (
              <div className="flex items-center mt-4 p-3 bg-white rounded border border-amber-200">
                <input type="checkbox" id="legal-accept" className="mr-3" />
                <label htmlFor="legal-accept" className="flex-1 text-sm">
                  I acknowledge that I have read and understood these terms, and I am a competent person qualified to review and approve RAMS documentation under UK construction regulations.
                </label>
                <button 
                  onClick={onAccept}
                  className="ml-3 px-4 py-2 bg-amber-600 text-white rounded hover:bg-amber-700"
                >
                  Accept & Continue
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
