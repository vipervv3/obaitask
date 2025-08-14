'use client'

import { Sidebar } from './sidebar'
import { MobileSidebar } from './mobile-sidebar'

interface DashboardLayoutProps {
  children: React.ReactNode
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <div className="flex h-screen bg-gray-50">
      {/* Desktop sidebar */}
      <div className="hidden lg:flex">
        <Sidebar />
      </div>

      {/* Main content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Mobile header */}
        <div className="lg:hidden">
          <div className="flex items-center justify-between bg-gray-900 px-4 py-2">
            <h1 className="text-xl font-bold text-white">OBTASK AI</h1>
            <MobileSidebar />
          </div>
        </div>

        {/* Page content */}
        <main className="flex-1 overflow-x-hidden overflow-y-auto">
          <div className="container mx-auto px-6 py-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}