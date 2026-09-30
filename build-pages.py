# -*- coding: utf-8 -*-
"""Génère les pages du site : coquille commune + contenu par page."""
import os

RACINE = os.path.dirname(os.path.abspath(__file__))

NAV = [('index', 'Accueil'), ('collection', 'La collection'),
       ('reservation', 'Réservation'), ('fournil', 'Le fournil'), ('contact', 'Contact')]

TITRES = {
 'index':       ('Au Bon Pain — Boulangerie artisanale à Sète',
                 "Boulangerie artisanale à Sète. Pains, viennoiseries, sandwichs, salades et soupes. Le four ouvre à 06:30."),
 'collection':  ('La collection — Au Bon Pain, Sète',
                 "Les pièces du four : croissants, pains au chocolat, mille-feuilles, baguettes tradition et pains de campagne."),
 'reservation': ('Réservation — Au Bon Pain, Sète',
                 "Pré-commande à emporter, retrait à la boulangerie. 36 rue Paul Bousquet, 34200 Sète."),
 'fournil':     ('Le fournil — Au Bon Pain, Sète',
                 "Le feu, la nuit. Le fournil d'Au Bon Pain à Sète, et la première fournée de 06:30."),
 'contact':     ('Contact — Au Bon Pain, Sète',
                 "36 rue Paul Bousquet, 34200 Sète. 04 67 53 59 31. Horaires et plan d'accès."),
}

SPRITE = '''<svg class="sprite" aria-hidden="true">
  <symbol id="epingle" viewBox="0 0 24 24"><path d="M12 21s7-6.3 7-10.5a7 7 0 1 0-14 0C5 14.7 12 21 12 21Z"/><circle cx="12" cy="10.5" r="2.6"/></symbol>
  <symbol id="tel" viewBox="0 0 24 24"><path d="M8 3 6 4c-1.5.5-2.2 2-1.8 3.5A21 21 0 0 0 16.5 19.8c1.5.4 3-.3 3.5-1.8l1-2-4-2-1.8 2a15.7 15.7 0 0 1-6.2-6.2L11 8Z"/></symbol>
  <symbol id="horloge" viewBox="0 0 24 24"><circle cx="12" cy="12" r="8.6"/><path d="M12 7v5.4l3.6 1.9"/></symbol>
  <symbol id="feu" viewBox="0 0 24 24"><path d="M12 21c3.6 0 6-2.4 6-5.6 0-4-3.4-5.6-3.4-9.4-2.2 1-3 3-3 4.6 0 1.4-1 2-1.8 1.2-.7-.7-.8-1.8-.8-2.4C7.2 11 6 12.8 6 15.4 6 18.6 8.4 21 12 21Z"/></symbol>
  <symbol id="ble" viewBox="0 0 24 24"><path d="M12 22V9"/><path d="M12 9c-3-.6-4.5-2.8-4.5-5.6C10.5 3.4 12 5.6 12 9Zm0 0c3-.6 4.5-2.8 4.5-5.6C13.5 3.4 12 5.6 12 9Z"/><path d="M12 15.5c-3-.6-4.5-2.8-4.5-5.6 3 0 4.5 2.2 4.5 5.6Zm0 0c3-.6 4.5-2.8 4.5-5.6-3 0-4.5 2.2-4.5 5.6Z"/></symbol>
</svg>'''

def entete(page):
    liens = '\n      '.join('<a href="%s.html"%s>%s</a>' % (p, ' class="actif"' if p == page else '', lib)
                            for p, lib in NAV)
    return '''<header class="entete">
  <div class="cadre entete-in">
    <a class="logo" href="index.html"><b>Au Bon Pain</b><small>Sète · Boulangerie</small></a>
    <nav class="nav" id="nav" aria-label="Navigation principale">
      %s
    </nav>
    <button class="burger" id="burger" aria-expanded="false" aria-controls="nav" aria-label="Ouvrir le menu"><span></span><span></span></button>
  </div>
</header>''' % liens

PIED = '''<footer class="pied">
  <div class="cadre pied-in">
    <a class="logo" href="index.html"><b>Au Bon Pain</b><small>36 rue Paul Bousquet · 34200 Sète</small></a>
    <nav class="pied-nav" aria-label="Pied de page">
      <a href="collection.html">La collection</a><a href="reservation.html">Réservation</a>
      <a href="fournil.html">Le fournil</a><a href="contact.html">Contact</a>
      <a href="tel:+33467535931">04 67 53 59 31</a>
    </nav>
    <small>© <span id="annee">2026</span> Au Bon Pain</small>
  </div>
</footer>
<div class="anneau" id="anneau" aria-hidden="true"></div>'''

