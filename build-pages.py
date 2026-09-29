# -*- coding: utf-8 -*-
"""Génère les pages du site : coquille commune + contenu par page."""
import os, re

RACINE = os.path.dirname(os.path.abspath(__file__))

PAGES = ['index', 'carte', 'maison', 'avis', 'contact']
TITRES = {
    'index':   ('Au Bon Pain — Boulangerie artisanale à Sète',
                "Boulangerie artisanale à Sète. Pains, viennoiseries, sandwichs, salades et soupes, cuits chaque matin dès 06h30."),
    'carte':   ('La carte — Au Bon Pain, Sète',
                "La carte d'Au Bon Pain à Sète : pains, viennoiseries, sandwichs, salades, soupes et café."),
    'maison':  ('La maison — Au Bon Pain, Sète',
                "Au Bon Pain, boulangerie de quartier à Sète, ouverte dès 06h30, service au comptoir."),
    'avis':    ('Avis — Au Bon Pain, Sète',
                "4,3 sur 5 et 79 avis Google pour la boulangerie Au Bon Pain à Sète."),
    'contact': ('Contact et accès — Au Bon Pain, Sète',
                "36 rue Paul Bousquet, 34200 Sète. Téléphone 04 67 53 59 31. Plan d'accès et itinéraire."),
}
NAV = [('index', 'Accueil'), ('carte', 'La carte'), ('maison', 'La maison'),
       ('avis', 'Avis'), ('contact', 'Contact')]

SPRITE = '''<svg class="sprite" aria-hidden="true">
  <symbol id="four" viewBox="0 0 32 32"><rect x="4" y="6" width="24" height="21" rx="3"/><path d="M9 13h14M9 20h14"/></symbol>
  <symbol id="comptoir" viewBox="0 0 32 32"><path d="M4 20h24v6H4z"/><path d="M7 20V9a3 3 0 0 1 3-3h12a3 3 0 0 1 3 3v11"/><path d="M12 13h8"/></symbol>
  <symbol id="sac" viewBox="0 0 32 32"><path d="M7 11h18l-1.5 16h-15z"/><path d="M12 11V8a4 4 0 0 1 8 0v3"/></symbol>
  <symbol id="tel" viewBox="0 0 32 32"><path d="M11 5 8 6c-2 .7-3 2.8-2.4 4.8a28 28 0 0 0 15.6 15.6c2 .6 4.1-.4 4.8-2.4l1-3-5.4-2.6-2.4 2.6a21 21 0 0 1-8.4-8.4L13.4 10Z"/></symbol>
  <symbol id="horloge" viewBox="0 0 32 32"><circle cx="16" cy="16" r="11.5"/><path d="M16 9v7.5l5 2.6"/></symbol>
  <symbol id="epingle" viewBox="0 0 32 32"><path d="M16 28s9-8.4 9-14a9 9 0 1 0-18 0c0 5.6 9 14 9 14Z"/><circle cx="16" cy="14" r="3.4"/></symbol>
  <symbol id="etoile" viewBox="0 0 24 24"><path d="m12 2.8 2.85 5.78 6.38.93-4.62 4.5 1.09 6.35L12 17.36l-5.7 3 1.09-6.35-4.62-4.5 6.38-.93z" fill="currentColor" stroke="none"/></symbol>
</svg>'''

def entete(page):
    liens = '\n      '.join(
        '<a href="%s.html"%s>%s</a>' % (p, ' class="actif"' if p == page else '', libelle)
        for p, libelle in NAV)
    return '''<header class="entete">
  <div class="cadre entete-in">
    <a class="logo" href="index.html">
      <span class="logo-pastille">AB</span>
      <span class="logo-txt"><b>Au Bon Pain</b><small>Boulangerie · Sète</small></span>
    </a>
    <nav class="nav" id="nav" aria-label="Navigation principale">
      %s
    </nav>
    <a class="pilule" href="tel:+33467535931"><svg class="ico sm"><use href="#tel"></use></svg> 04 67 53 59 31</a>
    <button class="burger" id="burger" aria-expanded="false" aria-controls="nav" aria-label="Ouvrir le menu"><span></span><span></span></button>
  </div>
</header>''' % liens

