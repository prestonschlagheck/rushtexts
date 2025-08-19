import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    // Check if database is configured
    if (!process.env.DATABASE_URL) {
      return NextResponse.json(
        { inbound: [], warning: 'Database not configured' },
        { status: 200 }
      );
    }

    const inbound = await prisma.inbound.findMany({
      orderBy: { createdAt: 'desc' },
      take: 1000, // Limit to last 1000 messages for performance
    });

    return NextResponse.json({ inbound });
  } catch (error) {
    console.error('Inbound API error:', error);
    return NextResponse.json(
      { inbound: [], error: 'Failed to fetch inbound messages' },
      { status: 200 } // Return 200 but with empty array for graceful degradation
    );
  }
}
