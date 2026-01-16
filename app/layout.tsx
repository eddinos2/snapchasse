import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Providers } from './providers'
import { CookieConsent } from '@/components/CookieConsent'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })

export const metadata: Metadata = {
  title: 'SnapChasse - Jeu de Piste Moderne',
  description: 'Créez et participez à des jeux de piste géolocalisés',
  keywords: ['jeu de piste', 'scavenger hunt', 'géolocalisation', 'énigmes'],
  authors: [{ name: 'SnapChasse Team' }],
  openGraph: {
    title: 'SnapChasse - Jeu de Piste Moderne',
    description: 'Créez et participez à des jeux de piste géolocalisés',
    type: 'website',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <body className={inter.variable}>
        <Providers>
          {children}
          <CookieConsent />
        </Providers>
      </body>
    </html>
  )
}
