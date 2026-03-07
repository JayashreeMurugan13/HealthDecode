import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { parameters } = await request.json();
    
    if (!parameters || !Array.isArray(parameters)) {
      return NextResponse.json({ error: 'Invalid parameters' }, { status: 400 });
    }

    const analyzedParams = parameters.map((param: any) => {
      const value = parseFloat(param.value);
      return analyzeParameter(param.name, value);
    });

    const abnormalParams = analyzedParams.filter(p => p.status !== 'normal');
    
    let summary = '';
    if (abnormalParams.length === 0) {
      summary = 'All test results are within normal ranges.';
    } else {
      summary = `Found ${abnormalParams.length} parameter(s) that need attention: `;
      summary += abnormalParams.map(p => 
        `${p.parameter} is ${p.status} (${p.result} ${p.unit}, normal: ${p.normalRange} ${p.unit}).`
      ).join(' ');
    }

    return NextResponse.json({
      success: true,
      parameters: analyzedParams,
      summary,
      abnormalCount: abnormalParams.length,
    });
  } catch (error) {
    return NextResponse.json({ error: 'Processing failed' }, { status: 500 });
  }
}

function analyzeParameter(parameter: string, value: number) {
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
  };

  const range = ranges[parameter.toLowerCase()];
  if (!range) {
    return { parameter, result: value, normalRange: 'Unknown', status: 'normal' as const };
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
