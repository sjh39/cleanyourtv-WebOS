// Translations (i18n/ and i18n/runtime.js): the files are valid, the pages carry what they use, and t() finds whole texts, the parts
// of a joined text and templates, and falls back to English.
const fs = require('fs'),
  path = require('path');
const { ok, root, run } = require('./lib');

run(async () => {
  const r = require(path.join(root, 'tools', 'i18n.js')).report();
  ok(!r.problems.length, 'the language files are valid, with matching %s and %d' + (r.problems.length ? ': ' + r.problems.join('; ') : ''));
  ok(r.rows.length >= 4 && r.rows.every(x => x.name), 'every language names itself: ' + r.rows.map(x => x.code + ' ' + x.name).join(', '));
  const B = require(path.join(root, 'tools', 'build-pages.js'));
  const fresh = B.PAGES.every(p => B.build(p[0]) === fs.readFileSync(path.join(root, p[1]), 'utf8'));
  ok(fresh, 'the pages (and the picker part between its marks) carry the current translations');

  // the runtime as a page has it, with a small table
  const runtime = fs.readFileSync(path.join(root, 'i18n', 'runtime.js'), 'utf8');
  const make = (locale, table) =>
    new Function(
      'window',
      'navigator',
      'document',
      'I18N',
      runtime + '; return { t: t, setLang: setLang, lang: function () { return LANG; }, languages: languages };'
    )({ webOSSystem: { locale: locale } }, { language: 'en' }, { documentElement: {} }, table);
  const T = {
    nl: {
      _name: 'Nederlands',
      _pct: 90,
      'Hidden apps': 'Verborgen apps',
      '%d photos': '%d foto’s',
      'synced %s': 'gesynchroniseerd %s',
      '%d min ago': '%d min geleden',
      'Launcher %s · service %s': 'Launcher %s · service %s',
      'Latest release %s': 'Nieuwste release %s',
      On: 'Aan',
    },
  };
  const a = make('nl-NL', T);
  ok(a.lang() === 'nl' && a.t('Hidden apps') === 'Verborgen apps', 'the TV language is used, and a whole text is found');
  ok(
    a.t('3 photos · synced 5 min ago') === '3 foto’s · gesynchroniseerd 5 min geleden',
    'the parts of a joined text and templates within templates'
  );
  ok(
    a.t('Launcher 1.5 · service 1.6\nLatest release 1.6') === 'Launcher 1.5 · service 1.6\nNieuwste release 1.6',
    'a template with " · " in it and lines'
  );
  ok(a.t('An error from the service') === 'An error from the service' && a.t('') === '', 'a text without a translation stays English');
  ok(a.t('%d photos') === '%d foto’s', 'a template looked up as it is, for pages that fill it in themselves');
  a.setLang('en');
  ok(a.lang() === 'en' && a.t('Hidden apps') === 'Hidden apps', 'the Language setting can choose English');
  a.setLang('xx');
  ok(a.lang() === 'en', 'a language the page has no translations for falls back to English');
  a.setLang('');
  ok(a.lang() === 'nl', 'Automatic follows the TV again');
  const b = make('ja-JP', T);
  ok(
    b.lang() === 'en' &&
      b
        .languages()
        .map(x => x.code + x.pct)
        .join() === 'en100,nl90',
    'a TV language without translations shows English; the Language list has every language with how complete it is'
  );
});
