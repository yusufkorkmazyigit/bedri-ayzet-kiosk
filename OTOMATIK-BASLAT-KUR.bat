@echo off
rem Bilgisayar acildiginda kiosk uygulamasinin otomatik baslamasini saglar.
rem Kaldirmak icin: OTOMATIK-BASLAT-KALDIR.bat
set "STARTUP=%APPDATA%\Microsoft\Windows\Start Menu\Programs\Startup"
echo @echo off> "%STARTUP%\bedri-ayzet-kiosk.bat"
echo start "" /d "%~dp0." "%~dp0BASLAT.bat">> "%STARTUP%\bedri-ayzet-kiosk.bat"
echo Otomatik baslatma kuruldu.
echo Bilgisayar her acildiginda kiosk uygulamasi kendiliginden acilacak.
pause
