# Réplique de magalicontrino.com

Reconstruction à l'identique du site, en HTML/CSS/JS autonome — sans Carrd, sans Webflow,
sans jQuery, sans CDN. Police et images en local, aucune dépendance externe.

Le site d'origine est en deux étages, reproduits ici tels quels :

**Tout tient à une seule adresse : `/`.** On y arrive sur la page d'entrée ; la flèche
découvre le portfolio sans jamais changer d'URL, comme la chaîne d'origine
(magalicontrino.com → magalicontrino.webflow.io), mais d'un seul tenant.

| Fichier | Origine | Rôle |
|---|---|---|
| `index.html` | — | La seule adresse. Assemble les deux étages ci-dessous. |
| `entree/` | magalicontrino.com (Carrd) | Page d'entrée : photo de fond, logo, flèche |
| `accueil/` | magalicontrino.webflow.io | Accueil du portfolio, derrière la flèche |
| `photo/` `web/` `infos/` | idem | Les trois rubriques |
| `websites/<slug>/` | idem | 5 pages projet web (CMS) |
| `projets-photo/<slug>/` | idem | 12 galeries photo (CMS) |
| `assets/` | — | CSS, JS, police et images, partagés par toutes les pages |

Chaque étage garde son propre document, et `index.html` les superpose. Ce n'est pas un
détail d'implémentation gratuit : les deux définissent chacun leurs règles `html`/`body`,
et les fusionner décalerait la mise en page — les tailles en `rem` dépendent du
`font-size` racine, que la page d'entrée redéfinit à chaque palier. Les documents isolés
préservent au pixel près la géométrie vérifiée ci-dessous.

**Le site est complet : 21 pages**, soit tout le site Webflow d'origine.

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

**Les 21 pages** ont été comparées au site en ligne à 1440 px, images chargées : hauteur
totale de page et mise en page de chaque élément (`offsetLeft/Top/Width/Height`, insensible
aux transforms et donc aux animations en cours).

**Les 21 hauteurs sont identiques.**

La comparaison a aussi été refaite **aux cinq largeurs** couvrant les quatre paliers du site
(Webflow bascule à 991, 767 et 479 px). Toutes identiques :

| Largeur | Palier | accueil | photo | infos | kioskup (projet) | nature (galerie) |
|---|---|---|---|---|---|---|
| 1920 | main | 5238 | 5519 | 3872 | 6068 | — |
| 1440 | main | 4320 | 4603 | 3048 | 4922 | 6895 |
| 768 | medium | 4915 | 3404 | 4340 | 6360 | — |
| 600 | small | 4050 | 6251 | 3730 | 5643 | 5150 |
| 375 | tiny | 3816 | 5535 | 3594 | 5802 | 4507 |


| Page | Hauteur | | Page | Hauteur |
|---|---|---|---|---|
| `accueil/` | 4320 | | `projets-photo/kioskup/` | 8957 |
| `photo/` | 4603 | | `projets-photo/noir-et-blanc/` | 8400 |
| `web/` | 900 | | `projets-photo/nature/` | 6895 |
| `infos/` | 3048 | | `projets-photo/reciproque/` | 9596 |
| `websites/ambassadeurs/` | 4922 | | `projets-photo/en-couleur/` | 8677 |
| `websites/casa-linear/` | 4922 | | `projets-photo/musique/` | 6453 |
| `websites/celie-yoga/` | 4922 | | `projets-photo/calais/` | 6184 |
| `websites/kioskup/` | 4922 | | `projets-photo/ambiance/` | 5911 |
| `websites/loransse-doe/` | 4102 | | `projets-photo/galerie/` | 4634 |
| | | | `projets-photo/la-saison-des-chants/` | 4499 |
| | | | `projets-photo/manif/` | 4594 |
| | | | `projets-photo/studio/` | 2772 |

Le décompte d'éléments diffère de ±1 : ce sont les classes-marqueurs posées par les runtimes
(`w-mod-js` côté Webflow, `is-ready` côté réplique). Aucun écart de mise en page.

