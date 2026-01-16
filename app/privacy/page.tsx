import { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Politique de Confidentialité - SnapChasse',
  description: 'Politique de confidentialité et conformité RGPD',
}

export default function PrivacyPage() {
  return (
    <div className="min-h-screen p-8">
      <div className="max-w-4xl mx-auto">
        <Link
          href="/"
          className="inline-block mb-8 text-retro-primary hover:underline"
        >
          ← Retour à l'accueil
        </Link>
        
        <h1 className="text-4xl font-bold mb-8 retro-glow">Politique de Confidentialité</h1>
        
        <div className="glass-effect p-8 rounded-lg space-y-6">
          <section>
            <h2 className="text-2xl font-bold mb-4">1. Collecte des données</h2>
            <p className="text-retro-light/80 mb-4">
              SnapChasse collecte les données suivantes pour le fonctionnement de l'application :
            </p>
            <ul className="list-disc list-inside space-y-2 text-retro-light/80 ml-4">
              <li>Données d'authentification (email, mot de passe hashé)</li>
              <li>Données de profil (nom, prénom optionnels)</li>
              <li>Données de géolocalisation (uniquement pendant les jeux actifs)</li>
              <li>Données de progression dans les jeux</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">2. Utilisation des données</h2>
            <p className="text-retro-light/80">
              Vos données sont utilisées uniquement pour :
            </p>
            <ul className="list-disc list-inside space-y-2 text-retro-light/80 ml-4 mt-2">
              <li>Authentification et gestion de compte</li>
              <li>Géolocalisation pendant les jeux de piste</li>
              <li>Suivi de progression et scores</li>
              <li>Amélioration de l'expérience utilisateur</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">3. Vos droits RGPD</h2>
            <p className="text-retro-light/80 mb-4">
              Conformément au RGPD, vous disposez des droits suivants :
            </p>
            <ul className="list-disc list-inside space-y-2 text-retro-light/80 ml-4">
              <li><strong>Droit d'accès</strong> : Vous pouvez demander l'accès à vos données personnelles</li>
              <li><strong>Droit de rectification</strong> : Vous pouvez corriger vos données</li>
              <li><strong>Droit à l'effacement</strong> : Vous pouvez demander la suppression de vos données</li>
              <li><strong>Droit à la portabilité</strong> : Vous pouvez récupérer vos données</li>
              <li><strong>Droit d'opposition</strong> : Vous pouvez vous opposer au traitement de vos données</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">4. Sécurité</h2>
            <p className="text-retro-light/80">
              Nous mettons en œuvre des mesures de sécurité appropriées pour protéger vos données :
              chiffrement des mots de passe, protection contre les attaques DDoS, validation des données,
              et conformité aux meilleures pratiques de sécurité.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">5. Contact</h2>
            <p className="text-retro-light/80">
              Pour toute question concernant vos données personnelles, contactez-nous via l'interface
              de l'application ou supprimez votre compte depuis les paramètres.
            </p>
          </section>

          <section>
            <p className="text-sm text-retro-light/60 mt-8">
              Dernière mise à jour : {new Date().toLocaleDateString('fr-FR')}
            </p>
          </section>
        </div>
      </div>
    </div>
  )
}
