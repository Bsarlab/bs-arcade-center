// =========================================================
// BS arcade center : tous les textes du site
// Valeurs par défaut. Chacun se remplace dans l'admin, onglet « Textes ».
// {jeux} et {prochains} sont remplacés par les nombres (ex. « 3 jeux »).
// =========================================================
window.TEXTES_SITE = [
  { groupe: "Navigation et menu", page: "#/", textes: [
    ["nav_accueil", "Menu : Accueil", "Accueil"],
    ["nav_jeux", "Menu : Jeux", "Jeux"],
    ["nav_apropos", "Menu : À propos", "À propos"],
    ["nav_contact", "Menu : Contact", "Contact"],
    ["entete_jouer", "Bouton en haut à droite", "Jouer"],
    ["menu_titre", "Menu burger : titre", "Menu"],
    ["menu_derniers", "Menu burger : derniers jeux", "Derniers jeux"],
    ["recherche_placeholder", "Recherche rapide : texte du champ", "Chercher un jeu ou une page…"],
  ]},
  { groupe: "Accueil", page: "#/", textes: [
    ["accueil_pastille", "Pastille au-dessus du titre", "{jeux} · gratuits, sans compte"],
    ["accueil_pastille_vide", "Pastille quand il n'y a aucun jeu", "Les premiers jeux arrivent"],
    ["accueil_bulle", "Bulle sur les jaquettes", "Dernière sortie"],
    ["une_etiquette", "Carrousel : petit titre", "À la une"],
    ["une_titre", "Carrousel : titre", "Les nouveautés"],
    ["derniers_etiquette", "Derniers jeux : petit titre", "Ludothèque"],
    ["derniers_titre", "Derniers jeux : titre", "Derniers jeux"],
    ["derniers_tous", "Derniers jeux : lien", "Tous les jeux"],
    ["derniers_voir", "Derniers jeux : bouton", "Voir la ludothèque"],
    ["genres_etiquette", "Genres : petit titre", "Explorer"],
    ["genres_titre", "Genres : titre", "Par genre"],
    ["teaser_etiquette", "Aperçu À propos : petit titre", "À propos"],
    ["teaser_lien", "Aperçu À propos : lien", "Lire la suite"],
    ["bande_etiquette", "Bandeau contact : petit titre", "Restons en contact"],
    ["bande_titre", "Bandeau contact : titre", "Ne rate pas le prochain jeu"],
    ["bande_texte", "Bandeau contact : texte", "Les nouveautés arrivent d'abord sur mes réseaux."],
    ["bande_bouton", "Bandeau contact : bouton", "Page contact"],
  ]},
  { groupe: "Page Jeux et cartes de jeux", page: "#/jeux", textes: [
    ["jeux_etiquette", "Petit titre de la page", "Ludothèque · {jeux}"],
    ["jeux_recherche", "Champ de recherche", "Rechercher un jeu"],
    ["jeux_tous", "Filtre : tous", "Tous"],
    ["jeux_favoris", "Filtre : favoris", "Favoris"],
    ["jeux_tri_recent", "Tri : récents", "Plus récents"],
    ["jeux_tri_az", "Tri : alphabétique", "De A à Z"],
    ["jeux_reprendre", "Reprendre : titre", "Reprendre là où tu t'es arrêté"],
    ["jeux_continuer", "Reprendre : bouton", "Continuer"],
    ["jeux_vide_titre", "Aucun jeu : titre", "Bientôt des jeux ici"],
    ["jeux_aucun_titre", "Recherche sans résultat : titre", "Aucun jeu trouvé"],
    ["jeux_aucun_texte", "Recherche sans résultat : texte", "Essaie un autre mot ou un autre genre."],
    ["jeux_tout_afficher", "Recherche sans résultat : bouton", "Tout afficher"],
    ["carte_nouveau", "Badge des jeux récents", "Nouveau"],
  ]},
  { groupe: "Page d'un jeu", page: "#/jeux", textes: [
    ["jeu_fil", "Fil d'Ariane", "Jeux"],
    ["jeu_ajoute", "Date d'ajout", "Ajouté le"],
    ["jeu_genre_defaut", "Genre quand il n'y en a pas", "Jeu"],
    ["jeu_desc_defaut", "Description quand il n'y en a pas", "Lance la partie : elle s'ouvre directement ici, sans téléchargement et sans compte."],
    ["jeu_jouer", "Bouton principal", "Jouer maintenant"],
    ["jeu_info1_titre", "Info 1 : titre", "Dans le navigateur"],
    ["jeu_info1", "Info 1 : texte", "Rien à installer"],
    ["jeu_info2_titre", "Info 2 : titre", "Gratuit"],
    ["jeu_info2", "Info 2 : texte", "Sans compte ni pub"],
    ["jeu_info3_titre", "Info 3 : titre", "Plein écran"],
    ["jeu_info3", "Info 3 : texte", "Bouton en haut à droite"],
    ["jeu_precedent", "Jeu précédent", "Jeu précédent"],
    ["jeu_suivant", "Jeu suivant", "Jeu suivant"],
    ["jeu_autres_etiquette", "Suggestions : petit titre", "À découvrir"],
    ["jeu_autres_titre", "Suggestions : titre", "Tu aimeras aussi"],
    ["jeu_autres_lien", "Suggestions : lien", "Tous les jeux"],
  ]},
  { groupe: "Page À propos", page: "#/a-propos", textes: [
    ["apropos_etiquette", "Petit titre de la page", "À propos"],
    ["debut_etiquette", "Bandeau noir : petit titre", "La suite"],
    ["debut_titre", "Bandeau noir : titre", "Ce n'est que le début."],
    ["debut_texte", "Bandeau noir : texte", "De nouveaux jeux arrivent régulièrement. Reviens souvent : la ludothèque grandit à chaque mise à jour."],
    ["debut_en_ligne", "Bandeau noir : légende 1", "{jeux} en ligne"],
    ["debut_preparation", "Bandeau noir : légende 2", "{prochains} en préparation"],
    ["prochains_etiquette", "Prochains jeux : petit titre", "En préparation"],
    ["prochains_titre", "Prochains jeux : titre", "Les prochains jeux"],
    ["prochains_lien", "Prochains jeux : lien", "Propose une idée"],
    ["prochains_badge", "Prochains jeux : badge", "Bientôt"],
    ["idee_titre", "Carte idée : titre", "Et ton idée ?"],
    ["idee_texte", "Carte idée : texte", "Propose-moi un jeu, il sera peut-être le prochain."],
    ["chrono_etiquette", "Chronologie : petit titre", "Chronologie"],
    ["chrono_titre", "Chronologie : titre", "Les jeux, dans l'ordre"],
    ["chrono_bientot", "Chronologie : date du prochain", "Bientôt"],
    ["chrono_prochain", "Chronologie : prochain jeu", "Le prochain jeu"],
    ["chrono_preparation", "Chronologie : statut", "En préparation"],
  ]},
  { groupe: "Page Contact", page: "#/contact", textes: [
    ["contact_etiquette", "Petit titre de la page", "Contact"],
    ["contact_email", "Carte mail : titre", "E-mail"],
    ["contact_ecrire", "Carte mail : bouton", "Écrire"],
    ["contact_telephone", "Carte téléphone : titre", "Téléphone"],
    ["contact_appeler", "Carte téléphone : bouton", "Appeler"],
    ["contact_reseaux", "Titre des réseaux", "Réseaux"],
    ["partage_titre", "Partage : titre", "Fais découvrir le site"],
    ["partage_texte", "Partage : texte", "Envoie le lien à tes amis : ils peuvent jouer tout de suite, sans compte."],
    ["partage_bouton", "Partage : bouton", "Copier le lien du site"],
  ]},
  { groupe: "Pied de page", page: "#/", textes: [
    ["pied_site", "Colonne 1", "Le site"],
    ["pied_jeux", "Colonne 2", "Jeux"],
    ["pied_reseaux", "Colonne 3", "Réseaux"],
    ["pied_haut", "Lien de retour en haut", "Revenir en haut"],
  ]},
  { groupe: "Lecteur de jeu", page: "#/jeux", textes: [
    ["lecteur_retour", "Bouton retour", "Retour"],
    ["lecteur_recommencer", "Bouton recommencer", "Recommencer"],
    ["lecteur_partager", "Bouton partager", "Partager"],
    ["lecteur_suivant", "Bouton jeu suivant", "Jeu suivant"],
    ["lecteur_chargement", "Pendant le chargement", "Chargement du jeu…"],
  ]},
  { groupe: "Page introuvable", page: "#/introuvable", textes: [
    ["erreur_etiquette", "Petit titre", "Erreur 404"],
    ["erreur_titre", "Titre", "Cette page n'existe pas"],
    ["erreur_texte", "Texte", "Le jeu a peut-être été retiré. Retourne à la ludothèque pour en choisir un autre."],
    ["erreur_bouton", "Bouton", "Voir les jeux"],
  ]},
];

