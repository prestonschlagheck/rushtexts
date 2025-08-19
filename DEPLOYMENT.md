# 🚀 Vercel Deployment Guide

This guide will walk you through deploying your SMS Broadcast app to Vercel with a database.

## Prerequisites

- [Vercel Account](https://vercel.com) (free tier works)
- [Twilio Account](https://twilio.com) with SMS capabilities
- Your app files ready for deployment

## Step 1: Deploy to Vercel

### Option A: Using Vercel CLI (Recommended)

1. **Install Vercel CLI**:
   ```bash
   npm i -g vercel
   ```

2. **Deploy from your project directory**:
   ```bash
   vercel
   ```

3. **Follow the prompts**:
   - Project name: `sms-broadcast-app` (or your choice)
   - Framework: Next.js (auto-detected)
   - Build settings: Default (already configured)

### Option B: Using GitHub Integration

1. Push your code to GitHub
2. Go to [Vercel Dashboard](https://vercel.com/dashboard)
3. Click "New Project"
4. Import your GitHub repository
5. Deploy with default settings

## Step 2: Set Up Database

1. **In Vercel Dashboard**:
   - Go to your project
   - Click "Storage" tab
   - Click "Create Database"
   - Select "Postgres"
   - Choose a name (e.g., `sms-app-db`)
   - Select region (closest to your users)

2. **Get Database Connection**:
   - Copy the `DATABASE_URL` from the database dashboard
   - Copy the `DIRECT_URL` as well

## Step 3: Configure Environment Variables

In your Vercel project dashboard:

1. **Go to Settings → Environment Variables**

2. **Add these variables**:

   ```bash
   # App URL (your Vercel domain)
   NEXT_PUBLIC_APP_URL=https://your-app-name.vercel.app

   # Database (from Step 2)
   DATABASE_URL=your_postgres_connection_string
   DIRECT_URL=your_postgres_direct_connection_string

   # Twilio Configuration
   TWILIO_ACCOUNT_SID=your_twilio_account_sid
   TWILIO_AUTH_TOKEN=your_twilio_auth_token
   TWILIO_MESSAGING_FROM=+1234567890

   # Security (generate a random string)
   WEBHOOK_SECRET=your_random_webhook_secret_here
   ```

3. **Apply to all environments** (Production, Preview, Development)

## Step 4: Set Up Database Schema

1. **Install Vercel CLI locally** (if not done):
   ```bash
   npm i -g vercel
   ```

2. **Link your project**:
   ```bash
   vercel link
   ```

3. **Run database migration**:
   ```bash
   npx prisma migrate deploy
   ```

   Or alternatively, push the schema:
   ```bash
   npx prisma db push
   ```

## Step 5: Configure Twilio Webhooks

1. **Go to Twilio Console**:
   - Phone Numbers → Manage → Active Numbers
   - Select your SMS-enabled number

2. **Set Webhook URLs**:
   - **Inbound Messages**: `https://your-app-name.vercel.app/api/inbound`
   - **Method**: POST
   - **Add Header**: `x-webhook-secret` = `your_webhook_secret`

3. **Status Callbacks** are set automatically by the app

## Step 6: Test Your Deployment

1. **Visit your app**: `https://your-app-name.vercel.app`

2. **Check Configuration Status** on homepage:
   - ✅ Database Connection
   - ✅ Twilio Configuration
   - ✅ Webhook Secret

3. **Test sending a message**:
   - Go to Send Messages page
   - Enter a test phone number
   - Send a test message
   - Check Logs page for delivery status

## Step 7: Domain Setup (Optional)

1. **Custom Domain**:
   - Go to Project Settings → Domains
   - Add your custom domain
   - Update `NEXT_PUBLIC_APP_URL` to your custom domain
   - Update Twilio webhook URLs

## Troubleshooting

### Common Issues

1. **Database Connection Error**:
   - Verify `DATABASE_URL` is correct
   - Run `npx prisma generate` locally
   - Redeploy the app

2. **Twilio Not Working**:
   - Verify Account SID, Auth Token, and phone number
   - Check Twilio account balance
   - Ensure phone number is SMS-enabled

3. **Webhooks Not Working**:
   - Verify webhook URLs in Twilio Console
   - Check `WEBHOOK_SECRET` matches
   - Look at Vercel function logs

4. **Build Errors**:
   - Check Vercel deployment logs
   - Ensure all dependencies are in `package.json`
   - Verify TypeScript/ESLint issues

### Monitoring

- **Vercel Dashboard**: Monitor function executions and errors
- **Twilio Console**: Monitor SMS delivery and webhook calls
- **App Logs Page**: View message status and delivery

## Production Considerations

1. **Rate Limits**: Built-in 1 msg/sec rate limiting
2. **Opt-out Compliance**: Automatic STOP keyword handling
3. **Data Export**: CSV export functionality for compliance
4. **Webhook Security**: Secret verification on all webhooks
5. **Error Handling**: Graceful degradation for missing services

## Scaling

For high-volume usage:
- Upgrade Vercel plan for longer function timeouts
- Consider Twilio SendGrid for higher throughput
- Add Redis for queue management
- Implement background job processing

## Support

- [Vercel Documentation](https://vercel.com/docs)
- [Twilio SMS Documentation](https://www.twilio.com/docs/sms)
- [Next.js Documentation](https://nextjs.org/docs)

---

🎉 **Your SMS Broadcast app is now live!**

Remember to comply with SMS regulations and always get proper consent before sending messages.
