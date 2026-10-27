/* ---------- cards: small widgets in the slots a theme declares (theme.json "slots"), chosen in Customise > Cards ----------
   cfg.cards is {<slot id>: {type, ...options}}; a slot without an entry shows the card the theme puts there (slot.card), and
   {type: 'none'} leaves it empty. Each card type draws itself into its box; draw() runs on every rebuild and every clock tick. */
/* what changes with the time, for the cards: the greeting of the day part, the time and the date as the clock shows them */
function greetText(name) {
  var h = new Date().getHours();
  if (name) return (h < 12 ? t('Good morning, %s') : h < 18 ? t('Good afternoon, %s') : t('Good evening, %s')).replace('%s', name);
  return h < 12 ? t('Good morning') : h < 18 ? t('Good afternoon') : t('Good evening');
}
function dateText(o) {
  try {
    return new Date().toLocaleDateString(LOC, o || { weekday: 'long', day: 'numeric', month: 'long' });
  } catch (e) {
    return '';
  }
}
function timeText() {
  try {
    return new Date().toLocaleTimeString(LOC, clockOpts());
  } catch (e) {
    return '';
  }
}
/* ---- weather (Open-Meteo through the service, which asks at most every 30 minutes and keeps the last answer) ---- */
var WX = {},
  WX_LAST = null; /* the last weather drawn, for {{weather.temp}} in a text card and the greeting's second line */
