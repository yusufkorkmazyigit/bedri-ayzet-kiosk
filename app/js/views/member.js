/* Üye ekranı: solda eğitmenin atadığı program, sağda ölçüm takibi (vücut haritası + grafik). */
(function () {
  'use strict';
  var BA = window.BA, esc = BA.esc, icon = BA.icon;

  BA.views.member = function (root, params) {
    var m = BA.store.member(BA.app.session.memberId);
    if (!m) { BA.app.logout(); return {}; }
    var dayIdx = 0;
    var metric = 'arm';
    var period = 'all';
    var ms = BA.store.sortedMeasurements(m);

    var first = String(m.name || '').split(' ')[0];
    var bday = BA.isBirthday(m);
    var st = BA.membershipStatus(m);
    var memb = m.membership && m.membership.end ?
      ' · <i class="stat stat--' + st.key + '">Üyelik: ' + (st.key === 'expired' ? 'bitti' : BA.fmtDate(m.membership.end, true) + ', ' + esc(st.label)) + '</i>' : '';
    var center = '<div class="greet' + (bday ? ' greet--bday' : '') + '">' +
      (bday ? '<b>' + icon('cake') + 'İyi ki doğdun, ' + esc(first) + '!</b>' : '<b>Hoş geldin, ' + esc(first) + '</b>') +
      '<span>Üye No ' + esc(m.id) + (m.goal ? ' · Hedef: ' + esc(m.goal) : '') + memb + '</span></div>';
    var right = '<div class="session" data-ref="session" title="Otomatik çıkış">' + icon('clock') + '<span data-ref="left"></span></div>' +
      '<button class="btn btn--ghost" data-act="logout">' + icon('logout') + '<span>Çıkış</span></button>';

    root.innerHTML = '<div class="screen">' + BA.topbar(right, center) +
      '<main class="split">' +
        '<section class="panel panel--program" data-ref="program"></section>' +
        '<section class="panel panel--progress" data-ref="progress"></section>' +
      '</main></div>';

    var progEl = root.querySelector('[data-ref=program]');
    var progrEl = root.querySelector('[data-ref=progress]');
    renderProgram();
    renderProgress();

    return {
      actions: {
        logout: function () { BA.app.logout(); },
        day: function (el) { dayIdx = +el.getAttribute('data-i'); renderProgram(); },
        item: function (el) {
          var it = m.program.days[dayIdx].items[+el.getAttribute('data-i')];
          BA.showExercise(it.exerciseId, it);
        },
        metric: function (el) { metric = el.getAttribute('data-k'); renderProgress(); },
        period: function (el) { period = el.getAttribute('data-p'); renderProgress(); }
      }
    };

    /* ---------------------------------------------------------- program */
    function renderProgram() {
      var p = m.program;
      if (!p || !p.days || !p.days.length) {
        progEl.innerHTML = panelHead('Programım', '') +
          '<div class="empty">' + icon('list') + '<b>Henüz programın yok</b><span>Eğitmenin sana bir program atadığında burada göreceksin.</span></div>';
        return;
      }
      var day = p.days[Math.min(dayIdx, p.days.length - 1)];
      var totalSets = day.items.reduce(function (a, it) { return a + (parseInt(it.sets, 10) || 0); }, 0);

      progEl.innerHTML =
        panelHead('Programım', esc(p.name), p.assignedAt ? BA.fmtDate(p.assignedAt) + ' tarihinde atandı' : '') +
        (p.note ? '<p class="note">' + icon('whistle') + esc(p.note) + '</p>' : '') +
        (p.days.length > 1 ? '<div class="tabs" role="tablist">' + p.days.map(function (d, i) {
          return '<button class="tab' + (i === dayIdx ? ' is-on' : '') + '" data-act="day" data-i="' + i + '">' +
            '<small>Gün ' + (i + 1) + '</small>' + esc(d.name) + '</button>';
        }).join('') + '</div>' : '') +
        '<div class="daymeta"><span>' + day.items.length + ' hareket</span><span>' + totalSets + ' set</span><span>Harekete dokun → videolu anlatım</span></div>' +
        '<ol class="plist">' + day.items.map(function (it, i) {
          var ex = BA.store.exercise(it.exerciseId) || { name: 'Silinmiş hareket', region: '' };
          return '<li><button class="prow" data-act="item" data-i="' + i + '">' +
            '<span class="prow__no">' + (i + 1) + '</span>' +
            '<span class="prow__name"><b>' + BA.codeChip(ex) + esc(ex.name) + '</b><span>' + esc(BA.regionById(ex.region).name) +
              (ex.code && !BA.store.isMain(ex) && BA.store.byCode(BA.codeBase(ex.code)) ? ' · ' + esc(BA.store.byCode(BA.codeBase(ex.code)).name) : '') +
              (it.note ? ' · ' + esc(it.note) : '') + '</span></span>' +
            '<span class="prow__dose"><b>' + esc(it.sets) + ' × ' + esc(it.reps) + '</b><span>' + (it.rest ? esc(it.rest) + ' sn dinlenme' : 'set × tekrar') + '</span></span>' +
            '<span class="prow__play">' + icon('play') + '</span>' +
          '</button></li>';
        }).join('') + '</ol>';
    }

    /* ---------------------------------------------------------- gelişim */
    function renderProgress() {
      if (!ms.length) {
        progrEl.innerHTML = panelHead('Gelişimim', '') +
          '<div class="empty">' + icon('ruler') + '<b>Henüz ölçüm girilmedi</b><span>İlk ölçümünü eğitmenine aldırdığında gelişimini burada takip edebilirsin.</span></div>';
        return;
      }
      var P = BA.progress;
      var prog = P.compute(ms, period);
      var last = ms[ms.length - 1];
      var h = latest('height');
      var w = latest('weight');
      var bmi = h && w ? w / Math.pow(h / 100, 2) : null;
      if (!prog[metric]) metric = Object.keys(prog).filter(function (k) { return !prog[k].def.noChart; })[0];
      if (!metric) { metric = 'arm'; progrEl.innerHTML = panelHead('Gelişimim', '') + '<div class="empty">' + icon('ruler') + '<b>Takip edilecek ölçü yok</b></div>'; return; }

      // Haritada olmayan ölçüler (kilo, yağ oranı) küçük kutucuk olarak
      var tiles = BA.METRICS.filter(function (d) { return !d.noChart && prog[d.key] && P.MAP_KEYS.indexOf(d.key) < 0; }).map(function (d) {
        var it = prog[d.key];
        return '<button class="tile' + (metric === d.key ? ' is-on' : '') + '" data-act="metric" data-k="' + d.key + '">' +
          '<span class="tile__lbl">' + esc(d.label) + '</span>' +
          '<span class="tile__val">' + BA.fmtNum(it.to) + '<small>' + d.unit + '</small></span>' + P.deltaHtml(it) + '</button>';
      }).join('') +
        (bmi ? '<div class="tile tile--static"><span class="tile__lbl">Vücut kitle indeksi</span>' +
          '<span class="tile__val">' + BA.fmtNum(bmi) + '</span><span class="delta">' + bmiLabel(bmi) + '</span></div>' : '');

      var it = prog[metric], md = it.def;
      var same = it.delta == null || Math.abs(it.delta) < 0.05;
      var head = same ? BA.fmtNum(it.to) + ' ' + md.unit + (it.delta != null ? ' · değişmedi' : '') :
        BA.fmtNum(it.from) + ' → ' + BA.fmtNum(it.to) + ' ' + md.unit + ' <i>(' + P.deltaText(it.delta, '') + ')</i>';
      progrEl.innerHTML =
        panelHead('Gelişimim', 'Vücut ölçülerim',
          'Son ölçüm ' + BA.fmtDate(last.date) + ' · ' + ms.length + ' ölçüm' + (h ? ' · Boy ' + BA.fmtNum(h, 0) + ' cm' : '')) +
        (ms.length > 1 ? P.periodSeg(period) : '') +
        P.summary(prog) +
        '<div class="bmrow">' + P.bodyMap(prog, metric) + '<div class="tiles tiles--col">' + tiles + '</div></div>' +
        '<div class="chartbox"><div class="chartbox__head"><b>' + esc(md.label) + '</b><span>' + head +
          (it.delta != null ? ' · ' + esc(P.span(it.fromDate, it.toDate)) : '') + '</span></div>' +
        '<div class="chartbox__plot" data-ref="plot"></div></div>';

      BA.lineChart(progrEl.querySelector('[data-ref=plot]'), it.series, { unit: md.unit, label: md.label, height: 150 });
    }

    function latest(key) {
      for (var i = ms.length - 1; i >= 0; i--) if (ms[i][key] != null && ms[i][key] !== '') return +ms[i][key];
      return null;
    }
  };

  function panelHead(title, sub, meta) {
    return '<header class="panel__head"><p class="eyebrow">' + title + '</p>' +
      (sub ? '<h2>' + sub + '</h2>' : '') + (meta ? '<span class="panel__meta">' + meta + '</span>' : '') + '</header>';
  }

  function bmiLabel(b) {
    return b < 18.5 ? 'Zayıf' : b < 25 ? 'Normal' : b < 30 ? 'Fazla kilolu' : 'Obez';
  }
})();
