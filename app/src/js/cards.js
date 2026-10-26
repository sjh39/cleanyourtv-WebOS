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
/* a template card's text: {{greeting}}, {{time}}, {{date}}, {{weekday}} filled in, then **bold**, *italic* and "# heading" lines */
function cardMarkup(src) {
  var vars = { greeting: greetText(''), time: timeText(), date: dateText(), weekday: dateText({ weekday: 'long' }) };
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
        l2 = o.line === 'date' ? dateText() : '',
        key = s + '|' + l2;
      if (el._k === key) return;
      el._k = key;
      el.innerHTML = '<div class="l1"></div>' + (l2 ? '<div class="l2"></div>' : '');
      el.firstChild.textContent = s;
      if (l2) el.lastChild.textContent = l2;
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
    CARD_TYPES[c.type].draw(el, c);
  });
}
/* the clock tick: cards that change with the time redraw themselves */
function tickCards() {
  var els = $('cards').children;
  for (var i = 0; i < els.length; i++) CARD_TYPES[els[i]._card.type].draw(els[i], els[i]._card);
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
