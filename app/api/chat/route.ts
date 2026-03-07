import { NextRequest, NextResponse } from 'next/server';
import Groq from 'groq-sdk';

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY || '',
});

export async function POST(request: NextRequest) {
  try {
    const { messages } = await request.json();

    if (!messages || messages.length === 0) {
      return NextResponse.json({ error: 'No messages provided' }, { status: 400 });
    }

    const systemPrompt = `You are a helpful medical AI assistant. You provide information about health, medical terms, and test results. 
    You explain complex medical concepts in simple terms. You are empathetic and supportive.
    IMPORTANT: Always remind users that you provide general information only and they should consult healthcare professionals for medical advice.
    Format your responses with clear paragraphs and bullet points when appropriate.`;

    const completion = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [
        { role: 'system', content: systemPrompt },
        ...messages,
      ],
      temperature: 0.7,
      max_tokens: 500,
    });

    const response = completion.choices[0].message.content;

    return NextResponse.json({
      success: true,
      message: response,
    });
  } catch (error) {
    console.error('Chat API error:', error);
    return NextResponse.json({ 
      error: 'Failed to get AI response',
      fallback: true 
    }, { status: 500 });
  }
}
