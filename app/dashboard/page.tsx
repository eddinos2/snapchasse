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
    userId: session?.user?.id,
    accessToken: session?.access_token ? 'present' : 'missing'
  })
  
  if (!session) {
    console.log('❌ [DASHBOARD] Pas de session, redirection vers /auth/signin')
    console.log('🟢 [DASHBOARD] Tentative de récupération de session alternative...')
    
    // Essayer getUser comme fallback
    const { data: { user: fallbackUser } } = await supabase.auth.getUser()
    if (!fallbackUser) {
      console.log('❌ [DASHBOARD] Aucun utilisateur trouvé, redirection')
      redirect('/auth/signin')
    } else {
      console.log('🟢 [DASHBOARD] Utilisateur trouvé via getUser:', fallbackUser.id)
    }
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

  // Get user role - créer le profil s'il n'existe pas
  let { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  console.log('🟢 [DASHBOARD] Profile:', { 
    hasProfile: !!profile, 
    profileError: profileError?.message,
    role: profile?.role 
  })

  // Si le profil n'existe pas, le créer
  if (!profile && user) {
    console.log('🟡 [DASHBOARD] Profil manquant, création...')
    const { data: newProfile, error: createError } = await supabase
      .from('profiles')
      .insert({
        id: user.id,
        email: user.email,
        role: 'participant'
      })
      .select()
      .single()
    
    if (createError) {
      console.log('❌ [DASHBOARD] Erreur création profil:', createError.message)
    } else {
      console.log('✅ [DASHBOARD] Profil créé:', newProfile)
      profile = newProfile
    }
  }

  const role = profile?.role || 'participant'

  console.log('✅ [DASHBOARD] Tout est OK, affichage du dashboard')
  return <DashboardContent user={user} role={role} />
}
