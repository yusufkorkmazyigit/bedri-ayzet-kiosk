/* Ortak yardımcılar, sabitler ve ikonlar. Tüm modüller window.BA altında yaşar. */
(function () {
  'use strict';
  var BA = (window.BA = window.BA || {});

  /* ------------------------------------------------------------ metin / veri */
  var ESC = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
  BA.esc = function (v) {
    return v == null ? '' : String(v).replace(/[&<>"']/g, function (c) { return ESC[c]; });
  };

  BA.uid = function () {
    return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
  };

  BA.clone = function (o) { return JSON.parse(JSON.stringify(o)); };

  BA.todayISO = function () {
    var d = new Date();
    return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate());
  };
  function pad(n) { return n < 10 ? '0' + n : '' + n; }

  var MONTHS = ['Oca', 'Şub', 'Mar', 'Nis', 'May', 'Haz', 'Tem', 'Ağu', 'Eyl', 'Eki', 'Kas', 'Ara'];
  var MONTHS_LONG = ['Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran', 'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'];
  var DAYS = ['Pazar', 'Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi'];

  /* "2026-09-24" → "24 Eyl 2026" (short) veya "24 Eyl" (noYear) */
  BA.fmtDate = function (iso, noYear) {
    if (!iso) return '—';
    var p = iso.split('-');
    var s = parseInt(p[2], 10) + ' ' + MONTHS[parseInt(p[1], 10) - 1];
    return noYear ? s : s + ' ' + p[0];
  };
  BA.fmtLongToday = function (d) {
    return d.getDate() + ' ' + MONTHS_LONG[d.getMonth()] + ' ' + DAYS[d.getDay()];
  };
  BA.fmtTime = function (d) { return pad(d.getHours()) + ':' + pad(d.getMinutes()); };

  /* "72,5" / "72.5" → 72.5 ; boş/geçersiz → null */
  BA.num = function (v) {
    if (v == null) return null;
    var s = String(v).trim().replace(',', '.');
    if (s === '') return null;
    var n = Number(s);
    return isFinite(n) ? n : null;
  };
  BA.fmtNum = function (n, digits) {
    if (n == null || !isFinite(n)) return '—';
    var d = digits == null ? 1 : digits;
    var s = (Math.round(n * Math.pow(10, d)) / Math.pow(10, d)).toString();
    return s.replace('.', ',');
  };

  /* Türkçe duyarlı küçük harf + aksan sadeleştirme (arama için) */
  BA.norm = function (s) {
    return String(s || '').toLocaleLowerCase('tr')
      .replace(/ç/g, 'c').replace(/ğ/g, 'g').replace(/ı/g, 'i')
      .replace(/ö/g, 'o').replace(/ş/g, 's').replace(/ü/g, 'u');
  };

  /* PIN özeti (FNV-1a). Kriptografik değil — kiosk düzeyinde koruma içindir. */
  BA.hash = function (str) {
    var h = 0x811c9dc5;
    str = 'bedri-ayzet:' + str;
    for (var i = 0; i < str.length; i++) {
      h ^= str.charCodeAt(i);
      h = (h + ((h << 1) + (h << 4) + (h << 7) + (h << 8) + (h << 24))) >>> 0;
    }
    return h.toString(16);
  };

  BA.debounce = function (fn, ms) {
    var t;
    return function () {
      var args = arguments, self = this;
      clearTimeout(t);
      t = setTimeout(function () { fn.apply(self, args); }, ms);
    };
  };

  BA.initials = function (name) {
    var p = String(name || '?').trim().split(/\s+/);
    return ((p[0] || '?').charAt(0) + (p.length > 1 ? p[p.length - 1].charAt(0) : '')).toLocaleUpperCase('tr');
  };

  /* ------------------------------------------------------------ sabitler */

  BA.REGIONS = [
    { id: 'gogus',   name: 'Göğüs',        hint: 'Pectoral kasları',       icon: 'chest' },
    { id: 'sirt',    name: 'Sırt',         hint: 'Lat, trapez, bel',       icon: 'back' },
    { id: 'omuz',    name: 'Omuz',         hint: 'Ön, yan ve arka deltoid', icon: 'shoulder' },
    { id: 'kol',     name: 'Kol',          hint: 'Biceps & triceps',       icon: 'arm' },
    { id: 'bacak',   name: 'Bacak',        hint: 'Quadriceps, hamstring',  icon: 'leg' },
    { id: 'kalca',   name: 'Kalça',        hint: 'Gluteus kasları',        icon: 'glute' },
    { id: 'karin',   name: 'Karın & Core', hint: 'Merkez bölge dengesi',   icon: 'core' },
    { id: 'kardiyo', name: 'Kardiyo',      hint: 'Isınma ve dayanıklılık', icon: 'cardio' }
  ];
  BA.regionById = function (id) {
    for (var i = 0; i < BA.REGIONS.length; i++) if (BA.REGIONS[i].id === id) return BA.REGIONS[i];
    return { id: id, name: id, icon: 'dumbbell' };
  };

  /* dir: +1 artış iyi, -1 azalış iyi, 0 nötr, 'goal' hedefe göre */
  BA.METRICS = [
    { key: 'weight',   label: 'Kilo',         unit: 'kg', dir: 'goal' },
    { key: 'height',   label: 'Boy',          unit: 'cm', dir: 0, noChart: true },
    { key: 'waist',    label: 'Bel çevresi',  unit: 'cm', dir: -1 },
    { key: 'chest',    label: 'Göğüs çevresi', unit: 'cm', dir: 0 },
    { key: 'arm',      label: 'Kol çevresi',  unit: 'cm', dir: 1 },
    { key: 'hip',      label: 'Kalça çevresi', unit: 'cm', dir: 0 },
    { key: 'thigh',    label: 'Bacak çevresi', unit: 'cm', dir: 0 },
    { key: 'fat',      label: 'Yağ oranı',    unit: '%',  dir: -1 }
  ];

  BA.GOALS = ['Kilo verme', 'Kas kazanımı', 'Kondisyon', 'Genel sağlık'];
  BA.LEVELS = ['Başlangıç', 'Orta', 'İleri'];

  /* ------------------------------------------------------------ ikonlar (inline SVG, 24×24, stroke) */
  var P = {
    user: '<circle cx="12" cy="8" r="4"/><path d="M4 21c0-4.4 3.6-7 8-7s8 2.6 8 7"/>',
    whistle: '<path d="M3 11a5 5 0 1 0 10 0h8V7H9"/><circle cx="8" cy="11" r="1.5"/><path d="M13 7V4"/>',
    back: '<path d="M15 18l-6-6 6-6"/>',
    arrow: '<path d="M5 12h14M13 6l6 6-6 6"/>',
    play: '<path d="M8 5.5v13l11-6.5z" fill="currentColor" stroke="none"/>',
    close: '<path d="M6 6l12 12M18 6L6 18"/>',
    plus: '<path d="M12 5v14M5 12h14"/>',
    edit: '<path d="M4 20h4L19 9l-4-4L4 16z"/><path d="M13.5 6.5l4 4"/>',
    trash: '<path d="M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3"/>',
    up: '<path d="M6 15l6-6 6 6"/>',
    down: '<path d="M6 9l6 6 6-6"/>',
    logout: '<path d="M15 4h4v16h-4M10 17l5-5-5-5M15 12H3"/>',
    search: '<circle cx="11" cy="11" r="7"/><path d="M20 20l-4-4"/>',
    users: '<circle cx="9" cy="8" r="3.5"/><path d="M2.5 20c0-3.8 2.9-6 6.5-6s6.5 2.2 6.5 6"/><path d="M16 4.5a3.5 3.5 0 0 1 0 7M18 14c2.2.6 3.5 2.6 3.5 6"/>',
    list: '<path d="M9 6h11M9 12h11M9 18h11"/><circle cx="4.5" cy="6" r="1"/><circle cx="4.5" cy="12" r="1"/><circle cx="4.5" cy="18" r="1"/>',
    film: '<rect x="3" y="4" width="18" height="16" rx="2"/><path d="M7 4v16M17 4v16M3 9h4M3 15h4M17 9h4M17 15h4"/>',
    gear: '<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z"/>',
    ruler: '<path d="M3 17L17 3l4 4L7 21z"/><path d="M7 13l2 2M10 10l2 2M13 7l2 2"/>',
    check: '<path d="M5 12.5l4.5 4.5L19 7.5"/>',
    backspace: '<path d="M9 5h11v14H9l-6-7z"/><path d="M12 9l6 6M18 9l-6 6"/>',
    keyboard: '<rect x="2" y="6" width="20" height="12" rx="2"/><path d="M6 10h.01M10 10h.01M14 10h.01M18 10h.01M7 14h10"/>',
    upload: '<path d="M12 16V4M6 10l6-6 6 6M4 20h16"/>',
    download: '<path d="M12 4v12M6 10l6 6 6-6M4 20h16"/>',
    copy: '<rect x="8" y="8" width="12" height="12" rx="2"/><path d="M16 8V4H4v12h4"/>',
    clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
    dumbbell: '<path d="M2 12h3M19 12h3M5 8v8M19 8v8M8 6v12M16 6v12M8 12h8"/>',
    /* bölge ikonları */
    chest: '<path d="M12 5v14"/><path d="M12 7c-2-1.5-6-1.5-8 .5 0 5 2.5 8 8 8"/><path d="M12 7c2-1.5 6-1.5 8 .5 0 5-2.5 8-8 8"/>',
    shoulder: '<circle cx="12" cy="5" r="2.2"/><path d="M4 12c0-3 2.5-4.5 5-4.5h6c2.5 0 5 1.5 5 4.5"/><path d="M6 12v7M18 12v7M9 8v11h6V8"/>',
    arm: '<path d="M4 18c1-5 3-8 6-9l3-4 3 1-2 4c3 0 5 2 6 5-2 2-5 3-8 3H4z"/>',
    leg: '<path d="M9 2v7c0 3-1 6-1 9v4h4v-4c0-2 1-4 1-6"/><path d="M15 2v6c0 2-1 4-1 6"/>',
    glute: '<path d="M4 6c0 7 2 12 8 12s8-5 8-12"/><path d="M12 9v9"/><path d="M4 6h16"/>',
    core: '<rect x="6" y="3" width="12" height="18" rx="4"/><path d="M12 3v18M6 9h12M6 15h12"/>',
    cardio: '<path d="M12 20s-8-4.8-8-10.5A4.5 4.5 0 0 1 12 7a4.5 4.5 0 0 1 8 2.5C20 15.2 12 20 12 20z"/><path d="M4.5 12h4l1.5-3 2.5 6 1.5-3h5"/>'
  };
  /* "back" geri oku; sırt bölgesinin ikonu ayrı tutulur: */
  var REGION_BACK = '<path d="M12 3v18"/><path d="M5 5c2 1 5 1.5 7 1.5S17 6 19 5l-2 9-5 3-5-3z"/>';

  BA.icon = function (name, cls) {
    var body = name === 'back-region' ? REGION_BACK : (P[name] || P.dumbbell);
    return '<svg class="ico ' + (cls || '') + '" viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">' + body + '</svg>';
  };
  BA.regionIcon = function (region, cls) {
    return BA.icon(region.id === 'sirt' ? 'back-region' : region.icon, cls);
  };
})();
