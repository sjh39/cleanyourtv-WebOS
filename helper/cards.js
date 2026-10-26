// Cards: small widgets in the slots a theme declares (themeschema.js: slots), chosen per slot in the launcher (Customise > Cards). The
// launcher saves them with its other settings as config.launcher.cards, {<slot id>: {type, ...options}}, keyed by slot so a card stays
// when another theme has a slot with the same id. {type: 'none'} leaves a slot empty that the theme would fill by default.
// Only the shape is checked here; which types exist and what their options mean is the launcher's business (app/src/js/cards.js),
// so a newer launcher can bring a card type without a service update.
const SLOT_ID = /^[a-z][a-z0-9-]{0,19}$/,
  TYPE = /^[a-z][a-z0-9-]{0,30}$/,
  MAX_SLOTS = 12;

// an option value: text, a number, true/false, or a short list of those or of small objects of those (an entities list)
function value(v, depth) {
  if (typeof v === 'string') return v.slice(0, 1000);
  if (typeof v === 'number') return isFinite(v) ? v : undefined;
  if (typeof v === 'boolean') return v;
  if (Array.isArray(v) && depth < 2)
    return v
      .slice(0, 40)
      .map(x => value(x, depth + 1))
      .filter(x => x !== undefined);
  if (v && typeof v === 'object' && depth > 0 && depth < 2) return options(v, depth + 1);
  return undefined;
}
function options(o, depth) {
  const out = {};
  for (const k of Object.keys(o).slice(0, 30)) {
    if (!/^[a-zA-Z][\w-]{0,30}$/.test(k)) continue;
    const v = value(o[k], depth);
    if (v !== undefined) out[k] = v;
  }
  return out;
}
// the cards as the launcher sent them, or undefined when there is nothing usable
function sanitize(c) {
  if (!c || typeof c !== 'object' || Array.isArray(c)) return undefined;
  const out = {};
  for (const id of Object.keys(c).slice(0, MAX_SLOTS)) {
    const card = c[id];
    if (!SLOT_ID.test(id) || !card || typeof card !== 'object' || !TYPE.test(card.type)) continue;
    out[id] = Object.assign(options(card, 0), { type: card.type });
  }
  return out;
}

module.exports = { SLOT_ID, TYPE, MAX_SLOTS, sanitize };
