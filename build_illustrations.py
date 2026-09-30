# -*- coding: utf-8 -*-
"""Illustrations d'aliments, dessinées en SVG. Servent de fond aux cartes
quand la photographie n'est pas disponible."""

# Palette commune
C = {
 'croute_c': '#F5C378', 'croute': '#E3A054', 'croute_f': '#BE7A31', 'trait': '#8E561F',
 'choco': '#4A2A17', 'choco_c': '#6B3D22',
 'mie': '#FBEBCB',
 'vert': '#83B85C', 'vert_f': '#5D8F3C',
 'tomate': '#D6483B', 'tomate_f': '#AE3529',
 'jambon': '#E9A0A0',
 'creme': '#FFF6E6', 'blanc': '#FFFBF4',
 'cafe': '#4B2A17', 'cafe_c': '#6F4426',
 'bois': '#C08A5A', 'bois_f': '#9C6B41',
 'soupe': '#E08A33', 'soupe_f': '#C16E22',
 'sucre': '#F2D9A8',
}

DEGRADES = '''
<defs>
 <linearGradient id="g1" x1="0" y1="0" x2="0" y2="1">
   <stop offset="0" stop-color="{croute_c}"/><stop offset="1" stop-color="{croute_f}"/>
 </linearGradient>
 <linearGradient id="g2" x1="0" y1="0" x2="1" y2="1">
   <stop offset="0" stop-color="{croute_c}"/><stop offset="1" stop-color="{croute}"/>
 </linearGradient>
 <linearGradient id="g3" x1="0" y1="0" x2="0" y2="1">
   <stop offset="0" stop-color="{creme}"/><stop offset="1" stop-color="{sucre}"/>
 </linearGradient>
</defs>'''.format(**C)

def svg(corps, w=200, h=140):
    return ('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 %d %d">%s%s</svg>'
            % (w, h, DEGRADES, corps))

# ---------------------------------------------------------------- CROISSANT
def croissant(x=0, y=0, e=1.0):
    return '''<g transform="translate(%g %g) scale(%g)">
  <path d="M24 112C24 48 60 26 100 26s76 22 76 86c-23-35-46-47-76-47s-53 12-76 47Z" fill="url(#g1)" stroke="{trait}" stroke-width="3" stroke-linejoin="round"/>
  <g stroke="{trait}" stroke-width="2.6" stroke-linecap="round" opacity=".75" fill="none">
    <path d="M52 92c4-12 8-19 13-24"/><path d="M78 74c2-11 3-17 4-22"/>
    <path d="M122 74c-2-11-3-17-4-22"/><path d="M148 92c-4-12-8-19-13-24"/>
  </g>
  <path d="M46 88C56 60 76 44 100 42" fill="none" stroke="{croute_c}" stroke-width="7" stroke-linecap="round" opacity=".55"/>
</g>'''.format(**C) % (x, y, e)

# ---------------------------------------------------------------- BAGUETTE
def baguette(x=0, y=0, e=1.0):
    return '''<g transform="translate(%g %g) scale(%g)">
  <g transform="rotate(-20 100 70)">
    <rect x="16" y="50" width="168" height="40" rx="20" fill="url(#g2)" stroke="{trait}" stroke-width="3"/>
    <g stroke="{trait}" stroke-width="3" stroke-linecap="round" opacity=".8">
      <path d="M50 62 62 78"/><path d="M84 62 96 78"/><path d="M118 62 130 78"/><path d="M152 62 164 78"/>
    </g>
    <path d="M30 60h140" stroke="{croute_c}" stroke-width="6" stroke-linecap="round" opacity=".5" fill="none"/>
  </g>
</g>'''.format(**C) % (x, y, e)

# ---------------------------------------------------------------- CAMPAGNE
def campagne(x=0, y=0, e=1.0):
    return '''<g transform="translate(%g %g) scale(%g)">
  <path d="M28 108a72 56 0 0 1 144 0Z" fill="url(#g1)" stroke="{trait}" stroke-width="3" stroke-linejoin="round"/>
  <path d="M28 108h144" stroke="{trait}" stroke-width="3" stroke-linecap="round"/>
  <g stroke="{trait}" stroke-width="3" stroke-linecap="round" opacity=".75" fill="none">
    <path d="M70 76 130 76"/><path d="M100 60v34"/>
  </g>
  <ellipse cx="78" cy="68" rx="22" ry="9" fill="{croute_c}" opacity=".55"/>
  <g fill="{mie}" opacity=".8"><circle cx="60" cy="92" r="2.6"/><circle cx="140" cy="88" r="2.2"/><circle cx="112" cy="98" r="2"/></g>
</g>'''.format(**C) % (x, y, e)

