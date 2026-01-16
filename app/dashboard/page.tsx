import { createClient } from '@/lib/supabase/server'
import { DashboardContent } from '@/components/DashboardContent'

export default async function DashboardPage() {
  const supabase = await createClient()
  
  // No auth required - allow everyone to access dashboard
  // Create a mock user object for compatibility
  const mockUser = {
    id: 'anonymous',
    email: 'visiteur@snapchasse.fr',
  }

  // Everyone can create hunts (no role restriction)
  const role = 'admin' // Allow everyone to be admin for MVP

  return <DashboardContent user={mockUser as any} role={role} />
}
