# Sharia Stock Screener — déploiement avec clé API cachée

Ce dossier contient deux choses :
- `index.html` — le site (front-end).
- `api/fmp.js` — une petite fonction serveur qui porte votre clé Financial Modeling Prep. Le navigateur ne voit jamais cette clé, seulement le nom de votre site.

En local (double-clic sur `index.html`), seul le mode **Démo** fonctionne : le mode **API en direct** a besoin d'un vrai serveur pour exécuter `api/fmp.js`. C'est ce que Vercel fournit gratuitement, en quelques clics.

## Déployer sur Vercel (gratuit, aucune carte bancaire requise)

1. **Créez un compte** sur [vercel.com](https://vercel.com) (connexion possible avec GitHub, GitLab ou email).

2. **Mettez ce dossier sur GitHub** (le plus simple) :
   - Créez un nouveau repository sur [github.com/new](https://github.com/new), par exemple `sharia-screener`.
   - Uploadez les fichiers `index.html`, `api/fmp.js` et ce `README.md` (bouton "Add file → Upload files" sur la page du repo, ou via `git push` si vous êtes à l'aise avec Git).

3. **Importez le projet dans Vercel** :
   - Dans le dashboard Vercel, cliquez **Add New → Project**.
   - Sélectionnez votre repository `sharia-screener`.
   - Laissez les réglages par défaut (Vercel détecte automatiquement le dossier `api/` comme des fonctions serverless) et cliquez **Deploy**.

4. **Ajoutez votre clé API en variable d'environnement** (l'étape qui la cache vraiment) :
   - Dans le projet Vercel : **Settings → Environment Variables**.
   - Nom : `FMP_API_KEY`
   - Valeur : votre clé Financial Modeling Prep (régénérez-la d'abord si elle est déjà apparue en clair quelque part).
   - Cochez les 3 environnements (Production, Preview, Development), puis **Save**.

5. **Redéployez** : onglet **Deployments** → menu **⋯** sur le dernier déploiement → **Redeploy** (nécessaire pour que la nouvelle variable d'environnement soit prise en compte).

6. Ouvrez l'URL fournie par Vercel (ex. `sharia-screener.vercel.app`), passez en mode **API en direct**, et testez un ticker. La requête part maintenant vers `/api/fmp`, qui relaie vers FMP avec la clé — invisible dans le code source de la page.

## Vérifier que la clé est bien cachée

Ouvrez les DevTools (F12) → onglet **Réseau/Network** pendant une recherche en mode live. Vous devez voir une requête vers `/api/fmp?...` **sans** paramètre `apikey` dans l'URL — c'est la preuve que la clé ne quitte jamais le serveur.

## Limites à garder en tête

- Le plan gratuit FMP est limité à 250 requêtes/jour (3 requêtes par recherche de ticker → environ 80 recherches/jour).
- Certains endpoints ou tickers renvoient une erreur "premium" selon votre plan FMP — c'est documenté dans l'app, pas un bug.
- Le proxy n'autorise que 3 ressources (`profile`, `income-statement`, `balance-sheet-statement`) — toute autre valeur est rejetée, pour éviter qu'un usage détourné consomme votre quota sur d'autres endpoints payants.
