/* Eğitmen paneli: üyeler, üye detayı (program + ölçümler), şablonlar, hareket kütüphanesi, ayarlar. */
(function () {
  'use strict';
  var BA = window.BA, esc = BA.esc, icon = BA.icon, S = function () { return BA.store; };

  var NAV = [
    { id: 'members',   label: 'Üyeler',            icon: 'users' },
    { id: 'templates', label: 'Şablonlar', icon: 'list' },
    { id: 'exercises', label: 'Hareketler',        icon: 'film' },
    { id: 'settings',  label: 'Ayarlar',           icon: 'gear' }
  ];

  BA.views.trainer = function (root, params) {
    params = params || {};
    var tab = params.tab || 'members';
    var navOn = tab === 'member' ? 'members' : tab === 'editor' ? (params.kind === 'template' ? 'templates' : 'members') : tab;

    root.innerHTML = '<div class="screen">' +
      BA.topbar('<button class="btn btn--ghost" data-act="logout">' + icon('logout') + '<span>Çıkış</span></button>',
        '<div class="greet"><b>Eğitmen Paneli</b><span>' + (S().mode === 'server' ? 'Veriler bu bilgisayara kaydediliyor' : 'Yerel tarayıcı modu') + '</span></div>') +
      '<div class="admin">' +
        '<nav class="side">' + NAV.map(function (n) {
          return '<button class="side__item' + (n.id === navOn ? ' is-on' : '') + '" data-act="nav" data-tab="' + n.id + '">' + icon(n.icon) + '<span>' + n.label + '</span></button>';
        }).join('') + '</nav>' +
        '<main class="admin__main" data-ref="main"></main>' +
      '</div></div>';

    var main = root.querySelector('[data-ref=main]');
    var page = (PAGES[tab] || PAGES.members)(main, params) || {};

    return {
      actions: Object.assign({
        logout: function () { BA.app.logout(); },
        nav: function (el) { BA.app.go('trainer', { tab: el.getAttribute('data-tab') }); }
      }, page.actions || {}),
      onInput: page.onInput,
      onChange: page.onChange
    };
  };

  function pageHead(title, sub, actions) {
    return '<header class="page-head"><div><h1>' + title + '</h1>' + (sub ? '<p>' + sub + '</p>' : '') + '</div>' +
      '<div class="page-head__act">' + (actions || '') + '</div></header>';
  }

  var PAGES = {};

  /* ================================================================ ÜYELER */
  PAGES.members = function (main, params) {
    var q = params.q || '';
    main.innerHTML = pageHead('Üyeler', S().db.members.length + ' kayıtlı üye',
        '<button class="btn btn--primary" data-act="newMember">' + icon('plus') + '<span>Yeni Üye</span></button>') +
      '<div class="searchbar">' + icon('search') + '<input type="text" data-ref="q" placeholder="İsim veya üye no ile ara" value="' + esc(q) + '"></div>' +
      '<div class="mlist" data-ref="list"></div>';
    var listEl = main.querySelector('[data-ref=list]');
    paint();

    function paint() {
      var nq = BA.norm(q);
      var list = S().db.members.filter(function (m) {
        return !nq || BA.norm(m.name).indexOf(nq) > -1 || m.id.indexOf(q) > -1;
      }).sort(function (a, b) { return a.name.localeCompare(b.name, 'tr'); });
      if (!list.length) {
        listEl.innerHTML = '<div class="empty">' + icon('users') + '<b>' + (q ? 'Eşleşen üye yok' : 'Henüz üye yok') + '</b>' +
          '<span>' + (q ? 'Aramayı değiştirmeyi deneyin.' : '“Yeni Üye” ile ilk kaydı oluşturun.') + '</span></div>';
        return;
      }
      listEl.innerHTML = list.map(function (m) {
        var ms = S().sortedMeasurements(m), last = ms[ms.length - 1];
        return '<button class="mrow" data-act="openMember" data-id="' + esc(m.id) + '">' +
          '<span class="avatar">' + esc(BA.initials(m.name)) + '</span>' +
          '<span class="mrow__name"><b>' + esc(m.name) + '</b><span>No ' + esc(m.id) + (m.goal ? ' · ' + esc(m.goal) : '') + '</span></span>' +
          '<span class="mrow__col"><small>Program</small>' + (m.program ? esc(m.program.name) : '<em>Atanmadı</em>') + '</span>' +
          '<span class="mrow__col"><small>Son ölçüm</small>' + (last ? BA.fmtDate(last.date) : '<em>Yok</em>') + '</span>' +
          icon('arrow', 'mrow__go') +
        '</button>';
      }).join('');
    }

    return {
      actions: {
        newMember: function () { memberForm(null); },
        openMember: function (el) { BA.app.go('trainer', { tab: 'member', id: el.getAttribute('data-id') }); }
      },
      onInput: function (ev) {
        if (ev.target.getAttribute('data-ref') === 'q') { q = ev.target.value; BA.app.params.q = q; paint(); }
      }
    };
  };

  /* Yeni / düzenle üye formu */
  function memberForm(m) {
    var isNew = !m;
    var d = m || { id: S().nextMemberId(), name: '', phone: '', gender: 'Erkek', birthYear: '', goal: BA.GOALS[0], joined: BA.todayISO(), note: '' };
    var tplOpts = [{ value: '', label: 'Şimdilik atama' }].concat(S().db.templates.map(function (t) { return { value: t.id, label: t.name + ' · ' + (t.level || '') }; }));
    var md = BA.modal({
      title: isNew ? 'Yeni Üye' : 'Üyeyi Düzenle',
      subtitle: isNew ? 'Üye numarası, üyenin kiosktan giriş yapacağı koddur.' : 'No ' + m.id,
      body: '<form class="form grid2" onsubmit="return false">' +
        BA.field('Üye No', 'id', d.id, { numeric: true, max: 6 }) +
        BA.field('Ad Soyad', 'name', d.name, { ph: 'Örn. Ahmet Yılmaz' }) +
        BA.field('Telefon', 'phone', d.phone, { numeric: true, ph: '05xx xxx xx xx', max: 16 }) +
        BA.field('Cinsiyet', 'gender', d.gender, { options: ['Erkek', 'Kadın', 'Belirtilmemiş'] }) +
        BA.field('Doğum yılı', 'birthYear', d.birthYear, { numeric: true, max: 4 }) +
        BA.field('Hedef', 'goal', d.goal, { options: BA.GOALS }) +
        '<label class="field"><span>Kayıt tarihi</span><input type="date" name="joined" value="' + esc(d.joined) + '"></label>' +
        (isNew ? BA.field('Başlangıç programı', 'tpl', 'tpl-fb-a', { options: tplOpts }) : '<span></span>') +
        BA.field('Eğitmen notu', 'note', d.note, { textarea: true, rows: 2, cls: 'span2', ph: 'Sakatlık, dikkat edilecekler vb.' }) +
      '</form>',
      foot: '<button class="btn btn--ghost" data-act="__close">Vazgeç</button><button class="btn btn--primary" data-act="save">' + icon('check') + 'Kaydet</button>',
      actions: {
        save: function () {
          var f = BA.formData(md.body);
          if (!/^\d{3,6}$/.test(f.id)) return BA.toast('Üye no 3–6 haneli bir sayı olmalı.', 'err');
          if (!f.name) return BA.toast('Ad soyad gerekli.', 'err');
          var clash = S().member(f.id);
          if (clash && (isNew || f.id !== m.id)) return BA.toast('Bu üye no zaten ' + clash.name + ' için kullanılıyor.', 'err');
          var rec = Object.assign({}, m || { measurements: [], program: null }, {
            id: f.id, name: f.name, phone: f.phone, gender: f.gender, goal: f.goal,
            birthYear: f.birthYear ? parseInt(f.birthYear, 10) || '' : '', joined: f.joined, note: f.note
          });
          S().saveMember(rec, m && m.id);
          if (isNew && f.tpl) S().assignTemplate(rec, f.tpl);
          md.close();
          BA.toast(isNew ? 'Üye oluşturuldu.' : 'Üye güncellendi.', 'ok');
          BA.app.go('trainer', { tab: 'member', id: rec.id });
        }
      }
    });
  }

  /* ================================================================ ÜYE DETAYI */
  PAGES.member = function (main, params) {
    var m = S().member(params.id);
    if (!m) { BA.app.go('trainer', { tab: 'members' }); return; }
    var ms = S().sortedMeasurements(m);
    var p = m.program;

    var progHtml = p && p.days && p.days.length ?
      '<div class="pcard__title"><b>' + esc(p.name) + '</b><span>' + p.days.length + ' gün · ' + BA.fmtDate(p.assignedAt) + ' tarihinde atandı</span></div>' +
      p.days.map(function (d) {
        return '<div class="pday"><b>' + esc(d.name) + '</b><span>' + d.items.map(function (it) {
          var ex = S().exercise(it.exerciseId); return ex ? esc(ex.name) : '';
        }).filter(Boolean).join(' · ') + '</span></div>';
      }).join('') :
      '<div class="empty empty--sm">' + icon('list') + '<b>Program atanmadı</b></div>';

    var cols = BA.METRICS;
    var table = ms.length ?
      '<div class="tablewrap"><table class="mtable"><thead><tr><th>Tarih</th>' + cols.map(function (c) {
        return '<th>' + esc(c.label.replace(' çevresi', '')) + '<small>' + c.unit + '</small></th>';
      }).join('') + '<th></th></tr></thead><tbody>' +
      ms.slice().reverse().map(function (x) {
        return '<tr><td>' + BA.fmtDate(x.date) + '</td>' + cols.map(function (c) {
          return '<td>' + (x[c.key] != null && x[c.key] !== '' ? BA.fmtNum(+x[c.key]) : '—') + '</td>';
        }).join('') +
        '<td class="actions"><button class="icon-btn" data-act="editMeas" data-id="' + x.id + '" aria-label="Düzenle">' + icon('edit') + '</button>' +
        '<button class="icon-btn icon-btn--danger" data-act="delMeas" data-id="' + x.id + '" aria-label="Sil">' + icon('trash') + '</button></td></tr>';
      }).join('') + '</tbody></table></div>' :
      '<div class="empty empty--sm">' + icon('ruler') + '<b>Henüz ölçüm yok</b></div>';

    main.innerHTML =
      '<button class="crumb" data-act="nav" data-tab="members">' + icon('back') + 'Üyeler</button>' +
      '<header class="mhead">' +
        '<span class="avatar avatar--lg">' + esc(BA.initials(m.name)) + '</span>' +
        '<div class="mhead__txt"><h1>' + esc(m.name) + '</h1>' +
          '<p><span class="idchip">No ' + esc(m.id) + '</span>' + [m.goal, m.gender, m.birthYear ? (new Date().getFullYear() - m.birthYear) + ' yaş' : '', m.phone, m.joined ? 'Kayıt ' + BA.fmtDate(m.joined) : '']
            .filter(Boolean).map(esc).join(' · ') + '</p>' +
          (m.note ? '<p class="note">' + icon('edit') + esc(m.note) + '</p>' : '') +
        '</div>' +
        '<div class="mhead__act"><button class="btn btn--ghost" data-act="editMember">' + icon('edit') + 'Düzenle</button>' +
        '<button class="btn btn--ghost btn--danger-ghost" data-act="delMember">' + icon('trash') + 'Sil</button></div>' +
      '</header>' +
      '<div class="cols">' +
        '<section class="card">' +
          '<header class="card__head"><h2>Fitness Programı</h2></header>' +
          '<div class="assign">' + BA.field('Şablondan ata', 'tpl', '', {
            options: [{ value: '', label: 'Şablon seçin…' }].concat(S().db.templates.map(function (t) { return { value: t.id, label: t.name + ' · ' + (t.level || '') }; }))
          }) + '<button class="btn btn--primary" data-act="assign">Ata</button></div>' +
          '<div class="pcard">' + progHtml + '</div>' +
          '<div class="card__foot">' +
            '<button class="btn btn--ghost" data-act="editProgram">' + icon('edit') + (p ? 'Programı düzenle' : 'Sıfırdan program oluştur') + '</button>' +
            (p ? '<button class="btn btn--ghost btn--danger-ghost" data-act="clearProgram">' + icon('trash') + 'Kaldır</button>' : '') +
          '</div>' +
        '</section>' +
        '<section class="card">' +
          '<header class="card__head"><h2>Vücut Ölçümleri</h2><button class="btn btn--primary" data-act="newMeas">' + icon('plus') + 'Yeni ölçüm</button></header>' +
          table +
        '</section>' +
      '</div>';

    function reload() { BA.app.go('trainer', { tab: 'member', id: m.id }); }

    return {
      actions: {
        editMember: function () { memberForm(m); },
        delMember: function () {
          BA.confirm(m.name + ' ve tüm ölçüm geçmişi silinecek. Bu işlem geri alınamaz.', { ok: 'Üyeyi sil', danger: true }).then(function (ok) {
            if (!ok) return;
            S().remove('members', m.id);
            BA.toast('Üye silindi.', 'ok');
            BA.app.go('trainer', { tab: 'members' });
          });
        },
        assign: function () {
          var sel = main.querySelector('select[name=tpl]');
          if (!sel.value) return BA.toast('Önce bir şablon seçin.', 'err');
          var go = function () { S().assignTemplate(m, sel.value); BA.toast('Program atandı.', 'ok'); reload(); };
          if (m.program) BA.confirm('Mevcut program (“' + m.program.name + '”) yenisiyle değiştirilecek.', { ok: 'Değiştir' }).then(function (ok) { if (ok) go(); });
          else go();
        },
        editProgram: function () { BA.app.go('trainer', { tab: 'editor', kind: 'member', id: m.id }); },
        clearProgram: function () {
          BA.confirm('Üyenin programı kaldırılacak.', { ok: 'Kaldır', danger: true }).then(function (ok) {
            if (ok) { m.program = null; S().save(); reload(); }
          });
        },
        newMeas: function () { measForm(m, null, reload); },
        editMeas: function (el) { measForm(m, find(el), reload); },
        delMeas: function (el) {
          var x = find(el);
          BA.confirm(BA.fmtDate(x.date) + ' tarihli ölçüm silinecek.', { ok: 'Sil', danger: true }).then(function (ok) {
            if (!ok) return;
            m.measurements = m.measurements.filter(function (y) { return y.id !== x.id; });
            S().save(); reload();
          });
        }
      }
    };
    function find(el) {
      var id = el.getAttribute('data-id');
      return m.measurements.filter(function (x) { return x.id === id; })[0];
    }
  };

  /* Ölçüm formu — yeni kayıtta boy bir önceki ölçümden gelir, diğerleri ipucu olarak gösterilir */
  function measForm(m, rec, done) {
    var ms = S().sortedMeasurements(m), prev = ms[ms.length - 1] || {};
    var d = rec || { date: BA.todayISO(), height: prev.height };
    var md = BA.modal({
      title: rec ? 'Ölçümü Düzenle' : 'Yeni Ölçüm',
      subtitle: m.name + ' · boş bırakılan alanlar kaydedilmez',
      body: '<form class="form grid3" onsubmit="return false">' +
        '<label class="field"><span>Tarih</span><input type="date" name="date" value="' + esc(d.date) + '"></label>' +
        BA.METRICS.map(function (c) {
          var v = d[c.key] != null ? String(d[c.key]).replace('.', ',') : '';
          return BA.field(c.label, c.key, v, { numeric: true, unit: c.unit, ph: prev[c.key] != null ? 'önceki: ' + BA.fmtNum(+prev[c.key]) : '' });
        }).join('') +
      '</form>',
      foot: '<button class="btn btn--ghost" data-act="__close">Vazgeç</button><button class="btn btn--primary" data-act="save">' + icon('check') + 'Kaydet</button>',
      actions: {
        save: function () {
          var f = BA.formData(md.body);
          if (!f.date) return BA.toast('Tarih gerekli.', 'err');
          var out = { id: rec ? rec.id : BA.uid(), date: f.date }, any = false, bad = null;
          BA.METRICS.forEach(function (c) {
            if (f[c.key] === '') return;
            var n = BA.num(f[c.key]);
            if (n == null || n <= 0 || n > 400) bad = c.label;
            else { out[c.key] = n; any = true; }
          });
          if (bad) return BA.toast(bad + ' için geçerli bir sayı girin.', 'err');
          if (!any) return BA.toast('En az bir ölçüm değeri girin.', 'err');
          if (rec) m.measurements = m.measurements.map(function (x) { return x.id === rec.id ? out : x; });
          else m.measurements.push(out);
          S().save();
          md.close();
          BA.toast('Ölçüm kaydedildi.', 'ok');
          done();
        }
      }
    });
  }

  /* ================================================================ ŞABLONLAR */
  PAGES.templates = function (main) {
    var usage = {};
    S().db.members.forEach(function (m) { if (m.program && m.program.templateId) usage[m.program.templateId] = (usage[m.program.templateId] || 0) + 1; });

    main.innerHTML = pageHead('Program Şablonları', 'Hazır programlar — yeni başlayan üyelere tek dokunuşla atanır.',
        '<button class="btn btn--primary" data-act="newTpl">' + icon('plus') + '<span>Yeni Şablon</span></button>') +
      '<div class="tgrid">' + S().db.templates.map(function (t) {
        var n = t.days.reduce(function (a, d) { return a + d.items.length; }, 0);
        return '<article class="tcard">' +
          '<header><span class="lvl lvl--' + BA.LEVELS.indexOf(t.level) + '">' + esc(t.level || '—') + '</span>' +
          '<h3>' + esc(t.name) + '</h3><p>' + t.days.length + ' gün · ' + n + ' hareket' + (usage[t.id] ? ' · ' + usage[t.id] + ' üyede' : '') + '</p></header>' +
          '<ul>' + t.days.map(function (d) { return '<li><b>' + esc(d.name) + '</b><span>' + d.items.length + ' hareket</span></li>'; }).join('') + '</ul>' +
          (t.note ? '<p class="tcard__note">' + esc(t.note) + '</p>' : '') +
          '<footer><button class="btn btn--ghost btn--sm" data-act="editTpl" data-id="' + t.id + '">' + icon('edit') + 'Düzenle</button>' +
          '<button class="btn btn--ghost btn--sm" data-act="dupTpl" data-id="' + t.id + '">' + icon('copy') + 'Kopyala</button>' +
          '<button class="icon-btn icon-btn--danger" data-act="delTpl" data-id="' + t.id + '" aria-label="Sil">' + icon('trash') + '</button></footer>' +
        '</article>';
      }).join('') + '</div>';

    return {
      actions: {
        newTpl: function () { BA.app.go('trainer', { tab: 'editor', kind: 'template' }); },
        editTpl: function (el) { BA.app.go('trainer', { tab: 'editor', kind: 'template', id: el.getAttribute('data-id') }); },
        dupTpl: function (el) {
          var c = BA.clone(S().template(el.getAttribute('data-id')));
          c.id = 'tpl-' + BA.uid(); c.name += ' (kopya)';
          S().upsert('templates', c);
          BA.toast('Şablon kopyalandı.', 'ok');
          BA.app.go('trainer', { tab: 'templates' });
        },
        delTpl: function (el) {
          var t = S().template(el.getAttribute('data-id'));
          BA.confirm('“' + t.name + '” şablonu silinecek. Bu şablonun atandığı üyelerin programları etkilenmez.', { ok: 'Sil', danger: true }).then(function (ok) {
            if (!ok) return;
            S().remove('templates', t.id);
            BA.app.go('trainer', { tab: 'templates' });
          });
        }
      }
    };
  };

  /* ================================================================ PROGRAM DÜZENLEYİCİ (şablon veya üye programı) */
  PAGES.editor = function (main, params) {
    var isTpl = params.kind === 'template';
    var member = isTpl ? null : S().member(params.id);
    var source = isTpl ? (params.id ? S().template(params.id) : null) : member && member.program;
    var draft = source ? BA.clone(source) : { name: isTpl ? '' : 'Kişisel Program', level: 'Başlangıç', note: '', days: [{ name: 'Gün 1', items: [] }] };
    if (!isTpl && !member) { BA.app.go('trainer', { tab: 'members' }); return; }

    var back = isTpl ? { tab: 'templates' } : { tab: 'member', id: member.id };

    return BA.programEditor(main, {
      draft: draft,
      isTemplate: isTpl,
      title: isTpl ? (source ? 'Şablonu düzenle' : 'Yeni şablon') : member.name + ' · Program',
      crumb: isTpl ? 'Şablonlar' : member.name,
      onCancel: function () { BA.app.go('trainer', back); },
      onSave: function (d) {
        if (isTpl) {
          d.id = d.id || 'tpl-' + BA.uid();
          S().upsert('templates', d);
        } else {
          d.assignedAt = d.assignedAt || BA.todayISO();
          member.program = d;
          S().save();
        }
        BA.toast('Program kaydedildi.', 'ok');
        BA.app.go('trainer', back);
      }
    });
  };

  /* ================================================================ HAREKETLER */
  PAGES.exercises = function (main, params) {
    var reg = params.region || 'all';
    var server = S().mode === 'server';

    function render() {
      var list = S().db.exercises.filter(function (e) { return reg === 'all' || e.region === reg; })
        .sort(function (a, b) {
          var ra = BA.REGIONS.indexOf(BA.regionById(a.region)), rb = BA.REGIONS.indexOf(BA.regionById(b.region));
          return ra - rb || a.name.localeCompare(b.name, 'tr');
        });
      var missing = S().db.exercises.filter(function (e) { return S().hasVideo(e) === false; }).length;
      main.innerHTML = pageHead('Hareket Kütüphanesi',
          S().db.exercises.length + ' hareket' + (server ? ' · ' + missing + ' tanesinin videosu eksik' : ''),
          '<button class="btn btn--primary" data-act="newEx">' + icon('plus') + '<span>Yeni Hareket</span></button>') +
        '<div class="chipbar">' + [{ id: 'all', name: 'Tümü' }].concat(BA.REGIONS).map(function (r) {
          return '<button class="chip' + (reg === r.id ? ' is-on' : '') + '" data-act="reg" data-id="' + r.id + '">' + esc(r.name) + '</button>';
        }).join('') + '</div>' +
        '<div class="exlist">' + list.map(function (e) {
          var has = S().hasVideo(e);
          return '<div class="exrow">' +
            '<button class="exrow__main" data-act="preview" data-id="' + esc(e.id) + '">' +
              '<span class="vstat vstat--' + (has === true ? 'on' : has === false ? 'off' : 'unk') + '">' + icon(has === false ? 'film' : 'play') + '</span>' +
              '<span class="exrow__name"><b>' + esc(e.name) + '</b><span>' + esc(BA.regionById(e.region).name) + ' · ' + esc(e.equipment || '') + ' · ' + esc(e.level || '') + '</span></span>' +
              '<span class="exrow__file">' + (e.video ? esc(e.video) : '<em>video yok</em>') + (has === false && e.video ? '<small>dosya bulunamadı</small>' : '') + '</span>' +
            '</button>' +
            '<button class="icon-btn" data-act="editEx" data-id="' + esc(e.id) + '" aria-label="Düzenle">' + icon('edit') + '</button>' +
          '</div>';
        }).join('') + '</div>';
    }
    render();

    return {
      actions: {
        reg: function (el) { reg = el.getAttribute('data-id'); BA.app.params.region = reg; render(); },
        preview: function (el) { BA.showExercise(el.getAttribute('data-id')); },
        newEx: function () { exerciseForm(null, render, reg); },
        editEx: function (el) { exerciseForm(S().exercise(el.getAttribute('data-id')), render); }
      }
    };
  };

  function exerciseForm(ex, done, region) {
    var isNew = !ex;
    var d = ex || { id: '', name: '', region: region && region !== 'all' ? region : 'gogus', equipment: '', level: 'Başlangıç', video: '', steps: [], mistakes: [] };
    var server = S().mode === 'server';
    var vids = S().videoList();
    if (d.video && vids.indexOf(d.video.toLowerCase()) < 0) vids.unshift(d.video);

    var videoField = server ?
      '<div class="field span2"><span>Video dosyası <em>videos/ klasöründen</em></span><div class="vpick">' +
        '<select name="video"><option value="">Video yok</option>' + vids.map(function (v) {
          return '<option value="' + esc(v) + '"' + (v.toLowerCase() === String(d.video).toLowerCase() ? ' selected' : '') + '>' + esc(v) + '</option>';
        }).join('') + '</select>' +
        '<button type="button" class="btn btn--ghost" data-act="pick">' + icon('upload') + 'Bilgisayardan yükle</button>' +
        '<input type="file" accept="video/mp4,video/webm" hidden data-ref="file">' +
      '</div><div class="progress" data-ref="prog" hidden><i></i><span></span></div></div>' :
      BA.field('Video dosya adı (videos/ klasöründe)', 'video', d.video, { cls: 'span2', ph: 'ornek-hareket.mp4' });

    var md = BA.modal({
      cls: 'modal--lg',
      title: isNew ? 'Yeni Hareket' : 'Hareketi Düzenle',
      body: '<form class="form grid2" onsubmit="return false">' +
        BA.field('Hareket adı', 'name', d.name, { ph: 'Örn. Bench Press' }) +
        BA.field('Bölge', 'region', d.region, { options: BA.REGIONS.map(function (r) { return { value: r.id, label: r.name }; }) }) +
        BA.field('Ekipman', 'equipment', d.equipment, { ph: 'Dumbbell, makine…' }) +
        BA.field('Seviye', 'level', d.level, { options: BA.LEVELS }) +
        videoField +
        BA.field('Nasıl yapılır? (her satır bir adım)', 'steps', (d.steps || []).join('\n'), { textarea: true, rows: 5, cls: 'span2' }) +
        BA.field('Sık yapılan hatalar (her satır bir madde)', 'mistakes', (d.mistakes || []).join('\n'), { textarea: true, rows: 3, cls: 'span2' }) +
      '</form>',
      foot: (isNew ? '' : '<button class="btn btn--ghost btn--danger-ghost" data-act="del">' + icon('trash') + 'Sil</button><span class="grow"></span>') +
        '<button class="btn btn--ghost" data-act="__close">Vazgeç</button><button class="btn btn--primary" data-act="save">' + icon('check') + 'Kaydet</button>',
      actions: {
        pick: function () { md.el.querySelector('[data-ref=file]').click(); },
        save: function () {
          var f = BA.formData(md.body);
          if (!f.name) return BA.toast('Hareket adı gerekli.', 'err');
          var lines = function (s) { return s.split('\n').map(function (x) { return x.trim(); }).filter(Boolean); };
          var rec = Object.assign({}, d, {
            id: d.id || BA.norm(f.name).replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') + '-' + BA.uid().slice(-4),
            name: f.name, region: f.region, equipment: f.equipment, level: f.level, video: f.video,
            steps: lines(f.steps), mistakes: lines(f.mistakes)
          });
          S().upsert('exercises', rec);
          md.close();
          BA.toast('Hareket kaydedildi.', 'ok');
          done();
        },
        del: function () {
          BA.confirm('“' + d.name + '” silinecek ve tüm programlardan çıkarılacak.', { ok: 'Sil', danger: true }).then(function (ok) {
            if (!ok) return;
            S().deleteExercise(d.id);
            md.close();
            done();
          });
        }
      }
    });

    var fileIn = md.el.querySelector('[data-ref=file]');
    if (fileIn) fileIn.addEventListener('change', function () {
      var file = fileIn.files[0];
      if (!file) return;
      var prog = md.el.querySelector('[data-ref=prog]'), bar = prog.querySelector('i'), txt = prog.querySelector('span');
      var base = (d.id || BA.norm(md.body.querySelector('[name=name]').value) || 'video').replace(/[^a-z0-9]+/g, '-');
      var ext = /\.webm$/i.test(file.name) ? '.webm' : '.mp4';
      prog.hidden = false;
      S().uploadVideo(file, base + ext, function (p) {
        bar.style.transform = 'scaleX(' + p + ')';
        txt.textContent = 'Yükleniyor… %' + Math.round(p * 100);
      }).then(function (name) {
        txt.textContent = 'Yüklendi: ' + name;
        var sel = md.el.querySelector('select[name=video]');
        if (![].some.call(sel.options, function (o) { return o.value === name; })) sel.add(new Option(name, name));
        sel.value = name;
      }).catch(function () {
        txt.textContent = 'Yükleme başarısız oldu.';
        BA.toast('Video yüklenemedi.', 'err');
      });
    });
  }

  /* ================================================================ AYARLAR */
  PAGES.settings = function (main) {
    var s = S().db.settings;
    var server = S().mode === 'server';
    main.innerHTML = pageHead('Ayarlar', 'Sürüm ' + esc(BA.VERSION || '—')) +
      '<div class="cols">' +
        '<section class="card"><header class="card__head"><h2>Salon ve kiosk</h2></header>' +
          '<form class="form grid2" data-ref="gen" onsubmit="return false">' +
            BA.field('Salon adı', 'gymName', s.gymName) +
            BA.field('Alt başlık', 'gymTagline', s.gymTagline) +
            BA.field('Üye oturumu otomatik kapanma', 'memberIdle', s.memberIdle, { numeric: true, unit: 'sn' }) +
            BA.field('Eğitmen oturumu otomatik kapanma', 'trainerIdle', s.trainerIdle, { numeric: true, unit: 'sn' }) +
            BA.field('Performans modu', 'lite', s.lite ? '1' : '0', { options: [{ value: '0', label: 'Normal (animasyonlu)' }, { value: '1', label: 'Hafif (eski cihazlar için)' }] }) +
            BA.field('Ekran klavyesi', 'osk', s.osk, { options: [{ value: 'auto', label: 'Otomatik (dokunmatikse aç)' }, { value: 'on', label: 'Her zaman açık' }, { value: 'off', label: 'Kapalı' }] }) +
          '</form>' +
          '<div class="card__foot"><button class="btn btn--primary" data-act="saveGen">' + icon('check') + 'Kaydet</button></div>' +
        '</section>' +
        '<div class="stack">' +
          '<section class="card"><header class="card__head"><h2>Eğitmen PIN</h2></header>' +
            '<form class="form grid2" data-ref="pin" onsubmit="return false">' +
              BA.field('Mevcut PIN', 'old', '', { numeric: true, max: 8 }) + '<span></span>' +
              BA.field('Yeni PIN', 'n1', '', { numeric: true, max: 8, ph: '4–8 rakam' }) +
              BA.field('Yeni PIN (tekrar)', 'n2', '', { numeric: true, max: 8 }) +
            '</form>' +
            '<div class="card__foot"><button class="btn btn--primary" data-act="savePin">PIN’i değiştir</button></div>' +
          '</section>' +
          '<section class="card"><header class="card__head"><h2>Veri ve yedek</h2></header>' +
            '<p class="muted">' + (server ?
              'Veriler <code>data/db.json</code> dosyasında tutulur; her gün otomatik yedek <code>data/backups/</code> klasörüne alınır.' :
              'Sunucu olmadan çalışıyor: veriler yalnızca bu tarayıcıda saklanır. Düzenli yedek almanız önerilir.') + '</p>' +
            '<div class="card__foot"><button class="btn btn--ghost" data-act="export">' + icon('download') + 'Yedeği indir</button>' +
            '<button class="btn btn--ghost" data-act="import">' + icon('upload') + 'Yedekten geri yükle</button>' +
            '<input type="file" accept="application/json,.json" hidden data-ref="imp"></div>' +
          '</section>' +
        '</div>' +
      '</div>';

    main.querySelector('[data-ref=imp]').addEventListener('change', function (e) {
      var file = e.target.files[0];
      if (!file) return;
      BA.confirm('Mevcut tüm veriler yedekteki verilerle değiştirilecek.', { ok: 'Geri yükle', danger: true }).then(function (ok) {
        if (!ok) return;
        var r = new FileReader();
        r.onload = function () {
          try { S().importJSON(r.result); BA.toast('Yedek geri yüklendi.', 'ok'); BA.app.go('trainer', { tab: 'settings' }); }
          catch (err) { BA.toast('Dosya geçerli bir yedek değil.', 'err'); }
        };
        r.readAsText(file);
      });
    });

    return {
      actions: {
        saveGen: function () {
          var f = BA.formData(main.querySelector('[data-ref=gen]'));
          var mi = parseInt(f.memberIdle, 10), ti = parseInt(f.trainerIdle, 10);
          if (!f.gymName) return BA.toast('Salon adı boş olamaz.', 'err');
          if (!(mi >= 20 && mi <= 3600) || !(ti >= 60 && ti <= 7200)) return BA.toast('Süreler: üye 20–3600 sn, eğitmen 60–7200 sn.', 'err');
          Object.assign(s, { gymName: f.gymName, gymTagline: f.gymTagline, memberIdle: mi, trainerIdle: ti, lite: f.lite === '1', osk: f.osk });
          S().save();
          BA.app.applySettings();
          BA.toast('Ayarlar kaydedildi.', 'ok');
          BA.app.go('trainer', { tab: 'settings' });
        },
        savePin: function () {
          var f = BA.formData(main.querySelector('[data-ref=pin]'));
          if (BA.hash(f.old) !== s.pinHash) return BA.toast('Mevcut PIN hatalı.', 'err');
          if (!/^\d{4,8}$/.test(f.n1)) return BA.toast('Yeni PIN 4–8 rakamdan oluşmalı.', 'err');
          if (f.n1 !== f.n2) return BA.toast('Yeni PIN’ler eşleşmiyor.', 'err');
          s.pinHash = BA.hash(f.n1);
          S().save(true);
          BA.toast('PIN değiştirildi.', 'ok');
          main.querySelector('[data-ref=pin]').reset();
        },
        export: function () {
          var blob = new Blob([S().exportJSON()], { type: 'application/json' });
          var a = document.createElement('a');
          a.href = URL.createObjectURL(blob);
          a.download = 'bedri-ayzet-yedek-' + BA.todayISO() + '.json';
          document.body.appendChild(a); a.click(); a.remove();
          setTimeout(function () { URL.revokeObjectURL(a.href); }, 2000);
          BA.toast('Yedek İndirilenler klasörüne kaydedildi.', 'ok');
        },
        import: function () { main.querySelector('[data-ref=imp]').click(); }
      }
    };
  };
})();