# ---------------------------------------------------------- PAIN AU CHOCOLAT
def pain_chocolat(x=0, y=0, e=1.0):
    return '''<g transform="translate(%g %g) scale(%g)">
  <rect x="32" y="38" width="136" height="70" rx="20" fill="url(#g1)" stroke="{trait}" stroke-width="3"/>
  <rect x="42" y="46" width="14" height="54" rx="7" fill="{choco}" opacity=".9"/>
  <rect x="144" y="46" width="14" height="54" rx="7" fill="{choco}" opacity=".9"/>
  <g stroke="{trait}" stroke-width="2.6" stroke-linecap="round" opacity=".6" fill="none">
    <path d="M70 44v58"/><path d="M100 42v64"/><path d="M130 44v58"/>
  </g>
  <path d="M44 48h112" stroke="{croute_c}" stroke-width="6" stroke-linecap="round" opacity=".5" fill="none"/>
</g>'''.format(**C) % (x, y, e)

# ---------------------------------------------------------------- BRIOCHE
def brioche(x=0, y=0, e=1.0):
    return '''<g transform="translate(%g %g) scale(%g)">
  <ellipse cx="100" cy="92" rx="64" ry="34" fill="url(#g1)" stroke="{trait}" stroke-width="3"/>
  <ellipse cx="100" cy="54" rx="30" ry="24" fill="url(#g2)" stroke="{trait}" stroke-width="3"/>
  <g stroke="{trait}" stroke-width="2.4" stroke-linecap="round" opacity=".6" fill="none">
    <path d="M52 86c6 8 14 12 22 13"/><path d="M148 86c-6 8-14 12-22 13"/><path d="M100 104v18"/>
  </g>
  <ellipse cx="88" cy="46" rx="12" ry="7" fill="{croute_c}" opacity=".6"/>
</g>'''.format(**C) % (x, y, e)

# ---------------------------------------------------------------- SANDWICH
def sandwich(x=0, y=0, e=1.0):
    return '''<g transform="translate(%g %g) scale(%g)">
  <path d="M24 92h152a18 18 0 0 1 0 28H24a18 18 0 0 1 0-28Z" fill="url(#g1)" stroke="{trait}" stroke-width="3"/>
  <path d="M26 86c14-8 34-12 74-12s60 4 74 12c-10 6-40 9-74 9s-64-3-74-9Z" fill="{vert}" stroke="{vert_f}" stroke-width="2.6" stroke-linejoin="round"/>
  <g fill="{tomate}" stroke="{tomate_f}" stroke-width="2.4">
    <circle cx="66" cy="80" r="12"/><circle cx="118" cy="80" r="12"/>
  </g>
  <path d="M30 74c16-6 34-9 70-9s54 3 70 9" fill="none" stroke="{jambon}" stroke-width="9" stroke-linecap="round"/>
  <path d="M24 40h152a20 20 0 0 1 0 34H24a20 20 0 0 1 0-34Z" fill="url(#g2)" stroke="{trait}" stroke-width="3"/>
  <g stroke="{trait}" stroke-width="2.6" stroke-linecap="round" opacity=".7">
    <path d="M58 48 66 60"/><path d="M96 48l8 12"/><path d="M134 48l8 12"/>
  </g>
</g>'''.format(**C) % (x, y, e)

# ---------------------------------------------------------------- SALADE
def salade(x=0, y=0, e=1.0):
    return '''<g transform="translate(%g %g) scale(%g)">
  <g fill="{vert}" stroke="{vert_f}" stroke-width="2.6">
    <ellipse cx="70" cy="60" rx="30" ry="22"/><ellipse cx="130" cy="58" rx="28" ry="20"/><ellipse cx="100" cy="46" rx="26" ry="18"/>
  </g>
  <g fill="{tomate}" stroke="{tomate_f}" stroke-width="2.4">
    <circle cx="78" cy="72" r="11"/><circle cx="126" cy="74" r="9"/>
  </g>
  <circle cx="103" cy="66" r="9" fill="{creme}" stroke="{vert_f}" stroke-width="2.2"/>
  <path d="M28 78h144a72 42 0 0 1-144 0Z" fill="{blanc}" stroke="{trait}" stroke-width="3" stroke-linejoin="round"/>
  <path d="M44 86a58 30 0 0 0 112 0" fill="none" stroke="{croute_f}" stroke-width="3" opacity=".35"/>
</g>'''.format(**C) % (x, y, e)

