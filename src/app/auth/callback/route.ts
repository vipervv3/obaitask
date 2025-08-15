import { createServerSupabaseClient } from '@/lib/supabase'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const code = searchParams.get('code')
    const next = searchParams.get('next') ?? '/dashboard'

    // Get the correct origin - use production URL
    const redirectUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://obaitask.vercel.app'
    
    console.log('Auth callback - redirectUrl:', redirectUrl)
    console.log('Auth callback - code:', code ? 'present' : 'missing')

    if (code) {
      const response = NextResponse.redirect(`${redirectUrl}${next}`)
      const supabase = createServerSupabaseClient(request, response)
      
      const { error } = await supabase.auth.exchangeCodeForSession(code)
      
      if (!error) {
        console.log('Auth exchange successful, redirecting to:', `${redirectUrl}${next}`)
        return response
      } else {
        console.error('Auth exchange error:', error)
      }
    }

    // return the user to an error page with instructions
    console.log('Auth callback failed, redirecting to error page:', `${redirectUrl}/auth/auth-code-error`)
    return NextResponse.redirect(`${redirectUrl}/auth/auth-code-error`)
  } catch (error) {
    console.error('Auth callback error:', error)
    const redirectUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://obaitask.vercel.app'
    return NextResponse.redirect(`${redirectUrl}/auth/auth-code-error`)
  }
}