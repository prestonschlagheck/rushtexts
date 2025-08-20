'use client'

import { useState, useEffect } from 'react'

interface Message {
  id: string
  to: string
  name?: string
  body: string
  providerSid?: string
  status: string
  errorCode?: string
  createdAt: string
  updatedAt: string
}

interface InboundMessage {
  id: string
  from: string
  body: string
  createdAt: string
}

export default function LogsPage() {
  const [messages, setMessages] = useState<Message[]>([])
  const [inbound, setInbound] = useState<InboundMessage[]>([])
  const [activeTab, setActiveTab] = useState<'messages' | 'inbound'>('messages')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    setIsLoading(true)
    try {
      const [messagesRes, inboundRes] = await Promise.all([
        fetch('/api/logs/messages'),
        fetch('/api/logs/inbound')
      ])

      if (messagesRes.ok) {
        const messagesData = await messagesRes.json()
        setMessages(messagesData.messages || [])
      }

      if (inboundRes.ok) {
        const inboundData = await inboundRes.json()
        setInbound(inboundData.inbound || [])
      }
    } catch (error) {
      console.error('Failed to fetch data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleDeleteMessage = async (messageId: string, type: 'message' | 'inbound') => {
    if (!confirm('Are you sure you want to delete this message? This action cannot be undone.')) {
      return
    }

    try {
      const response = await fetch(`/api/logs/${type === 'message' ? 'messages' : 'inbound'}/${messageId}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        if (type === 'message') {
          setMessages(prev => prev.filter(m => m.id !== messageId))
        } else {
          setInbound(prev => prev.filter(m => m.id !== messageId))
        }
      } else {
        alert('Failed to delete message. Please try again.')
      }
    } catch (error) {
      console.error('Delete failed:', error)
      alert('Failed to delete message. Please try again.')
    }
  }

  const handleExport = async (type: 'messages' | 'inbound' | 'optouts') => {
    try {
      const response = await fetch(`/api/export?type=${type}`)
      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `${type}-${new Date().toISOString().split('T')[0]}.csv`
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)
      }
    } catch (error) {
      console.error('Export failed:', error)
      alert('Export failed. Please try again.')
    }
  }

  const getStatusBadge = (status: string) => {
    const baseClasses = 'px-2 py-1 text-xs font-medium rounded-full'
    switch (status) {
      case 'delivered':
        return `${baseClasses} bg-green-100 text-green-800`
      case 'sent':
        return `${baseClasses} bg-blue-100 text-blue-800`
      case 'queued':
        return `${baseClasses} bg-yellow-100 text-yellow-800`
      case 'failed':
        return `${baseClasses} bg-red-100 text-red-800`
      default:
        return `${baseClasses} bg-gray-100 text-gray-800`
    }
  }

  const filteredMessages = statusFilter === 'all' 
    ? messages 
    : messages.filter(m => m.status === statusFilter)

  if (isLoading) {
    return (
      <div className="px-4 py-6 sm:px-0">
        <div className="text-center">
          <div className="text-gray-600">Loading...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="pt-4 sm:pt-8">
      <div className="mb-6 sm:mb-8 text-center px-2">
        <h1 className="text-2xl sm:text-3xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>Message Logs</h1>
        <p className="text-base sm:text-lg" style={{ color: 'var(--text-secondary)' }}>
          Track delivery status and monitor inbound replies
        </p>
      </div>

      {/* Tabs and Controls */}
      <div className="linear-card mb-6">
        <div className="border-b" style={{ borderColor: 'var(--border)' }}>
          <nav className="-mb-px flex px-4 sm:px-6 overflow-x-auto">
            <button
              onClick={() => setActiveTab('messages')}
              className={`py-3 sm:py-4 px-3 sm:px-1 mr-6 sm:mr-8 border-b-2 font-medium text-xs sm:text-sm transition-colors whitespace-nowrap ${
                activeTab === 'messages'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <span className="hidden sm:inline">Sent Messages</span>
              <span className="sm:hidden">Sent</span>
              <span className="ml-1">({messages.length})</span>
            </button>
            <button
              onClick={() => setActiveTab('inbound')}
              className={`py-3 sm:py-4 px-3 sm:px-1 border-b-2 font-medium text-xs sm:text-sm transition-colors whitespace-nowrap ${
                activeTab === 'inbound'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <span className="hidden sm:inline">Inbound Replies</span>
              <span className="sm:hidden">Replies</span>
              <span className="ml-1">({inbound.length})</span>
            </button>
          </nav>
        </div>

        <div className="p-4 sm:p-6">
          <div className="flex flex-col space-y-4">
            {/* Filters */}
            {activeTab === 'messages' && (
              <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-4">
                <label className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>Filter by status:</label>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="border rounded-md px-3 py-2 text-sm bg-white text-gray-900 max-w-xs"
                  style={{ borderColor: 'var(--border)' }}
                >
                  <option value="all">All</option>
                  <option value="queued">Queued</option>
                  <option value="sent">Sent</option>
                  <option value="delivered">Delivered</option>
                  <option value="failed">Failed</option>
                </select>
              </div>
            )}

            {/* Export Buttons */}
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
              <button
                onClick={() => handleExport('messages')}
                className="bg-green-600 hover:bg-green-700 text-white text-sm font-medium py-2 px-4 rounded-md transition-colors text-center"
              >
                📤 Export Messages
              </button>
              <button
                onClick={() => handleExport('inbound')}
                className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium py-2 px-4 rounded-md transition-colors text-center"
              >
                📥 Export Inbound
              </button>
              <button
                onClick={() => handleExport('optouts')}
                className="bg-gray-600 hover:bg-gray-700 text-white text-sm font-medium py-2 px-4 rounded-md transition-colors text-center"
              >
                🚫 Export Opt-outs
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Data Display */}
      <div className="linear-card overflow-hidden">
        {activeTab === 'messages' ? (
          <>
            {/* Desktop Table */}
            <div className="hidden lg:block overflow-x-auto">
              <table className="min-w-full divide-y" style={{ borderColor: 'var(--border)' }}>
                <thead style={{ backgroundColor: 'var(--surface-hover)' }}>
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--text-secondary)' }}>
                      To
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--text-secondary)' }}>
                      Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--text-secondary)' }}>
                      Message
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--text-secondary)' }}>
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--text-secondary)' }}>
                      Sent At
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--text-secondary)' }}>
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y" style={{ borderColor: 'var(--border)' }}>
                  {filteredMessages.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-4 text-center" style={{ color: 'var(--text-muted)' }}>
                        No messages found
                      </td>
                    </tr>
                  ) : (
                    filteredMessages.map((message) => (
                      <tr key={message.id} className="hover:bg-gray-50 transition-colors duration-150">
                        <td className="px-6 py-4 whitespace-nowrap text-sm" style={{ color: 'var(--text-primary)' }}>
                          {message.to}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm" style={{ color: 'var(--text-secondary)' }}>
                          {message.name || '-'}
                        </td>
                        <td className="px-6 py-4 text-sm max-w-xs truncate" style={{ color: 'var(--text-primary)' }}>
                          {message.body}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={getStatusBadge(message.status)}>
                            {message.status}
                          </span>
                          {message.errorCode && (
                            <div className="text-xs text-red-600 mt-1">
                              {message.errorCode}
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm" style={{ color: 'var(--text-secondary)' }}>
                          {new Date(message.createdAt).toLocaleString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <button
                            onClick={() => handleDeleteMessage(message.id, 'message')}
                            className="text-red-500 hover:text-red-700 hover:bg-red-50 transition-all duration-200 p-2 rounded-md"
                            title="Delete message"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
            
            {/* Mobile Cards */}
            <div className="lg:hidden">
              {filteredMessages.length === 0 ? (
                <div className="p-6 text-center" style={{ color: 'var(--text-muted)' }}>
                  No messages found
                </div>
              ) : (
                <div className="divide-y" style={{ borderColor: 'var(--border)' }}>
                  {filteredMessages.map((message) => (
                    <div key={message.id} className="p-4 space-y-3">
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-2 mb-1">
                            <span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                              📱 {message.to}
                            </span>
                            {message.name && (
                              <span className="text-xs px-2 py-1 rounded-full bg-blue-100 text-blue-800">
                                {message.name}
                              </span>
                            )}
                          </div>
                          <div className="text-sm mb-2" style={{ color: 'var(--text-primary)' }}>
                            {message.body}
                          </div>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                              <span className={getStatusBadge(message.status)}>
                                {message.status}
                              </span>
                              {message.errorCode && (
                                <span className="text-xs text-red-600">
                                  {message.errorCode}
                                </span>
                              )}
                            </div>
                            <div className="text-xs" style={{ color: 'var(--text-muted)' }}>
                              {new Date(message.createdAt).toLocaleString()}
                            </div>
                          </div>
                        </div>
                        <button
                          onClick={() => handleDeleteMessage(message.id, 'message')}
                          className="ml-2 text-red-500 hover:text-red-700 hover:bg-red-50 transition-all duration-200 p-2 rounded-md"
                          title="Delete message"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        ) : (
          <>
            {/* Desktop Table */}
            <div className="hidden lg:block overflow-x-auto">
              <table className="min-w-full divide-y" style={{ borderColor: 'var(--border)' }}>
                <thead style={{ backgroundColor: 'var(--surface-hover)' }}>
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--text-secondary)' }}>
                      From
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--text-secondary)' }}>
                      Message
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--text-secondary)' }}>
                      Received At
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--text-secondary)' }}>
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y" style={{ borderColor: 'var(--border)' }}>
                  {inbound.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="px-6 py-4 text-center" style={{ color: 'var(--text-muted)' }}>
                        No inbound messages found
                      </td>
                    </tr>
                  ) : (
                    inbound.map((message) => (
                      <tr key={message.id} className="hover:bg-gray-50 transition-colors duration-150">
                        <td className="px-6 py-4 whitespace-nowrap text-sm" style={{ color: 'var(--text-primary)' }}>
                          {message.from}
                        </td>
                        <td className="px-6 py-4 text-sm" style={{ color: 'var(--text-primary)' }}>
                          {message.body}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm" style={{ color: 'var(--text-secondary)' }}>
                          {new Date(message.createdAt).toLocaleString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <button
                            onClick={() => handleDeleteMessage(message.id, 'inbound')}
                            className="text-red-600 hover:text-red-800 transition-colors p-1"
                            title="Delete message"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
            
            {/* Mobile Cards */}
            <div className="lg:hidden">
              {inbound.length === 0 ? (
                <div className="p-6 text-center" style={{ color: 'var(--text-muted)' }}>
                  No inbound messages found
                </div>
              ) : (
                <div className="divide-y" style={{ borderColor: 'var(--border)' }}>
                  {inbound.map((message) => (
                    <div key={message.id} className="p-4 space-y-3">
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                              📞 {message.from}
                            </span>
                            <div className="text-xs" style={{ color: 'var(--text-muted)' }}>
                              {new Date(message.createdAt).toLocaleString()}
                            </div>
                          </div>
                          <div className="text-sm" style={{ color: 'var(--text-primary)' }}>
                            {message.body}
                          </div>
                        </div>
                        <button
                          onClick={() => handleDeleteMessage(message.id, 'inbound')}
                          className="ml-2 text-red-500 hover:text-red-700 hover:bg-red-50 transition-all duration-200 p-2 rounded-md"
                          title="Delete message"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </div>

      <div className="mt-6 flex justify-center">
        <button
          onClick={fetchData}
          className="linear-button linear-button-secondary w-full sm:w-auto"
        >
          🔄 Refresh Data
        </button>
      </div>
    </div>
  )
}
