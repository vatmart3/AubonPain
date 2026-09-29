import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

function requete(corps: unknown, ip = '1.2.3.4') {
  return new Request('http://localhost/api/commande', {
    method: 'POST',
    headers: { 'content-type': 'application/json', 'x-forwarded-for': ip },
    body: JSON.stringify(corps),
  });
}

// Une commande pour dans 3 jours ouvrés, quel que soit le jour où tournent les tests.
async function commandeValide() {
  const { joursCalendrier, creneauxDuJour } = await import('@/lib/commande');
  const jour = joursCalendrier().find((j) => j.ouvert)!.iso;
  return {
    lignes: [{ id: 'croissant', qte: 6 }],
    date: jour,
    creneau: creneauxDuJour(jour)[2],
    prenom: 'Marie',
    nom: 'Dupont',
    telephone: '0612345678',
    consentement: true,
    duree: 9000,
  };
}

describe('POST /api/commande', () => {
  beforeEach(() => {
    vi.resetModules();
    vi.stubEnv('CALLMEBOT_PHONE', '+33600000000');
    vi.stubEnv('CALLMEBOT_APIKEY', 'cle');
  });
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
  });

  it('envoie sur WhatsApp et renvoie un numéro', async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response('Message queued. You will receive it in a few seconds.'));
    vi.stubGlobal('fetch', fetchMock);
    const { POST } = await import('@/app/api/commande/route');
    const res = await POST(requete(await commandeValide()));
    const json = await res.json();
    expect(res.status).toBe(200);
    expect(json.id).toMatch(/^AB-/);
    const url = new URL(fetchMock.mock.calls[0][0]);
    expect(url.hostname).toBe('api.callmebot.com');
    expect(url.searchParams.get('apikey')).toBe('cle');
    expect(url.searchParams.get('text')).toContain('6 × Croissant');
  });

  it('envoie une copie au numéro de secours', async () => {
    vi.stubEnv('CALLMEBOT_PHONE_BACKUP', '+33611111111');
    vi.stubEnv('CALLMEBOT_APIKEY_BACKUP', 'cle2');
    const fetchMock = vi.fn().mockResolvedValue(new Response('Message queued.'));
    vi.stubGlobal('fetch', fetchMock);
    const { POST } = await import('@/app/api/commande/route');
    await POST(requete(await commandeValide(), '5.5.5.5'));
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it('refuse une commande invalide sans rien envoyer', async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal('fetch', fetchMock);
    const { POST } = await import('@/app/api/commande/route');
    const res = await POST(requete({ ...(await commandeValide()), telephone: '123' }));
    expect(res.status).toBe(422);
    expect((await res.json()).erreurs.telephone).toBeDefined();
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('ignore les robots (champ piège, trop rapide)', async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal('fetch', fetchMock);
    const { POST } = await import('@/app/api/commande/route');
    expect((await POST(requete({ ...(await commandeValide()), site: 'http://spam' }))).status).toBe(200);
    expect((await POST(requete({ ...(await commandeValide()), duree: 1200 }))).status).toBe(200);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('limite à 3 envois par IP en 10 minutes', async () => {
    vi.stubGlobal('fetch', vi.fn().mockImplementation(async () => new Response('Message queued.')));
    const { POST } = await import('@/app/api/commande/route');
    const c = await commandeValide();
    for (let i = 0; i < 3; i++) expect((await POST(requete(c, '9.9.9.9'))).status).toBe(200);
    expect((await POST(requete(c, '9.9.9.9'))).status).toBe(429);
  });

  it('signale un échec d’envoi', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response('APIKey is invalid', { status: 200 })));
    const { POST } = await import('@/app/api/commande/route');
    const res = await POST(requete(await commandeValide(), '7.7.7.7'));
    expect(res.status).toBe(502);
  });

  it('signale un délai dépassé', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new DOMException('timeout', 'TimeoutError')));
    const { POST } = await import('@/app/api/commande/route');
    expect((await POST(requete(await commandeValide(), '8.8.8.8'))).status).toBe(502);
  });
});
