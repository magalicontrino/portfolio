# Réplique de magalicontrino.com

Reconstruction à l'identique du site, en HTML/CSS/JS autonome — sans Carrd, sans Webflow,
sans jQuery, sans CDN. Police et images en local, aucune dépendance externe.

Le site d'origine est en deux étages, reproduits ici tels quels :

| URL | Origine | Rôle |
|---|---|---|
| `/` | magalicontrino.com (Carrd) | Page d'entrée : photo de fond, logo, flèche |
| `/accueil/` | magalicontrino.webflow.io (Webflow) | Accueil du portfolio, derrière la flèche |

Les pages à reconstruire viendront à côté — `/photo/`, `/web/`, `/infos/` — ce qui reproduit
la structure du site Webflow, où elles sont voisines de l'accueil.

## Mise en ligne (GitHub Pages)

Le site est statique : aucun build, aucun workflow. Il suffit de servir le dépôt tel quel.

1. Créer un dépôt sur GitHub, puis :

   ```
   git remote add origin https://github.com/<toi>/<le-depot>.git
   git push -u origin main
   ```

2. Sur GitHub : **Settings → Pages → Source : Deploy from a branch**, branche `main`,
   dossier `/ (root)`.

L'adresse sera `https://<toi>.github.io/<le-depot>/`. Tous les chemins sont relatifs :
le site fonctionne aussi bien à la racine d'un domaine que dans un sous-dossier.

Pour le regarder en local, sans rien installer :

```
npx serve
```

## Fidélité

Géométrie mesurée contre le site en ligne, élément par élément.

**Page d'entrée** — identique au pixel à 1920, 1600 et 375 px :

| Largeur | Élément | Live | Réplique |
|---|---|---|---|
| 1920 | logo | 55, 69 — 195×84 | 55, 69 — 195×84 |
| 1600 | logo | 120, 46 — 130×56 | 120, 46 — 130×56 |
| 1600 | flèche | 250, 46 — 54×51 | 250, 46 — 54×51 |
| 375 | logo | 74.75, 229.59 — 225.5×293.33 | 74.75, 229.59 — 225.5×293.33 |
| 375 | flèche | 149, 557.74 — 77×63.17 | 149, 557.74 — 77×63.17 |

Animations reprises : fondu enchaîné des 4 photos (1 s de fondu, 3,875 s par image,
750 ms d'attente initiale), voile gris `rgba(56,56,56,.149)`, aplat `#8F8F8F` qui se
dissout, logo qui monte (`fade-up`, 1 s) et flèche qui glisse depuis la gauche
(`fade-right`, 1,125 s) après 625 ms, zoom `scale(1.06)` au survol.

**Accueil du portfolio** — relevé de 14 groupes d'éléments (position, taille, opacité)
comparé au live à 1440 px : **identique caractère pour caractère**, y compris la hauteur
de page (4320) et la couleur des barres du menu.

Deux comportements non évidents, découverts en comparant et reproduits tels quels :

- Les barres du hamburger ne sont **pas** colorées par le CSS. Le moteur d'origine leur
  applique au chargement l'état de repos de l'interaction de fermeture du mégamenu
  (`rgb(28,26,26)`). Sans ça, deux des trois barres restent invisibles.
- « Projets photo » / « Projets webdesign » (`.txt-vertical-intro-top`) **gardent** leur
  décalage de départ (−112 px / −160 px) et restent hors cadre à gauche : le site d'origine
  ne les ramène jamais à zéro.

## Comment c'est construit

- **HTML** : structure d'origine conservée (classes et `data-w-id`, cibles des animations),
  assets réécrits en local, runtime Webflow retiré.
- **CSS** : les 226 Ko générés par Webflow réduits aux 547 règles que la page utilise
  réellement, plus un `@font-face` local pour *Unigeo 64 Variable Trial* (la police de tout
  le site, graisses 100–820).
- **JS** : interactions réécrites à la main d'après les données du moteur d'origine, avec
  ses durées et ses courbes. Le HTML porte déjà, élément par élément, l'état de départ de
  chaque animation en style inline — ce que Webflow grave pour éviter un flash au
  chargement. `app.js` s'appuie dessus et ramène chaque élément à son état final.

## Limites connues

- Le pixel-perfect du portfolio est vérifié **à 1440 px, sur le premier écran**. La page
  fait 4320 px de haut ; le reste et les autres largeurs n'ont pas été comparés élément
  par élément.
- **Révélations au scroll** : le bas de page apparaît en 1 s à l'entrée dans le viewport.
  Aucune interaction d'origine ne cible ces éléments par identifiant : la durée est une
  approximation raisonnable, pas une valeur relevée.
- **Non repris** : le scroll lissé (luxy.js) et les transitions entre pages. Les deux se
  voient à l'usage.
- Les liens vers `/photo`, `/web` et `/infos` sont neutralisés : ces pages restent à
  reconstruire. Le lien « Home » du menu ramène à l'accueil du portfolio, comme sur le
  site d'origine. Une partie des photos vit sur un second site
  (`magalicontrinophotographie.webflow.io`).
- Le favicon, l'apple-touch-icon et l'image de partage sont référencés par le site
  d'origine mais renvoient un 404 : références retirées plutôt que reproduites.
- Le lien de contact pointe vers `https://magalicontrino@hotmail.fr`, une coquille du site
  d'origine (ce devrait être un `mailto:`). Conservée telle quelle.
- En mobile, le bloc de la page d'entrée n'est pas centré exactement : il retombe 19 px
  sous l'axe, comme sur le site d'origine. Reproduit sciemment.