PIED = '''<footer class="pied">
  <div class="cadre pied-grille">
    <div class="pied-bloc"><svg class="ico"><use href="#epingle"></use></svg><div><b>Nous trouver</b><span>36 rue Paul Bousquet<br>34200 Sète</span></div></div>
    <div class="pied-bloc"><svg class="ico"><use href="#horloge"></use></svg><div><b>Ouverture</b><span>Première fournée à 06h30<br><small>Fermeture à confirmer par téléphone</small></span></div></div>
    <div class="pied-bloc"><svg class="ico"><use href="#etoile"></use></svg><div><b>Avis Google</b><span>4,3 / 5 — 79 avis<br>1 à 10 € par personne</span></div></div>
    <div class="pied-bloc"><svg class="ico"><use href="#tel"></use></svg><div><b>Nous appeler</b><span><a href="tel:+33467535931">04 67 53 59 31</a></span></div></div>
  </div>
  <div class="cadre pied-bas">
    <nav class="pied-nav" aria-label="Pied de page">
      <a href="index.html">Accueil</a><a href="carte.html">La carte</a><a href="maison.html">La maison</a><a href="avis.html">Avis</a><a href="contact.html">Contact</a>
    </nav>
    <small>© <span id="annee">2026</span> Au Bon Pain — Sète</small>
  </div>
</footer>

<a class="appel-mobile" href="tel:+33467535931">Appeler · 04 67 53 59 31</a>'''

JSONLD = '''<script type="application/ld+json">
{
  "@context":"https://schema.org","@type":"Bakery","name":"Au Bon Pain",
  "description":"Boulangerie et café avec service au comptoir : soupes, salades, sandwichs, pains et viennoiseries.",
  "address":{"@type":"PostalAddress","streetAddress":"36 rue Paul Bousquet","postalCode":"34200","addressLocality":"Sète","addressCountry":"FR"},
  "telephone":"+33467535931","priceRange":"1–10 €","url":"contact.html",
  "openingHoursSpecification":{"@type":"OpeningHoursSpecification","opens":"06:30"},
  "aggregateRating":{"@type":"AggregateRating","ratingValue":"4.3","reviewCount":"79","bestRating":"5"}
}
</script>'''

def page(nom, contenu):
    titre, desc = TITRES[nom]
    return '''<!DOCTYPE html>
<html lang="fr" class="no-js">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>%s</title>
<meta name="description" content="%s">
<meta name="theme-color" content="#FDF7EF">
<meta property="og:title" content="%s">
<meta property="og:description" content="%s">
<meta property="og:type" content="website">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,500;9..144,600;9..144,700&family=Jost:wght@300;400;500;600&display=swap" rel="stylesheet">
<link rel="icon" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'><rect width='32' height='32' rx='8' fill='%%23C4552F'/><text x='16' y='23' font-family='Georgia,serif' font-size='18' text-anchor='middle' fill='%%23FDF7EF'>A</text></svg>">
<link rel="stylesheet" href="styles.css">
<script>document.documentElement.className = 'js';</script>
%s
</head>
<body>

<a class="skip" href="#contenu">Aller au contenu</a>

%s

%s

<main id="contenu">
%s
</main>

%s

<script src="script.js" defer></script>
</body>
</html>
''' % (titre, desc, titre, desc, JSONLD, SPRITE, entete(nom), contenu, PIED)

# =====================================================================
#  Contenu des pages
# =====================================================================

def photo(fichier, legende, classes='', attrs=''):
    return ('<div class="photo %s"%s style="--img:url(\'images/%s\')" data-legende="%s"></div>'
            % (classes, (' ' + attrs) if attrs else '', fichier, legende))

BANDE_CONTACT = '''
<section class="section appel-final">
  <div class="cadre appel-grille">
    <div class="rev">
      <p class="sur-titre clair">Passez nous voir</p>
      <h2>36 rue Paul Bousquet,<br>tous les matins dès 06h30</h2>
    </div>
    <div class="appel-actions rev">
      <a class="bouton" href="tel:+33467535931">Appeler la boulangerie</a>
      <a class="bouton clair" href="contact.html">Plan d'accès</a>
    </div>
  </div>
</section>'''

