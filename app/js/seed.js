/* İlk açılışta yüklenen başlangıç verisi: hareket kütüphanesi, hazır şablonlar, demo üye.
   Video alanındaki dosya adları önerilir; aynı adla videos/ klasörüne mp4 atmak yeterli. */
(function () {
  'use strict';
  var BA = window.BA;

  // [id, bölge, ad, ekipman, seviye, adımlar, sık hatalar]
  var EX = [
    ['bench-press', 'gogus', 'Bench Press', 'Barbell', 'Orta',
      'Sehpaya uzan, gözlerin barın hizasında olsun.|Barı omuz genişliğinden biraz geniş kavra, kürek kemiklerini sıkıştır.|Barı kontrollü şekilde göğsün alt kısmına indir.|Ayaklarını yere bastırarak barı yukarı it, dirsekleri kilitleme.',
      'Kalçayı sehpadan kaldırmak|Barı göğüsten sektirmek|Dirsekleri 90° yana açmak'],
    ['incline-db-press', 'gogus', 'Incline Dumbbell Press', 'Dumbbell', 'Başlangıç',
      'Sehpayı 30–45° açıya ayarla.|Dambılları göğüs hizasında, avuçlar öne bakacak şekilde tut.|Dambılları yukarıda birbirine yaklaştırarak it.|Yavaşça göğüs hizasına geri indir.',
      'Sehpa açısını çok dik yapmak|Dambılları birbirine çarptırmak'],
    ['db-fly', 'gogus', 'Dumbbell Fly', 'Dumbbell', 'Orta',
      'Düz sehpada dambılları göğüs üzerinde tut, dirsekler hafif bükülü.|Kolları geniş bir yay çizerek yana aç.|Göğüste gerilmeyi hissedince aynı yayla yukarı topla.',
      'Dirsekleri tamamen düzleştirmek|Çok ağır kilo ile omzu zorlamak'],
    ['push-up', 'gogus', 'Şınav (Push-up)', 'Vücut ağırlığı', 'Başlangıç',
      'Eller omuz genişliğinde, vücut baştan topuğa düz bir çizgi.|Karnı sık, göğsü yere yaklaştır.|Dirsekler gövdeye ~45° açıyla dursun.|Avuçlarla yeri iterek başlangıca dön.',
      'Belin çökmesi|Kalçanın yukarıda kalması|Yarım hareket yapmak'],
    ['cable-crossover', 'gogus', 'Cable Crossover', 'Kablo', 'Orta',
      'Makaraları omuz üstüne ayarla, bir adım öne çık.|Dirsekler hafif bükülü, kolları öne ve aşağı doğru birleştir.|Göğsü sıkarak 1 saniye bekle, kontrollü aç.',
      'Gövdeyi sallayarak ivme kazanmak|Kolları bükerek itiş hareketine çevirmek'],

    ['lat-pulldown', 'sirt', 'Lat Pulldown', 'Makine', 'Başlangıç',
      'Dizlerini pedin altına sabitle, barı geniş kavra.|Göğsünü hafif yukarı kaldır, omuzları aşağı çek.|Barı üst göğsüne doğru dirseklerle çek.|Kontrollü şekilde kolları uzat.',
      'Barı ense arkasına çekmek|Geriye aşırı yaslanmak'],
    ['seated-row', 'sirt', 'Seated Cable Row', 'Kablo', 'Başlangıç',
      'Dizler hafif bükülü, sırt dik otur.|Tutacağı göbeğine doğru çek, kürek kemiklerini birleştir.|Omuzları öne doğru bırakmadan kontrollü uzat.',
      'Belden sallanmak|Omuzları kulağa doğru kaldırmak'],
    ['barbell-row', 'sirt', 'Barbell Row', 'Barbell', 'Orta',
      'Kalçadan menteşe yap, gövde yere ~45°.|Barı omuz genişliğinde kavra, sırt nötr.|Barı göbek hizasına çek, dirsekleri geriye yönlendir.|Kontrollü indir.',
      'Sırtın kamburlaşması|Bacaklarla ivme almak'],
    ['pull-up', 'sirt', 'Barfiks (Pull-up)', 'Barfiks barı', 'İleri',
      'Barı omuzdan geniş, avuçlar öne bakacak şekilde tut.|Omuzları aşağı çekerek harekete başla.|Çene bar hizasını geçene kadar yüksel.|Kolları tamamen uzatana kadar yavaşça in.',
      'Bacaklarla sallanmak|Yarım tekrar yapmak'],
    ['deadlift', 'sirt', 'Deadlift', 'Barbell', 'İleri',
      'Ayaklar kalça genişliğinde, bar ayak ortasının üzerinde.|Kalçadan eğil, barı kavra, sırtı düz tut.|Göğsü kaldır, bacaklarla yeri iterek kalk.|Bar vücuda yakın kalsın; kalçayı geri iterek indir.',
      'Sırtı yuvarlamak|Barı vücuttan uzak tutmak|Tepede geriye aşırı yaslanmak'],

    ['db-shoulder-press', 'omuz', 'Dumbbell Shoulder Press', 'Dumbbell', 'Başlangıç',
      'Sırt destekli otur, dambıllar kulak hizasında.|Karnı sık, dambılları başın üstüne it.|Kontrollü şekilde kulak hizasına indir.',
      'Beli aşırı kavislendirmek|Dambılları çok aşağı indirmemek'],
    ['lateral-raise', 'omuz', 'Lateral Raise', 'Dumbbell', 'Başlangıç',
      'Dik dur, dambıllar yanlarda, dirsekler hafif bükülü.|Kolları yana doğru omuz hizasına kaldır.|1 saniye bekle, yavaşça indir.',
      'Gövdeyi sallamak|Omuz hizasını fazla geçmek'],
    ['face-pull', 'omuz', 'Face Pull', 'Kablo', 'Başlangıç',
      'Makarayı yüz hizasına ayarla, halat aparatı tak.|Halatı yüzüne doğru çek, elleri kulak yanına aç.|Kürek kemiklerini sıkıştır, kontrollü bırak.',
      'Çok ağır kilo ile belden çekmek'],
    ['rear-delt-fly', 'omuz', 'Rear Delt Fly', 'Dumbbell', 'Orta',
      'Kalçadan öne eğil, sırt düz.|Dambılları yana doğru, dirsekler hafif bükülü kaldır.|Arka omzu sıkıp yavaşça indir.',
      'Kürek kemiklerini değil kolları çalıştırmak|Hızlı, kontrolsüz tekrar'],

    ['barbell-curl', 'kol', 'Barbell Curl', 'Barbell', 'Başlangıç',
      'Omuz genişliğinde, avuçlar yukarı kavra.|Dirsekleri gövdeye sabitle.|Barı omuz hizasına kaldır, biceps’i sık.|Yavaşça tam açılıma indir.',
      'Gövdeyle sallamak|Dirsekleri öne kaydırmak'],
    ['hammer-curl', 'kol', 'Hammer Curl', 'Dumbbell', 'Başlangıç',
      'Dambılları avuçlar içe bakacak şekilde tut.|Dirsekler sabit, dambılları omza doğru kaldır.|Kontrollü indir.',
      'Bileği bükmek|Hızlı indirmek'],
    ['triceps-pushdown', 'kol', 'Triceps Pushdown', 'Kablo', 'Başlangıç',
      'Makaraya düz bar veya halat tak, dik dur.|Dirsekler gövdeye yapışık, barı aşağı it.|Kolları tam aç, triceps’i sık, yavaşça geri gel.',
      'Dirsekleri açmak|Omuzla bastırmak'],
    ['overhead-triceps', 'kol', 'Overhead Triceps Extension', 'Dumbbell', 'Orta',
      'Dambılı iki elle başın üstünde tut.|Dirsekler sabit, dambılı başın arkasına indir.|Kolları uzatarak yukarı it.',
      'Dirsekleri yana açmak|Beli kavislendirmek'],

    ['squat', 'bacak', 'Squat', 'Barbell', 'Orta',
      'Barı üst sırta yerleştir, ayaklar omuz genişliğinde.|Kalçayı geriye iterek otur, dizler parmak yönünde.|Uyluk yere paralel olana kadar in.|Topuklardan iterek kalk.',
      'Dizlerin içe çökmesi|Topukların yerden kalkması|Sırtın yuvarlanması'],
    ['leg-press', 'bacak', 'Leg Press', 'Makine', 'Başlangıç',
      'Sırtını pede yasla, ayaklar platformun ortasında.|Kilidi aç, dizleri 90°’ye kadar bük.|Topuklardan iterek geri aç, dizleri kilitleme.',
      'Kalçanın pedden kalkması|Dizleri tam kilitlemek'],
    ['leg-extension', 'bacak', 'Leg Extension', 'Makine', 'Başlangıç',
      'Dizini makinenin eksenine hizala.|Bacakları tam açılana kadar kaldır.|Üstte 1 sn bekle, yavaşça indir.',
      'Ağırlığı savurmak'],
    ['leg-curl', 'bacak', 'Lying Leg Curl', 'Makine', 'Başlangıç',
      'Yüzüstü uzan, ped aşil tendonunun üstünde.|Topukları kalçaya doğru çek.|Kontrollü şekilde tam aç.',
      'Kalçayı kaldırmak|Yarım hareket'],
    ['walking-lunge', 'bacak', 'Walking Lunge', 'Dumbbell', 'Orta',
      'Dik dur, bir adım öne at.|Arka diz yere yaklaşana kadar in.|Ön ayaktan iterek diğer bacakla devam et.',
      'Ön dizin içe kaçması|Gövdenin öne çökmesi'],
    ['calf-raise', 'bacak', 'Calf Raise', 'Makine', 'Başlangıç',
      'Ayak uçlarını basamağa yerleştir.|Topukları olabildiğince yükselt.|Yavaşça topukları basamak altına indir.',
      'Hareketi zıplatarak yapmak'],

    ['hip-thrust', 'kalca', 'Hip Thrust', 'Barbell', 'Orta',
      'Üst sırtı sehpaya yasla, barı kalçaya yerleştir.|Ayaklar kalça genişliğinde, dizler 90°.|Kalçayı sıkarak gövde düz olana kadar kaldır.|Kontrollü indir.',
      'Beli kavislendirmek|Kalçayı sıkmadan kaldırmak'],
    ['romanian-deadlift', 'kalca', 'Romanian Deadlift', 'Barbell', 'Orta',
      'Barı kalça önünde tut, dizler hafif bükülü.|Kalçayı geriye iterek barı bacaklar boyunca indir.|Arka bacakta gerilme hissedince kalçayı ileri iterek kalk.',
      'Sırtı yuvarlamak|Dizleri squat gibi bükmek'],
    ['glute-kickback', 'kalca', 'Cable Glute Kickback', 'Kablo', 'Başlangıç',
      'Ayak bileği aparatını tak, makineye tutun.|Bacağı geriye doğru, kalçayı sıkarak uzat.|Beli oynatmadan kontrollü geri getir.',
      'Belden hareket etmek'],

    ['plank', 'karin', 'Plank', 'Vücut ağırlığı', 'Başlangıç',
      'Önkollar yerde, dirsekler omuz altında.|Baştan topuğa düz bir çizgi oluştur.|Karnı ve kalçayı sık, nefesi tutma.',
      'Kalçanın düşmesi|Kalçanın fazla yukarıda olması'],
    ['crunch', 'karin', 'Crunch', 'Vücut ağırlığı', 'Başlangıç',
      'Sırtüstü uzan, dizler bükülü.|Elleri şakaklara koy, çeneyi göğse yapıştırma.|Kürek kemiklerini yerden kaldır, yavaşça in.',
      'Boyundan çekmek|Hızlı ve kontrolsüz tekrar'],
    ['hanging-leg-raise', 'karin', 'Hanging Leg Raise', 'Barfiks barı', 'İleri',
      'Bara asıl, omuzlar aktif.|Bacakları kalça hizasına veya üstüne kaldır.|Sallanmadan yavaşça indir.',
      'Sallanarak ivme almak'],
    ['russian-twist', 'karin', 'Russian Twist', 'Plaka', 'Orta',
      'Otur, gövdeyi hafif geriye yatır, ayaklar yerde veya havada.|Ağırlığı iki yana döndürerek taşı.|Hareketi gövdeden yap, sadece kollardan değil.',
      'Sırtı yuvarlamak'],

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

  function exercises() {
    return EX.map(function (e) {
      return {
        id: e[0], region: e[1], name: e[2], equipment: e[3], level: e[4],
        video: e[0] + '.mp4',
        photos: NO_PHOTOS[e[0]] ? 0 : 2,
        steps: e[5].split('|'),
        mistakes: e[6] ? e[6].split('|') : []
      };
    });
  }

  function item(ex, sets, reps, rest, note) {
    return { exerciseId: ex, sets: sets, reps: reps, rest: rest || 60, note: note || '' };
  }

  function templates() {
    return [
      {
        id: 'tpl-fb-a', name: 'Full Body A', level: 'Başlangıç',
        note: 'Haftada 3 gün, A ve B dönüşümlü. Her harekette 2 tekrar yedek bırak.',
        days: [{ name: 'Antrenman', items: [
          item('leg-press', 3, '10-12', 90), item('lat-pulldown', 3, '10-12', 75),
          item('incline-db-press', 3, '10-12', 75), item('seated-row', 3, '12', 60),
          item('db-shoulder-press', 2, '12', 60), item('plank', 3, '30 sn', 45),
          item('treadmill', 1, '10 dk', 0, 'Soğuma temposu')
        ] }]
      },
      {
        id: 'tpl-fb-b', name: 'Full Body B', level: 'Başlangıç',
        note: 'Full Body A ile dönüşümlü uygulanır.',
        days: [{ name: 'Antrenman', items: [
          item('bike', 1, '5 dk', 0, 'Isınma'), item('squat', 3, '8-10', 90, 'Boş bar veya hafif kilo ile başla'),
          item('push-up', 3, 'Max', 60), item('romanian-deadlift', 3, '10', 90),
          item('lateral-raise', 3, '12-15', 45), item('triceps-pushdown', 2, '12', 45),
          item('crunch', 3, '15', 45)
        ] }]
      },
      {
        id: 'tpl-upper-lower', name: 'Üst / Alt Split', level: 'Orta',
        note: 'Haftada 4 gün: Üst – Alt – dinlenme – Üst – Alt.',
        days: [
          { name: 'Üst Vücut', items: [
            item('bench-press', 4, '6-8', 120), item('barbell-row', 4, '8', 90),
            item('db-shoulder-press', 3, '10', 75), item('lat-pulldown', 3, '10-12', 75),
            item('barbell-curl', 3, '10', 45), item('triceps-pushdown', 3, '12', 45)
          ] },
          { name: 'Alt Vücut', items: [
            item('squat', 4, '6-8', 120), item('romanian-deadlift', 3, '8-10', 90),
            item('leg-press', 3, '12', 75), item('leg-curl', 3, '12', 60),
            item('calf-raise', 4, '15', 45), item('hanging-leg-raise', 3, '10', 45)
          ] }
        ]
      },
      {
        id: 'tpl-ppl', name: 'Push / Pull / Legs', level: 'İleri',
        note: 'Haftada 6 gün, iki tur. Ağırlıkları her hafta küçük artışlarla yükselt.',
        days: [
          { name: 'Push', items: [
            item('bench-press', 4, '5-6', 150), item('incline-db-press', 3, '8-10', 90),
            item('cable-crossover', 3, '12', 60), item('db-shoulder-press', 3, '8-10', 90),
            item('lateral-raise', 4, '15', 45), item('overhead-triceps', 3, '10-12', 60)
          ] },
          { name: 'Pull', items: [
            item('deadlift', 3, '5', 180), item('pull-up', 4, '6-8', 120),
            item('barbell-row', 3, '8', 90), item('face-pull', 3, '15', 45),
            item('rear-delt-fly', 3, '15', 45), item('hammer-curl', 3, '10', 60)
          ] },
          { name: 'Legs', items: [
            item('squat', 4, '5-6', 150), item('hip-thrust', 3, '8-10', 90),
            item('walking-lunge', 3, '12/12', 75), item('leg-extension', 3, '12-15', 60),
            item('leg-curl', 3, '12', 60), item('calf-raise', 4, '12', 45)
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
      id: '1001', name: 'Demo Üye', phone: '', gender: 'Erkek', birthYear: 1998,
      goal: 'Kilo verme', joined: ago(92), note: 'Örnek kayıt — eğitmen panelinden silebilirsiniz.',
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
        osk: 'auto'
      },
      exercises: exercises(),
      templates: tpls,
      members: [demoMember(tpls)]
    };
  };
})();
