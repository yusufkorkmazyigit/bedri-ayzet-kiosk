/* Ana ekran: bölge kartları → bölgenin hareketleri → video penceresi.
   Sağ üstte Üye Girişi ve Eğitmen Girişi. */
(function () {
  'use strict';
  var BA = window.BA, esc = BA.esc, icon = BA.icon;
  BA.views = BA.views || {};

  /* Tüm ekranlarda ortak üst çubuk */
  BA.topbar = function (right, center) {
    var s = BA.store.db.settings;
    var now = new Date();
    return '<header class="topbar">' +
      '<div class="brand"><img class="brand__mark" src="img/logo/mark.svg" alt="" draggable="false">' +
      '<div class="brand__txt"><b>' + esc(s.gymName) + '</b><span>' + esc(s.gymTagline) + '</span></div></div>' +
      (center != null ? center :
        '<div class="clock"><b data-clock="time">' + BA.fmtTime(now) + '</b><span data-clock="date">' + BA.fmtLongToday(now) + '</span></div>') +
      '<div class="topbar__right">' + right + '</div>' +
    '</header>';
  };

  BA.views.home = function (root, params) {
    var region = params && params.region ? BA.regionById(params.region) : null;

    var auth =
      '<button class="btn btn--ghost btn--code" data-act="codeSearch">' + icon('search') + '<span>Kodla Ara</span></button>' +
      '<button class="btn btn--ghost" data-act="trainerLogin">' + icon('whistle') + '<span>Eğitmen Girişi</span></button>' +
      '<button class="btn btn--primary" data-act="memberLogin">' + icon('user') + '<span>Üye Girişi</span></button>';

    root.innerHTML = '<div class="screen">' + BA.topbar(auth) +
      '<main class="home">' + (region ? regionView(region) : gridView()) + '</main></div>';

    return {
      actions: {
        region: function (el) { BA.app.go('home', { region: el.getAttribute('data-id') }); },
        backHome: function () { BA.app.go('home'); },
        ex: function (el) { BA.showExercise(el.getAttribute('data-id')); },
        codeSearch: function () { BA.codePad(); },
        library: function () { BA.app.go('library'); },
        memberLogin: memberLogin,
        trainerLogin: trainerLogin
      }
    };
  };

  /* Ana menü: 12 bölge kartı — görsel + kod harfi + bölge adı; az yazı, büyük dokunma alanı */
  function gridView() {
    var counts = mainCounts();
    return '<section class="hero hero--quote"><blockquote><p>“Ben sporcunun <em>zeki, çevik</em> ve aynı zamanda <em>ahlaklısını</em> severim.”</p>' +
        '<cite>Mustafa Kemal Atatürk</cite></blockquote>' +
        '<button class="btn btn--ghost hero__lib" data-act="library">' + BA.icon('book') + '<span>Ansiklopedi</span></button></section>' +
      '<section class="regions">' + BA.REGIONS.map(function (r) {
        return '<button class="rcard" data-act="region" data-id="' + r.id + '" aria-label="' + esc(r.name) + '">' +
          '<img class="rcard__img" src="img/regions/' + r.id + '.webp" alt="" draggable="false" decoding="async">' +
          '<span class="rcard__code">' + (r.code ? esc(r.code) : BA.icon('cardio')) + '</span>' +
          '<span class="rcard__txt"><b>' + esc(r.name) + '</b><span>' + (counts[r.id] || 0) + ' hareket</span></span>' +
        '</button>';
      }).join('') + '</section>';
  }
  /* Bölge başına ana hareket sayısı (çeşitler ayrıca sayılmaz) */
  function mainCounts() {
    var seen = {}, c = {};
    BA.store.db.exercises.forEach(function (e) {
      var k = e.region + '|' + (e.code ? BA.codeBase(e.code) : '#' + e.id);
      if (seen[k]) return;
      seen[k] = 1; c[e.region] = (c[e.region] || 0) + 1;
    });
    return c;
  }

  /* Bölge sayfası: her ana hareket tek kart (çeşitleri hareket penceresinde seçilir).
     Ana hareketi olmayan varyasyon grupları ilk varyasyonla temsil edilir. */
  function regionView(region) {
    var list = BA.store.exercisesIn(region.id);
    var groups = [], byBase = {};
    list.forEach(function (e) {
      var key = e.code ? BA.codeBase(e.code) : '#' + e.id;
      if (!byBase[key]) { byBase[key] = { key: key, items: [] }; groups.push(byBase[key]); }
      byBase[key].items.push(e);
    });
    return '<section class="region-head">' +
        '<button class="btn btn--ghost btn--icon" data-act="backHome" aria-label="Geri">' + icon('back') + '</button>' +
        '<div class="region-head__ico"><img src="img/regions/' + region.id + '.webp" alt="" draggable="false"></div>' +
        (region.code ? '<span class="region-head__code-l">' + esc(region.code) + '</span>' : '') +
        '<div><p class="eyebrow">' + groups.length + ' hareket' +
          (list.length > groups.length ? ', ' + list.length + ' çeşit' : '') + '</p><h1>' + esc(region.name) + '</h1></div>' +
        '<button class="btn btn--ghost region-head__code" data-act="codeSearch">' + icon('search') + '<span>Kodla Ara</span></button>' +
      '</section>' +
      (groups.length ? '<section class="exgrid">' + groups.map(function (g) {
        var main = g.items.filter(BA.store.isMain)[0] || g.items[0];
        return exCard(main, g.items.length - 1, g.key.charAt(0) !== '#' ? g.key : '');
      }).join('') + '</section>' :
        '<div class="empty">' + icon('film') + '<b>Bu bölgede henüz hareket yok</b><span>Eğitmen panelinden hareket eklenebilir.</span></div>');
  }

  function exCard(ex, more, base) {
    var has = BA.store.hasVideo(ex);
    var thumb = BA.store.thumbUrl(ex);
    var label = base && !BA.store.isMain(ex) ? '<span class="code">' + esc(BA.codeLabel(base)) + '</span>' : BA.codeChip(ex);
    var badge = '<span class="excard__play' + (has === false ? ' is-off' : '') + '">' + icon(has === false ? 'film' : 'play') + '</span>';
    return '<button class="excard" data-act="ex" data-id="' + esc(ex.id) + '">' +
      (thumb ? '<span class="excard__thumb"><img src="' + esc(thumb) + '" alt="" loading="lazy" decoding="async" onerror="this.remove()">' + badge + '</span>' : badge) +
      '<span class="excard__body"><b>' + label + esc(ex.name) + '</b>' +
        '<span class="chips">' + (more > 0 ? '<i class="chip-var">+' + more + ' çeşit</i>' : '') +
          (ex.equipment ? '<i>' + esc(ex.equipment) + '</i>' : '') +
          (ex.level ? '<i class="lvl lvl--' + BA.LEVELS.indexOf(ex.level) + '">' + esc(ex.level) + '</i>' : '') +
          (!ex.video && (ex.image || ex.images) ? '<i>Fotoğraf</i>' : '') +
        '</span>' +
      '</span>' +
      '<span class="excard__cta">' + (has === false ? 'Anlatım' : 'İzle') + '</span>' +
    '</button>';
  }

  function memberLogin() {
    BA.numpad({
      title: 'Üye Girişi',
      subtitle: 'Eğitmeninizin size verdiği üye numarasını girin.',
      placeholder: 'Üye No',
      maxLen: 6,
      onSubmit: function (v) {
        var m = BA.store.member(v);
        if (!m) return 'Bu numarayla kayıtlı üye bulunamadı.';
        BA.app.login('member', m.id);
        return true;
      }
    });
  }

  /* PIN deneme sınırı: 5 hatalı denemeden sonra 60 sn kilit */
  var pinFails = 0, pinLockUntil = 0;

  function trainerLogin() {
    BA.numpad({
      title: 'Eğitmen Girişi',
      subtitle: 'Eğitmen PIN kodunu girin.',
      secret: true,
      maxLen: 8,
      onSubmit: function (v) {
        var wait = Math.ceil((pinLockUntil - Date.now()) / 1000);
        if (wait > 0) return 'Çok fazla hatalı deneme. ' + wait + ' sn sonra tekrar deneyin.';
        if (BA.hash(v) !== BA.store.db.settings.pinHash) {
          if (++pinFails >= 5) { pinFails = 0; pinLockUntil = Date.now() + 60000; return 'Çok fazla hatalı deneme. 60 sn bekleyin.'; }
          return 'PIN hatalı.';
        }
        pinFails = 0;
        BA.app.login('trainer');
        return true;
      }
    });
  }
})();
