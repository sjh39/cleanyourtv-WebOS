// Cards (cards.js): the phone page opens with a code, lists the theme's slots and the card types with their options, saves the cards
// (checked for shape) where the launcher reads them, and the launcher page draws the greeting and a text card.
const http = require('http');
const { ok, call, sleep, req, memoryConfig, run } = require('./lib');

function phone(method, p, body, code) {
  return new Promise((resolve, reject) => {
    const r = http.request({ host: '127.0.0.1', port: 8792, path: p, method, headers: { 'x-code': code || '' } }, res => {
      const b = [];
      res.on('data', c => b.push(c));
      res.on('end', () => {
        const t = Buffer.concat(b).toString();
        let j = null;
        try {
          j = JSON.parse(t);
        } catch (_) {}
        resolve({ code: res.statusCode, text: t, j });
      });
    });
    r.on('error', reject);
    r.end(body === undefined ? undefined : JSON.stringify(body));
  });
}

run(async () => {
  const C = req('cards');
  const config = memoryConfig({ lang: 'nl', cards: { greeting: { type: 'greeting', name: 'Sam' } } });
  const theme = {
    name: 'theme',
    resolved: () => ({
      slots: [
        { id: 'greeting', card: 'greeting' },
        { id: 'side', card: '' },
        { id: 'odd-one', card: '' },
      ],
    }),
  };
  const cards = C.create({ config, feature: n => (n === 'theme' ? theme : null) });
  let r = await call(cards, '/api/cards/pair', 'POST', {});
  const code = r.j.code;
  ok(/^\d{6}$/.test(code) && /:8792\/#\d{6}$/.test(r.j.qr), 'the cards page opens with a 6-digit code, which the QR code carries');
  await sleep(100);
  let p = await phone('GET', '/');
  ok(
    p.code === 200 && /<title>Kaarten<\/title>/.test(p.text) && /JSON/.test(p.text),
    'the page is in the chosen language and has a JSON editor'
  );
  p = await phone('GET', '/api/state', undefined, '000000');
  ok(p.code === 403, 'the API needs the code');
  p = await phone('GET', '/api/state', undefined, code);
  ok(
    p.j.slots.length === 3 &&
      p.j.slots[0].name === 'Boven de klok' &&
      p.j.slots[2].name === 'odd-one' &&
      p.j.cards.greeting.name === 'Sam' &&
      p.j.types.some(t => t.type === 'template' && t.fields.some(f => f.key === 'text')),
    'the state lists the slots (named in the language), the saved cards and the card types with their options'
  );
  p = await phone(
    'POST',
    '/api/save',
    { cards: { side: { type: 'template', text: 'Hi {{greeting}}', size: 'large' }, 'B A D': { type: 'x' } } },
    code
  );
  ok(
    p.j.ok && JSON.stringify(config.get().cards) === JSON.stringify({ side: { type: 'template', text: 'Hi {{greeting}}', size: 'large' } }),
    'saving replaces the cards with what the page sent, checked for shape'
  );
  await phone('POST', '/api/save', { cards: {} }, code);
  ok(config.get().cards === undefined, 'saving no cards removes them');
  await call(cards, '/api/cards/pair', 'POST', { stop: true });
  await sleep(50);
  p = await phone('GET', '/').catch(() => ({ code: 0 }));
  ok(p.code === 0, 'the page is closed after stop');
});
