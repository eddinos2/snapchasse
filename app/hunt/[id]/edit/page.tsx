import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { EditHuntForm } from '@/components/EditHuntForm'

export default async function EditHuntPage({ params }: { params: { id: string } }) {
  const supabase = await createClient()

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

  return (
    <EditHuntForm 
      hunt={hunt} 
      initialSteps={steps || []}
      userId="00000000-0000-0000-0000-000000000000" 
    />
  )
}