# ---------------------------------------------------------------- ACCUEIL
ACCUEIL = '''
<section class="hero">
  <div class="taches" aria-hidden="true"><i class="t1"></i><i class="t2"></i><i class="t3"></i></div>

  <div class="cadre hero-grille">
    <div class="hero-txt">
      <p class="etiq rev">Ouvert dès 06h30 — 36 rue Paul Bousquet, Sète</p>
      <h1 class="rev">
        Ce matin,<br>
        ça sent le <span class="mot" id="mot"><span class="mot-in">croissant chaud</span></span>
      </h1>
      <p class="chapo rev">
        Pains, viennoiseries, sandwichs, salades et soupes.
        Tout est cuit et préparé sur place, servi au comptoir.
      </p>
      <div class="cta rev">
        <a class="bouton" href="carte.html">Voir la carte</a>
        <a class="bouton clair" href="contact.html">Nous trouver</a>
      </div>
      <div class="minuteur rev">
        <span class="braise" aria-hidden="true"></span>
        <div><b>Prochaine fournée du matin</b><strong id="compte">06 h 30</strong></div>
      </div>
    </div>

    <div class="hero-vis rev">
      ''' + photo('vitrine.jpg', 'Photo — la vitrine du matin', 'vis-grande') + '''
      ''' + photo('viennoiseries.jpg', 'Photo — viennoiseries', 'vis-petite') + '''
      <div class="jeton"><b>4,3</b><span>79 avis Google</span></div>
    </div>
  </div>

  <div class="ruban" aria-hidden="true">
    <div class="ruban-def">
      <span>Croissant pur beurre</span><i>✦</i><span>Baguette tradition</span><i>✦</i><span>Pain au chocolat</span><i>✦</i><span>Sandwichs du midi</span><i>✦</i><span>Soupes maison</span><i>✦</i><span>Café au comptoir</span><i>✦</i>
      <span>Croissant pur beurre</span><i>✦</i><span>Baguette tradition</span><i>✦</i><span>Pain au chocolat</span><i>✦</i><span>Sandwichs du midi</span><i>✦</i><span>Soupes maison</span><i>✦</i><span>Café au comptoir</span><i>✦</i>
    </div>
  </div>
</section>

<section class="section">
  <div class="cadre trio">
    <article class="atout rev" style="--c:var(--terre)">
      <span class="pastille"><svg class="ico"><use href="#four"></use></svg></span>
      <h3>Cuit sur place</h3>
      <p>Les pains et les viennoiseries sortent du four tout au long de la matinée, dès l'ouverture.</p>
    </article>
    <article class="atout rev" style="--c:var(--miel)">
      <span class="pastille"><svg class="ico"><use href="#comptoir"></use></svg></span>
      <h3>Servi au comptoir</h3>
      <p>On commande, on est servi, on repart. Sur place pour le café, à emporter pour le reste.</p>
    </article>
    <article class="atout rev" style="--c:var(--olive)">
      <span class="pastille"><svg class="ico"><use href="#sac"></use></svg></span>
      <h3>De 1 à 10 €</h3>
      <p>Du café du matin au déjeuner complet, sans jamais dépasser le budget d'un repas rapide.</p>
    </article>
  </div>
</section>

<section class="section">
  <div class="cadre">
    <div class="chapeau rev">
      <p class="sur-titre">Nos spécialités</p>
      <h2>Quatre bonnes raisons<br>de pousser la porte</h2>
    </div>
    <div class="quatuor">
      <article class="famille rev" style="--c:var(--terre)">
        <span class="numero">01</span>''' + photo('pains.jpg', 'Photo — pains', 'ratio-4x3') + '''
        <div class="famille-txt"><h3>Pains du jour</h3><p>Baguettes tradition, pains de campagne et pains spéciaux, à la fournée.</p><a href="carte.html#pains">Voir la carte</a></div>
      </article>
      <article class="famille rev" style="--c:var(--miel)">
        <span class="numero">02</span>''' + photo('viennoiseries.jpg', 'Photo — viennoiseries', 'ratio-4x3') + '''
        <div class="famille-txt"><h3>Viennoiseries</h3><p>Croissants pur beurre, pains au chocolat et brioches, cuits sur place.</p><a href="carte.html#viennoiseries">Voir la carte</a></div>
      </article>
      <article class="famille rev" style="--c:var(--olive)">
        <span class="numero">03</span>''' + photo('sandwichs.jpg', 'Photo — sandwichs', 'ratio-4x3') + '''
        <div class="famille-txt"><h3>Le midi</h3><p>Sandwichs préparés le matin, salades composées et soupes maison.</p><a href="carte.html#midi">Voir la carte</a></div>
      </article>
      <article class="famille rev" style="--c:var(--prune)">
        <span class="numero">04</span>''' + photo('cafe.jpg', 'Photo — café', 'ratio-4x3') + '''
        <div class="famille-txt"><h3>Café &amp; douceurs</h3><p>Le café pris debout au comptoir, et la pâtisserie du jour qui va avec.</p><a href="carte.html#cafe">Voir la carte</a></div>
      </article>
    </div>
  </div>
</section>

<section class="section maison feston">
  <div class="cadre maison-grille">
    <div class="maison-txt rev">
      <p class="sur-titre clair">La maison</p>
      <h2>Ouverte avant<br>tout le monde</h2>
      <p>Au Bon Pain, c'est le café pris debout au comptoir avant le travail, la baguette récupérée en rentrant, et la pause du midi entre deux rendez-vous.</p>
      <div class="compteurs">
        <div><b class="nb" data-vers="4.3" data-dec="1">4,3</b><span>sur 5 · Google</span></div>
        <div><b class="nb" data-vers="79">79</b><span>avis publiés</span></div>
        <div><b>06:30</b><span>première fournée</span></div>
      </div>
      <a class="bouton clair" href="maison.html">Notre histoire</a>
    </div>
    <div class="collage rev">
      ''' + photo('boutique.jpg', 'Photo — la boutique', 'grand para', 'data-para="14"') + '''
      ''' + photo('vitrine.jpg', 'Photo — vitrine', 'para', 'data-para="-10"') + '''
      ''' + photo('fournee.jpg', 'Photo — fournée', 'para', 'data-para="8"') + '''
    </div>
  </div>
</section>
''' + BANDE_CONTACT

