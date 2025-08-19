'use client'

import { useState } from 'react'
import Link from 'next/link'
import { parsePhoneNumbers, validatePhoneRecords, personalizeMessage } from '@/lib/csv'

export default function SendPage() {
  const [phoneNumbers, setPhoneNumbers] = useState('')
  const [message, setMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [preview, setPreview] = useState<Array<{ phone: string; name?: string; message: string }>>([])

  const handlePhoneNumbersChange = (value: string) => {
    setPhoneNumbers(value)
    updatePreview(value, message)
  }

  const handleMessageChange = (value: string) => {
    setMessage(value)
    updatePreview(phoneNumbers, value)
  }

  const updatePreview = (numbers: string, msg: string) => {
    if (!numbers.trim() || !msg.trim()) {
      setPreview([])
      return
    }

    try {
      const records = parsePhoneNumbers(numbers)
      const { valid } = validatePhoneRecords(records)
      const previewData = valid.slice(0, 3).map(record => ({
        phone: record.phone,
        name: record.name,
        message: personalizeMessage(msg, record.name)
      }))
      setPreview(previewData)
    } catch (error) {
      setPreview([])
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!phoneNumbers.trim() || !message.trim()) {
      alert('Please provide both phone numbers and message')
      return
    }

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

      if (data.success) {
        // Clear form on success
        setPhoneNumbers('')
        setMessage('')
        setPreview([])
      }
    } catch (error) {
      setResult({
        error: 'Failed to send messages. Please try again.',
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="px-4 py-6 sm:px-0">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Send Messages</h1>
        <p className="mt-2 text-gray-600">
          Upload phone numbers and send personalized bulk SMS messages
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Form */}
        <div className="bg-white shadow rounded-lg p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Phone Numbers Input */}
            <div>
              <label htmlFor="phoneNumbers" className="block text-sm font-medium text-gray-700 mb-2">
                Phone Numbers
              </label>
              <textarea
                id="phoneNumbers"
                value={phoneNumbers}
                onChange={(e) => handlePhoneNumbersChange(e.target.value)}
                placeholder="Enter phone numbers (one per line) or paste CSV data:&#10;&#10;+1234567890&#10;+1987654321&#10;&#10;Or CSV format:&#10;phone,name&#10;+1234567890,John&#10;+1987654321,Jane"
                className="w-full h-40 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                disabled={isLoading}
              />
              <p className="mt-1 text-sm text-gray-500">
                Supports E.164 format (+1234567890) or CSV with phone,name columns
              </p>
            </div>

            {/* Message Input */}
            <div>
              <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
                Message
              </label>
              <textarea
                id="message"
                value={message}
                onChange={(e) => handleMessageChange(e.target.value)}
                placeholder="Hello {{name}}, this is your message..."
                className="w-full h-32 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                disabled={isLoading}
                maxLength={160}
              />
              <div className="mt-1 flex justify-between text-sm text-gray-500">
                <span>Use {'{'}{'{'} name {'}'}{'}'} for personalization</span>
                <span>{message.length}/160 characters</span>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading || !phoneNumbers.trim() || !message.trim()}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-medium py-3 px-4 rounded-lg transition-colors flex items-center justify-center space-x-2"
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Sending messages...</span>
                </>
              ) : (
                <>
                  <span>📤</span>
                  <span>Send Messages</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* Preview and Results */}
        <div className="space-y-6">
          {/* Preview */}
          {preview.length > 0 && (
            <div className="bg-white shadow rounded-lg p-6">
              <div className="flex items-center space-x-2 mb-4">
                <span className="text-lg">👀</span>
                <h3 className="text-lg font-medium text-gray-900">Message Preview</h3>
              </div>
              <div className="space-y-3">
                {preview.map((item, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                    <div className="flex items-center justify-between mb-2">
                      <div className="text-sm font-medium text-gray-700 flex items-center space-x-1">
                        <span>📱</span>
                        <span>{item.phone}</span>
                      </div>
                      {item.name && (
                        <div className="text-sm text-blue-600 bg-blue-100 px-2 py-1 rounded">
                          {item.name}
                        </div>
                      )}
                    </div>
                    <div className="bg-white p-3 rounded border border-gray-100 text-sm text-gray-900">
                      {item.message}
                    </div>
                  </div>
                ))}
                {preview.length === 3 && (
                  <div className="text-sm text-gray-500 italic text-center py-2">
                    Showing first 3 messages...
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Results */}
          {result && (
            <div className="bg-white shadow rounded-lg p-6">
              <div className="flex items-center space-x-2 mb-4">
                <span className="text-lg">{result.success ? '✅' : '❌'}</span>
                <h3 className="text-lg font-medium text-gray-900">Send Results</h3>
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
  )
}
