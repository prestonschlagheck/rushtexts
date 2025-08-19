import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { verifyWebhookSecret, isOptOutKeyword } from '@/lib/utils';
import { createSMSProvider } from '@/lib/smsProvider.twilio';

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
    const from = formData.get('From') as string;
    const body = formData.get('Body') as string;

    if (!from || !body) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Store inbound message
    await prisma.inbound.create({
      data: {
        from,
        body,
      },
    });

    // Check if it's an opt-out keyword
    if (isOptOutKeyword(body)) {
      // Add to opt-out list (or update if already exists)
      await prisma.optOut.upsert({
        where: { phone: from },
        update: { createdAt: new Date() },
        create: { phone: from },
      });

      // Send confirmation reply (optional)
      try {
        const smsProvider = createSMSProvider();
        await smsProvider.sendMessage(
          from,
          'You have been unsubscribed from our messages. Reply START to opt back in.'
        );
      } catch (error) {
        console.error('Failed to send opt-out confirmation:', error);
        // Don't fail the webhook for this
      }

      console.log(`Opted out phone number: ${from}`);
    }

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('Inbound webhook error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
