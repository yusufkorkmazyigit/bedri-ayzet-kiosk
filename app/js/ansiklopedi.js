/* Bedri Ayzet Fitness Ansiklopedisi — kiosk içi okuma bölümü.
   Bu dosya yalnızca ansiklopedi ilk açıldığında yüklenir (açılışı yavaşlatmaz).
   Blok türleri: ['p', metin] paragraf · ['h', metin] ara başlık · ['ul', [maddeler]] liste
                 ['tip', metin] kutu (ipucu) · ['dl', [[terim, açıklama], …]] sözlük
   Metinde **kalın** kullanılabilir. */
window.BA = window.BA || {};
window.BA.ANSIKLOPEDI = [
  {
    id: 'temeller', title: 'Temeller', items: [
      {
        id: 'dort-tas', title: 'Antrenmanın dört taşı',
        lead: 'Salondaki her ilerlemenin arkasında aynı dört şey vardır. Biri eksikse duvar eğri yükselir.',
        body: [
          ['p', '**Yüklenme.** Kas, kendisinden alışık olmadığı bir şey istendiğinde değişir. Her antrenman vücuda küçük bir "yeni görev" vermelidir: biraz daha ağırlık, bir tekrar fazlası ya da daha temiz bir hareket.'],
          ['p', '**Toparlanma.** Gelişim antrenman sırasında değil, sonrasında olur. Uyku, beslenme ve dinlenme günleri, salonda verdiğin emeğin karşılığını alacağın yerdir.'],
          ['p', '**Süreklilik.** Mükemmel bir haftadan çok, ortalama ama kesintisiz on iki hafta kazandırır. Programın en iyisi, aksatmadan uygulayabildiğindir.'],
          ['p', '**Teknik.** Doğru form hem sakatlığı önler hem de çalışması gereken kası gerçekten çalıştırır. Ağırlık, ancak hareket temizse artırılır.'],
          ['tip', 'Kısa kural: Doğru yap, düzenli yap, yavaş yavaş zorlaştır, iyi dinlen.']
        ]
      },
      {
        id: 'set-tekrar', title: 'Set, tekrar ve dinlenme',
        lead: 'Programındaki "3 × 10–12" ne anlatıyor? Salonun ortak dili üç sayıdan oluşur.',
        body: [
          ['p', '**Tekrar**, hareketin bir kez baştan sona yapılmasıdır. **Set**, ara vermeden yapılan tekrarların toplamıdır. "3 × 10–12", 10 ile 12 tekrarlık üç set demektir.'],
          ['h', 'Tekrar aralıkları kabaca ne işe yarar?'],
          ['ul', [
            '**1–5 tekrar:** Ağırlıklar yüksek, odak kuvvet.',
            '**6–12 tekrar:** Kas gelişimi için en sık kullanılan aralık.',
            '**15 ve üzeri:** Kas dayanıklılığı; hafif ağırlıkla uzun süre çalışma.'
          ]],
          ['p', 'Bu aralıklar keskin duvarlar değildir. Kas gelişimi, sete son birkaç tekrarı zorlanarak tamamlayacak kadar ağır çalışıldığında geniş bir tekrar aralığında gerçekleşir.'],
          ['h', 'Dinlenme süresi'],
          ['p', 'Squat, bench press gibi büyük ve çok eklemli hareketlerde setler arası **2–3 dakika**, tek kas grubunu çalıştıran küçük hareketlerde **60–90 saniye** çoğu kişi için iyi bir başlangıçtır. Programındaki dinlenme süresi hocanın senin için seçtiğidir.'],
          ['tip', 'Setin son iki tekrarı zor ama temiz geçiyorsa ağırlık doğrudur. Form bozuluyorsa ağırlık fazladır.']
        ]
      },
      {
        id: 'progresif', title: 'Progresif yüklenme: gelişimin motoru',
        lead: 'Aynı ağırlığı aynı tekrarla aylarca kaldıran vücut, değişmek için bir sebep bulamaz.',
        body: [
          ['p', 'Vücut uyum sağlayan bir makinedir. Bir yük ona artık zor gelmediğinde gelişim yavaşlar. Çözüm, yükü küçük ve düzenli adımlarla artırmaktır.'],
          ['h', 'Zorlaştırmanın yolları'],
          ['ul', [
            'Aynı ağırlıkla bir tekrar daha yapmak',
            'Tekrar aralığının üst sınırına ulaşınca ağırlığı biraz artırmak',
            'Bir set eklemek',
            'Hareketi daha kontrollü, daha yavaş indirerek yapmak',
            'Dinlenme süresini kısaltmak (dayanıklılık hedefinde)'
          ]],
          ['p', 'Yöntem basittir: "3 × 10–12" yazıyorsa, üç setin hepsinde 12 tekrarı temiz yapabildiğinde ağırlığı bir kademe artır ve yeniden 10 tekrardan başla.'],
          ['tip', 'Antrenman defteri tutmak, ilerlemenin en ucuz ve en etkili aracıdır. Ne kaldırdığını bilmezsen neyi artıracağını da bilemezsin.']
        ]
      },
      {
        id: 'isinma', title: 'Isınma ve soğuma',
        lead: 'Soğuk motorla yarışa çıkılmaz. On dakikalık hazırlık, saatlerce süren bir antrenmanı korur.',
        body: [
          ['h', 'İyi bir ısınma'],
          ['ul', [
            '**5–10 dakika hafif kardiyo:** Koşu bandında tempolu yürüyüş, bisiklet ya da kürek. Hafif terlemek yeterli.',
            '**Hareketli esneme:** Kol çevirme, kalça açma, yürüyerek lunge. Eklemleri tüm hareket açıklığında çalıştır.',
            '**Hazırlık setleri:** Günün ilk büyük hareketinde, asıl ağırlığa geçmeden önce hafif ağırlıkla 1–2 set.'
          ]],
          ['p', 'Uzun süre bekleyerek yapılan statik esneme ısınmanın başında değil, antrenman sonunda daha uygundur.'],
          ['h', 'Soğuma'],
          ['p', 'Antrenmanı birkaç dakika yavaş tempolu kardiyoyla kapatmak nabzı yavaşça düşürür. Ardından çalıştığın kaslar için 20–30 saniyelik nazik esnemeler yapabilirsin.']
        ]
      }
    ]
  },
  {
    id: 'teknik', title: 'Teknik ve güvenlik', items: [
      {
        id: 'nefes', title: 'Nefes: görünmez ağırlık kemeri',
        lead: 'Doğru nefes, gövdeyi sabitler ve kaldırdığın ağırlığı güvenle taşımanı sağlar.',
        body: [
          ['p', 'Genel kural: ağırlığı indirirken, yani hareketin kolay kısmında **nefes al**; ittiğin ya da kaldırdığın, yani zorlandığın kısımda **nefes ver**. Bench press\'te bar göğse inerken al, iterken ver.'],
          ['p', 'Nefesi tamamen tutmak, ağır kaldırışlarda deneyimli sporcuların gövdeyi sabitlemek için kullandığı bir tekniktir. Tansiyon, kalp ya da göz sorunu olanlar için uygun değildir.'],
          ['tip', 'Hareket boyunca nefes alıp verebiliyorsan tempo doğru demektir. Nefessiz kalıyorsan ağırlığı ya da hızı düşür.']
        ]
      },
      {
        id: 'form', title: 'Doğru form ve hareket açıklığı',
        lead: 'Ayna sana ağırlığı değil, hareketi göstermeli.',
        body: [
          ['ul', [
            '**Kontrol:** Ağırlığı düşürme, indir. İnişte yaklaşık 2 saniye harca.',
            '**Tam açıklık:** Eklemin güvenle yapabildiği en geniş hareketi kullan. Yarım tekrar, yarım sonuç demektir.',
            '**Nötr omurga:** Sırtını kamburlaştırma ya da aşırı çukurlaştırma. Karnını hafifçe sık.',
            '**Momentum yok:** Gövdeni sallayarak ağırlığı kaldırıyorsan yük fazladır.',
            '**Eklemleri kilitleme:** Dirsek ve dizleri hareketin sonunda sertçe kilitleme.'
          ]],
          ['p', 'Kioskta her hareketin videosu var. Bir hareketi ilk kez yapıyorsan önce izle, sonra hafif ağırlıkla dene. Emin olamadığın bir şeyi hocana göstermekten çekinme.']
        ]
      },
      {
        id: 'sakatlik', title: 'Sakatlıktan korunma',
        lead: 'En iyi antrenman, yarın da yapabileceğin antrenmandır.',
        body: [
          ['ul', [
            'Isınmadan ağır sete başlama.',
            'Ağırlığı bir anda değil, küçük adımlarla artır.',
            'Ağır hareketlerde güvenlik pimlerini kullan ya da yanında birinin olmasını iste.',
            'Yorgunluk tekniği bozuyorsa seti bitir.',
            'Aynı kas grubunu art arda günlerde zorlamaktan kaçın.'
          ]],
          ['h', '"İyi ağrı" ile "kötü ağrı" farkı'],
          ['p', 'Çalışan kasta hissedilen yanma ve yorgunluk normaldir. **Eklemde keskin, batan, aniden başlayan** ya da hareketi değiştiren bir ağrı ise uyarıdır: hareketi hemen bırak ve hocana haber ver.'],
          ['tip', 'Ağrı birkaç gün içinde geçmiyorsa, şişlik ya da morarma varsa bir sağlık uzmanına görün.']
        ]
      },
      {
        id: 'doms', title: 'Ertesi gün gelen ağrı',
        lead: 'Antrenmandan bir gün sonra merdiven inmek zor mu geliyor? Yalnız değilsin.',
        body: [
          ['p', 'Alışık olmadığın ya da daha yoğun bir antrenmandan sonra kaslarda hissedilen gecikmiş ağrı genellikle **24–72 saat** içinde zirve yapar ve kendiliğinden geçer. Özellikle yeni başlayanlarda ve yeni bir programın ilk haftalarında sıktır.'],
          ['p', 'Bu ağrı gelişimin ölçüsü değildir. İyi bir antrenmandan sonra hiç ağrı hissetmemen de mümkündür; düzenli çalıştıkça vücut alışır ve ağrı azalır.'],
          ['ul', [
            'Hafif hareket (yürüyüş, hafif bisiklet) ağrıyı azaltmaya yardım eder.',
            'Yeterli uyku ve su toparlanmayı hızlandırır.',
            'Ağrıyan kası ağır şekilde yeniden zorlamak yerine başka bir bölgeyi çalış.'
          ]]
        ]
      }
    ]
  },
  {
    id: 'beslenme', title: 'Beslenme', items: [
      {
        id: 'protein', title: 'Protein: kasın yapı taşı',
        lead: 'Antrenman kası uyarır, protein yeniden inşa eder.',
        body: [
          ['p', 'Protein; et, tavuk, balık, yumurta, süt ürünleri ve baklagillerde bulunur. Antrenmanın açtığı küçük hasarların onarılması ve kasın büyümesi için gereklidir.'],
          ['h', 'Ne kadar?'],
          ['p', 'Hareketsiz yetişkinler için genel öneri günde vücut ağırlığının her kilogramı başına yaklaşık **0,8 gram**dır. Düzenli ağırlık çalışan ve kas kazanmak isteyenlerde ise araştırmalar çoğunlukla **kilogram başına 1,6–2,2 gram** aralığını işaret eder. 75 kiloluk biri için bu, günde yaklaşık 120–165 gram demektir.'],
          ['ul', [
            'Proteini gün içine yay: her öğünde bir avuç içi kadar protein kaynağı.',
            'Antrenmandan sonraki birkaç saat içinde protein içeren bir öğün iyi bir alışkanlıktır.',
            'Toz protein bir zorunluluk değil, günlük hedefe ulaşmayı kolaylaştıran bir besindir.'
          ]],
          ['tip', 'Böbrek hastalığı gibi bir sağlık sorunun varsa protein miktarını doktorunla konuş.']
        ]
      },
      {
        id: 'enerji', title: 'Enerji dengesi: kilo nasıl değişir?',
        lead: 'Kilo vermek ya da almak sihir değil, bir terazi işidir.',
        body: [
          ['p', 'Vücudun harcadığından **daha az enerji** alırsan kilo verirsin, **daha fazla** alırsan kilo alırsın. Antrenman bu terazinin bir kefesini, beslenme diğerini oluşturur.'],
          ['h', 'Kilo vermek için'],
          ['p', 'Küçük ve sürdürülebilir bir açık hedefle; çok sert diyetler kas kaybına ve vazgeçmeye yol açar. Haftada vücut ağırlığının yaklaşık yüzde 0,5–1\'i kadar kayıp çoğu kişi için makul bir hızdır. Bu dönemde ağırlık çalışmaya ve yeterli proteine devam etmek kasın korunmasını sağlar.'],
          ['h', 'Kas kazanmak için'],
          ['p', 'Hafif bir enerji fazlası, düzenli ağırlık antrenmanı ve yeterli protein üçlüsü gerekir. Aşırı fazla, kastan çok yağ olarak geri döner.'],
          ['h', 'Karbonhidrat ve yağ'],
          ['p', 'Karbonhidrat (tahıllar, pirinç, patates, meyve) antrenmanın yakıtıdır. Yağlar (zeytinyağı, kuruyemiş, balık) hormonlar ve genel sağlık için gereklidir. İkisini de dışlamak yerine işlenmemiş kaynaklardan dengeli almak en iyisidir.']
        ]
      },
      {
        id: 'su', title: 'Su: en ucuz performans artırıcı',
        lead: 'Hafif susuzluk bile kuvveti ve konsantrasyonu düşürebilir.',
        body: [
          ['p', 'İhtiyaç; vücut ağırlığına, havanın sıcaklığına ve ne kadar terlediğine göre değişir. Pratik bir başlangıç noktası, gün boyunca düzenli su içmek ve **idrar renginin açık sarı** olmasına dikkat etmektir.'],
          ['ul', [
            'Antrenmana susuz başlama; bir iki saat önce bir bardak su iç.',
            'Antrenman sırasında yudum yudum iç, şişeni yanında tut.',
            'Çok terlediğin uzun antrenmanlarda kaybı yerine koymayı unutma.'
          ]],
          ['tip', 'Susadığını hissettiğinde vücut zaten biraz su kaybetmiştir. Susamayı bekleme.']
        ]
      },
      {
        id: 'zamanlama', title: 'Antrenman öncesi ve sonrası',
        lead: 'Ne zaman yediğin, ne yediğin kadar önemli değil; ama iyi bir zamanlama işini kolaylaştırır.',
        body: [
          ['h', 'Öncesi'],
          ['p', 'Antrenmandan 1–3 saat önce karbonhidrat ve biraz protein içeren hafif bir öğün enerji verir. Örnek: yoğurt ve muz, peynirli tam buğday ekmeği, yulaf ve süt. Ağır ve yağlı yemekler midede rahatsızlık yaratabilir.'],
          ['h', 'Sonrası'],
          ['p', 'Antrenmandan sonraki öğünde protein ve karbonhidratı bir araya getir: tavuk ve pilav, yumurta ve ekmek, ton balıklı salata ve patates. Dakikaları saymana gerek yok; birkaç saat içinde dengeli bir öğün yeterlidir.']
        ]
      }
    ]
  },
  {
    id: 'toparlanma', title: 'Toparlanma', items: [
      {
        id: 'uyku', title: 'Uyku: gerçek antrenman gece yapılır',
        lead: 'Hiçbir takviye, iyi bir gece uykusunun yerini tutamaz.',
        body: [
          ['p', 'Kasların onarımı, hormon dengesi ve ertesi günkü performans büyük ölçüde uykuya bağlıdır. Yetişkinlerin çoğu için önerilen süre gecede **7–9 saattir**.'],
          ['ul', [
            'Her gün aynı saatlerde yatıp kalkmaya çalış.',
            'Yatmadan önceki saatte ekran ışığını azalt.',
            'Akşam geç saatlerde kafeinli içeceklerden kaçın.',
            'Yatak odasını serin, karanlık ve sessiz tut.'
          ]]
        ]
      },
      {
        id: 'dinlenme', title: 'Dinlenme günleri ve antrenman sıklığı',
        lead: 'Dinlenmek pes etmek değil, bir sonraki antrenmana yatırımdır.',
        body: [
          ['p', 'Bir kas grubunu ağır çalıştırdıktan sonra yeniden aynı yoğunlukta çalıştırmadan önce genellikle **48 saat** civarı ara vermek iyi bir başlangıçtır. Bu yüzden programlar bölgeleri günlere dağıtır ya da tüm vücut antrenmanları arasına bir gün koyar.'],
          ['p', 'Dinlenme günü hareketsiz geçmek zorunda değil: yürüyüş, hafif bisiklet ya da esneme toparlanmaya yardımcı olur.'],
          ['tip', 'Sürekli yorgun hissediyorsan, uykun bozulduysa ve ağırlıkların düşüyorsa vücudun dinlenme istiyor olabilir. Hocanla programını konuş.']
        ]
      },
      {
        id: 'aliskanlik', title: 'Motivasyon değil, alışkanlık',
        lead: 'Motivasyon seni salona getirir; alışkanlık seni orada tutar.',
        body: [
          ['ul', [
            '**Takvime yaz:** Antrenmanı bir randevu gibi gör ve günlerini belirle.',
            '**Küçük başla:** Haftada üç gün, kırk beş dakika; yerleşince artır.',
            '**İlerlemeni kaydet:** Ölçülerin bu kioskta duruyor. Ayda bir ölçüm aldırıp grafiğine bak.',
            '**Kendini başkalarıyla değil, geçen ayki halinle kıyasla.**',
            '**Kötü bir gün olur:** Bir antrenmanı kaçırmak bir şey değiştirmez, bırakmak değiştirir.'
          ]]
        ]
      }
    ]
  },
  {
    id: 'kardiyo', title: 'Kardiyo', items: [
      {
        id: 'nabiz', title: 'Nabız bölgeleri',
        lead: 'Kalbin, ne kadar zorlandığını sana söyleyen en dürüst göstergedir.',
        body: [
          ['p', 'Maksimum kalp atım hızı kabaca **220 eksi yaş** formülüyle tahmin edilir. 30 yaşındaki biri için yaklaşık 190 atım/dakika. Bu bir tahmindir; kişiden kişiye değişir.'],
          ['ul', [
            '**%50–60 · Hafif:** Isınma, soğuma, aktif dinlenme. Rahatça konuşabilirsin.',
            '**%60–70 · Orta:** Uzun süre sürdürülebilen tempo; dayanıklılığın temeli.',
            '**%70–80 · Tempolu:** Konuşmak zorlaşır, cümleler kısalır.',
            '**%80–90 · Zor:** Kısa aralıklarla yapılır, konuşmak güçtür.',
            '**%90 ve üzeri · Maksimum:** Yalnızca çok kısa yüklenmeler için.'
          ]],
          ['tip', 'Nabız ölçerin yoksa konuşma testi kullan: cümle kurabiliyorsan orta tempodasın, birkaç kelimeden fazlasını söyleyemiyorsan zor tempodasın.']
        ]
      },
      {
        id: 'hiit', title: 'Sabit tempo mu, aralıklı mı?',
        lead: 'İkisi de işe yarar; seçim hedefine, zamanına ve kondisyonuna bağlı.',
        body: [
          ['p', '**Sabit tempo kardiyo**, orta yoğunlukta 20–60 dakika süren çalışmadır. Yeni başlayanlar için güvenlidir, toparlanmayı zorlamaz ve dayanıklılık temelini oluşturur.'],
          ['p', '**Aralıklı antrenman (HIIT)**, kısa ve çok yoğun bölümlerle kolay bölümlerin sırayla yapılmasıdır; örneğin 30 saniye hızlı, 90 saniye yavaş. Kısa sürede yüksek efor sağlar ama yorucudur; haftada birkaç seans yeterlidir.'],
          ['p', 'Dünya Sağlık Örgütü yetişkinler için haftada **150–300 dakika orta** ya da **75–150 dakika yüksek** yoğunlukta aerobik aktivite ve haftada en az iki gün kas güçlendirme çalışması önerir.'],
          ['tip', 'Kalp ya da tansiyon sorunun varsa yoğun kardiyoya başlamadan önce doktoruna danış.']
        ]
      }
    ]
  },
  {
    id: 'mitler', title: 'Doğru bilinen yanlışlar', items: [
      {
        id: 'mitler-1', title: 'Fitness mitleri',
        lead: 'Salon koridorlarında dolaşan bazı efsaneler ve gerçekler.',
        body: [
          ['h', '"Mekik çekersem göbeğim erir."'],
          ['p', 'Bölgesel yağ yakımı yoktur. Karın kasları güçlenir ama üzerindeki yağ, genel enerji dengesiyle ve tüm vücuttan birlikte azalır.'],
          ['h', '"Kadınlar ağırlık çalışırsa iri olur."'],
          ['p', 'Hormon yapısı nedeniyle kas kütlesi kadınlarda çok daha yavaş artar. Ağırlık çalışmak; daha sıkı bir görünüm, güçlü kemikler ve daha iyi bir duruş kazandırır.'],
          ['h', '"Ağrı yoksa kazanç yok."'],
          ['p', 'Gelişim için zorlanmak gerekir ama acı çekmek gerekmez. Eklem ağrısı bir başarı değil, bir uyarıdır.'],
          ['h', '"Ne kadar çok terlersem o kadar yağ yakarım."'],
          ['p', 'Ter vücudun soğuma sistemidir. Terle kaybedilen kilo sudur ve su içince geri gelir.'],
          ['h', '"Antrenmanı bırakırsam kaslarım yağa dönüşür."'],
          ['p', 'Kas ve yağ farklı dokulardır, biri diğerine dönüşmez. Bırakınca kas azalır; aynı miktarda yemeye devam edilirse yağ artar.'],
          ['h', '"Her gün çalışırsam daha hızlı gelişirim."'],
          ['p', 'Gelişim dinlenirken olur. Aynı bölgeyi toparlanmadan çalıştırmak ilerlemeyi yavaşlatır, sakatlık riskini artırır.']
        ]
      }
    ]
  },
  {
    id: 'sozluk', title: 'Sözlük', items: [
      {
        id: 'sozluk-1', title: 'Salonun dili',
        lead: 'Programında ya da salonda duyabileceğin terimler.',
        body: [
          ['dl', [
            ['Bileşik hareket', 'Birden fazla eklemi ve kas grubunu birlikte çalıştıran hareket. Squat, deadlift, bench press.'],
            ['İzole hareket', 'Tek bir eklemde, tek bir kas grubuna odaklanan hareket. Biceps curl, leg extension.'],
            ['Süperset', 'İki hareketin aralarında dinlenmeden art arda yapılması.'],
            ['Drop set', 'Set bitince ağırlığı azaltıp hiç dinlenmeden devam etmek.'],
            ['Tükenişe kadar', 'Temiz formla bir tekrar daha yapılamayacak noktaya kadar devam etmek.'],
            ['Negatif (eksantrik)', 'Hareketin ağırlığı indirdiğin, kasın uzayarak çalıştığı kısmı.'],
            ['Pozitif (konsantrik)', 'Ağırlığı kaldırdığın, kasın kısalarak çalıştığı kısmı.'],
            ['Hareket açıklığı', 'Bir eklemin hareket boyunca aldığı yolun genişliği.'],
            ['Split program', 'Vücut bölgelerinin farklı günlere dağıtıldığı program; örneğin üst / alt vücut.'],
            ['Full body', 'Her antrenmanda tüm vücudun çalıştırıldığı program.'],
            ['Deload', 'Toparlanmak için yükün bilerek azaltıldığı hafif antrenman haftası.'],
            ['VKİ', 'Vücut kitle indeksi: kilonun boyun karesine bölünmesi. Kas ve yağı ayırt etmez, kaba bir göstergedir.'],
            ['Kardiyo', 'Kalp ve dolaşımı çalıştıran, nabzı uzun süre yükselten aktiviteler.'],
            ['Kod (A-1, A-1 [A])', 'Bu salonda hareketlerin adı. Harf bölgeyi, sayı hareketi, köşeli parantez çeşidi gösterir. Kioskta "Kodla Ara" ile bulabilirsin.']
          ]]
        ]
      }
    ]
  }
];
window.BA.ANSIKLOPEDI_NOT = 'Bu bölümdeki bilgiler genel bilgilendirme amaçlıdır; kişisel tıbbi tavsiye yerine geçmez. Sağlık sorunun varsa antrenmana başlamadan önce doktoruna danış, programın için hocanla konuş.';
