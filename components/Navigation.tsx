'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

export function Navigation() {
  const pathname = usePathname()

  const navigation = [
    { name: 'Home', href: '/' },
    { name: 'Send', href: '/send' },
    { name: 'Logs', href: '/logs' },
  ]

  return (
    <nav className="linear-nav sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6">
        {/* Desktop Navigation */}
        <div className="hidden sm:flex justify-between items-center h-20">
          <div className="flex items-center">
            <Link href="/" className="flex items-center space-x-4 group">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-200 group-hover:scale-105" style={{ backgroundColor: 'var(--primary)' }}>
                {/* SigEp Logo - Simplified Greek Letters */}
                <div className="text-white font-bold text-xl tracking-wide">ΣΦΕ</div>
              </div>
              <div className="flex flex-col">
                <h1 className="text-xl font-bold tracking-tight" style={{ color: 'var(--text-primary)' }}>SigEpRM</h1>
                <p className="text-sm font-medium" style={{ color: 'var(--text-muted)' }}>Rush Management</p>
              </div>
            </Link>
          </div>
          
          {/* Centered Navigation */}
          <div className="flex items-center space-x-2">
            {navigation.map((item) => {
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`nav-link px-6 py-3 rounded-xl text-sm font-semibold transition-all duration-200 ${
                    isActive ? 'nav-link-active' : ''
                  }`}
                >
                  {item.name}
                </Link>
              )
            })}
          </div>
          
          <div className="w-48"></div> {/* Spacer for balance */}
        </div>

        {/* Mobile Navigation */}
        <div className="sm:hidden">
          {/* Top section with logo */}
          <div className="flex justify-center items-center h-16 border-b" style={{ borderColor: 'var(--border)' }}>
            <Link href="/" className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: 'var(--primary)' }}>
                <div className="text-white font-bold text-lg">ΣΦΕ</div>
              </div>
              <div className="flex flex-col">
                <h1 className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>SigEpRM</h1>
                <p className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>Rush Management</p>
              </div>
            </Link>
          </div>
          
          {/* Mobile navigation buttons */}
          <div className="flex justify-center space-x-2 py-3">
            {navigation.map((item) => {
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`nav-link px-4 py-2 rounded-lg text-sm font-medium ${
                    isActive ? 'nav-link-active' : ''
                  }`}
                >
                  {item.name}
                </Link>
              )
            })}
          </div>
        </div>
      </div>
    </nav>
  )
}
