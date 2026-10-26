function aiHelp() {
  return 'Chat with a language model through OpenRouter. Run these on the TV (ssh):\n\ncurl -X POST localhost:8765/api/voice/set -d \'{"llm":{"key":"sk-or-...","model":"openrouter/auto"}}\'\ncurl -X POST localhost:8765/api/voice/set -d \'{"llm":{"enabled":true}}\'\n\nOptional: "system" sets the instructions. Ask by text from anywhere on the TV:\ncurl -X POST localhost:8765/api/voice/ask -d \'{"text":"What is the capital of Peru?"}\'\n\nSpoken and typed questions go to OpenRouter and the model you chose; no audio does. The key stays on the TV.\n\nHome Assistant (Assist), with a long-lived access token:\ncurl -X POST localhost:8765/api/voice/set -d \'{"ha":{"url":"http://homeassistant.local:8123","token":"..."}}\'\nOptional: "route" is ha-first, ha-only or ai-only; "selfSigned":true accepts a self-signed certificate; "agent" is a conversation entity.';
}
function liveRefresh() {
  api('/api/live/status').then(
    function (r) {
      lv = r;
      if (view === 'livetv') {
        build();
        if (idx >= rows.length) idx = 0;
        draw();
      }
    },
    function () {}
  );
}
function openNotifyQr() {
  if (!napi || !napi.enabled) {
    banner('Switch notifications on first', 'err');
    return;
  }
  shareMode = 'notify';
  push('share');
  $('share').style.display = 'block';
  $('shareurl').textContent = '';
  $('qrbox').style.visibility = 'hidden';
  $('share').querySelector('h2').textContent = 'Notification address and token';
  $('share').querySelector('ol').innerHTML =
    '<li>Phone on the <b>same Wi-Fi</b> as the TV.</li><li>Scan the code with the camera and open the page: it shows the address and the token with <b>Copy</b> buttons.</li><li>The token is a <b>secret</b>: anyone who sees this code while it is open can read it.</li>';
  $('sharemsg').textContent = 'Preparing\u2026';
  api('/api/manager/notify-api', { page: true }).then(
    function (r) {
      if (view !== 'share') return;
      if (!r.pageUrl) {
        $('sharemsg').textContent = 'The notification listener is not running.';
        return;
      }
      drawQr(r.pageUrl);
      $('qrbox').style.visibility = 'visible';
      $('shareurl').textContent = r.pageUrl;
      $('sharemsg').textContent =
        'The page opens for ten minutes. It is not encrypted: the token travels over your Wi-Fi, so use a network you trust.';
    },
    function () {
      $('sharemsg').textContent = 'The service did not answer.';
    }
  );
}
function openLiveTv() {
  api('/api/live/status').then(
    function (r) {
      lv = r;
      push('livetv');
    },
    function () {
      lv = null;
      push('livetv');
    }
  );
}
/* Wallpapers: photos uploaded from a phone and synced from Immich (helper/wallpapers.js); the launcher's Customise switches them on */
function openWallpapers() {
  api('/api/wallpapers/status').then(
    function (r) {
      wp = r;
      if (view !== 'wallpapers') push('wallpapers');
      else {
        build();
        draw();
      }
      if (r.immich && r.immich.state === 'syncing') setTimeout(wallRefresh, 3000);
    },
    function () {
      banner('The service did not answer', 'err');
    }
  );
}
function wallRefresh() {
  if (view === 'wallpapers') openWallpapers();
}
function wallCall(path, b, msg) {
  api(path, b || {}).then(
    function (r) {
      wp = r;
      if (msg) banner(msg, 'ok');
      if (view !== 'wallpapers') pop();
      else {
        build();
        draw();
      }
      if (r.immich && r.immich.state === 'syncing') setTimeout(wallRefresh, 3000);
    },
    function () {
      banner('The service did not answer', 'err');
    }
  );
}
function openWallPair() {
  shareMode = 'wall';
  push('share');
  $('share').style.display = 'block';
  $('shareurl').textContent = '';
  $('qrbox').style.visibility = 'hidden';
  $('share').querySelector('h2').textContent = 'Wallpapers';
  $('share').querySelector('ol').innerHTML =
    '<li>Phone on the <b>same Wi-Fi</b> as the TV.</li><li>Scan the code with the camera.</li><li>Choose <b>Upload photos</b> or <b>Configure Immich</b>.</li>';
  $('sharemsg').textContent = 'Preparing\u2026';
  api('/api/wallpapers/pair', {}).then(
    function (r) {
      if (view !== 'share' || shareMode !== 'wall') return;
      if (r.error) {
        $('sharemsg').textContent = r.error;
        return;
      }
      drawQr(r.qr);
      $('qrbox').style.visibility = 'visible';
      $('shareurl').textContent = r.url + '   code ' + r.code;
      $('sharemsg').textContent =
        'The page stays open while you use it, at most an hour. It is not encrypted: your photos and the Immich key travel over your Wi-Fi.';
    },
    function () {
      $('sharemsg').textContent = 'The service did not answer.';
    }
  );
}
function openLivePair() {
  shareMode = 'live';
  push('share');
  $('share').style.display = 'block';
  $('shareurl').textContent = '';
  $('qrbox').style.visibility = 'hidden';
  $('share').querySelector('h2').textContent = 'Set up Live TV';
  $('share').querySelector('ol').innerHTML =
    '<li>Phone on the <b>same Wi-Fi</b> as the TV.</li><li>Scan the code with the camera.</li><li>Enter the <b>code</b> below and your playlist address.</li>';
  $('sharemsg').textContent = 'Preparing\u2026';
  api('/api/live/pair', {}).then(
    function (r) {
      if (view !== 'share') return;
      drawQr(r.url);
      $('qrbox').style.visibility = 'visible';
      $('shareurl').textContent = r.url + '   code ' + r.code;
      $('sharemsg').textContent =
        'The page stays open for ten minutes. It is not encrypted: the playlist address, which may hold an access key, travels over your Wi-Fi.';
      (function poll(n) {
        if (view !== 'share' || shareMode !== 'live') return;
        api('/api/live/status').then(
          function (s2) {
            if (s2.configured && (!lv || !lv.configured || s2.channels !== lv.channels)) {
              lv = s2;
              closeShare();
              banner('Playlist saved', 'ok');
              return;
            }
            if (n < 300)
              setTimeout(function () {
                poll(n + 1);
              }, 2000);
          },
          function () {
            setTimeout(function () {
              poll(n + 1);
            }, 3000);
          }
        );
      })(0);
    },
    function () {
      $('sharemsg').textContent = 'The service did not answer.';
    }
  );
}
function openChannel() {
  banner('Looking for the dev build\u2026', 'work');
  api('/api/manager/tests').then(
    function (r) {
      banner('');
      tst = r;
      push('channel');
      for (var k = 0; k < rows.length; k++)
        if (rows[k].sub && /^selected/.test(rows[k].sub)) {
          idx = k;
          draw();
          break;
        }
    },
    function () {
      banner('The service did not answer', 'err');
    }
  );
}
function setChannel(tag) {
  banner('Switching\u2026', 'work');
  api('/api/manager/channel', { tag: tag }).then(
    function (s) {
      if (s.error) {
        banner(s.error, 'err');
        return;
      }
      st = s;
      pop();
      banner(
        tag
          ? 'Following the dev builds. If the Launcher or Service row offers an update, that is the dev build.'
          : 'Back on the stable releases',
        'ok'
      );
    },
    function () {
      banner('The service did not answer', 'err');
    }
  );
}
function openModels() {
  banner('Loading the model list\u2026', 'work');
  api('/api/voice/models').then(
    function (r) {
      if (r.error) {
        banner(r.error, 'err');
        return;
      }
      banner('');
      mdl = [{ id: 'openrouter/auto', name: 'Auto (OpenRouter picks)', price: null }].concat(r.picks);
      var cur = ((vo || {}).llm || {}).model;
      if (
        cur &&
        !mdl.some(function (x) {
          return x.id === cur;
        })
      )
        mdl.splice(1, 0, { id: cur, name: cur, price: null });
      push('models');
      for (var k = 0; k < rows.length; k++)
        if (rows[k].sub && /selected$/.test(rows[k].sub)) {
          idx = k;
          draw();
          break;
        }
    },
    function () {
      banner('The service did not answer', 'err');
    }
  );
}
function haTest() {
  banner('Asking Home Assistant\u2026', 'work');
  api('/api/voice/ha-test', {}).then(
    function (r) {
      if (r.error) {
        banner(r.error, 'err');
        return;
      }
      banner('Connected to ' + (r.name || 'Home Assistant') + (r.version ? ' ' + r.version : ''), 'ok');
    },
    function () {
      banner('The service did not answer', 'err');
    }
  );
}
function openAgents() {
  banner('Asking Home Assistant\u2026', 'work');
  api('/api/voice/ha-agents').then(
    function (r) {
      if (r.error) {
        banner(r.error, 'err');
        return;
      }
      banner('');
      agl = r.agents || [];
      push('agents');
      var cur = ((vo || {}).ha || {}).agent;
      for (var k = 0; k < rows.length; k++)
        if (rows[k].sub && /selected$/.test(rows[k].sub)) {
          idx = k;
          draw();
          break;
        }
    },
    function () {
      banner('The service did not answer', 'err');
    }
  );
}
function pickAgent(id) {
  api('/api/voice/set', { ha: { agent: id } }).then(
    function (x) {
      if (x.error) {
        banner(x.error, 'err');
        return;
      }
      vo = x;
      banner(id ? 'Agent: ' + id : 'Default agent', 'ok');
      pop();
    },
    function () {
      banner('The service did not answer', 'err');
    }
  );
}
function pickModel(id) {
  api('/api/voice/set', { llm: { model: id } }).then(
    function (x) {
      if (x.error) {
        banner(x.error, 'err');
        return;
      }
      vo = x;
      banner('Model: ' + id, 'ok');
      pop();
    },
    function () {
      banner('The service did not answer', 'err');
    }
  );
}
function openPair() {
  shareMode = 'pair';
  pairBase = (vo && vo.pairedAt) || 0;
  push('share');
  $('share').style.display = 'block';
  $('shareurl').textContent = '';
  $('qrbox').style.visibility = 'hidden';
  $('share').querySelector('h2').textContent = 'Set up from your phone';
  $('share').querySelector('ol').innerHTML =
    '<li>Phone on the <b>same Wi-Fi</b> as the TV.</li><li>Scan the code with the camera.</li><li>Enter your <b>OpenRouter key</b> and model, or your <b>Home Assistant</b> address and access token, and tap <b>Save</b>.</li>';
  $('sharemsg').textContent = 'Preparing\u2026';
  api('/api/voice/pair', {}).then(
    function (r) {
      if (view !== 'share') return;
      drawQr(r.url);
      $('qrbox').style.visibility = 'visible';
      $('shareurl').textContent = r.url;
      $('sharemsg').textContent =
        'The page stays open for ten minutes, or until you save. It is not encrypted: the key travels over your Wi-Fi, so use a network you trust.';
      pollPair(0);
    },
    function () {
      $('sharemsg').textContent = 'The service did not answer.';
    }
  );
}
function pollPair(n) {
  if (view !== 'share' || shareMode !== 'pair') return;
  api('/api/voice/status').then(
    function (v) {
      if (v.pairedAt > pairBase) {
        vo = v;
        closeShare();
        banner('Saved', 'ok');
        return;
      }
      if (!v.pairing && n > 1) {
        $('sharemsg').textContent = 'The page has closed. Close this and try again.';
        return;
      }
      setTimeout(function () {
        pollPair(n + 1);
      }, 2000);
    },
    function () {
      setTimeout(function () {
        pollPair(n + 1);
      }, 3000);
    }
  );
}
function voiceRefresh() {
  clearTimeout(pollT);
  api('/api/voice/status').then(
    function (v) {
      vo = v;
      var j = v.job || {};
      if (j.state === 'working') banner(j.message, 'work');
      else if (j.state === 'error') banner(j.message, 'err');
      else if (v.listening) banner('Listening…', 'work');
      else banner('');
      if (view === 'voice') {
        build();
        if (idx >= rows.length) idx = 0;
        draw();
      }
      if (j.state === 'working' || v.listening) pollT = setTimeout(voiceRefresh, 1000);
      else
        api('/api/manager/status').then(function (s) {
          st = s;
        });
    },
    function () {
      pollT = setTimeout(voiceRefresh, 2000);
    }
  );
}
