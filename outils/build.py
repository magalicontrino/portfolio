"""Régénère les 21 pages du site à partir des pages Webflow d'origine.

    python3 outils/build.py

Se lance depuis n'importe où : les chemins se déduisent de l'emplacement du
script. Voir outils/README.md.
"""
import re, json, os, urllib.parse

# Le script vit dans outils/ ; le site est un cran au-dessus. Aucun chemin
# absolu : le dépôt doit pouvoir être cloné n'importe où.
ICI = os.path.dirname(os.path.abspath(__file__))
REPO = os.path.dirname(ICI)

def _v(rel):
    # Empreinte du contenu ajoutee aux liens CSS/JS : sans elle, le navigateur
    # rejoue l'ancienne version apres un deploiement (cache de GitHub Pages).
    import hashlib, os
    p=os.path.join(REPO,'assets',rel)
    if not os.path.exists(p): return ''
    return '?v='+hashlib.sha1(open(p,'rb').read()).hexdigest()[:8]
SURCHARGES = '''

/* =========================================================
   SURCHARGES ASSUMEES — ecarts volontaires avec le site d'origine
   Tout ce qui suit corrige une panne du site source. Rien d'autre
   dans ce fichier ne s'ecarte de l'original.
   ========================================================= */

/* (aucune pour l'instant) */
'''
def _appliquer_surcharges():
    import os
    p=os.path.join(REPO,'assets','style.css')
    c=open(p).read()
    if 'SURCHARGES ASSUMEES' in c: return
    open(p,'w').write(c+SURCHARGES)
_appliquer_surcharges()

VCSS=_v('style.css'); VJS=_v('app.js'); VLUXY=_v('luxy.js')
amap=json.load(open(os.path.join(ICI,'assetmap_all.json')))
uq={urllib.parse.unquote(k):v for k,v in amap.items()}

# Ces deux fichiers sont refuses par le CDN (403) et deja casses sur le site
# d'origine : on laisse l'URL telle quelle, le resultat visuel est le meme.
BROKEN=('654a7c7ad320dbb58c6a83ef_arrow.svg','655d49586126f040f86eb590_MacBook.png')

# Scroll inertiel : retire a la demande de la cliente. Le fichier luxy.js reste
# dans assets/ et le wrapper #luxy dans le HTML (inerte). Remettre a True pour
# le reactiver sur les pages qui portent #luxy.
LUXY = False

# page -> (fichier source, dossier de sortie, profondeur vers la racine)
PAGES={
  'accueil':  ('pages/home.html',  'accueil',  1),
  'photo':    ('pages/photo.html', 'photo',    1),
  'web':      ('pages/web.html',   'web',      1),
  'infos':    ('pages/infos.html', 'infos',    1),
}
for slug in ('ambassadeurs','casa-linear','cavadaliga','celie-yoga','kioskup','loransse-doe'):
    PAGES[f'websites/{slug}']=(f'pages/websites_{slug}.html', f'websites/{slug}', 2)
for slug in ('kioskup','noir-et-blanc','la-saison-des-chants','nature','galerie','calais',
             'manif','musique','ambiance','reciproque','en-couleur','studio'):
    PAGES[f'projets-photo/{slug}']=(f'pages/projets-photo_{slug}.html', f'projets-photo/{slug}', 2)

def local(u):
    if any(b in u for b in BROKEN): return None
    return amap.get(u) or uq.get(urllib.parse.unquote(u))

