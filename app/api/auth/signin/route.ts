import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();
    
    // Simple validation
    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password required' }, { status: 400 });
    }
    
    // Return success - actual logic handled on client
    return NextResponse.json({ 
      success: true, 
      message: 'Login successful' 
    });
    
  } catch (error) {
    return NextResponse.json({ error: 'Login failed' }, { status: 500 });
  }
}