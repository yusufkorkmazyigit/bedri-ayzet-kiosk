@echo off
rem ================================================================
rem  Bedri Ayzet Kiosk - guncelleme
rem  Kullanim: Yeni surumun zip'ini herhangi bir yere (or. USB bellek)
rem  cikarin ve O KLASORDEKI bu dosyayi calistirin.
rem  Kurulu uygulamayi (varsayilan C:\BedriAyzetKiosk) gunceller.
rem  data\ (uyeler, olcumler) ve videos\ klasorlerine DOKUNMAZ.
rem ================================================================
setlocal
set "SRC=%~dp0"
set "SRC=%SRC:~0,-1%"
set "DST=C:\BedriAyzetKiosk"
if not "%~1"=="" set "DST=%~1"

if not exist "%SRC%\app\index.html" goto badsrc
if /i "%SRC%"=="%DST%" goto samedir
if not exist "%DST%\app\index.html" goto nodst

set /p NEWV=<"%SRC%\VERSION"
set "OLDV=bilinmiyor"
if exist "%DST%\VERSION" set /p OLDV=<"%DST%\VERSION"
echo.
echo  Kurulu surum : %OLDV%
echo  Yeni surum   : %NEWV%
echo  Hedef        : %DST%
echo.
echo  Once kiosk ekranini Alt+F4 ile kapatin.
echo.
choice /m "Guncellensin mi"
if errorlevel 2 exit /b 0

echo Uygulama kapatiliyor...
taskkill /im kiosk-server.exe /f >nul 2>&1
ping -n 2 127.0.0.1 >nul

rem Onceki surumun arayuzu app-onceki klasorune tasinir (sorun olursa geri donmek icin)
if exist "%DST%\app-onceki" rmdir /s /q "%DST%\app-onceki"
move "%DST%\app" "%DST%\app-onceki" >nul
if errorlevel 1 goto movefail
xcopy "%SRC%\app" "%DST%\app\" /e /i /y /q >nul
if errorlevel 1 goto copyfail
xcopy "%SRC%\server" "%DST%\server\" /e /i /y /q >nul
for %%F in ("%SRC%\*.bat" "%SRC%\*.md" "%SRC%\VERSION" "%SRC%\kiosk-server.exe") do copy /y "%%~F" "%DST%\" >nul
if exist "%SRC%\videos\VIDEO-ADLARI.txt" copy /y "%SRC%\videos\VIDEO-ADLARI.txt" "%DST%\videos\" >nul

echo.
echo  Guncelleme tamamlandi: %NEWV%
echo  Uygulama yeniden baslatiliyor...
start "" /d "%DST%" "%DST%\BASLAT.bat"
ping -n 3 127.0.0.1 >nul
exit /b 0

:badsrc
echo Bu dosyayi yeni surumun cikarildigi klasorden calistirin.
pause & exit /b 1
:samedir
echo Guncelleme dosyasi kurulu klasorun icinden degil, yeni surumun klasorunden calistirilmali.
pause & exit /b 1
:nodst
echo %DST% klasorunde kurulu uygulama bulunamadi.
echo Farkli bir klasore kuruluysa: GUNCELLE.bat "D:\Klasor\Yolu"
pause & exit /b 1
:movefail
echo Uygulama klasoru tasinamadi. Tarayiciyi Alt+F4 ile kapatip tekrar deneyin.
pause & exit /b 1
:copyfail
echo Kopyalama basarisiz oldu, onceki surum geri yukleniyor...
if exist "%DST%\app" rmdir /s /q "%DST%\app"
move "%DST%\app-onceki" "%DST%\app" >nul
pause & exit /b 1
