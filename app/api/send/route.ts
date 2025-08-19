import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { parsePhoneNumbers, validatePhoneRecords } from '@/lib/csv';
import { createSMSProvider } from '@/lib/smsProvider.twilio';
import { sleep } from '@/lib/utils';
import { personalizeMessage } from '@/lib/csv';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const { phoneNumbers, message } = await request.json();

    if (!phoneNumbers || !message) {
      return NextResponse.json(
        { error: 'Phone numbers and message are required' },
        { status: 400 }
      );
    }

    // Check if required services are configured
    if (!process.env.DATABASE_URL) {
      return NextResponse.json(
        { error: 'Database not configured. Please add DATABASE_URL to environment variables.' },
        { status: 500 }
      );
    }

    if (!process.env.TWILIO_ACCOUNT_SID || !process.env.TWILIO_AUTH_TOKEN || !process.env.TWILIO_MESSAGING_FROM) {
      return NextResponse.json(
        { error: 'Twilio not configured. Please add TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, and TWILIO_MESSAGING_FROM to environment variables.' },
        { status: 500 }
      );
    }

    // Parse and validate phone numbers
    const parsedRecords = parsePhoneNumbers(phoneNumbers);
    const { valid: validRecords, invalid: invalidRecords } = validatePhoneRecords(parsedRecords);

    if (validRecords.length === 0) {
      return NextResponse.json(
        { error: 'No valid phone numbers found', invalidRecords },
        { status: 400 }
      );
    }

    // Get opted-out numbers
    const optedOutNumbers = await prisma.optOut.findMany({
      where: {
        phone: {
          in: validRecords.map(r => r.phone)
        }
      },
      select: { phone: true }
    });

    const optedOutSet = new Set(optedOutNumbers.map(o => o.phone));
    const eligibleRecords = validRecords.filter(r => !optedOutSet.has(r.phone));

    if (eligibleRecords.length === 0) {
      return NextResponse.json(
        { 
          error: 'All numbers are opted out', 
          skipped: validRecords.length,
          invalidRecords 
        },
        { status: 400 }
      );
    }

    // Initialize SMS provider
    const smsProvider = createSMSProvider();
    const statusCallbackUrl = `${process.env.NEXT_PUBLIC_APP_URL}/api/status`;

    let sent = 0;
    let failed = 0;
    const errors: string[] = [];

    // Send messages with rate limiting
    for (const record of eligibleRecords) {
      try {
        const personalizedMessage = personalizeMessage(message, record.name);
        
        // Send via SMS provider
        const result = await smsProvider.sendMessage(
          record.phone,
          personalizedMessage,
          statusCallbackUrl
        );

        // Store in database
        await prisma.message.create({
          data: {
            to: record.phone,
            name: record.name,
            body: personalizedMessage,
            providerSid: result.sid,
            status: 'queued',
          },
        });

        sent++;
        
        // Rate limiting: ~1 message per second
        if (sent < eligibleRecords.length) {
          await sleep(1000);
        }
      } catch (error) {
        console.error(`Failed to send to ${record.phone}:`, error);
        
        // Store failed message in database
        await prisma.message.create({
          data: {
            to: record.phone,
            name: record.name,
            body: personalizeMessage(message, record.name),
            status: 'failed',
            errorCode: error instanceof Error ? error.message : 'Unknown error',
          },
        });

        failed++;
        errors.push(`${record.phone}: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }

    return NextResponse.json({
      success: true,
      sent,
      failed,
      skipped: validRecords.length - eligibleRecords.length,
      invalid: invalidRecords.length,
      total: validRecords.length,
      errors: errors.length > 0 ? errors : undefined,
      invalidRecords: invalidRecords.length > 0 ? invalidRecords : undefined,
    });

  } catch (error) {
    console.error('Send API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
