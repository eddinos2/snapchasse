# Instructions pour push sur GitHub

## Option 1 : Via GitHub CLI (recommandé)

Si vous avez GitHub CLI installé :

```bash
gh repo create snapchasse --public --source=. --remote=origin --push
```

## Option 2 : Créer le repo manuellement

1. Allez sur [GitHub](https://github.com/new)
2. Créez un nouveau repository nommé `snapchasse`
3. Ne cochez PAS "Initialize with README" (on a déjà tout)
4. Copiez l'URL du repo (ex: `https://github.com/votre-username/snapchasse.git`)
5. Exécutez :

```bash
git remote add origin https://github.com/votre-username/snapchasse.git
git branch -M main
git push -u origin main
```

## Option 3 : Si le repo existe déjà

Si vous avez déjà créé le repo sur GitHub :

```bash
git remote add origin https://github.com/votre-username/snapchasse.git
git branch -M main
git push -u origin main
```
