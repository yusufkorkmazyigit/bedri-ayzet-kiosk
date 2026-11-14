/* İlk açılışta yüklenen başlangıç verisi: salon hareket kütüphanesi (catalog.js) + kardiyo,
   hazır şablonlar ve demo üye. Medya dosyaları videos/ klasöründe durur. */
(function () {
  'use strict';
  var BA = window.BA;

  // [id, bölge, ad, ekipman, seviye, adımlar, sık hatalar]
  var EX = [
    ['treadmill', 'kardiyo', 'Koşu Bandı', 'Koşu bandı', 'Başlangıç',
      '5 dk tempolu yürüyüşle ısın.|Hızı kademeli artır, dik duruşunu koru.|Tutunmadan, doğal kol salınımıyla yürü/koş.|Son 3–5 dk yavaşlayarak soğu.',
      'Tutacaklara yaslanmak|Isınmadan yüksek hıza çıkmak'],
    ['bike', 'kardiyo', 'Kondisyon Bisikleti', 'Bisiklet', 'Başlangıç',
      'Seleyi pedal en aşağıdayken diz hafif bükülü olacak şekilde ayarla.|Düzenli tempoda pedal çevir.|Direnci kademeli artır.',
      'Sele yüksekliğini ayarlamamak'],
    ['rowing', 'kardiyo', 'Kürek Makinesi', 'Kürek', 'Orta',
      'Ayakları sabitle, sırt dik.|Önce bacaklarla it, sonra gövde, en son kollar.|Dönüşte sıralamayı tersine çevir.',
      'Sadece kollarla çekmek|Sırtı yuvarlamak'],
    ['jumping-jack', 'kardiyo', 'Jumping Jack', 'Vücut ağırlığı', 'Başlangıç',
      'Ayaklar bitişik, kollar yanda başla.|Zıplayarak ayakları aç, kolları başın üstünde birleştir.|Zıplayarak başlangıca dön, ritmi koru.',
      'Ayak tabanıyla sert iniş']
  ];

  // Free Exercise DB (kamu malı) fotoğrafı bulunmayan hareketler
  var NO_PHOTOS = { 'jumping-jack': true };

  /* Salon kütüphanesi (catalog.js) → hareket kayıtları. Kimlik ve önizleme dosya adından türetilir. */
  BA.catalogExercises = function () {
    return (BA.CATALOG || []).map(function (r) {
      var files = r[2].split('|'), first = files[0], base = first.replace(/\.[^.]+$/, '');
      var isVideo = /\.mp4$/i.test(first);
      var reg = BA.regionByCode(r[0].replace(/\d.*$/, ''));
      return {
        id: 'k-' + base, code: r[0], region: reg ? reg.id : 'omuz', name: r[1],
        equipment: '', level: '', video: isVideo ? first : '',
        image: isVideo ? '' : first, images: files.length > 1 ? files : undefined,
        thumb: base + '.jpg', steps: [], mistakes: []
      };
    });
  };

  function exercises() {
    return BA.catalogExercises().concat(EX.map(function (e) {
      return {
        id: e[0], code: '', region: e[1], name: e[2], equipment: e[3], level: e[4],
        video: e[0] + '.mp4',
        photos: NO_PHOTOS[e[0]] ? 0 : 2,
        steps: e[5].split('|'),
        mistakes: e[6] ? e[6].split('|') : []
      };
    }));
  }

  function item(ex, sets, reps, rest, note) {
    return { exerciseId: ex, sets: sets, reps: reps, rest: rest || 60, note: note || '' };
  }

  /* Örnek şablonlar salon kodlarıyla (k-<kod>); hoca kendi şablonlarını ekleyebilir. */
  function templates() {
    return [
      {
        id: 'tpl-fb-a', name: 'Full Body A', level: 'Başlangıç',
        note: 'Haftada 3 gün, A ve B dönüşümlü. Her harekette 2 tekrar yedek bırak.',
        days: [{ name: 'Antrenman', items: [
          item('k-f1', 3, '10-12', 90), item('k-c1', 3, '10-12', 75),
          item('k-b7', 3, '10-12', 75), item('k-c2', 3, '12', 60),
          item('k-a5', 2, '12', 60), item('k-o3', 3, '30 sn', 45),
          item('treadmill', 1, '10 dk', 0, 'Soğuma temposu')
        ] }]
      },
      {
        id: 'tpl-fb-b', name: 'Full Body B', level: 'Başlangıç',
        note: 'Full Body A ile dönüşümlü uygulanır.',
        days: [{ name: 'Antrenman', items: [
          item('bike', 1, '5 dk', 0, 'Isınma'), item('k-f3', 3, '8-10', 90, 'Boş bar veya hafif kilo ile başla'),
          item('k-b3', 3, '10', 75), item('k-m5', 3, '10', 90),
          item('k-a6', 3, '12-15', 45), item('k-d1', 2, '12', 45),
          item('k-g25', 3, '15', 45)
        ] }]
      },
      {
        id: 'tpl-upper-lower', name: 'Üst / Alt Split', level: 'Orta',
        note: 'Haftada 4 gün: Üst – Alt – dinlenme – Üst – Alt.',
        days: [
          { name: 'Üst Vücut', items: [
            item('k-b3', 4, '6-8', 120), item('k-c7', 4, '8', 90),
            item('k-a5', 3, '10', 75), item('k-c1', 3, '10-12', 75),
            item('k-e3', 3, '10', 45), item('k-d1', 3, '12', 45)
          ] },
          { name: 'Alt Vücut', items: [
            item('k-f3', 4, '6-8', 120), item('k-m2', 3, '8-10', 90),
            item('k-f1', 3, '12', 75), item('k-f8', 3, '12', 60),
            item('k-f9', 4, '15', 45), item('k-g10', 3, '10', 45)
          ] }
        ]
      },
      {
        id: 'tpl-ppl', name: 'Push / Pull / Legs', level: 'İleri',
        note: 'Haftada 6 gün, iki tur. Ağırlıkları her hafta küçük artışlarla yükselt.',
        days: [
          { name: 'Push', items: [
            item('k-b3', 4, '5-6', 150), item('k-b7', 3, '8-10', 90),
            item('k-b16', 3, '12', 60), item('k-a5', 3, '8-10', 90),
            item('k-a6', 4, '15', 45), item('k-d3', 3, '10-12', 60)
          ] },
          { name: 'Pull', items: [
            item('k-m1', 3, '5', 180), item('k-c10', 4, '6-8', 120),
            item('k-c7', 3, '8', 90), item('k-a12', 3, '12', 60),
            item('k-a8', 3, '15', 45), item('k-e6', 3, '10', 60)
          ] },
          { name: 'Legs', items: [
            item('k-f3', 4, '5-6', 150), item('k-f1', 3, '8-10', 90),
            item('k-f13', 3, '12/12', 75), item('k-f4', 3, '12-15', 60),
            item('k-f8', 3, '12', 60), item('k-f9', 4, '12', 45)
          ] }
        ]
      }
    ];
  }

  function demoMember(tpls) {
    var prog = BA.clone(tpls[0]);
    var d = new Date();
    function ago(days) {
      var x = new Date(d.getTime() - days * 864e5);
      return x.toISOString().slice(0, 10);
    }
    return {
      id: '1001', name: 'Demo Üye', phone: '', gender: 'Erkek',
      birthDate: '1998' + BA.todayISO().slice(4), // örnek kayıtta doğum günü özelliği görünsün
      goal: 'Kilo verme', joined: ago(92), note: 'Örnek kayıt — eğitmen panelinden silebilirsiniz.',
      membership: { start: ago(92), end: BA.addMonths(ago(92), 6), months: 6 },
      membershipLog: [{ at: ago(92), text: '6 aylık paket başlatıldı' }],
      program: { name: prog.name, note: prog.note, assignedAt: ago(90), templateId: prog.id, days: prog.days },
      measurements: [
        { id: BA.uid(), date: ago(90), weight: 92.4, height: 181, waist: 101, chest: 108, arm: 35, hip: 106, thigh: 62, fat: 27 },
        { id: BA.uid(), date: ago(60), weight: 89.8, height: 181, waist: 98, chest: 107, arm: 35.5, hip: 104, thigh: 61, fat: 25.5 },
        { id: BA.uid(), date: ago(30), weight: 87.1, height: 181, waist: 95.5, chest: 106, arm: 36, hip: 102.5, thigh: 60.5, fat: 24 },
        { id: BA.uid(), date: ago(2), weight: 85.6, height: 181, waist: 93, chest: 106, arm: 36.5, hip: 101, thigh: 60, fat: 22.8 }
      ]
    };
  }

  BA.seed = function () {
    var tpls = templates();
    return {
      version: 1,
      settings: {
        gymName: 'Bedri Ayzet',
        gymTagline: 'Spor Salonu',
        pinHash: BA.hash('1234'),
        memberIdle: 90,
        trainerIdle: 300,
        lite: false,
        osk: 'auto',
        // Salon kodlarının ilk harfi → uygulamadaki bölge (kod listesi içe aktarılırken kullanılır)
        codeRegions: { A: 'omuz', B: 'gogus', C: 'kanat', D: 'arkakol', E: 'pazu', F: 'bacak', G: 'karin', H: 'oblik', K: 'bilek', M: 'deadlift', O: 'plank' }
      },
      exercises: exercises(),
      templates: tpls,
      members: [demoMember(tpls)]
    };
  };
})();
