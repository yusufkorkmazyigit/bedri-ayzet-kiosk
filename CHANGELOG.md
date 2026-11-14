# Değişiklik Günlüğü

Sürüm numaraları `ANA.KÜÇÜK.YAMA` biçimindedir: yama = hata düzeltmesi, küçük = yeni özellik,
ana = veri yapısını etkileyen büyük değişiklik.

## [1.9.0] - 2026-11-15

### Eklendi
- **Ağ modu (eğitmen bilgisayarı):** kiosktaki `AG-MODU-AC.bat` çalıştırılınca eğitmen paneli aynı ağdaki başka bir bilgisayardan tarayıcıyla açılabilir (`http://KIOSK-PC:8765/?panel`). Kurulum gerektirmez; betik masaüstü kısayolunu da hazırlar. `AG-MODU-KAPAT.bat` ile kapatılır. Yalnızca yerel ağ adresleri (192.168.x.x vb.) bağlanabilir; kiosku kapatma komutu yalnızca kioskun kendisinden çalışır.
- **Eşzamanlı düzenleme:** kiosk ve eğitmen bilgisayarı aynı anda kullanılırsa değişiklikler kayıt kayıt birleştirilir; biri diğerinin kaydını ezmez. Başka cihazdaki değişiklik birkaç saniye içinde ekrana gelir (açık form ya da program düzenleyici varsa, kapanınca).
- Ayarlar'da "Eğitmen bilgisayarı (ağ)" kartı: ağ modunun durumu ve bağlantı adresi.

## [1.8.1] - 2026-11-15

### Eklendi
- **Fitness Ansiklopedisi:** ana menüdeki "Ansiklopedi" butonuyla açılan okuma bölümü. 7 bölümde 19 yazı (temeller, teknik ve güvenlik, beslenme, toparlanma, kardiyo, doğru bilinen yanlışlar, sözlük). Solda içindekiler, sağda kaydırarak okuma; okunan bölüm menüde işaretlenir. İçerik yalnızca ilk açılışta yüklenir, açılışı yavaşlatmaz.

### Değişti
- Ana menü başlığı: "Bugün hangi bölgeyi çalışıyoruz?" yerine Atatürk'ün sözü: “Ben sporcunun zeki, çevik ve aynı zamanda ahlaklısını severim.”

### Düzeltildi
- Kioskun Chrome 79 sürümünde listeler dağınık görünüyordu (eğitmen panelinde hareket ve üye satırları, üye programı). Eski Chrome düğmelerde ızgara düzenini ve esnek kutu boşluklarını (gap) desteklemiyor; bu sürümler için otomatik yedek düzen eklendi. Yeni tarayıcılarda görünüm değişmedi.

## [1.8.0] - 2026-11-15

### Değişti
- Yeni görünüm: ana menüde 12 bölge kartı salona özel anatomi görselleriyle; her kartta büyük kod harfi (A, B, C …), bölge adı ve hareket sayısı. Gereksiz açıklama yazıları kaldırıldı.
- Okunaklı yazı tipleri: başlıklarda Barlow Condensed, metinlerde Barlow (yerel dosya, internet gerekmez; SIL OFL lisanslı, `app/fonts`).
- Renk paleti: koyu lacivert zemin + görsellerle uyumlu turkuaz vurgu; metin kontrastları WCAG AA düzeyinde. Vücut haritasındaki vurgu da turkuaza çevrildi.
- Bölge sayfası başlığında kategori görseli ve kod harfi; hareket kartlarında daha büyük adlar.
- Kart sayıları artık ana hareketleri sayıyor (çeşitler ayrıca sayılmıyor).

## [1.7.1] - 2026-11-15

### Düzeltildi
- Eski Chrome sürümlerinde (Windows 7 kiosku) pencereler görünmüyordu: hareket videosu, Üye Girişi ve Eğitmen Girişi açılmıyormuş gibi davranıyordu. `inset` ve `aspect-ratio` gibi yeni CSS özellikleri klasik karşılıklarıyla değiştirildi, eski sürümler için yedek eklendi.

