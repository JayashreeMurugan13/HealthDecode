// Medical NLP for entity recognition
import nlp from 'compromise';

interface MedicalEntity {
  text: string;
  type: 'test' | 'condition' | 'medication' | 'symptom' | 'anatomy' | 'value';
  start: number;
  end: number;
}

// Medical vocabularies
const MEDICAL_TESTS = ['hemoglobin', 'glucose', 'cholesterol', 'hdl', 'ldl', 'triglycerides', 'hba1c', 'creatinine', 'urea', 'alt', 'ast', 'tsh', 'rbc', 'wbc', 'platelet', 'blood pressure', 'x-ray', 'ct scan', 'mri', 'ultrasound', 'ecg', 'ekg'];
const CONDITIONS = ['diabetes', 'hypertension', 'anemia', 'hyperlipidemia', 'thyroid', 'kidney disease', 'liver disease', 'heart disease', 'fracture', 'pneumonia', 'infection'];
const MEDICATIONS = ['metformin', 'insulin', 'aspirin', 'atorvastatin', 'lisinopril', 'amlodipine', 'levothyroxine', 'omeprazole', 'ibuprofen', 'paracetamol', 'amoxicillin'];
const ANATOMY = ['heart', 'lung', 'liver', 'kidney', 'brain', 'bone', 'chest', 'abdomen', 'spine', 'joint'];

export function extractMedicalEntities(text: string): MedicalEntity[] {
  const entities: MedicalEntity[] = [];
  const lowerText = text.toLowerCase();
  
  // Extract tests
  MEDICAL_TESTS.forEach(test => {
    const regex = new RegExp(`\\b${test}\\b`, 'gi');
    let match;
    while ((match = regex.exec(text)) !== null) {
      entities.push({ text: match[0], type: 'test', start: match.index, end: match.index + match[0].length });
    }
  });
  
  // Extract conditions
  CONDITIONS.forEach(condition => {
    const regex = new RegExp(`\\b${condition}\\b`, 'gi');
    let match;
    while ((match = regex.exec(text)) !== null) {
      entities.push({ text: match[0], type: 'condition', start: match.index, end: match.index + match[0].length });
    }
  });
  
  // Extract medications
  MEDICATIONS.forEach(med => {
    const regex = new RegExp(`\\b${med}\\b`, 'gi');
    let match;
    while ((match = regex.exec(text)) !== null) {
      entities.push({ text: match[0], type: 'medication', start: match.index, end: match.index + match[0].length });
    }
  });
  
  // Extract anatomy
  ANATOMY.forEach(part => {
    const regex = new RegExp(`\\b${part}\\b`, 'gi');
    let match;
    while ((match = regex.exec(text)) !== null) {
      entities.push({ text: match[0], type: 'anatomy', start: match.index, end: match.index + match[0].length });
    }
  });
  
  // Extract numeric values with units
  const valueRegex = /(\d+\.?\d*)\s*(mg\/dl|g\/dl|mmol\/l|u\/l|miu\/l|\/ul|%|mm hg)/gi;
  let match;
  while ((match = valueRegex.exec(text)) !== null) {
    entities.push({ text: match[0], type: 'value', start: match.index, end: match.index + match[0].length });
  }
  
  return entities.sort((a, b) => a.start - b.start);
}

export function detectReportType(text: string): 'blood_test' | 'radiology' | 'prescription' | 'clinical_history' | 'unknown' {
  const lower = text.toLowerCase();
  
  // Blood test indicators (check first - highest priority for lab results)
  if (lower.match(/lipid profile|cholesterol.*ldl|hdl.*cholesterol|triglycerides.*mg|hemoglobin.*g\/dl|glucose.*mg\/dl|blood test|lab report|laboratory report|serum|plasma|test.*result.*mg\/dl/i)) {
    return 'blood_test';
  }
  
  // Radiology indicators
  if (lower.match(/x-ray|radiograph|ct scan|mri|ultrasound|sonography|imaging|radiology|impression.*findings/i)) {
    return 'radiology';
  }
  
  // Prescription indicators
  if (lower.match(/prescription|rx:|medication.*dosage|take.*daily.*tablet|capsule.*syrup|dispense/i)) {
    return 'prescription';
  }
  
  // Blood pressure report
  if (lower.match(/blood pressure.*monitoring|mmhg.*status|morning.*avg|evening.*avg|pulse pressure|abpm|non-dipping/i)) {
    return 'clinical_history';
  }
  
  // Clinical history indicators (check last - lowest priority)
  if (lower.match(/clinical.*history|case.*summary|patient.*history|medical.*history/i)) {
    return 'clinical_history';
  }
  
  return 'unknown';
}

// Medical term definitions for tooltips
export const MEDICAL_DEFINITIONS: Record<string, string> = {
  'hemoglobin': 'Protein in red blood cells that carries oxygen throughout your body',
  'glucose': 'Blood sugar level - main source of energy for your body',
  'cholesterol': 'Fatty substance in blood - high levels increase heart disease risk',
  'hdl': 'Good cholesterol - helps remove bad cholesterol from arteries',
  'ldl': 'Bad cholesterol - can build up in arteries and cause blockages',
  'triglycerides': 'Type of fat in blood - high levels increase heart disease risk',
  'hba1c': 'Average blood sugar over 2-3 months - diabetes monitoring test',
  'creatinine': 'Waste product filtered by kidneys - indicates kidney function',
  'urea': 'Waste product from protein breakdown - indicates kidney function',
  'alt': 'Liver enzyme - elevated levels indicate liver damage',
  'ast': 'Liver enzyme - elevated levels indicate liver or heart damage',
  'tsh': 'Thyroid hormone - controls metabolism and energy levels',
  'rbc': 'Red blood cells - carry oxygen to body tissues',
  'wbc': 'White blood cells - fight infections and diseases',
  'platelet': 'Blood cells that help with clotting and wound healing',
  'diabetes': 'Condition where blood sugar levels are too high',
  'hypertension': 'High blood pressure - increases risk of heart disease and stroke',
  'anemia': 'Low red blood cell count - causes fatigue and weakness',
  'x-ray': 'Imaging test using radiation to see inside the body',
  'ct scan': 'Detailed imaging test that creates cross-sectional pictures',
  'mri': 'Imaging test using magnets to create detailed body pictures',
  'metformin': 'Medication to lower blood sugar in type 2 diabetes',
  'insulin': 'Hormone that regulates blood sugar - used to treat diabetes',
  'atorvastatin': 'Medication to lower cholesterol and prevent heart disease',
};
