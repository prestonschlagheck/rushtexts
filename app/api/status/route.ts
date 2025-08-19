import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { verifyWebhookSecret } from '@/lib/utils';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    // Verify webhook secret
    if (!verifyWebhookSecret(request)) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const formData = await request.formData();
    const messageSid = formData.get('MessageSid') as string;
    const messageStatus = formData.get('MessageStatus') as string;
    const errorCode = formData.get('ErrorCode') as string;

    if (!messageSid || !messageStatus) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Update message status in database
    const updateData: any = {
      status: messageStatus,
      updatedAt: new Date(),
    };

    if (errorCode) {
      updateData.errorCode = errorCode;
    }

    await prisma.message.updateMany({
      where: {
        providerSid: messageSid,
      },
      data: updateData,
    });

    console.log(`Updated message ${messageSid} status to ${messageStatus}`);

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('Status webhook error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
