# Eski kioskdan aktarım (bir kerelik, 2026-11)

Eski kiosk: WAMP (MySQL 5.7 + WordPress) üzerinde `kioks` veritabanı. Hareketler `wp_posts`
(başlık "A-1 [A] düz tutuş"), videolar FV Player tablolarında, dosyalar `wp-content/uploads` ve
`A- OMUZ/A-1/...` klasörlerinde.

1. Tabloları (wp_posts, wp_postmeta, wp_fv_player_players, wp_fv_player_videos; MyISAM dosyaları)
   bir MariaDB'ye kopyalayıp şu dökümleri alın (`<klasör>` = çalışma klasörü):
   `pc.tsv` (ID, post_excerpt, post_title, post_content — yayımlanmış yazılar),
   `pl.tsv` (player id, videos), `vid.tsv` (video id, src, splash), `att.tsv` (ekler).
   Ayrıca eski kiosk klasöründeki medya dosyalarının listesi `inv.json` ([yol, boyut]).
2. `python3 1-medya-esle.py <klasör>` → her hareketin medya dosyası (map.json)
3. `python3 2-katalog.py <klasör>` → kod/ad/kaynak dosya (catalog.json); klasörde olup
   veritabanında olmayan hareketler de eklenir.
4. `python3 3-uygulama-katalogu.py <klasör>` → catalog-app.json + jobs.json
   (catalog-app.json'dan `app/js/catalog.js` üretilir).
5. Eski kiosk kopyasında: `python3 4-medya-donustur.py <eski-kiosk-klasörü>`
   (jobs.json `kiosk-medya/` içinde olmalı) → `kiosk-medya/` altında MP4/JPG + thumbs.

Dosyaların içeriği (logo, filigran vb.) değiştirilmez; yalnızca biçim ve boyut dönüştürülür.
Üye tabloları (uyeler, veriler) ve WordPress kullanıcı tabloları aktarılmadı.
