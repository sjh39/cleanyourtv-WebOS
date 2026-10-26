// Cards: small widgets in the slots a theme declares (themeschema.js: slots), chosen per slot in the launcher (Customise > Cards). The
// launcher saves them with its other settings as config.cards, {<slot id>: {type, ...options}}, keyed by slot so a card stays when
// another theme has a slot with the same id. {type: 'none'} leaves a slot empty that the theme would fill by default.
// Only the shape is checked here (sanitize); the launcher draws the cards (app/src/js/cards.js), so a newer launcher can bring a card
// type without a service update. The options are typed on a phone page (create: POST /api/cards/pair, a short-lived server on the LAN,
// port 8792, that needs the code shown on the TV): a form per card for the types in TYPES, and the cards as JSON for everything else.
const http = require('http');
const web = require('./web'),
  i18n = require('./i18n'),
  nc = require('./netcompat');
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

// the forms on the phone page: per card type its options (text, a longer text, or a choice); labels are English and translated there
const TYPES = [
  {
    type: 'greeting',
    name: 'Greeting',
    fields: [
      { key: 'name', kind: 'text', label: 'Name (optional)' },
      {
        key: 'line',
        kind: 'choice',
        label: 'Second line (where there is room)',
        choices: [
          ['', 'None'],
          ['date', 'The date'],
        ],
      },
    ],
  },
  {
    type: 'template',
    name: 'Text',
    fields: [
      { key: 'text', kind: 'long', label: 'Text' },
      {
        key: 'size',
        kind: 'choice',
        label: 'Size',
        choices: [
          ['', 'Medium'],
          ['small', 'Small'],
          ['large', 'Large'],
        ],
      },
    ],
  },
];
// the usual slot ids, named as in the launcher
const SLOT_NAMES = { greeting: 'Above the clock', 'clock-side': 'Beside the clock', side: 'Right column', row: 'Above the dock' };
const PAIR_PORT = 8792, // after the Wallpapers page (8791)
  PAIR_MS = 10 * 60 * 1000;

function create(ctx) {
  const config = ctx.config;
  const slots = () => {
    const th = ctx.feature('theme'),
      r = th && th.resolved();
    return (r && r.slots) || [];
  };
  function state(lang) {
    const T = x => i18n.tr(lang, x);
    return {
      slots: slots().map(sl => ({ id: sl.id, name: T(SLOT_NAMES[sl.id] || sl.id), card: sl.card })),
      cards: config.get().cards || {},
      types: TYPES.map(ty => ({
        type: ty.type,
        name: T(ty.name),
        fields: ty.fields.map(f => Object.assign({}, f, { label: T(f.label), choices: f.choices && f.choices.map(c => [c[0], T(c[1])]) })),
      })),
    };
  }
  function save(cards) {
    const c = sanitize(cards) || {};
    config.update('cards (phone)', conf => {
      if (Object.keys(c).length) conf.cards = c;
      else delete conf.cards;
    });
    return c;
  }

  // ---- the phone page: LAN, short-lived, the code shown on the TV in every request (header x-code) ----
  let pair = null;
  function startPair() {
    stopPair();
    const code = String(nc.randomInt(100000, 1000000));
    let bad = 0;
    const srv = http.createServer((req, res) => phone(req, res, code, () => ++bad));
    pair = { code, srv, url: 'http://' + web.lanIp() + ':' + PAIR_PORT, until: Date.now() + PAIR_MS, timer: setTimeout(stopPair, PAIR_MS) };
    const out = { url: pair.url, code, qr: pair.url + '/#' + code, seconds: PAIR_MS / 1000 };
    return new Promise(resolve => {
      srv.on('error', e => {
        stopPair();
        resolve({ error: 'the phone page could not start: ' + e.message });
      });
      srv.listen(PAIR_PORT, '0.0.0.0', () => resolve(out));
    });
  }
  // while the page is used it stays open (up to an hour after it was opened)
  function touch() {
    if (!pair) return;
    clearTimeout(pair.timer);
    pair.until = Math.min(Date.now() + PAIR_MS, (pair.opened || (pair.opened = Date.now())) + 3600 * 1000);
    pair.timer = setTimeout(stopPair, pair.until - Date.now());
  }
  function stopPair() {
    if (!pair) return;
    clearTimeout(pair.timer);
    try {
      pair.srv.close();
    } catch (_) {}
    pair = null;
  }
  async function phone(req, res, code, wrong) {
    const u = req.url.split('?')[0],
      lang = i18n.lang(req, config.get().lang),
      json = (o, c) => {
        res.writeHead(c || 200, { 'content-type': 'application/json', 'cache-control': 'no-store' });
        res.end(JSON.stringify(o));
      };
    if (req.method === 'GET' && u === '/') {
      res.writeHead(200, { 'content-type': 'text/html; charset=utf-8', 'cache-control': 'no-store' });
      return res.end(phonePage(lang));
    }
    if (u.indexOf('/api/') !== 0) return web.notFound(res);
    if (req.headers['x-code'] !== code) {
      if (wrong() >= 8) stopPair();
      return json({ error: 'wrong code' }, 403);
    }
    touch();
    if (u === '/api/state') return json(state(lang));
    if (u === '/api/save' && req.method === 'POST') return json({ ok: true, cards: save((await web.body(req, 65536)).cards) });
    json({ error: 'not found' }, 404);
  }

  async function handle(req, res, u, body) {
    if (req.method !== 'POST') return web.notFound(res);
    const b = await body(req);
    if (u === '/api/cards/pair') return web.json(res, b.stop ? (stopPair(), {}) : await startPair());
    web.notFound(res);
  }
  return { name: 'cards', paths: ['/api/cards/pair'], handle, stop: stopPair };
}

