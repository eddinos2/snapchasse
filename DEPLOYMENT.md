# Guide de Déploiement - SnapChasse

Ce guide explique comment déployer SnapChasse sur Netlify.

## Prérequis

- Compte Netlify
- Compte Supabase
- Compte Mapbox
- Repository GitHub

## Étapes de déploiement

### 1. Préparer Supabase

1. Créer un projet Supabase
2. Exécuter les migrations SQL dans l'ordre :
   - `supabase/migrations/001_initial_schema.sql`
   - `supabase/migrations/002_gdpr_tables.sql`
3. Noter l'URL du projet et les clés API (anon key)

### 2. Préparer Mapbox

1. Créer un compte Mapbox
2. Générer un token d'accès public
3. Noter le token

### 3. Configurer Netlify

1. Connecter votre repository GitHub à Netlify
2. Configurer les variables d'environnement dans Netlify :

```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
NEXT_PUBLIC_MAPBOX_TOKEN=your-mapbox-token
```

3. Configurer les paramètres de build :
   - Build command: `npm run build`
   - Publish directory: `.next`

### 4. Déploiement automatique

Netlify déploiera automatiquement à chaque push sur la branche principale.

## Configuration post-déploiement

### Headers de sécurité

Les headers de sécurité sont configurés dans `netlify.toml`. Ils incluent :
- CSP (Content Security Policy)
- X-Frame-Options
- Strict-Transport-Security
- Et plus...

### Rate Limiting

Le rate limiting est géré par le middleware Next.js. Les limites par défaut :
- Routes d'authentification : 5 requêtes/minute
- Routes API : 20 requêtes/minute
- Autres routes : 100 requêtes/minute

### Conformité RGPD

- Le consentement aux cookies est géré automatiquement
- Les données utilisateur peuvent être exportées via la fonction `export_user_data()`
- Les demandes de suppression sont tracées dans la table `data_requests`

## Vérification

Après le déploiement, vérifier :
- ✅ L'authentification fonctionne
- ✅ La création de jeux fonctionne
- ✅ Le gameplay fonctionne
- ✅ Le consentement aux cookies s'affiche
- ✅ Les headers de sécurité sont présents

## Support

Pour toute question, consultez la documentation ou ouvrez une issue sur GitHub.