# ---------------------------------------------------------------- SOUPE
def soupe(x=0, y=0, e=1.0):
    return '''<g transform="translate(%g %g) scale(%g)">
  <g stroke="{soupe_f}" stroke-width="5" stroke-linecap="round" fill="none" opacity=".55">
    <path d="M78 42c-8-8-8-16 0-24"/><path d="M100 36c-8-8-8-16 0-24"/><path d="M122 42c-8-8-8-16 0-24"/>
  </g>
  <ellipse cx="100" cy="72" rx="74" ry="16" fill="{soupe}" stroke="{soupe_f}" stroke-width="3"/>
  <path d="M26 72h148a74 46 0 0 1-148 0Z" fill="{blanc}" stroke="{trait}" stroke-width="3" stroke-linejoin="round"/>
  <ellipse cx="78" cy="70" rx="14" ry="5" fill="{croute_c}" opacity=".7"/>
</g>'''.format(**C) % (x, y, e)

# ---------------------------------------------------------------- CAFÉ
def cafe(x=0, y=0, e=1.0):
    return '''<g transform="translate(%g %g) scale(%g)">
  <g stroke="{cafe_c}" stroke-width="5" stroke-linecap="round" fill="none" opacity=".45">
    <path d="M84 34c-8-8-8-16 0-24"/><path d="M116 34c-8-8-8-16 0-24"/>
  </g>
  <path d="M46 46h92v32a46 46 0 0 1-92 0Z" fill="{blanc}" stroke="{trait}" stroke-width="3" stroke-linejoin="round"/>
  <ellipse cx="92" cy="46" rx="46" ry="12" fill="{cafe}" stroke="{trait}" stroke-width="3"/>
  <path d="M138 54h12a17 17 0 0 1 0 34h-12" fill="none" stroke="{trait}" stroke-width="3" stroke-linecap="round"/>
  <ellipse cx="92" cy="118" rx="66" ry="12" fill="{blanc}" stroke="{trait}" stroke-width="3"/>
  <ellipse cx="76" cy="44" rx="14" ry="4" fill="{cafe_c}" opacity=".8"/>
</g>'''.format(**C) % (x, y, e)

# ---------------------------------------------------------------- PÂTISSERIE
def patisserie(x=0, y=0, e=1.0):
    return '''<g transform="translate(%g %g) scale(%g)">
  <rect x="26" y="58" width="148" height="46" rx="23" fill="url(#g3)" stroke="{trait}" stroke-width="3"/>
  <path d="M38 62h124a16 16 0 0 1 0 22H38a16 16 0 0 1 0-22Z" fill="{choco}"/>
  <path d="M52 68c26-5 70-5 96 0" fill="none" stroke="{choco_c}" stroke-width="5" stroke-linecap="round" opacity=".8"/>
  <g fill="{creme}"><circle cx="70" cy="76" r="3"/><circle cx="104" cy="72" r="3"/><circle cx="138" cy="77" r="3"/></g>
  <path d="M36 96c30 6 98 6 128 0" fill="none" stroke="{croute_f}" stroke-width="3" opacity=".4"/>
</g>'''.format(**C) % (x, y, e)

# ---------------------------------------------------------------- BOUTIQUE
def boutique(x=0, y=0, e=1.0):
    corps = '''
  <rect x="22" y="40" width="156" height="86" rx="6" fill="{creme}" stroke="{trait}" stroke-width="3"/>
  <rect x="30" y="16" width="140" height="24" rx="6" fill="{croute_f}" stroke="{trait}" stroke-width="3"/>
  <path d="M30 40h140l-8 16H38Z" fill="{tomate}"/>
  <g fill="{creme}" opacity=".85"><path d="M52 40h20l-6 16H46Z"/><path d="M92 40h20l-6 16H86Z"/><path d="M132 40h20l-6 16h-20Z"/></g>
  <rect x="38" y="66" width="56" height="42" rx="4" fill="{blanc}" stroke="{trait}" stroke-width="3"/>
  <rect x="112" y="66" width="50" height="60" rx="4" fill="{croute}" stroke="{trait}" stroke-width="3"/>
  <circle cx="122" cy="98" r="3" fill="{trait}"/>
  <path d="M12 126h176" stroke="{trait}" stroke-width="4" stroke-linecap="round"/>
'''.format(**C)
    return ('<g transform="translate(%g %g) scale(%g)">' % (x, y, e) + corps
            + '<g transform="translate(30 58) scale(.3)">' + croissant() + '</g></g>')

