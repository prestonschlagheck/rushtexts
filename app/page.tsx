import Link from 'next/link'

function ConfigStatus() {
  const hasDatabase = !!process.env.DATABASE_URL
  const hasTwilio = !!(process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN && process.env.TWILIO_MESSAGING_FROM)
  const hasWebhookSecret = !!process.env.WEBHOOK_SECRET

  const allConfigured = hasDatabase && hasTwilio

  return (
    <div className="linear-card p-4 mb-4">
      <div className="text-center">
        <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full mb-3 ${
          allConfigured ? 'bg-green-100' : 'bg-yellow-100'
        }`}>
          <span className="text-xl">
            {allConfigured ? '✅' : '⚠️'}
          </span>
        </div>
        <h2 className="text-base font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>
          {allConfigured ? 'All Systems Ready' : 'Configuration Required'}
        </h2>
        <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
          {allConfigured 
            ? 'Your SMS messaging system is fully configured and ready to use.'
            : 'Some services need to be configured. See the README for setup instructions.'
          }
        </p>
      </div>
    </div>
  )
}

export default function Home() {
  return (
    <div className="pt-6">
      <div className="text-center">
        <div className="mb-6">
          <h1 className="text-4xl sm:text-5xl font-bold mb-4" style={{ color: 'var(--text-primary)' }}>
            SigEp Rush Messaging
          </h1>
          <p className="text-lg sm:text-xl mb-5" style={{ color: 'var(--text-secondary)' }}>
            Connect with potential new members efficiently
          </p>
        </div>
        
        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row justify-center items-center space-y-3 sm:space-y-0 sm:space-x-5 mb-6">
          <Link
            href="/send"
            className="action-button flex items-center space-x-3 px-6 py-3 text-base w-full sm:w-auto justify-center"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="m22 2-7 20-4-9-9-4Z"/>
              <path d="M22 2 11 13"/>
            </svg>
            <span>Send Messages</span>
          </Link>
          
          <Link
            href="/logs"
            className="action-button flex items-center space-x-3 px-6 py-3 text-base w-full sm:w-auto justify-center"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M3 3v18h18"/>
              <path d="M18.7 8l-5.1 5.2-2.8-2.7L7 14.3"/>
            </svg>
            <span>View Logs</span>
          </Link>
        </div>
        
        <ConfigStatus />
      </div>
    </div>
  )
}
