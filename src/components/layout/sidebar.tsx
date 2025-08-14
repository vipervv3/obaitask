'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { 
  LayoutDashboard, 
  FolderOpen, 
  CheckSquare, 
  Brain, 
  Video, 
  Calendar, 
  Users, 
  Settings,
  LogOut
} from 'lucide-react'
import { useAuth } from '@/components/auth/auth-provider'
import { cn } from '@/lib/utils'

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Projects', href: '/projects', icon: FolderOpen },
  { name: 'Tasks', href: '/tasks', icon: CheckSquare },
  { name: 'AI Insights', href: '/ai-insights', icon: Brain },
  { name: 'Meetings', href: '/meetings', icon: Video },
  { name: 'Calendar', href: '/calendar', icon: Calendar },
  { name: 'Team', href: '/team', icon: Users },
  { name: 'Settings', href: '/settings', icon: Settings },
]

export function Sidebar() {
  const pathname = usePathname()
  const { signOut } = useAuth()

  return (
    <div className="flex h-screen w-64 flex-col bg-gray-900">
      <div className="flex flex-1 flex-col overflow-y-auto pt-5 pb-4">
        <div className="flex flex-shrink-0 items-center px-4">
          <h1 className="text-xl font-bold text-white">OBTASK AI</h1>
        </div>
        <nav className="mt-8 flex-1 space-y-1 px-2">
          {navigation.map((item) => {
            const isActive = pathname === item.href
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  'group flex items-center px-2 py-2 text-sm font-medium rounded-md transition-colors',
                  isActive
                    ? 'bg-gray-800 text-white'
                    : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                )}
              >
                <item.icon
                  className={cn(
                    'mr-3 h-5 w-5 flex-shrink-0',
                    isActive ? 'text-white' : 'text-gray-400 group-hover:text-white'
                  )}
                />
                {item.name}
              </Link>
            )
          })}
        </nav>
        <div className="flex-shrink-0 p-2">
          <button
            onClick={signOut}
            className="group flex w-full items-center px-2 py-2 text-sm font-medium text-gray-300 rounded-md hover:bg-gray-700 hover:text-white transition-colors"
          >
            <LogOut className="mr-3 h-5 w-5 flex-shrink-0 text-gray-400 group-hover:text-white" />
            Sign Out
          </button>
        </div>
      </div>
    </div>
  )
}