# ---------------------------------------------------------------- FOURNÉE
def fournee(x=0, y=0, e=1.0):
    return ('<g transform="translate(%g %g) scale(%g)">' % (x, y, e)
      + '<g transform="translate(4 44) scale(.36)">' + croissant() + '</g>'
      + '<g transform="translate(68 45) scale(.36)">' + pain_chocolat() + '</g>'
      + '<g transform="translate(124 45) scale(.36)">' + campagne() + '</g>'
      + '<rect x="6" y="80" width="188" height="13" rx="6" fill="{bois}" stroke="{bois_f}" stroke-width="3"/>'.format(**C)
      + '<path d="M16 93h168l-9 19H25Z" fill="{bois_f}" stroke="{bois_f}" stroke-width="3" stroke-linejoin="round"/>'.format(**C)
      + '</g>')

# ---------------------------------------------------------------- VITRINE
def vitrine(x=0, y=0, e=1.0):
    return ('<g transform="translate(%g %g) scale(%g)">' % (x, y, e)
      + '<rect x="18" y="26" width="164" height="94" rx="8" fill="{blanc}" stroke="{trait}" stroke-width="3"/>'.format(**C)
      + '<path d="M18 72h164" stroke="{trait}" stroke-width="3"/>'.format(**C)
      + '<g transform="translate(-4 14) scale(.34)">' + croissant() + '</g>'
      + '<g transform="translate(58 10) scale(.34)">' + pain_chocolat() + '</g>'
      + '<g transform="translate(118 12) scale(.34)">' + brioche() + '</g>'
      + '<g transform="translate(6 62) scale(.34)">' + baguette() + '</g>'
      + '<g transform="translate(96 60) scale(.34)">' + campagne() + '</g>'
      + '<path d="M12 120h176" stroke="{trait}" stroke-width="4" stroke-linecap="round"/>'.format(**C)
      + '</g>')

def comptoir(x=0, y=0, e=1.0):
    corps = '''
  <rect x="20" y="70" width="160" height="52" rx="5" fill="{croute}" stroke="{trait}" stroke-width="3"/>
  <rect x="12" y="58" width="176" height="14" rx="7" fill="{creme}" stroke="{trait}" stroke-width="3"/>
  <g stroke="{trait}" stroke-width="2.6" opacity=".6"><path d="M73 74v44"/><path d="M127 74v44"/></g>
'''.format(**C)
    return ('<g transform="translate(%g %g) scale(%g)">' % (x, y, e) + corps
      + '<g transform="translate(14 -4) scale(.3)">' + croissant() + '</g>'
      + '<g transform="translate(112 -10) scale(.32)">' + cafe() + '</g>'
      + '</g>')

# ---------------------------------------------------------------- GROUPES
def pains_groupe():
    return ('<g transform="translate(8 46) scale(.5)">' + campagne() + '</g>'
          + '<g transform="translate(98 40) scale(.5)">' + baguette() + '</g>')

def viennoiseries_groupe():
    return ('<g transform="translate(2 16) scale(.55)">' + croissant() + '</g>'
          + '<g transform="translate(100 56) scale(.5)">' + pain_chocolat() + '</g>')

def cafe_formule():
    return ('<g transform="translate(-14 22) scale(.55)">' + cafe() + '</g>'
          + '<g transform="translate(92 26) scale(.48)">' + croissant() + '</g>')

DESSINS = {
  'croissant':     svg(croissant()),
  'baguette':      svg(baguette()),
  'campagne':      svg(campagne()),
  'pain-chocolat': svg(pain_chocolat()),
  'brioche':       svg(brioche()),
  'sandwich':      svg(sandwich()),
  'sandwichs':     svg(sandwich()),
  'salade':        svg(salade()),
  'soupe':         svg(soupe()),
  'cafe':          svg(cafe()),
  'patisserie':    svg(patisserie()),
  'boutique':      svg(boutique()),
  'comptoir':      svg(comptoir()),
  'vitrine':       svg(vitrine()),
  'fournee':       svg(fournee()),
  'pains':         svg(pains_groupe()),
  'viennoiseries': svg(viennoiseries_groupe()),
  'cafe-formule':  svg(cafe_formule()),
}