JSONLD = '''<script type="application/ld+json">
{
  "@context":"https://schema.org","@type":"Bakery","name":"Au Bon Pain",
  "description":"Café avec service au comptoir proposant des soupes, salades, sandwichs, pains et viennoiseries.",
  "address":{"@type":"PostalAddress","streetAddress":"36 rue Paul Bousquet","postalCode":"34200","addressLocality":"S\\u00e8te","addressCountry":"FR"},
  "telephone":"+33467535931","priceRange":"1\\u201310 \\u20ac",
  "openingHoursSpecification":[
    {"@type":"OpeningHoursSpecification","dayOfWeek":["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"],"opens":"06:30","closes":"19:30"},
    {"@type":"OpeningHoursSpecification","dayOfWeek":"Sunday","opens":"07:00","closes":"13:00"}],
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
<meta name="theme-color" content="#0A0908">
<meta property="og:title" content="%s">
<meta property="og:description" content="%s">
<meta property="og:type" content="website">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,500;0,600;1,400;1,500&family=JetBrains+Mono:wght@200;300;400&display=swap" rel="stylesheet">
<link rel="icon" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'><rect width='32' height='32' fill='%%230A0908'/><text x='16' y='23' font-family='Georgia,serif' font-size='19' text-anchor='middle' fill='%%23C08A5A'>A</text></svg>">
<link rel="stylesheet" href="styles.css">
<link rel="stylesheet" href="images.css">
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
#  Produits
# =====================================================================
PIECES = [
 ('croissant',     'Croissant',          'Beurre Charentes-Poitou',   '1,30 €'),
 ('pain-chocolat', 'Pain au Chocolat',   'Chocolat noir',             '1,50 €'),
 ('patisserie',    'Mille-Feuille',      'Crème pâtissière vanille',  '4,20 €'),
 ('baguette',      'Baguette Tradition', 'Levain naturel',            '1,20 €'),
 ('campagne',      'Pain de Campagne',   'Farine de meule',           '2,20 €'),
 ('brioche',       'Brioche',            'Mie filante',               '1,80 €'),
 ('sandwich',      'Sandwich du Jour',   'Dans notre pain',           '5,50 €'),
 ('salade',        'Salade Composée',    'Légumes de saison',         '6,90 €'),
 ('soupe',         'Soupe Maison',       'Velouté du jour',           '4,50 €'),
 ('cafe',          'Café',               'Service au comptoir',       '1,50 €'),
 ('pains',         'Pains Spéciaux',     'Céréales · complet',        '2,40 €'),
 ('cafe-formule',  'Formule Matin',      'Café et viennoiserie',      '2,60 €'),
]

def piece(cle, nom, sous, prix):
    return '''<a class="piece rev" href="reservation.html" data-photo="%s">
        <span class="piece-img" data-photo="%s"></span>
        <p class="lib">%s</p>
        <h3>%s</h3>
        <p class="prix num">%s</p>
      </a>''' % (cle, cle, sous, nom, prix)

HORAIRES = [('Lundi','06:30 – 19:30'),('Mardi','06:30 – 19:30'),('Mercredi','06:30 – 19:30'),
            ('Jeudi','06:30 – 19:30'),('Vendredi','06:30 – 19:30'),('Samedi','06:30 – 19:30'),
            ('Dimanche','07:00 – 13:00')]

def table_horaires():
    return ('<table class="horaires"><tbody>' +
            ''.join('<tr data-jour="%d"><td>%s</td><td class="num">%s</td></tr>' % ((i + 1) % 7, j, h)
                    for i, (j, h) in enumerate(HORAIRES)) +
            '</tbody></table>')

# =====================================================================
#  Contenu des pages
# =====================================================================
BLOC_FOUR = '''<aside class="four" aria-label="Le four en direct">
      <div class="four-tete"><i></i><p class="lib or">Four en direct</p></div>
      <p class="four-heure num" id="pendule">06:30:00</p>
      <div class="four-bloc">
        <p class="lib">Sortie du four</p>
        <p class="four-passe num" id="sortie">—</p>
      </div>
      <div class="four-bloc">
        <p class="lib">Prochaine fournée</p>
        <p class="four-suivant" id="fournee-nom">Croissants</p>
        <p class="four-h num" id="fournee-heure">06:30</p>
      </div>
    </aside>'''

ACCUEIL = '''
<section class="hero">
  <div class="hero-fond" data-photo="vitrine" aria-hidden="true"></div>
  <div class="hero-in">
    <p class="lib rev">Boulangerie artisanale · Sète depuis toujours</p>
    <h1 class="rev">Au Bon<em>Pain</em></h1>
    <p class="hero-txt rev">
      Chaîne de cafés avec service au comptoir proposant des soupes, salades,
      sandwichs, pains et viennoiseries. Le four ouvre à 06:30.
    </p>
    <div class="hero-actions rev">
      <a class="btn btn-plein" href="reservation.html">Réserver une table <span class="fl">→</span></a>
      <a class="btn btn-ligne" href="collection.html">La collection</a>
    </div>
  </div>
  <p class="defilez"><i></i> Défilez · le four chauffe</p>
  ''' + BLOC_FOUR + '''
