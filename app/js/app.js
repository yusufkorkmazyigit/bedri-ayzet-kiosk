/* Uygulama çekirdeği: görünüm yönlendirme, oturum, hareketsizlikte otomatik çıkış, saat. */
(function () {
  'use strict';
  var BA = window.BA;
  var root = document.getElementById('app');

  var HOME_IDLE = 150;   // ana ekranda açık kalan video/bölge bu süre sonunda sıfırlanır (sn)
  var WARN_BEFORE = 15;  // oturum kapanmadan önce uyarı süresi (sn)

  var app = {
    session: { role: null, memberId: null },
    view: null,
    params: {},
    current: {}
  };

  /* ------------------------------------------------------------ yönlendirme */
  app.go = function (view, params) {
    BA.modal.closeAll();
    BA.keyboard.hide();
    if (view === 'member' && app.session.role !== 'member') view = 'home';
    if (view === 'trainer' && app.session.role !== 'trainer') view = 'home';
    app.view = view;
    app.params = params || {};
    app.current = BA.views[view](root, app.params) || {};
    root.scrollTop = 0;
    // ana ekran → üye ekranı gibi geçişlerde küçük bir giriş animasyonu (lite modda kapalı)
    var scr = root.firstElementChild;
    if (scr) scr.classList.add('enter');
  };

  app.login = function (role, memberId) {
    app.session = { role: role, memberId: memberId || null };
    touch();
    app.go(role);
  };

  app.logout = function () {
    app.session = { role: null, memberId: null };
    hideWarn();
    app.go('home');
  };

  /* Tek dinleyici: görünümün actions/onInput/onChange fonksiyonlarına dağıtır */
  BA.delegate(root, new Proxy({}, {
    get: function (_, name) { return app.current.actions && app.current.actions[name]; }
  }));
  root.addEventListener('input', function (e) { if (app.current.onInput) app.current.onInput(e); });
  root.addEventListener('change', function (e) { if (app.current.onChange) app.current.onChange(e); });

  /* ------------------------------------------------------------ ayarlar */
  app.applySettings = function () {
    var s = BA.store.db.settings;
    document.documentElement.classList.toggle('lite', !!s.lite);
    document.title = s.gymName + ' ' + s.gymTagline;
  };

  /* ------------------------------------------------------------ hareketsizlik yönetimi */
  var last = Date.now();
  function touch() { last = Date.now(); if (warnEl) hideWarn(); }
  ['pointerdown', 'keydown', 'wheel'].forEach(function (t) {
    document.addEventListener(t, touch, { passive: true, capture: true });
  });

  var warnEl = null;
  function showWarn(left) {
    if (!warnEl) {
      warnEl = document.createElement('div');
      warnEl.className = 'idle';
      warnEl.innerHTML = '<div class="idle__card"><div class="idle__ring"><b></b></div>' +
        '<h2>Hâlâ burada mısın?</h2><p>Güvenliğin için oturumun birazdan kapanacak.</p>' +
        '<button class="btn btn--primary btn--xl">Devam et</button></div>';
      document.body.appendChild(warnEl);
    }
    warnEl.querySelector('b').textContent = left;
  }
  function hideWarn() { if (warnEl) { warnEl.parentNode.removeChild(warnEl); warnEl = null; } }

  function tick() {
    var idle = (Date.now() - last) / 1000;
    var s = BA.store.db.settings;
    var role = app.session.role;

    if (role) {
      var limit = role === 'member' ? s.memberIdle : s.trainerIdle;
      var left = Math.ceil(limit - idle);
      var badge = root.querySelector('[data-ref=left]');
      if (badge) badge.textContent = fmtLeft(Math.max(0, left));
      if (left <= 0) { app.logout(); BA.toast('Oturum hareketsizlik nedeniyle kapatıldı.'); }
      else if (left <= WARN_BEFORE) showWarn(left);
    } else if (idle > HOME_IDLE && (app.params.region || BA.modal.top() || app.view !== 'home')) {
      app.go('home');
      last = Date.now();
    }
    updateClock();
    // USB ile kopyalanan videolar yeniden başlatmadan tanınsın
    if (++videoTick >= 60) { videoTick = 0; BA.store.refreshVideos(); }
  }
  var videoTick = 0;

  function fmtLeft(sec) {
    var m = Math.floor(sec / 60), r = sec % 60;
    return m + ':' + (r < 10 ? '0' : '') + r;
  }

  var lastMinute = -1;
  function updateClock() {
    var d = new Date();
    if (d.getMinutes() === lastMinute) return;
    lastMinute = d.getMinutes();
    var t = root.querySelector('[data-clock=time]'), dt = root.querySelector('[data-clock=date]');
    if (t) t.textContent = BA.fmtTime(d);
    if (dt) dt.textContent = BA.fmtLongToday(d);
  }

  /* ------------------------------------------------------------ kiosk sertleştirme */
  document.addEventListener('contextmenu', function (e) { e.preventDefault(); });
  document.addEventListener('dragstart', function (e) { e.preventDefault(); });
  document.addEventListener('wheel', function (e) { if (e.ctrlKey) e.preventDefault(); }, { passive: false });
  document.addEventListener('keydown', function (e) {
    // tarayıcı yakınlaştırma / yazdırma / kaynak kısayollarını engelle
    if (e.ctrlKey && /^[+\-=0pusPUS]$/.test(e.key)) e.preventDefault();
  });

  /* ------------------------------------------------------------ ağ modu: başka cihazdan gelen değişiklik
     Form, pencere ya da program düzenleyici açıkken uygulanmaz (yarım iş ezilmesin); sonra uygulanır. */
  BA.store.canApply = function () {
    if (BA.modal.top()) return false;
    var a = document.activeElement;
    if (a && /^(INPUT|TEXTAREA|SELECT)$/.test(a.tagName)) return false;
    if (app.view === 'trainer' && (app.params.tab === 'editor' || app.params.tab === 'settings')) return false;
    return true;
  };
  BA.store.onRemote = function () {
    app.applySettings();
    if (app.session.role === 'member' && !BA.store.member(app.session.memberId)) { app.logout(); return; }
    if (app.view === 'trainer' && app.params.id && (app.params.tab === 'member') && !BA.store.member(app.params.id)) {
      app.go('trainer', { tab: 'members' }); return;
    }
    if (!BA.store.canApply()) return;
    var y = root.scrollTop, sc = root.querySelector('.admin__main, .home, .member__main');
    var y2 = sc ? sc.scrollTop : 0;
    app.go(app.view, app.params);
    root.scrollTop = y;
    sc = root.querySelector('.admin__main, .home, .member__main');
    if (sc) sc.scrollTop = y2;
    var scr = root.firstElementChild;
    if (scr) scr.classList.remove('enter');
  };

  /* ------------------------------------------------------------ açılış */
  BA.app = app;
  BA.store.load().then(function () {
    app.applySettings();
    // Eğitmen bilgisayarındaki kısayol ?panel ile açar → doğrudan eğitmen girişi
    if (/[?&]panel\b/.test(location.search) && BA.views.home) {
      app.go('home');
      setTimeout(function () { var b = root.querySelector('[data-act=trainerLogin]'); if (b) b.click(); }, 50);
      setInterval(tick, 1000);
      return;
    }
    app.go('home');
    setInterval(tick, 1000);
  }).catch(function (err) {
    root.innerHTML = '<div class="fatal"><h1>Uygulama başlatılamadı</h1><p>' + BA.esc(err && err.message) + '</p></div>';
  });
})();
