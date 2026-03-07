// Clinical history and physical examination parser
export interface ClinicalFindings {
  chiefComplaint: string;
  vitalSigns: { [key: string]: string };
  diagnosis: string[];
  physicalExam: string[];
  medications: string[];
  allergies: string[];
  riskFactors: string[];
}

export function parseClinicalHistory(text: string): ClinicalFindings {
  const findings: ClinicalFindings = {
    chiefComplaint: '',
    vitalSigns: {},
    diagnosis: [],
    physicalExam: [],
    medications: [],
    allergies: [],
    riskFactors: [],
  };
  
  // Extract Chief Complaint
  const ccMatch = text.match(/Chief Complaint.*?:(.+?)(?=\n\n|History of Present)/is);
  if (ccMatch) findings.chiefComplaint = ccMatch[1].trim().replace(/\s+/g, ' ').substring(0, 250);
  
  // Extract Vital Signs - improved patterns
  // Extract multiple BP readings from table format
  const morningMatch = text.match(/Morning.*?(\d+)\/(\d+)/i);
  if (morningMatch) {
    findings.vitalSigns['Morning BP'] = `${morningMatch[1]}/${morningMatch[2]}`;
  }
  
  const eveningMatch = text.match(/Evening.*?(\d+)\/(\d+)/i);
  if (eveningMatch) {
    findings.vitalSigns['Evening BP'] = `${eveningMatch[1]}/${eveningMatch[2]}`;
  }
  
  // General BP pattern
  const bpMatch = text.match(/(?:Blood Pressure)[:\s]*(\d+\/\d+)/i);
  if (bpMatch) findings.vitalSigns['Blood Pressure'] = bpMatch[1];
  
  // Extract all BP readings
  const bpReadings = text.match(/(\d+\/\d+)\s*(?:mmHg|mm Hg)/gi);
  if (bpReadings && bpReadings.length > 0 && !morningMatch && !eveningMatch) {
    findings.vitalSigns['Blood Pressure'] = bpReadings[0].replace(/mmHg|mm Hg/gi, '').trim();
  }
  
  // Extract pulse pressure
  const pulsePresMatch = text.match(/Pulse Pressure[:\s]+(\d+)/i);
  if (pulsePresMatch) findings.vitalSigns['Pulse Pressure'] = pulsePresMatch[1] + ' mmHg';
  
  const pulseMatch = text.match(/Pulse[:\s]+(\d+)/i);
  if (pulseMatch) findings.vitalSigns['Pulse'] = pulseMatch[1];
  
  const tempMatch = text.match(/Temperature[:\s]+(\d+)/i);
  if (tempMatch) findings.vitalSigns['Temperature'] = tempMatch[1];
  
  const respMatch = text.match(/Respirations[:\s]+(\d+)/i);
  if (respMatch) findings.vitalSigns['Respirations'] = respMatch[1];
  
  // Extract Diagnosis - improved patterns
  // Look for hypertension status
  const hypertensionMatch = text.match(/Stage \d+ Hypertension|Hypertension|Elevated.*pressure/i);
  if (hypertensionMatch) findings.diagnosis.push(hypertensionMatch[0]);
  
  // Look for clinical patterns
  const nonDippingMatch = text.match(/Non-Dipping.*pattern/i);
  if (nonDippingMatch) findings.diagnosis.push('Non-Dipping Blood Pressure Pattern');
  
  // Extract from Assessment section
  const assessmentMatch = text.match(/Assessment.*?Diagnosis(.+?)(?=Plan:|$)/is);
  if (assessmentMatch) {
    const diagnosisText = assessmentMatch[1];
    const lines = diagnosisText.split('\n').filter(l => l.trim() && l.match(/^\d+\./));
    findings.diagnosis.push(...lines.map(l => l.replace(/^\d+\./, '').trim()).slice(0, 5));
  }
  
  // Extract from problem list
  if (findings.diagnosis.length === 0) {
    const problemMatch = text.match(/Problem List(.+?)(?=Assessment|Plan|$)/is);
    if (problemMatch) {
      const lines = problemMatch[1].split('\n').filter(l => l.trim() && l.match(/^\d+\./));
      findings.diagnosis = lines.map(l => l.replace(/^\d+\./, '').trim()).slice(0, 5);
    }
  }
  
  // Extract Physical Exam findings
  const examMatch = text.match(/Physical Examination(.+?)(?=Initial Problem|Assessment|$)/is);
  if (examMatch) {
    const examText = examMatch[1];
    if (examText.match(/murmur/i) && !examText.match(/no.*murmur/i)) findings.physicalExam.push('Heart murmur detected');
    if (examText.match(/crackles/i) && !examText.match(/no.*crackles/i)) findings.physicalExam.push('Lung crackles present');
    if (examText.match(/edema/i) && !examText.match(/no.*edema/i)) findings.physicalExam.push('Edema noted');
    if (examText.match(/normal/i)) findings.physicalExam.push('Multiple systems examined');
  }
  
  // Extract Medications - improved
  const medMatch = text.match(/(?:Start|Medication|Prescribe)[:\s]+([A-Z][a-z]+(?:in|ol|ide|pril|pine|statin|cillin|tan)[^\n]*)/gi);
  if (medMatch) {
    findings.medications = medMatch.map(m => m.replace(/Start|Medication|Prescribe/gi, '').trim()).slice(0, 5);
  }
  
  // Extract Allergies
  const allergyMatch = text.match(/Allergy:(.+?)(?=\n|$)/i);
  if (allergyMatch) findings.allergies.push(allergyMatch[1].trim());
  
  // Extract Risk Factors
  const lower = text.toLowerCase();
  if (lower.includes('hypertension') || lower.includes('htn')) findings.riskFactors.push('Hypertension');
  if (lower.includes('diabetes') && !lower.match(/no diabetes|not.*diabetes/i)) findings.riskFactors.push('Diabetes');
  if (lower.match(/smok(ing|er)|tobacco use:(?!.*none)/i) && !lower.match(/tobacco use:\s*none|does not smoke/i)) findings.riskFactors.push('Smoking history');
  if (lower.includes('family history') && lower.match(/heart|cad|coronary|cardiac/i)) findings.riskFactors.push('Family history of heart disease');
  if (lower.includes('obesity') || lower.includes('overweight')) findings.riskFactors.push('Obesity');
  
  return findings;
}

export function generateClinicalSummary(findings: ClinicalFindings): string {
  const parts: string[] = [];
  
  if (findings.chiefComplaint) {
    parts.push(`Patient presents with: ${findings.chiefComplaint.substring(0, 100)}.`);
  }
  
  if (Object.keys(findings.vitalSigns).length > 0) {
    const vitals = Object.entries(findings.vitalSigns).map(([k, v]) => `${k}: ${v}`).join(', ');
    parts.push(`Vital signs show ${vitals}.`);
  }
  
  if (findings.diagnosis.length > 0) {
    parts.push(`Primary concerns: ${findings.diagnosis.slice(0, 2).join(', ')}.`);
  }
  
  if (findings.riskFactors.length > 0) {
    parts.push(`Risk factors include ${findings.riskFactors.join(', ')}.`);
  }
  
  if (parts.length === 0) {
    return 'Clinical history document processed. Please consult with your healthcare provider for detailed interpretation.';
  }
  
  return parts.join(' ');
}
