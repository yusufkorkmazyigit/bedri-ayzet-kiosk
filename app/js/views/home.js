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
      '<div class="brand"><div class="brand__mark">' + esc(BA.initials(s.gymName)) + '</div>' +
      '<div class="brand__txt"><b>' + esc(s.gymName) + '</b><span>' + esc(s.gymTagline) + '</span></div></div>' +
      (center != null ? center :
        '<div class="clock"><b data-clock="time">' + BA.fmtTime(now) + '</b><span data-clock="date">' + BA.fmtLongToday(now) + '</span></div>') +
      '<div class="topbar__right">' + right + '</div>' +
    '</header>';
  };

  BA.views.home = function (root, params) {
    var region = params && params.region ? BA.regionById(params.region) : null;

    var auth =
      '<button class="btn btn--ghost" data-act="trainerLogin">' + icon('whistle') + '<span>Eğitmen Girişi</span></button>' +
      '<button class="btn btn--primary" data-act="memberLogin">' + icon('user') + '<span>Üye Girişi</span></button>';

    root.innerHTML = '<div class="screen">' + BA.topbar(auth) +
      '<main class="home">' + (region ? regionView(region) : gridView()) + '</main></div>';

    return {
      actions: {
        region: function (el) { BA.app.go('home', { region: el.getAttribute('data-id') }); },
        backHome: function () { BA.app.go('home'); },
        ex: function (el) { BA.showExercise(el.getAttribute('data-id')); },
        memberLogin: memberLogin,
        trainerLogin: trainerLogin
      }
    };
  };

  function gridView() {
    var counts = BA.store.countByRegion();
    return '<section class="hero">' +
        '<p class="eyebrow">Hareket rehberi</p>' +
        '<h1>Bugün hangi bölgeyi <em>çalışıyoruz?</em></h1>' +
        '<p class="hero__sub">Bir bölge seç, hareketlerin doğru formunu videolu anlatımla izle.</p>' +
      '</section>' +
      '<section class="regions">' + BA.REGIONS.map(function (r, i) {
        var n = counts[r.id] || 0;
        return '<button class="rcard" data-act="region" data-id="' + r.id + '">' +
          '<span class="rcard__no">' + (i < 9 ? '0' : '') + (i + 1) + '</span>' +
          '<span class="rcard__ico">' + BA.regionIcon(r) + '</span>' +
          '<span class="rcard__body"><b>' + esc(r.name) + '</b><span>' + esc(r.hint) + '</span></span>' +
          '<span class="rcard__foot"><span>' + n + ' hareket</span>' + icon('arrow') + '</span>' +
        '</button>';
      }).join('') + '</section>';
  }

  function regionView(region) {
    var list = BA.store.exercisesIn(region.id);
    return '<section class="region-head">' +
        '<button class="btn btn--ghost btn--icon" data-act="backHome" aria-label="Geri">' + icon('back') + '</button>' +
        '<div class="region-head__ico">' + BA.regionIcon(region) + '</div>' +
        '<div><p class="eyebrow">' + list.length + ' hareket</p><h1>' + esc(region.name) + '</h1></div>' +
      '</section>' +
      (list.length ? '<section class="exgrid">' + list.map(exCard).join('') + '</section>' :
        '<div class="empty">' + icon('film') + '<b>Bu bölgede henüz hareket yok</b><span>Eğitmen panelinden hareket eklenebilir.</span></div>');
  }

  function exCard(ex) {
    var has = BA.store.hasVideo(ex);
    var photo = BA.store.photoUrls(ex)[0];
    var badge = '<span class="excard__play' + (has === false ? ' is-off' : '') + '">' + icon(has === false ? 'film' : 'play') + '</span>';
    return '<button class="excard" data-act="ex" data-id="' + esc(ex.id) + '">' +
      (photo ? '<span class="excard__thumb"><img src="' + esc(photo) + '" alt="" loading="lazy" decoding="async">' + badge + '</span>' : badge) +
      '<span class="excard__body"><b>' + esc(ex.name) + '</b>' +
        '<span class="chips"><i>' + esc(ex.equipment || '—') + '</i><i class="lvl lvl--' + BA.LEVELS.indexOf(ex.level) + '">' + esc(ex.level || '') + '</i></span>' +
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
