import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
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

  const { searchParams } = new URL(request.url);
  const metricType = searchParams.get('type');

  const metrics = await prisma.healthMetric.findMany({
    where: {
      userId,
      ...(metricType && { type: metricType }),
    },
    orderBy: { date: 'asc' },
  });

  return NextResponse.json({ success: true, metrics });
}

export async function POST(request: NextRequest) {
  try {
    const userId = getUserIdFromToken(request);
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const data = await request.json();
    
    const metric = await prisma.healthMetric.create({
      data: {
        userId,
        type: data.type || data.metricType,
        value: data.value,
        systolic: data.systolic,
        diastolic: data.diastolic,
        date: new Date(),
      },
    });

    return NextResponse.json({ success: true, metric });
  } catch (error) {
    console.error('Health metrics error:', error);
    return NextResponse.json({ error: 'Failed to save metric' }, { status: 500 });
  }
}
