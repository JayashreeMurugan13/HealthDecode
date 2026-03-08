import { NextRequest, NextResponse } from 'next/server';
import pdf from 'pdf-parse';
import { extractTextFromImage } from '@/lib/google-vision';
import { extractMedicalEntities, detectReportType } from '@/lib/medical-nlp';
import { parseRadiologyReport } from '@/lib/radiology-parser';
import { parsePrescription } from '@/lib/prescription-parser';
import { parseClinicalHistory, generateClinicalSummary } from '@/lib/clinical-parser';

interface ExtractedParameter {
  parameter: string;
  result: string | number;
  normalRange: string;
  status: 'normal' | 'low' | 'high' | 'critical';
  unit?: string;
}

function parseBloodTestResults(text: string): ExtractedParameter[] {
  const results: ExtractedParameter[] = [];
  const lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 0);
  
  console.log('Parsing text, total lines:', lines.length);
  
  // More flexible pattern matching
  const fullText = text.toLowerCase();
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].toLowerCase();
    const nextLine = (lines[i + 1] || '').toLowerCase();
    const combinedLine = line + ' ' + nextLine;
    
    // Extract all numbers from the line
    const numbers = combinedLine.match(/\b\d+\.?\d*\b/g) || [];
    
    // Hemoglobin - multiple variations
    if (line.match(/h(a)?emoglobin|hb\b|hgb/i)) {
      for (const num of numbers) {
        const val = parseFloat(num);
        if (val > 5 && val < 25) {
          results.push(analyzeParameter('hemoglobin', val));
          break;
        }
      }
    }
    
    // RBC
    if (line.match(/rbc|red.*blood.*cell|erythrocyte/i)) {
      for (const num of numbers) {
        const val = parseFloat(num);
        if (val > 2 && val < 10) {
          results.push(analyzeParameter('rbc', val));
          break;
        }
      }
    }
    
    // WBC/TLC
    if (line.match(/wbc|white.*blood.*cell|leukocyte|tlc|total.*leukocyte/i)) {
      for (const num of numbers) {
        const val = parseFloat(num);
        if (val > 1 && val < 50) {
          results.push(analyzeParameter('wbc', val * 1000));
          break;
        } else if (val > 1000 && val < 50000) {
          results.push(analyzeParameter('wbc', val));
          break;
        }
      }
    }
    
    // Platelet
    if (line.match(/platelet|plt\b/i)) {
      for (const num of numbers) {
        const val = parseFloat(num);
        if (val > 50 && val < 1000) {
          results.push(analyzeParameter('platelet', val * 1000));
          break;
        } else if (val > 50000 && val < 1000000) {
          results.push(analyzeParameter('platelet', val));
          break;
        }
      }
    }
    
    // Cholesterol (Total)
    if (line.match(/cholesterol.*total|total.*cholesterol|^cholesterol\b/i) && !line.match(/hdl|ldl/i)) {
      for (const num of numbers) {
        const val = parseFloat(num);
        if (val > 50 && val < 500) {
          results.push(analyzeParameter('cholesterol', val));
          break;
        }
      }
    }
    
    // HDL (Good Cholesterol)
    if (line.match(/hdl|good.*cholesterol/i)) {
      for (const num of numbers) {
        const val = parseFloat(num);
        if (val > 10 && val < 200) {
          results.push(analyzeParameter('hdl', val));
          break;
        }
      }
    }
    
    // LDL (Bad Cholesterol)
    if (line.match(/ldl|bad.*cholesterol/i)) {
      for (const num of numbers) {
        const val = parseFloat(num);
        if (val > 10 && val < 300) {
          results.push(analyzeParameter('ldl', val));
          break;
        }
      }
    }
    
    // Triglycerides
    if (line.match(/triglyceride|trig\b|tg\b/i)) {
      for (const num of numbers) {
        const val = parseFloat(num);
        if (val > 10 && val < 1000) {
          results.push(analyzeParameter('triglycerides', val));
          break;
        }
      }
    }
    
    // Glucose/Sugar
    if (line.match(/glucose|blood.*sugar|fbs|fasting.*sugar|sugar.*fasting/i)) {
      for (const num of numbers) {
        const val = parseFloat(num);
        if (val > 30 && val < 400) {
          results.push(analyzeParameter('glucose', val));
          break;
        }
      }
    }
    
    // HbA1c
    if (line.match(/hba1c|a1c|glycated|glycosylated/i)) {
      for (const num of numbers) {
        const val = parseFloat(num);
        if (val > 3 && val < 15) {
          results.push(analyzeParameter('hba1c', val));
          break;
        }
      }
    }
    
    // Creatinine
    if (line.match(/creatinine/i)) {
      for (const num of numbers) {
        const val = parseFloat(num);
        if (val > 0.1 && val < 10) {
          results.push(analyzeParameter('creatinine', val));
          break;
        }
      }
    }
    
    // Urea/BUN
    if (line.match(/\burea\b|bun\b|blood.*urea/i)) {
      for (const num of numbers) {
        const val = parseFloat(num);
        if (val > 5 && val < 100) {
          results.push(analyzeParameter('urea', val));
          break;
        }
      }
    }
    
    // ALT/SGPT
    if (line.match(/\balt\b|sgpt/i)) {
      for (const num of numbers) {
        const val = parseFloat(num);
        if (val > 5 && val < 500) {
          results.push(analyzeParameter('alt', val));
          break;
        }
      }
    }
    
    // AST/SGOT
    if (line.match(/\bast\b|sgot/i)) {
      for (const num of numbers) {
        const val = parseFloat(num);
        if (val > 5 && val < 500) {
          results.push(analyzeParameter('ast', val));
          break;
        }
      }
    }
    
    // TSH
    if (line.match(/\btsh\b|thyroid.*stimulating/i)) {
      for (const num of numbers) {
        const val = parseFloat(num);
        if (val > 0.01 && val < 20) {
          results.push(analyzeParameter('tsh', val));
          break;
        }
      }
    }
  }
  
  console.log('Found parameters:', results.length);
  
  // Remove duplicates
  return results.filter((r, i, arr) => 
    arr.findIndex(t => t.parameter === r.parameter) === i
  );
}