def build(name, src, outdir, depth):
    h=open(os.path.join(ICI,src)).read()
    up='../'*depth
    body=h[h.find('<body'):h.rfind('</body>')+7]
    # Les blocs <script type="application/json" class="w-json"> portent les donnees
    # de la visionneuse : on les garde. Le reste du runtime saute.
    body=re.sub(r'<script(?![^>]*application/json).*?</script>','',body,flags=re.S)

    # Toute URL du CDN devient locale, en premier et quel qu'en soit le
    # contexte. Les blocs de donnees de la visionneuse (w-json) sont conserves
    # tels quels par le filtre des scripts, et leurs URL echappent donc a toutes
    # les passes ci-dessus -- les galeries allaient chercher Webflow a chaque
    # ouverture d'une photo en grand.
    def cdn(m):
        u=m.group(0)
        # Certains noms de fichiers contiennent un guillemet, ecrit `&quot;` dans
        # la page ; la table, elle, garde l'URL telle que le serveur l'attend.
        v=local(u) or local(u.replace('&quot;','"'))
        return (up+'assets/'+v) if v else u
    # On borne l'URL a son extension plutot qu'a un delimiteur : ces noms de
    # fichiers contiennent des parentheses, des espaces encodes et parfois un
    # guillemet, si bien qu'aucun caractere de fin n'est fiable.
    body=re.sub(r'https://cdn\.prod\.website-files\.com/[^"\s>]*?\.(?:jpe?g|png|svg|webp|gif)',
                cdn, body, flags=re.I)

    # Les visuels ajoutes apres coup (hors CDN Webflow) s'ecrivent « /assets/... »
    # dans la page source. On les rend relatifs a la profondeur de la page, comme
    # tout le reste : le site doit continuer a fonctionner a n'importe quelle racine.
    #
    # On leur ajoute aussi l'empreinte de leur contenu. Les visuels du CDN Webflow
    # ne changent jamais, mais ceux-la sont retouches : sans empreinte, le
    # navigateur ressert l'ancienne image pendant des jours.
    def relatif(u):
        if not u.startswith('/assets/'): return u
        return up+u.lstrip('/')+_v(u[len('/assets/'):])

    def attr(m):
        a,u=m.group(1),m.group(2)
        if u.startswith('/assets/'):
            return f'{a}="{relatif(u)}"'
        if u.startswith('http') and re.search(r'\.(png|jpg|jpeg|svg|webp|gif)(\?|$)',u,re.I):
            v=local(u)
            return f'{a}="{up}assets/{v}"' if v else m.group(0)
        return m.group(0)
    body=re.sub(r'\b(src|href)="([^"]+)"', attr, body)

    def srcset(m):
        parts=[]
        for p in m.group(1).split(','):
            p=p.strip()
            if not p: continue
            bits=p.split(' ',1); v=local(bits[0])
            cible=(up+'assets/'+v) if v else relatif(bits[0])
            parts.append(cible+((' '+bits[1]) if len(bits)>1 else ''))
        return 'srcset="'+', '.join(parts)+'"'
    body=re.sub(r'srcset="([^"]*)"', srcset, body)

    # Les visuels poses en CSS dans un attribut style (background-image) echappent
    # aux deux passes ci-dessus, qui ne regardent que src/href/srcset. Sans ceci
    # un logo reste en chemin absolu, sans empreinte : il casse des qu'on sert le
    # site ailleurs qu'a la racine.
    def fond(m):
        guillemet=m.group(1) or ''
        u=m.group(2)
        v=local(u)
        cible=(up+'assets/'+v) if v else relatif(u)
        return f'background-image:url({guillemet}{cible}{guillemet})'
    body=re.sub(r'background-image:url\((&quot;|\'|")?([^)]+?)\1?\)', fond, body)


    # Liens internes -> relatifs. /webdesign renvoie 404 sur le site d'origine : neutralise.
    body=body.replace('https://magalicontrino.webflow.io/','/')
    body=re.sub(r'href="/websites/([\w-]+)"', lambda m: f'href="{up}websites/{m.group(1)}/"', body)
    body=re.sub(r'href="/projets-photo/([\w-]+)"', lambda m: f'href="{up}projets-photo/{m.group(1)}/"', body)
    body=re.sub(r'href="/(photo|web|infos)"', lambda m: f'href="{up}{m.group(1)}/"', body)
    # /webdesign renvoie un 404 sur le site d'origine : on pointe vers la
    # rubrique qui existe. Ecart assume, documente dans le README.
    body=body.replace('href="https://magalicontrino@hotmail.fr"', 'href="mailto:magalicontrino@hotmail.fr"')
    # Ces deux images sont refusees par le CDN (403) et deja cassees sur le site
    # d'origine : on retire les balises plutot que de laisser des requetes echouer.
    for _dead in BROKEN:
        body=re.sub(r'<img[^>]*'+re.escape(_dead)+r'[^>]*>', '', body)
    body=re.sub(r'href="/webdesign"', f'href="{up}web/"', body)
    # Le second site magalicontrinophotographie.webflow.io n'existe plus (404
    # partout). Ses deux entrees du megamenu pointent vers la rubrique photo.
    body=re.sub(r'href="https://magalicontrinophotographie\.webflow\.io[^"]*"', f'href="{up}photo/"', body)
    body=re.sub(r'href="/"', f'href="{up}accueil/"', body)

    has_luxy = 'id="luxy"' in body
    # Modules Webflow encore actifs sur le site d'origine : la visionneuse des
    # galeries et le carrousel des pages projet. On rejoue le runtime d'origine
    # plutot que de les reecrire.
    needs_wf = ('w-lightbox' in body) or ('w-slider' in body)

    # Sur ces pages, le moteur d'animations de Webflow tourne aussi. Il reconnait
    # ses cibles au data-w-id et s'empare du menu -- il posait sur les barres du
    # hamburger un translate3d(-100%) qui ecrasait la croix d'app.js. On lui
    # retire donc le menu : app.js cible par classe, jamais par data-w-id.
    if needs_wf:
        def sans_wid(m):
            return re.sub(r'\s*data-w-id="[^"]*"', '', m.group(0))
        body=re.sub(r'<[^>]*class="[^"]*(?:hamburger-line|navmenu|megamenu-innerwrapper)[^"]*"[^>]*>',
                    sans_wid, body)
    title=re.search(r'<title>(.*?)</title>', h, re.S)
    desc=re.search(r'<meta name="description" content="([^"]*)"', h)
    head=f'''<!DOCTYPE html>
<html lang="fr">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>{title.group(1).strip() if title else name}</title>
{f'<meta name="description" content="{desc.group(1)}" />' if desc else ''}
<link rel="icon" type="image/png" sizes="32x32" href="{up}assets/img/favicon-32.png{_v('img/favicon-32.png')}" />
<link rel="icon" type="image/png" sizes="16x16" href="{up}assets/img/favicon-16.png{_v('img/favicon-16.png')}" />
<link rel="icon" type="image/png" sizes="192x192" href="{up}assets/img/favicon-192.png{_v('img/favicon-192.png')}" />
<link rel="icon" type="image/x-icon" href="{up}favicon.ico" />
<link rel="apple-touch-icon" href="{up}assets/img/favicon-180.png{_v('img/favicon-180.png')}" />
<link rel="stylesheet" href="{up}assets/style.css{VCSS}" />
</head>
'''
    tail = f'  <script src="{up}assets/app.js{VJS}"></script>\n'
    # Scroll inertiel (luxy) : retire a la demande. Le site d'origine l'active sur
    # les pages portant #luxy (photo, web, infos) ; le defilement est desormais
    # natif partout. Le wrapper #luxy reste dans le HTML, inerte.
    if LUXY and has_luxy:
        tail += (f'  <script src="{up}assets/luxy.js{VLUXY}"></script>\n')
    if needs_wf:
        # Sans data-wf-page, le moteur d'animations de Webflow reste inerte et
        # n'entre pas en conflit avec app.js : seuls la visionneuse et le
        # carrousel s'activent.
        tail += (f'  <script src="{up}assets/jquery.js"></script>\n'
                 f'  <script src="{up}assets/webflow.js"></script>\n')
    out=head+body.replace('</body>', tail+'</body>')+'\n</html>\n'
    d=os.path.join(REPO,outdir); os.makedirs(d, exist_ok=True)
    open(os.path.join(d,'index.html'),'w').write(out)
    ext=len(set(re.findall(r'(?:src|href)="(https?://[^"]+)"', out)))
    return len(out), ext

print(f"{'page':22} {'octets':>8}  liens externes restants")
for name,(src,outdir,depth) in PAGES.items():
    n,ext=build(name,src,outdir,depth)
    print(f"  {name:20} {n:>8}  {ext}")
