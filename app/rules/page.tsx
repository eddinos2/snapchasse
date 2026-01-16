import { Metadata } from 'next'
import { RulesContent } from '@/components/RulesContent'

export const metadata: Metadata = {
  title: 'Règles du Jeu - SnapChasse',
  description: 'Découvrez comment jouer à SnapChasse et créer vos propres jeux de piste',
}

export default function RulesPage() {
  return <RulesContent />
}
