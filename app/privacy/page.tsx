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
            <h2 className="text-2xl font-bold mb-4">5. Cookies</h2>
            <p className="text-retro-light/80 mb-4">
              Nous utilisons les types de cookies suivants :
            </p>
            <ul className="list-disc list-inside space-y-2 text-retro-light/80 ml-4">
              <li><strong>Cookies essentiels</strong> : Nécessaires au fonctionnement de l'application (authentification, session). Ces cookies ne peuvent pas être désactivés.</li>
              <li><strong>Cookies analytiques</strong> : Nous aident à comprendre comment les utilisateurs interagissent avec l'application (optionnel).</li>
              <li><strong>Cookies marketing</strong> : Pour personnaliser votre expérience et afficher du contenu pertinent (optionnel).</li>
            </ul>
            <p className="text-retro-light/80 mt-4">
              Vous pouvez gérer vos préférences de cookies à tout moment via le bandeau de consentement.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">6. Conservation des données</h2>
            <p className="text-retro-light/80">
              Vos données sont conservées aussi longtemps que nécessaire pour fournir nos services.
              Vous pouvez demander la suppression de vos données à tout moment. Les données de géolocalisation
              sont supprimées automatiquement après la fin d'un jeu de piste.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">7. Partage des données</h2>
            <p className="text-retro-light/80">
              Nous ne vendons ni ne louons vos données personnelles à des tiers. Vos données peuvent être
              partagées uniquement avec :
            </p>
            <ul className="list-disc list-inside space-y-2 text-retro-light/80 ml-4 mt-2">
              <li>Les services d'hébergement (Supabase, Netlify) pour le fonctionnement de l'application</li>
              <li>Les services de cartographie (Mapbox) pour la géolocalisation</li>
              <li>Les autorités légales si requis par la loi</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">8. Contact et DPO</h2>
            <p className="text-retro-light/80 mb-4">
              Pour toute question concernant vos données personnelles ou pour exercer vos droits RGPD :
            </p>
            <ul className="list-disc list-inside space-y-2 text-retro-light/80 ml-4">
              <li>Contactez-nous via l'interface de l'application</li>
              <li>Demandez l'export de vos données depuis votre profil</li>
              <li>Demandez la suppression de votre compte depuis les paramètres</li>
            </ul>
            <p className="text-retro-light/80 mt-4">
              <strong>Délégué à la Protection des Données (DPO)</strong> : Disponible via l'interface de l'application.
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
