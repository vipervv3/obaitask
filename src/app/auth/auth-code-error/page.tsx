'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function AuthCodeError() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            Authentication Error
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Sorry, we couldn&apos;t verify your email. This could happen if:
          </p>
          <div className="mt-4 text-left text-sm text-gray-600 space-y-2">
            <p>• The confirmation link has expired</p>
            <p>• The link has already been used</p>
            <p>• There was an issue with the confirmation process</p>
          </div>
        </div>
        
        <div className="space-y-4">
          <Button asChild className="w-full">
            <Link href="/auth/login">
              Try signing in
            </Link>
          </Button>
          
          <Button asChild variant="outline" className="w-full">
            <Link href="/auth/signup">
              Create a new account
            </Link>
          </Button>
        </div>
        
        <div className="text-center">
          <p className="text-xs text-gray-500">
            If you continue having issues, please contact support.
          </p>
        </div>
      </div>
    </div>
  )
}