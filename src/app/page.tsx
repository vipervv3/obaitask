'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/components/auth/auth-provider'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Brain, CheckSquare, Users, Mic } from 'lucide-react'

export default function Home() {
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && user) {
      router.push('/dashboard')
    }
  }, [user, loading, router])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (user) {
    return null // Will redirect to dashboard
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto">
          <div className="relative z-10 pb-8 bg-gray-50 sm:pb-16 md:pb-20 lg:max-w-2xl lg:w-full lg:pb-28 xl:pb-32">
            <main className="mt-10 mx-auto max-w-7xl px-4 sm:mt-12 sm:px-6 md:mt-16 lg:mt-20 lg:px-8 xl:mt-28">
              <div className="sm:text-center lg:text-left">
                <h1 className="text-4xl tracking-tight font-extrabold text-gray-900 sm:text-5xl md:text-6xl">
                  <span className="block xl:inline">OBTASK AI</span>{' '}
                  <span className="block text-blue-600 xl:inline">Project Manager</span>
                </h1>
                <p className="mt-3 text-base text-gray-500 sm:mt-5 sm:text-lg sm:max-w-xl sm:mx-auto md:mt-5 md:text-xl lg:mx-0">
                  Intelligent project management with voice recording, task automation, and AI insights. 
                  Transform your meetings into actionable tasks automatically.
                </p>
                <div className="mt-5 sm:mt-8 sm:flex sm:justify-center lg:justify-start">
                  <div className="rounded-md shadow">
                    <Link href="/auth/signup">
                      <Button size="lg" className="w-full">
                        Get started
                      </Button>
                    </Link>
                  </div>
                  <div className="mt-3 sm:mt-0 sm:ml-3">
                    <Link href="/auth/login">
                      <Button variant="outline" size="lg" className="w-full">
                        Sign in
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            </main>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="lg:text-center">
            <h2 className="text-base text-blue-600 font-semibold tracking-wide uppercase">Features</h2>
            <p className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-gray-900 sm:text-4xl">
              AI-Powered Project Management
            </p>
          </div>

          <div className="mt-10">
            <div className="space-y-10 md:space-y-0 md:grid md:grid-cols-2 md:gap-x-8 md:gap-y-10">
              <div className="relative">
                <div className="absolute flex items-center justify-center h-12 w-12 rounded-md bg-blue-500 text-white">
                  <Mic className="h-6 w-6" />
                </div>
                <p className="ml-16 text-lg leading-6 font-medium text-gray-900">Voice Recording & Transcription</p>
                <p className="mt-2 ml-16 text-base text-gray-500">
                  Record meetings up to 2 hours with automatic transcription and AI-powered action item extraction.
                </p>
              </div>

              <div className="relative">
                <div className="absolute flex items-center justify-center h-12 w-12 rounded-md bg-blue-500 text-white">
                  <CheckSquare className="h-6 w-6" />
                </div>
                <p className="ml-16 text-lg leading-6 font-medium text-gray-900">Smart Task Creation</p>
                <p className="mt-2 ml-16 text-base text-gray-500">
                  Automatically create tasks and to-dos from meeting recordings with AI analysis.
                </p>
              </div>

              <div className="relative">
                <div className="absolute flex items-center justify-center h-12 w-12 rounded-md bg-blue-500 text-white">
                  <Brain className="h-6 w-6" />
                </div>
                <p className="ml-16 text-lg leading-6 font-medium text-gray-900">AI Insights</p>
                <p className="mt-2 ml-16 text-base text-gray-500">
                  Get intelligent project health analysis, workload balancing, and completion predictions.
                </p>
              </div>

              <div className="relative">
                <div className="absolute flex items-center justify-center h-12 w-12 rounded-md bg-blue-500 text-white">
                  <Users className="h-6 w-6" />
                </div>
                <p className="ml-16 text-lg leading-6 font-medium text-gray-900">Team Collaboration</p>
                <p className="mt-2 ml-16 text-base text-gray-500">
                  Invite team members, assign tasks, and track progress with mobile-first responsive design.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
