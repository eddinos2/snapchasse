# SnapChasse 🎯

Application moderne de jeu de piste (scavenger hunt) avec géolocalisation, authentification sécurisée et interface rétro-moderne.

## 🚀 Fonctionnalités

- ✅ **Authentification sécurisée** : Inscription, connexion, gestion de session avec Supabase Auth
- ✅ **Gestion des rôles** : Administrateur et Participant avec permissions appropriées
- ✅ **Géolocalisation en temps réel** : Suivi GPS avec Mapbox, calcul de distance, validation de position
- ✅ **Création de jeux** : Interface complète pour créer des parcours avec énigmes géolocalisées
- ✅ **Gameplay complet** : Résolution d'énigmes, progression, suivi des étapes complétées
- ✅ **Interface rétro-moderne** : Design unique avec animations fluides (Framer Motion)
- ✅ **Conformité RGPD** : Consentement granulaire aux cookies, politique de confidentialité, export de données
- ✅ **Sécurité renforcée** : Protection DDoS, rate limiting, validation des données, RLS

## 🛠️ Stack Technique

- **Frontend**: Next.js 14 (App Router), React 18, TypeScript
- **Styling**: Tailwind CSS, Framer Motion
- **Backend**: Supabase (PostgreSQL + Auth + PostGIS pour géolocalisation)
- **Maps**: Mapbox GL JS
- **Validation**: Zod pour la validation de schémas
- **Déploiement**: Netlify avec headers de sécurité

## 📦 Installation

```bash
# Cloner le repository
git clone https://github.com/votre-username/snapchasse.git
cd snapchasse

# Installer les dépendances
npm install
```

## 🔧 Configuration

Voir le fichier [SETUP.md](./SETUP.md) pour les instructions détaillées.

### Variables d'environnement

Créer un fichier `.env.local` :

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
NEXT_PUBLIC_MAPBOX_TOKEN=your-mapbox-token
```

### Base de données - IMPORTANT

**Pour le MVP sans authentification**, exécuter cette migration dans Supabase :

1. Aller dans Supabase Dashboard → SQL Editor
2. Exécuter le contenu de `supabase/migrations/000_setup_mvp.sql`

Cette migration crée toutes les tables nécessaires sans dépendre de l'authentification.

**Note** : Le MVP fonctionne sans authentification. Tous les utilisateurs peuvent créer et jouer des jeux.

## 🚀 Développement

```bash
# Lancer le serveur de développement
npm run dev

# Build de production
npm run build

# Lancer en production
npm start
```

## 🎮 Utilisation

1. **Inscription/Connexion** : Créez un compte ou connectez-vous
2. **Créer un jeu** (Admin) : Accédez au dashboard et créez un nouveau jeu de piste avec des étapes géolocalisées
3. **Jouer** : Sélectionnez un jeu actif et suivez les étapes sur la carte
4. **Résoudre les énigmes** : Répondez aux questions pour progresser dans le jeu

## 🔒 Sécurité

- **Headers de sécurité** : CSP, X-Frame-Options, HSTS, etc.
- **Protection DDoS** : Rate limiting par IP (5 req/min pour auth, 20 req/min pour API)
- **Validation** : Toutes les données sont validées avec Zod
- **RLS** : Row Level Security sur toutes les tables Supabase
- **RGPD** : Consentement granulaire, export de données, politique de confidentialité

## 📚 Documentation

- [SETUP.md](./SETUP.md) - Guide d'installation et configuration
- [DEPLOYMENT.md](./DEPLOYMENT.md) - Guide de déploiement sur Netlify

## 🏗️ Architecture

```
app/
  ├── auth/          # Pages d'authentification
  ├── dashboard/     # Dashboard utilisateur
  ├── hunt/          # Pages de jeu
  └── privacy/       # Politique de confidentialité

components/
  ├── ui/            # Composants UI réutilisables (Button, Input, Card)
  └── ...            # Composants métier

lib/
  ├── gdpr/          # Gestion RGPD (cookie-manager)
  ├── security/      # Sécurité (rate-limiter, validation)
  ├── supabase/      # Clients Supabase (server, client, middleware)
  └── utils/          # Utilitaires (auth, validation, geolocation)
```

## 📝 License

MIT

## 🤝 Contribution

Ce projet a été créé pour un hackathon. Les contributions sont les bienvenues !

Pour contribuer :
1. Fork le projet
2. Créer une branche (`git checkout -b feature/AmazingFeature`)
3. Commit vos changements (`git commit -m 'Add some AmazingFeature'`)
4. Push vers la branche (`git push origin feature/AmazingFeature`)
5. Ouvrir une Pull Request