# ---------------------------------------------------------------- CARTE
PRODUITS = [
  ('pains', 'Pains', 'terre', 'Cuits à la fournée, du matin jusqu’en fin de journée.', [
    ('Baguette tradition', 'Croûte croustillante, mie alvéolée', '1,20 €', 'baguette.jpg'),
    ('Pain de campagne', 'À la coupe, se garde plusieurs jours', '2,20 €', 'campagne.jpg'),
    ('Pains spéciaux', 'Céréales, complet, selon la fournée', '2,40 €', 'pains.jpg'),
  ]),
  ('viennoiseries', 'Viennoiseries', 'miel', 'Feuilletage cuit sur place, sorti du four toute la matinée.', [
    ('Croissant pur beurre', 'Le préféré des habitués', '1,30 €', 'croissant.jpg'),
    ('Pain au chocolat', 'Deux barres de chocolat, feuilletage doré', '1,50 €', 'pain-chocolat.jpg'),
    ('Brioche du jour', 'Selon la fournée', '1,80 €', 'brioche.jpg'),
  ]),
  ('midi', 'Le midi', 'olive', 'Préparé le matin même, à emporter ou à manger sur place.', [
    ('Sandwich du jour', 'Dans notre pain, garni le matin', '5,50 €', 'sandwich.jpg'),
    ('Salade composée', 'Fraîche, prête à emporter', '6,90 €', 'salade.jpg'),
    ('Soupe maison', 'Servie chaude, avec le pain qui va avec', '4,50 €', 'soupe.jpg'),
  ]),
  ('cafe', 'Café & douceurs', 'prune', 'Le comptoir, pour trois minutes ou pour la pause.', [
    ('Café au comptoir', 'Debout, en trois gorgées', '1,50 €', 'cafe.jpg'),
    ('Formule matin', 'Café et une viennoiserie', '2,60 €', 'cafe-formule.jpg'),
    ('Pâtisserie du jour', 'Selon l’inspiration', '3,20 €', 'patisserie.jpg'),
  ]),
]

