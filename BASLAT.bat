@echo off
rem ================================================================
rem  Bedri Ayzet Kiosk - baslatici (Windows 7 / 10 / 11)
rem  1) Yerel sunucuyu (yeniden) baslatir
rem  2) Chrome veya Edge'i tam ekran kiosk modunda acar
rem ================================================================
cd /d "%~dp0"

if not exist "%~dp0kiosk-server.exe" goto noserver

rem Baska bir klasorden kalmis eski sunucu calisiyorsa once onu kapat;
rem yoksa tarayici eski klasordeki eski surumu gosterir.
taskkill /im kiosk-server.exe /f >nul 2>&1
ping -n 2 127.0.0.1 >nul
start "" "%~dp0kiosk-server.exe"

set "URL=http://127.0.0.1:8765/"
set "BROWSER="
if exist "%ProgramFiles%\Google\Chrome\Application\chrome.exe" set "BROWSER=%ProgramFiles%\Google\Chrome\Application\chrome.exe"
if not defined BROWSER if exist "%ProgramFiles(x86)%\Google\Chrome\Application\chrome.exe" set "BROWSER=%ProgramFiles(x86)%\Google\Chrome\Application\chrome.exe"
if not defined BROWSER if exist "%LocalAppData%\Google\Chrome\Application\chrome.exe" set "BROWSER=%LocalAppData%\Google\Chrome\Application\chrome.exe"
if not defined BROWSER if exist "%ProgramFiles(x86)%\Microsoft\Edge\Application\msedge.exe" set "BROWSER=%ProgramFiles(x86)%\Microsoft\Edge\Application\msedge.exe"
if not defined BROWSER if exist "%ProgramFiles%\Microsoft\Edge\Application\msedge.exe" set "BROWSER=%ProgramFiles%\Microsoft\Edge\Application\msedge.exe"

if not defined BROWSER goto nobrowser

rem Sunucunun ayaga kalkmasi icin kisa bekleme
ping -n 2 127.0.0.1 >nul

rem Ekran titremesi / siyah ekran olursa asagidaki satirin sonuna --disable-gpu ekleyin.
start "" "%BROWSER%" --kiosk "%URL%" --user-data-dir="%~dp0data\browser" --no-first-run --no-default-browser-check --disable-translate --disable-features=TranslateUI --overscroll-history-navigation=0 --disable-pinch --autoplay-policy=no-user-gesture-required --disable-session-crashed-bubble --noerrdialogs --disable-infobars --disk-cache-size=52428800
exit /b 0

:noserver
echo.
echo  kiosk-server.exe bu klasorde yok.
echo  Bu bir kaynak kod klasoru olabilir. Kurulum icin GitHub Releases
echo  sayfasindaki BedriAyzetKiosk-vX.Y.Z.zip paketini kullanin.
echo.
pause
exit /b 1

:nobrowser
echo.
echo  Google Chrome veya Microsoft Edge bulunamadi.
echo  Windows 7 icin Chrome 109 surumunu kurup tekrar deneyin.
echo.
pause
exit /b 1
