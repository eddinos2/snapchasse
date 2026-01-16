import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { CreateHuntForm } from '@/components/CreateHuntForm'

export default async function CreateHuntPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/signin')
  }

  // Check if user is admin
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'admin') {
    redirect('/dashboard')
  }

  return <CreateHuntForm userId={user.id} />
}
