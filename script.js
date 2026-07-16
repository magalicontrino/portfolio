/* =========================================================
   magalicontrino.com — page d'entrée
   Diaporama de fond + animations d'entrée.
   ========================================================= */
(function () {
  'use strict';

  var SLIDES = [
    { src: 'assets/images/bg-679ce50d.jpg', position: 'right' },
    { src: 'assets/images/bg-3e6c9911.jpg', position: 'center' },
    { src: 'assets/images/bg-5e4ae471.jpg', position: 'center' },
    { src: 'assets/images/bg-8cf5d34e.jpg', position: 'center' }
  ];

  var FADE_MS = 1000; // durée du fondu, doit rester alignée sur la transition CSS
  var HOLD_MS = 3875; // temps d'affichage d'une image avant l'enchaînement
  var START_MS = 750; // pause avant le premier enchaînement

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- Diaporama de fond ---------- */
  function slideshow(root) {
    var slides = SLIDES.map(function (s) {
      var el = document.createElement('div');
      el.style.backgroundImage = "url('" + s.src + "')";
      el.style.backgroundPosition = s.position;
      root.appendChild(el);
      return el;
    });

    var pos = 0;
    slides[pos].classList.add('visible', 'top', 'initial');

    if (slides.length < 2 || reduceMotion) return;

    // La vue entrante passe au-dessus et s'opacifie ; la sortante n'est retirée
    // qu'une fois le fondu terminé, sinon elle disparaîtrait d'un coup.
    var locked = false;
    function next() {
      if (locked) return;
      locked = true;
      var last = pos;
      pos = (pos + 1) % slides.length;
      slides[last].classList.remove('top');
      slides[pos].classList.add('top', 'visible');
      setTimeout(function () {
        slides[last].classList.remove('visible', 'initial');
        locked = false;
      }, FADE_MS);
    }

    setTimeout(function () {
      setInterval(next, HOLD_MS);
    }, START_MS);
  }

  /* ---------- Animations d'entrée ---------- */
  function playEntrance() {
    document.querySelectorAll('[data-onvisible], [data-onvisible-trigger]').forEach(function (el) {
      el.classList.add('is-visible');
    });
  }

  /* ---------- Démarrage ---------- */
  var bg = document.querySelector('.site-bg');
  if (bg) slideshow(bg);

  var started = false;

  // On attend le chargement des images pour éviter un premier fondu à vide.
  function start() {
    if (started) return;
    started = true;
    document.body.classList.remove('is-loading');
    // Reflow forcé : sans lecture de layout, le navigateur groupe le retrait de
    // « is-loading » avec l'ajout de « is-visible » et les transitions sautent.
    void document.body.offsetWidth;
    playEntrance();
  }

  if (document.readyState === 'complete') start();
  else window.addEventListener('load', start);

  // Garde-fou : si une image de fond ne répond pas, on affiche quand même.
  setTimeout(start, 3000);
})();
