import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { DashboardContent } from '@/components/DashboardContent'

export default async function DashboardPage() {
  const supabase = await createClient()
  
  // Get session first to ensure it's valid
  const {
    data: { session },
  } = await supabase.auth.getSession()
  
  if (!session) {
    redirect('/auth/signin')
  }

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/signin')
  }

  // Get user role
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  const role = profile?.role || 'participant'

  return <DashboardContent user={user} role={role} />
}