</section>

<section class="section">
  <div class="cadre">
    <div class="section-tete rev">
      <div>
        <p class="lib or numero-sec">01 / Collection</p>
        <h2>Les pièces<br>du four</h2>
      </div>
      <a class="btn btn-ligne" href="collection.html">Voir toute la collection <span class="fl">→</span></a>
    </div>
  </div>
  <div class="cadre">
    <div class="collection">
      ''' + '\n      '.join(piece(*p) for p in PIECES[:4]) + '''
    </div>
  </div>
</section>

<section class="section">
  <div class="cadre">
    <div class="plaque rev" data-photo="fournee">
      <div class="plaque-txt">
        <p class="lib or">Fournil</p>
        <h2>Le feu, la nuit</h2>
        <a class="btn btn-ligne" href="fournil.html" style="margin-top:1.6rem">Entrer dans le fournil <span class="fl">→</span></a>
      </div>
    </div>
  </div>
</section>

<section class="section">
  <div class="cadre duo">
    <div class="rev">
      <p class="lib or numero-sec">02 / La maison</p>
      <h2 style="margin-top:1.4rem">Ouverte avant<br>tout le monde</h2>
    </div>
    <div class="texte rev">
      <p class="intro">Le café pris debout au comptoir avant le travail, la baguette récupérée en rentrant, la pause du midi entre deux rendez-vous.</p>
      <p>Tout est cuit et préparé sur place, servi au comptoir, sur place ou à emporter. La première fournée sort à 06:30 ; les suivantes s'enchaînent toute la matinée.</p>
      <div class="infos" style="margin-top:2.4rem">
        <div class="info">
          <svg class="ico lg"><use href="#horloge"></use></svg>
          <p class="lib">Horaires</p>
          <p class="num">Lundi – Samedi · 06:30 – 19:30</p>
          <p class="num">Dimanche · 07:00 – 13:00</p>
        </div>
        <div class="info">
          <svg class="ico lg"><use href="#epingle"></use></svg>
          <p class="lib">Adresse</p>
          <p>36 rue Paul Bousquet<br>34200 Sète</p>
        </div>
      </div>
    </div>
  </div>
</section>
'''

COLLECTION = '''
<section class="section" style="padding-top:11rem">
  <div class="cadre">
    <div class="section-tete rev">
      <div>
        <p class="lib or numero-sec">01 / Collection</p>
        <h2>Les pièces<br>du four</h2>
      </div>
      <a class="btn btn-plein" href="reservation.html">Pré-commander <span class="fl">→</span></a>
    </div>
    <p class="lib" style="margin-bottom:3rem">Prix indicatifs · la vitrine change chaque jour selon les fournées</p>
  </div>
  <div class="cadre">
    <div class="collection">
      ''' + '\n      '.join(piece(*p) for p in PIECES) + '''
    </div>
  </div>
