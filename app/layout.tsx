import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import Link from 'next/link'
import { Navigation } from '@/components/Navigation'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'SigEp Rush Messaging',
  description: 'Streamlined communication platform for fraternity recruitment',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className} style={{ backgroundColor: 'var(--background)', color: 'var(--text-primary)' }}>
        <div className="min-h-screen flex flex-col" style={{ backgroundColor: 'var(--background)' }}>
          <Navigation />
          <main className="flex-1 max-w-6xl mx-auto px-6">
            {children}
          </main>
        </div>
      </body>
    </html>
  )
}
