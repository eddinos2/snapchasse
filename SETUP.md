# Guide de Configuration - SnapChasse

## 🚀 Démarrage Rapide

### 1. Installation des dépendances

```bash
npm install
```

### 2. Configuration Supabase

1. Créez un projet sur [Supabase](https://app.supabase.com)
2. Allez dans **Settings > API** pour récupérer :
   - `Project URL` → `NEXT_PUBLIC_SUPABASE_URL`
   - `anon public` key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`

3. Dans Supabase, allez dans **SQL Editor** et exécutez le fichier :
   ```
   supabase/migrations/001_initial_schema.sql
   ```

4. Créez un utilisateur admin (optionnel) :
   ```sql
   -- Après vous être inscrit, exécutez cette requête dans SQL Editor
   UPDATE profiles SET role = 'admin' WHERE email = 'votre@email.com';
   ```

### 3. Configuration Mapbox

1. Créez un compte sur [Mapbox](https://account.mapbox.com)
2. Allez dans **Account > Access tokens**
3. Créez un token avec les permissions `styles:read` et `fonts:read`
4. Copiez le token → `NEXT_PUBLIC_MAPBOX_TOKEN`

### 4. Variables d'environnement

Créez un fichier `.env.local` à la racine :

```env
NEXT_PUBLIC_SUPABASE_URL=https://votre-projet.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=votre_anon_key
NEXT_PUBLIC_MAPBOX_TOKEN=votre_mapbox_token
```

### 5. Lancer l'application

```bash
npm run dev
```

L'application sera accessible sur [http://localhost:3000](http://localhost:3000)

## 📦 Déploiement sur Netlify

1. **Push sur GitHub** :
   ```bash
   git remote add origin https://github.com/votre-username/snapchasse.git
   git push -u origin master
   ```

2. **Sur Netlify** :
   - Connectez votre repo GitHub
   - Variables d'environnement : ajoutez les 3 variables (`NEXT_PUBLIC_SUPABASE_URL`, etc.)
   - Build command : `npm run build`
   - Publish directory : `.next`

3. **Netlify configurera automatiquement** via `netlify.toml`

## 🔒 Sécurité

- ✅ Headers de sécurité configurés (next.config.js + netlify.toml)
- ✅ Protection DDoS via Netlify (built-in)
- ✅ Rate limiting via middleware
- ✅ Validation des données avec Zod
- ✅ RLS (Row Level Security) activé sur toutes les tables
- ✅ Conformité RGPD (cookies, politique de confidentialité)

## 🎨 Fonctionnalités

- ✅ Authentification sécurisée (Supabase Auth)
- ✅ Gestion des rôles (Admin / Participant)
- ✅ Géolocalisation en temps réel (Mapbox)
- ✅ Création de parcours avec énigmes
- ✅ Interface rétro-moderne avec animations
- ✅ Suivi de progression

## 🐛 Dépannage

### Erreur PostGIS
Si vous avez une erreur avec PostGIS, vérifiez que l'extension est activée :
```sql
CREATE EXTENSION IF NOT EXISTS "postgis";
```

### Erreur de géolocalisation
Assurez-vous que le navigateur autorise l'accès à la géolocalisation.

### Erreur d'authentification
Vérifiez que les variables d'environnement sont correctement configurées dans `.env.local`.
