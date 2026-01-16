# SnapChasse 🎯

Application moderne de jeu de piste (scavenger hunt) avec géolocalisation, authentification sécurisée et interface rétro-moderne.

## 🚀 Fonctionnalités

- ✅ Authentification sécurisée (Supabase Auth)
- ✅ Gestion des rôles (Administrateur / Participant)
- ✅ Géolocalisation en temps réel (Mapbox)
- ✅ Création et gestion de parcours d'énigmes
- ✅ Interface rétro-moderne avec animations fluides
- ✅ Conformité RGPD
- ✅ Protection contre DDoS et attaques

## 🛠️ Stack Technique

- **Frontend**: Next.js 14, React, TypeScript
- **Styling**: Tailwind CSS, Framer Motion
- **Backend**: Supabase (PostgreSQL + Auth)
- **Maps**: Mapbox GL
- **Validation**: Zod
- **Déploiement**: Netlify

## 📦 Installation

```bash
npm install
```

## 🔧 Configuration

1. Créer un fichier `.env.local` avec :

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
NEXT_PUBLIC_MAPBOX_TOKEN=your_mapbox_token
```

2. Lancer le serveur de développement :

```bash
npm run dev
```

## 📝 License

MIT