### Eklendi
- Ayarlar → **Kiosku kapat**: klavye olmadan "Masaüstüne çık" ya da "Bilgisayarı kapat" (eğitmen PIN'iyle girilen panelden).

## [1.7.0] - 2026-11-14

### Eklendi
- Salonun hareket kütüphanesi: eski kioskun veritabanı ve klasörlerinden 433 hareket kod, ad ve video/fotoğrafıyla aktarıldı (`app/js/catalog.js`).
- Videolar kiosk için hazırlandı: tek tip H.264 MP4 (en fazla 720p, sessiz, hızlı başlangıç); eski FLV/TS/WebM/GIF dosyaları dönüştürüldü. Toplam boyut 325 MB'tan 48 MB'a indi. Her hareket için küçük önizleme resmi.
- Bölgeler salonun kod harflerine göre yeniden düzenlendi: A Omuz, B Göğüs, C Kanat, D Arka Kol, E Pazu, F Bacak, G Mide & Karın, H Oblik, K Bilek, M Deadlift, O Plank & Şınav, Kardiyo. Ana ekranda kod harfi rozet olarak görünür.
- Bölge sayfasında her ana hareket tek kart ("+3 çeşit"); hareket penceresinde çeşitler arasında geçiş.
- Eğitmen panelinde hareket kütüphanesi araması (kod veya ad).

### Değişti
- Kod biçimi eski kioskla aynı: `A-1` ve `A-1 [A]`. `A1,1` yazımı o hareketin 1. çeşidi olarak tanınır.
- Kodla Ara: çeşit harfi yazılabiliyor (A1 + A → A-1 [A]), sonuç listesi kaydırılabilir, "Temizle" tuşu.
- Hareket görselleri açık zeminli tek tip çerçevede gösteriliyor (dosyaların kendisi değiştirilmedi).
- Örnek şablonlar salon kodlarıyla yeniden yazıldı; örnek hareket kütüphanesi (kardiyo hariç) kaldırıldı.
- Eski kayıtlar otomatik taşınır: eski bölge kimlikleri (sırt, kol, kalça) yeni bölgelere aktarılır.

## [1.6.0] - 2026-11-08

### Eklendi
- Salon hareket kodları (A1,1 gibi): harekete kod alanı, esnek yazım (`A1,1` = `A1.1` = `a1 1`), listelerde kod rozeti ve kod sırasına göre sıralama.
- Ana ekranda **Kodla Ara**: harf + rakam tuşlarıyla kod yazılır, eşleşen hareketler anında listelenir, video doğrudan açılır.
- **Kod listesi ekle**: hocanın listesi tek seferde içe aktarılır ("A1,1 OMUZ YANA AÇIŞ" satırları veya Excel'den iki sütun); harf → bölge eşleştirmesi, önizleme, hatalı/tekrar eden satır uyarısı.
- Program düzenleyicide kodla hızlı ekleme: `A1,1` ya da `A1,1 3x12` yazıp Enter. Hareket seçicide kod/ad araması.
- Program çıktısı: üye sayfasında **Yazdır** (A4, kodlu tablo).
- Ölçüm kontrolü: önceki ölçüme göre olağandışı farkta (ör. 36 yerine 3,6) kaydetmeden önce onay sorulur.
- Kurulum uyarıları: varsayılan PIN ve Demo Üye duruyorsa eğitmen panelinde uyarı ve tek dokunuşla düzeltme.

### Düzeltildi
- Sunucu: aynı anda gelen kayıt istekleri artık aynı geçici dosyayı paylaşmıyor; okuma/yazma kilitle sıraya giriyor (ağ modu için hazırlık). Windows'ta dosya geçici olarak kilitliyse yer değiştirme birkaç kez yeniden denenir.
- Sunucu: HEAD isteklerinde gövde gönderilmiyor.

## [1.5.0] - 2026-11-08

### Eklendi
- Üye ekranında vücut haritası: anatomik kas çizimi üzerinde kol, göğüs, bel, kalça ve bacak ölçüleri; her bölgede son değer ve değişim. Bölgeye veya etikete dokununca o kas grubu mavi parlar ve ölçünün grafiği açılır.
- Özet satırı: seçilen dönemde en çok değişen ölçüler (ör. "3 ayda: Bel −8 cm · Kol +3 cm").
- Dönem seçimi: Başlangıçtan / Son 3 ay / Son ölçümden. Grafik ve farklar seçilen döneme göre hesaplanır.
- Eğitmen panelinde üye sayfasına değişim çubukları: her ölçü için "35 → 38 cm (+3 · +8,6%)" ve yüzde değişimi gösteren çubuk.

### Değişti
- Ölçüm değişimleri artık nötr renkte (▲/▼) gösteriliyor; hangi yönün iyi sayılacağı üyenin hedefine göre değiştiği için yeşil/turuncu yorum kaldırıldı.

## [1.4.0] - 2026-09-27

### Eklendi
- Üyelere doğum tarihi. Doğum gününde üye ekranında "İyi ki doğdun" mesajı, eğitmen panelinde pasta simgesi ve "Bugün doğum günü" filtresi.
- Üyelik paketi: yeni üye kaydında paket süresi (1/3/6/12 ay) ve başlangıç tarihi girilir, bitiş tarihi otomatik hesaplanır.
- Üye sayfasında "Üyelik" kartı: kalan gün, bitişi düzenleme (+7/+10/+15/+30 gün hızlı butonlarıyla, dondurma vb.), paket ekleme ve değişiklik geçmişi.
- Üye listesinde üyelik bitişi sütunu ve "Üyeliği bitiyor" (7 gün) / "Üyeliği bitmiş" filtreleri.
- Üye ekranında üyelik bitiş bilgisi.

### Değişti
- "Doğum yılı" alanı "Doğum tarihi" oldu; yaş doğum tarihinden hesaplanır (eski kayıtlarda doğum yılı korunur).

## [1.3.0] - 2026-09-25

### Eklendi
- Salonun yeni logosu: uygulamanın üst çubuğunda ve açılış ekranında.
- `logo/` klasörü: ana, yatay, ikon, koyu zemin ve tek renk logo sürümleri (SVG + PNG) ve renk kodları.

### Değişti
- Uygulamanın vurgu rengi logodaki elektrik mavisi oldu; arka plan tonları lacivertle uyumlu hale getirildi.

## [1.2.1] - 2026-09-24

### Düzeltildi
- `BASLAT.bat` artık arka planda kalmış eski sunucuyu kapatıp kendi klasöründeki sunucuyu başlatıyor.
  Önceden, başka bir klasörden açılmış eski sürüm çalışıyorsa yeni sürüm yerine o görünüyordu.
- `kiosk-server.exe` bulunmayan klasörde (kaynak kod klasörü) başlatılırsa açıklayıcı uyarı veriliyor.

## [1.2.0] - 2026-09-24

### Eklendi
- Videosu olmayan hareketlerde başlangıç/bitiş fotoğraflı anlatım (34 hareket, Free Exercise DB — kamu malı).
- Hareket kartlarında önizleme fotoğrafı.
- `GUNCELLE.bat`: veriler ve videolara dokunmadan uygulamayı yeni sürüme günceller.
- Ayarlar sayfasında sürüm numarası.

## [1.1.0] - 2026-09-24

### Eklendi
- `VIDEO-HAZIRLA.bat`: ham videoları kiosk için 720p/H.264/sessiz formata dönüştürür.

### Düzeltildi
- USB ile kopyalanan videolar uygulama yeniden başlatılmadan tanınıyor.

## [1.0.0] - 2026-09-24

### Eklendi
- İlk sürüm: bölge kartları ve hareket videoları, üye girişi (program + ölçüm takibi),
  eğitmen paneli (üyeler, şablonlar, hareket kütüphanesi, ayarlar), yerel sunucu, ekran klavyesi,
  otomatik oturum kapatma, günlük otomatik yedek.
