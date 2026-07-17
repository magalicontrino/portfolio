# Le générateur

Les 21 pages du site (`accueil/`, `photo/`, `web/`, `infos/`, `websites/*`,
`projets-photo/*`) **ne s'écrivent pas à la main** : elles sont régénérées à
partir des pages Webflow d'origine conservées dans `pages/`.

```bash
python3 outils/build.py
```

Se lance depuis n'importe où, ne demande aucune dépendance, et réécrit les 21
`index.html`. Rien d'autre n'est touché.

## Où modifier quoi

| Ce que tu veux changer | Le fichier |
|---|---|
| Le **contenu** d'une page (textes, blocs) | `pages/<page>.html`, puis relancer le script |
| Les **animations**, la navigation, les transitions | `../assets/app.js` — pas concerné par le script |
| Les **styles** | `../assets/style.css` |

**Modifier directement `accueil/index.html` (ou ses 20 voisins) ne sert à rien :
la prochaine exécution du script écrasera le changement.** C'est le seul piège.

## Ce que le script fait

Il part du `<body>` de la page Webflow d'origine, puis :

- retire le runtime Webflow, **sauf** les blocs
  `<script type="application/json" class="w-json">` qui portent les données de la
  visionneuse d'images ;
- remplace chaque URL du CDN Webflow par le fichier local correspondant, via la
  table `assetmap_all.json` ;
- rend les liens internes relatifs, pour que le site marche à n'importe quelle
  racine (c'est ce qui a permis de passer de `github.io/portfolio/` au domaine
  sans rien reconstruire) ;
- ajoute au bout de chaque lien CSS/JS une **empreinte du contenu** (`?v=...`).
  Sans elle, le navigateur rejoue l'ancienne version après un déploiement — le
  cache de GitHub Pages est agressif ;
- ne charge jQuery et le runtime Webflow que sur les pages qui ont réellement une
  visionneuse ou un carrousel.

## Les autres fichiers

- `pages/` — les 22 pages Webflow d'origine. **La matière première : à conserver.**
- `assetmap_all.json` — table « URL du CDN Webflow → fichier local ». Nécessaire
  au script.
- `ixdata.json` — les données d'animation extraites du bundle Webflow (234
  événements, 90 listes d'actions). Le script ne s'en sert pas, mais c'est la
  **référence** des durées et des courbes : à consulter avant de toucher à une
  animation dans `app.js`.

## Attention

Le site n'est plus une réplique stricte. Les écarts volontaires sont listés dans
le README à la racine — ne pas les « corriger » en comparant au site Webflow.
