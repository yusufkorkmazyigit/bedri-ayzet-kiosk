# Değişiklik Günlüğü

Sürüm numaraları `ANA.KÜÇÜK.YAMA` biçimindedir: yama = hata düzeltmesi, küçük = yeni özellik,
ana = veri yapısını etkileyen büyük değişiklik.

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
