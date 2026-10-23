# Mode d'emploi du site Top Maths 5M

## Voir le site sur le Mac
Double-cliquer sur **apercu.command** : le site s'ouvre dans le navigateur
et se met à jour tout seul à chaque enregistrement d'un fichier.
(Pour arrêter : fermer la fenêtre du Terminal.)

## Ajouter un cours, un devoir, une fiche
1. Aller dans le bon dossier : `superieur/`, `lycee/terminale/`, `lycee/premiere/` ou `lycee/seconde/`.
2. Copier une page d'exemple (par exemple `exemplecoursexponentielle.qmd`) et la renommer
   (noms sans tirets ni espaces, ex. `suitesnumeriques.qmd`).
3. Modifier l'en-tête :
   ```
   ---
   title: "Suites numériques"
   description: "Cours complet avec exercices"
   date: 2026-11-02
   ---
   ```
4. Écrire le cours en dessous, comme en LaTeX : `$ ... $` dans la ligne, `$$ ... $$` centré.

La page apparaît **automatiquement** dans la liste de son niveau et dans
« Nouveaux documents » sur l'accueil (les 3 plus récents, d'après la date).

## Proposer un PDF
Déposer le PDF dans `documents/`, puis dans la page : `[Sujet A (PDF)](../../documents/sujetA.pdf)`.
Ajouter `pdf: true` dans l'en-tête pour que l'accueil affiche « PDF » au lieu de « Lire ».

## Encadrés (définition, théorème, remarque)
```
::: {.callout-note title="Définition"}
Texte de la définition.
:::
```
Autres couleurs : `callout-tip` (vert), `callout-warning` (orange), `callout-important` (rouge).

## Ajouter une animation
Copier une page de `animations/` (ex. `eulerspirale.qmd`) et changer : `title`, `description`
(le domaine : Analyse, Algèbre…), `date`, `image` (la vignette, format portrait).
Les 4 plus récentes apparaissent sur l'accueil.

## Ajouter un article
Copier `articles/pourquoi0999egal1.qmd`. Le plus récent apparaît sur l'accueil.

## Changer une couleur ou un texte du menu
- Couleurs : `assets/theme.scss` (tout en haut).
- Menu et pied de page : `_quarto.yml`.
- Textes de l'accueil : `index.qmd`.
