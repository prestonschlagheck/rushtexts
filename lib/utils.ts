export function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}



export function isOptOutKeyword(message: string): boolean {
  const optOutKeywords = ['STOP', 'STOPALL', 'UNSUBSCRIBE', 'CANCEL', 'END', 'QUIT'];
  const normalizedMessage = message.trim().toUpperCase();
  return optOutKeywords.includes(normalizedMessage);
}

export function verifyWebhookSecret(request: Request): boolean {
  const providedSecret = request.headers.get('x-webhook-secret');
  const expectedSecret = process.env.WEBHOOK_SECRET;
  
  if (!expectedSecret) {
    console.warn('WEBHOOK_SECRET not configured');
    return false;
  }
  
  return providedSecret === expectedSecret;
}
