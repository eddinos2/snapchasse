# SnapChasse 🎯

Application moderne de jeu de piste (scavenger hunt) avec géolocalisation, authentification sécurisée et interface rétro-moderne.

## 🚀 Fonctionnalités

- ✅ Authentification sécurisée (Supabase Auth)
- ✅ Gestion des rôles (Administrateur / Participant)
- ✅ Géolocalisation en temps réel (Mapbox)
- ✅ Création et gestion de parcours d'énigmes
- ✅ Interface rétro-moderne avec animations fluides (Framer Motion)
- ✅ Conformité RGPD (cookies, consentement, politique de confidentialité)
- ✅ Protection contre DDoS et attaques (headers de sécurité, rate limiting)

## 🛠️ Stack Technique

- **Frontend**: Next.js 14 (App Router), React, TypeScript
- **Styling**: Tailwind CSS, Framer Motion
- **Backend**: Supabase (PostgreSQL + Auth + PostGIS)
- **Maps**: Mapbox GL
- **Validation**: Zod
- **Déploiement**: Netlify

## 📦 Installation

```bash
npm install
```

## 🔧 Configuration Rapide

Voir le fichier [SETUP.md](./SETUP.md) pour les instructions détaillées.

### Étapes principales :

1. **Supabase** : Créer un projet et exécuter la migration SQL
2. **Mapbox** : Obtenir un token d'accès
3. **Variables d'environnement** : Créer `.env.local` avec les credentials
4. **Lancer** : `npm run dev`

## 🎮 Utilisation

1. **Inscription/Connexion** : Créez un compte ou connectez-vous
2. **Créer un jeu** (Admin) : Accédez au dashboard et créez un nouveau jeu de piste
3. **Jouer** : Sélectionnez un jeu actif et suivez les étapes géolocalisées
4. **Résoudre les énigmes** : Répondez aux questions pour progresser

## 🔒 Sécurité

- Headers de sécurité configurés
- Protection DDoS via Netlify
- Rate limiting via middleware
- Validation des données avec Zod
- RLS (Row Level Security) sur toutes les tables
- Conformité RGPD complète

## 📝 License

MIT

## 🤝 Contribution

Ce projet a été créé pour un hackathon. Les contributions sont les bienvenues !
