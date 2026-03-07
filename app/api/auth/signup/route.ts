import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { email, password, name } = await request.json();
    
    // Simple validation
    if (!email || !password || !name) {
      return NextResponse.json({ error: 'All fields required' }, { status: 400 });
    }
    
    // Return success - actual logic handled on client
    return NextResponse.json({ 
      success: true, 
      message: 'Account created successfully' 
    });
    
  } catch (error) {
    return NextResponse.json({ error: 'Signup failed' }, { status: 500 });
  }
}