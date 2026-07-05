// Silvia Schuldis – Website-Interaktionen
// Mobiles Menü + sanftes Einblenden beim Scrollen (respektiert prefers-reduced-motion)

(function () {
  // Mobiles Menü
  var toggle = document.querySelector('.nav-toggle');
  var nav = document.querySelector('.main-nav');
  if (toggle && nav) {
    toggle.addEventListener('click', function () {
      var open = nav.classList.toggle('open');
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
    // Menü schließen, wenn ein Link gewählt wurde
    nav.addEventListener('click', function (e) {
      if (e.target.tagName === 'A') {
        nav.classList.remove('open');
        toggle.setAttribute('aria-expanded', 'false');
      }
    });
  }

  // Scroll-Reveal
  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var items = document.querySelectorAll('.reveal');
  if (reduced || !('IntersectionObserver' in window)) {
    items.forEach(function (el) { el.classList.add('visible'); });
    return;
  }
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        io.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
  items.forEach(function (el) { io.observe(el); });

  // Fallback: falls der IntersectionObserver nicht feuert (z. B. ältere Browser,
  // eingebettete Ansichten), Sichtbarkeit zusätzlich beim Scrollen prüfen
  function checkVisible() {
    var vh = window.innerHeight || document.documentElement.clientHeight;
    items.forEach(function (el) {
      if (el.classList.contains('visible')) return;
      var r = el.getBoundingClientRect();
      if (r.top < vh - 30 && r.bottom > 0) el.classList.add('visible');
    });
  }
  window.addEventListener('scroll', checkVisible, { passive: true });
  window.addEventListener('resize', checkVisible, { passive: true });
  checkVisible();
})();
