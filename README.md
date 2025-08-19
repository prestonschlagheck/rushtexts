# SMS Broadcast App

A modern web application for sending bulk SMS messages with delivery tracking, built with Next.js and Twilio.

## Features

- 📤 **Bulk SMS Sending**: Upload phone numbers via CSV or paste directly
- 🏷️ **Message Personalization**: Use `{{name}}` merge tags for personalized messages
- 📊 **Delivery Tracking**: Real-time status updates (queued/sent/delivered/failed)
- 💬 **Inbound Monitoring**: Track replies and handle opt-out requests automatically
- 🚫 **Opt-out Management**: Automatic handling of STOP keywords (STOP, UNSUBSCRIBE, etc.)
- 📥 **Data Export**: Export messages, replies, and opt-outs to CSV
- ⚡ **Rate Limiting**: Built-in rate limiting to prevent spam (~1 msg/sec)
- 🔒 **Webhook Security**: Secure webhook endpoints with secret verification

## Tech Stack

- **Frontend**: Next.js 14 (App Router), TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes
- **Database**: PostgreSQL with Prisma ORM
- **SMS Provider**: Twilio (with provider interface for easy switching)
- **Deployment**: Vercel

## Quick Start

### 1. Clone and Install

```bash
git clone <your-repo>
cd sms-broadcast-app
npm install
```

### 2. Environment Setup

Copy the environment template:
```bash
cp env.example .env.local
```

Edit `.env.local` with your configuration:

```env
# App Configuration
NEXT_PUBLIC_APP_URL=https://your-app-name.vercel.app

# Database (Vercel Postgres)
DATABASE_URL=your_postgres_connection_string

# Twilio Configuration
TWILIO_ACCOUNT_SID=your_twilio_account_sid
TWILIO_AUTH_TOKEN=your_twilio_auth_token
TWILIO_MESSAGING_FROM=+1234567890

# Security
WEBHOOK_SECRET=your_random_webhook_secret
```

### 3. Database Setup

```bash
# Generate Prisma client
npx prisma generate

# Push schema to database (for development)
npx prisma db push

# Or run migrations (for production)
npx prisma migrate deploy
```

### 4. Run Locally

```bash
npm run dev
```

Visit `http://localhost:3000` to access the application.

## Deployment

### 1. Deploy to Vercel

```bash
npm i -g vercel
vercel deploy
```

### 2. Set Environment Variables

In your Vercel dashboard:
1. Go to Project Settings → Environment Variables
2. Add all variables from your `.env.local`
3. Make sure `NEXT_PUBLIC_APP_URL` points to your Vercel domain

### 3. Set Up Database

1. In Vercel dashboard, go to Storage → Create Database → Postgres
2. Copy the connection string to `DATABASE_URL`
3. Run database migrations:
   ```bash
   npx prisma migrate deploy
   ```

### 4. Configure Twilio Webhooks

In your Twilio Console:

1. **Inbound Messages**:
   - Go to Phone Numbers → Manage → Active Numbers
   - Select your number
   - Set Webhook URL: `https://your-domain.vercel.app/api/inbound`
   - Method: POST
   - Add header: `x-webhook-secret: your_webhook_secret`

2. **Status Callbacks** (set automatically by the app):
   - The app automatically sets status callback URLs when sending messages
   - No manual configuration needed

## Usage

### Sending Messages

1. Go to **Send Messages** page
2. Enter phone numbers (one per line) or paste CSV data:
   ```
   +1234567890
   +1987654321
   ```
   
   Or CSV format:
   ```csv
   phone,name
   +1234567890,John
   +1987654321,Jane
   ```

3. Write your message (use `{{name}}` for personalization):
   ```
   Hello {{name}}, this is your personalized message!
   ```

4. Click **Send Messages**

### Viewing Logs

1. Go to **Logs** page
2. View sent messages with delivery status
3. Monitor inbound replies
4. Export data to CSV

### Opt-out Management

The app automatically handles these opt-out keywords:
- STOP, STOPALL, UNSUBSCRIBE, CANCEL, END, QUIT

When a user sends any of these:
1. They're added to the opt-out list
2. Future messages are automatically skipped
3. An optional confirmation is sent

## API Endpoints

- `POST /api/send` - Send bulk SMS messages
- `POST /api/status` - Twilio status webhook
- `POST /api/inbound` - Twilio inbound webhook  
- `GET /api/export?type=[messages|inbound|optouts]` - Export data
- `GET /api/logs/messages` - Get sent messages
- `GET /api/logs/inbound` - Get inbound messages

## Database Schema

### Messages
- `id` - Unique message ID
- `to` - Phone number (E.164 format)
- `name` - Optional recipient name
- `body` - Message content
- `providerSid` - Twilio message SID
- `status` - queued/sent/delivered/failed
- `errorCode` - Error details if failed
- `createdAt`, `updatedAt` - Timestamps

### Inbound Messages
- `id` - Unique message ID
- `from` - Sender phone number
- `body` - Message content
- `createdAt` - Timestamp

### Opt-outs
- `id` - Unique ID
- `phone` - Phone number (E.164 format)
- `createdAt` - Opt-out timestamp

## Compliance Notes

🚨 **Important**: This app is a technical tool. Ensure you comply with:

- **Consent**: Only message people who have opted in
- **Opt-out**: Respect STOP requests (handled automatically)
- **Quiet Hours**: Don't send messages late at night/early morning
- **Regulations**: Follow TCPA, CTIA, and local regulations
- **10DLC Registration**: Required for high-volume messaging in the US

## Customization

### Adding New SMS Providers

The app uses a provider interface pattern. To add a new provider:

1. Create `lib/smsProvider.newprovider.ts`
2. Implement the `SMSProvider` interface
3. Update `createSMSProvider()` function to use your new provider

### Modifying Rate Limits

Edit the `sleep()` call in `app/api/send/route.ts`:

```typescript
// Current: ~1 message per second
await sleep(1000);

// Faster: ~2 messages per second  
await sleep(500);
```

## Troubleshooting

### Common Issues

1. **Database Connection Error**
   - Verify `DATABASE_URL` is correct
   - Run `npx prisma db push` to sync schema

2. **Twilio Errors**
   - Check Account SID and Auth Token
   - Verify phone number format (+1234567890)
   - Ensure messaging service/phone number is active

3. **Webhooks Not Working**
   - Verify webhook URLs in Twilio Console
   - Check `WEBHOOK_SECRET` matches
   - Use ngrok for local testing

4. **Messages Not Sending**
   - Check Twilio account balance
   - Verify phone numbers are valid E.164 format
   - Check rate limits and account restrictions

### Local Development with Webhooks

Use ngrok to test webhooks locally:

```bash
ngrok http 3000
```

Then use the ngrok URL for Twilio webhooks:
- `https://your-ngrok-url.ngrok.io/api/inbound`
- `https://your-ngrok-url.ngrok.io/api/status`

## Support

For issues or questions:
1. Check the [Troubleshooting](#troubleshooting) section
2. Review Twilio documentation
3. Check application logs in Vercel dashboard

## License

MIT License - see LICENSE file for details.
