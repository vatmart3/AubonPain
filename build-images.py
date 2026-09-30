# -*- coding: utf-8 -*-
"""Génère images.css : pour chaque emplacement, la photographie, l'illustration
de repli et l'aplat teinté du rayon."""
import os, urllib.parse
from build_illustrations import DESSINS

PHOTOS = [
 ('vitrine',       3341067,  'Breads In A Bakery',                              'breads-in-a-bakery-3341067', 'neutre'),
 ('viennoiseries', 19803486, 'Croissant with a Price Tag in a Bakery',           'croissant-with-a-price-tag-in-a-bakery-19803486', 'miel'),
 ('pains',         6605201,  'Sourdough bread with burnt crust on table',        'sourdough-bread-with-burnt-crust-on-table-6605201', 'terre'),
 ('sandwichs',     17498978, 'A Baguette Sandwich on a Plate',                   'a-baguette-sandwich-on-a-plate-17498978', 'olive'),
 ('cafe',          17180513, 'Cup of Coffee and Bagel',                          'cup-of-coffee-and-bagel-17180513', 'prune'),
 ('boutique',      31083446, 'Charming Nevis Bakery in Fort William',            'charming-nevis-bakery-in-fort-william-31083446', 'neutre'),
 ('fournee',       19987146, 'Tray with Croissants for Baking',                  'tray-with-croissants-for-baking-19987146', 'neutre'),
 ('comptoir',      16637678, 'Cookies on Display',                               'cookies-on-display-16637678', 'neutre'),
 ('croissant',     20410181, 'Croissant, Flowers and Bread',                     'croissant-flowers-and-bread-20410181', 'miel'),
 ('pain-chocolat', 7965949,  'Man Basting Croissants before Baking',             'man-basting-croissants-before-baking-7965949', 'miel'),
 ('brioche',       7966375,  'A Pastry Chef Making Croissants',                  'a-pastry-chef-making-croissants-7966375', 'miel'),
 ('baguette',      15301249, 'Close-up of a Loaf of Bread',                      'close-up-of-a-loaf-of-bread-15301249', 'terre'),
 ('campagne',      6605208,  'Slices of bread on cutting board',                 'slices-of-bread-on-cutting-board-6605208', 'terre'),
 ('sandwich',      34593400, 'Delicious Tomato and Lettuce Baguette Sandwich',   'delicious-tomato-and-lettuce-baguette-sandwich-34593400', 'olive'),
 ('salade',        7660426,  'Vegetable Salad in a Bowl',                        'vegetable-salad-in-a-bowl-7660426', 'olive'),
 ('soupe',         19503784, 'Soup and Bread Served in a Restaurant',            'soup-and-bread-served-in-a-restaurant-19503784', 'olive'),
 ('cafe-formule',  6612776,  'A Cup of Coffee and a Toasted Sandwich on a Tray', 'a-cup-of-coffee-and-a-toasted-sandwich-on-a-tray-6612776', 'prune'),
 ('patisserie',    10819659, 'Baked Cookies and Pastry on the Plate',            'baked-cookies-and-pastry-on-the-plate-10819659', 'prune'),
]

TEINTES = {
 'terre':  'linear-gradient(155deg,#FBE6D8,#F1CDB4)',
 'miel':   'linear-gradient(155deg,#FDEFD6,#F7DAA4)',
 'olive':  'linear-gradient(155deg,#F0F4E4,#DCE7C8)',
 'prune':  'linear-gradient(155deg,#F9E8ED,#EDCFD9)',
 'neutre': 'linear-gradient(155deg,#FBEEDC,#F0DCBE)',
}
URL = 'https://images.pexels.com/photos/{id}/pexels-photo-{id}.jpeg?auto=compress&cs=tinysrgb&w=1400'

def data_uri(svg):
    return 'url("data:image/svg+xml,%s")' % urllib.parse.quote(svg, safe="/:=?&;,()'")

def main():
    out = ['''/* =====================================================================
   Photothèque du site — une règle par emplacement
   ---------------------------------------------------------------------
   Chaque emplacement superpose trois couches :
     --img     la photographie (affichée si elle charge)
     --dessin  l'illustration du produit, dessinée en SVG (toujours là)
     --teinte  l'aplat de fond, à la couleur du rayon

   Pour changer une photo, ne modifiez que --img : une autre adresse, ou
   un fichier local (images/nom.jpg). Si --img ne charge pas, le site
   affiche l'illustration : jamais d'image cassée.

   Photographies : Pexels — licence Pexels (usage gratuit, y compris
   commercial, sans attribution obligatoire). Page source en commentaire.
   Pour héberger les images vous-même : ./fetch-photos.sh

   Fichier généré par build-images.py — ne pas modifier à la main si vous
   comptez le regénérer.
   ===================================================================== */
''']
    for cle, pid, titre, slug, fam in PHOTOS:
        out.append('/* %s — https://www.pexels.com/photo/%s/ */' % (titre, slug))
        out.append('[data-photo="%s"]{' % cle)
        out.append('  --img:url("%s");' % URL.format(id=pid))
        out.append('  --dessin:%s;' % data_uri(DESSINS[cle]))
        out.append('  --teinte:%s;' % TEINTES[fam])
        out.append('}\n')

    out.append('''/* ---------------------------------------------------------------------
   Sans photographies — pour n'afficher que les illustrations, activez :
''')
    for cle, pid, titre, slug, fam in PHOTOS:
        out.append('[data-photo="%s"]{ --img:none; }' % cle)
    out.append('--------------------------------------------------------------------- */\n')

    chemin = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'images.css')
    with open(chemin, 'w') as f:
        f.write('\n'.join(out))
    print('écrit', chemin)

if __name__ == '__main__':
    main()
