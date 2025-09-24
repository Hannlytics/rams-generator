 'use client';
import { useState } from 'react';

interface TooltipProps {
  term: 'CDM' | 'COSHH' | 'RIDDOR' | 'PPE' | 'COMPETENT_PERSON';
  children: React.ReactNode;
}

export function EducationalTooltip({ term, children }: TooltipProps) {
  const [isVisible, setIsVisible] = useState(false);

  const definitions = {
    CDM: {
      title: "CDM Regulations 2015",
      content: "Construction (Design and Management) Regulations 2015. Requires competent persons to identify hazards and plan safe working methods. Applies to all construction projects in Great Britain.",
      link: "https://www.hse.gov.uk/construction/cdm/2015/"
    },
    COSHH: {
      title: "COSHH Regulations 2002",
      content: "Control of Substances Hazardous to Health. Requires assessment and control of exposure to hazardous substances including chemicals, dusts, and biological agents.",
      link: "https://www.hse.gov.uk/coshh/"
    },
    RIDDOR: {
      title: "RIDDOR 2013",
      content: "Reporting of Injuries, Diseases and Dangerous Occurrences Regulations. Requires employers to report serious workplace accidents, occupational diseases and dangerous occurrences to HSE.",
      link: "https://www.hse.gov.uk/riddor/"
    },
    PPE: {
      title: "Personal Protective Equipment",
      content: "Equipment worn to minimize exposure to hazards. Must be suitable, maintained, and used correctly. PPE is the last line of defense after other control measures.",
      link: "https://www.hse.gov.uk/toolbox/ppe.htm"
    },
    COMPETENT_PERSON: {
      title: "Competent Person (CDM 2015)",
      content: "Someone with necessary skills, knowledge, experience and (where appropriate) qualifications to safely carry out the work. Must understand risks and prevention measures.",
      link: "https://www.hse.gov.uk/construction/cdm/2015/competence.htm"
    }
  };

  const info = definitions[term];

  return (
    <div className="relative inline-block">
      <span 
        className="cursor-help border-b border-dotted border-blue-500 text-blue-600"
        onMouseEnter={() => setIsVisible(true)}
        onMouseLeave={() => setIsVisible(false)}
      >
        {children}
      </span>
      
      {isVisible && (
        <div className="absolute z-10 w-80 p-4 mt-2 bg-white border border-gray-200 rounded-lg shadow-xl">
          <h4 className="font-bold text-gray-800 mb-2">{info.title}</h4>
          <p className="text-sm text-gray-600 mb-3">{info.content}</p>
          <a 
            href={info.link} 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-xs text-blue-600 hover:underline"
          >
            Read HSE Guidance →
          </a>
        </div>
      )}
    </div>
  );
}
