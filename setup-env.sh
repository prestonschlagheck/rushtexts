#!/bin/bash

echo "Setting up environment variables for SMS Broadcast App..."

cat > .env.local << EOF
# App Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Database (Leave empty for development - will use graceful fallback)
# DATABASE_URL=

# Twilio Configuration  
TWILIO_ACCOUNT_SID=your_twilio_account_sid_here
TWILIO_AUTH_TOKEN=your_twilio_auth_token_here
TWILIO_MESSAGING_FROM=+1234567890

# Security (Generate a random string for webhook verification)
WEBHOOK_SECRET=development_webhook_secret_12345
EOF

echo "✅ Environment file .env.local created successfully!"
echo ""
echo "Your Twilio configuration:"
echo "  Account SID: [Set your Twilio Account SID]"
echo "  Phone Number: [Set your Twilio phone number]"
echo ""
echo "🚀 You can now run: npm run dev"
echo ""
echo "⚠️  Note: Database is not configured for local development."
echo "   The app will work in demo mode without saving messages."
echo "   To enable full functionality, set up a database and add DATABASE_URL."
