// Prescription parser
export interface Medication {
  name: string;
  dosage: string;
  frequency: string;
  duration: string;
  instructions: string;
}

export function parsePrescription(text: string): Medication[] {
  const medications: Medication[] = [];
  const lines = text.split('\n').filter(l => l.trim());
  
  // Common medication patterns
  const medRegex = /([A-Za-z]+(?:\s+[A-Za-z]+)?)\s+(\d+\s*(?:mg|ml|g|mcg))\s+(.+)/i;
  
  lines.forEach(line => {
    const match = line.match(medRegex);
    if (match) {
      const [, name, dosage, rest] = match;
      
      let frequency = 'As directed';
      let duration = 'As prescribed';
      let instructions = rest;
      
      // Extract frequency
      if (rest.match(/once\s+daily|od|qd/i)) frequency = 'Once daily';
      else if (rest.match(/twice\s+daily|bd|bid/i)) frequency = 'Twice daily';
      else if (rest.match(/three\s+times|tid/i)) frequency = 'Three times daily';
      else if (rest.match(/four\s+times|qid/i)) frequency = 'Four times daily';
      
      // Extract duration
      const durationMatch = rest.match(/for\s+(\d+)\s+(day|week|month)/i);
      if (durationMatch) duration = `${durationMatch[1]} ${durationMatch[2]}s`;
      
      medications.push({ name, dosage, frequency, duration, instructions });
    }
  });
  
  // Fallback: extract common medications
  const commonMeds = ['metformin', 'insulin', 'aspirin', 'atorvastatin', 'lisinopril', 'amlodipine', 'levothyroxine', 'omeprazole'];
  commonMeds.forEach(med => {
    if (text.toLowerCase().includes(med) && !medications.find(m => m.name.toLowerCase() === med)) {
      medications.push({
        name: med.charAt(0).toUpperCase() + med.slice(1),
        dosage: 'As prescribed',
        frequency: 'As directed',
        duration: 'As prescribed',
        instructions: 'Follow doctor instructions',
      });
    }
  });
  
  return medications;
}
