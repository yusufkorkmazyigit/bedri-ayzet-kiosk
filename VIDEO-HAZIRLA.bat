@echo off
rem ================================================================
rem  Ham videolari kiosk icin hazirlar (720p, H.264, sessiz, hizli baslayan).
rem  1) ffmpeg.exe dosyasini bu klasore koyun (veya PATH'e ekleyin).
rem  2) Ham videolari "ham-videolar" klasorune, uygulamadaki dosya adiyla koyun
rem     (or. ham-videolar\squat.mov). Uzanti ne olursa olsun olur.
rem  3) Bu dosyayi calistirin. Sonuclar videos\ klasorune .mp4 olarak yazilir.
rem  Bu islem kiosk'ta degil, kendi bilgisayarinizda yapilmalidir.
rem ================================================================
cd /d "%~dp0"
set "FF=ffmpeg"
if exist "%~dp0ffmpeg.exe" set "FF=%~dp0ffmpeg.exe"
"%FF%" -version >nul 2>&1
if errorlevel 1 goto noff
if not exist "ham-videolar" mkdir "ham-videolar"
if not exist "videos" mkdir "videos"

set /a N=0
for %%F in ("ham-videolar\*.*") do (
  echo Donusturuluyor: %%~nxF
  "%FF%" -loglevel error -y -i "%%F" -vf "scale=-2:720,fps=30" -c:v libx264 -preset slow -crf 26 -profile:v main -pix_fmt yuv420p -an -movflags +faststart "videos\%%~nF.mp4"
  set /a N+=1
)
echo.
echo Bitti. %N% video videos\ klasorune yazildi.
pause
exit /b 0

:noff
echo.
echo  ffmpeg bulunamadi. https://www.gyan.dev/ffmpeg/builds/ adresinden
echo  "release essentials" paketini indirip bin\ffmpeg.exe dosyasini bu klasore kopyalayin.
echo.
pause
exit /b 1
