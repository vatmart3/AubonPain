/* =====================================================================
   Au Bon Pain — Sète
   ===================================================================== */
(function () {
  'use strict';
  var doc = document;
  var reduit = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---- Menu mobile ---------------------------------------------------- */
  var burger = doc.getElementById('burger'), nav = doc.getElementById('nav');
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

  /* ---- Le mot qui change dans le titre -------------------------------- */
  var mot = doc.getElementById('mot');
  if (mot && !reduit) {
    var mots = ['croissant chaud', 'pain frais', 'chocolat fondu', 'café serré', 'beurre fondu'];
    var teintes = ['var(--terre)', 'var(--miel)', 'var(--prune)', 'var(--brun)', 'var(--olive)'];
    var i = 0;
    setInterval(function () {
      var actuel = mot.querySelector('.mot-in');
      if (!actuel) return;
      i = (i + 1) % mots.length;
      actuel.classList.add('sort');
      var suivant = doc.createElement('span');
      suivant.className = 'mot-in entre';
      suivant.textContent = mots[i];
      suivant.style.color = teintes[i];
      mot.appendChild(suivant);
      requestAnimationFrame(function () {
        requestAnimationFrame(function () { suivant.classList.remove('entre'); });
      });
      setTimeout(function () { if (actuel.parentNode) actuel.parentNode.removeChild(actuel); }, 700);
    }, 2600);
  }

  /* ---- Compte à rebours jusqu'à la prochaine fournée de 06h30 ---------- */
  var compte = doc.getElementById('compte');
  if (compte) {
    var majCompte = function () {
      var now = new Date();
      var cible = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 6, 30, 0, 0);
      if (cible <= now) cible.setDate(cible.getDate() + 1);
      var reste = Math.max(0, cible - now);
      var h = Math.floor(reste / 3600000);
      var m = Math.floor(reste / 60000) % 60;
      var s = Math.floor(reste / 1000) % 60;
      var deuxChiffres = function (n) { return (n < 10 ? '0' : '') + n; };
      compte.textContent = h > 0
        ? h + ' h ' + deuxChiffres(m) + ' min'
        : deuxChiffres(m) + ' min ' + deuxChiffres(s) + ' s';
    };
    majCompte();
    setInterval(majCompte, 1000);
  }

  /* ---- Apparitions ----------------------------------------------------- */
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
    }, { rootMargin: '0px 0px -6% 0px', threshold: 0.05 });
    blocs.forEach(function (el) { io.observe(el); });
    setTimeout(tout, 1600);
  }

  /* ---- Compteurs -------------------------------------------------------- */
  [].slice.call(doc.querySelectorAll('.nb')).forEach(function (el) {
    var vers = parseFloat(el.getAttribute('data-vers'));
    var dec = parseInt(el.getAttribute('data-dec') || '0', 10);
    if (isNaN(vers) || reduit) return;
    var lance = false;
    var anime = function () {
      if (lance) return;
      lance = true;
      var t0 = performance.now();
      (function pas(t) {
        var p = Math.min((t - t0) / 1300, 1);
        var e = 1 - Math.pow(1 - p, 3);
        el.textContent = (vers * e).toFixed(dec).replace('.', ',');
        if (p < 1) requestAnimationFrame(pas);
      })(t0);
    };
    if ('IntersectionObserver' in window) {
      var o = new IntersectionObserver(function (en) { if (en[0].isIntersecting) { anime(); o.disconnect(); } }, { threshold: .6 });
      o.observe(el);
    } else { anime(); }
  });

  /* ---- Parallaxe douce sur le collage ----------------------------------- */
  var paras = [].slice.call(doc.querySelectorAll('.para'));
  if (paras.length && !reduit) {
    var enCours = false;
    var majPara = function () {
      var h = window.innerHeight;
      paras.forEach(function (el) {
        var r = el.getBoundingClientRect();
        if (r.bottom < -200 || r.top > h + 200) return;
        var centre = (r.top + r.height / 2 - h / 2) / h;
        var force = parseFloat(el.getAttribute('data-para')) || 10;
        el.style.transform = 'translate3d(0,' + (centre * force).toFixed(2) + 'px,0)';
      });
      enCours = false;
    };
    window.addEventListener('scroll', function () {
      if (enCours) return;
      enCours = true;
      requestAnimationFrame(majPara);
    }, { passive: true });
    majPara();
  }

  /* ---- En-tête ---------------------------------------------------------- */
  var entete = doc.querySelector('.entete'), attente = false;
  window.addEventListener('scroll', function () {
    if (attente) return;
    attente = true;
    requestAnimationFrame(function () {
      if (entete) entete.classList.toggle('pose', window.scrollY > 6);
      attente = false;
    });
  }, { passive: true });

  /* ---- Carrousel de la vitrine ------------------------------------------ */
  var rail = doc.getElementById('rail'), prec = doc.getElementById('prec'), suiv = doc.getElementById('suiv');
  if (rail && prec && suiv) {
    var pas = function () {
      var c = rail.querySelector('.produit');
      var gap = parseFloat(getComputedStyle(rail).columnGap || '19') || 19;
      return Math.round(((c ? c.getBoundingClientRect().width : 228) + gap) * 2);
    };
    prec.addEventListener('click', function () { rail.scrollBy({ left: -pas(), behavior: 'smooth' }); });
    suiv.addEventListener('click', function () { rail.scrollBy({ left: pas(), behavior: 'smooth' }); });
  }

  /* ---- Lien de navigation actif ------------------------------------------ */
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
