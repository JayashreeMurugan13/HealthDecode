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
  
  // Enhanced medication patterns
  const medRegex = /([A-Za-z]+(?:\s+[A-Za-z]+)?)\s+(\d+\s*(?:mg|ml|g|mcg|units?))\s+(.+)/i;
  
  lines.forEach(line => {
    const match = line.match(medRegex);
    if (match) {
      const [, name, dosage, rest] = match;
      
      let frequency = 'As directed';
      let duration = 'As prescribed';
      let instructions = 'Take as directed by your physician';
      
      // Extract frequency with more patterns
      if (rest.match(/once\s+daily|od|qd|1x\/day/i)) {
        frequency = 'Once daily';
        instructions = 'Take one dose every morning';
      } else if (rest.match(/twice\s+daily|bd|bid|2x\/day/i)) {
        frequency = 'Twice daily';
        instructions = 'Take one dose in the morning and one in the evening';
      } else if (rest.match(/three\s+times|tid|3x\/day/i)) {
        frequency = 'Three times daily';
        instructions = 'Take one dose after each meal (breakfast, lunch, dinner)';
      } else if (rest.match(/four\s+times|qid|4x\/day/i)) {
        frequency = 'Four times daily';
        instructions = 'Take one dose every 6 hours';
      } else if (rest.match(/every\s+(\d+)\s+hours?/i)) {
        const hours = rest.match(/every\s+(\d+)\s+hours?/i)?.[1];
        frequency = `Every ${hours} hours`;
        instructions = `Take one dose every ${hours} hours as needed`;
      } else if (rest.match(/before\s+meals?|ac/i)) {
        frequency = 'Before meals';
        instructions = 'Take 30 minutes before eating';
      } else if (rest.match(/after\s+meals?|pc/i)) {
        frequency = 'After meals';
        instructions = 'Take immediately after eating';
      } else if (rest.match(/at\s+bedtime|hs|qhs/i)) {
        frequency = 'At bedtime';
        instructions = 'Take before going to sleep';
      } else if (rest.match(/as\s+needed|prn/i)) {
        frequency = 'As needed';
        instructions = 'Take only when symptoms occur, do not exceed recommended dose';
      }
      
      // Extract duration with more patterns
      const durationMatch = rest.match(/for\s+(\d+)\s+(day|week|month|year)s?/i);
      if (durationMatch) {
        const num = durationMatch[1];
        const unit = durationMatch[2];
        duration = `${num} ${unit}${num !== '1' ? 's' : ''}`;
      } else if (rest.match(/continue|ongoing|long[\s-]?term/i)) {
        duration = 'Ongoing (long-term)';
      } else if (rest.match(/until\s+finished|complete\s+course/i)) {
        duration = 'Until finished';
      }
      
      // Add specific instructions based on medication timing
      if (rest.match(/with\s+food/i)) {
        instructions += '. Take with food to reduce stomach upset';
      } else if (rest.match(/on\s+empty\s+stomach/i)) {
        instructions += '. Take on an empty stomach for best absorption';
      }
      
      if (rest.match(/with\s+water/i)) {
        instructions += '. Drink a full glass of water';
      }
      
      medications.push({ name, dosage, frequency, duration, instructions });
    }
  });
  
  // Enhanced fallback with detailed instructions for common medications
  const commonMeds = [
    { name: 'Metformin', use: 'diabetes management', timing: 'with meals to reduce stomach upset' },
    { name: 'Insulin', use: 'blood sugar control', timing: 'as directed, typically before meals' },
    { name: 'Aspirin', use: 'pain relief and heart health', timing: 'with food to prevent stomach irritation' },
    { name: 'Atorvastatin', use: 'cholesterol management', timing: 'at bedtime for optimal effect' },
    { name: 'Lisinopril', use: 'blood pressure control', timing: 'at the same time each day' },
    { name: 'Amlodipine', use: 'blood pressure management', timing: 'once daily, preferably in the morning' },
    { name: 'Levothyroxine', use: 'thyroid hormone replacement', timing: 'on empty stomach, 30-60 minutes before breakfast' },
    { name: 'Omeprazole', use: 'acid reflux and stomach protection', timing: 'before breakfast on an empty stomach' },
  ];
  
  commonMeds.forEach(({ name, use, timing }) => {
    if (text.toLowerCase().includes(name.toLowerCase()) && !medications.find(m => m.name.toLowerCase() === name.toLowerCase())) {
      medications.push({
        name,
        dosage: 'As prescribed by your doctor',
        frequency: 'As directed',
        duration: 'As prescribed',
        instructions: `Used for ${use}. Take ${timing}. Follow your doctor's specific instructions.`,
      });
    }
  });
  
  return medications;
}