</section>
'''

RESERVATION = '''
<section class="section" style="padding-top:11rem">
  <div class="cadre">
    <div class="section-tete rev">
      <div>
        <p class="lib or numero-sec">02 / Réservation</p>
        <h2>Pré-commande</h2>
      </div>
    </div>

    <div class="reserve">
      <form class="rev" id="form-reservation" novalidate>
        <div class="encart">
          <b>Pré-commande</b>
          <span>À emporter · Retrait à la boulangerie</span>
        </div>

        <div class="champ">
          <label for="nom">Nom complet *</label>
          <input id="nom" name="nom" type="text" placeholder="Jean Dupont" required autocomplete="name">
        </div>

        <div class="duo-champ">
          <div class="champ">
            <label for="tel">Téléphone *</label>
            <input id="tel" name="tel" type="tel" placeholder="06 12 34 56 78" required autocomplete="tel">
          </div>
          <div class="champ">
            <label for="email">Email</label>
            <input id="email" name="email" type="email" placeholder="jean@email.fr" autocomplete="email">
          </div>
        </div>

        <div class="duo-champ">
          <div class="champ">
            <label for="date">Date *</label>
            <input id="date" name="date" type="date" required>
          </div>
          <div class="champ">
            <label for="panier">Panier</label>
            <input id="panier" name="panier" type="number" min="1" max="50" value="1">
          </div>
        </div>

        <div class="champ">
          <label id="lib-heure">Heure *</label>
          <div class="heures" id="heures" role="group" aria-labelledby="lib-heure"></div>
        </div>

        <div class="champ">
          <label for="details">Détails de la commande</label>
          <textarea id="details" name="details" rows="2" placeholder="4 croissants, 2 pains au chocolat, 1 baguette…"></textarea>
        </div>

        <div class="champ">
          <label for="notes">Notes</label>
          <textarea id="notes" name="notes" rows="2" placeholder="Allergies, préférences…"></textarea>
        </div>

        <button class="btn btn-plein" type="submit">Confirmer la réservation <span class="fl">→</span></button>
        <p class="erreur" id="erreur" role="alert"></p>

        <div class="recap" id="recap" role="status">
          <b>Votre pré-commande</b>
          <dl id="recap-liste"></dl>
          <a class="btn btn-ligne" id="lien-mail" href="#">Envoyer par email <span class="fl">→</span></a>
        </div>
      </form>

      <div class="rev">
        <div class="plaque" data-photo="fournee" style="min-height:clamp(320px,38vw,460px)">
          <div class="plaque-txt">
            <p class="lib or">Fournil</p>
            <h2 style="font-size:clamp(1.6rem,3vw,2.4rem)">Le feu, la nuit</h2>
          </div>
        </div>

        <div class="infos" style="margin-top:2.4rem">
          <div class="info">
            <svg class="ico lg"><use href="#horloge"></use></svg>
            <p class="lib">Horaires</p>
            <p class="num">Lundi – Samedi · 06:30 – 19:30</p>
            <p class="num">Dimanche · 07:00 – 13:00</p>
          </div>
          <div class="info">
            <svg class="ico lg"><use href="#epingle"></use></svg>
            <p class="lib">Adresse</p>
            <p>36 rue Paul Bousquet<br>34200 Sète</p>
          </div>
          <div class="info">
            <svg class="ico lg"><use href="#tel"></use></svg>
            <p class="lib">Téléphone</p>
            <p class="num"><a href="tel:+33467535931" style="text-decoration:none">04 67 53 59 31</a></p>
          </div>
        </div>
      </div>
    </div>
  </div>
</section>
'''

FOURNIL = '''
<section class="section" style="padding-top:11rem;padding-bottom:0">
  <div class="cadre">
    <p class="lib or numero-sec rev">03 / Fournil</p>
    <h1 class="rev" style="font-size:clamp(2.6rem,7vw,5.5rem);margin-top:1.4rem">Le feu,<em style="display:block;font-style:italic;color:var(--or-clair)">la nuit</em></h1>
  </div>
</section>

<section class="section">
  <div class="cadre">
    <div class="plaque rev" data-photo="fournee"></div>
  </div>
</section>