def bloc_carte(ancre, titre, couleur, intro, articles):
    cartes = '\n      '.join(
        '<article class="produit rev" style="--c:var(--%s)">%s<span class="cat">%s</span><h3>%s</h3><p class="det">%s</p><p class="tarif">%s</p></article>'
        % (couleur, photo(img, 'Photo — ' + nom.lower(), 'ratio-1x1'), titre, nom, det, prix)
        for nom, det, prix, img in articles)
    return '''
<section class="section rayon" id="%s">
  <div class="cadre">
    <div class="chapeau-rayon rev" style="--c:var(--%s)">
      <h2>%s</h2>
      <p>%s</p>
    </div>
    <div class="grille-produits">
      %s
    </div>
  </div>
</section>''' % (ancre, couleur, titre, intro, cartes)

CARTE = '''
<section class="entete-page">
  <div class="taches" aria-hidden="true"><i class="t1"></i><i class="t3"></i></div>
  <div class="cadre">
    <p class="fil"><a href="index.html">Accueil</a> <span>·</span> La carte</p>
    <h1 class="rev">La carte</h1>
    <p class="chapo rev">Prix indicatifs — la vitrine change chaque jour selon les fournées. Comptez 1 à 10 € par personne.</p>
    <nav class="ancres rev" aria-label="Rayons">
      <a href="#pains">Pains</a><a href="#viennoiseries">Viennoiseries</a><a href="#midi">Le midi</a><a href="#cafe">Café &amp; douceurs</a>
    </nav>
  </div>
</section>
''' + ''.join(bloc_carte(*p) for p in PRODUITS) + BANDE_CONTACT

# ---------------------------------------------------------------- MAISON
MAISON = '''
<section class="entete-page">
  <div class="taches" aria-hidden="true"><i class="t2"></i></div>
  <div class="cadre">
    <p class="fil"><a href="index.html">Accueil</a> <span>·</span> La maison</p>
    <h1 class="rev">La maison</h1>
    <p class="chapo rev">Une boulangerie de quartier à Sète, ouverte avant tout le monde.</p>
  </div>
</section>

<section class="section">
  <div class="cadre duo-large">
    <div class="rev">''' + photo('boutique.jpg', 'Photo — la devanture', 'ratio-4x3') + '''</div>
    <div class="texte-long rev">
      <p class="grand">Au Bon Pain, c'est le café pris debout au comptoir avant le travail, la baguette récupérée en rentrant, et la pause du midi entre deux rendez-vous.</p>
      <p>La boutique ouvre ses portes à 06h30, quand la première fournée sort du four. Les pains et les viennoiseries sont cuits sur place et réapprovisionnés tout au long de la matinée : à midi comme à sept heures, on trouve du chaud.</p>
      <p>Le service se fait au comptoir, sans façon : on commande, on est servi, on repart. Pour ceux qui restent, il y a le café et de quoi s'asseoir.</p>
    </div>
  </div>
</section>

<section class="section maison feston">
  <div class="cadre">
    <div class="chapeau rev">
      <p class="sur-titre clair">Ce qu'on y trouve</p>
      <h2>Du petit-déjeuner au déjeuner</h2>
    </div>
    <div class="quatuor">
      <article class="carte-sombre rev" style="--c:var(--terre)"><b>06h30</b><h3>La première fournée</h3><p>Pains et viennoiseries sortent du four à l'ouverture, et toute la matinée ensuite.</p></article>
      <article class="carte-sombre rev" style="--c:var(--miel)"><b>Matin</b><h3>Le café du comptoir</h3><p>Un café serré, une viennoiserie, cinq minutes debout avant d'aller travailler.</p></article>
      <article class="carte-sombre rev" style="--c:var(--olive)"><b>Midi</b><h3>La formule rapide</h3><p>Sandwichs garnis le matin, salades composées et soupes maison, à emporter ou sur place.</p></article>
      <article class="carte-sombre rev" style="--c:var(--prune)"><b>Soir</b><h3>Le pain du retour</h3><p>La baguette ou le pain de campagne récupérés en rentrant chez soi.</p></article>
    </div>
  </div>
</section>

<section class="section">
  <div class="cadre">
    <div class="chapeau rev"><p class="sur-titre">En images</p><h2>La boutique</h2></div>
    <div class="galerie">
      <div class="rev">''' + photo('vitrine.jpg', 'Photo — la vitrine', 'ratio-4x3') + '''</div>
      <div class="rev">''' + photo('fournee.jpg', 'Photo — la fournée', 'ratio-4x3') + '''</div>
      <div class="rev">''' + photo('comptoir.jpg', 'Photo — le comptoir', 'ratio-4x3') + '''</div>
    </div>
  </div>
</section>
''' + BANDE_CONTACT

