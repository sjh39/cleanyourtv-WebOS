# Translations

Every screen of CleanYourTV (the launcher, the manager app, the Inputs list) is written in English and translated where text is
shown. The translations are one file per language in this folder.

| File | What it is |
|---|---|
| `en.json` | Every English text the screens use. The key and the value are the same; it is the list to translate from. |
| `nl.json`, `de.json`, ... | One language: `{"Hidden apps": "Verborgen apps", ...}`. `_name` is the language in its own words, `_dir` is `ltr` (or `rtl`, not supported yet). |
| `runtime.js` | The code the pages use to translate (`t()`). |

`tools/build-pages.js` puts the translations each page uses into that page, so the TV needs no network for them. The language is the
TV's menu language, or the one chosen in the manager app under **More** > **Language**.

## Adding or improving a language

1. Copy `en.json` to `<code>.json` (the two-letter code, for example `it.json`), set `_name` (`"Italiano"`) and replace each value
   with the translation. Leave out what you do not know: those texts stay English.
2. Keep `%s` (any text) and `%d` (a number) in the translation, as many as the English has.
3. Run `node tools/build-pages.js`, then `node tools/i18n.js` to see how complete the language is and whether a file has an error.
4. Open a pull request.

## Adding a text to a page

Write it in English and pass it through `t('...')` (`tr()` in the manager). Then run `node tools/i18n.js --sync` to add it to
`en.json`, add the translations you know to the language files and run `node tools/build-pages.js`.
