import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')

  if (code) {
    const supabase = createRouteHandlerClient({ cookies })
    await supabase.auth.exchangeCodeForSession(code)

    // Get the user's role after authentication
    const { data: { user } } = await supabase.auth.getUser()
    const role = user?.user_metadata?.role || 'user'

    // Redirect based on role
    if (role === 'admin' || role === 'barista') {
      return NextResponse.redirect(new URL('/dashboard', requestUrl.origin))
    } else {
      return NextResponse.redirect(new URL('/userdashboard', requestUrl.origin))
    }
  }

  // If no code, redirect to login
  return NextResponse.redirect(new URL('/login', requestUrl.origin))
}