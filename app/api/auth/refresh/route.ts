import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST() {
  const supabase = await createClient()
  
  // Forcer le refresh de la session
  const { data: { user } } = await supabase.auth.getUser()
  const { data: { session } } = await supabase.auth.getSession()
  
  return NextResponse.json({ 
    user: user ? { id: user.id, email: user.email } : null,
    hasSession: !!session 
  })
}
