/* Fitness ansiklopedisi: solda içindekiler, sağda kaydırarak okunan metin.
   İçerik (js/ansiklopedi.js) yalnızca ilk açılışta yüklenir; DOM bir kez çizilir,
   kaydırmada yalnızca etkin başlık işareti güncellenir (requestAnimationFrame ile seyreltilmiş). */
(function () {
  'use strict';
  var BA = window.BA, esc = BA.esc, icon = BA.icon;
  var loading = null;

  function load() {
    if (BA.ANSIKLOPEDI) return Promise.resolve();
    if (loading) return loading;
    loading = new Promise(function (resolve, reject) {
      var s = document.createElement('script');
      s.src = 'js/ansiklopedi.js';
      s.onload = function () { resolve(); };
      s.onerror = function () { loading = null; reject(new Error('ansiklopedi')); };
      document.head.appendChild(s);
    });
    return loading;
  }

  /* **kalın** → <b> (önce kaçışlanır) */
  function rich(t) { return esc(t).replace(/\*\*(.+?)\*\*/g, '<b>$1</b>'); }

  function block(b) {
    switch (b[0]) {
      case 'h': return '<h3>' + rich(b[1]) + '</h3>';
      case 'ul': return '<ul class="ans__ul">' + b[1].map(function (x) { return '<li>' + rich(x) + '</li>'; }).join('') + '</ul>';
      case 'tip': return '<p class="ans__tip">' + icon('check') + '<span>' + rich(b[1]) + '</span></p>';
      case 'dl': return '<dl class="ans__dl">' + b[1].map(function (x) { return '<dt>' + rich(x[0]) + '</dt><dd>' + rich(x[1]) + '</dd>'; }).join('') + '</dl>';
      default: return '<p>' + rich(b[1]) + '</p>';
    }
  }

  BA.views.library = function (root) {
    var back = '<button class="btn btn--ghost" data-act="home">' + icon('back') + '<span>Ana menü</span></button>';
    root.innerHTML = '<div class="screen">' + BA.topbar(back, '<div class="greet"><b>' + icon('book') + 'Fitness Ansiklopedisi</b><span>Bilmek, doğru çalışmanın yarısıdır</span></div>') +
      '<main class="ans"><nav class="ans__toc" data-ref="toc"></nav><div class="ans__body" data-ref="body"><div class="empty">' + icon('book') + '<b>Yükleniyor…</b></div></div></main></div>';
    var toc = root.querySelector('[data-ref=toc]'), body = root.querySelector('[data-ref=body]');
    var secs = [], links = [], ticking = false, current = -1;

    load().then(function () {
      var data = BA.ANSIKLOPEDI;
      toc.innerHTML = data.map(function (ch) {
        return '<div class="ans__ch"><p class="eyebrow">' + esc(ch.title) + '</p>' + ch.items.map(function (a) {
          return '<button class="ans__link" data-act="goto" data-id="' + esc(a.id) + '">' + esc(a.title) + '</button>';
        }).join('') + '</div>';
      }).join('');
      body.innerHTML = '<div class="ans__inner">' + data.map(function (ch) {
        return ch.items.map(function (a) {
          return '<section class="ans__art" id="ans-' + esc(a.id) + '"><p class="eyebrow">' + esc(ch.title) + '</p>' +
            '<h2>' + esc(a.title) + '</h2>' + (a.lead ? '<p class="ans__lead">' + rich(a.lead) + '</p>' : '') +
            a.body.map(block).join('') + '</section>';
        }).join('');
      }).join('') + '<p class="ans__note">' + esc(BA.ANSIKLOPEDI_NOT || '') + '</p></div>';
      secs = [].slice.call(body.querySelectorAll('.ans__art'));
      links = [].slice.call(toc.querySelectorAll('.ans__link'));
      mark();
      body.addEventListener('scroll', function () {
        if (ticking) return;
        ticking = true;
        requestAnimationFrame(function () { ticking = false; mark(); });
      }, { passive: true });
    }).catch(function () {
      body.innerHTML = '<div class="empty">' + icon('close') + '<b>Ansiklopedi yüklenemedi</b></div>';
    });

    function mark() {
      var y = body.scrollTop + 120, idx = 0;
      for (var i = 0; i < secs.length; i++) { if (secs[i].offsetTop <= y) idx = i; else break; }
      if (body.scrollTop + body.clientHeight >= body.scrollHeight - 4) idx = secs.length - 1;
      if (idx === current) return;
      if (links[current]) links[current].classList.remove('is-on');
      current = idx;
      if (links[idx]) {
        links[idx].classList.add('is-on');
        var lt = links[idx].offsetTop, th = toc.clientHeight;
        if (lt < toc.scrollTop || lt > toc.scrollTop + th - 60) toc.scrollTop = Math.max(0, lt - th / 3);
      }
    }

    return {
      actions: {
        home: function () { BA.app.go('home'); },
        goto: function (el) {
          var s = document.getElementById('ans-' + el.getAttribute('data-id'));
          if (s) body.scrollTop = s.offsetTop - 24;
        }
      }
    };
  };
})();
