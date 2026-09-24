# Bedri Ayzet Spor Salonu — Kiosk Uygulaması

İnternet gerektirmeyen, tamamen yerelde çalışan kiosk uygulaması. Windows 7 / 10 / 11.

## Kurulum (1 dakika)

1. Klasörü kioskta kalıcı bir yere kopyalayın (ör. `C:\BedriAyzetKiosk`).
2. Kioskta **Google Chrome** veya **Microsoft Edge** kurulu olmalı.
   Windows 7 için desteklenen son sürüm **Chrome 109**'dur (çevrimdışı kurulum dosyasıyla kurulabilir).
3. `BASLAT.bat` dosyasına çift tıklayın → uygulama tam ekran açılır.
4. Bilgisayar açıldığında kendiliğinden başlasın istiyorsanız `OTOMATIK-BASLAT-KUR.bat` dosyasını bir kez çalıştırın.

Varsayılan **eğitmen PIN'i: `1234`** — ilk girişte *Ayarlar → Eğitmen PIN* bölümünden değiştirin.
Örnek üye: **1001** (Demo Üye). Eğitmen panelinden silebilirsiniz.

Kiosk modundan çıkmak için: **Alt + F4**. Sunucuyu durdurmak için `KAPAT.bat`.

## Klasör yapısı

```
BASLAT.bat               uygulamayı başlatır
KAPAT.bat                yerel sunucuyu durdurur
kiosk-server.exe         85 KB'lık yerel sunucu (kurulum gerektirmez)
app/                     uygulama arayüzü (HTML/CSS/JS)
videos/                  hareket videoları (.mp4 / .webm)
data/db.json             tüm veriler (üyeler, programlar, ölçümler)
data/backups/            günlük otomatik yedekler
server/kiosk-server.c    sunucunun kaynak kodu
```

## Hareket videoları

İki yol var:

- **Panelden:** Eğitmen Girişi → Hareketler → hareketi düzenle → *Bilgisayardan yükle*.
- **Elle:** Videoyu `videos/` klasörüne kopyalayın; hareket düzenleme ekranında listeden seçin.
  Hazır hareketler için beklenen dosya adları zaten tanımlı (ör. `bench-press.mp4`, `squat.mp4`);
  aynı adla kopyalamanız yeterli. Listede videosu eksik olanlar turuncu işaretlenir.

Eski donanım için öneri: **720p, H.264, 1–2 Mbps, 10–30 sn, sessiz döngü**. Büyük 1080p/4K videolar zayıf
işlemcide takılır. Dönüştürmek için (ffmpeg ile):

```
ffmpeg -i girdi.mp4 -vf scale=-2:720 -c:v libx264 -preset slow -crf 26 -an -movflags +faststart cikti.mp4
```

## Hareket fotoğrafları

Videosu olmayan hareketlerde başlangıç ve bitiş pozisyonunu gösteren iki fotoğraf dönüşümlü gösterilir
(34 hareket; Jumping Jack için fotoğraf yok). Video eklendiğinde fotoğrafların yerini otomatik olarak video alır.

Fotoğraflar [Free Exercise DB](https://github.com/yuhonas/free-exercise-db) projesinden alınmıştır; proje
verisini kamu malı (Unlicense) olarak yayınlıyor. Dosyalar `app/img/ex/` klasöründedir.

## Güncelleme

Yeni sürümün zip'ini USB belleğe çıkarın ve **oradaki** `GUNCELLE.bat` dosyasını kioskta çalıştırın.
Eski klasörü silmeyin: betik yalnızca program dosyalarını yeniler, `data/` (üyeler, ölçümler) ve
`videos/` klasörlerine dokunmaz. Sorun çıkarsa önceki arayüz `app-onceki/` klasöründe durur.

## Yedekleme

- Her gün ilk kayıtta `data/db.json` otomatik olarak `data/backups/` içine kopyalanır.
- *Ayarlar → Yedeği indir* ile JSON yedeği alınabilir, *Yedekten geri yükle* ile geri yüklenir.
- Tam yedek için tüm klasörü (özellikle `data/` ve `videos/`) bir USB belleğe kopyalamanız yeterli.

## Performans

- Framework yok, web fontu yok, internet isteği yok — sayfanın tamamı ~150 KB.
- Video penceresi kapanınca kod çözücü hemen serbest bırakılır.
- Çok yavaş cihazlarda: *Ayarlar → Performans modu → Hafif* (tüm animasyonları kapatır).
- Ekran titriyor / siyah kalıyorsa `BASLAT.bat` içindeki tarayıcı satırına `--disable-gpu` ekleyin.

## Güvenlik notları

- Sunucu yalnızca `127.0.0.1`'i dinler; ağdan erişilemez.
- Üye ve eğitmen oturumları hareketsizlikte otomatik kapanır (süreler Ayarlar'dan değişir).
- Eğitmen PIN'i 5 hatalı denemeden sonra 60 sn kilitlenir.
- Üye girişi yalnızca üye numarasıyla yapılır; bu tasarım gereği kolaylık içindir, hassas veri tutulmamalıdır.

## Sunucu olmadan çalıştırma (yedek yöntem)

`app/index.html` doğrudan tarayıcıda da açılabilir. Bu durumda veriler tarayıcının kendi deposunda
tutulur ve panelden video yüklenemez — yalnızca deneme amaçlı kullanın.

## Sunucuyu yeniden derlemek

```
i686-w64-mingw32-gcc -O2 -s -mwindows server/kiosk-server.c -o kiosk-server.exe -lws2_32
```
