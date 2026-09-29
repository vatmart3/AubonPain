import { boutique } from '@/content/boutique';
import { urlSite } from '@/lib/site';

const jours = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export function jsonLdBoulangerie() {
  const horaires = Object.entries(boutique.horaires).flatMap(([j, plages]) =>
    plages.map(([opens, closes]) => ({
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: `https://schema.org/${jours[Number(j)]}`,
      opens,
      closes,
    })),
  );
  return {
    '@context': 'https://schema.org',
    '@type': 'Bakery',
    '@id': `${urlSite}/#boulangerie`,
    name: boutique.nom,
    description: 'Boulangerie-pâtisserie de quartier à Sète, rue Paul Bousquet : pains, viennoiseries, pâtisseries, sandwichs, plaques de pizza et de tartes. Commande en ligne, retrait en boutique.',
    url: urlSite,
    image: `${urlSite}/opengraph-image`,
    telephone: boutique.telephone.lien,
    address: {
      '@type': 'PostalAddress',
      streetAddress: boutique.adresse.rue,
      postalCode: boutique.adresse.codePostal,
      addressLocality: boutique.adresse.ville,
      addressRegion: 'Occitanie',
      addressCountry: boutique.adresse.pays,
    },
    geo: { '@type': 'GeoCoordinates', latitude: boutique.geo.lat, longitude: boutique.geo.lng },
    hasMap: boutique.liens.ficheGoogle,
    openingHoursSpecification: horaires,
    priceRange: '€',
    paymentAccepted: 'Carte bancaire, Sans contact, Espèces, Titres-restaurant Pluxee',
    currenciesAccepted: 'EUR',
    servesCuisine: ['Boulangerie', 'Pâtisserie', 'Viennoiserie'],
    // [À VALIDER] ajouter l'URL de la fiche Google Business Profile.
    sameAs: [] as string[],
    potentialAction: {
      '@type': 'OrderAction',
      target: `${urlSite}/commander`,
      deliveryMethod: 'http://purl.org/goodrelations/v1#DeliveryModePickUp',
    },
  };
}
