import Link from 'next/link'

function ConfigStatus() {
  const hasDatabase = !!process.env.DATABASE_URL
  const hasTwilio = !!(process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN && process.env.TWILIO_MESSAGING_FROM)
  const hasWebhookSecret = !!process.env.WEBHOOK_SECRET

  return (
    <div className="bg-white rounded-lg shadow p-6 mb-8">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">Configuration Status</h2>
      <div className="space-y-2">
        <div className="flex items-center space-x-2">
          <span className={hasDatabase ? 'text-green-600' : 'text-red-600'}>
            {hasDatabase ? '✅' : '❌'}
          </span>
          <span className="text-sm">Database Connection</span>
        </div>
        <div className="flex items-center space-x-2">
          <span className={hasTwilio ? 'text-green-600' : 'text-red-600'}>
            {hasTwilio ? '✅' : '❌'}
          </span>
          <span className="text-sm">Twilio Configuration</span>
        </div>
        <div className="flex items-center space-x-2">
          <span className={hasWebhookSecret ? 'text-green-600' : 'text-yellow-600'}>
            {hasWebhookSecret ? '✅' : '⚠️'}
          </span>
          <span className="text-sm">Webhook Secret (for production)</span>
        </div>
      </div>
      {(!hasDatabase || !hasTwilio) && (
        <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
          <p className="text-sm text-yellow-800">
            Some services are not configured. See the README for setup instructions.
          </p>
        </div>
      )}
    </div>
  )
}

export default function Home() {
  return (
    <div className="px-4 py-6 sm:px-0">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          SMS Broadcast App
        </h1>
        <p className="text-lg text-gray-600 mb-8">
          Send bulk SMS messages with delivery tracking and opt-out management
        </p>
        
        <ConfigStatus />
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl mx-auto">
          <Link
            href="/send"
            className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-4 px-6 rounded-lg text-center transition-colors"
          >
            <div className="text-xl mb-2">📤</div>
            <div className="text-lg">Send Messages</div>
            <div className="text-sm opacity-90">Upload numbers and send bulk SMS</div>
          </Link>
          
          <Link
            href="/logs"
            className="bg-green-600 hover:bg-green-700 text-white font-medium py-4 px-6 rounded-lg text-center transition-colors"
          >
            <div className="text-xl mb-2">📊</div>
            <div className="text-lg">View Logs</div>
            <div className="text-sm opacity-90">Track delivery status and replies</div>
          </Link>
        </div>

        <div className="mt-12 text-left max-w-3xl mx-auto">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">Features</h2>
          <ul className="space-y-2 text-gray-600">
            <li>• Upload phone numbers via CSV or paste directly</li>
            <li>• Personalize messages with names using {'{'}{'{'} name {'}'}{'}'} merge tags</li>
            <li>• Real-time delivery status tracking</li>
            <li>• Automatic opt-out handling (STOP keywords)</li>
            <li>• Inbound message monitoring</li>
            <li>• Export data to CSV</li>
            <li>• Rate limiting to prevent spam</li>
          </ul>
        </div>
      </div>
    </div>
  )
}