// the phone page: a form per slot (the card type, then its options), and all cards as JSON. Plain script for iOS Safari and Android
// Chrome, in the phone's language (i18n.js).
const PHONE_JS = `var code='',S={},$=function(i){return document.getElementById(i)};
function api(p,b){return new Promise(function(ok,no){var x=new XMLHttpRequest();x.open(b===undefined?'GET':'POST','/api/'+p);x.setRequestHeader('x-code',code);
 x.onload=function(){var j={};try{j=JSON.parse(x.responseText)}catch(e){}if(x.status===403){showLogin(t('Wrong code.'));no(j)}else ok(j)};x.onerror=function(){no({error:t('The TV did not answer. Is the phone on the same Wi-Fi?')})};
 x.send(b===undefined?null:JSON.stringify(b))})}
function msg(s,e){$('msg').innerHTML=s?'<p class="m'+(e?' e':'')+'"></p>':'';if(s)$('msg').firstChild.textContent=s}
function showLogin(s){$('login').className='';$('main').className='hide';$('sum').textContent=s||''}
function el(tag,attrs,text){var e=document.createElement(tag);for(var k in attrs||{})e.setAttribute(k,attrs[k]);if(text!==undefined)e.textContent=text;return e}
function typeOf(n){for(var i=0;i<S.types.length;i++)if(S.types[i].type===n)return S.types[i];return null}
/* the card a slot shows now: the chosen one, else the theme's default, else none */
function cardOf(sl){var c=S.cards[sl.id];return c&&c.type?c:{type:sl.card||'none'}}
function draw(){var box=$('slots');box.innerHTML='';$('sum').textContent=S.slots.length?'':t('This theme has no places for cards. Choose a theme with cards (Lock Screen) in Customise > Theme.');
 S.slots.forEach(function(sl){var c=cardOf(sl),sec=el('section',{'class':'sl','data-id':sl.id});sec.appendChild(el('h2',{},sl.name));
  var sel=el('select',{'data-k':'type'});sel.appendChild(el('option',{value:'none'},t('Empty')));S.types.forEach(function(ty){sel.appendChild(el('option',{value:ty.type},ty.name))});
  if(c.type!=='none'&&!typeOf(c.type))sel.appendChild(el('option',{value:c.type},c.type));sel.value=c.type;sec.appendChild(sel);
  var f=el('div',{'class':'f'});sec.appendChild(f);fields(f,c);sel.onchange=function(){var o=S.cards[sl.id]&&S.cards[sl.id].type===sel.value?S.cards[sl.id]:{type:sel.value};fields(f,o)};box.appendChild(sec)});
 $('raw').value=JSON.stringify(S.cards,null,2)}
function fields(f,c){f.innerHTML='';var ty=typeOf(c.type);if(!ty)return;ty.fields.forEach(function(fd){var l=el('label',{},fd.label),i;
  if(fd.kind==='choice'){i=el('select',{'data-k':fd.key});fd.choices.forEach(function(ch){i.appendChild(el('option',{value:ch[0]},ch[1]))})}
  else if(fd.kind==='long'){i=el('textarea',{'data-k':fd.key,rows:4})}else i=el('input',{'data-k':fd.key,type:'text',autocomplete:'off'});
  i.value=c[fd.key]===undefined?'':String(c[fd.key]);f.appendChild(l);f.appendChild(i)});
 if(c.type==='template')f.appendChild(el('p',{'class':'h'},t('Use {{greeting}}, {{time}}, {{date}} and {{weekday}} for what changes; **bold**, *italic* and a line starting with # for a heading.')))}
/* the forms into cards; options of a type the page has no form for stay as they were */
function fromForms(){var out={};[].forEach.call(document.querySelectorAll('section.sl'),function(sec){var id=sec.getAttribute('data-id'),ty=sec.querySelector('[data-k=type]').value,old=S.cards[id]||{},c={type:ty};
  if(!typeOf(ty)&&old.type===ty)c=old;[].forEach.call(sec.querySelectorAll('.f [data-k]'),function(i){if(i.value!=='')c[i.getAttribute('data-k')]=i.value});
  var sl=null;S.slots.forEach(function(x){if(x.id===id)sl=x});if(ty==='none'&&!(sl&&sl.card))return;out[id]=c});
 for(var k in S.cards)if(!(k in out)&&!S.slots.some(function(x){return x.id===k}))out[k]=S.cards[k];return out}
function save(cards){msg(t('Saving…'));api('save',{cards:cards}).then(function(r){if(r.error)return msg(t(r.error),1);S.cards=r.cards||{};draw();msg(t('Saved. Open Home on the TV to see it.'))},function(e){msg(e.error,1)})}
function state(){return api('state').then(function(s){S=s;$('login').className='hide';$('main').className='';draw()})}
$('save').onclick=function(){save(fromForms())};
$('rs').onclick=function(){var c;try{c=JSON.parse($('raw').value||'{}')}catch(e){return msg(t('This is not valid JSON.'),1)}save(c)};
$('go').onclick=function(){code=$('code').value.trim();state().catch(function(){})};
code=(location.hash||'').slice(1);if(/^\\d{6}$/.test(code))state().catch(function(){});else showLogin();
`;
function phonePage(lang) {
  const T = s => web.esc(i18n.tr(lang, s));
  return (
    `<!doctype html><html lang=${lang}><meta charset=utf-8><meta name=viewport content="width=device-width,initial-scale=1"><title>${T('Cards')}</title>
<style>*{box-sizing:border-box}body{font:17px -apple-system,system-ui,sans-serif;background:#0d0e12;color:#eee;margin:0;padding:20px 16px 60px;max-width:640px;margin:0 auto}
h1{font-size:26px;margin:4px 0 4px}h2{font-size:20px;margin:0 0 10px}p{color:#aaa;margin:6px 0}.m{padding:12px 14px;border-radius:12px;background:#1d2a1f;margin:12px 0}.m.e{background:#3a1717}
button,input,select,textarea{font:inherit;display:block;width:100%;padding:14px;border-radius:12px;border:1px solid #333;background:#1a1b21;color:#eee;margin:8px 0}
button{text-align:center}button.p{background:#f5f6f8;color:#111;font-weight:600;border:0}textarea{resize:vertical}label{display:block;color:#aaa;margin:12px 0 0;font-size:15px}
.sl{padding:16px;border-radius:14px;background:#15161b;margin:14px 0}.h{font-size:14px}.hide{display:none}details{margin:28px 0}summary{color:#aaa}
#raw{font:13px ui-monospace,Menlo,monospace;min-height:220px}[dir=rtl] body{text-align:right}</style>
<h1>${T('Cards')}</h1><p id=sum>${T('Connecting to the TV…')}</p>
<div id=login class=hide><p>${T('Enter the code shown on the TV.')}</p><input id=code inputmode=numeric autocomplete=one-time-code><button class=p id=go>${T('Continue')}</button></div>
<div id=main class=hide><div id=msg></div><div id=slots></div><button class=p id=save>${T('Save')}</button>
<details><summary>${T('Edit as JSON')}</summary><p class=h>${T('All cards at once, by slot: {"greeting": {"type": "greeting", "name": "Sam"}}. A type the TV does not know yet leaves its slot empty.')}</p>
<textarea id=raw spellcheck=false autocapitalize=off></textarea><button id=rs>${T('Save JSON')}</button></details></div>
` +
    i18n.script(lang, PHONE_JS) +
    '<script>' +
    PHONE_JS +
    '</script></html>'
  );
}

module.exports = { SLOT_ID, TYPE, MAX_SLOTS, TYPES, PAIR_PORT, sanitize, create };
