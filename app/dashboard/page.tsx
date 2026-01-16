import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { DashboardContent } from '@/components/DashboardContent'

export default async function DashboardPage() {
  console.log('🟢 [DASHBOARD] Page dashboard chargée')
  const supabase = await createClient()
  
  // Essayer getUser directement - c'est plus fiable que getSession
  let {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()

  console.log('🟢 [DASHBOARD] User (première tentative):', { 
    hasUser: !!user, 
    userError: userError?.message,
    userId: user?.id,
    userEmail: user?.email 
  })

  // Si pas d'utilisateur, essayer getSession comme fallback
  if (!user) {
    console.log('🟡 [DASHBOARD] Pas d\'utilisateur via getUser, essai avec getSession...')
    const { data: { session }, error: sessionError } = await supabase.auth.getSession()
    console.log('🟡 [DASHBOARD] Session:', { 
      hasSession: !!session,
      sessionError: sessionError?.message,
      userId: session?.user?.id 
    })
    if (session?.user) {
      user = session.user
      console.log('✅ [DASHBOARD] Utilisateur trouvé via getSession')
    }
  }

  // Si toujours pas d'utilisateur, rediriger
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
