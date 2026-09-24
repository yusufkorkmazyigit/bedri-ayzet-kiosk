/* Dokunmatik kiosklar için hafif Türkçe Q ekran klavyesi.
   Ayarlar → "Ekran klavyesi": otomatik (dokunmatik algılanırsa) / açık / kapalı. */
(function () {
  'use strict';
  var BA = window.BA;

  var ROWS = [
    ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0'],
    ['q', 'w', 'e', 'r', 't', 'y', 'u', 'ı', 'o', 'p', 'ğ', 'ü'],
    ['a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l', 'ş', 'i'],
    ['⇧', 'z', 'x', 'c', 'v', 'b', 'n', 'm', 'ö', 'ç', '⌫'],
    ['-', '@', ' ', '.', ',', '✓']
  ];
  var NUM = [['7', '8', '9'], ['4', '5', '6'], ['1', '2', '3'], [',', '0', '⌫'], ['✓']];

  var kb = { el: null, target: null, shift: false, mode: null };

  function enabled() {
    var s = BA.store && BA.store.db ? BA.store.db.settings.osk : 'auto';
    if (s === 'on') return true;
    if (s === 'off') return false;
    return navigator.maxTouchPoints > 0 || 'ontouchstart' in window;
  }

  function isTextInput(el) {
    return el && ((el.tagName === 'INPUT' && el.type === 'text') || el.tagName === 'TEXTAREA') && !el.readOnly;
  }

  function build(mode) {
    var rows = mode === 'num' ? NUM : ROWS;
    kb.el.className = 'osk osk--' + mode + (kb.shift ? ' is-shift' : '');
    kb.el.innerHTML = '<div class="osk__inner">' + rows.map(function (r) {
      return '<div class="osk__row">' + r.map(function (k) {
        var cls = 'osk__key';
        var label = kb.shift && k.length === 1 && /\S/.test(k) ? k.toLocaleUpperCase('tr') : k;
        if (k === ' ') { cls += ' osk__key--space'; label = 'boşluk'; }
        if (k === '⇧') cls += ' osk__key--fn' + (kb.shift ? ' is-on' : '');
        if (k === '⌫') { cls += ' osk__key--fn'; label = BA.icon('backspace'); }
        if (k === '✓') { cls += ' osk__key--ok'; label = 'Tamam'; }
        return '<button type="button" class="' + cls + '" data-k="' + BA.esc(k) + '">' + label + '</button>';
      }).join('') + '</div>';
    }).join('') + '</div>';
    kb.mode = mode;
  }

  function insert(text) {
    var t = kb.target;
    if (!t) return;
    var s = t.selectionStart == null ? t.value.length : t.selectionStart;
    var e = t.selectionEnd == null ? t.value.length : t.selectionEnd;
    if (t.maxLength > 0 && t.value.length - (e - s) + text.length > t.maxLength) return;
    t.setRangeText(text, s, e, 'end');
    t.dispatchEvent(new Event('input', { bubbles: true }));
  }

  function backspace() {
    var t = kb.target;
    if (!t) return;
    var s = t.selectionStart, e = t.selectionEnd;
    if (s === e && s > 0) s--;
    t.setRangeText('', s, e, 'end');
    t.dispatchEvent(new Event('input', { bubbles: true }));
  }

  function onKey(ev) {
    var b = ev.target.closest('[data-k]');
    ev.preventDefault(); // odağı input'ta tut
    if (!b) return;
    var k = b.getAttribute('data-k');
    if (k === '⇧') { kb.shift = !kb.shift; build(kb.mode); return; }
    if (k === '⌫') return backspace();
    if (k === '✓') { if (kb.target) kb.target.blur(); kb.hide(); return; }
    insert(kb.shift ? k.toLocaleUpperCase('tr') : k);
    if (kb.shift) { kb.shift = false; build(kb.mode); }
  }

  kb.show = function (target) {
    if (!kb.el) {
      kb.el = document.createElement('div');
      kb.el.addEventListener('pointerdown', onKey);
      kb.el.addEventListener('mousedown', function (e) { e.preventDefault(); });
      document.body.appendChild(kb.el);
    }
    kb.target = target;
    var mode = target.getAttribute('data-kb') === 'num' ? 'num' : 'text';
    if (mode !== kb.mode || !kb.el.firstChild) { kb.shift = false; build(mode); }
    kb.el.hidden = false;
    document.body.classList.add('osk-open');
    // input klavyenin altında kalmasın
    setTimeout(function () { if (target.scrollIntoView) target.scrollIntoView({ block: 'center' }); }, 30);
  };

  kb.hide = function () {
    if (!kb.el) return;
    kb.el.hidden = true;
    kb.target = null;
    document.body.classList.remove('osk-open');
  };

  document.addEventListener('focusin', function (e) {
    if (isTextInput(e.target) && enabled()) kb.show(e.target);
  });
  document.addEventListener('focusout', function () {
    setTimeout(function () { if (!isTextInput(document.activeElement)) kb.hide(); }, 60);
  });

  BA.keyboard = kb;
})();
