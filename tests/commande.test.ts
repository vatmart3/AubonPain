import { describe, expect, it } from 'vitest';
import {
  creneauxDuJour,
  joursCalendrier,
  messageWhatsApp,
  numeroCommande,
  premierJourCommandable,
  prixLisible,
  telephoneFR,
  totalCentimes,
  validerCommande,
} from '@/lib/commande';
import { produitParId } from '@/content/produits';
import { aSete, statutBoutique, statutCourt, type Instant } from '@/lib/temps';

// Mardi 29 septembre 2026, 10h00 à Sète.
const mardi10h: Instant = { iso: '2026-09-29', jour: 2, minutes: 600 };
const mardi19h: Instant = { iso: '2026-09-29', jour: 2, minutes: 19 * 60 };

const base = {
  lignes: [
    { id: 'baguette', qte: 2 },
    { id: 'croissant', qte: 6 },
  ],
  date: '2026-10-03', // samedi
  creneau: '09:00',
  prenom: 'Marie',
  nom: 'Dupont',
  telephone: '06 12 34 56 78',
  remarque: 'Bien cuites svp',
  consentement: true,
  duree: 12000,
};

describe('heure de Sète', () => {
  it('convertit l’UTC en heure de Paris (heure d’été)', () => {
    const i = aSete(new Date('2026-07-01T04:45:00Z'));
    expect(i).toEqual({ iso: '2026-07-01', jour: 3, minutes: 6 * 60 + 45 });
  });
  it('passe minuit du bon côté', () => {
    expect(aSete(new Date('2026-12-31T23:30:00Z')).iso).toBe('2027-01-01');
  });
  it('ouvert / fermé', () => {
    expect(statutBoutique(mardi10h)).toEqual({ ouvert: true, fermeA: 780 });
    expect(statutCourt(statutBoutique(mardi19h))).toEqual({ etat: 'FERMÉ', suite: 'on rouvre demain 6h30' });
    // samedi 14h → on rouvre lundi
    expect(statutCourt(statutBoutique({ iso: '2026-10-03', jour: 6, minutes: 840 })).suite).toBe('on rouvre lundi 6h30');
    // mardi 5h → on ouvre aujourd'hui
    expect(statutCourt(statutBoutique({ iso: '2026-09-29', jour: 2, minutes: 300 })).suite).toBe('on ouvre aujourd’hui 6h30');
  });
});

describe('calendrier et créneaux', () => {
  it('lendemain au plus tôt avant 18h, surlendemain après', () => {
    expect(premierJourCommandable(mardi10h)).toBe('2026-09-30');
    expect(premierJourCommandable(mardi19h)).toBe('2026-10-01');
  });
  it('grise les dimanches', () => {
    const dimanche = joursCalendrier(mardi10h).find((j) => j.iso === '2026-10-04');
    expect(dimanche?.ouvert).toBe(false);
  });
  it('créneaux de 30 min dans les horaires', () => {
    const semaine = creneauxDuJour('2026-09-30');
    expect(semaine[0]).toBe('06:30');
    expect(semaine.at(-1)).toBe('12:30');
    expect(creneauxDuJour('2026-10-03')[0]).toBe('07:00');
    expect(creneauxDuJour('2026-10-04')).toEqual([]);
  });
});

describe('validation', () => {
  it('accepte une commande correcte et recalcule le total', () => {
    const r = validerCommande({ ...base, total: 1 }, mardi10h);
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.commande.total).toBe(2 * produitParId.get('baguette')!.prix + 6 * produitParId.get('croissant')!.prix);
  });
  it('refuse un produit inconnu', () => {
    const r = validerCommande({ ...base, lignes: [{ id: 'caviar', qte: 1 }] }, mardi10h);
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.erreurs.lignes).toBeDefined();
  });
  it('refuse une quantité hors bornes', () => {
    expect(validerCommande({ ...base, lignes: [{ id: 'baguette', qte: 51 }] }, mardi10h).ok).toBe(false);
    expect(validerCommande({ ...base, lignes: [{ id: 'baguette', qte: 0 }] }, mardi10h).ok).toBe(false);
  });
  it('refuse un dimanche, un jour trop proche, un créneau hors horaires', () => {
    expect(validerCommande({ ...base, date: '2026-10-04' }, mardi10h).ok).toBe(false);
    expect(validerCommande({ ...base, date: '2026-09-30' }, mardi19h).ok).toBe(false);
    expect(validerCommande({ ...base, creneau: '06:30' }, mardi10h).ok).toBe(false); // samedi ouvre à 7h
    expect(validerCommande({ ...base, creneau: '13:00' }, mardi10h).ok).toBe(false);
  });
  it('accepte un produit fait ce jour-là', () => {
    const r = validerCommande({ ...base, lignes: [{ id: 'sandwich', qte: 1 }], date: '2026-10-05' }, mardi10h);
    expect(r.ok).toBe(true); // lundi : oui
  });
  it('exige le consentement', () => {
    expect(validerCommande({ ...base, consentement: false }, mardi10h).ok).toBe(false);
  });
  it('exige le détail d’une commande spéciale', () => {
    expect(validerCommande({ ...base, speciale: true }, mardi10h).ok).toBe(false);
    expect(validerCommande({ ...base, speciale: true, demandeSpeciale: '3 plaques' }, mardi10h).ok).toBe(true);
  });
});

describe('téléphone', () => {
  it.each([
    ['06 12 34 56 78', '06 12 34 56 78'],
    ['0612345678', '06 12 34 56 78'],
    ['+33 6 12 34 56 78', '06 12 34 56 78'],
    ['0033612345678', '06 12 34 56 78'],
    ['04.67.53.59.31', '04 67 53 59 31'],
  ])('%s', (entree, sortie) => expect(telephoneFR(entree)).toBe(sortie));
  it.each(['12345', '0012345678', '+44 20 7946 0958', '06 12 34 56'])('refuse %s', (e) => expect(telephoneFR(e)).toBeNull());
});

describe('message WhatsApp', () => {
  it('suit le format attendu', () => {
    const r = validerCommande(base, mardi10h);
    if (!r.ok) throw new Error('commande invalide');
    const m = messageWhatsApp(r.commande, 'AB-7K2Q');
    expect(m).toContain('*NOUVELLE COMMANDE* — AB-7K2Q');
    expect(m).toContain('👤 Marie Dupont — 06 12 34 56 78');
    expect(m).toContain('📅 Retrait : samedi 3 octobre, vers 9h');
    expect(m).toContain('2 × Baguette');
    expect(m).toContain('💬 « Bien cuites svp »');
    expect(m).toContain('paiement en boutique');
  });
  it('reste sous 1 000 caractères', () => {
    const lignes = [...produitParId.keys()].map((id) => ({ id, qte: 50 }));
    const r = validerCommande(
      { ...base, date: '2026-10-05', lignes, remarque: 'x'.repeat(200), speciale: true, demandeSpeciale: 'y'.repeat(400) },
      mardi10h,
    );
    if (!r.ok) throw new Error(JSON.stringify(r.erreurs));
    expect(messageWhatsApp(r.commande, 'AB-AAAA').length).toBeLessThanOrEqual(1000);
  });
});

describe('divers', () => {
  it('numéro de commande', () => expect(numeroCommande()).toMatch(/^AB-[A-Z2-9]{4}$/));
  it('prix', () => {
    expect(prixLisible(1480)).toBe('14,80 €');
    expect(totalCentimes([{ id: 'inconnu', qte: 3 }])).toBe(0);
  });
});
