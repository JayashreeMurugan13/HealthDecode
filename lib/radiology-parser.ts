// Radiology report parser
export interface RadiologyFinding {
  anatomy: string;
  finding: string;
  severity: 'normal' | 'mild' | 'moderate' | 'severe';
  impression: string;
}

export function parseRadiologyReport(text: string): RadiologyFinding[] {
  const findings: RadiologyFinding[] = [];
  const lower = text.toLowerCase();
  
  // Extract impression section
  const impressionMatch = text.match(/impression:?(.+?)(?=\n\n|findings:|$)/is);
  const impression = impressionMatch ? impressionMatch[1].trim() : '';
  
  // Common radiology findings with detailed descriptions
  const patterns = [
    { 
      anatomy: 'Chest', 
      keywords: ['chest', 'lung', 'heart', 'thorax', 'pulmonary'],
      normalDesc: 'Lungs are clear with no infiltrates, effusions, or masses. Heart size is normal. No acute cardiopulmonary abnormality.',
      findings: [
        { terms: ['infiltrate', 'consolidation', 'pneumonia'], desc: 'Infiltrate or consolidation suggesting infection', severity: 'moderate' as const },
        { terms: ['effusion', 'fluid'], desc: 'Pleural effusion with fluid accumulation', severity: 'moderate' as const },
        { terms: ['mass', 'nodule', 'lesion'], desc: 'Mass or nodule requiring further evaluation', severity: 'severe' as const },
        { terms: ['fracture', 'rib fracture'], desc: 'Rib fracture detected', severity: 'moderate' as const },
        { terms: ['cardiomegaly', 'enlarged heart'], desc: 'Enlarged heart (cardiomegaly)', severity: 'mild' as const },
      ]
    },
    { 
      anatomy: 'Abdomen', 
      keywords: ['abdomen', 'liver', 'kidney', 'spleen', 'pancreas'],
      normalDesc: 'Liver, spleen, kidneys, and pancreas appear normal in size and density. No masses, stones, or free fluid.',
      findings: [
        { terms: ['stone', 'calculus', 'calculi'], desc: 'Kidney or gallbladder stone detected', severity: 'moderate' as const },
        { terms: ['mass', 'tumor', 'lesion'], desc: 'Mass or lesion requiring further investigation', severity: 'severe' as const },
        { terms: ['enlarged', 'hepatomegaly', 'splenomegaly'], desc: 'Organ enlargement detected', severity: 'mild' as const },
        { terms: ['cyst', 'fluid collection'], desc: 'Cyst or fluid collection present', severity: 'mild' as const },
      ]
    },
    { 
      anatomy: 'Brain', 
      keywords: ['brain', 'head', 'skull', 'cranial', 'cerebral'],
      normalDesc: 'Brain parenchyma appears normal with no masses, hemorrhage, or infarction. Ventricles are normal in size.',
      findings: [
        { terms: ['hemorrhage', 'bleed', 'hematoma'], desc: 'Intracranial hemorrhage or bleeding', severity: 'severe' as const },
        { terms: ['infarct', 'stroke', 'ischemia'], desc: 'Acute infarction or stroke', severity: 'severe' as const },
        { terms: ['mass', 'tumor', 'lesion'], desc: 'Intracranial mass or lesion', severity: 'severe' as const },
        { terms: ['atrophy', 'volume loss'], desc: 'Brain atrophy or volume loss', severity: 'mild' as const },
      ]
    },
    { 
      anatomy: 'Spine', 
      keywords: ['spine', 'vertebra', 'disc', 'cervical', 'lumbar', 'thoracic'],
      normalDesc: 'Vertebral bodies maintain normal height and alignment. Intervertebral disc spaces are preserved. No fractures.',
      findings: [
        { terms: ['fracture', 'compression fracture'], desc: 'Vertebral compression fracture', severity: 'severe' as const },
        { terms: ['herniation', 'herniated disc', 'disc bulge'], desc: 'Disc herniation or bulge', severity: 'moderate' as const },
        { terms: ['stenosis', 'narrowing'], desc: 'Spinal canal stenosis or narrowing', severity: 'moderate' as const },
        { terms: ['spondylosis', 'degenerative'], desc: 'Degenerative changes (spondylosis)', severity: 'mild' as const },
      ]
    },
    { 
      anatomy: 'Bone', 
      keywords: ['bone', 'joint', 'skeletal', 'osseous'],
      normalDesc: 'Bones show normal density and alignment. No fractures, dislocations, or destructive lesions.',
      findings: [
        { terms: ['fracture', 'break'], desc: 'Bone fracture identified', severity: 'severe' as const },
        { terms: ['dislocation', 'subluxation'], desc: 'Joint dislocation or subluxation', severity: 'severe' as const },
        { terms: ['arthritis', 'osteoarthritis', 'degenerative'], desc: 'Degenerative joint disease (arthritis)', severity: 'mild' as const },
        { terms: ['osteoporosis', 'osteopenia', 'bone loss'], desc: 'Decreased bone density (osteoporosis)', severity: 'moderate' as const },
      ]
    },
  ];
  
  patterns.forEach(({ anatomy, keywords, normalDesc, findings: possibleFindings }) => {
    const hasAnatomy = keywords.some(k => lower.includes(k));
    if (!hasAnatomy) return;
    
    let finding = normalDesc;
    let severity: 'normal' | 'mild' | 'moderate' | 'severe' = 'normal';
    
    // Check for specific abnormalities (with negation handling)
    let foundAbnormality = false;
    for (const { terms, desc, severity: sev } of possibleFindings) {
      for (const term of terms) {
        if (lower.includes(term)) {
          // Check for negations before the term (within 20 characters)
          const termIndex = lower.indexOf(term);
          const beforeTerm = lower.substring(Math.max(0, termIndex - 20), termIndex);
          const hasNegation = /\b(no|without|absent|negative|rule out|r\/o|exclude)\b/.test(beforeTerm);
          
          if (!hasNegation) {
            finding = desc;
            severity = sev;
            foundAbnormality = true;
            break;
          }
        }
      }
      if (foundAbnormality) break;
    }
    
    // If no specific abnormality but mentions normal/clear/unremarkable
    if (!foundAbnormality && (lower.includes('normal') || lower.includes('clear') || lower.includes('unremarkable') || lower.includes('no acute'))) {
      finding = normalDesc;
      severity = 'normal';
    }
    
    findings.push({ anatomy, finding, severity, impression: impression || finding });
  });
  
  return findings;
}