function analyzeParameter(parameter: string, value: number): ExtractedParameter {
  const ranges: Record<string, { min: number; max: number; unit: string; name: string }> = {
    hemoglobin: { min: 13, max: 17, unit: 'g/dL', name: 'Hemoglobin' },
    rbc: { min: 4.5, max: 5.5, unit: 'million/uL', name: 'RBC Count' },
    wbc: { min: 4000, max: 11000, unit: '/uL', name: 'WBC Count' },
    platelet: { min: 150000, max: 400000, unit: '/uL', name: 'Platelet Count' },
    cholesterol: { min: 0, max: 200, unit: 'mg/dL', name: 'Total Cholesterol' },
    glucose: { min: 70, max: 100, unit: 'mg/dL', name: 'Blood Glucose (Fasting)' },
    hdl: { min: 40, max: 999, unit: 'mg/dL', name: 'HDL Cholesterol' },
    ldl: { min: 0, max: 100, unit: 'mg/dL', name: 'LDL Cholesterol' },
    triglycerides: { min: 0, max: 150, unit: 'mg/dL', name: 'Triglycerides' },
    hba1c: { min: 4, max: 5.6, unit: '%', name: 'HbA1c' },
    creatinine: { min: 0.7, max: 1.3, unit: 'mg/dL', name: 'Creatinine' },
    urea: { min: 7, max: 20, unit: 'mg/dL', name: 'Blood Urea' },
    alt: { min: 7, max: 56, unit: 'U/L', name: 'ALT (SGPT)' },
    ast: { min: 10, max: 40, unit: 'U/L', name: 'AST (SGOT)' },
    tsh: { min: 0.4, max: 4.0, unit: 'mIU/L', name: 'TSH' },
  };

  const range = ranges[parameter];
  if (!range) {
    return { parameter, result: value, normalRange: 'Unknown', status: 'normal' };
  }

  let status: 'normal' | 'low' | 'high' | 'critical' = 'normal';
  if (value < range.min) {
    status = value < range.min * 0.7 ? 'critical' : 'low';
  } else if (value > range.max) {
    status = value > range.max * 1.3 ? 'critical' : 'high';
  }

  return {
    parameter: range.name,
    result: value,
    normalRange: `${range.min}-${range.max}`,
    status,
    unit: range.unit,
  };
}

