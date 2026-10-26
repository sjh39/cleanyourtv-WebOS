/* ---------- language: the pages are written in English and translated where text is shown ----------
   I18N holds the translations this page uses, from i18n/<language>.json, put in by tools/build-pages.js ({language: {English: text}}).
   The language is the TV's, unless the manager's Language setting chose another (setLang). t() looks a text up whole, then the parts
   of a text joined by line breaks or " · ", and fills in templates: "%s" is any text, "%d" a number ("Launcher %s", "%d photos").
   A text without a translation stays English. */
var LANG_TV = String((window.webOSSystem && window.webOSSystem.locale) || navigator.language || 'en')
    .slice(0, 2)
    .toLowerCase(),
  LANG = 'en',
  LT = null,
  LTPL = null;
/* '' or undefined: the TV's language; a language without translations here falls back to English */
function setLang(code) {
  var c = code || LANG_TV;
  LANG = I18N[c] ? c : 'en';
  LT = LANG === 'en' ? null : I18N[LANG];
  LTPL = null;
  if (document.documentElement) document.documentElement.lang = LANG;
}
setLang('');
function tTemplates() {
  if (LTPL) return LTPL;
  LTPL = [];
  for (var k in LT)
    if (k.charAt(0) !== '_' && /%[sd]/.test(k))
      LTPL.push([
        new RegExp(
          '^' +
            k
              .replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
              .replace(/%s/g, '([\\s\\S]+?)')
              .replace(/%d/g, '([0-9][0-9.,]*)') +
            '$'
        ),
        k,
        /\n| · /.test(k),
      ]);
  LTPL.sort(function (a, b) {
    return b[1].length - a[1].length;
  });
  return LTPL;
}
function tTpl(s, joined) {
  var tp = tTemplates();
  for (var i = 0; i < tp.length; i++) {
    if (tp[i][2] !== joined) continue;
    var m = tp[i][0].exec(s);
    if (m) {
      var j = 1;
      return LT[tp[i][1]].replace(/%[sd]/g, function () {
        return t(m[j++]);
      });
    }
  }
  return null;
}
function t(s) {
  if (!LT || s === null || s === undefined || s === '') return s;
  s = String(s);
  if (Object.prototype.hasOwnProperty.call(LT, s)) return LT[s];
  var r = tTpl(s, true);
  if (r !== null) return r;
  if (s.indexOf('\n') >= 0) return s.split('\n').map(t).join('\n');
  if (s.indexOf(' · ') >= 0) return s.split(' · ').map(t).join(' · ');
  r = tTpl(s, false);
  return r !== null ? r : s;
}
/* the manager calls it tr: its code has local variables named t */
function tr(s) {
  return t(s);
}
/* the languages for the manager's Language list: English and every language this page has, with how complete it is */
function languages() {
  var out = [{ code: 'en', name: 'English', pct: 100 }];
  for (var c in I18N) out.push({ code: c, name: I18N[c]._name || c, pct: I18N[c]._pct || 0 });
  return out;
}
