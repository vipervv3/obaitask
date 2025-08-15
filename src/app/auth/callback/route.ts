import { createServerSupabaseClient } from '@/lib/supabase'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const { searchParams, origin } = new URL(request.url)
    const code = searchParams.get('code')
    const next = searchParams.get('next') ?? '/dashboard'

    if (code) {
      const response = NextResponse.redirect(`${origin}${next}`)
      const supabase = createServerSupabaseClient(request, response)
      
      const { error } = await supabase.auth.exchangeCodeForSession(code)
      
      if (!error) {
        return response
      } else {
        console.error('Auth exchange error:', error)
      }
    }

    // return the user to an error page with instructions
    return NextResponse.redirect(`${origin}/auth/auth-code-error`)
  } catch (error) {
    console.error('Auth callback error:', error)
    const { origin } = new URL(request.url)
    return NextResponse.redirect(`${origin}/auth/auth-code-error`)
  }
}