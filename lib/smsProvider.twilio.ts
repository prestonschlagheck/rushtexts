import { Twilio } from 'twilio';
import { SMSProvider, SMSConfig } from './smsProvider';

export class TwilioSMSProvider implements SMSProvider {
  private client: Twilio;
  private fromNumber: string;

  constructor(config: SMSConfig) {
    this.client = new Twilio(config.accountSid, config.authToken);
    this.fromNumber = config.fromNumber;
  }

  async sendMessage(to: string, body: string, statusCallbackUrl?: string): Promise<{ sid: string }> {
    try {
      const message = await this.client.messages.create({
        to,
        from: this.fromNumber,
        body,
        statusCallback: statusCallbackUrl,
      });

      return { sid: message.sid };
    } catch (error) {
      console.error('Twilio SMS error:', error);
      throw new Error(`Failed to send SMS: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}

// Factory function to create the SMS provider
export function createSMSProvider(): SMSProvider {
  const config: SMSConfig = {
    accountSid: process.env.TWILIO_ACCOUNT_SID!,
    authToken: process.env.TWILIO_AUTH_TOKEN!,
    fromNumber: process.env.TWILIO_MESSAGING_FROM!,
  };

  if (!config.accountSid || !config.authToken || !config.fromNumber) {
    throw new Error('Missing required Twilio configuration');
  }

  return new TwilioSMSProvider(config);
}
