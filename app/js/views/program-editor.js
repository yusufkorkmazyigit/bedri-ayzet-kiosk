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
        '<header class="page-head"><div><h1>' + esc(o.title) + '</h1><p>Hareket eklemek için her günün altındaki butonu kullanın.</p></div>' +
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
            '<button class="erow__ex" data-act="swapEx"' + at + '><b>' + esc(ex ? ex.name : 'Silinmiş hareket') + '</b><span>' + esc(ex ? BA.regionById(ex.region).name : '') + ' · değiştir</span></button>' +
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
        '<button class="btn btn--ghost btn--dashed" data-act="addItem" data-d="' + di + '">' + icon('plus') + 'Hareket ekle</button>' +
      '</section>';
    }

    function idx(el) { return { d: +el.getAttribute('data-d'), i: +el.getAttribute('data-i') }; }

    /* Hareket seçici: bölge sekmeleri + dokunmatik liste */
    function pickExercise(title, cb) {
      var reg = BA.REGIONS[0].id;
      var md = BA.modal({
        cls: 'modal--lg',
        title: title,
        body: '<div class="chipbar" data-ref="chips"></div><div class="picklist" data-ref="list"></div>',
        actions: {
          reg: function (el) { reg = el.getAttribute('data-id'); paint(); },
          choose: function (el) { md.close(); cb(el.getAttribute('data-id')); }
        }
      });
      function paint() {
        md.el.querySelector('[data-ref=chips]').innerHTML = BA.REGIONS.map(function (r) {
          return '<button class="chip' + (r.id === reg ? ' is-on' : '') + '" data-act="reg" data-id="' + r.id + '">' + esc(r.name) + '</button>';
        }).join('');
        var list = BA.store.exercisesIn(reg);
        md.el.querySelector('[data-ref=list]').innerHTML = list.length ? list.map(function (e) {
          return '<button class="pick" data-act="choose" data-id="' + esc(e.id) + '"><b>' + esc(e.name) + '</b><span>' + esc(e.equipment || '') + ' · ' + esc(e.level || '') + '</span>' + icon('plus') + '</button>';
        }).join('') : '<div class="empty empty--sm"><b>Bu bölgede hareket yok</b></div>';
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
      var el = ev.target, f = el.getAttribute('data-f');
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
