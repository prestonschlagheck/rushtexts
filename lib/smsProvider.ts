export interface SMSProvider {
  sendMessage(to: string, body: string, statusCallbackUrl?: string): Promise<{ sid: string }>;
}

export interface SMSConfig {
  accountSid: string;
  authToken: string;
  fromNumber: string;
}
