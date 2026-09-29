import { useEffect, useState } from 'react';
import { messageWhatsApp, numeroCommande, validerCommande } from '@/lib/commande';

/**
 * Mode démo : la route /api/commande est simulée dans le navigateur.
 * La commande est validée avec les mêmes règles que le serveur, et le
 * message WhatsApp qui partirait est affiché au lieu d'être envoyé.
 */
let panne = false;
let dernier: string | null = null;
const abonnes = new Set<() => void>();

export function installerApiDemo() {
  const origine = window.fetch.bind(window);
  window.fetch = async (entree: RequestInfo | URL, init?: RequestInit) => {
    const url = typeof entree === 'string' ? entree : entree instanceof URL ? entree.href : entree.url;
    if (!url.endsWith('/api/commande')) return origine(entree, init);
    await new Promise((r) => setTimeout(r, 700));
    const json = (corps: unknown, status = 200) => new Response(JSON.stringify(corps), { status, headers: { 'content-type': 'application/json' } });
    if (panne) return json({ ok: false, message: 'La commande n’a pas pu partir.' }, 502);
    const r = validerCommande(JSON.parse(String(init?.body ?? '{}')));
    if (!r.ok) return json({ ok: false, message: 'Il manque quelque chose sur le bon.', erreurs: r.erreurs }, 422);
    const id = numeroCommande();
    dernier = messageWhatsApp(r.commande, id);
    abonnes.forEach((f) => f());
    return json({ ok: true, id, total: r.commande.total });
  };
}

export function PanneauDemo() {
  const [ouvert, setOuvert] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [simulerPanne, setSimulerPanne] = useState(false);

  useEffect(() => {
    const maj = () => {
      setMessage(dernier);
      setOuvert(true);
    };
    abonnes.add(maj);
    return () => {
      abonnes.delete(maj);
    };
  }, []);

  useEffect(() => {
    panne = simulerPanne;
  }, [simulerPanne]);

  return (
    <aside className="demo" data-ouvert={ouvert} aria-label="Mode démo">
      <button type="button" className="demo-onglet" aria-expanded={ouvert} aria-controls="demo-panneau" onClick={() => setOuvert((o) => !o)}>
        Démo
      </button>
      <div id="demo-panneau" className="demo-panneau" hidden={!ouvert}>
        <p className="demo-titre">Version de démonstration</p>
        <p>
          Les commandes ne partent pas : le message WhatsApp que recevrait Madame Vatuone s’affiche ici. Les prix, les horaires et les
          images sont provisoires.
        </p>
        <label className="demo-case">
          <input id="demo-panne" type="checkbox" checked={simulerPanne} onChange={(e) => setSimulerPanne(e.target.checked)} />
          Simuler une panne d’envoi
        </label>
        {message ? (
          <div className="demo-whatsapp">
            <p className="demo-de">Message reçu sur WhatsApp</p>
            <pre>{message.replace(/\*(.+?)\*/g, '$1')}</pre>
          </div>
        ) : (
          <p className="demo-vide">Aucune commande pour l’instant. Passez-en une sur « Commander ».</p>
        )}
        <button type="button" className="demo-fermer" onClick={() => setOuvert(false)}>
          Fermer
        </button>
      </div>
    </aside>
  );
}