# ---------------------------------------------------------------- AVIS
AVIS_LISTE = [
  ('Sandrine Preaud', '5', 'il y a 2 mois', 'terre',
   "Sans aucun doute ma boulangerie préférée de Sète. Les viennoiseries sont absolument divines."),
  ('Mattéo Vandenberghe', '5', 'il y a 3 mois', 'olive',
   "Très bonne variété de produits. En séjour avec ma conjointe, nous avons pu profiter chaque jour de cette boulangerie, avec des produits délicieux et changeants."),
  ('Jérémy Vatuone', '5', 'il y a un mois', 'prune',
   "Visité en juillet."),
]

def carte_avis(nom, note, date, couleur, texte):
    etoiles = ''.join('<svg class="ico xs"><use href="#etoile"></use></svg>' for _ in range(int(note)))
    return '''<figure class="avis rev" style="--c:var(--%s)">
        <div class="etoiles" aria-label="%s sur 5">%s</div>
        <blockquote>%s</blockquote>
        <figcaption><span class="jeton-init">%s</span><span><b>%s</b><small>Google · %s</small></span></figcaption>
      </figure>''' % (couleur, note, etoiles, texte, nom[0], nom, date)

AVIS = '''
<section class="entete-page">
  <div class="taches" aria-hidden="true"><i class="t1"></i></div>
  <div class="cadre">
    <p class="fil"><a href="index.html">Accueil</a> <span>·</span> Avis</p>
    <h1 class="rev">Vos avis</h1>
    <p class="chapo rev">Extraits d'avis publiés sur Google. Les avis ne sont pas vérifiés par nos soins.</p>
  </div>
</section>

<section class="section">
  <div class="cadre">
    <div class="note-globale rev">
      <div class="note-chiffre"><b class="nb" data-vers="4.3" data-dec="1">4,3</b><span>sur 5</span></div>
      <div class="note-detail">
        <div class="etoiles grandes" aria-hidden="true">
          <svg class="ico"><use href="#etoile"></use></svg><svg class="ico"><use href="#etoile"></use></svg><svg class="ico"><use href="#etoile"></use></svg><svg class="ico"><use href="#etoile"></use></svg><svg class="ico demi"><use href="#etoile"></use></svg>
        </div>
        <p><b class="nb" data-vers="79">79</b> avis publiés sur Google</p>
      </div>
      <a class="bouton" href="https://www.google.com/maps/search/?api=1&amp;query=Au+Bon+Pain+36+rue+Paul+Bousquet+34200+S%C3%A8te" target="_blank" rel="noopener">Voir sur Google</a>
    </div>

    <div class="trio">
      ''' + '\n      '.join(carte_avis(*a) for a in AVIS_LISTE) + '''
    </div>
  </div>
</section>
''' + BANDE_CONTACT

