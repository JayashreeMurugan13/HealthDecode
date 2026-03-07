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
  const impressionMatch = text.match(/impression:?(.+?)(?=\n\n|$)/is);
  const impression = impressionMatch ? impressionMatch[1].trim() : '';
  
  // Common radiology findings
  const patterns = [
    { anatomy: 'Chest', keywords: ['chest', 'lung', 'heart', 'thorax'], findings: ['clear', 'normal', 'infiltrate', 'consolidation', 'effusion', 'pneumonia', 'fracture'] },
    { anatomy: 'Abdomen', keywords: ['abdomen', 'liver', 'kidney', 'spleen'], findings: ['normal', 'enlarged', 'mass', 'stone', 'cyst'] },
    { anatomy: 'Brain', keywords: ['brain', 'head', 'skull'], findings: ['normal', 'hemorrhage', 'infarct', 'mass', 'atrophy'] },
    { anatomy: 'Spine', keywords: ['spine', 'vertebra', 'disc'], findings: ['normal', 'fracture', 'herniation', 'stenosis', 'spondylosis'] },
    { anatomy: 'Bone', keywords: ['bone', 'joint', 'fracture'], findings: ['normal', 'fracture', 'dislocation', 'arthritis', 'osteoporosis'] },
  ];
  
  patterns.forEach(({ anatomy, keywords, findings: possibleFindings }) => {
    const hasAnatomy = keywords.some(k => lower.includes(k));
    if (!hasAnatomy) return;
    
    let finding = 'No significant abnormality detected';
    let severity: 'normal' | 'mild' | 'moderate' | 'severe' = 'normal';
    
    if (lower.includes('normal') || lower.includes('clear') || lower.includes('unremarkable')) {
      finding = 'Normal study';
      severity = 'normal';
    } else if (lower.includes('fracture') || lower.includes('hemorrhage') || lower.includes('mass')) {
      finding = 'Significant abnormality detected';
      severity = 'severe';
    } else if (lower.includes('mild')) {
      finding = 'Mild abnormality';
      severity = 'mild';
    } else if (lower.includes('moderate')) {
      finding = 'Moderate abnormality';
      severity = 'moderate';
    }
    
    findings.push({ anatomy, finding, severity, impression });
  });
  
  return findings;
}
