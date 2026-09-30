/* =====================================================================
   Au Bon Pain — Sète
   ===================================================================== */
(function () {
  'use strict';

  /* Adresse email de la boulangerie pour les pré-commandes.
     Laissez vide pour proposer l'appel téléphonique à la place. */
  var EMAIL_BOULANGERIE = '';
  var TELEPHONE = '+33467535931';

  var doc = document;
  var reduit = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var grossier = window.matchMedia && window.matchMedia('(pointer: coarse)').matches;
  var deuxChiffres = function (n) { return (n < 10 ? '0' : '') + n; };

  /* ---- Menu ------------------------------------------------------------ */
  var burger = doc.getElementById('burger'), nav = doc.getElementById('nav');
  if (burger && nav) {
    burger.addEventListener('click', function () {
      var ouvert = nav.classList.toggle('ouvert');
      burger.setAttribute('aria-expanded', String(ouvert));
      burger.setAttribute('aria-label', ouvert ? 'Fermer le menu' : 'Ouvrir le menu');
      doc.body.style.overflow = ouvert ? 'hidden' : '';
    });
    nav.addEventListener('click', function (e) {
      if (e.target.tagName !== 'A') return;
      nav.classList.remove('ouvert');
      burger.setAttribute('aria-expanded', 'false');
      doc.body.style.overflow = '';
    });
  }

  /* ---- En-tête ---------------------------------------------------------- */
  var entete = doc.querySelector('.entete'), attente = false;
  function auDefilement() {
    if (attente) return;
    attente = true;
    requestAnimationFrame(function () {
      if (entete) entete.classList.toggle('pose', window.scrollY > 12);
      attente = false;
    });
  }
  auDefilement();
  window.addEventListener('scroll', auDefilement, { passive: true });

  /* ---- Le four en direct ------------------------------------------------ */
  var FOURNEES = [
    { h: 6,  m: 30, nom: 'Croissants' },
    { h: 7,  m: 30, nom: 'Baguettes' },
    { h: 9,  m: 0,  nom: 'Pains spéciaux' },
    { h: 11, m: 30, nom: 'Salades du jour' },
    { h: 15, m: 0,  nom: 'Viennoiseries' },
    { h: 17, m: 0,  nom: 'Baguettes du soir' }
  ];
  var pendule = doc.getElementById('pendule');
  if (pendule) {
    var sortie = doc.getElementById('sortie');
    var fnom = doc.getElementById('fournee-nom');
    var fheure = doc.getElementById('fournee-heure');
    var majFour = function () {
      var n = new Date();
      pendule.textContent = deuxChiffres(n.getHours()) + ':' + deuxChiffres(n.getMinutes()) + ':' + deuxChiffres(n.getSeconds());
      var minutes = n.getHours() * 60 + n.getMinutes();
      var passee = null, suivante = null;
      FOURNEES.forEach(function (f) {
        var t = f.h * 60 + f.m;
        if (t <= minutes) passee = f;
        else if (!suivante) suivante = f;
      });
      if (!suivante) suivante = FOURNEES[0];
      if (!passee) passee = FOURNEES[FOURNEES.length - 1];
      var fmt = function (f) { return deuxChiffres(f.h) + ':' + deuxChiffres(f.m); };
      if (sortie) sortie.textContent = passee.nom.toUpperCase() + ' — ' + fmt(passee);
      if (fnom) fnom.textContent = suivante.nom;
      if (fheure) fheure.textContent = fmt(suivante);
    };
    majFour();
    setInterval(majFour, 1000);
  }

  /* ---- Horaires : le jour courant ---------------------------------------- */
  var ligneJour = doc.querySelector('.horaires tr[data-jour="' + new Date().getDay() + '"]');
  if (ligneJour) ligneJour.classList.add('auj');

  /* ---- Apparitions -------------------------------------------------------- */
  var blocs = [].slice.call(doc.querySelectorAll('.rev'));
  function toutMontrer() { blocs.forEach(function (el) { el.classList.add('vu'); }); }
  if (!('IntersectionObserver' in window) || reduit) {
    toutMontrer();
  } else {
    var io = new IntersectionObserver(function (entrees) {
      entrees.forEach(function (e) {
        if (!e.isIntersecting) return;
        e.target.classList.add('vu');
        io.unobserve(e.target);
      });
    }, { rootMargin: '0px 0px -6% 0px', threshold: 0.05 });
    blocs.forEach(function (el) { io.observe(el); });
    setTimeout(toutMontrer, 1600);
  }

  /* ---- Anneau de curseur --------------------------------------------------- */
  var anneau = doc.getElementById('anneau');
  if (anneau && !grossier && !reduit) {
    var x = 0, y = 0, cx = 0, cy = 0, lance = false;
    window.addEventListener('pointermove', function (e) {
      x = e.clientX; y = e.clientY;
      if (!lance) { lance = true; cx = x; cy = y; anneau.classList.add('vu'); boucle(); }
    });
    function boucle() {
      cx += (x - cx) * 0.18;
      cy += (y - cy) * 0.18;
      anneau.style.transform = 'translate(' + cx.toFixed(1) + 'px,' + cy.toFixed(1) + 'px)';
      requestAnimationFrame(boucle);
    }
    doc.addEventListener('pointerover', function (e) {
      var cible = e.target.closest ? e.target.closest('a,button') : null;
      anneau.classList.toggle('actif', !!cible);
    });
  }

  /* ---- Réservation ---------------------------------------------------------- */
  var form = doc.getElementById('form-reservation');
  if (form) {
    /* Créneaux de retrait, de 06:30 à 13:00 */
    var zone = doc.getElementById('heures');
    var choisie = '';
    for (var mn = 6 * 60 + 30; mn <= 13 * 60; mn += 30) {
      (function (mn) {
        var lib = deuxChiffres(Math.floor(mn / 60)) + ':' + deuxChiffres(mn % 60);
        var b = doc.createElement('button');
        b.type = 'button';
        b.textContent = lib;
        b.setAttribute('aria-pressed', 'false');
        b.addEventListener('click', function () {
          choisie = lib;
          [].slice.call(zone.children).forEach(function (o) { o.setAttribute('aria-pressed', String(o === b)); });
        });
        zone.appendChild(b);
      })(mn);
    }

    /* Date : aujourd'hui par défaut, pas de date passée */
    var champDate = doc.getElementById('date');
    var auj = new Date();
    var iso = auj.getFullYear() + '-' + deuxChiffres(auj.getMonth() + 1) + '-' + deuxChiffres(auj.getDate());
    champDate.value = iso;
    champDate.min = iso;

    var erreur = doc.getElementById('erreur');
    var recap = doc.getElementById('recap');
    var liste = doc.getElementById('recap-liste');
    var lien = doc.getElementById('lien-mail');

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var nom = doc.getElementById('nom').value.trim();
      var tel = doc.getElementById('tel').value.trim();
      var manque = [];
      if (!nom) manque.push('le nom');
      if (!tel) manque.push('le téléphone');
      if (!champDate.value) manque.push('la date');
      if (!choisie) manque.push("l'heure de retrait");

      if (manque.length) {
        erreur.textContent = 'Il manque ' + manque.join(', ') + '.';
        erreur.classList.add('vu');
        recap.classList.remove('vu');
        return;
      }
      erreur.classList.remove('vu');

      var d = champDate.value.split('-');
      var lignes = [
        ['Nom', nom],
        ['Téléphone', tel],
        ['Email', doc.getElementById('email').value.trim() || '—'],
        ['Retrait', d[2] + '/' + d[1] + '/' + d[0] + ' à ' + choisie],
        ['Panier', doc.getElementById('panier').value || '1'],
        ['Commande', doc.getElementById('details').value.trim() || '—'],
        ['Notes', doc.getElementById('notes').value.trim() || '—']
      ];
      liste.innerHTML = lignes.map(function (l) {
        return '<div><dt>' + l[0] + '</dt><dd>' + String(l[1]).replace(/</g, '&lt;') + '</dd></div>';
      }).join('');

      if (EMAIL_BOULANGERIE) {
        var corps = lignes.map(function (l) { return l[0] + ' : ' + l[1]; }).join('\n');
        lien.href = 'mailto:' + EMAIL_BOULANGERIE
          + '?subject=' + encodeURIComponent('Pré-commande — ' + nom)
          + '&body=' + encodeURIComponent(corps);
        lien.firstChild.textContent = 'Envoyer par email ';
      } else {
        lien.href = 'tel:' + TELEPHONE;
        lien.firstChild.textContent = 'Appeler pour confirmer ';
      }
      recap.classList.add('vu');
      recap.scrollIntoView({ behavior: reduit ? 'auto' : 'smooth', block: 'nearest' });
    });
  }

  var annee = doc.getElementById('annee');
  if (annee) annee.textContent = String(new Date().getFullYear());
})();
