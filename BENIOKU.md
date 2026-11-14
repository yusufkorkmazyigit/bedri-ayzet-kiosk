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

## Hareket kütüphanesi ve videolar

Uygulama salonun kendi hareket kütüphanesiyle gelir: eski kiosktan aktarılan **433 hareket**
(A Omuz, B Göğüs, C Kanat, D Arka kol, E Pazu, F Bacak, G Mide/Karın, H Oblik, K Bilek, M Deadlift,
O Plank & Şınav) ve 4 kardiyo hareketi. Liste `app/js/catalog.js` dosyasındadır.

Medya dosyaları depoda tutulmaz; kioskta `videos/` klasörüne konur:

- `videos/a1.mp4`, `videos/a1-a.mp4` … hareket videoları (H.264, en fazla 720p, sessiz)
- `videos/a1-c.jpg` … videosu olmayan hareketlerin fotoğrafı
- `videos/thumbs/*.jpg` … kartlardaki küçük önizlemeler

Dosya adı koddan gelir: `A-1` → `a1`, `A-1 [A]` → `a1-a` (İ → `i`, Ö → `o2`, Ç → `c2` …).
Hazır paket `kiosk-medya` klasörü olarak USB ile getirilir; içeriğini kioskun `videos/` klasörüne kopyalamanız yeterli.

Yeni ya da değiştirilmiş bir video için:

- **Panelden:** Eğitmen Girişi → Hareketler → hareketi düzenle → *Bilgisayardan yükle*.
- **Elle:** Videoyu `videos/` klasörüne aynı adla kopyalayın (ör. `a1-a.mp4`).

Eski donanım için öneri: **720p, H.264, 10–30 sn, sessiz döngü**. Dönüştürmek için (ffmpeg ile):

```
ffmpeg -i girdi.mp4 -vf scale=-2:720 -c:v libx264 -preset slow -crf 24 -an -movflags +faststart cikti.mp4
```

Kardiyo hareketlerinin fotoğrafları [Free Exercise DB](https://github.com/yuhonas/free-exercise-db) projesinden
alınmıştır (kamu malı). Dosyalar `app/img/ex/` klasöründedir.

## Salon hareket kodları

- Kodlar eski kioskta olduğu gibidir: `A-1` ana hareket, `A-1 [A]`, `A-1 [B]` … çeşitleri.
- Yazım esnektir: `A1`, `A-1` → ana hareket; `A1A`, `A1 a`, `A-1 [A]` → çeşit; `A1,1` → o hareketin 1. çeşidi.
- Üyeler ana ekrandaki **Kodla Ara** ile kodu yazıp hareketin videosunu açar. Bölge sayfalarında her ana hareket
  tek karttır; çeşitler hareket penceresinden seçilir.
- Program düzenlerken her günün altındaki kutuya `A1A` ya da `A1A 3x12` yazıp Enter (veya ekran klavyesinde Tamam).
- Yeni kodlar: *Hareketler → düzenle → Salon kodu* ya da toplu olarak *Hareketler → Kod listesi ekle*
  (`A-1 [A] DÜZ TUTUŞ` satırları veya Excel'den iki sütun).
- Üye sayfasındaki **Yazdır** ile program A4 çıktı olarak alınır.

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
- Eğitmen PIN'i 5 hatalı denemeden sonra 60 sn kilitlenir. Varsayılan PIN (1234) değiştirilmediği sürece eğitmen panelinde uyarı görünür.
- Üye girişi yalnızca üye numarasıyla yapılır; bu tasarım gereği kolaylık içindir, hassas veri tutulmamalıdır.

## Sunucu olmadan çalıştırma (yedek yöntem)

`app/index.html` doğrudan tarayıcıda da açılabilir. Bu durumda veriler tarayıcının kendi deposunda
tutulur ve panelden video yüklenemez — yalnızca deneme amaçlı kullanın.

## Sunucuyu yeniden derlemek

```
i686-w64-mingw32-gcc -O2 -s -mwindows server/kiosk-server.c -o kiosk-server.exe -lws2_32
```
