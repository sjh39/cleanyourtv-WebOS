// Translations for the pages the service serves itself (the phone pages for Wallpapers, Live TV and voice, Share log): the same
// i18n/<language>.json files as the TV's screens (copied next to the service by the setup; in a checkout, ../i18n). A phone page is in
// the phone's language (its Accept-Language), else the language chosen in the manager, else English.
//   lang(req, chosen)  -> a language code there is a file for, or 'en'
//   tr(lang, text)     -> the text in that language (whole, or the parts joined by " · " or lines, or a %s / %d template)
//   script(lang, html) -> a <script> with the translations a page's own script uses and t() (i18n/runtime.js), set to that language
// The service's own messages stay English: the TV's screens translate them where they show them.
const fs = require('fs'),
  path = require('path');

const DIRS = [path.join(__dirname, 'i18n'), path.join(__dirname, '..', 'i18n')];
let cache = null;
function load() {
  if (cache) return cache;
  cache = { langs: {}, runtime: '' };
  for (const d of DIRS) {
    let files = [];
    try {
      files = fs.readdirSync(d);
    } catch (_) {
      continue;
    }
    for (const f of files) {
      const m = /^([a-z]{2})\.json$/.exec(f);
      if (!m || m[1] === 'en') continue;
      try {
        cache.langs[m[1]] = JSON.parse(fs.readFileSync(path.join(d, f), 'utf8'));
      } catch (_) {}
    }
    try {
      cache.runtime = fs.readFileSync(path.join(d, 'runtime.js'), 'utf8');
    } catch (_) {}
    if (Object.keys(cache.langs).length) break;
  }
  return cache;
}
function lang(req, chosen) {
  const L = load().langs,
    acc = String((req && req.headers && req.headers['accept-language']) || '');
  const asked = acc
    .split(',')
    .map(p => {
      const m = /^\s*([a-zA-Z]{2})(?:-[a-zA-Z0-9]+)?\s*(?:;\s*q=([0-9.]+))?/.exec(p);
      return m ? { c: m[1].toLowerCase(), q: m[2] === undefined ? 1 : parseFloat(m[2]) } : null;
    })
    .filter(Boolean)
    .sort((a, b) => b.q - a.q);
  for (const a of asked) if (a.c === 'en' || L[a.c]) return a.c;
  return chosen && L[chosen] ? chosen : 'en';
}

const templates = {};
function tpl(code) {
  if (templates[code]) return templates[code];
  const T = load().langs[code] || {},
    out = [];
  for (const k of Object.keys(T))
    if (k.charAt(0) !== '_' && /%[sd]/.test(k))
      out.push({
        re: new RegExp(
          '^' +
            k
              .replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
              .replace(/%s/g, '([\\s\\S]+?)')
              .replace(/%d/g, '([0-9][0-9.,]*)') +
            '$'
        ),
        key: k,
        joined: /\n| \u00B7 /.test(k),
      });
  out.sort((a, b) => b.key.length - a.key.length);
  return (templates[code] = out);
}
function tr(code, s) {
  const T = load().langs[code];
  if (!T || s === null || s === undefined || s === '') return s;
  s = String(s);
  if (Object.prototype.hasOwnProperty.call(T, s) && T[s]) return T[s];
  const viaTpl = joined => {
    for (const x of tpl(code)) {
      if (x.joined !== joined) continue;
      const m = x.re.exec(s);
      if (m) {
        let j = 1;
        return T[x.key].replace(/%[sd]/g, () => tr(code, m[j++]));
      }
    }
    return null;
  };
  let r = viaTpl(true);
  if (r !== null) return r;
  if (s.indexOf('\n') >= 0)
    return s
      .split('\n')
      .map(x => tr(code, x))
      .join('\n');
  if (s.indexOf(' · ') >= 0)
    return s
      .split(' · ')
      .map(x => tr(code, x))
      .join(' · ');
  r = viaTpl(false);
  return r !== null ? r : s;
}
// the texts of a page's script that have a translation: every key whose fixed parts all appear in the script
function script(code, js) {
  const T = load().langs[code] || {},
    used = { _name: T._name || code, _dir: T._dir === 'rtl' ? 'rtl' : 'ltr' };
  const text = String(js || '').replace(/\\u([0-9a-fA-F]{4})/g, (m, h) => String.fromCharCode(parseInt(h, 16)));
  for (const k of Object.keys(T)) {
    if (k.charAt(0) === '_' || !T[k]) continue;
    const parts = k.split(/%[sd]/).filter(f => f.trim().length > 0);
    if (parts.length && parts.every(f => text.indexOf(f) >= 0)) used[k] = T[k];
  }
  const table = code === 'en' ? {} : { [code]: used };
  return (
    '<script>var I18N = ' +
    JSON.stringify(table).replace(/</g, '\\u003c') +
    ';\n' +
    load().runtime +
    '\nsetLang(' +
    JSON.stringify(code) +
    ');</script>'
  );
}

module.exports = { lang, tr, script, load };
