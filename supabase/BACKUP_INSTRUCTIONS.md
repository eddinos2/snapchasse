# 📦 Instructions de Backup - Base de données SnapChasse

## État actuel de la base de données

- **Profiles**: 4 utilisateurs
- **Hunts**: 0 (créés par les utilisateurs)
- **Steps**: 0 (créés avec les hunts)
- **Progress**: 0 (générés pendant le jeu)
- **Sessions**: 0 (créées lors des parties multi-joueurs)

## Méthode recommandée : Supabase Dashboard

### Créer un backup manuel

1. **Accédez au Dashboard Supabase**
   - URL: https://supabase.com/dashboard
   - Projet: **snapchasse**

2. **Créez un backup**
   - Menu: **Database** > **Backups**
   - Cliquez sur **Create Backup**
   - Le backup sera sauvegardé automatiquement

3. **Téléchargez un backup existant**
   - Dans **Backups**, sélectionnez un backup
   - Cliquez sur **Download**

## Méthode alternative : pg_dump

```bash
# Obtenez votre connection string depuis Supabase Dashboard
# Settings > Database > Connection string > URI

pg_dump "postgresql://postgres:[PASSWORD]@db.fmjfdwbgikfdkyxgjpcn.supabase.co:5432/postgres" \
  --no-owner \
  --no-acl \
  --schema=public \
  -f backup_$(date +%Y%m%d_%H%M%S).sql
```

## Backup automatique Supabase

Supabase crée automatiquement des **backups quotidiens** conservés pendant **7 jours**.

Pour activer des backups plus fréquents ou plus longs :
1. Dashboard > Settings > Database
2. Configurez les paramètres selon vos besoins

## Tables à inclure dans le backup

### Tables principales
- ✅ `profiles` - Comptes utilisateurs et rôles
- ✅ `hunts` - Jeux de piste créés
- ✅ `steps` - Étapes/énigmes des jeux
- ✅ `user_progress` - Progression des joueurs
- ✅ `hunt_participants` - Participants aux jeux
- ✅ `game_sessions` - Sessions de jeu multi-joueurs
- ✅ `session_participants` - Participants aux sessions
- ✅ `user_achievements` - Succès débloqués

### Tables de configuration
- `achievements` - Définitions des succès
- `badges` - Définitions des badges

## Restauration

```bash
# Via psql
psql -h db.fmjfdwbgikfdkyxgjpcn.supabase.co \
  -U postgres \
  -d postgres \
  -f backup_database.sql
```

## ⚠️ Notes importantes

- Les mots de passe dans `auth.users` sont cryptés
- Sauvegardez via le Dashboard pour inclure l'authentification complète
- Testez vos backups en les restaurant sur un environnement de test
- Les backups automatiques sont conservés 7 jours (plan gratuit)
