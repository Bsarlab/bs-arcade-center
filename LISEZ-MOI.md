# BS arcade center

## Les fichiers
- `index.html`, `style.css`, `script.js` : le site public.
- `site.json` : tout le contenu (textes, couleurs, jeux, histoire). C'est l'admin qui le modifie.
- `admin.html` : ton back-office, à l'adresse `/admin.html` de ton site.
- `images/` et `jeux/` : remplis automatiquement par l'admin.

## Mise en ligne gratuite (une seule fois)
1. Crée un compte sur github.com.
2. Clique sur **New repository**, nomme-le `bs-arcade-center`, laisse-le **Public**, puis clique sur **Create repository**.
3. Clique sur **uploading an existing file**, glisse tous les fichiers de ce dossier, puis clique sur **Commit changes**.
4. Va dans **Settings → Pages**. Dans « Branch », choisis `main` et `/ (root)`, puis clique sur **Save**.
5. Après 1 à 2 minutes, ton site est en ligne : `https://TONPSEUDO.github.io/bs-arcade-center/`

## Ta clé d'accès à l'admin (une seule fois)
1. Sur GitHub : ta photo → **Settings → Developer settings → Personal access tokens → Fine-grained tokens → Generate new token**.
2. Dans « Repository access », choisis **Only select repositories** puis `bs-arcade-center`.
3. Dans « Permissions », mets **Contents** sur **Read and write**.
4. Génère la clé et copie-la (elle commence par `github_pat_`).
5. Ouvre `https://TONPSEUDO.github.io/bs-arcade-center/admin.html` et colle ton pseudo, le nom du dépôt et la clé.

La clé est enregistrée seulement dans ton navigateur. Sans elle, personne ne peut modifier ton site.

Ne la partage jamais. Si elle expire, recrée-en une de la même façon.

## Utiliser l'admin
Modifie ce que tu veux : tu vois le résultat en direct à droite. Clique sur **Publier** quand c'est prêt : le site se met à jour en 1 à 2 minutes.

Chaque jeu doit être un seul fichier `.html` de 25 Mo maximum.
