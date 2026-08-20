// api/fmp.js
// -----------------------------------------------------------------------
// Fonction serverless (Vercel) qui relaie les appels vers Financial
// Modeling Prep en gardant la clé API côté serveur (variable d'environnement
// FMP_API_KEY, jamais exposée au navigateur).
//
// Le front-end appelle : /api/fmp?resource=profile&symbol=AAPL
// au lieu d'appeler directement financialmodelingprep.com avec la clé en clair.
// -----------------------------------------------------------------------

// Liste blanche des ressources FMP que ce proxy accepte de relayer —
// évite qu'un appelant malveillant détourne la clé pour taper n'importe
// quel endpoint payant de FMP.
const ALLOWED_RESOURCES = new Set([
  "profile",
  "income-statement",
  "balance-sheet-statement",
]);

export default async function handler(req, res) {
  // CORS basique : autorise l'appel depuis n'importe quelle origine.
  // Resserrez sur votre propre domaine une fois en production si besoin.
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  if (req.method === "OPTIONS") return res.status(204).end();

  const { resource, symbol, limit } = req.query;

  if (!resource || !ALLOWED_RESOURCES.has(resource)) {
    return res.status(400).json({ error: "Ressource non autorisée ou manquante." });
  }
  if (!symbol) {
    return res.status(400).json({ error: "Paramètre 'symbol' manquant." });
  }

  const apiKey = process.env.FMP_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: "FMP_API_KEY non configurée sur le serveur (variable d'environnement absente)." });
  }

  const params = new URLSearchParams({ symbol, apikey: apiKey });
  if (limit) params.set("limit", String(limit));

  const upstreamUrl = `https://financialmodelingprep.com/stable/${resource}?${params.toString()}`;

  try {
    const upstream = await fetch(upstreamUrl);
    const text = await upstream.text();
    res.status(upstream.status);
    res.setHeader("Content-Type", "application/json");
    return res.send(text);
  } catch (err) {
    return res.status(502).json({ error: "Impossible de joindre Financial Modeling Prep." });
  }
}
