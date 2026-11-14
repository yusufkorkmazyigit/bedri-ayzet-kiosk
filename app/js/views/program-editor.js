/* Program düzenleyici — hem şablonlar hem üyeye özel programlar için ortak.
   Metin alanları taslağı yerinde günceller (odak kaybolmaz); yapısal değişiklikler yeniden çizer. */
(function () {
  'use strict';
  var BA = window.BA, esc = BA.esc, icon = BA.icon;

  BA.programEditor = function (main, o) {
    var draft = o.draft;
    var dirty = false;

    function render() {
      main.innerHTML =
        '<button class="crumb" data-act="cancel">' + icon('back') + esc(o.crumb) + '</button>' +
        '<header class="page-head"><div><h1>' + esc(o.title) + '</h1><p>Hareketi kodla ekleyin (ör. <b>A1</b>, <b>A1A</b> ya da <b>A1A 3x12</b>) veya listeden seçin.</p></div>' +
          '<div class="page-head__act"><button class="btn btn--ghost" data-act="cancel">Vazgeç</button>' +
          '<button class="btn btn--primary" data-act="save">' + icon('check') + 'Kaydet</button></div></header>' +
        '<section class="card"><div class="form grid3">' +
          '<label class="field"><span>Program adı</span><input type="text" data-f="name" value="' + esc(draft.name) + '" placeholder="Örn. Full Body A"></label>' +
          (o.isTemplate ? '<label class="field"><span>Seviye</span><select data-f="level">' + BA.LEVELS.map(function (l) {
            return '<option' + (l === draft.level ? ' selected' : '') + '>' + l + '</option>';
          }).join('') + '</select></label>' : '<span></span>') +
          '<label class="field"><span>Not (üyenin göreceği)</span><input type="text" data-f="note" value="' + esc(draft.note || '') + '" placeholder="Örn. Haftada 3 gün"></label>' +
        '</div></section>' +
        draft.days.map(dayHtml).join('') +
        '<button class="btn btn--ghost btn--dashed btn--block" data-act="addDay">' + icon('plus') + 'Gün ekle</button>';
    }

    function dayHtml(d, di) {
      return '<section class="card day">' +
        '<header class="day__head"><span class="day__no">Gün ' + (di + 1) + '</span>' +
          '<input type="text" class="day__name" data-f="dayName" data-d="' + di + '" value="' + esc(d.name) + '" placeholder="Gün adı">' +
          (draft.days.length > 1 ? '<button class="icon-btn icon-btn--danger" data-act="delDay" data-d="' + di + '" aria-label="Günü sil">' + icon('trash') + '</button>' : '') +
        '</header>' +
        (d.items.length ? '<div class="erow erow--head"><span></span><span>Hareket</span><span>Set</span><span>Tekrar</span><span>Dinlenme (sn)</span><span>Not</span><span></span></div>' : '') +
        d.items.map(function (it, ii) {
          var ex = BA.store.exercise(it.exerciseId);
          var at = ' data-d="' + di + '" data-i="' + ii + '"';
          return '<div class="erow">' +
            '<span class="erow__no">' + (ii + 1) + '</span>' +
            '<button class="erow__ex" data-act="swapEx"' + at + '><b>' + BA.codeChip(ex) + esc(ex ? ex.name : 'Silinmiş hareket') + '</b><span>' + esc(ex ? BA.regionById(ex.region).name : '') + ' · değiştir</span></button>' +
            '<input type="text" inputmode="numeric" data-kb="num" data-f="sets"' + at + ' value="' + esc(it.sets) + '">' +
            '<input type="text" data-f="reps"' + at + ' value="' + esc(it.reps) + '" placeholder="10-12">' +
            '<input type="text" inputmode="numeric" data-kb="num" data-f="rest"' + at + ' value="' + esc(it.rest) + '">' +
            '<input type="text" data-f="note"' + at + ' value="' + esc(it.note || '') + '" placeholder="Not ekle">' +
            '<span class="erow__act">' +
              '<button class="icon-btn" data-act="up"' + at + (ii === 0 ? ' disabled' : '') + ' aria-label="Yukarı">' + icon('up') + '</button>' +
              '<button class="icon-btn" data-act="down"' + at + (ii === d.items.length - 1 ? ' disabled' : '') + ' aria-label="Aşağı">' + icon('down') + '</button>' +
              '<button class="icon-btn icon-btn--danger" data-act="delItem"' + at + ' aria-label="Kaldır">' + icon('close') + '</button>' +
            '</span>' +
          '</div>';
        }).join('') +
        '<div class="qadd">' +
          '<input type="text" class="qadd__in" data-qadd="' + di + '" data-enter autocomplete="off" spellcheck="false" placeholder="Kodla ekle: A1A 3x12">' +
          '<span class="qadd__hint" data-qhint="' + di + '"></span>' +
          '<button class="btn btn--primary" data-act="qadd" data-d="' + di + '">' + icon('plus') + 'Ekle</button>' +
          '<button class="btn btn--ghost btn--dashed" data-act="addItem" data-d="' + di + '">' + icon('list') + 'Listeden seç</button>' +
        '</div>' +
      '</section>';
    }

    /* Kod araması + ad araması (Türkçe karakter duyarsız) */
    function search(q) {
      var byCode = BA.store.searchCode(q, 40), seen = {}, n = BA.norm(q);
      byCode.forEach(function (e) { seen[e.id] = 1; });
      return byCode.concat(BA.store.db.exercises.filter(function (e) {
        return !seen[e.id] && BA.norm(e.name).indexOf(n) >= 0;
      }).sort(BA.store.exCmp)).slice(0, 60);
    }

    /* "A1,1", "A1.1 3x12", "a1 1 4×8-10" → { ex, sets, reps } */
    function parseQuick(text) {
      var t = String(text || '').trim();
      // "A-1 [A] 3x12", "A1A 3x12", "A1,1" … : sondaki "SxT" ayrılır, kalanı koddur
      var m = /^(.*?)(?:\s+(\d{1,2})\s*[x×*]\s*(\S+))?\s*$/i.exec(t);
      var ex = m && m[1] ? BA.store.byCode(m[1]) : null;
      return ex ? { ex: ex, sets: m[2] ? +m[2] : 3, reps: m[3] || '10-12' } : null;
    }
    function quickAdd(d) {
      var inp = main.querySelector('[data-qadd="' + d + '"]');
      if (!inp || !inp.value.trim()) return;
      var r = parseQuick(inp.value);
      if (!r) { BA.toast('“' + inp.value.trim() + '” kodlu hareket bulunamadı.', 'err'); return; }
      draft.days[d].items.push({ exerciseId: r.ex.id, sets: r.sets, reps: r.reps, rest: 60, note: '' });
      dirty = true; render();
      var again = main.querySelector('[data-qadd="' + d + '"]');
      if (again) again.focus();
    }
    main.addEventListener('keydown', function (e) {
      var a = e.target.getAttribute && e.target.getAttribute('data-qadd');
      if (a != null && e.key === 'Enter') { e.preventDefault(); quickAdd(+a); }
    });

    function idx(el) { return { d: +el.getAttribute('data-d'), i: +el.getAttribute('data-i') }; }

    /* Hareket seçici: bölge sekmeleri + dokunmatik liste */
    function pickExercise(title, cb) {
      var reg = BA.REGIONS[0].id;
      var md = BA.modal({
        cls: 'modal--lg',
        title: title,
        body: '<input type="text" class="pick__q" data-ref="q" autocomplete="off" spellcheck="false" placeholder="Kod veya ad ile ara…">' +
          '<div class="chipbar" data-ref="chips"></div><div class="picklist" data-ref="list"></div>',
        actions: {
          reg: function (el) { reg = el.getAttribute('data-id'); paint(); },
          choose: function (el) { md.close(); cb(el.getAttribute('data-id')); }
        }
      });
      var qEl = md.el.querySelector('[data-ref=q]'), q = '';
      qEl.addEventListener('input', function () { q = qEl.value.trim(); paint(); });
      function paint() {
        var chips = md.el.querySelector('[data-ref=chips]');
        chips.hidden = !!q;
        chips.innerHTML = BA.REGIONS.map(function (r) {
          return '<button class="chip' + (r.id === reg ? ' is-on' : '') + '" data-act="reg" data-id="' + r.id + '">' + esc(r.name) + '</button>';
        }).join('');
        var list = q ? search(q) : BA.store.exercisesIn(reg);
        md.el.querySelector('[data-ref=list]').innerHTML = list.length ? list.map(function (e) {
          return '<button class="pick" data-act="choose" data-id="' + esc(e.id) + '"><b>' + BA.codeChip(e) + esc(e.name) + '</b><span>' +
            esc([q ? BA.regionById(e.region).name : '', e.equipment, e.level].filter(Boolean).join(' · ')) + '</span>' + icon('plus') + '</button>';
        }).join('') : '<div class="empty empty--sm"><b>' + (q ? 'Eşleşen hareket yok' : 'Bu bölgede hareket yok') + '</b></div>';
      }
      paint();
    }

    render();

    return {
      actions: {
        save: function () {
          if (!draft.name.trim()) return BA.toast('Program adı gerekli.', 'err');
          draft.name = draft.name.trim();
          draft.days.forEach(function (d, i) { d.name = (d.name || '').trim() || 'Gün ' + (i + 1); });
          o.onSave(draft);
        },
        cancel: function () {
          if (!dirty) return o.onCancel();
          BA.confirm('Kaydedilmemiş değişiklikler kaybolacak.', { ok: 'Çık', danger: true }).then(function (ok) { if (ok) o.onCancel(); });
        },
        qadd: function (el) { quickAdd(+el.getAttribute('data-d')); },
        addDay: function () { draft.days.push({ name: 'Gün ' + (draft.days.length + 1), items: [] }); dirty = true; render(); },
        delDay: function (el) {
          var d = +el.getAttribute('data-d');
          BA.confirm('“' + draft.days[d].name + '” ve içindeki hareketler silinecek.', { ok: 'Sil', danger: true }).then(function (ok) {
            if (ok) { draft.days.splice(d, 1); dirty = true; render(); }
          });
        },
        addItem: function (el) {
          var d = +el.getAttribute('data-d');
          pickExercise('Hareket ekle', function (exId) {
            draft.days[d].items.push({ exerciseId: exId, sets: 3, reps: '10-12', rest: 60, note: '' });
            dirty = true; render();
          });
        },
        swapEx: function (el) {
          var p = idx(el);
          pickExercise('Hareketi değiştir', function (exId) { draft.days[p.d].items[p.i].exerciseId = exId; dirty = true; render(); });
        },
        up: function (el) { move(idx(el), -1); },
        down: function (el) { move(idx(el), 1); },
        delItem: function (el) { var p = idx(el); draft.days[p.d].items.splice(p.i, 1); dirty = true; render(); }
      },
      onInput: sync,
      onChange: sync
    };

    function move(p, dir) {
      var items = draft.days[p.d].items, j = p.i + dir;
      if (j < 0 || j >= items.length) return;
      var t = items[p.i]; items[p.i] = items[j]; items[j] = t;
      dirty = true; render();
    }

    function sync(ev) {
      var el = ev.target, qa = el.getAttribute('data-qadd');
      if (qa != null) {
        var r = parseQuick(el.value), h = main.querySelector('[data-qhint="' + qa + '"]');
        if (h) { h.textContent = r ? '→ ' + (r.ex.code ? BA.codeLabel(r.ex.code) + ' ' : '') + r.ex.name + ' · ' + r.sets + '×' + r.reps : (el.value.trim() ? 'Kod bulunamadı' : ''); h.classList.toggle('is-ok', !!r); }
        return;
      }
      var f = el.getAttribute('data-f');
      if (!f) return;
      dirty = true;
      var v = el.value;
      if (f === 'name' || (f === 'note' && !el.hasAttribute('data-i'))) { draft[f] = v; return; }
      if (f === 'level') { draft.level = v; return; }
      if (f === 'dayName') { draft.days[+el.getAttribute('data-d')].name = v; return; }
      var it = draft.days[+el.getAttribute('data-d')].items[+el.getAttribute('data-i')];
      if (f === 'sets' || f === 'rest') it[f] = parseInt(v, 10) || (f === 'rest' ? 0 : '');
      else it[f] = v;
    }
  };
})();
