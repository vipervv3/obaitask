'use client'

import { useState } from 'react'

// Disable static generation for this page
export const dynamic = 'force-dynamic'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [resendLoading, setResendLoading] = useState(false)
  const [resendMessage, setResendMessage] = useState('')
  const router = useRouter()
  const supabase = createClient()

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password: password,
      })

      if (error) {
        console.error('Auth error:', error)
        if (error.message.includes('Email not confirmed')) {
          setError('Please check your email and click the confirmation link before signing in.')
        } else if (error.message.includes('Invalid login credentials')) {
          setError('Invalid email or password. Please check your credentials and try again.')
        } else {
          setError(error.message)
        }
      } else if (data?.user) {
        router.push('/dashboard')
      }
    } catch (err) {
      console.error('Unexpected error:', err)
      setError('An unexpected error occurred. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleResendConfirmation = async () => {
    if (!email.trim()) {
      setError('Please enter your email address first.')
      return
    }

    setResendLoading(true)
    setError('')
    setResendMessage('')

    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: email.trim(),
      })

      if (error) {
        setError(error.message)
      } else {
        setResendMessage('Confirmation email sent! Please check your inbox.')
      }
    } catch (err) {
      console.error('Resend error:', err)
      setError('Failed to resend confirmation email.')
    } finally {
      setResendLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Sign in to OBTASK AI
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Or{' '}
            <Link
              href="/auth/signup"
              className="font-medium text-blue-600 hover:text-blue-500"
            >
              create a new account
            </Link>
          </p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSignIn}>
          <div className="space-y-4">
            <div>
              <Label htmlFor="email">Email address</Label>
              <Input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
              />
            </div>
            <div>
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
              />
            </div>
          </div>

          {error && (
            <div className="text-red-600 text-sm text-center">
              {error}
              {error.includes('confirmation link') && (
                <div className="mt-2">
                  <button
                    type="button"
                    onClick={handleResendConfirmation}
                    disabled={resendLoading}
                    className="text-blue-600 hover:text-blue-500 text-sm underline"
                  >
                    {resendLoading ? 'Sending...' : 'Resend confirmation email'}
                  </button>
                </div>
              )}
            </div>
          )}

          {resendMessage && (
            <div className="text-green-600 text-sm text-center">{resendMessage}</div>
          )}

          <div>
            <Button
              type="submit"
              disabled={loading}
              className="w-full"
            >
              {loading ? 'Signing in...' : 'Sign in'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}