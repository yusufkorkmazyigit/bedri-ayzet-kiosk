/* Arayüz bileşenleri: olay yönlendirme, bildirim, modal, onay, tuş takımı, hareket/video penceresi. */
(function () {
  'use strict';
  var BA = window.BA;
  var esc = BA.esc, icon = BA.icon;

  /* ------------------------------------------------------------ olay yönlendirme
     Her görünüm tek bir dinleyici kullanır: data-act="isim" taşıyan öğeye tıklanınca handlers[isim](el, ev). */
  BA.delegate = function (root, handlers, type) {
    root.addEventListener(type || 'click', function (ev) {
      var el = ev.target.closest('[data-act]');
      if (!el || !root.contains(el) || el.disabled) return;
      var fn = handlers[el.getAttribute('data-act')];
      if (fn) { ev.preventDefault(); fn(el, ev); }
    });
  };

  /* ------------------------------------------------------------ bildirim */
  BA.toast = function (msg, kind) {
    var box = document.getElementById('toasts');
    var el = document.createElement('div');
    el.className = 'toast toast--' + (kind || 'info');
    el.innerHTML = icon(kind === 'err' ? 'close' : 'check') + '<span>' + esc(msg) + '</span>';
    box.appendChild(el);
    setTimeout(function () { el.classList.add('is-out'); }, 2600);
    setTimeout(function () { if (el.parentNode) el.parentNode.removeChild(el); }, 2900);
  };

  /* ------------------------------------------------------------ modal */
  var stack = [];

  BA.modal = function (opt) {
    var layer = document.getElementById('layer');
    var wrap = document.createElement('div');
    wrap.className = 'modal' + (opt.cls ? ' ' + opt.cls : '');
    wrap.innerHTML =
      '<div class="modal__scrim" data-act="__close"></div>' +
      '<div class="modal__card" role="dialog" aria-modal="true">' +
        (opt.title != null ?
          '<header class="modal__head"><div><h2>' + esc(opt.title) + '</h2>' +
          (opt.subtitle ? '<p>' + esc(opt.subtitle) + '</p>' : '') + '</div>' +
          '<button class="icon-btn" data-act="__close" aria-label="Kapat">' + icon('close') + '</button></header>' : '') +
        '<div class="modal__body">' + (opt.body || '') + '</div>' +
        (opt.foot ? '<footer class="modal__foot">' + opt.foot + '</footer>' : '') +
      '</div>';
    layer.appendChild(wrap);

    var h = {
      el: wrap,
      body: wrap.querySelector('.modal__body'),
      closed: false,
      close: function (silent) {
        if (h.closed) return;
        h.closed = true;
        stack.splice(stack.indexOf(h), 1);
        if (opt.onClose) opt.onClose(silent);
        if (wrap.parentNode) wrap.parentNode.removeChild(wrap);
        BA.keyboard && BA.keyboard.hide();
      }
    };
    var handlers = Object.assign({ __close: function () { if (!opt.locked) h.close(); } }, opt.actions || {});
    BA.delegate(wrap, handlers);
    stack.push(h);
    // bir sonraki karede görünür yap (geçiş animasyonu yalnızca opacity/transform)
    requestAnimationFrame(function () { wrap.classList.add('is-open'); });
    return h;
  };

  BA.modal.closeAll = function () {
    while (stack.length) stack[stack.length - 1].close(true);
  };
  BA.modal.top = function () { return stack[stack.length - 1] || null; };

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && stack.length) stack[stack.length - 1].close();
  });

  /* ------------------------------------------------------------ onay */
  BA.confirm = function (msg, opt) {
    opt = opt || {};
    return new Promise(function (resolve) {
      var done = false;
      var m = BA.modal({
        cls: 'modal--sm',
        title: opt.title || 'Emin misiniz?',
        body: '<p class="lead">' + esc(msg) + '</p>',
        foot: '<button class="btn btn--ghost" data-act="no">Vazgeç</button>' +
              '<button class="btn ' + (opt.danger ? 'btn--danger' : 'btn--primary') + '" data-act="yes">' + esc(opt.ok || 'Onayla') + '</button>',
        actions: {
          yes: function () { done = true; m.close(); resolve(true); },
          no: function () { m.close(); }
        },
        onClose: function () { if (!done) resolve(false); }
      });
    });
  };

  /* ------------------------------------------------------------ sayısal tuş takımı (üye ID / eğitmen PIN)
     onSubmit(value) → true: kapat, string: hata mesajı göster */
  BA.numpad = function (opt) {
    var val = '';
    var max = opt.maxLen || 6;
    var keys = ['1', '2', '3', '4', '5', '6', '7', '8', '9', 'C', '0', '<'];
    var m = BA.modal({
      cls: 'modal--pad',
      title: opt.title,
      subtitle: opt.subtitle,
      body:
        '<div class="pad">' +
          '<div class="pad__display' + (opt.secret ? ' is-secret' : '') + '" data-ref="disp"></div>' +
          '<p class="pad__err" data-ref="err"></p>' +
          '<div class="pad__grid">' + keys.map(function (k) {
            if (k === 'C') return '<button class="pad__key pad__key--fn" data-act="clr">Sil</button>';
            if (k === '<') return '<button class="pad__key pad__key--fn" data-act="bs" aria-label="Geri">' + icon('backspace') + '</button>';
            return '<button class="pad__key" data-act="d" data-d="' + k + '">' + k + '</button>';
          }).join('') + '</div>' +
          '<button class="btn btn--primary btn--xl btn--block" data-act="ok">' + esc(opt.okText || 'Giriş Yap') + icon('arrow') + '</button>' +
        '</div>',
      actions: {
        d: function (el) { press(el.getAttribute('data-d')); },
        bs: function () { val = val.slice(0, -1); paint(); },
        clr: function () { val = ''; paint(); },
        ok: submit
      },
      onClose: function () { document.removeEventListener('keydown', onKey, true); }
    });
    var disp = m.el.querySelector('[data-ref=disp]');
    var err = m.el.querySelector('[data-ref=err]');

    function press(d) { if (val.length < max) { val += d; paint(); } }
    function paint(errMsg) {
      var html = '';
      if (opt.secret) {
        for (var i = 0; i < Math.max(4, val.length); i++) html += '<i class="' + (i < val.length ? 'on' : '') + '"></i>';
      } else {
        html = val ? esc(val) : '<span class="ph">' + esc(opt.placeholder || '— — — —') + '</span>';
      }
      disp.innerHTML = html;
      err.textContent = errMsg || '';
      disp.classList.toggle('is-error', !!errMsg);
    }
    function submit() {
      if (!val) return paint('Lütfen bir değer girin.');
      var r = opt.onSubmit(val);
      if (r === true) m.close();
      else { val = ''; paint(r || 'Hatalı giriş.'); shake(disp); }
    }
    function onKey(e) {
      if (m.closed) return;
      if (/^[0-9]$/.test(e.key)) { press(e.key); e.preventDefault(); }
      else if (e.key === 'Backspace') { val = val.slice(0, -1); paint(); e.preventDefault(); }
      else if (e.key === 'Enter') { submit(); e.preventDefault(); }
    }
    document.addEventListener('keydown', onKey, true);
    paint();
    return m;
  };

  function shake(el) {
    el.classList.remove('shake');
    void el.offsetWidth; // animasyonu yeniden başlat
    el.classList.add('shake');
  }

  /* ------------------------------------------------------------ hareket penceresi (video + açıklama)
     plan: üye programından geliyorsa {sets, reps, rest, note} */
  BA.showExercise = function (exId, plan) {
    var ex = BA.store.exercise(exId);
    if (!ex) return BA.toast('Hareket bulunamadı.', 'err');
    var region = BA.regionById(ex.region);
    var src = BA.store.videoUrl(ex);
    var photos = BA.store.photoUrls(ex);
    // Video listesi eski olabilir (USB ile yeni kopyalanmış video) → dosya adı varsa dene;
    // yalnızca videonun kesin olmadığı bilinip fotoğraf varsa doğrudan fotoğraflara geç.
    var tryVideo = !!src && !(BA.store.hasVideo(ex) === false && photos.length);
    var timer = null;

    var planHtml = plan ?
      '<div class="plan-strip">' +
        stat('Set', plan.sets) + stat('Tekrar', plan.reps) + stat('Dinlenme', plan.rest ? plan.rest + ' sn' : '—') +
      '</div>' + (plan.note ? '<p class="note">' + icon('edit') + esc(plan.note) + '</p>' : '') : '';

    var m = BA.modal({
      cls: 'modal--ex',
      title: ex.name,
      subtitle: region.name + ' · ' + (ex.equipment || '') + ' · ' + (ex.level || ''),
      body:
        '<div class="ex">' +
          '<div class="ex__media" data-ref="media">' +
            (tryVideo ?
              '<video data-ref="video" src="' + esc(src) + '" autoplay muted loop playsinline controls preload="auto" disablepictureinpicture controlslist="nodownload noplaybackrate noremoteplayback"></video>' :
              fallbackHtml()) +
          '</div>' +
          '<div class="ex__info">' + planHtml +
            '<h3 class="eyebrow">Nasıl yapılır?</h3>' +
            '<ol class="steps">' + (ex.steps || []).map(function (s) { return '<li>' + esc(s) + '</li>'; }).join('') + '</ol>' +
            (ex.mistakes && ex.mistakes.length ?
              '<h3 class="eyebrow eyebrow--warn">Sık yapılan hatalar</h3><ul class="mistakes">' +
              ex.mistakes.map(function (s) { return '<li>' + esc(s) + '</li>'; }).join('') + '</ul>' : '') +
          '</div>' +
        '</div>',
      onClose: function () {
        clearInterval(timer);
        // Zayıf donanımda kod çözücüyü hemen serbest bırak
        var v = m.el.querySelector('video');
        if (v) { v.pause(); v.removeAttribute('src'); v.load(); }
      }
    });
    var media = m.el.querySelector('[data-ref=media]');
    var v = media.querySelector('video');
    if (v) v.addEventListener('error', function () { media.innerHTML = fallbackHtml(); startPhotos(); });
    else startPhotos();
    return m;

    /* Video yoksa: başlangıç ↔ bitiş fotoğrafları dönüşümlü gösterilir */
    function fallbackHtml() {
      if (!photos.length) return noVideo();
      return '<div class="photos">' + photos.map(function (u, i) {
        return '<img src="' + esc(u) + '" alt="" decoding="async" class="' + (i === 0 ? 'is-on' : '') + '">';
      }).join('') + '<div class="photos__cap"><b data-ref="cap">Başlangıç</b><span>Fotoğraflı anlatım</span></div></div>';
    }
    function startPhotos() {
      var imgs = media.querySelectorAll('.photos img');
      if (imgs.length < 2) return;
      var cap = media.querySelector('[data-ref=cap]'), i = 0;
      timer = setInterval(function () {
        imgs[i].classList.remove('is-on');
        i = (i + 1) % imgs.length;
        imgs[i].classList.add('is-on');
        cap.textContent = i === 0 ? 'Başlangıç' : 'Bitiş';
      }, 1400);
    }

    function stat(label, value) {
      return '<div><span>' + label + '</span><b>' + esc(value == null || value === '' ? '—' : value) + '</b></div>';
    }
  };

  function noVideo() {
    return '<div class="novideo">' + icon('film') + '<b>Video henüz eklenmedi</b><span>Eğitmeninizden bu hareketin formunu göstermesini isteyebilirsiniz.</span></div>';
  }

  /* ------------------------------------------------------------ form yardımcıları */
  BA.field = function (label, name, value, o) {
    o = o || {};
    var input;
    if (o.options) {
      input = '<select name="' + name + '">' + o.options.map(function (op) {
        var v = typeof op === 'object' ? op.value : op, t = typeof op === 'object' ? op.label : op;
        return '<option value="' + esc(v) + '"' + (String(v) === String(value) ? ' selected' : '') + '>' + esc(t) + '</option>';
      }).join('') + '</select>';
    } else if (o.textarea) {
      input = '<textarea name="' + name + '" rows="' + (o.rows || 3) + '" placeholder="' + esc(o.ph || '') + '">' + esc(value) + '</textarea>';
    } else {
      // number yerine text + inputmode: ekran klavyesi imleç konumuyla çalışabilsin
      input = '<input type="text" name="' + name + '" value="' + esc(value) + '" autocomplete="off" spellcheck="false"' +
        (o.numeric ? ' inputmode="decimal" data-kb="num"' : '') +
        (o.ph ? ' placeholder="' + esc(o.ph) + '"' : '') + (o.max ? ' maxlength="' + o.max + '"' : '') + '>';
    }
    return '<label class="field' + (o.cls ? ' ' + o.cls : '') + '"><span>' + esc(label) + (o.unit ? ' <em>' + esc(o.unit) + '</em>' : '') + '</span>' + input + '</label>';
  };

  BA.formData = function (root) {
    var out = {};
    root.querySelectorAll('input[name], select[name], textarea[name]').forEach(function (el) { out[el.name] = el.value.trim(); });
    return out;
  };
})();
