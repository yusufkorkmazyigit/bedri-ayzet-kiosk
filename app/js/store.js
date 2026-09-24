/* Veri katmanı.
   - Sunucu modu  (http://127.0.0.1): veri data/db.json dosyasında tutulur (kiosk-server.exe).
   - Yerel mod    (file:// veya sunucu yoksa): tarayıcının localStorage'ı kullanılır.
   Her iki modda da son durum localStorage'a aynalanır; sunucu geçici olarak düşerse veri kaybolmaz. */
(function () {
  'use strict';
  var BA = window.BA;
  var LS_KEY = 'ba-kiosk-db';

  var store = {
    db: null,
    mode: 'local',
    videos: null,          // sunucu modunda mevcut video dosyaları (Set benzeri obje), yerelde null
    dirty: false,
    _failNotified: false
  };

  function lsGet() {
    try { var s = localStorage.getItem(LS_KEY); return s ? JSON.parse(s) : null; } catch (e) { return null; }
  }
  function lsSet(db) {
    try { localStorage.setItem(LS_KEY, JSON.stringify(db)); } catch (e) { /* kota / gizli mod */ }
  }

  /* Eski/eksik kayıtları güvenli hale getir (ileride şema değişirse burada taşınır). */
  function normalize(db) {
    var base = BA.seed();
    db = db && typeof db === 'object' ? db : base;
    db.settings = Object.assign({}, base.settings, db.settings || {});
    db.exercises = Array.isArray(db.exercises) ? db.exercises : base.exercises;
    // Sonradan eklenen hazır fotoğrafları eski kayıtlara da tanıt
    var seedPhotos = {};
    base.exercises.forEach(function (e) { if (e.photos) seedPhotos[e.id] = e.photos; });
    db.exercises.forEach(function (e) { if (e.photos == null && seedPhotos[e.id]) e.photos = seedPhotos[e.id]; });
    db.templates = Array.isArray(db.templates) ? db.templates : base.templates;
    db.members = Array.isArray(db.members) ? db.members : [];
    db.members.forEach(function (m) {
      m.id = String(m.id);
      m.measurements = Array.isArray(m.measurements) ? m.measurements : [];
      m.measurements.forEach(function (x) { if (!x.id) x.id = BA.uid(); });
    });
    db.version = 1;
    return db;
  }

  store.load = function () {
    if (location.protocol === 'file:') return Promise.resolve(loadLocal());
    return fetch('api/db', { cache: 'no-store' }).then(function (r) {
      store.mode = 'server';
      if (r.status === 404) {
        // İlk çalıştırma: varsa localStorage'daki veriyi taşı, yoksa başlangıç verisi
        store.db = normalize(lsGet());
        store.save(true);
        return;
      }
      if (!r.ok) throw new Error('db ' + r.status);
      return r.json().then(function (db) { store.db = normalize(db); lsSet(store.db); });
    }).catch(function () {
      if (store.mode !== 'server') return loadLocal();
      // sunucu var ama veri okunamadı → yedekten devam
      store.db = normalize(lsGet());
    }).then(function () { return store.refreshVideos(); });
  };

  function loadLocal() {
    store.mode = 'local';
    store.db = normalize(lsGet());
    lsSet(store.db);
  }

  /* ------------------------------------------------------------ kaydetme (debounce + tekrar deneme) */
  var inflight = false, pending = false;

  function flush() {
    if (!store.dirty) return;
    lsSet(store.db);
    if (store.mode !== 'server') { store.dirty = false; return; }
    if (inflight) { pending = true; return; }
    inflight = true;
    store.dirty = false;
    fetch('api/db', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(store.db)
    }).then(function (r) {
      if (!r.ok) throw new Error('save ' + r.status);
      if (store._failNotified) { store._failNotified = false; BA.toast('Bağlantı düzeldi, veriler kaydedildi.', 'ok'); }
    }).catch(function () {
      store.dirty = true;
      if (!store._failNotified) {
        store._failNotified = true;
        BA.toast('Sunucuya yazılamadı. Veri bu cihazda tutuluyor, tekrar denenecek.', 'err');
      }
      setTimeout(flush, 5000);
    }).then(function () {
      inflight = false;
      if (pending) { pending = false; flush(); }
    });
  }
  var flushSoon = BA.debounce(flush, 350);

  store.save = function (now) {
    store.dirty = true;
    if (now) flush(); else flushSoon();
  };
  window.addEventListener('beforeunload', function () { if (store.dirty) lsSet(store.db); });

  /* ------------------------------------------------------------ videolar */
  store.refreshVideos = function () {
    if (store.mode !== 'server') { store.videos = null; return Promise.resolve(); }
    return fetch('api/videos', { cache: 'no-store' })
      .then(function (r) { return r.ok ? r.json() : []; })
      .then(function (list) {
        store.videos = {};
        list.forEach(function (n) { store.videos[n.toLowerCase()] = true; });
      })
      .catch(function () { store.videos = null; });
  };

  store.videoList = function () {
    return store.videos ? Object.keys(store.videos).sort() : [];
  };

  /* true: dosya var, false: yok, null: bilinmiyor (yerel mod) */
  store.hasVideo = function (ex) {
    if (!ex || !ex.video) return false;
    if (!store.videos) return null;
    return !!store.videos[ex.video.toLowerCase()];
  };

  store.videoUrl = function (ex) {
    if (!ex || !ex.video) return '';
    // sunucuda /videos/ ; file:// modunda app/ klasörünün kardeşi olan ../videos/
    return (store.mode === 'server' ? 'videos/' : '../videos/') + encodeURIComponent(ex.video);
  };

  /* Video yoksa kullanılacak başlangıç/bitiş fotoğrafları (app/img/ex/<id>-0.jpg, -1.jpg) */
  store.photoUrls = function (ex) {
    var out = [];
    for (var i = 0; ex && i < (ex.photos || 0); i++) out.push('img/ex/' + encodeURIComponent(ex.id) + '-' + i + '.jpg');
    return out;
  };

  /* XHR: yükleme ilerlemesini gösterebilmek için */
  store.uploadVideo = function (file, name, onProgress) {
    return new Promise(function (resolve, reject) {
      var xhr = new XMLHttpRequest();
      xhr.open('POST', 'api/videos?name=' + encodeURIComponent(name));
      xhr.upload.onprogress = function (e) { if (e.lengthComputable && onProgress) onProgress(e.loaded / e.total); };
      xhr.onload = function () {
        if (xhr.status === 200) {
          var res = JSON.parse(xhr.responseText);
          store.refreshVideos().then(function () { resolve(res.name); });
        } else reject(new Error('upload ' + xhr.status));
      };
      xhr.onerror = function () { reject(new Error('network')); };
      xhr.send(file);
    });
  };

  /* ------------------------------------------------------------ sorgular */
  function byId(list, id) {
    for (var i = 0; i < list.length; i++) if (list[i].id === id) return list[i];
    return null;
  }
  store.exercise = function (id) { return byId(store.db.exercises, id); };
  store.template = function (id) { return byId(store.db.templates, id); };
  store.member = function (id) { return byId(store.db.members, String(id)); };

  store.exercisesIn = function (regionId) {
    return store.db.exercises
      .filter(function (e) { return e.region === regionId; })
      .sort(function (a, b) { return a.name.localeCompare(b.name, 'tr'); });
  };

  store.countByRegion = function () {
    var c = {};
    store.db.exercises.forEach(function (e) { c[e.region] = (c[e.region] || 0) + 1; });
    return c;
  };

  store.sortedMeasurements = function (m) {
    return m.measurements.slice().sort(function (a, b) { return a.date < b.date ? -1 : a.date > b.date ? 1 : 0; });
  };

  /* Kullanılmayan 4 haneli ilk ID (1001'den başlar) */
  store.nextMemberId = function () {
    var used = {}, max = 1000;
    store.db.members.forEach(function (m) {
      used[m.id] = true;
      var n = parseInt(m.id, 10);
      if (n > max && n < 9999) max = n;
    });
    var id = max + 1;
    while (used[String(id)] && id < 9999) id++;
    return String(id);
  };

  /* ------------------------------------------------------------ değişiklikler */
  store.upsert = function (listName, obj) {
    var list = store.db[listName];
    for (var i = 0; i < list.length; i++) {
      if (list[i].id === obj.id) { list[i] = obj; store.save(); return obj; }
    }
    list.push(obj);
    store.save();
    return obj;
  };

  store.remove = function (listName, id) {
    store.db[listName] = store.db[listName].filter(function (x) { return x.id !== id; });
    store.save();
  };

  /* Üye ID'si değişirse eski kaydı yenisiyle değiştirir */
  store.saveMember = function (m, oldId) {
    if (oldId && oldId !== m.id) store.db.members = store.db.members.filter(function (x) { return x.id !== oldId; });
    return store.upsert('members', m);
  };

  /* Şablonu üyeye kopyalayarak atar (şablon sonradan değişse de üyenin programı korunur) */
  store.assignTemplate = function (member, tplId) {
    var t = store.template(tplId);
    if (!t) return;
    var c = BA.clone(t);
    member.program = { name: c.name, note: c.note || '', assignedAt: BA.todayISO(), templateId: c.id, days: c.days };
    store.save();
  };

  /* Bir hareket silinirse programlardaki referansları da temizle */
  store.deleteExercise = function (id) {
    store.remove('exercises', id);
    function clean(p) {
      if (!p || !p.days) return;
      p.days.forEach(function (d) { d.items = d.items.filter(function (it) { return it.exerciseId !== id; }); });
    }
    store.db.templates.forEach(clean);
    store.db.members.forEach(function (m) { clean(m.program); });
    store.save();
  };

  store.exportJSON = function () { return JSON.stringify(store.db, null, 2); };

  store.importJSON = function (text) {
    var obj = JSON.parse(text);
    if (!obj || !Array.isArray(obj.members) || !Array.isArray(obj.exercises)) throw new Error('format');
    store.db = normalize(obj);
    store.save(true);
  };

  BA.store = store;
})();