# ---------------------------------------------------------------- CONTACT
CONTACT = '''
<section class="entete-page">
  <div class="taches" aria-hidden="true"><i class="t2"></i><i class="t3"></i></div>
  <div class="cadre">
    <p class="fil"><a href="index.html">Accueil</a> <span>·</span> Contact</p>
    <h1 class="rev">Nous trouver</h1>
    <p class="chapo rev">36 rue Paul Bousquet, 34200 Sète. Le plus simple reste de passer : on est ouvert dès 06h30.</p>
  </div>
</section>

<section class="section">
  <div class="cadre contact-grille">
    <div class="fiche rev">
      <div class="fiche-ligne" style="--c:var(--terre)">
        <span class="pastille"><svg class="ico"><use href="#epingle"></use></svg></span>
        <div><b>Adresse</b><p>36 rue Paul Bousquet<br>34200 Sète, Hérault</p>
        <a class="lien-fleche" href="https://www.google.com/maps/dir/?api=1&amp;destination=36+rue+Paul+Bousquet+34200+S%C3%A8te" target="_blank" rel="noopener">Lancer l'itinéraire</a></div>
      </div>
      <div class="fiche-ligne" style="--c:var(--miel)">
        <span class="pastille"><svg class="ico"><use href="#tel"></use></svg></span>
        <div><b>Téléphone</b><p><a class="gros-lien" href="tel:+33467535931">04 67 53 59 31</a></p>
        <small>Pour confirmer les horaires ou commander une grande quantité.</small></div>
      </div>
      <div class="fiche-ligne" style="--c:var(--olive)">
        <span class="pastille"><svg class="ico"><use href="#horloge"></use></svg></span>
        <div><b>Horaires</b>
          <p class="minuteur-plat"><span class="braise" aria-hidden="true"></span> Prochaine fournée dans <strong id="compte">06 h 30</strong></p>
          <table class="horaires">
            <tr><th scope="row">Ouverture</th><td>06h30</td></tr>
            <tr><th scope="row">Fermeture</th><td class="a-confirmer">à confirmer par téléphone</td></tr>
          </table>
          <small>Seule l'heure d'ouverture nous est connue à ce jour.</small>
        </div>
      </div>
      <div class="fiche-ligne" style="--c:var(--prune)">
        <span class="pastille"><svg class="ico"><use href="#sac"></use></svg></span>
        <div><b>Service</b><p>Au comptoir — sur place ou à emporter.<br>Budget : 1 à 10 € par personne.</p></div>
      </div>
    </div>

    <div class="plan rev">
      <div class="plan-cadre">
        <div class="plan-secours" aria-hidden="true">
          <span class="plan-quadrillage"></span>
          <span class="plan-point"></span>
          <span class="plan-txt"><b>36 rue Paul Bousquet</b><small>34200 Sète</small></span>
        </div>
        <iframe
          title="Plan — 36 rue Paul Bousquet, 34200 Sète"
          src="https://www.openstreetmap.org/export/embed.html?bbox=3.6885%2C43.3985%2C3.7085%2C43.4105&amp;layer=mapnik&amp;marker=43.4045%2C3.6985"
          loading="lazy" referrerpolicy="no-referrer-when-downgrade"></iframe>
      </div>
      <div class="plan-pied">
        <a class="bouton" href="https://www.google.com/maps/dir/?api=1&amp;destination=36+rue+Paul+Bousquet+34200+S%C3%A8te" target="_blank" rel="noopener">Itinéraire Google Maps</a>
        <a class="bouton clair" href="https://www.openstreetmap.org/?mlat=43.4045&amp;mlon=3.6985#map=17/43.4045/3.6985" target="_blank" rel="noopener">Ouvrir le plan</a>
      </div>
    </div>
  </div>
</section>

<section class="section maison feston">
  <div class="cadre acces-grille">
    <div class="rev">
      <p class="sur-titre clair">Venir</p>
      <h2>Au cœur de Sète</h2>
      <p>La boulangerie se trouve rue Paul Bousquet, dans le centre de Sète. Le quartier est desservi par le réseau de bus urbain, et la gare de Sète est à quelques minutes.</p>
    </div>
    <ul class="acces rev">
      <li><b>À pied</b><span>Depuis le centre-ville et les quais, quelques minutes de marche.</span></li>
      <li><b>En voiture</b><span>Stationnement dans les rues alentour, selon l'affluence.</span></li>
      <li><b>En train</b><span>Gare de Sète, puis bus ou marche jusqu'au quartier.</span></li>
    </ul>
  </div>
</section>
'''

# =====================================================================
CONTENUS = {'index': ACCUEIL, 'carte': CARTE, 'maison': MAISON, 'avis': AVIS, 'contact': CONTACT}

for nom, contenu in CONTENUS.items():
    chemin = os.path.join(RACINE, nom + '.html')
    with open(chemin, 'w') as f:
        f.write(page(nom, contenu))
    print('écrit', chemin)