**Titres des rubriques** : `photo/` et `web/` ouvrent sur un titre dont la **graisse
s'épaissit** au chargement — Unigeo est une police variable, et le titre passe de 100 à 400
(`photo/`) ou 415 (`web/`) en 1500 ms `inOutQuad`. C'est l'effet le plus visible de ces
pages ; il passe par `font-variation-settings`, un type d'animation que je n'avais pas
repris, et le titre restait donc en maigre.

Trois comportements non évidents, découverts en comparant et reproduits tels quels :

- Les barres du hamburger ne sont **pas** colorées par le CSS. Le moteur d'origine leur
  applique au chargement l'état de repos de l'interaction de fermeture du mégamenu
  (`rgb(28,26,26)`). Sans ça, deux des trois barres restent invisibles.
- Le voile légendé des cartes de projet (`.card-hover-2`) n'est masqué que par le moteur,
  pas par le CSS. Sans ça, il recouvre les photos en permanence.
- « Projets photo » / « Projets webdesign » (`.txt-vertical-intro-top`) démarrent hors cadre
  à gauche (−112 px / −160 px) et **entrent au survol de leur colonne** (500 ms), puis
  repartent un peu plus loin qu'ils n'étaient venus (−120 px / −170 px). L'intro du
  chargement, elle, ne les ramène pas : seul le survol le fait.

## Écarts assumés : ce qui a été réparé

La réplique visait d'abord l'identique au pixel. Quatre choses étaient **cassées sur le site
d'origine** et avaient donc été reproduites cassées. Elles sont désormais **réparées** : le
site fonctionne, au prix d'un écart documenté avec l'original.

| Ce qui était cassé | État d'origine | Réparation |
|---|---|---|
| **Mégamenu** | Ne s'ouvrait pas, et le clic bloquait le défilement de la page sans rien afficher | Rebranché **avec l'animation d'origine**, valeur pour valeur |
| **Liens « Photographie pro / perso »** | Vers `magalicontrinophotographie.webflow.io`, site supprimé (404 partout) | Pointent vers `photo/` |
| **Lien « Webdesign »** | Vers `/webdesign`, 404 | Pointe vers `web/` |
| **Lien de contact** (14 occurrences) | `https://magalicontrino@hotmail.fr` — coquille, ne faisait rien | `mailto:magalicontrino@hotmail.fr` |
| **2 images** (`arrow.svg`, `MacBook.png`) | Empruntées à d'autres sites Webflow, refusées par leur CDN (403) | Balises retirées : elles ne s'affichaient de toute façon pas |

Le mégamenu mérite un mot. Ses interactions d'ouverture **existent** dans le projet Webflow
(« Megamenu_open ») et visent bien `.nav-button-hamburger` — mais elles appartiennent à une
autre page du projet, et le moteur ne les active que sur leur page d'origine. Le menu avait
donc été conçu, animé, puis jamais rebranché. La réparation ne réinvente rien : elle rejoue
l'animation prévue (barres qui s'écartent de ±100 px en `outQuart` 600 ms, navbar qui passe
en sombre, panneau en fondu ; fermeture en 800 ms). Ajout non prévu à l'origine : la touche
`Échap` referme le menu, qui couvre tout l'écran.

Ces réparations ne changent aucune mise en page : les hauteurs des 21 pages restent
identiques au site en ligne.

## Poids : pourquoi les photos ne sont pas compressées

Le dépôt pèse ~221 Mo, presque uniquement des photos en pleine qualité. C'est lourd à
cloner, mais **cela ne coûte rien au visiteur** — mesuré sur le site en ligne :

| | |
|---|---|
| Arrivée sur une galerie | **0,16 Mo**, 4 images |
| Après défilement à mi-page | 3,55 Mo, 20 images (30 encore non chargées) |
| Photo la plus lourde | ~530 Ko |

Le `loading="lazy"` du balisage d'origine, conservé, ne charge que ce qu'on atteint. Les
photos ne sont donc pas recompressées : ce serait dégrader les images d'un portfolio de
photographe pour économiser du temps de `git clone`, pas du temps de chargement. Les
fichiers sont ceux du site d'origine, à l'octet près.

