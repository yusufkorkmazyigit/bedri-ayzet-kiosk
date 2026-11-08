# Değişiklik Günlüğü

Sürüm numaraları `ANA.KÜÇÜK.YAMA` biçimindedir: yama = hata düzeltmesi, küçük = yeni özellik,
ana = veri yapısını etkileyen büyük değişiklik.

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
