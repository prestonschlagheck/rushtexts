'use client'

import { useState } from 'react'
import Link from 'next/link'

interface PreviewItem {
  phone: string
  name?: string
  message: string
}

interface SendResult {
  success: boolean
  sent: number
  failed: number
  skipped: number
  invalid: number
  errors?: string[]
  error?: string
}

export default function SendPage() {
  const [phoneNumbers, setPhoneNumbers] = useState('')
  const [message, setMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [preview, setPreview] = useState<PreviewItem[]>([])
  const [result, setResult] = useState<SendResult | null>(null)

  const handlePhoneNumbersChange = (value: string) => {
    setPhoneNumbers(value)
    updatePreview(value, message)
  }

  const handleMessageChange = (value: string) => {
    setMessage(value)
    updatePreview(phoneNumbers, value)
  }

  const updatePreview = (phones: string, msg: string) => {
    if (!phones.trim() || !msg.trim()) {
      setPreview([])
      return
    }

    const lines = phones.trim().split('\n').filter(line => line.trim())
    const previewItems: PreviewItem[] = []

    for (let i = 0; i < Math.min(lines.length, 3); i++) {
      const line = lines[i].trim()
      
      if (line.includes(',')) {
        // CSV format: phone,name
        const [phone, name] = line.split(',').map(s => s.trim())
        if (phone) {
          previewItems.push({
            phone,
            name: name || undefined,
            message: msg.replace(/\{\{name\}\}/g, name || 'Friend')
          })
        }
      } else if (line) {
        // Single phone number
        previewItems.push({
          phone: line,
          message: msg.replace(/\{\{name\}\}/g, 'Friend')
        })
      }
    }

    setPreview(previewItems)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setResult(null)

    try {
      const response = await fetch('/api/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          phoneNumbers,
          message,
        }),
      })

      const data = await response.json()
      setResult(data)
    } catch (error) {
      setResult({
        success: false,
        sent: 0,
        failed: 0,
        skipped: 0,
        invalid: 0,
        error: 'Failed to send messages. Please try again.'
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="pt-6">
      {/* Header Section */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>
          Send Messages
        </h1>
        <p className="text-lg" style={{ color: 'var(--text-secondary)' }}>
          Upload phone numbers and send personalized bulk SMS messages
        </p>
      </div>

      {/* Main Content */}
      <div className="flex justify-center">
        <div className="w-full max-w-5xl">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
            {/* Left Column - Form */}
            <div className="linear-card p-8">
              <h2 className="text-xl font-semibold mb-6" style={{ color: 'var(--text-primary)' }}>Message Form</h2>
              
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Phone Numbers Input */}
                <div>
                  <label htmlFor="phoneNumbers" className="block text-sm font-medium mb-2" style={{ color: 'var(--text-primary)' }}>
                    Phone Numbers
                  </label>
                  <textarea
                    id="phoneNumbers"
                    value={phoneNumbers}
                    onChange={(e) => handlePhoneNumbersChange(e.target.value)}
                    placeholder="Enter phone numbers (one per line) or paste CSV data:&#10;&#10;1234567890&#10;9876543210&#10;&#10;Or CSV format:&#10;phone,name&#10;1234567890,John&#10;9876543210,Jane"
                    className="linear-input h-40"
                    disabled={isLoading}
                  />
                  <p className="mt-1 text-sm" style={{ color: 'var(--text-muted)' }}>
                    Supports any phone format (1234567890, +1-234-567-8900, etc.) or CSV with phone,name columns
                  </p>
                </div>

                {/* Message Input */}
                <div>
                  <label htmlFor="message" className="block text-sm font-medium mb-2" style={{ color: 'var(--text-primary)' }}>
                    Message
                  </label>
                  <textarea
                    id="message"
                    value={message}
                    onChange={(e) => handleMessageChange(e.target.value)}
                    placeholder="Hello {{name}}, this is your message..."
                    className="linear-input h-32"
                    disabled={isLoading}
                    maxLength={160}
                  />
                  <div className="mt-1 flex justify-between text-sm" style={{ color: 'var(--text-muted)' }}>
                    <span>Use {'{'}{'{'} name {'}'}{'}'} for personalization</span>
                    <span>{message.length}/160 characters</span>
                  </div>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isLoading || !phoneNumbers.trim() || !message.trim()}
                  className="linear-button linear-button-primary w-full py-3 px-4 text-base flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      <span>Sending messages...</span>
                    </>
                  ) : (
                    <>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="m22 2-7 20-4-9-9-4Z"/>
                        <path d="M22 2 11 13"/>
                      </svg>
                      <span>Send Messages</span>
                    </>
                  )}
                </button>
              </form>
            </div>

            {/* Right Column - Preview and Results */}
            <div className="space-y-6">
              {/* Preview */}
              {preview.length > 0 && (
                <div className="linear-card p-8">
                  <div className="flex items-center space-x-2 mb-4">
                    <span className="text-lg">👀</span>
                    <h3 className="text-lg font-medium" style={{ color: 'var(--text-primary)' }}>Message Preview</h3>
                  </div>
                  <div className="space-y-3">
                    {preview.map((item, index) => (
                      <div key={index} className="border rounded-lg p-4" style={{ borderColor: 'var(--border)', backgroundColor: 'var(--surface-hover)' }}>
                        <div className="flex items-center justify-between mb-2">
                          <div className="text-sm font-medium flex items-center space-x-1" style={{ color: 'var(--text-primary)' }}>
                            <span>📱</span>
                            <span>{item.phone}</span>
                          </div>
                          {item.name && (
                            <div className="text-sm text-blue-600 bg-blue-100 px-2 py-1 rounded">
                              {item.name}
                            </div>
                          )}
                        </div>
                        <div className="p-3 rounded border text-sm" style={{ borderColor: 'var(--border)', backgroundColor: 'var(--surface)', color: 'var(--text-primary)' }}>
                          {item.message}
                        </div>
                      </div>
                    ))}
                    {preview.length === 3 && (
                      <div className="text-sm italic text-center py-2" style={{ color: 'var(--text-muted)' }}>
                        Showing first 3 messages...
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Results */}
              {result && (
                <div className="linear-card p-8">
                  <div className="flex items-center space-x-2 mb-4">
                    <span className="text-lg">{result.success ? '✅' : '❌'}</span>
                    <h3 className="text-lg font-medium" style={{ color: 'var(--text-primary)' }}>Send Results</h3>
                  </div>
                  
                  {result.success ? (
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div className="bg-green-50 border border-green-200 p-4 rounded-lg">
                          <div className="flex items-center space-x-2">
                            <span className="text-green-600">✅</span>
                            <div className="font-medium text-green-800">Sent</div>
                          </div>
                          <div className="text-2xl font-bold text-green-600 mt-1">{result.sent}</div>
                        </div>
                        <div className="bg-red-50 border border-red-200 p-4 rounded-lg">
                          <div className="flex items-center space-x-2">
                            <span className="text-red-600">❌</span>
                            <div className="font-medium text-red-800">Failed</div>
                          </div>
                          <div className="text-2xl font-bold text-red-600 mt-1">{result.failed}</div>
                        </div>
                        <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg">
                          <div className="flex items-center space-x-2">
                            <span className="text-yellow-600">⏭️</span>
                            <div className="font-medium text-yellow-800">Skipped</div>
                          </div>
                          <div className="text-2xl font-bold text-yellow-600 mt-1">{result.skipped}</div>
                        </div>
                        <div className="bg-gray-50 border border-gray-200 p-4 rounded-lg">
                          <div className="flex items-center space-x-2">
                            <span className="text-gray-600">⚠️</span>
                            <div className="font-medium text-gray-800">Invalid</div>
                          </div>
                          <div className="text-2xl font-bold text-gray-600 mt-1">{result.invalid}</div>
                        </div>
                      </div>

                      {result.errors && result.errors.length > 0 && (
                        <div className="mt-4 bg-red-50 border border-red-200 rounded-lg p-4">
                          <h4 className="flex items-center space-x-2 font-medium text-red-800 mb-2">
                            <span>🚨</span>
                            <span>Errors Details</span>
                          </h4>
                          <div className="text-sm text-red-600 space-y-1 max-h-32 overflow-y-auto">
                            {result.errors.map((error: string, index: number) => (
                              <div key={index} className="flex items-start space-x-2">
                                <span className="mt-1">•</span>
                                <span>{error}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      <div className="flex items-center justify-center pt-4">
                        <Link
                          href="/logs"
                          className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors flex items-center space-x-2"
                        >
                          <span>📊</span>
                          <span>View Logs</span>
                        </Link>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                      <div className="flex items-center space-x-2">
                        <span className="text-red-600">🚨</span>
                        <div className="font-medium text-red-800">Error</div>
                      </div>
                      <div className="text-sm text-red-600 mt-2">{result.error}</div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}