var WX_ICON = {
  sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/>',
  moon: '<path d="M20 14.5A8 8 0 0 1 9.5 4a8 8 0 1 0 10.5 10.5z"/>',
  part: '<path d="M8 3v1.5M3.8 4.8l1 1M2 9h1.5M12.2 4.8l-1 1"/><path d="M5.2 11.2A4 4 0 1 1 12 7.6"/><path d="M9 20h9a3.5 3.5 0 0 0 .4-7 5 5 0 0 0-9.6 1.3A3 3 0 0 0 9 20z"/>',
  cloud: '<path d="M7 19h10.5a4 4 0 0 0 .4-8 6 6 0 0 0-11.6 1.5A3.3 3.3 0 0 0 7 19z"/>',
  fog: '<path d="M4 9h16M3 13h18M5 17h14"/>',
  rain: '<path d="M7 15h10.5a4 4 0 0 0 .4-8 6 6 0 0 0-11.6 1.5A3.3 3.3 0 0 0 7 15z"/><path d="M9 18l-1 3M13 18l-1 3M17 18l-1 3"/>',
  snow: '<path d="M7 15h10.5a4 4 0 0 0 .4-8 6 6 0 0 0-11.6 1.5A3.3 3.3 0 0 0 7 15z"/><path d="M8 19h.01M12 21h.01M16 19h.01M10 22h.01M14 18h.01"/>',
  storm: '<path d="M7 15h10.5a4 4 0 0 0 .4-8 6 6 0 0 0-11.6 1.5A3.3 3.3 0 0 0 7 15z"/><path d="M12.5 15l-2 4h3l-2 4"/>',
};
/* WMO weather codes as Open-Meteo gives them: an icon and a word */
function wxKind(code, day) {
  if (code === 0) return [day === false ? 'moon' : 'sun', t('Clear')];
  if (code <= 2) return ['part', t('Partly cloudy')];
  if (code === 3) return ['cloud', t('Cloudy')];
  if (code === 45 || code === 48) return ['fog', t('Fog')];
  if (code >= 51 && code <= 57) return ['rain', t('Drizzle')];
  if ((code >= 61 && code <= 67) || (code >= 80 && code <= 82)) return ['rain', t('Rain')];
  if ((code >= 71 && code <= 77) || code === 85 || code === 86) return ['snow', t('Snow')];
  if (code >= 95) return ['storm', t('Thunderstorm')];
  return ['cloud', t('Cloudy')];
}
function wxSvg(k) {
  return (
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">' +
    WX_ICON[k] +
    '</svg>'
  );
}
function wxText(w) {
  return w && w.now ? w.now.temp + '° · ' + wxKind(w.now.code, w.now.day)[1] : '';
}
/* the weather of a card's place: what is known now (or null), asking the service when it is older than ten minutes */
function wxFor(o) {
  var lat = +o.lat,
    lon = +o.lon,
    unit = o.unit === 'f' ? 'f' : 'c';
  if (!isFinite(lat) || !isFinite(lon) || (o.lat === undefined && o.lon === undefined)) return null;
  var k = lat + ',' + lon + ',' + unit,
    e = WX[k] || (WX[k] = { w: null, at: 0, busy: false });
  if (!e.busy && Date.now() - e.at > 600000) {
    e.busy = true;
    api('/api/cards/weather', { lat: lat, lon: lon, unit: unit })
      .then(function (w) {
        e.busy = false;
        e.at = Date.now();
        if (w && w.now) {
          e.w = w;
          tickCards();
        }
      })
      .catch(function () {
        e.busy = false;
        e.at = Date.now() - 480000; /* try again in two minutes */
      });
  }
  if (e.w) WX_LAST = e.w;
  return e.w;
}
/* a template card's text: {{greeting}}, {{time}}, {{date}}, {{weekday}} filled in, then **bold**, *italic* and "# heading" lines */
function cardMarkup(src) {
  var vars = {
    greeting: greetText(''),
    time: timeText(),
    date: dateText(),
    weekday: dateText({ weekday: 'long' }),
    'weather.temp': WX_LAST && WX_LAST.now ? WX_LAST.now.temp + '\u00B0' : '',
    'weather.text': WX_LAST && WX_LAST.now ? wxKind(WX_LAST.now.code, WX_LAST.now.day)[1] : '',
  };
  var esc = function (x) {
    return String(x).replace(/[&<>"]/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c];
    });
  };
  return esc(String(src || '').slice(0, 1000))
    .replace(/\{\{\s*([\w.]+)\s*\}\}/g, function (m, k) {
      return k in vars ? esc(vars[k]) : '';
    })
    .split('\n')
    .map(function (l) {
      l = l.replace(/\*\*([^*]+)\*\*/g, '<b>$1</b>').replace(/\*([^*]+)\*/g, '<i>$1</i>');
      return /^#\s/.test(l) ? '<div class="hd">' + l.replace(/^#\s+/, '') + '</div>' : '<div>' + (l || '&nbsp;') + '</div>';
    })
    .join('');
}
var CARD_TYPES = {
  /* "Good morning" by the time of day, with an optional name and an optional second line (the date); set on the phone page */
  greeting: {
    name: function () {
      return t('Greeting');
    },
    draw: function (el, o) {
      var s = greetText(String(o.name || '').slice(0, 40)),
        l2 = o.line === 'date' ? dateText() : o.line === 'weather' ? wxText(WX_LAST) : '',
        key = s + '|' + l2;
      if (el._k === key) return;
      el._k = key;
      el.innerHTML = '<div class="l1"></div>' + (l2 ? '<div class="l2"></div>' : '');
      el.firstChild.textContent = s;
      if (l2) el.lastChild.textContent = l2;
    },
  },
  /* the weather now at a place chosen on the phone page, and with show: 'days' the next three days */
  weather: {
    name: function () {
      return t('Weather');
    },
    draw: function (el, o) {
      var w = wxFor(o),
        place = String(o.place || '').slice(0, 40),
        h;
      if (!w) h = '<div class="wx-none"></div>';
      else {
        var k = wxKind(w.now.code, w.now.day);
        h =
          '<div class="wx-now"><span class="wx-i">' +
          wxSvg(k[0]) +
          '</span><span class="wx-t">' +
          w.now.temp +
          '°</span></div><div class="wx-p"></div>';
        if (o.show === 'days')
          h +=
            '<div class="wx-days">' +
            (w.days || [])
              .slice(1, 4)
              .map(function (d) {
                var wd = '';
                try {
                  wd = new Date(d.date + 'T12:00:00').toLocaleDateString(LOC, { weekday: 'short' });
                } catch (e) {}
                return (
                  '<div><span>' +
                  wd +
                  '</span>' +
                  wxSvg(wxKind(d.code, true)[0]) +
                  '<b>' +
                  d.max +
                  '°</b> <small>' +
                  d.min +
                  '°</small></div>'
                );
              })
              .join('') +
            '</div>';
      }
      var key = h + '|' + place + (w ? w.at : '');
      if (el._k === key) return;
      el._k = key;
      el.innerHTML = h;
      var p = el.querySelector('.wx-p') || el.querySelector('.wx-none');
      p.textContent = w
        ? (place ? place + ' · ' : '') + wxKind(w.now.code, w.now.day)[1]
        : o.lat === undefined
          ? t('Choose a place from your phone')
          : place;
    },
  },
  /* text from the phone page, with what changes filled in */
  template: {
    name: function () {
      return t('Text');
    },
    draw: function (el, o) {
      var h = cardMarkup(o.text);
      if (el._k === h) return;
      el._k = h;
      el.innerHTML = h;
      el.setAttribute('data-size', o.size === 'small' || o.size === 'large' ? o.size : 'medium');
    },
  },
};
/* the usual slot ids have a name in every language; another id shows as it is */
function slotName(id) {
  var N = {
    greeting: t('Above the clock'),
    'clock-side': t('Beside the clock'),
    side: t('Right column'),
    row: t('Above the dock'),
  };
  return N[id] || id;
}
function cardFor(sl) {
  var c = (cfg.cards || {})[sl.id];
  if (c && c.type) return c.type === 'none' || !CARD_TYPES[c.type] ? null : c;
  return CARD_TYPES[sl.card] ? { type: sl.card } : null;
}
function drawCards() {
  var box = $('cards'),
    list = TH.slots || [];
  box.textContent = '';
  list.forEach(function (sl) {
    var c = cardFor(sl);
    if (!c) return;
    var el = document.createElement('div'),
      st = el.style;
    el.className = 'card card-' + c.type + (sl.keep ? ' keep' : '');
    el.setAttribute('data-align', sl.align || 'left');
    st.setProperty('--cl', sl.l);
    st.setProperty('--cr', sl.r);
    st.setProperty('--ct', sl.t);
    st.setProperty('--cb', sl.b);
    st.setProperty('--ctx', sl.tx);
    /* a centred card is placed from the right in a right-to-left language (rtl.css), so it moves the other way to its centre */
    if (sl.tx !== 'none') st.setProperty('--ctxr', 'translateX(50%)');
    st.width = sl.w;
    st.height = sl.h;
    el._card = c;
    box.appendChild(el);
  });
  tickCards();
}
/* the clock tick: cards that change with the time redraw themselves */
function tickCards() {
  /* weather cards first, so a text card or the greeting can use their weather */
  var els = $('cards').children,
    pass,
    i;
  for (pass = 0; pass < 2; pass++)
    for (i = 0; i < els.length; i++)
      if ((els[i]._card.type === 'weather') === (pass === 0)) CARD_TYPES[els[i]._card.type].draw(els[i], els[i]._card);
}
function setCard(id, type) {
  var c = {};
  for (var k in cfg.cards || {}) c[k] = cfg.cards[k];
  var old = c[id] || {};
  /* the options of a card stay when the same type is chosen again */
  c[id] = old.type === type ? old : { type: type };
  cfg.cards = c;
  saveCfg();
}
function cardsMenu() {
  openBuilt(t('Cards'), function () {
    var rows = (TH.slots || []).map(function (sl) {
      var c = cardFor(sl);
      return {
        label: slotName(sl.id),
        sub: c ? CARD_TYPES[c.type].name() : t('Empty'),
        stay: true,
        fn: function () {
          slotMenu(sl);
        },
      };
    });
    /* names, texts and the other options are typed on a phone page, opened from the manager app with a QR code */
    return rows.concat([
      { sep: true },
      {
        label: t('Set up from your phone'),
        sub: t('names, texts, card options'),
        fn: function () {
          launch('com.cleanyourtv.manager', { open: 'cards' });
        },
      },
    ]);
  });
}
function slotMenu(sl) {
  openBuilt(slotName(sl.id), function () {
    var c = cardFor(sl),
      cur = c ? c.type : 'none',
      rows = [
        {
          label: t('Empty'),
          sub: cur === 'none' ? t('Selected') : '',
          stay: true,
          fn: function () {
            setCard(sl.id, 'none');
          },
        },
      ];
    for (var k in CARD_TYPES)
      (function (k) {
        rows.push({
          label: CARD_TYPES[k].name(),
          sub: cur === k ? t('Selected') : '',
          stay: true,
          fn: function () {
            setCard(sl.id, k);
          },
        });
      })(k);
    return rows;
  });
}
