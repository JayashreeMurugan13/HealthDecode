import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { sendReportEmail } from '@/lib/email';
import fs from 'fs';
import path from 'path';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

function getUserIdFromToken(request: NextRequest): string | null {
  const token = request.cookies.get('auth_token')?.value;
  if (!token) return null;
  
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };
    return decoded.userId;
  } catch {
    return null;
  }
}

export async function GET(request: NextRequest) {
  const userId = getUserIdFromToken(request);
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const reports = await prisma.report.findMany({
    where: { userId },
    orderBy: { uploadDate: 'desc' },
  });

  const reportsWithParsedData = reports.map(r => ({
    ...r,
    extractedData: JSON.parse(r.extractedData),
  }));

  return NextResponse.json({ success: true, reports: reportsWithParsedData });
}

export async function POST(request: NextRequest) {
  try {
    const userId = getUserIdFromToken(request);
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const data = await request.json();
    
    const report = await prisma.report.create({
      data: {
        userId,
        fileName: data.fileName,
        fileUrl: data.fileUrl,
        fileType: data.fileType,
        uploadDate: new Date(),
        status: data.status || 'completed',
        reportType: data.reportType || 'Blood Test',
        extractedData: JSON.stringify(data.extractedData),
        aiSummary: data.aiSummary,
        abnormalCount: data.abnormalCount || 0,
      },
    });

    // Send email notification if requested
    if (data.sendEmail) {
      try {
        console.log('Attempting to send email notification...');
        const user = await prisma.user.findUnique({ where: { id: userId } });
        console.log('User found:', user?.email);
        
        if (user && user.email) {
          console.log('Sending email to:', user.email);
          await sendReportEmail(
            user.email,
            user.name,
            data.fileName,
            data.aiSummary || 'Your report has been analyzed.',
            data.abnormalCount || 0,
            data.extractedData?.parameters || []
          );
          console.log('✅ Email sent successfully to:', user.email);
        } else {
          console.log('❌ No user email found');
        }
      } catch (emailError: any) {
        console.error('❌ Email sending failed:', emailError.message);
      }
    }

    return NextResponse.json({ 
      success: true, 
      report: { ...report, extractedData: JSON.parse(report.extractedData) }
    });
  } catch (error) {
    console.error('Reports API error:', error);
    return NextResponse.json({ error: 'Failed to save report' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const userId = getUserIdFromToken(request);
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Report ID required' }, { status: 400 });
    }

    const report = await prisma.report.findUnique({ where: { id } });
    
    if (report && report.userId === userId) {
      const filePath = path.join(process.cwd(), 'public', report.fileUrl.replace(/^\//, ''));
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
      
      await prisma.report.delete({ where: { id } });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete report error:', error);
    return NextResponse.json({ error: 'Failed to delete report' }, { status: 500 });
  }
}
