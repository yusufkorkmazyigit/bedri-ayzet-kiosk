/* Gelişim hesapları ve görselleri (v1.5).
   Değişimler nötr gösterilir: ▲/▼ + fark; "iyi/kötü" yorumu yapılmaz,
   çünkü hangi yönün hedef olduğu üyeden üyeye değişir. */
(function () {
  'use strict';
  var BA = window.BA, esc = BA.esc;

  var PERIODS = [
    { key: 'all',  label: 'Başlangıçtan' },
    { key: '3m',   label: 'Son 3 ay' },
    { key: 'last', label: 'Son ölçümden' }
  ];
  /* Vücut haritası: anatomik kas çizimi (img/body) + seçili bölge için hazır parlama katmanı.
     Koordinatlar çizime göre normalize (0–1); viewBox 500×420, figür ortada. */
  var VW = 500, VH = 420, FH = 420, FW = FH * 478 / 900, FX = (VW - FW) / 2, LX = 126, RX = 374;
  var MAP = [
    { key: 'arm',   side: 'l', ly: 70,  nx: .26, ny: .29 },
    { key: 'waist', side: 'l', ly: 170, nx: .38, ny: .33 },
    { key: 'thigh', side: 'l', ly: 280, nx: .37, ny: .58 },
    { key: 'chest', side: 'r', ly: 90,  nx: .62, ny: .22 },
    { key: 'hip',   side: 'r', ly: 200, nx: .64, ny: .44 }
  ];
  /* Parlama görsellerinin çizim içindeki yeri: [sol, üst, genişlik, yükseklik] (0–1) */
  var HL = {
    chest: [.3067, .1655, .3902, .1211], waist: [.3222, .2575, .358, .1585], hip: [.3091, .3887, .3795, .1243],
    arm: [.1802, .2118, .6408, .1541], thigh: [.2828, .4667, .4308, .2207]
  };
  /* Dokunma alanları (normalize çokgenler) */
  var HIT = {
    chest: ['.335,.200 .401,.179 .5,.176 .599,.179 .666,.200 .675,.235 .658,.270 .568,.276 .5,.268 .432,.276 .344,.270 .327,.235'],
    waist: ['.344,.270 .432,.276 .5,.268 .568,.276 .658,.270 .649,.336 .652,.400 .5,.405 .348,.400 .351,.336'],
    hip: ['.348,.400 .5,.405 .652,.400 .685,.431 .702,.482 .622,.477 .532,.500 .5,.502 .468,.500 .378,.477 .298,.482 .315,.431'],
    arm: ['.228,.222 .332,.227 .327,.273 .312,.311 .296,.354 .203,.354 .198,.298 .21,.254',
          '.772,.222 .668,.227 .673,.273 .688,.311 .704,.354 .797,.354 .802,.298 .79,.254'],
    thigh: ['.298,.482 .378,.477 .468,.500 .496,.514 .494,.590 .475,.653 .446,.675 .371,.675 .327,.641 .294,.564 .284,.514',
            '.702,.482 .622,.477 .532,.500 .504,.514 .506,.590 .525,.653 .554,.675 .629,.675 .673,.641 .706,.564 .716,.514']
  };

  BA.progress = {
    PERIODS: PERIODS,
    MAP_KEYS: MAP.map(function (r) { return r.key; }),

    short: function (d) { return String(d.label).replace(' çevresi', ''); },

    /* Ölçüm dizisi (tarihe göre sıralı) + dönem → { key: {from,to,fromDate,toDate,delta,pct} } */
    compute: function (ms, period) {
      var out = {}, cut = BA.addDays(BA.todayISO(), -90);
      BA.METRICS.forEach(function (d) {
        var s = series(ms, d.key);
        if (!s.length) return;
        var to = s[s.length - 1], from = s[0];
        if (period === 'last') from = s.length > 1 ? s[s.length - 2] : to;
        else if (period === '3m') {
          for (var i = s.length - 1; i >= 0; i--) if (s[i].date <= cut) { from = s[i]; break; }
        }
        var same = from === to;
        out[d.key] = {
          def: d, from: from.value, to: to.value, fromDate: from.date, toDate: to.date,
          delta: same ? null : to.value - from.value,
          pct: same || !from.value ? null : (to.value - from.value) / from.value * 100,
          series: s.filter(function (p) { return p.date >= from.date; })
        };
      });
      return out;
    },

    series: series,

    /* "12 günde", "5 haftada", "3 ayda" */
    span: function (a, b) {
      var da = BA.parseISO(a), db = BA.parseISO(b);
      if (!da || !db) return '';
      var n = Math.round((db - da) / 864e5);
      if (n < 1) return 'aynı gün';
      if (n < 14) return n + ' günde';
      if (n < 60) return Math.round(n / 7) + ' haftada';
      if (n < 548) return Math.round(n / 30.4) + ' ayda';
      return BA.fmtNum(n / 365, 1) + ' yılda';
    },

    /* "+3 cm" / "−1,5 kg" / "değişmedi" */
    deltaText: function (delta, unit) {
      if (delta == null) return '';
      if (Math.abs(delta) < 0.05) return 'değişmedi';
      return (delta > 0 ? '+' : '−') + BA.fmtNum(Math.abs(delta)) + (unit ? ' ' + unit : '');
    },

    /* Nötr fark rozeti */
    deltaHtml: function (it) {
      if (!it || it.delta == null) return '<span class="delta">ilk ölçüm</span>';
      if (Math.abs(it.delta) < 0.05) return '<span class="delta">değişmedi</span>';
      return '<span class="delta delta--chg">' + (it.delta > 0 ? '▲ ' : '▼ ') + BA.progress.deltaText(it.delta, it.def.unit) + '</span>';
    },

    /* Özet cümlesi: en çok değişen (yüzde olarak) 4 ölçü */
    summary: function (prog) {
      var items = Object.keys(prog).map(function (k) { return prog[k]; })
        .filter(function (it) { return !it.def.noChart && it.delta != null && Math.abs(it.delta) >= 0.05; })
        .sort(function (a, b) { return Math.abs(b.pct || 0) - Math.abs(a.pct || 0); });
      if (!items.length) return '';
      var a = items.reduce(function (m, it) { return it.fromDate < m ? it.fromDate : m; }, items[0].fromDate);
      var b = items.reduce(function (m, it) { return it.toDate > m ? it.toDate : m; }, items[0].toDate);
      return '<p class="psum"><b>' + esc(BA.progress.span(a, b)) + ':</b> ' + items.slice(0, 4).map(function (it) {
        return '<span>' + esc(BA.progress.short(it.def)) + ' <i>' + BA.progress.deltaText(it.delta, it.def.unit) + '</i></span>';
      }).join('<em>·</em>') + '</p>';
    },

    /* Dönem seçici */
    periodSeg: function (period, act) {
      return '<div class="seg" role="tablist">' + PERIODS.map(function (p) {
        return '<button class="seg__b' + (p.key === period ? ' is-on' : '') + '" data-act="' + (act || 'period') + '" data-p="' + p.key + '">' + p.label + '</button>';
      }).join('') + '</div>';
    },

    /* Vücut haritası: kas çizimi + etiketler. Etikete/bölgeye dokununca data-act="metric". */
    bodyMap: function (prog, selected) {
      var on = function (k) { return (k === selected ? ' is-on' : ''); };
      var lines = '', labels = '', hits = '';
      MAP.forEach(function (r) {
        var it = prog[r.key];
        if (!it) return;
        var ax = (FX + r.nx * FW).toFixed(1), ay = (r.ny * FH).toFixed(1);
        var ex = r.side === 'l' ? LX : RX, bend = r.side === 'l' ? LX + 14 : RX - 14;
        lines += '<polyline class="bm__lead' + on(r.key) + '" points="' + ex + ',' + r.ly + ' ' + bend + ',' + r.ly + ' ' + ax + ',' + ay + '"/>' +
          '<circle class="bm__pin' + on(r.key) + '" cx="' + ax + '" cy="' + ay + '" r="3.5"/>';
        hits += HIT[r.key].map(function (pts) {
          return '<polygon class="bm__hit" data-act="metric" data-k="' + r.key + '" points="' + pts + '"/>';
        }).join('');
        var pos = r.side === 'l' ? 'right:' + pct(VW - LX, VW) : 'left:' + pct(RX, VW);
        labels += '<button class="bm__lbl bm__lbl--' + r.side + on(r.key) + '" style="' + pos + ';top:' + pct(r.ly, VH) + '" data-act="metric" data-k="' + r.key + '">' +
          '<small>' + esc(BA.progress.short(it.def)) + '</small>' +
          '<b>' + BA.fmtNum(it.to) + '<i> ' + it.def.unit + '</i></b>' +
          BA.progress.deltaHtml(it) + '</button>';
      });
      var box = function (l, t, w, h) {
        return 'left:' + pct(FX + l * FW, VW) + ';top:' + pct(t * FH, VH) + ';width:' + pct(w * FW, VW) + ';height:' + pct(h * FH, VH);
      };
      var hl = HL[selected] ? '<img class="bm__hl" src="img/body/hl-' + selected + '.webp" alt="" style="' + box.apply(null, HL[selected]) + '">' : '';
      return '<div class="bm">' +
        '<img class="bm__img" src="img/body/body-m.webp" alt="" style="' + box(0, 0, 1, 1) + '">' + hl +
        '<svg class="bm__svg" viewBox="0 0 ' + VW + ' ' + VH + '" preserveAspectRatio="none" aria-hidden="true">' +
          '<g>' + lines + '</g>' +
          '<g transform="translate(' + FX.toFixed(2) + ' 0) scale(' + FW.toFixed(2) + ' ' + FH + ')">' + hits + '</g></svg>' + labels + '</div>';
    },

    /* Eğitmen ekranı: ortadan ayrışan yüzde çubukları + "35 → 38 cm (+3)" */
    bars: function (prog) {
      var items = BA.METRICS.filter(function (d) { return !d.noChart && prog[d.key]; }).map(function (d) { return prog[d.key]; });
      if (!items.length) return '';
      var maxp = items.reduce(function (m, it) { return Math.max(m, Math.abs(it.pct || 0)); }, 0) || 1;
      return '<div class="dbars">' + items.map(function (it) {
        var w = it.pct == null ? 0 : Math.max(2, Math.abs(it.pct) / maxp * 100);
        var side = it.delta > 0 ? 'r' : 'l';
        var txt = it.delta == null ? BA.fmtNum(it.to) + ' ' + it.def.unit + ' <small>(tek ölçüm)</small>' :
          BA.fmtNum(it.from) + ' → ' + BA.fmtNum(it.to) + ' ' + it.def.unit +
          ' <small>(' + BA.progress.deltaText(it.delta, '') + (it.pct != null && it.def.unit !== '%' && Math.abs(it.delta) >= 0.05 ? ' · ' + (it.pct > 0 ? '+' : '−') + BA.fmtNum(Math.abs(it.pct)) + '%' : '') + ')</small>';
        return '<div class="dbar"><span class="dbar__lbl">' + esc(BA.progress.short(it.def)) + '</span>' +
          '<span class="dbar__track"><i class="dbar__fill dbar__fill--' + side + '" style="width:' + (w / 2).toFixed(1) + '%"></i></span>' +
          '<span class="dbar__txt">' + txt + '</span></div>';
      }).join('') + '<p class="dbars__note">Çubuk uzunluğu yüzde değişimi gösterir · sol: azaldı, sağ: arttı</p></div>';
    }
  };

  function series(ms, key) {
    return ms.filter(function (x) { return x[key] != null && x[key] !== ''; })
      .map(function (x) { return { date: x.date, value: +x[key] }; });
  }
  function pct(v, of) { return (v / of * 100).toFixed(2) + '%'; }
})();
