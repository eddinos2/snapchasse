import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { DashboardContent } from '@/components/DashboardContent'

export default async function DashboardPage() {
  console.log('🟢 [DASHBOARD] Page dashboard chargée')
  const supabase = await createClient()
  
  // Get session first to ensure it's valid
  const {
    data: { session },
    error: sessionError,
  } = await supabase.auth.getSession()
  
  console.log('🟢 [DASHBOARD] Session:', { 
    hasSession: !!session, 
    sessionError: sessionError?.message,
    userId: session?.user?.id 
  })
  
  if (!session) {
    console.log('❌ [DASHBOARD] Pas de session, redirection vers /auth/signin')
    redirect('/auth/signin')
  }

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()

  console.log('🟢 [DASHBOARD] User:', { 
    hasUser: !!user, 
    userError: userError?.message,
    userId: user?.id,
    userEmail: user?.email 
  })

  if (!user) {
    console.log('❌ [DASHBOARD] Pas d\'utilisateur, redirection vers /auth/signin')
    redirect('/auth/signin')
  }

  // Get user role
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  console.log('🟢 [DASHBOARD] Profile:', { 
    hasProfile: !!profile, 
    profileError: profileError?.message,
    role: profile?.role 
  })

  const role = profile?.role || 'participant'

  console.log('✅ [DASHBOARD] Tout est OK, affichage du dashboard')
  return <DashboardContent user={user} role={role} />
}
