import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { HuntGame } from '@/components/HuntGame'

export default async function HuntPage({ params }: { params: { id: string } }) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/signin')
  }

  // Get hunt
  const { data: hunt, error: huntError } = await supabase
    .from('hunts')
    .select('*')
    .eq('id', params.id)
    .single()

  if (huntError || !hunt) {
    redirect('/dashboard')
  }

  // Get steps
  const { data: steps } = await supabase
    .from('steps')
    .select('*')
    .eq('hunt_id', params.id)
    .order('order_index', { ascending: true })

  // Get user progress
  const { data: progress } = await supabase
    .from('user_progress')
    .select('step_id')
    .eq('user_id', user.id)
    .eq('hunt_id', params.id)

  const completedStepIds = new Set(progress?.map((p) => p.step_id) || [])

  return (
    <HuntGame
      hunt={hunt}
      steps={steps || []}
      userId={user.id}
      completedStepIds={completedStepIds}
    />
  )
}
