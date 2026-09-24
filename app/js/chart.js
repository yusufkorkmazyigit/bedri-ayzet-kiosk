/* Bağımlılıksız, hafif SVG çizgi grafiği (tek seri).
   Dokunmatik için: noktaya dokununca tarih + değer baloncuğu; son değer doğrudan etiketli. */
(function () {
  'use strict';
  var BA = window.BA;

  BA.lineChart = function (host, points, opt) {
    opt = opt || {};
    var W = Math.max(280, host.clientWidth || 480);
    var H = opt.height || 190;
    var pad = { l: 44, r: 20, t: 22, b: 30 };
    if (!points.length) {
      host.innerHTML = '<div class="chart-empty">Henüz ölçüm yok</div>';
      return;
    }

    var vals = points.map(function (p) { return p.value; });
    var min = Math.min.apply(null, vals), max = Math.max.apply(null, vals);
    var span = max - min || Math.max(1, Math.abs(max) * 0.05);
    // "güzel" bir aralık: 4 eşit adım, yuvarlak değerler
    var step = niceStep(span / 3);
    var lo = Math.floor((min - span * 0.15) / step) * step;
    var hi = Math.ceil((max + span * 0.15) / step) * step;
    if (hi === lo) hi = lo + step;

    var t0 = +new Date(points[0].date), t1 = +new Date(points[points.length - 1].date);
    var iw = W - pad.l - pad.r, ih = H - pad.t - pad.b;
    function x(p, i) {
      if (t1 === t0) return pad.l + (points.length === 1 ? iw / 2 : iw * i / (points.length - 1));
      return pad.l + iw * ((+new Date(p.date)) - t0) / (t1 - t0);
    }
    function y(v) { return pad.t + ih - ih * (v - lo) / (hi - lo); }

    var grid = '', ylab = '';
    for (var g = lo; g <= hi + step / 2; g += step) {
      var gy = y(g).toFixed(1);
      grid += '<line x1="' + pad.l + '" x2="' + (W - pad.r) + '" y1="' + gy + '" y2="' + gy + '"/>';
      ylab += '<text x="' + (pad.l - 10) + '" y="' + gy + '" dy="4" text-anchor="end">' + BA.fmtNum(g, step % 1 ? 1 : 0) + '</text>';
    }

    var xy = points.map(function (p, i) { return [x(p, i), y(p.value)]; });
    var line = xy.map(function (c, i) { return (i ? 'L' : 'M') + c[0].toFixed(1) + ' ' + c[1].toFixed(1); }).join('');
    var area = line + 'L' + xy[xy.length - 1][0].toFixed(1) + ' ' + (pad.t + ih) + 'L' + xy[0][0].toFixed(1) + ' ' + (pad.t + ih) + 'Z';

    // x etiketleri: ilk, son ve arada yer varsa ortadakiler
    var xl = '', lastX = -1e9;
    xy.forEach(function (c, i) {
      var isEnd = i === 0 || i === xy.length - 1;
      if (!isEnd && (c[0] - lastX < 70 || xy[xy.length - 1][0] - c[0] < 70)) return;
      xl += '<text x="' + c[0].toFixed(1) + '" y="' + (H - 8) + '" text-anchor="' + (i === 0 && xy.length > 1 ? 'start' : i === xy.length - 1 && xy.length > 1 ? 'end' : 'middle') + '">' + BA.fmtDate(points[i].date, true) + '</text>';
      lastX = c[0];
    });

    var dots = xy.map(function (c, i) {
      return '<g class="pt' + (i === xy.length - 1 ? ' is-last' : '') + '" data-i="' + i + '">' +
        '<circle class="hit" cx="' + c[0].toFixed(1) + '" cy="' + c[1].toFixed(1) + '" r="18"/>' +
        '<circle class="dot" cx="' + c[0].toFixed(1) + '" cy="' + c[1].toFixed(1) + '" r="4.5"/></g>';
    }).join('');

    var last = xy[xy.length - 1];
    var lastLabel = '<text class="lbl" x="' + Math.min(last[0], W - pad.r).toFixed(1) + '" y="' + (last[1] - 12).toFixed(1) + '" text-anchor="end">' +
      BA.fmtNum(points[points.length - 1].value) + ' ' + BA.esc(opt.unit || '') + '</text>';

    host.innerHTML =
      '<svg class="chart" width="' + W + '" height="' + H + '" viewBox="0 0 ' + W + ' ' + H + '" role="img" aria-label="' + BA.esc(opt.label || '') + ' grafiği">' +
        '<g class="grid">' + grid + '</g><g class="ylab">' + ylab + '</g><g class="xlab">' + xl + '</g>' +
        '<path class="area" d="' + area + '"/><path class="line" d="' + line + '"/>' + dots + lastLabel +
      '</svg><div class="chart-tip" hidden></div>';

    var tip = host.querySelector('.chart-tip');
    host.querySelector('svg').addEventListener('pointerdown', function (e) {
      var g = e.target.closest('.pt');
      host.querySelectorAll('.pt.is-on').forEach(function (n) { n.classList.remove('is-on'); });
      if (!g) { tip.hidden = true; return; }
      var i = +g.getAttribute('data-i'), p = points[i], c = xy[i];
      g.classList.add('is-on');
      tip.innerHTML = '<span>' + BA.fmtDate(p.date) + '</span><b>' + BA.fmtNum(p.value) + ' ' + BA.esc(opt.unit || '') + '</b>';
      tip.hidden = false;
      var left = Math.max(60, Math.min(W - 60, c[0]));
      tip.style.transform = 'translate(' + (left - 60).toFixed(0) + 'px,' + Math.max(0, c[1] - 62).toFixed(0) + 'px)';
    });
  };

  function niceStep(raw) {
    var p = Math.pow(10, Math.floor(Math.log10(raw)));
    var n = raw / p;
    return (n <= 1 ? 1 : n <= 2 ? 2 : n <= 2.5 ? 2.5 : n <= 5 ? 5 : 10) * p;
  }
})();
