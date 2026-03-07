import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  // Client-side data handling - return empty for now
  // Data will be managed in localStorage on client
  return NextResponse.json({ success: true, reports: [] });
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    // Return success - data will be stored client-side
    return NextResponse.json({ 
      success: true, 
      report: {
        ...data,
        id: Date.now().toString(),
        uploadDate: new Date().toISOString()
      }
    });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to save report' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  // Return success - deletion will be handled client-side
  return NextResponse.json({ success: true });
}
