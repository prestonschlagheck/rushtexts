import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    // Check if database is configured
    if (!process.env.DATABASE_URL) {
      return NextResponse.json(
        { messages: [], warning: 'Database not configured' },
        { status: 200 }
      );
    }

    const messages = await prisma.message.findMany({
      orderBy: { createdAt: 'desc' },
      take: 1000, // Limit to last 1000 messages for performance
    });

    return NextResponse.json({ messages });
  } catch (error) {
    console.error('Messages API error:', error);
    return NextResponse.json(
      { messages: [], error: 'Failed to fetch messages' },
      { status: 200 } // Return 200 but with empty array for graceful degradation
    );
  }
}
