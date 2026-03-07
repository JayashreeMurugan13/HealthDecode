import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const hasGroqKey = !!process.env.GROQ_API_KEY;
  
  return NextResponse.json({
    success: true,
    groqApiKey: hasGroqKey,
    groqKeyLength: process.env.GROQ_API_KEY?.length || 0,
    message: hasGroqKey ? 'GROQ API Key configured' : 'GROQ API Key missing'
  });
}
