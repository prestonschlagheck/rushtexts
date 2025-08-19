import { NextRequest, NextResponse } from 'next/server';
import { createSMSProvider } from '@/lib/smsProvider.twilio';
import { parsePhoneNumbers, validatePhoneRecords, personalizeMessage } from '@/lib/csv';

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

    // Check if Twilio is configured
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

    // Initialize SMS provider
    const smsProvider = createSMSProvider();

    let sent = 0;
    let failed = 0;
    const errors: string[] = [];
    const results: Array<{ phone: string; name?: string; message: string; status: string; sid?: string; error?: string }> = [];

    // Send messages (limit to first 3 for testing)
    const testRecords = validRecords.slice(0, 3);
    
    for (const record of testRecords) {
      try {
        const personalizedMessage = personalizeMessage(message, record.name);
        
        // Send via SMS provider
        const result = await smsProvider.sendMessage(
          record.phone,
          personalizedMessage
        );

        results.push({
          phone: record.phone,
          name: record.name,
          message: personalizedMessage,
          status: 'sent',
          sid: result.sid
        });

        sent++;
      } catch (error) {
        console.error(`Failed to send to ${record.phone}:`, error);
        
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        results.push({
          phone: record.phone,
          name: record.name,
          message: personalizeMessage(message, record.name),
          status: 'failed',
          error: errorMessage
        });

        failed++;
        errors.push(`${record.phone}: ${errorMessage}`);
      }
    }

    return NextResponse.json({
      success: true,
      mode: 'test',
      sent,
      failed,
      total: testRecords.length,
      limited: validRecords.length > 3 ? `Limited to first 3 of ${validRecords.length} valid numbers for testing` : null,
      results,
      errors: errors.length > 0 ? errors : undefined,
      invalidRecords: invalidRecords.length > 0 ? invalidRecords : undefined,
      note: 'This is test mode. Database not configured so messages are not stored.'
    });

  } catch (error) {
    console.error('Test SMS API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
