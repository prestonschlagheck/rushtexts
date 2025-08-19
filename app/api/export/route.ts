import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') || 'messages';

    if (type === 'messages') {
      const messages = await prisma.message.findMany({
        orderBy: { createdAt: 'desc' },
      });

      const csvData = [
        ['ID', 'To', 'Name', 'Body', 'Provider SID', 'Status', 'Error Code', 'Created At', 'Updated At'],
        ...messages.map(m => [
          m.id,
          m.to,
          m.name || '',
          m.body,
          m.providerSid || '',
          m.status,
          m.errorCode || '',
          m.createdAt.toISOString(),
          m.updatedAt.toISOString(),
        ])
      ].map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(',')).join('\n');

      return new NextResponse(csvData, {
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': `attachment; filename="messages-${new Date().toISOString().split('T')[0]}.csv"`,
        },
      });
    }

    if (type === 'inbound') {
      const inbound = await prisma.inbound.findMany({
        orderBy: { createdAt: 'desc' },
      });

      const csvData = [
        ['ID', 'From', 'Body', 'Created At'],
        ...inbound.map(i => [
          i.id,
          i.from,
          i.body,
          i.createdAt.toISOString(),
        ])
      ].map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(',')).join('\n');

      return new NextResponse(csvData, {
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': `attachment; filename="inbound-${new Date().toISOString().split('T')[0]}.csv"`,
        },
      });
    }

    if (type === 'optouts') {
      const optOuts = await prisma.optOut.findMany({
        orderBy: { createdAt: 'desc' },
      });

      const csvData = [
        ['ID', 'Phone', 'Created At'],
        ...optOuts.map(o => [
          o.id,
          o.phone,
          o.createdAt.toISOString(),
        ])
      ].map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(',')).join('\n');

      return new NextResponse(csvData, {
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': `attachment; filename="optouts-${new Date().toISOString().split('T')[0]}.csv"`,
        },
      });
    }

    return NextResponse.json(
      { error: 'Invalid export type. Use: messages, inbound, or optouts' },
      { status: 400 }
    );

  } catch (error) {
    console.error('Export API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
