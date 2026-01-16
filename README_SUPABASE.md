# 🔐 Configuration Supabase - SnapChasse

## ✅ État actuel

### Comptes disponibles

1. **Admin** :
   - Email: `syd.houss@gmail.com`
   - Rôle: `admin`
   - ID: `44cc599e-7a9f-4a5e-a9d3-17c5feea3a08`

2. **Créer de nouveaux comptes** :
   - Utilisez `/auth/signup` dans l'application
   - Le trigger `on_auth_user_created` créera automatiquement un profil
   - Rôle par défaut: `participant`

### Synchronisation temps réel

✅ **Realtime activé pour** :
- `session_participants` - Leaderboard en temps réel
- `game_sessions` - Sessions de jeu
- `hunts` - Jeux de piste
- `user_progress` - Progression des joueurs

### Trigger automatique

Le trigger `on_auth_user_created` crée automatiquement un profil dans `profiles` lorsqu'un utilisateur s'inscrit via Supabase Auth.

## 🔧 Scripts disponibles

### Créer un compte admin

```bash
# Nécessite SUPABASE_SERVICE_ROLE_KEY dans .env.local
npx tsx scripts/create-admin-account.ts
```

### Créer un compte participant

```bash
npx tsx scripts/create-participant-account.ts
```

## 📋 Variables d'environnement requises

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key  # Pour les scripts admin uniquement
```

## ✅ Vérifications

- [x] Trigger `on_auth_user_created` fonctionne
- [x] Realtime activé pour les tables nécessaires
- [x] Compte admin créé
- [x] Synchronisation temps réel opérationnelle
- [x] Toutes les données viennent de Supabase (pas de mock data)

## 🚀 Test

1. Connectez-vous sur `/auth/signin` avec `syd.houss@gmail.com`
2. Créez un nouveau compte via `/auth/signup`
3. Vérifiez que le profil est créé automatiquement dans Supabase
