# Değişiklik Günlüğü

Sürüm numaraları `ANA.KÜÇÜK.YAMA` biçimindedir: yama = hata düzeltmesi, küçük = yeni özellik,
ana = veri yapısını etkileyen büyük değişiklik.

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
