import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const files = formData.getAll('files') as File[];
    
    if (!files || files.length === 0) {
      return NextResponse.json({ error: 'No files uploaded' }, { status: 400 });
    }

    const uploadedFiles = [];

    for (const file of files) {
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);
      
      // Convert to base64 for temporary storage
      const base64 = buffer.toString('base64');
      
      uploadedFiles.push({
        fileName: file.name,
        fileData: base64,
        fileType: file.type,
        size: file.size,
      });
    }

    return NextResponse.json({ 
      success: true, 
      files: uploadedFiles 
    });
  } catch (error: any) {
    console.error('Upload error:', error);
    return NextResponse.json({ 
      error: error.message || 'Upload failed',
      details: error.toString()
    }, { status: 500 });
  }
}
