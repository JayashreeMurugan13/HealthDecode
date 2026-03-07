"use client";

import { useState } from "react";
import { HelpCircle } from "lucide-react";
import { MEDICAL_DEFINITIONS } from "@/lib/medical-nlp";

interface MedicalTooltipProps {
  term: string;
  children?: React.ReactNode;
}

export function MedicalTooltip({ term, children }: MedicalTooltipProps) {
  const [show, setShow] = useState(false);
  const definition = MEDICAL_DEFINITIONS[term.toLowerCase()];
  
  if (!definition) return <>{children || term}</>;
  
  return (
    <span className="relative inline-block">
      <span
        className="cursor-help border-b border-dotted border-blue-500 text-blue-600"
        onMouseEnter={() => setShow(true)}
        onMouseLeave={() => setShow(false)}
      >
        {children || term}
        <HelpCircle className="inline w-3 h-3 ml-1 mb-1" />
      </span>
      {show && (
        <span className="absolute z-50 bottom-full left-0 mb-2 w-64 p-3 text-sm bg-gray-900 text-white rounded-lg shadow-lg">
          {definition}
          <span className="absolute top-full left-4 -mt-1 border-4 border-transparent border-t-gray-900" />
        </span>
      )}
    </span>
  );
}
