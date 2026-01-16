# Setup Rapide - MVP SnapChasse

Guide rapide pour démarrer le MVP sans authentification.

## 1. Configuration Supabase

### Créer un projet Supabase

1. Aller sur [supabase.com](https://supabase.com)
2. Créer un nouveau projet
3. Noter l'URL du projet et la clé anon

### Exécuter la migration SQL

1. Dans Supabase Dashboard, aller dans **SQL Editor**
2. Copier le contenu de `supabase/migrations/000_setup_mvp.sql`
3. Exécuter la migration
4. Vérifier que les tables sont créées : `profiles`, `hunts`, `steps`, `user_progress`, `hunt_participants`

## 2. Configuration Mapbox

1. Aller sur [mapbox.com](https://mapbox.com)
2. Créer un compte
3. Créer un token d'accès public
4. Noter le token

## 3. Variables d'environnement

Créer un fichier `.env.local` à la racine du projet :

```env
NEXT_PUBLIC_SUPABASE_URL=https://votre-projet.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=votre-cle-anon
NEXT_PUBLIC_MAPBOX_TOKEN=votre-token-mapbox
```

## 4. Installer et lancer

```bash
npm install
npm run dev
```

## 5. Tester

1. Ouvrir http://localhost:3000
2. Cliquer sur "Accéder au Dashboard"
3. Créer un jeu de piste
4. Jouer le jeu créé

## Vérification

Pour vérifier que tout fonctionne :

1. Dashboard accessible : http://localhost:3000/dashboard
2. Création de jeu : http://localhost:3000/dashboard/create
3. Aucune erreur dans la console du navigateur

## Problèmes courants

### Table 'hunts' not found
- **Solution** : Exécuter la migration `000_setup_mvp.sql` dans Supabase SQL Editor

### Erreur 404 sur les requêtes Supabase
- **Solution** : Vérifier que les variables d'environnement sont correctes dans `.env.local`
- Vérifier que la migration a bien été exécutée

### Rate limiting 429
- **Solution** : Le rate limiting a été désactivé pour les pages, cela devrait ne plus se produire
