import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  // Client-side data handling - return empty for now
  return NextResponse.json({ success: true, metrics: [] });
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    // Return success - data will be stored client-side
    return NextResponse.json({ 
      success: true, 
      metric: {
        ...data,
        id: Date.now().toString(),
        date: new Date().toISOString()
      }
    });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to save data' }, { status: 500 });
  }
}
