/* =========================================================
   Portfolio Magali Contrino — page d'accueil
   Réécriture des interactions du site d'origine (moteur Webflow).

   Le HTML porte, élément par élément, l'état de DÉPART de chaque
   animation en style inline (translate3d + opacity) : c'est ce que
   Webflow grave à la publication pour éviter un flash avant le JS.
   On garde ces états et on se contente de ramener chaque élément à
   son état final. Durées et courbes viennent des données d'origine.
   ========================================================= */
(function () {
  'use strict';

  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };

  /* Une courbe absente d'ici retombe en « linear » sans rien dire : le geste
     perd son élan et paraît lourd. inOutQuart et easeOut manquaient. */
  var EASE = {
    outQuad: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
    inOutQuad: 'cubic-bezier(0.455, 0.03, 0.515, 0.955)',
    outQuart: 'cubic-bezier(0.165, 0.84, 0.44, 1)',
    inOutQuart: 'cubic-bezier(0.77, 0, 0.175, 1)',
    outQuint: 'cubic-bezier(0.23, 1, 0.32, 1)',
    easeIn: 'cubic-bezier(0.42, 0, 1, 1)',
    easeOut: 'cubic-bezier(0, 0, 0.58, 1)',
    ease: 'ease'
  };

  function animate(el, props, opts) {
    if (!el) return;
    opts = opts || {};
    var dur = reduce ? 0 : (opts.duration || 0);
    el.style.transition = Object.keys(props)
      .map(function (p) {
        return hyphen(p) + ' ' + dur + 'ms ' + (EASE[opts.easing] || 'linear') + ' ' + (opts.delay || 0) + 'ms';
      })
      .join(', ');
    void el.offsetWidth; // sans lecture du layout, la transition est court-circuitée
    Object.keys(props).forEach(function (p) { el.style.setProperty(hyphen(p), props[p]); });
  }

  function hyphen(p) { return p.replace(/[A-Z]/g, function (c) { return '-' + c.toLowerCase(); }); }

  // Pose un état sans transition (état de repos, avant toute animation).
  function set(el, props) {
    if (!el) return;
    el.style.transition = 'none';
    Object.keys(props).forEach(function (p) { el.style.setProperty(hyphen(p), props[p]); });
  }

  // Ramène un élément à son état final : plus de décalage, pleine opacité.
  function settle(el, opts) {
    if (!el) return;
    // Le voile de transition et le menu n'appartiennent pas à la page : les
    // « remettre à l'état final » les ferait recouvrir tout l'écran.
    if (el.matches && el.matches('.volet-transition, .navmenu')) return;
    var props = { transform: 'translate3d(0px, 0px, 0px)' };
    if (el.style.opacity !== '' && el.style.opacity !== '1') props.opacity = '1';
    // Les préfixes inline d'origine gagneraient sur notre transform.
    ['-webkit-transform', '-moz-transform', '-ms-transform'].forEach(function (p) {
      el.style.removeProperty(p);
    });
    animate(el, props, opts);
  }

  /* ---------------------------------------------------------
     Intro : colonnes depuis la gauche, icônes depuis la droite,
     titres en fondu.
     --------------------------------------------------------- */
  /* Ces éléments gardent leur décalage de départ : sur le site d'origine
     « Projets photo / webdesign » restent hors cadre à gauche, ils ne sont
     jamais ramenés à zéro. */
  var FROZEN = '.txt-vertical-intro-top';

  var HERO = [
    { sel: '.div-txt-1, .div-txt-2, .div-txt-3', duration: 1000, easing: 'outQuad' },
    { sel: '.txt-vertical-intro', duration: 1000, easing: 'outQuart' },
    { sel: '.div-titre-intro, .div-titre-intro-phone', duration: 2000, easing: 'outQuart' },
    { sel: '.titre-intro1', duration: 500, delay: 100, easing: 'ease' },
    { sel: '.bruxelles-intro-2', duration: 1000, delay: 100, easing: 'outQuad' },
    { sel: '.image-46', duration: 1000, delay: 100, easing: 'ease' },
    { sel: '.intro-parent-2, .intro-text-3, .intro-text-ab-3, .intro-text-container.bas', duration: 1000, delay: 100, easing: 'outQuad' }
  ];

  function intro() {
    HERO.forEach(function (g) {
      $$(g.sel).forEach(function (el) {
        if (!el.matches(FROZEN)) settle(el, g);
      });
    });
    // Les icônes sociales entrent l'une après l'autre.
    $$('.tut-parent, .tut-parent-phone').forEach(function (el, i) {
      settle(el, { duration: 1000, delay: 100 + i * 100, easing: 'easeIn' });
    });
  }

  /* ---------------------------------------------------------
     Révélations au scroll
     Durées et courbes reprises des interactions d'origine.
     --------------------------------------------------------- */

  // Le grand titre : ses lettres remontent l'une après l'autre.
  function revealLetters(wrap, entering) {
    var letters = $$('.interaction-letter-2', wrap);
    var span = $('.text-span-80', wrap) || $('.text-span-80');
    animate(wrap, { opacity: entering ? '1' : '0' }, { duration: 500, easing: 'ease' });
    letters.forEach(function (l, i) {
      animate(l, {
        transform: entering ? 'translateY(0%)' : 'translateY(100%)',
        opacity: entering ? '1' : '0'
      }, { duration: 750, delay: i * 50, easing: 'outQuart' });
    });
    if (span) {
      animate(span, { opacity: entering ? '1' : '0' },
        entering ? { duration: 600, delay: 600, easing: 'ease' } : { duration: 500, delay: 400 });
    }
  }

  var REVEALS = [
    { trigger: '.content-heading-wrapper', replay: true, run: revealLetters },
    { trigger: '.faqs_item', replay: false, run: function (item) {
        animate(item, { transform: 'translateX(0%)' }, { duration: 1500, easing: 'outQuart' });
        var top = $('.faqs_item-top', item);
        if (top) animate(top, { opacity: '1' }, { duration: 1500, easing: 'ease' });
      } },
    { trigger: '.history-item', replay: false, run: function (item) {
        animate(item, { opacity: '1', transform: 'translateY(0px)' }, { duration: 1000, easing: 'outQuart' });
      } }
  ];

  function scrollReveals() {
    var handled = [];

    REVEALS.forEach(function (spec) {
      $$(spec.trigger).forEach(function (el) {
        handled.push(el);
        $$('*', el).forEach(function (c) { handled.push(c); });
        if (reduce || !('IntersectionObserver' in window)) { spec.run(el, true); return; }
        var io = new IntersectionObserver(function (entries) {
          entries.forEach(function (e) {
            spec.run(e.target, e.isIntersecting);
            if (e.isIntersecting && !spec.replay) io.unobserve(e.target);
          });
        }, { threshold: 0.1 });
        io.observe(el);
      });
    });

    // Le reste des éléments encore figés sur leur état de départ.
    var heroSel = HERO.map(function (g) { return g.sel; }).join(', ') + ', .tut-parent, .tut-parent-phone, ' + FROZEN;
    // Le voile de transition et le menu portent eux aussi une opacité en ligne,
    // mais ne sont pas des éléments de la page : sans les écarter, settle() les
    // rallume à 1 — la page reste blanche, ou le menu reste collé dessus.
    var horsPage = '.volet-transition, .navmenu';
    var pending = $$('[style*="translate3d"], [style*="opacity"]').filter(function (el) {
      return !el.matches(heroSel) && !el.matches(horsPage) && handled.indexOf(el) === -1;
    });
    if (!pending.length) return;
    if (reduce || !('IntersectionObserver' in window)) {
      pending.forEach(function (el) { settle(el, { duration: 0 }); });
      return;
    }
    var io2 = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        settle(entry.target, { duration: 1000, easing: 'outQuart' });
        io2.unobserve(entry.target);
      });
    }, { threshold: 0.2 });
    pending.forEach(function (el) { io2.observe(el); });
  }

  /* ---------------------------------------------------------
     Parallaxes pilotées par la progression du scroll
     La valeur suit la traversée de l'écran par l'élément, entre
     deux images-clés — pas une transition minutée.
     --------------------------------------------------------- */
  /* `pilote` déclenche l'effet en traversant l'écran ; `cible` est ce qui
     bouge. Les deux diffèrent souvent — s'y tromper fige l'effet. */
  var PARALLAX = [
    { pilote: '.ecran-site-accueil', cible: null, prop: 'translateY', de: 120, vers: -50, unit: 'px', k0: 0, k1: 70 },
    { pilote: '.ecran-2', cible: '.image-43', prop: 'translateY', de: 0, vers: -88, unit: '%', k0: 50, k1: 65 },
    { pilote: '.gallery', cible: '.gallery-track', prop: 'translateX', de: 0, vers: -16, unit: 'vh', k0: 0, k1: 100 },
    // Les deux photos côte à côte : celle de gauche s'élargit de 35 % à 65 %
    // pendant que la section défile.
    { pilote: '.large-growing-images', cible: '.growing-image.small', prop: 'width', de: 35, vers: 65, unit: '%', k0: 0, k1: 100 },
    { pilote: '.home-process_card-wrapper', cible: null, prop: 'scale', de: 1, vers: 0.8, unit: '', k0: 40, k1: 100 }
  ];

  function parallax() {
    if (reduce) return;
    var items = [];
    PARALLAX.forEach(function (p) {
      $$(p.pilote).forEach(function (pilote) {
        var cibles = p.cible ? $$(p.cible, pilote) : [pilote];
        if (p.cible && !cibles.length) cibles = $$(p.cible); // cible hors du pilote
        cibles.forEach(function (c) { items.push({ pilote: pilote, cible: c, p: p }); });
      });
    });
    if (!items.length) return;

    function tick() {
      var vh = window.innerHeight;
      items.forEach(function (it) {
        var r = it.pilote.getBoundingClientRect();
        // 0 % : le pilote entre par le bas ; 100 % : il sort par le haut.
        var prog = (vh - r.top) / (vh + r.height) * 100;
        var p = it.p;
        var t = (prog - p.k0) / (p.k1 - p.k0);
        t = Math.max(0, Math.min(1, t));
        var v = p.de + (p.vers - p.de) * t;
        it.cible.style.transition = 'none';
        if (p.prop === 'width') it.cible.style.width = v.toFixed(2) + p.unit;
        else if (p.prop === 'scale') it.cible.style.transform = 'scale(' + v.toFixed(3) + ')';
        else it.cible.style.transform = p.prop + '(' + v.toFixed(2) + p.unit + ')';
      });
    }
    tick();
    addEventListener('scroll', tick, { passive: true });
    addEventListener('resize', tick);
  }

  /* ---------------------------------------------------------
     Mégamenu

     ÉCART ASSUMÉ avec le site d'origine, où le menu ne s'ouvre pas :
     ses interactions d'ouverture existent (« Megamenu_open »), visent
     bien `.nav-button-hamburger`, mais appartiennent à une autre page
     du projet Webflow — le moteur ne les active donc jamais ici. Le
     clic ne faisait que bloquer le défilement, sans rien afficher.

     Le menu est rebranché avec l'animation d'origine, valeur pour
     valeur : barres qui s'écartent de ±100 px (outQuart 600 ms),
     navbar qui passe en sombre, panneau en fondu. La fermeture reprend
     « Megamenu_close » (opacité 800 ms, puis display none).
     --------------------------------------------------------- */
  var NOIR = 'rgb(28, 26, 26)';
  var BLANC = 'rgb(255, 255, 255)';

  /* Un lien qui change de page sur ce site — par opposition à une ancre, un
     mailto, un lien externe ou une ouverture dans un nouvel onglet. */
  function lienInterne(a, e) {
    var href = a.getAttribute('href');
    if (!href || href.charAt(0) === '#' || a.target === '_blank') return false;
    if (a.hostname && a.hostname !== location.hostname) return false;
    if (/^(mailto|tel):/.test(href)) return false;
    if (e && (e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0)) return false;
    return true;
  }

  /* Suivre un lien du menu ne le referme pas : la nouvelle page se charge
     derrière lui, et c'est elle qui l'efface en fondu à l'arrivée. Le passage
     d'une page à l'autre tient dans ce drapeau, lu puis oublié aussitôt. */
  var CLE_MENU = 'sortie-menu';
  function marquerSortieMenu() { try { sessionStorage.setItem(CLE_MENU, '1'); } catch (err) {} }
  var ARRIVE_PAR_LE_MENU = (function () {
    try {
      var v = sessionStorage.getItem(CLE_MENU) === '1';
      sessionStorage.removeItem(CLE_MENU);
      return v;
    } catch (err) { return false; }
  })();

  function megamenu() {
    var trigger = document.getElementById('open');
    var menu = $('.navmenu');
    var top = $('.hamburger-line-top');
    var mid = $('.hamburger-line-middle');
    var bot = $('.hamburger-line-bottom');

    // État de repos : le moteur d'origine l'applique au chargement ; sans lui
    // le menu s'afficherait et les barres resteraient transparentes.
    if (menu) set(menu, { display: 'none', opacity: '0' });
    [top, mid, bot].forEach(function (l) { if (l) l.style.backgroundColor = NOIR; });

    if (!trigger || !menu) return;
    var open = false;

    // Attention : .nav-button-hamburger porte un rotate(90deg) en CSS. Les
    // barres paraissent verticales à l'écran mais sont horizontales dans leur
    // propre repère — c'est bien en Y qu'elles se rejoignent.
    // Écart mesuré entre deux barres voisines : 10,8 px.
    var VERS_CENTRE = '0.675rem';

    // Ce même conteneur ne fait que 26 px de haut et rogne ce qui déborde. Une
    // barre de 48 px pivotée à 45° en occupe 37 : sans lever le rognage, la
    // croix est coupée et il n'en reste qu'une tranche.
    var boite = trigger.querySelector('.nav-button-hamburger');

    // Les barres gardent leur noir et le fond de la barre ne bouge pas : seul
    // le pivotement change. Un seul réglage pour la vitesse de la croix.
    var CROIX = 300;

    // Deux fondus, deux intentions.
    // À l'arrivée, le menu découvre la page suivante : c'est un moment à voir
    // passer, on prend son temps.
    var MENU_ARRIVEE = 1300;
    // À la croix, on veut juste sortir du menu : ça ne doit pas se faire attendre.
    var MENU_FERME = 800;

    function openMenu() {
      open = true;
      document.body.style.overflow = 'hidden';
      if (boite) boite.style.overflow = 'visible';
      menu.style.display = 'block';
      animate(menu, { opacity: '1' }, { duration: 100, easing: 'ease' });
      animate(top, { transform: 'translateY(' + VERS_CENTRE + ') rotate(45deg)' }, { duration: CROIX, easing: 'outQuart' });
      animate(bot, { transform: 'translateY(-' + VERS_CENTRE + ') rotate(-45deg)' }, { duration: CROIX, easing: 'outQuart' });
      animate(mid, { opacity: '0' }, { duration: 150, easing: 'ease' });
      trigger.setAttribute('aria-expanded', 'true');
    }

    function closeMenu(fondu) {
      if (!open) return;
      fondu = fondu || MENU_FERME;
      open = false;
      document.body.style.overflow = 'auto';
      animate(menu, { opacity: '0' }, { duration: fondu, easing: 'ease' });
      animate(top, { transform: 'translateY(0) rotate(0deg)' }, { duration: CROIX, easing: 'outQuart' });
      animate(bot, { transform: 'translateY(0) rotate(0deg)' }, { duration: CROIX, easing: 'outQuart' });
      animate(mid, { opacity: '1' }, { duration: 200, delay: 100, easing: 'ease' });
      trigger.setAttribute('aria-expanded', 'false');
      // Le rognage ne revient qu'une fois les barres redressées, sinon on les
      // verrait se faire couper en cours de route.
      setTimeout(function () {
        if (open) return;
        menu.style.display = 'none';
        if (boite) boite.style.overflow = '';
      }, fondu);
    }

    trigger.setAttribute('aria-expanded', 'false');
    trigger.addEventListener('click', function (e) {
      e.preventDefault();
      if (open) closeMenu(); else openMenu();
    });

    // On arrive d'un lien du menu : la page a déjà changé derrière lui. On le
    // repose tel qu'il était, puis on l'efface pour découvrir la nouvelle page.
    if (ARRIVE_PAR_LE_MENU) {
      set(menu, { display: 'block', opacity: '1' });
      set(top, { transform: 'translateY(' + VERS_CENTRE + ') rotate(45deg)' });
      set(bot, { transform: 'translateY(-' + VERS_CENTRE + ') rotate(-45deg)' });
      set(mid, { opacity: '0' });
      if (boite) boite.style.overflow = 'visible';
      open = true;
      document.body.style.overflow = 'hidden';
      // Un timer, jamais requestAnimationFrame : dans un onglet d'arrière-plan
      // celui-ci ne tourne pas et le menu resterait collé sur la page.
      setTimeout(function () { closeMenu(MENU_ARRIVEE); }, 60);
    }

    // Un lien du menu laisse le menu en place et le navigateur naviguer : il
    // couvre l'écran pendant le chargement, et la page suivante l'efface.
    $$('.navlink, .contact-big, .contact-big-mobile', menu).forEach(function (a) {
      a.addEventListener('click', function (e) {
        if (lienInterne(a, e) && !reduce) marquerSortieMenu(); else closeMenu();
      });
    });
    // Échap : le menu couvre tout l'écran, il faut pouvoir en sortir.
    addEventListener('keydown', function (e) {
      if (e.key === 'Escape') closeMenu();
    });
  }

  /* ---------------------------------------------------------
     Trait qui se rétracte au survol des grands liens
     --------------------------------------------------------- */
  function bigLines() {
    $$('.grid-item.text').forEach(function (item) {
      var pairs = [
        { link: $('.contact-big', item), line: $('.line-big', item), open: '25em', shut: '0em', shift: '17.35px', outMs: 400 },
        { link: $('.contact-big-mobile', item), line: $('.line-big-mobile', item), open: '226px', shut: '0px', shift: '0px', outMs: 300 }
      ];
      pairs.forEach(function (p) {
        if (!p.link || !p.line) return;
        p.link.addEventListener('mouseenter', function () {
          animate(p.line, { width: p.shut, transform: 'translateX(' + p.shift + ')' }, { duration: p.outMs, easing: 'inOutQuad' });
        });
        p.link.addEventListener('mouseleave', function () {
          animate(p.line, { width: p.open, transform: 'translateX(0px)' }, { duration: 400, easing: 'inOutQuad' });
        });
      });
    });
  }

  /* ---------------------------------------------------------
     Icônes sociales : couleurs inversées au survol, léger suivi
     de la souris (±20 px).
     --------------------------------------------------------- */
  function tutButtons() {
    $$('.tut-parent, .tut-parent-phone').forEach(function (parent) {
      var inner = $('.tut-inner', parent);
      if (!inner) return;
      var tr = 'transform 500ms linear, background-color 500ms ease, color 500ms ease';

      parent.addEventListener('mouseenter', function () {
        animate(inner, { backgroundColor: 'rgb(0, 0, 0)', color: 'rgb(229, 229, 229)' }, { duration: 500, easing: 'ease' });
      });
      parent.addEventListener('mouseleave', function () {
        animate(inner, { backgroundColor: 'rgb(255, 255, 255)', color: 'rgb(0, 0, 0)' }, { duration: 500, easing: 'ease' });
        inner.style.transition = tr;
        inner.style.transform = 'translate(0px, 0px)';
      });
      parent.addEventListener('mousemove', function (e) {
        if (reduce) return;
        var r = parent.getBoundingClientRect();
        var x = ((e.clientX - r.left) / r.width - 0.5) * 40;
        var y = ((e.clientY - r.top) / r.height - 0.5) * 40;
        inner.style.transition = tr;
        inner.style.transform = 'translate(' + x.toFixed(2) + 'px, ' + y.toFixed(2) + 'px)';
      });
    });
  }

  /* ---------------------------------------------------------
     Transition entre les pages : un fondu

     Un simple fondu au blanc, allongé pour être perceptible. Le blanc
     plutôt que le noir : c'est la couleur du volet prévu à l'origine
     (`.whipe-intro`), et sur un site clair un flash sombre serait dur.

     Pour l'ajuster, les deux durées ci-dessous suffisent.
     --------------------------------------------------------- */
  var FONDU_ENTREE = 850;   // clic -> écran couvert
  var FONDU_SORTIE = 1100;  // page chargée -> écran découvert

  function volet() {
    var v = document.createElement('div');
    v.className = 'volet-transition';
    v.setAttribute('aria-hidden', 'true');
    v.style.cssText = 'position:fixed;inset:0;z-index:9999;background:#fff;' +
      'pointer-events:none;opacity:1;will-change:opacity';
    document.body.appendChild(v);

    if (ARRIVE_PAR_LE_MENU) {
      // C'est le menu qui couvre l'écran et qui va s'effacer : le voile n'a
      // rien à faire ici, il masquerait son fondu. On le neutralise, mais on
      // garde la suite — les liens de cette page méritent leur transition.
      v.style.transition = 'none';
      v.style.opacity = '0';
    } else {
      // Au chargement : le fondu découvre la page.
      // Surtout pas de requestAnimationFrame ici : il ne tourne pas dans un onglet
      // d'arrière-plan, et le voile resterait en place jusqu'au retour du visiteur.
      // Un timer, lui, tourne toujours.
      setTimeout(function () {
        v.style.transition = 'opacity ' + (reduce ? 0 : FONDU_SORTIE) + 'ms ease';
        v.style.opacity = '0';
      }, 0);

      // Filet de sécurité : quoi qu'il arrive, le voile dégage. Mieux vaut une
      // transition ratée qu'une page masquée.
      setTimeout(function () {
        v.style.transition = 'none';
        v.style.opacity = '0';
      }, FONDU_SORTIE + 800);
    }

    if (reduce) return;

    document.addEventListener('click', function (e) {
      var a = e.target.closest && e.target.closest('a');
      if (!a) return;
      // Ancres, mailto, liens externes, nouvel onglet : le navigateur s'en charge.
      if (!lienInterne(a, e)) return;
      // Depuis le menu ouvert, pas de voile : le menu tient déjà l'écran.
      if (a.closest('.navmenu')) return;

      e.preventDefault();
      v.style.transition = 'opacity ' + FONDU_ENTREE + 'ms ease';
      v.style.opacity = '1';
      setTimeout(function () { location.href = a.href; }, FONDU_ENTREE);
    }, true);

    // Retour arrière depuis le cache : le voile doit être retiré.
    addEventListener('pageshow', function (ev) {
      if (ev.persisted) {
        v.style.transition = 'none';
        v.style.opacity = '0';
      }
    });
  }

  /* ---------------------------------------------------------
     Contenu masqué au départ (interaction « fond-noir-intro »)

     Sur /web, `.wrap-home` porte `style="display:none"` en dur dans le
     HTML : c'est l'état de départ d'une animation qui le repasse en
     `block` 500 ms après le chargement. Sans elle, TOUTE la page reste
     vide sous son titre — c'est ce qui arrivait ici.
     --------------------------------------------------------- */
  function contenuDifferé() {
    // Arrivée depuis le menu : c'est lui, la transition. Le pré-chargeur de la
    // page jouerait une seconde arrivée par-dessus le fondu du menu — deux
    // animations qui se marchent dessus. /accueil n'a pas de `.preload-2`,
    // c'est pour ça que lui seul paraissait juste.
    var presse = reduce || ARRIVE_PAR_LE_MENU;

    $$('.wrap-home').forEach(function (el) {
      if (getComputedStyle(el).display !== 'none') return;
      setTimeout(function () { el.style.display = 'block'; }, presse ? 0 : 500);
    });
    // Le voile d'intro se retire vers la gauche pendant ce temps.
    $$('.preload-2').forEach(function (el) {
      if (presse) { set(el, { transform: 'translateX(-100%)' }); return; }
      animate(el, { transform: 'translateX(-100%)' }, { duration: 1500, easing: 'inOutQuad' });
    });
  }

  /* ---------------------------------------------------------
     Titres des rubriques : la graisse s'épaissit au chargement
     Unigeo est une police variable (100–820) : le titre part en
     maigre et prend du corps. C'est l'effet le plus visible de ces
     pages, et il n'était pas repris.
     --------------------------------------------------------- */
  var TITRES = [
    { sel: '.text-block-83', de: 100, vers: 400, duree: 1500, delai: 500 }, // photo
    { sel: '.text-block-44', de: 100, vers: 415, duree: 1500, delai: 0 }    // web
  ];

  function titresVariables() {
    TITRES.forEach(function (t) {
      $$(t.sel).forEach(function (el) {
        set(el, { fontVariationSettings: '"wght" ' + t.de });
        animate(el, { fontVariationSettings: '"wght" ' + t.vers },
          { duration: t.duree, delay: t.delai, easing: 'inOutQuad' });
      });
    });
    // Les parties déjà maigres du titre le restent.
    $$('.text-block-83 .text-span-35, .text-block-44 .text-span-35').forEach(function (el) {
      set(el, { fontVariationSettings: '"wght" 100' });
    });
  }

  /* ---------------------------------------------------------
     Colonnes du hero : « Projets photo » / « Projets webdesign »
     glissent depuis la gauche au survol de leur colonne, puis
     repartent un peu plus loin qu'ils n'étaient venus.
     --------------------------------------------------------- */
  function headerLinks() {
    $$('.link-header-txt').forEach(function (link) {
      var top = $('.txt-vertical-intro-top', link);
      if (!top) return;
      // Deux variantes dans les données d'origine, distinguées par leur
      // position de départ : -112 px (entrée easeIn) et -160 px (easeOut).
      var m = /translate3d\((-?[\d.]+)px/.exec(top.getAttribute('style') || '');
      var start = m ? parseFloat(m[1]) : -112;
      var isA = start > -140;
      var outX = isA ? -120 : -170;

      link.addEventListener('mouseenter', function () {
        animate(top, { transform: 'translateX(0px)' },
          { duration: 500, easing: isA ? 'easeIn' : 'easeOut' });
      });
      link.addEventListener('mouseleave', function () {
        animate(top, { transform: 'translateX(' + outX + 'px)' },
          { duration: 500, easing: 'easeOut' });
      });
    });
  }

  /* ---------------------------------------------------------
     FAQ : survol, puis ouverture/fermeture au clic
     --------------------------------------------------------- */
  /* ---------------------------------------------------------
     Ancres vides

     Webflow se sert de `<a href="#">` comme simple accroche à clic :
     la FAQ, le bouton « les tarifs ici », les cartes. Suivre ces
     ancres renvoie le navigateur en haut de page — la réponse s'ouvre
     ou la carte pivote, mais on ne les voit plus. On neutralise donc
     la navigation partout, sans toucher aux vraies ancres (#nav).
     --------------------------------------------------------- */
  function ancresVides() {
    document.addEventListener('click', function (e) {
      var a = e.target.closest && e.target.closest('a[href="#"]');
      if (a) e.preventDefault();
    }, true);
  }

  function faqs() {
    $$('.faqs_item').forEach(function (item) {
      var q = $('.faqs_question', item);
      var icon = $('.faqs_top-icon', item);
      var lineV = $('.faqs_top-icon-line-v', item);
      var bottom = $('.faqs_item-bottom', item);
      var inner = $('.faqs_item-bottom-inner', item);
      var open = false;

      if (bottom) set(bottom, { height: '0px', overflow: 'hidden' });
      if (inner) set(inner, { transform: 'translateY(1rem) scale(0.96)' });

      function hover(on) {
        if (q) animate(q, { transform: 'translateX(' + (on ? '1rem' : '0rem') + ')' }, { duration: 400, easing: 'outQuart' });
        if (icon) animate(icon, { transform: 'translateX(' + (on ? '-1rem' : '0rem') + ')' }, { duration: 400, easing: 'outQuart' });
        // Le trait vertical de l'icône disparaît : le « + » devient « − ».
        if (lineV) animate(lineV, { height: on ? '0rem' : '1rem' }, { duration: 400, easing: 'outQuart' });
      }
      item.addEventListener('mouseenter', function () { hover(true); });
      item.addEventListener('mouseleave', function () { hover(false); });

      item.addEventListener('click', function () {
        open = !open;
        if (!bottom || !inner) return;
        if (open) {
          // Une transition vers `auto` n'anime pas : on passe par la hauteur
          // mesurée, puis on rend la main à `auto` une fois arrivé.
          animate(bottom, { height: inner.scrollHeight + 'px' }, { duration: 500, easing: 'outQuart' });
          animate(inner, { transform: 'translateY(0rem) scale(1)' }, { duration: 500, easing: 'outQuart' });
          setTimeout(function () { if (open) bottom.style.height = 'auto'; }, 500);
        } else {
          bottom.style.height = bottom.offsetHeight + 'px';
          void bottom.offsetWidth;
          animate(bottom, { height: '0px' }, { duration: 500, easing: 'outQuart' });
          animate(inner, { transform: 'translateY(1rem) scale(0.96)' }, { duration: 500, easing: 'outQuart' });
        }
      });
    });
  }

  /* ---------------------------------------------------------
     Cartes retournables (/infos) et vignette qui s'ouvre au survol
     --------------------------------------------------------- */
  function flipcards() {
    // La face arrière est déjà pivotée de 180° en CSS et les deux faces sont en
    // `backface-visibility: hidden`. Il manque le contexte 3D sur le conteneur :
    // sans lui, la rotation s'aplatit et l'arrière s'affiche EN MIROIR. Le moteur
    // d'origine le pose automatiquement sur les éléments qu'il anime.
    $$('.flipcard-wrapper').forEach(function (wrap) {
      wrap.style.transformStyle = 'preserve-3d';
      wrap.style.perspective = '1000px';
    });

    // Bouton « les tarifs ici » : l'espace qui s'ouvre au survol. Le geste doit
    // suivre la souris, pas se faire attendre — d'où ces durées courtes.
    var BOUTON_OUVRE = 350;
    var BOUTON_FERME = 250;

    $$('.text-wrapper-5').forEach(function (w) {
      var wrap = w.closest('.flipcard-wrapper');
      var img = $('.img-parent', w) || $('.img-parent', w.parentElement || w);

      if (img) {
        set(img, { width: '0em', overflow: 'hidden' });
        w.addEventListener('mouseenter', function () {
          animate(img, { width: '4em' }, { duration: BOUTON_OUVRE, easing: 'inOutQuart' });
        });
        w.addEventListener('mouseleave', function () {
          animate(img, { width: '0em' }, { duration: BOUTON_FERME, easing: 'inOutQuart' });
        });
      }
      if (wrap) {
        w.addEventListener('click', function () {
          animate(wrap, { transform: 'rotateY(180deg)' }, { duration: 400, easing: 'ease' });
        });
      }
    });
    $$('.flipcard-back').forEach(function (b) {
      var wrap = b.closest('.flipcard-wrapper');
      if (!wrap) return;
      b.addEventListener('click', function () {
        animate(wrap, { transform: 'rotateY(360deg)' }, { duration: 400, easing: 'ease' });
        // Le tour complet fini, on revient à 0 sans animation : la carte est
        // de nouveau face avant, prête à repartir.
        setTimeout(function () { set(wrap, { transform: 'rotateY(0deg)' }); }, 400);
      });
    });
  }

  /* ---------------------------------------------------------
     Suivi discret de la souris (±10 px)
     --------------------------------------------------------- */
  function mouseFollow() {
    $$('.link-block-5').forEach(function (el) {
      if (reduce) return;
      el.addEventListener('mousemove', function (e) {
        var r = el.getBoundingClientRect();
        var x = ((e.clientX - r.left) / r.width - 0.5) * 20;
        var y = ((e.clientY - r.top) / r.height - 0.5) * 20;
        el.style.transition = 'transform 500ms linear';
        el.style.transform = 'translate(' + x.toFixed(2) + 'px,' + y.toFixed(2) + 'px)';
      });
      el.addEventListener('mouseleave', function () {
        el.style.transform = 'translate(0px, 0px)';
      });
    });
  }

  /* ---------------------------------------------------------
     Curseur : grossit au survol des liens du menu
     --------------------------------------------------------- */
  function cursor() {
    var el = $('.cursor-parent') || $('.cursor');
    if (!el) return;
    $$('.navlink').forEach(function (a) {
      a.addEventListener('mouseenter', function () {
        animate(el, { width: '4rem', height: '4rem' }, { duration: 600, easing: 'outQuint' });
      });
      a.addEventListener('mouseleave', function () {
        animate(el, { width: '0.75rem', height: '0.75rem' }, { duration: 400, easing: 'outQuint' });
      });
    });
    window.addEventListener('pointermove', function (e) {
      el.style.left = e.clientX + 'px';
      el.style.top = e.clientY + 'px';
    });
  }

  /* ---------------------------------------------------------
     Cartes de projet : un voile légendé apparaît au survol.
     Le CSS seul le laisserait affiché en permanence par-dessus la
     photo — c'est le moteur d'origine qui le masque au chargement.
     --------------------------------------------------------- */
  function cardHovers() {
    $$('.card-link-2, .card-link').forEach(function (link) {
      var card = $('.card-hover-2, .card-hover', link) ||
                 $('.card-hover-2, .card-hover', link.parentElement || link);
      if (!card) return;
      var track = $('.track', card);

      set(card, { display: 'none', opacity: '0' });
      if (track) set(track, { transform: 'translateY(2vh)' });

      link.addEventListener('mouseenter', function () {
        card.style.display = 'flex';
        animate(card, { opacity: '1' }, { duration: 500, easing: 'outQuart' });
        if (track) animate(track, { transform: 'translateY(0vh)' }, { duration: 500, easing: 'outQuint' });
      });
      link.addEventListener('mouseleave', function () {
        animate(card, { opacity: '0' }, { duration: 500, easing: 'outQuart' });
        if (track) animate(track, { transform: 'translateY(2vh)' }, { duration: 500, easing: 'outQuint' });
        setTimeout(function () {
          if (getComputedStyle(card).opacity === '0') card.style.display = 'none';
        }, 500);
      });
    });
  }

  function start() {
    megamenu();
    bigLines();
    tutButtons();
    cardHovers();
    ancresVides();
    volet();
    contenuDifferé();
    titresVariables();
    headerLinks();
    faqs();
    flipcards();
    mouseFollow();
    cursor();
    scrollReveals();
    parallax();
    intro();
    document.body.classList.add('is-ready');
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start);
  else start();
})();
