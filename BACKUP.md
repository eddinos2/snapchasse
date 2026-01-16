# 📦 Backup de la base de données Supabase

## Méthodes de backup

### 1. Via Supabase Dashboard (Recommandé)

1. Allez sur https://supabase.com/dashboard
2. Sélectionnez votre projet **snapchasse**
3. Allez dans **Database** > **Backups**
4. Cliquez sur **Create Backup** ou téléchargez une sauvegarde existante

### 2. Via Supabase CLI

```bash
# Installer Supabase CLI
npm install -g supabase

# Se connecter
supabase login

# Lier le projet
supabase link --project-ref your-project-ref

# Créer un backup
supabase db dump -f backup_$(date +%Y%m%d_%H%M%S).sql
```

### 3. Via pg_dump (PostgreSQL direct)

```bash
# Obtenir la connection string depuis Supabase Dashboard > Settings > Database
# Format: postgresql://postgres:[PASSWORD]@[HOST]:[PORT]/postgres

pg_dump "postgresql://postgres:YOUR_PASSWORD@db.fmjfdwbgikfdkyxgjpcn.supabase.co:5432/postgres" \
  --no-owner \
  --no-acl \
  -f backup_$(date +%Y%m%d_%H%M%S).sql
```

## Tables à sauvegarder

### Tables essentielles
- ✅ `profiles` - Comptes utilisateurs
- ✅ `hunts` - Jeux de piste
- ✅ `steps` - Étapes/énigmes
- ✅ `user_progress` - Progression des joueurs
- ✅ `hunt_participants` - Participants aux jeux
- ✅ `game_sessions` - Sessions de jeu
- ✅ `session_participants` - Participants aux sessions
- ✅ `user_achievements` - Succès débloqués

### Tables de configuration
- `achievements` - Définitions des succès
- `badges` - Définitions des badges

## Backup automatique (Optionnel)

Supabase fait des backups automatiques quotidiens, disponibles pendant 7 jours.

Pour activer des backups plus fréquents ou plus longs :
1. Supabase Dashboard > Settings > Database
2. Configurez les paramètres de backup

## Restauration

```bash
# Via psql
psql -h db.fmjfdwbgikfdkyxgjpcn.supabase.co \
  -U postgres \
  -d postgres \
  -f backup_database.sql

# Via Supabase CLI
supabase db reset
# Puis restaurer depuis le backup
```

## ⚠️ Important

- Les mots de passe dans `auth.users` sont cryptés
- Sauvegardez via le Dashboard pour inclure l'authentification
- Testez vos backups régulièrement en les restaurant sur un environnement de test
