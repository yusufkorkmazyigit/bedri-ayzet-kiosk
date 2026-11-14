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
    rev: 0,                // her kayıtta artar; türetilmiş önbellekler (kod dizini) buna bakar
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
    db.exercises.forEach(function (e) {
      if (e.photos == null && seedPhotos[e.id]) e.photos = seedPhotos[e.id];
      e.code = e.code ? BA.codeKey(e.code) : '';
    });
    // Eski sürüm bölge kimliklerini yenilerine taşı (sirt → kanat, kol → pazu/arka kol, kalca → bacak)
    var known = {};
    BA.REGIONS.forEach(function (r) { known[r.id] = 1; });
    db.exercises.forEach(function (e) {
      if (known[e.region]) return;
      var to = BA.REGION_ALIAS[e.region] || 'omuz';
      if (to === 'pazu' && /tricep|dips|kickback|skull|push.?down|overhead/i.test(e.id + ' ' + e.name)) to = 'arkakol';
      e.region = to;
    });
    // Salon kütüphanesi: yeni gelen hareketler bir kez eklenir (sonradan silinenler geri gelmez)
    if ((db.catalogVersion || 0) < (BA.CATALOG_VERSION || 0)) {
      var have = {};
      db.exercises.forEach(function (e) { have[e.id] = 1; });
      BA.catalogExercises().forEach(function (e) { if (!have[e.id]) db.exercises.push(e); });
      db.catalogVersion = BA.CATALOG_VERSION;
    }
    var cr = {};
    Object.keys(db.settings.codeRegions || {}).forEach(function (l) {
      var r = db.settings.codeRegions[l];
      cr[l] = known[r] ? r : base.settings.codeRegions[l] || BA.REGION_ALIAS[r] || 'omuz';
    });
    db.settings.codeRegions = Object.assign({}, base.settings.codeRegions, cr);
    db.templates = Array.isArray(db.templates) ? db.templates : base.templates;
    db.members = Array.isArray(db.members) ? db.members : [];
    db.members.forEach(function (m) {
      m.id = String(m.id);
      m.measurements = Array.isArray(m.measurements) ? m.measurements : [];
      m.measurements.forEach(function (x) { if (!x.id) x.id = BA.uid(); });
      if (m.birthDate === undefined) m.birthDate = '';
      if (m.membership === undefined) m.membership = null;
      if (!Array.isArray(m.membershipLog)) m.membershipLog = [];
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
    store.rev++;
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
  /* Salon medyası videos/ klasöründe (fotoğraflar ve önizlemeler dahil) */
  store.mediaBase = function () { return store.mode === 'server' ? 'videos/' : '../videos/'; };
  store.photoUrls = function (ex) {
    var out = [];
    if (!ex) return out;
    var imgs = ex.images && ex.images.length ? ex.images : ex.image ? [ex.image] : null;
    if (imgs) return imgs.map(function (f) { return store.mediaBase() + encodeURIComponent(f); });
    for (var i = 0; i < (ex.photos || 0); i++) out.push('img/ex/' + encodeURIComponent(ex.id) + '-' + i + '.jpg');
    return out;
  };
  /* Kart önizlemesi: hazır küçük resim (videos/thumbs) ya da ilk fotoğraf */
  store.thumbUrl = function (ex) {
    if (ex && ex.thumb) return store.mediaBase() + 'thumbs/' + encodeURIComponent(ex.thumb);
    return store.photoUrls(ex)[0] || '';
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

  /* Kodlu hareketler kod sırasıyla, kodsuzlar adla (sonda) */
  store.exCmp = function (a, b) {
    return (a.code || b.code) ? BA.codeCmp(a.code, b.code) : a.name.localeCompare(b.name, 'tr');
  };
  store.exercisesIn = function (regionId) {
    return store.db.exercises
      .filter(function (e) { return e.region === regionId; })
      .sort(store.exCmp);
  };

  /* ------------------------------------------------------------ hareket kodları
     Dizin yalnızca veri değiştiğinde (rev) yeniden kurulur; arama 300+ kodda bile anlık. */
  var codeIdx = null, codeList = null, groupIdx = null, codeRev = -1;
  function codeIndex() {
    if (codeIdx && codeRev === store.rev) return;
    codeIdx = {}; codeList = []; groupIdx = {};
    store.db.exercises.forEach(function (e) {
      if (!e.code || codeIdx[e.code]) return;
      codeIdx[e.code] = e; codeList.push(e);
    });
    codeList.sort(function (a, b) { return BA.codeCmp(a.code, b.code); });
    codeList.forEach(function (e) {
      var b = BA.codeBase(e.code);
      (groupIdx[b] || (groupIdx[b] = [])).push(e);
    });
    codeRev = store.rev;
  }
  /* Ana hareket + varyasyonları (kod sırasıyla) */
  store.variantsOf = function (base) { codeIndex(); return groupIdx[BA.codeBase(base)] || []; };
  store.isMain = function (ex) { return !!ex && !!ex.code && ex.code === BA.codeBase(ex.code); };
  /* "A1[A]" tam eşleşme; "A1,2" → A-1'in 2. varyasyonu */
  store.byCode = function (code) {
    codeIndex();
    var k = BA.codeKey(code);
    if (codeIdx[k]) return codeIdx[k];
    var m = /^(.+),(\d+)$/.exec(k);
    if (!m) return null;
    var vars = (groupIdx[m[1]] || []).filter(function (e) { return e.code !== m[1]; });
    return vars[+m[2] - 1] || null;
  };

  /* Kodla arama: "A" → A grubunun ana hareketleri; "A1" → A-1 ve çeşitleri, sonra A10–A19;
     "A1,2" / "A1B" → o varyasyon ve kardeşleri. */
  store.searchCode = function (q, limit) {
    codeIndex();
    var k = BA.codeKey(q).replace(/,$/, '');
    if (!k) return [];
    var out = [], seen = {};
    function push(e) { if (e && !seen[e.id]) { seen[e.id] = 1; out.push(e); } }
    if (/^[A-ZÇĞÖŞÜ]+$/.test(k)) {
      codeList.forEach(function (e) { if (store.isMain(e) && e.code.replace(/\d.*$/, '') === k) push(e); });
      return out.slice(0, limit || 60);
    }
    push(store.byCode(k));
    var base = BA.codeBase(k);
    (groupIdx[base] || []).forEach(push);
    if (/\d$/.test(base)) codeList.forEach(function (e) {
      if (store.isMain(e) && e.code.indexOf(base) === 0 && /\d/.test(e.code.charAt(base.length))) push(e);
    });
    return out.slice(0, limit || 60);
  };
  store.codeLetters = function () {
    codeIndex();
    var seen = {}, out = [];
    codeList.forEach(function (e) { var l = /^[A-ZÇĞÖŞÜ]+/.exec(e.code); if (l && !seen[l[0]]) { seen[l[0]] = 1; out.push(l[0]); } });
    return out;
  };

  /* Hocanın listesi: her satır "A1,1 OMUZ YANA AÇIŞ" (Excel'den yapıştırma da olur: kod<TAB>ad) */
  store.parseCodeList = function (text) {
    var rows = [], bad = [], seen = {};
    String(text || '').split(/\r?\n/).forEach(function (raw) {
      var line = raw.replace(/\t+/g, ' ').trim();
      if (!line) return;
      var m = /^([A-Za-zÇĞİÖŞÜçğıöşü]{1,2}\s*-?\s*\d{1,3}(?:\s*\[\s*[A-Za-zÇĞİÖŞÜçğıöşü]\s*\]|\s*[.,\/]\s*\d{1,2}|[A-ZÇĞİÖŞÜ](?=\s))?)\s*[:–\-=)]?\s+(\S.*)$/.exec(line);
      if (!m) { bad.push(line); return; }
      var code = BA.codeKey(m[1]);
      if (seen[code]) { bad.push(line + '  (tekrar eden kod)'); return; }
      seen[code] = 1;
      rows.push({ code: code, name: BA.tidyName(m[2]), letter: /^[A-ZÇĞÖŞÜ]+/.exec(code)[0] });
    });
    return { rows: rows, bad: bad };
  };

  /* Var olan kodun adını günceller (video/fotoğraf korunur), olmayanı yeni hareket olarak ekler. */
  store.applyCodeList = function (rows, letterRegion) {
    var added = 0, updated = 0;
    rows.forEach(function (r) {
      var ex = store.byCode(r.code);
      if (ex) {
        if (ex.name !== r.name) { ex.name = r.name; updated++; }
        return;
      }
      var id = 'k-' + BA.norm(r.code).replace(/[^a-z0-9]+/g, '-').replace(/-+$/, '');
      while (store.exercise(id)) id += '-' + BA.uid().slice(-3);
      store.db.exercises.push({
        id: id, code: r.code, name: r.name, region: letterRegion[r.letter] || 'omuz',
        equipment: '', level: '', video: '', photos: 0, steps: [], mistakes: []
      });
      added++;
      store.rev++; // dizin yeni kodu görsün (aynı listede tekrar eklenmesin)
    });
    store.save(true);
    return { added: added, updated: updated };
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

  /* ------------------------------------------------------------ üyelik */
  function logMembership(m, text) {
    m.membershipLog = m.membershipLog || [];
    m.membershipLog.unshift({ at: BA.todayISO(), text: text });
    if (m.membershipLog.length > 30) m.membershipLog.length = 30;
  }

  /* Yeni üye ya da sıfırdan paket: başlangıç + ay → bitiş */
  store.startMembership = function (m, start, months) {
    m.membership = { start: start, end: BA.addMonths(start, months), months: months };
    logMembership(m, months + ' aylık paket başlatıldı (' + BA.fmtDate(start) + ' – ' + BA.fmtDate(m.membership.end) + ')');
  };

  /* Paket yenileme: bitmemişse mevcut bitişten, bitmişse bugünden itibaren uzatır */
  store.renewMembership = function (m, months) {
    var ms = m.membership;
    var from = ms && ms.end && BA.daysUntil(ms.end) > 0 ? ms.end : BA.todayISO();
    var end = BA.addMonths(from, months);
    m.membership = { start: ms && ms.end && BA.daysUntil(ms.end) > 0 ? ms.start : from, end: end, months: months };
    logMembership(m, months + ' aylık paket eklendi, yeni bitiş ' + BA.fmtDate(end));
    store.save();
  };

  /* Bitiş tarihini elle değiştirme (dondurma, telafi vb.) */
  store.setMembershipEnd = function (m, end, note) {
    var ms = m.membership || { start: BA.todayISO(), months: null };
    var old = ms.end;
    ms.end = end;
    m.membership = ms;
    var diff = old ? Math.round((BA.parseISO(end) - BA.parseISO(old)) / 864e5) : null;
    logMembership(m, 'Bitiş ' + (old ? BA.fmtDate(old) + ' → ' : '') + BA.fmtDate(end) +
      (diff ? ' (' + (diff > 0 ? '+' : '') + diff + ' gün)' : '') + (note ? ' · ' + note : ''));
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
