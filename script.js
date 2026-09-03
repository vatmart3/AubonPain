/* =====================================================================
   Au Bon Pain — Sète : interactions
   ===================================================================== */
(function () {
  'use strict';

  var doc = document;
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var coarse = window.matchMedia && window.matchMedia('(pointer: coarse)').matches;

  /* ---------- Menu ---------------------------------------------------- */
  var hamb = doc.getElementById('hamb');
  var menu = doc.getElementById('menu');
  if (hamb && menu) {
    hamb.addEventListener('click', function () {
      var open = menu.classList.toggle('open');
      hamb.setAttribute('aria-expanded', String(open));
      hamb.setAttribute('aria-label', open ? 'Fermer le menu' : 'Ouvrir le menu');
      doc.body.style.overflow = open ? 'hidden' : '';
    });
    menu.addEventListener('click', function (e) {
      if (e.target.tagName !== 'A') return;
      menu.classList.remove('open');
      hamb.setAttribute('aria-expanded', 'false');
      doc.body.style.overflow = '';
    });
  }

  /* ---------- En-tête + barre de progression -------------------------- */
  var masthead = doc.querySelector('.masthead');
  var progress = doc.getElementById('progress');
  var ticking = false;

  function onScroll() {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(function () {
      var y = window.scrollY || 0;
      if (masthead) masthead.classList.toggle('stuck', y > 24);
      if (progress) {
        var max = doc.documentElement.scrollHeight - window.innerHeight;
        progress.style.transform = 'scaleX(' + (max > 0 ? Math.min(y / max, 1) : 0) + ')';
      }
      ticking = false;
    });
  }
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  /* ---------- Apparitions au défilement -------------------------------- */
  var reveals = [].slice.call(doc.querySelectorAll('.reveal'));
  function revealAll() { reveals.forEach(function (el) { el.classList.add('seen'); }); }

  if (!('IntersectionObserver' in window) || reduce) {
    revealAll();
  } else {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        en.target.classList.add('seen');
        io.unobserve(en.target);
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
    reveals.forEach(function (el) { io.observe(el); });
    setTimeout(revealAll, 1600); /* filet de sécurité : rien ne reste invisible */
  }

  /* ---------- Compteurs ------------------------------------------------ */
  [].slice.call(doc.querySelectorAll('.count')).forEach(function (el) {
    var to = parseFloat(el.getAttribute('data-to'));
    var dec = parseInt(el.getAttribute('data-dec') || '0', 10);
    if (isNaN(to) || reduce) return;
    var started = false;
    var fmt = function (v) { return v.toFixed(dec).replace('.', ','); };
    var run = function () {
      if (started) return;
      started = true;
      var t0 = performance.now(), dur = 1400;
      (function step(t) {
        var p = Math.min((t - t0) / dur, 1);
        var e = 1 - Math.pow(1 - p, 3);
        el.textContent = fmt(to * e);
        if (p < 1) requestAnimationFrame(step);
      })(t0);
    };
    if ('IntersectionObserver' in window) {
      var o = new IntersectionObserver(function (en) { if (en[0].isIntersecting) { run(); o.disconnect(); } }, { threshold: .6 });
      o.observe(el);
    } else { run(); }
  });

  /* ---------- Lien de navigation actif --------------------------------- */
  var links = [].slice.call(doc.querySelectorAll('.menu a'));
  var targets = links.map(function (a) { return doc.querySelector(a.getAttribute('href')); }).filter(Boolean);
  if ('IntersectionObserver' in window && targets.length) {
    var nav = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        links.forEach(function (a) { a.classList.toggle('on', a.getAttribute('href') === '#' + en.target.id); });
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    targets.forEach(function (t) { nav.observe(t); });
  }

  /* ---------- Filtres de la vitrine ------------------------------------ */
  var chips = [].slice.call(doc.querySelectorAll('.chip'));
  var cartes = [].slice.call(doc.querySelectorAll('#produits .carte'));
  chips.forEach(function (chip) {
    chip.addEventListener('click', function () {
      chips.forEach(function (c) { c.classList.toggle('is-on', c === chip); });
      var f = chip.getAttribute('data-filter');
      cartes.forEach(function (carte) {
        var show = f === 'tout' || carte.getAttribute('data-cat') === f;
        carte.classList.toggle('out', !show);
        carte.setAttribute('aria-hidden', String(!show));
      });
    });
  });

  /* ---------- Inclinaison 3D des cartes -------------------------------- */
  if (!coarse && !reduce) {
    [].slice.call(doc.querySelectorAll('.tilt')).forEach(function (el) {
      var inner = el.querySelector('.carte-in') || el;
      var raf = null, tx = 0, ty = 0;
      el.addEventListener('pointermove', function (e) {
        var r = el.getBoundingClientRect();
        var px = (e.clientX - r.left) / r.width;
        var py = (e.clientY - r.top) / r.height;
        tx = (py - .5) * -9;
        ty = (px - .5) * 11;
        inner.style.setProperty('--mx', (px * 100) + '%');
        inner.style.setProperty('--my', (py * 100) + '%');
        if (raf) return;
        raf = requestAnimationFrame(function () {
          inner.style.transform = 'perspective(1000px) rotateX(' + tx + 'deg) rotateY(' + ty + 'deg) translateY(-6px)';
          raf = null;
        });
      });
      el.addEventListener('pointerleave', function () {
        inner.style.transform = '';
      });
    });
  }

  /* ---------- Boutons magnétiques -------------------------------------- */
  if (!coarse && !reduce) {
    [].slice.call(doc.querySelectorAll('.magnetic')).forEach(function (el) {
      el.addEventListener('pointermove', function (e) {
        var r = el.getBoundingClientRect();
        var dx = (e.clientX - (r.left + r.width / 2)) / r.width;
        var dy = (e.clientY - (r.top + r.height / 2)) / r.height;
        el.style.transform = 'translate(' + (dx * 12).toFixed(2) + 'px,' + (dy * 10).toFixed(2) + 'px)';
      });
      el.addEventListener('pointerleave', function () { el.style.transform = ''; });
    });
  }

  /* ---------- Année ----------------------------------------------------- */
  var annee = doc.getElementById('annee');
  if (annee) annee.textContent = String(new Date().getFullYear());

  /* =====================================================================
     Scène 3D — croissant modélisé et éclairé en lumière d'aube
     ===================================================================== */
  function scene3d() {
    var stage = doc.getElementById('stage');
    var canvas = doc.getElementById('scene');
    if (!stage || !canvas) return;
    if (!window.THREE) { stage.classList.add('no-3d'); return; }

    var renderer;
    try {
      renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true, alpha: true });
    } catch (err) {
      stage.classList.add('no-3d');
      return;
    }
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.outputEncoding = THREE.sRGBEncoding;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.24;

    var scene = new THREE.Scene();
    var camera = new THREE.PerspectiveCamera(36, 1, 0.1, 60);
    camera.position.set(0, 1.45, 7.4);
    camera.lookAt(0, 0.05, 0);

    /* Croûte : texture générée au canvas (grain + éclats dorés) */
    function crust() {
      var c = doc.createElement('canvas');
      c.width = c.height = 512;
      var g = c.getContext('2d');
      g.fillStyle = '#d89a54';
      g.fillRect(0, 0, 512, 512);
      /* marbrures : zones claires beurrées et zones caramélisées */
      for (var b = 0; b < 420; b++) {
        var x = Math.random() * 512, y = Math.random() * 512, rad = 12 + Math.random() * 52;
        var clair = Math.random() < 0.5;
        var grd = g.createRadialGradient(x, y, 0, x, y, rad);
        grd.addColorStop(0, clair ? 'rgba(255,225,170,.16)' : 'rgba(139,72,26,.14)');
        grd.addColorStop(1, 'rgba(0,0,0,0)');
        g.fillStyle = grd;
        g.beginPath(); g.arc(x, y, rad, 0, 6.2832); g.fill();
      }
      /* stries de feuilletage */
      g.lineWidth = 1.4;
      for (var l = 0; l < 90; l++) {
        g.strokeStyle = Math.random() < 0.5 ? 'rgba(255,232,190,.10)' : 'rgba(120,60,20,.10)';
        var yy = Math.random() * 512;
        g.beginPath();
        g.moveTo(0, yy);
        g.bezierCurveTo(170, yy + (Math.random() - .5) * 40, 340, yy + (Math.random() - .5) * 40, 512, yy);
        g.stroke();
      }
      /* grain fin */
      for (var i = 0; i < 9000; i++) {
        var a = (Math.random() * 0.1).toFixed(3);
        g.fillStyle = Math.random() < 0.5 ? 'rgba(255,230,190,' + a + ')' : 'rgba(92,48,16,' + a + ')';
        g.beginPath();
        g.arc(Math.random() * 512, Math.random() * 512, Math.random() * 2.2, 0, 6.2832);
        g.fill();
      }
      var t = new THREE.CanvasTexture(c);
      t.wrapS = t.wrapT = THREE.RepeatWrapping;
      t.repeat.set(3, 2);
      return t;
    }

    var tex = crust();
    var mat = new THREE.MeshStandardMaterial({
      color: 0xe2a75f, map: tex, bumpMap: tex, bumpScale: 0.032,
      roughness: 0.44, metalness: 0.03
    });

    /* Le croissant : tube continu le long d'un arc, dont le rayon est modulé
       pour former six rouleaux, avec des pointes effilées et rentrées. */
    var croissant = new THREE.Group();
    var N = 66, arc = Math.PI * 1.04, R = 1.48, ROULEAUX = 6;
    var lobe = new THREE.SphereGeometry(1, 22, 16);
    for (var i = 0; i < N; i++) {
      var t = i / (N - 1);
      var ang = -arc / 2 + arc * t;
      var effile = Math.pow(Math.sin(Math.PI * t), 0.46);          /* ventre plein, pointes fines */
      var roule = 1 + 0.115 * Math.cos(2 * Math.PI * ROULEAUX * t + 0.6);
      var r = (0.505 * effile + 0.035) * roule;
      var Rl = R * (1 - 0.13 * (1 - Math.sin(Math.PI * t)));       /* les pointes rentrent vers l'intérieur */
      var m = new THREE.Mesh(lobe, mat);
      m.position.set(
        Math.sin(ang) * Rl,
        Math.sin(Math.PI * t) * 0.1 - 0.06,
        -Math.cos(ang) * Rl + R * 0.7
      );
      m.scale.set(r * 1.02, r * 0.9, r * 1.06);
      m.rotation.y = -ang;
      m.rotation.z = (t - 0.5) * 0.3;
      m.castShadow = true;
      m.receiveShadow = true;
      croissant.add(m);
    }
    croissant.rotation.set(-0.42, 0, 0.07);
    croissant.scale.setScalar(1.04);
    scene.add(croissant);

    /* Plan qui reçoit l'ombre portée */
    var sol = new THREE.Mesh(new THREE.PlaneGeometry(24, 24), new THREE.ShadowMaterial({ opacity: 0.5 }));
    sol.rotation.x = -Math.PI / 2;
    sol.position.y = -1.15;
    sol.receiveShadow = true;
    scene.add(sol);

    /* Poussière de farine en suspension */
    var count = 140, pos = new Float32Array(count * 3);
    for (var p = 0; p < count; p++) {
      pos[p * 3] = (Math.random() - 0.5) * 7;
      pos[p * 3 + 1] = (Math.random() - 0.4) * 4.5;
      pos[p * 3 + 2] = (Math.random() - 0.5) * 4;
    }
    var pgeo = new THREE.BufferGeometry();
    pgeo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    var poussiere = new THREE.Points(pgeo, new THREE.PointsMaterial({
      color: 0xffd9a0, size: 0.035, transparent: true, opacity: 0.55, depthWrite: false
    }));
    scene.add(poussiere);

    /* Lumières : clé chaude au-dessus, contre-jour cuivré, appoint doux */
    scene.add(new THREE.HemisphereLight(0xffd7a4, 0x0b0705, 0.5));
    var cle = new THREE.DirectionalLight(0xffcb92, 2.5);
    cle.position.set(3.2, 5.2, 3.4);
    cle.castShadow = true;
    cle.shadow.mapSize.set(1024, 1024);
    cle.shadow.camera.near = 1;
    cle.shadow.camera.far = 18;
    cle.shadow.camera.left = -5; cle.shadow.camera.right = 5;
    cle.shadow.camera.top = 5; cle.shadow.camera.bottom = -5;
    cle.shadow.bias = -0.0012;
    scene.add(cle);
    var contre = new THREE.DirectionalLight(0xff8a44, 1.7);
    contre.position.set(-4.5, 1.6, -3.5);
    scene.add(contre);
    var appoint = new THREE.PointLight(0xffe2b8, 0.9, 14);
    appoint.position.set(-2.2, 0.9, 3.2);
    scene.add(appoint);
    var eclat = new THREE.DirectionalLight(0xfff1d4, 1.1);        /* éclat rasant sur la dorure */
    eclat.position.set(-1.4, 4.2, -1.2);
    scene.add(eclat);

    /* Redimensionnement */
    function resize() {
      var w = stage.clientWidth, h = stage.clientHeight;
      if (!w || !h) return;
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
    }
    resize();
    window.addEventListener('resize', resize);

    /* Pointeur : parallaxe + rotation à la souris */
    var cibleY = 0, cibleX = 0, rotY = 0, rotX = 0, drag = false, lastX = 0, libre = 0;
    stage.addEventListener('pointermove', function (e) {
      var r = stage.getBoundingClientRect();
      var nx = (e.clientX - r.left) / r.width - 0.5;
      var ny = (e.clientY - r.top) / r.height - 0.5;
      cibleX = ny * 0.35;
      if (drag) { libre += (e.clientX - lastX) * 0.01; lastX = e.clientX; }
      else { cibleY = nx * 0.55; }
    });
    stage.addEventListener('pointerdown', function (e) { drag = true; lastX = e.clientX; stage.setPointerCapture(e.pointerId); });
    stage.addEventListener('pointerup', function () { drag = false; });
    stage.addEventListener('pointerleave', function () { drag = false; cibleX = 0; cibleY = 0; });

    /* Boucle, mise en pause hors écran */
    var visible = true;
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (en) { visible = en[0].isIntersecting; }, { threshold: 0.01 }).observe(stage);
    }

    var t0 = performance.now();
    (function boucle(now) {
      requestAnimationFrame(boucle);
      if (!visible) return;
      var s = (now - t0) / 1000;
      if (!reduce) libre += 0.0022;
      rotY += (cibleY + libre - rotY) * 0.06;
      rotX += (cibleX - rotX) * 0.06;
      croissant.rotation.y = rotY;
      croissant.rotation.x = -0.42 + rotX;
      croissant.position.y = reduce ? 0 : Math.sin(s * 0.85) * 0.07;
      poussiere.rotation.y = s * 0.03;
      poussiere.position.y = Math.sin(s * 0.35) * 0.15;
      renderer.render(scene, camera);
    })(t0);
  }

  if (doc.readyState === 'complete') scene3d();
  else window.addEventListener('load', scene3d);
})();