## Mises à jour et cache

Les liens vers `style.css`, `app.js` et `luxy.js` portent une **empreinte du contenu**
(`?v=8db0ad17`). Sans elle, GitHub Pages laisse les navigateurs rejouer l'ancienne version
après un déploiement : le site paraît inchangé, ou pire, une page à jour tourne avec un
script périmé. L'empreinte change avec le fichier, donc le navigateur recharge exactement
ce qu'il faut, et seulement ça.

Ces empreintes sont recalculées à la génération des pages : rien à faire à la main.

## Comment c'est construit

- **HTML** : structure d'origine conservée (classes et `data-w-id`, cibles des animations),
  assets réécrits en local, runtime Webflow retiré.
- **CSS** : les 226 Ko générés par Webflow réduits aux 547 règles que la page utilise
  réellement, plus un `@font-face` local pour *Unigeo 64 Variable Trial* (la police de tout
  le site, graisses 100–820).
- **JS** : interactions réécrites à la main d'après les données du moteur d'origine, avec
  ses durées et ses courbes — intro, révélations et parallaxes au scroll, survols des
  colonnes du hero et des cartes, traits qui se rétractent, icônes sociales, accordéon de
  la FAQ, cartes retournables. Deux modules font exception — la **visionneuse** des galeries
  et le **carrousel** des pages projet : le runtime Webflow d'origine est rejoué tel quel,
  en local, sur les seules pages concernées. Sans `data-wf-page`, son moteur d'animations
  reste inerte et n'entre pas en conflit avec `app.js`. Le HTML porte déjà, élément par élément, l'état de départ de
  chaque animation en style inline — ce que Webflow grave pour éviter un flash au
  chargement. `app.js` s'appuie dessus et ramène chaque élément à son état final.

## Limites connues

- Le relevé exhaustif des 21 pages est fait **à 1440 px** ; les quatre autres largeurs ont
  été contrôlées sur un échantillon de 5 pages couvrant chaque famille (accueil, rubrique,
  page projet, galerie).
- **Révélations au scroll** : reprises des interactions d'origine, avec leurs durées et
  leurs courbes — les lettres du grand titre remontent en cascade (750 ms `outQuart`,
  50 ms d'écart entre chacune) et repartent quand la section quitte l'écran ; les blocs de
  la FAQ glissent depuis la gauche (−101 %, 1500 ms `outQuart`).
- **Parallaxes liées au scroll** : trois effets suivent la progression de l'élément à
  travers l'écran, et non une durée — l'écran d'accueil (120 → −50 px sur 0–70 % de la
  traversée), la maquette de `loransse-doe` (0 → −88 % entre 50 et 65 %) et son triptyque
  de téléphones (0 → −16 vh sur toute la traversée).
- **Scroll inertiel (luxy.js)** : repris. La bibliothèque d'origine (luxy.js v0.1.0, MIT,
  Mineo Okuda) est embarquée en local plutôt qu'appelée sur un CDN, et initialisée avec les
  mêmes réglages (`wrapperSpeed: 0.065`, désactivé sur mobile). Comme sur le site d'origine,
  elle ne s'applique qu'aux trois pages qui portent `#luxy` : `photo/`, `web/`, `infos/`.
- **Transitions entre pages** : le site d'origine embarque le script d'une transition en
  volet, mais **aucun élément ne porte la classe `transition-trigger`** qu'il attend, et le
  volet (`.whipe-intro`) vit dans un bloc en `display: none`. Vérifié sur le site en ligne :
  le script tourne à vide, il ne se passe rien. Ne rien reproduire est donc fidèle.
- Les cinq réparations ci-dessus sont les seuls écarts volontaires avec le site d'origine.
- Page d'entrée : son favicon, son apple-touch-icon et son image de partage sont référencés
  par le site d'origine mais renvoient un 404 — références retirées plutôt que reproduites.
  Le portfolio, lui, a bien son favicon : il est repris et servi en local.
- En mobile, le bloc de la page d'entrée n'est pas centré exactement : il retombe 19 px
  sous l'axe, comme sur le site d'origine. Reproduit sciemment.
