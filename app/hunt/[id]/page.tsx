import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { HuntGame } from '@/components/HuntGame'

export default async function HuntPage({ 
  params,
  searchParams,
}: { 
  params: { id: string }
  searchParams: { session?: string }
}) {
  const supabase = await createClient()

  // No auth required - use anonymous user ID
  const anonymousUserId = 'anonymous-player'

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

  // Get user progress (using anonymous ID)
  const { data: progress } = await supabase
    .from('user_progress')
    .select('step_id')
    .eq('user_id', anonymousUserId)
    .eq('hunt_id', params.id)

  const completedStepIds = new Set(progress?.map((p) => p.step_id) || [])

  return (
    <HuntGame
      hunt={hunt}
      steps={steps || []}
      userId={anonymousUserId}
      completedStepIds={completedStepIds}
      sessionId={searchParams.session}
    />
  )
}