// Sections de chaque page : on peut les masquer et changer leur ordre (onglet « Mise en page »)
window.SECTIONS_SITE = {
  accueil: { nom: "Accueil", lien: "#/", sections: [
    ["hero", "Grand titre et boutons"], ["une", "Carrousel « À la une »"], ["derniers", "Derniers jeux"],
    ["genres", "Par genre"], ["blocs", "Tes blocs (onglet Blocs)"], ["apropos", "Aperçu de l'histoire"], ["contact", "Bandeau contact noir"]] },
  jeux: { nom: "Jeux", lien: "#/jeux", sections: [
    ["entete", "Titre de la page"], ["reprendre", "Reprendre une partie"], ["outils", "Recherche, filtres et tri"], ["grille", "Liste des jeux"], ["blocs", "Tes blocs"]] },
  jeu: { nom: "Page d'un jeu", lien: "#/jeux", sections: [
    ["fiche", "Fiche du jeu"], ["suite", "Jeu précédent / suivant"], ["autres", "Tu aimeras aussi"], ["blocs", "Tes blocs"]] },
  "a-propos": { nom: "À propos", lien: "#/a-propos", sections: [
    ["histoire", "Ton histoire"], ["debut", "Bandeau « Ce n'est que le début »"], ["prochains", "Prochains jeux"], ["chrono", "Chronologie"], ["blocs", "Tes blocs"]] },
  contact: { nom: "Contact", lien: "#/contact", sections: [
    ["entete", "Titre de la page"], ["coordonnees", "Mail et téléphone"], ["reseaux", "Réseaux"], ["partage", "Partager le site"], ["blocs", "Tes blocs"]] },
};

// Options d'affichage (onglet « Mise en page »)
window.OPTIONS_SITE = [
  ["navigation", "Menu en pastille en haut (grand écran)", true],
  ["boutonJouer", "Bouton « Jouer » en haut à droite", true],
  ["recherche", "Bouton de recherche (loupe)", true],
  ["pastille", "Pastille au-dessus du grand titre", true],
  ["collage", "Jaquettes à droite du grand titre", true],
  ["favoris", "Cœurs « favoris » sur les jeux", true],
  ["infosJeu", "Infos pratiques sur la page d'un jeu", true],
  ["decor", "Décor de fond (formes grises)", true],
  ["taches", "Taches de couleur en fond", true],
  ["animations", "Animations à l'apparition des sections", true],
];
