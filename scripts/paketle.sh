#!/usr/bin/env bash
# Kiosk paketini üretir: Windows sunucusunu derler, sürümü işler, zip hazırlar.
# Kullanım:  scripts/paketle.sh            → dist/BedriAyzetKiosk-v<VERSION>.zip
# Gereken:   i686-w64-mingw32-gcc (Ubuntu: apt install gcc-mingw-w64-i686), zip
set -euo pipefail
cd "$(dirname "$0")/.."

VERSION="$(tr -d ' \r\n' < VERSION)"
[[ "$VERSION" =~ ^[0-9]+\.[0-9]+\.[0-9]+$ ]] || { echo "VERSION geçersiz: $VERSION" >&2; exit 1; }
if [[ -n "${GITHUB_REF_NAME:-}" && "$GITHUB_REF_NAME" == v* && "$GITHUB_REF_NAME" != "v$VERSION" ]]; then
  echo "Etiket ($GITHUB_REF_NAME) VERSION dosyasıyla ($VERSION) uyuşmuyor." >&2; exit 1
fi

NAME="BedriAyzetKiosk"
OUT="dist/$NAME"
rm -rf dist && mkdir -p "$OUT"

echo "→ Sunucu derleniyor (Windows 7+ uyumlu, 32-bit)"
i686-w64-mingw32-gcc -O2 -s -Wall -mwindows server/kiosk-server.c -o "$OUT/kiosk-server.exe" -lws2_32

echo "→ Dosyalar kopyalanıyor"
cp -r app server VERSION BENIOKU.md CHANGELOG.md ./*.bat "$OUT/"
mkdir -p "$OUT/videos" "$OUT/ham-videolar" "$OUT/data"
cp videos/VIDEO-ADLARI.txt "$OUT/videos/"
cp ham-videolar/BURAYA-KOYUN.txt "$OUT/ham-videolar/"
printf "/* Bu dosya paketleme sırasında VERSION dosyasından yeniden yazılır. */\nwindow.BA = window.BA || {};\nwindow.BA.VERSION = '%s';\n" "$VERSION" > "$OUT/app/js/version.js"

# Windows toplu iş dosyaları CRLF olmalı
for f in "$OUT"/*.bat "$OUT"/videos/*.txt "$OUT"/ham-videolar/*.txt; do sed -i 's/\r$//; s/$/\r/' "$f"; done

(cd dist && zip -qr9 "$NAME-v$VERSION.zip" "$NAME")
echo "✓ dist/$NAME-v$VERSION.zip ($(du -h "dist/$NAME-v$VERSION.zip" | cut -f1))"
