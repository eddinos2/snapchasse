import { CreateHuntForm } from '@/components/CreateHuntForm'

export default async function CreateHuntPage() {
  // No auth required - allow everyone to create hunts
  // Use a default user ID for MVP
  const defaultUserId = 'anonymous-creator'

  return <CreateHuntForm userId={defaultUserId} />
}