export async function POST(request: NextRequest) {
  try {
    const { fileData, fileType, extractedText: preExtractedText } = await request.json();
    
    if (!fileData) {
      return NextResponse.json({ error: 'No file data provided' }, { status: 400 });
    }

    // Convert base64 back to buffer
    const dataBuffer = Buffer.from(fileData, 'base64');
    
    let extractedText = '';
    
    // If text was already extracted on client side (for images), use it
    if (preExtractedText) {
      // Decode the base64 encoded Unicode text
      extractedText = decodeURIComponent(escape(atob(fileData)));
      console.log('Using pre-extracted text from client, length:', extractedText.length);
    } else if (fileType === 'application/pdf' || fileData.startsWith('JVBER')) {
      try {
        const pdfData = await pdf(dataBuffer);
        extractedText = pdfData.text;
        console.log('PDF text extracted, length:', extractedText.length);
        
        // If PDF has readable text, use it
        if (extractedText && extractedText.trim().length > 100) {
          console.log('PDF has readable text');
        } else {
          // PDF is scanned image, try OCR
          console.log('PDF appears to be scanned, attempting OCR...');
          try {
            extractedText = await extractTextFromImage(dataBuffer);
            console.log('OCR successful, length:', extractedText?.length || 0);
          } catch (ocrError) {
            console.error('OCR failed:', ocrError);
            // If OCR fails, still try to parse whatever text we have
            if (!extractedText || extractedText.trim().length < 20) {
              return NextResponse.json({ 
                error: 'Unable to extract text from PDF. Please ensure the PDF contains readable text or upload a clear image instead.',
                success: false
              }, { status: 400 });
            }
          }
        }
      } catch (pdfError) {
        console.error('PDF parsing error:', pdfError);
        return NextResponse.json({ 
          error: 'Failed to parse PDF. The file may be corrupted or password-protected.',
          success: false
        }, { status: 400 });
      }
    } else if (fileType && fileType.startsWith('image/')) {
      // This shouldn't happen as images are processed on client side
      // But keep as fallback
      return NextResponse.json({ 
        error: 'Image processing should be done on client side. Please refresh and try again.',
        success: false
      }, { status: 400 });
    } else {
      return NextResponse.json({ 
        error: 'Unsupported file format. Please upload PDF or image files.' 
      }, { status: 400 });
    }

    // Extract medical entities using NLP
    const entities = extractMedicalEntities(extractedText);
    const reportType = detectReportType(extractedText);
    
    let parameters: any[] = [];
    let radiologyFindings: any[] = [];
    let medications: any[] = [];
    let clinicalFindings: any = null;
    let summary = '';
    let abnormalCount = 0;
    
    // Process based on report type
    if (reportType === 'blood_test') {
      parameters = parseBloodTestResults(extractedText);
      const abnormalParams = parameters.filter(p => p.status !== 'normal');
      abnormalCount = abnormalParams.length;
      
      console.log('Parsed parameters:', parameters.length);
      console.log('Parameters:', JSON.stringify(parameters, null, 2));
      
      if (parameters.length === 0) {
        console.log('No parameters found, trying alternative parsing...');
        console.log('Extracted text sample:', extractedText.substring(0, 500));
        
        // Try to find any numeric values with common patterns
        const altPatterns = [
          /cholesterol[:\s]+(\d+)/gi,
          /ldl[:\s]+(\d+)/gi,
          /hdl[:\s]+(\d+)/gi,
          /triglyceride[s]?[:\s]+(\d+)/gi,
          /glucose[:\s]+(\d+)/gi,
          /hemoglobin[:\s]+(\d+\.?\d*)/gi,
        ];
        
        const altResults: ExtractedParameter[] = [];
        for (const pattern of altPatterns) {
          const matches = extractedText.matchAll(pattern);
          for (const match of matches) {
            const paramName = match[0].split(/[:\s]/)[0].toLowerCase();
            const value = parseFloat(match[1]);
            
            if (paramName.includes('cholesterol') && !paramName.includes('hdl') && !paramName.includes('ldl')) {
              altResults.push(analyzeParameter('cholesterol', value));
            } else if (paramName.includes('ldl')) {
              altResults.push(analyzeParameter('ldl', value));
            } else if (paramName.includes('hdl')) {
              altResults.push(analyzeParameter('hdl', value));
            } else if (paramName.includes('triglyceride')) {
              altResults.push(analyzeParameter('triglycerides', value));
            } else if (paramName.includes('glucose')) {
              altResults.push(analyzeParameter('glucose', value));
            } else if (paramName.includes('hemoglobin')) {
              altResults.push(analyzeParameter('hemoglobin', value));
            }
          }
        }
        
        // Remove duplicates after alternative parsing
        parameters = altResults.filter((r, i, arr) => 
          arr.findIndex(t => t.parameter === r.parameter) === i
        );
        
        if (parameters.length === 0) {
          return NextResponse.json({ 
            error: 'No blood test parameters detected. The PDF was read successfully but no recognizable parameters were found.',
            extractedText: extractedText.substring(0, 1500),
            hint: 'Make sure your PDF contains parameter names like: Hemoglobin, Glucose, Cholesterol, RBC, WBC, Platelets, etc.',
            success: false
          }, { status: 400 });
        }
      }
      
      if (abnormalParams.length === 0) {
        summary = 'Great news! All your blood test results are within normal ranges. Your health indicators look good. Continue maintaining a healthy lifestyle with regular exercise and a balanced diet.';
      } else {
        try {
          const Groq = (await import('groq-sdk')).default;
          const groq = new Groq({ apiKey: process.env.GROQ_API_KEY || '' });
          
          const prompt = `You are a medical AI assistant helping patients understand blood test results. Analyze these results and provide a concise 2-3 sentence summary that:
1. States which values are abnormal with exact numbers
2. Explains health implications in simple terms
3. Provides one key actionable recommendation

Blood Test Results:
${parameters.map(p => `${p.parameter}: ${p.result} ${p.unit} (Normal: ${p.normalRange} ${p.unit}) - Status: ${p.status.toUpperCase()}`).join('\n')}

Be direct and professional. Avoid excessive reassurance.`;

          const completion = await groq.chat.completions.create({
            model: 'llama-3.3-70b-versatile',
            messages: [{ role: 'user', content: prompt }],
            temperature: 0.8,
            max_tokens: 300,
          });

          summary = completion.choices[0].message.content || '';
        } catch (error) {
          const criticalParams = abnormalParams.filter(p => p.status === 'critical');
          const highParams = abnormalParams.filter(p => p.status === 'high');
          const lowParams = abnormalParams.filter(p => p.status === 'low');
          
          summary = 'Your blood test results show ';
          if (criticalParams.length > 0) {
            summary += `${criticalParams.length} critical value(s) that need immediate medical attention: ${criticalParams.map(p => `${p.parameter} (${p.result} ${p.unit})`).join(', ')}. `;
          }
          if (highParams.length > 0) {
            summary += `${highParams.length} elevated value(s): ${highParams.map(p => `${p.parameter} (${p.result} ${p.unit})`).join(', ')}. `;
          }
          if (lowParams.length > 0) {
            summary += `${lowParams.length} low value(s): ${lowParams.map(p => `${p.parameter} (${p.result} ${p.unit})`).join(', ')}. `;
          }
          summary += 'Please consult your doctor to discuss these results and create a treatment plan.';
        }
      }
    } else if (reportType === 'radiology') {
      radiologyFindings = parseRadiologyReport(extractedText);
      abnormalCount = radiologyFindings.filter(f => f.severity !== 'normal').length;
      
      if (radiologyFindings.length === 0) {
        summary = 'Your radiology report has been processed. Please consult with your doctor for detailed interpretation of the imaging findings.';
      } else {
        try {
          const Groq = (await import('groq-sdk')).default;
          const groq = new Groq({ apiKey: process.env.GROQ_API_KEY || '' });
          
          const prompt = `You are a medical AI assistant. Analyze this radiology report and provide a brief 2-3 sentence summary that:
1. States what was examined and the key findings
2. Explains significance in clear medical terms
3. Recommends next steps if needed

Radiology Findings:
${radiologyFindings.map(f => `${f.anatomy}: ${f.finding} (${f.severity})`).join('\n')}

Be concise and professional. Avoid overly emotional language.`;

          const completion = await groq.chat.completions.create({
            model: 'llama-3.3-70b-versatile',
            messages: [{ role: 'user', content: prompt }],
            temperature: 0.8,
            max_tokens: 250,
          });

          summary = completion.choices[0].message.content || '';
        } catch (error) {
          const abnormalFindings = radiologyFindings.filter(f => f.severity !== 'normal');
          if (abnormalFindings.length === 0) {
            summary = `Good news! Your imaging study shows no significant abnormalities. The radiologist found normal findings in the examined areas: ${radiologyFindings.map(f => f.anatomy).join(', ')}. Continue your regular health maintenance routine.`;
          } else {
            summary = `Your imaging study of ${radiologyFindings.map(f => f.anatomy).join(', ')} has been analyzed. ${abnormalFindings.length} area(s) show findings that need attention. Please discuss these findings with your doctor to determine the next steps for your care.`;
          }
        }
      }
    } else if (reportType === 'prescription') {
      medications = parsePrescription(extractedText);
      
      if (medications.length > 0) {
        try {
          const Groq = (await import('groq-sdk')).default;
          const groq = new Groq({ apiKey: process.env.GROQ_API_KEY || '' });
          
          const prompt = `You are a medical AI assistant. Analyze this prescription and provide a brief 2-3 sentence summary that:
1. Lists the medications and their general purpose
2. Key instructions for taking them
3. When to contact doctor

Prescribed Medications:
${medications.map(m => `${m.name} - ${m.dosage}, ${m.frequency} for ${m.duration}`).join('\n')}

Be concise and professional.`;

          const completion = await groq.chat.completions.create({
            model: 'llama-3.3-70b-versatile',
            messages: [{ role: 'user', content: prompt }],
            temperature: 0.8,
            max_tokens: 250,
          });

          summary = completion.choices[0].message.content || '';
        } catch (error) {
          summary = `Your prescription includes ${medications.length} medication(s): ${medications.map(m => m.name).join(', ')}. Please take these medications exactly as prescribed by your doctor. Follow the dosage instructions carefully and complete the full course of treatment. If you experience any side effects, contact your healthcare provider immediately.`;
        }
      } else {
        summary = 'Your prescription has been processed. Please follow your doctor\'s instructions carefully and take medications as directed.';
      }
    } else if (reportType === 'clinical_history') {
      clinicalFindings = parseClinicalHistory(extractedText);
      abnormalCount = clinicalFindings.diagnosis.length;
      
      try {
        const Groq = (await import('groq-sdk')).default;
        const groq = new Groq({ apiKey: process.env.GROQ_API_KEY || '' });
        
        const prompt = `You are a medical AI assistant. Analyze this clinical report and provide a brief 2-3 sentence summary that:
1. States the chief complaint and key vital signs
2. Lists primary diagnosis/concerns
3. Mentions critical risk factors

Clinical Information:
Chief Complaint: ${clinicalFindings.chiefComplaint || 'Not specified'}
Vital Signs: ${JSON.stringify(clinicalFindings.vitalSigns)}
Diagnosis: ${clinicalFindings.diagnosis.join(', ')}
Risk Factors: ${clinicalFindings.riskFactors.join(', ')}

Be concise and professional.`;

        const completion = await groq.chat.completions.create({
          model: 'llama-3.3-70b-versatile',
          messages: [{ role: 'user', content: prompt }],
          temperature: 0.8,
          max_tokens: 250,
        });

        summary = completion.choices[0].message.content || generateClinicalSummary(clinicalFindings);
      } catch (error) {
        summary = generateClinicalSummary(clinicalFindings);
      }
      
      // Keep clinical summary brief - details shown in Clinical Findings section
      if (clinicalFindings.diagnosis.length > 0 && !summary) {
        summary = `Your clinical report has been analyzed. Your healthcare team has identified ${clinicalFindings.diagnosis.length} area(s) requiring attention. `;
        
        if (clinicalFindings.riskFactors.length > 0) {
          summary += `Managing your risk factors will be important for your treatment plan. `;
        }
        
        summary += 'Review the detailed findings below and work closely with your doctor to address these health concerns.';
      }
    } else {
      parameters = parseBloodTestResults(extractedText);
      abnormalCount = parameters.filter(p => p.status !== 'normal').length;
      
      if (parameters.length > 0) {
        const abnormalParams = parameters.filter(p => p.status !== 'normal');
        if (abnormalParams.length === 0) {
          summary = `Excellent news! Your test results show ${parameters.map(p => p.parameter).join(', ')} are all within normal ranges. Your health indicators look good. Continue maintaining a healthy lifestyle with regular exercise and a balanced diet.`;
        } else {
          try {
            const Groq = (await import('groq-sdk')).default;
            const groq = new Groq({ apiKey: process.env.GROQ_API_KEY || '' });
            
            const prompt = `You are a medical AI assistant helping patients understand blood test results. Analyze these results and provide a concise 2-3 sentence summary that:
1. States which values are abnormal with exact numbers
2. Explains health implications in simple terms
3. Provides one key actionable recommendation

Blood Test Results:
${parameters.map(p => `${p.parameter}: ${p.result} ${p.unit} (Normal: ${p.normalRange} ${p.unit}) - Status: ${p.status.toUpperCase()}`).join('\n')}

Be direct and professional. Avoid excessive reassurance.`;

            const completion = await groq.chat.completions.create({
              model: 'llama-3.3-70b-versatile',
              messages: [{ role: 'user', content: prompt }],
              temperature: 0.8,
              max_tokens: 300,
            });

            summary = completion.choices[0].message.content || '';
          } catch (error) {
            summary = `Your test results show ${abnormalParams.length} parameter(s) outside normal range: ${abnormalParams.map(p => `${p.parameter} (${p.result} ${p.unit})`).join(', ')}. Please consult your doctor to discuss these results and create a treatment plan.`;
          }
        }
      } else {
        summary = 'Your report has been processed. The system could not automatically determine the report type. Please review the extracted information and consult with your healthcare provider for proper interpretation.';
      }
    }

    return NextResponse.json({
      success: true,
      extractedText: extractedText.substring(0, 500),
      parameters,
      radiologyFindings,
      medications,
      clinicalFindings,
      entities,
      reportType,
      summary,
      abnormalCount,
    });
  } catch (error: any) {
    console.error('OCR processing error:', error);
    return NextResponse.json({ 
      error: error.message || 'Failed to process the document. Please ensure it is a valid medical report.',
      success: false 
    }, { status: 500 });
  }
}
