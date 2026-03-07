import { NextRequest, NextResponse } from 'next/server';
import { readFile } from 'fs/promises';
import { join } from 'path';
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
  const lines = text.split('\n').map(l => l.trim());
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const nextLine = lines[i + 1] || '';
    const next2Line = lines[i + 2] || '';
    
    // Hemoglobin
    if (line.match(/^Hemoglobin$/i)) {
      const match = nextLine.match(/([\d.]+)/);
      if (match) {
        const val = parseFloat(match[1]);
        if (val > 0 && val < 25) results.push(analyzeParameter('hemoglobin', val));
      }
    } else if (line.match(/hemoglobin/i)) {
      const match = line.match(/([\d.]+)/);
      if (match) {
        const val = parseFloat(match[1]);
        if (val > 0 && val < 25) results.push(analyzeParameter('hemoglobin', val));
      }
    }
    
    // RBC Count
    if (line.match(/^RBC Count$/i) || line.match(/RBC.*Count/i)) {
      const match = (nextLine + ' ' + next2Line).match(/([\d.]+)/);
      if (match) {
        const val = parseFloat(match[1]);
        if (val > 0 && val < 10) results.push(analyzeParameter('rbc', val));
      }
    }
    
    // WBC/TLC
    if (line.match(/Total.*Leukocyte|TLC|WBC.*Count/i)) {
      const match = (line + ' ' + nextLine + ' ' + next2Line).match(/([\d.]+)/);
      if (match) {
        const val = parseFloat(match[1]);
        if (val > 0 && val < 50) results.push(analyzeParameter('wbc', val * 1000));
      }
    }
    
    // Platelet Count
    if (line.match(/platelet/i)) {
      const match = (line + ' ' + nextLine).match(/([\d.]+)/);
      if (match) {
        const val = parseFloat(match[1]);
        if (val > 1000 && val < 1000000) results.push(analyzeParameter('platelet', val));
      }
    }
    
    // Total Cholesterol
    if (line.match(/cholesterol.*total|total.*cholesterol/i)) {
      const match = (line + ' ' + nextLine).match(/([\d.]+)/);
      if (match) {
        const val = parseFloat(match[1]);
        if (val > 50 && val < 500) results.push(analyzeParameter('cholesterol', val));
      }
    }
    
    // HDL Cholesterol
    if (line.match(/HDL/i) && !line.match(/LDL/i)) {
      const match = (line + ' ' + nextLine).match(/([\d.]+)/);
      if (match) {
        const val = parseFloat(match[1]);
        if (val > 10 && val < 200) results.push(analyzeParameter('hdl', val));
      }
    }
    
    // LDL Cholesterol
    if (line.match(/LDL/i)) {
      const match = (line + ' ' + nextLine).match(/([\d.]+)/);
      if (match) {
        const val = parseFloat(match[1]);
        if (val > 10 && val < 300) results.push(analyzeParameter('ldl', val));
      }
    }
    
    // Triglycerides
    if (line.match(/triglyceride/i)) {
      const match = (line + ' ' + nextLine).match(/([\d.]+)/);
      if (match) {
        const val = parseFloat(match[1]);
        if (val > 10 && val < 1000) results.push(analyzeParameter('triglycerides', val));
      }
    }
    
    // Glucose
    if (line.match(/glucose|blood.*sugar|FBS/i)) {
      const match = (line + ' ' + nextLine).match(/([\d.]+)/);
      if (match) {
        const val = parseFloat(match[1]);
        if (val > 30 && val < 400) results.push(analyzeParameter('glucose', val));
      }
    }
    
    // HbA1c
    if (line.match(/HbA1c|A1C/i)) {
      const match = (line + ' ' + nextLine).match(/([\d.]+)/);
      if (match) {
        const val = parseFloat(match[1]);
        if (val > 3 && val < 15) results.push(analyzeParameter('hba1c', val));
      }
    }
    
    // Creatinine
    if (line.match(/creatinine/i)) {
      const match = (line + ' ' + nextLine).match(/([\d.]+)/);
      if (match) {
        const val = parseFloat(match[1]);
        if (val > 0.1 && val < 10) results.push(analyzeParameter('creatinine', val));
      }
    }
    
    // Urea/BUN
    if (line.match(/\burea\b|BUN/i)) {
      const match = (line + ' ' + nextLine).match(/([\d.]+)/);
      if (match) {
        const val = parseFloat(match[1]);
        if (val > 5 && val < 100) results.push(analyzeParameter('urea', val));
      }
    }
    
    // ALT/SGPT
    if (line.match(/ALT|SGPT/i)) {
      const match = (line + ' ' + nextLine).match(/([\d.]+)/);
      if (match) {
        const val = parseFloat(match[1]);
        if (val > 5 && val < 500) results.push(analyzeParameter('alt', val));
      }
    }
    
    // AST/SGOT
    if (line.match(/AST|SGOT/i)) {
      const match = (line + ' ' + nextLine).match(/([\d.]+)/);
      if (match) {
        const val = parseFloat(match[1]);
        if (val > 5 && val < 500) results.push(analyzeParameter('ast', val));
      }
    }
    
    // TSH
    if (line.match(/\bTSH\b/i)) {
      const match = (line + ' ' + nextLine).match(/([\d.]+)/);
      if (match) {
        const val = parseFloat(match[1]);
        if (val > 0.1 && val < 20) results.push(analyzeParameter('tsh', val));
      }
    }
  }

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
    const { fileUrl } = await request.json();
    
    if (!fileUrl) {
      return NextResponse.json({ error: 'No file URL provided' }, { status: 400 });
    }

    const filePath = join(process.cwd(), 'public', fileUrl);
    const dataBuffer = await readFile(filePath);
    
    let extractedText = '';
    
    if (fileUrl.toLowerCase().endsWith('.pdf')) {
      try {
        const pdfData = await pdf(dataBuffer);
        extractedText = pdfData.text;
        console.log('PDF text extracted, length:', extractedText.length);
        console.log('First 500 chars:', extractedText.substring(0, 500));
        
        // If PDF has minimal text, try OCR
        if (!extractedText || extractedText.trim().length < 50) {
          console.log('PDF appears to be scanned, attempting OCR...');
          try {
            extractedText = await extractTextFromImage(dataBuffer);
            console.log('OCR successful, length:', extractedText?.length || 0);
          } catch (ocrError) {
            console.error('OCR failed:', ocrError);
            return NextResponse.json({ 
              error: 'Unable to extract text from PDF. Please ensure the PDF contains readable text or is a clear scan.',
              success: false
            }, { status: 400 });
          }
        }
      } catch (pdfError) {
        console.error('PDF parsing error:', pdfError);
        return NextResponse.json({ 
          error: 'Failed to parse PDF. The file may be corrupted or password-protected.',
          success: false
        }, { status: 400 });
      }
    } else if (fileUrl.match(/\.(jpg|jpeg|png|gif|bmp|webp)$/i)) {
      try {
        extractedText = await extractTextFromImage(dataBuffer);
        console.log('Image OCR successful, length:', extractedText?.length || 0);
        
        if (!extractedText || extractedText.trim().length < 20) {
          return NextResponse.json({ 
            error: 'No text detected in image. Please ensure the image is clear and contains readable text.',
            success: false
          }, { status: 400 });
        }
      } catch (imgError) {
        console.error('Image OCR error:', imgError);
        return NextResponse.json({ 
          error: 'Failed to extract text from image. Please ensure the image is clear and readable.',
          success: false
        }, { status: 400 });
      }
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
      
      if (parameters.length === 0) {
        summary = 'No blood test parameters detected in the document.';
      } else if (abnormalParams.length === 0) {
        summary = 'Great news! All your blood test results are within normal ranges. Your health indicators look good. Continue maintaining a healthy lifestyle with regular exercise and a balanced diet.';
      } else {
        try {
          const Groq = (await import('groq-sdk')).default;
          const groq = new Groq({ apiKey: process.env.GROQ_API_KEY || '' });
          
          const prompt = `You are a compassionate medical AI assistant helping patients understand their blood test results. Analyze these results and provide a personalized, empathetic summary in 3-4 sentences that:
1. Acknowledges their specific abnormal values with exact numbers
2. Explains what these values mean for their health in simple terms
3. Provides actionable lifestyle advice (diet, exercise, habits)
4. Encourages them to consult their doctor for proper treatment

Blood Test Results:
${parameters.map(p => `${p.parameter}: ${p.result} ${p.unit} (Normal: ${p.normalRange} ${p.unit}) - Status: ${p.status.toUpperCase()}`).join('\n')}

Write in a warm, supportive tone as if speaking directly to the patient. Use "your" and "you" to make it personal.`;

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
        const abnormalFindings = radiologyFindings.filter(f => f.severity !== 'normal');
        if (abnormalFindings.length === 0) {
          summary = `Good news! Your imaging study shows no significant abnormalities. The radiologist found normal findings in the examined areas: ${radiologyFindings.map(f => f.anatomy).join(', ')}. Continue your regular health maintenance routine.`;
        } else {
          summary = `Your imaging study of ${radiologyFindings.map(f => f.anatomy).join(', ')} has been analyzed. `;
          summary += `${abnormalFindings.length} area(s) show findings that need attention: `;
          summary += abnormalFindings.map(f => `${f.anatomy} (${f.severity} - ${f.finding})`).join(', ');
          summary += '. Please discuss these findings with your doctor to determine the next steps for your care.';
        }
      }
    } else if (reportType === 'prescription') {
      medications = parsePrescription(extractedText);
      summary = medications.length > 0 
        ? `Your prescription includes ${medications.length} medication(s): ${medications.map(m => m.name).join(', ')}. Please take these medications exactly as prescribed by your doctor. Follow the dosage instructions carefully and complete the full course of treatment. If you experience any side effects, contact your healthcare provider immediately.` 
        : 'Your prescription has been processed. Please follow your doctor\'s instructions carefully and take medications as directed.';
    } else if (reportType === 'clinical_history') {
      clinicalFindings = parseClinicalHistory(extractedText);
      summary = generateClinicalSummary(clinicalFindings);
      abnormalCount = clinicalFindings.diagnosis.length;
      
      // Enhance clinical summary with more personalization
      if (clinicalFindings.diagnosis.length > 0) {
        const mainDiagnosis = clinicalFindings.diagnosis[0];
        summary += ` Your healthcare team has identified ${clinicalFindings.diagnosis.length} area(s) of concern, with ${mainDiagnosis} being the primary focus. `;
        
        if (clinicalFindings.riskFactors.length > 0) {
          summary += `Managing your risk factors (${clinicalFindings.riskFactors.join(', ')}) will be important for your treatment plan. `;
        }
        
        summary += 'Work closely with your doctor to address these health concerns and follow their recommended treatment plan.';
      }
    } else {
      parameters = parseBloodTestResults(extractedText);
      abnormalCount = parameters.filter(p => p.status !== 'normal').length;
      summary = 'Your report has been processed. The system could not automatically determine the report type. Please review the extracted information and consult with your healthcare provider for proper interpretation.';
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
