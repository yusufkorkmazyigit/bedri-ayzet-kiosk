# Bedri Ayzet Spor Salonu — Kiosk Uygulaması

İnternetsiz çalışan, eski Windows 7/10 dokunmatik kiosklar için optimize edilmiş salon uygulaması.
Kiosk kurulumu ve günlük kullanım için: [BENIOKU.md](BENIOKU.md) · Sürüm notları: [CHANGELOG.md](CHANGELOG.md)

## Depo yapısı

```
app/                 arayüz (saf HTML/CSS/JS, çerçeve yok)
  js/views/          ekranlar: home, member, trainer, program-editor
  img/ex/            hareket fotoğrafları
server/              yerel sunucunun C kaynak kodu (exe CI'da derlenir)
scripts/paketle.sh   kiosk paketini (zip) üretir
*.bat                kiosk tarafı betikler (başlat, kapat, güncelle, video hazırla)
VERSION              geçerli sürüm numarası
```

`data/` (üye verileri) ve videolar depoya **girmez**; `.gitignore` bunları dışarıda tutar.

## Yeni sürüm yayınlama

1. Değişiklikleri yapın ve deneyin (`app/index.html` doğrudan tarayıcıda açılabilir).
2. `VERSION` dosyasındaki numarayı artırın ve `CHANGELOG.md`'ye yeni bir `## [x.y.z] - tarih` bölümü ekleyin.
3. Commit + etiket gönderin:
   ```
   git commit -am "v1.3.0: ..."
   git tag v1.3.0
   git push && git push --tags
   ```
4. GitHub Actions paketi derler ve **Releases** sayfasına `BedriAyzetKiosk-v1.3.0.zip` olarak koyar.

## Kiosku güncelleme

1. Releases sayfasından son zip'i indirip USB belleğe çıkarın.
2. Kioskta USB'deki klasörden `GUNCELLE.bat`'ı çalıştırın.

Betik yalnızca program dosyalarını değiştirir; `data/` ve `videos/` olduğu gibi kalır. Önceki arayüz
`app-onceki/` klasörüne yedeklenir.

## Yerelde paket üretme

```
sudo apt install gcc-mingw-w64-i686 zip   # bir kez
scripts/paketle.sh
```
