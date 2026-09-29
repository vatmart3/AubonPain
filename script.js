/* Au Bon Pain — Sète : interactions minimales */
(function () {
  'use strict';
  var doc = document;
  var reduit = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* Menu mobile */
  var burger = doc.getElementById('burger');
  var nav = doc.getElementById('nav');
  if (burger && nav) {
    burger.addEventListener('click', function () {
      var ouvert = nav.classList.toggle('ouvert');
      burger.setAttribute('aria-expanded', String(ouvert));
      burger.setAttribute('aria-label', ouvert ? 'Fermer le menu' : 'Ouvrir le menu');
    });
    nav.addEventListener('click', function (e) {
      if (e.target.tagName !== 'A') return;
      nav.classList.remove('ouvert');
      burger.setAttribute('aria-expanded', 'false');
    });
  }

  /* Filet sous l'en-tête au défilement */
  var entete = doc.querySelector('.entete');
  var attente = false;
  window.addEventListener('scroll', function () {
    if (attente) return;
    attente = true;
    requestAnimationFrame(function () {
      if (entete) entete.classList.toggle('pose', window.scrollY > 4);
      attente = false;
    });
  }, { passive: true });

  /* Apparitions */
  var blocs = [].slice.call(doc.querySelectorAll('.rev'));
  function tout() { blocs.forEach(function (el) { el.classList.add('vu'); }); }
  if (!('IntersectionObserver' in window) || reduit) {
    tout();
  } else {
    var io = new IntersectionObserver(function (entrees) {
      entrees.forEach(function (e) {
        if (!e.isIntersecting) return;
        e.target.classList.add('vu');
        io.unobserve(e.target);
      });
    }, { rootMargin: '0px 0px -6% 0px', threshold: 0.06 });
    blocs.forEach(function (el) { io.observe(el); });
    setTimeout(tout, 1500);
  }

  /* Lien de navigation actif */
  var liens = [].slice.call(doc.querySelectorAll('.nav a'));
  var cibles = liens.map(function (a) { return doc.querySelector(a.getAttribute('href')); }).filter(Boolean);
  if ('IntersectionObserver' in window && cibles.length) {
    var suivi = new IntersectionObserver(function (entrees) {
      entrees.forEach(function (e) {
        if (!e.isIntersecting) return;
        liens.forEach(function (a) { a.classList.toggle('actif', a.getAttribute('href') === '#' + e.target.id); });
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    cibles.forEach(function (c) { suivi.observe(c); });
  }

  var annee = doc.getElementById('annee');
  if (annee) annee.textContent = String(new Date().getFullYear());
})();
