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

  var EASE = {
    outQuad: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
    inOutQuad: 'cubic-bezier(0.455, 0.03, 0.515, 0.955)',
    outQuart: 'cubic-bezier(0.165, 0.84, 0.44, 1)',
    outQuint: 'cubic-bezier(0.23, 1, 0.32, 1)',
    easeIn: 'cubic-bezier(0.42, 0, 1, 1)',
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
    var pending = $$('[style*="translate3d"], [style*="opacity"]').filter(function (el) {
      return !el.matches(heroSel) && handled.indexOf(el) === -1;
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
  var PARALLAX = [
    { sel: '.ecran-site-accueil', axis: 'Y', from: 120, to: -50, unit: 'px', k0: 0, k1: 70 },
    { sel: '.image-43', axis: 'Y', from: 0, to: -88, unit: '%', k0: 50, k1: 65 },
    { sel: '.gallery-track', axis: 'X', from: 0, to: -16, unit: 'vh', k0: 0, k1: 100 }
  ];

  function parallax() {
    if (reduce) return;
    var items = [];
    PARALLAX.forEach(function (p) {
      $$(p.sel).forEach(function (el) { items.push({ el: el, p: p }); });
    });
    if (!items.length) return;

    function tick() {
      var vh = window.innerHeight;
      items.forEach(function (it) {
        var r = it.el.getBoundingClientRect();
        // 0 % : l'élément entre par le bas ; 100 % : il sort par le haut.
        var prog = (vh - r.top) / (vh + r.height) * 100;
        var p = it.p;
        var t = (prog - p.k0) / (p.k1 - p.k0);
        t = Math.max(0, Math.min(1, t));
        var v = p.from + (p.to - p.from) * t;
        it.el.style.transition = 'none';
        it.el.style.transform = 'translate' + p.axis + '(' + v.toFixed(2) + p.unit + ')';
      });
    }
    tick();
    addEventListener('scroll', tick, { passive: true });
    addEventListener('resize', tick);
  }

  /* ---------------------------------------------------------
     Mégamenu
     --------------------------------------------------------- */
  function megamenu() {
    var trigger = document.getElementById('open');
    var menu = $('.navmenu');
    if (!trigger || !menu) return;
    var open = false;

    menu.style.display = 'none';
    menu.style.opacity = '0';

    // Le moteur d'origine peint les barres du hamburger dès le chargement,
    // avec l'état de repos de l'interaction de fermeture — le CSS seul les
    // laisserait transparentes.
    $$('.hamburger-line-top, .hamburger-line-middle, .hamburger-line-bottom')
      .forEach(function (l) { l.style.backgroundColor = 'rgb(28, 26, 26)'; });

    function close() {
      open = false;
      document.body.style.overflow = 'auto';
      animate(menu, { opacity: '0' }, { duration: 800, easing: 'ease' });
      setTimeout(function () { if (!open) menu.style.display = 'none'; }, 800);
    }

    trigger.addEventListener('click', function (e) {
      e.preventDefault();
      if (open) return close();
      open = true;
      document.body.style.overflow = 'hidden';
      menu.style.display = 'block';
      animate(menu, { opacity: '1' }, { duration: 600, easing: 'ease' });
    });

    $$('.navlink, .contact-big, .contact-big-mobile', menu).forEach(function (a) {
      a.addEventListener('click', close);
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
    cursor();
    scrollReveals();
    parallax();
    intro();
    document.body.classList.add('is-ready');
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start);
  else start();
})();