<section class="section" style="padding-top:0">
  <div class="cadre duo">
    <div class="texte rev">
      <p class="intro">Quand la ville dort, le four monte en température. C'est là que tout se joue.</p>
      <p>La pâte est façonnée avant le jour, les pièces sont enfournées les unes après les autres, et la première fournée sort à 06:30 — à l'heure où la boutique ouvre ses portes.</p>
      <p>Ensuite, les fournées s'enchaînent toute la matinée : il y a du chaud à sept heures comme à midi. Les sandwichs sont garnis le matin même, les soupes et les salades préparées sur place.</p>
    </div>
    <div class="infos rev">
      <div class="info">
        <svg class="ico lg"><use href="#feu"></use></svg>
        <p class="lib">Le four</p>
        <p>Chauffé la nuit, en service toute la journée.</p>
      </div>
      <div class="info">
        <svg class="ico lg"><use href="#ble"></use></svg>
        <p class="lib">Les pains</p>
        <p>Baguettes tradition au levain naturel, pains de campagne à la farine de meule, pains spéciaux selon la fournée.</p>
      </div>
      <div class="info">
        <svg class="ico lg"><use href="#horloge"></use></svg>
        <p class="lib">Première fournée</p>
        <p class="num">06:30</p>
      </div>
    </div>
  </div>
</section>

<section class="section" style="padding-top:0">
  <div class="cadre">
    <div class="collection">
      ''' + '\n      '.join(piece(*p) for p in PIECES[:4]) + '''
    </div>
  </div>
</section>
'''

CONTACT = '''
<section class="section" style="padding-top:11rem;padding-bottom:3rem">
  <div class="cadre">
    <p class="lib or numero-sec rev">04 / Contact</p>
    <h2 class="rev" style="margin-top:1.4rem">Nous trouver</h2>
  </div>
</section>

<section class="section" style="padding-top:0">
  <div class="cadre">
    <div class="fiche-contact rev">
      <div class="fiche-bloc">
        <svg class="ico lg"><use href="#epingle"></use></svg>
        <p class="lib">Adresse</p>
        <p class="gros">36 Rue Paul Bousquet</p>
        <p class="sous">34200 Sète · France</p>
        <a class="lien-or" href="https://www.google.com/maps/dir/?api=1&amp;destination=36+rue+Paul+Bousquet+34200+S%C3%A8te" target="_blank" rel="noopener">↗ Itinéraire</a>
      </div>
      <div class="fiche-bloc">
        <svg class="ico lg"><use href="#tel"></use></svg>
        <p class="lib">Téléphone</p>
        <p class="gros num"><a href="tel:+33467535931" style="text-decoration:none">04 67 53 59 31</a></p>
        <p class="sous">Appel direct</p>
      </div>
      <div class="fiche-bloc">
        <svg class="ico lg"><use href="#horloge"></use></svg>
        <p class="lib">Horaires</p>
        ''' + table_horaires() + '''
      </div>
    </div>
  </div>
</section>

<section class="section" style="padding-top:0">
  <div class="cadre">
    <div class="plan rev">
      <div class="plan-secours"></div>
      <div class="plan-etiq"><b>Au Bon Pain</b><span>36 Rue Paul Bousquet<br>34200 Sète</span></div>
      <iframe title="Plan — 36 rue Paul Bousquet, 34200 Sète"
        src="https://www.openstreetmap.org/export/embed.html?bbox=3.6845%2C43.3955%2C3.7185%2C43.4135&amp;layer=mapnik&amp;marker=43.4045%2C3.6985"
        loading="lazy" referrerpolicy="no-referrer-when-downgrade"></iframe>
    </div>
  </div>
</section>

<section class="section" style="padding-top:0">
  <div class="cadre duo">
    <div class="rev">
      <p class="lib or numero-sec">Venir</p>
      <h2 style="margin-top:1.4rem;font-size:clamp(1.8rem,3.4vw,2.8rem)">Au cœur de Sète</h2>
    </div>
    <div class="texte rev">
      <p>La boulangerie se trouve rue Paul Bousquet, dans le centre de Sète, à quelques minutes des quais et du port de plaisance.</p>
      <p>Service au comptoir, sur place ou à emporter. Comptez 1 à 10 € par personne.</p>
      <a class="btn btn-plein" href="reservation.html" style="margin-top:1rem">Pré-commander <span class="fl">→</span></a>
    </div>
  </div>
</section>
'''

CONTENUS = {'index': ACCUEIL, 'collection': COLLECTION, 'reservation': RESERVATION,
            'fournil': FOURNIL, 'contact': CONTACT}

if __name__ == '__main__':
    for nom, contenu in CONTENUS.items():
        chemin = os.path.join(RACINE, nom + '.html')
        with open(chemin, 'w') as f:
            f.write(page(nom, contenu))
        print('écrit', chemin)
