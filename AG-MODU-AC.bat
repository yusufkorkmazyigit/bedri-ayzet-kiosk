@echo off
rem ================================================================
rem  Bedri Ayzet Kiosk - AG MODUNU AC
rem  Egitmen bilgisayarinin ayni ag uzerinden paneli acabilmesi icin:
rem   1) data\ag-acik isaretini olusturur (sunucu tum aga acilir)
rem   2) Windows Guvenlik Duvari'nda 8765 portuna izin verir
rem   3) Sunucuyu yeniden baslatir
rem   4) Egitmen bilgisayarina kopyalanacak kisayolu hazirlar
rem  Yalnizca ev/isyeri agindaki (192.168.x.x vb.) cihazlar baglanabilir.
rem ================================================================
cd /d "%~dp0"

rem Yonetici yetkisi gerekli (guvenlik duvari kurali icin)
net session >nul 2>&1
if errorlevel 1 (
  echo Yonetici izni isteniyor...
  powershell -NoProfile -Command "Start-Process -FilePath '%~f0' -Verb RunAs"
  exit /b
)

if not exist "%~dp0data" mkdir "%~dp0data"
echo acik> "%~dp0data\ag-acik"

netsh advfirewall firewall delete rule name="Bedri Ayzet Kiosk" >nul 2>&1
netsh advfirewall firewall add rule name="Bedri Ayzet Kiosk" dir=in action=allow protocol=TCP localport=8765 profile=any >nul
if errorlevel 1 echo UYARI: Guvenlik duvari kurali eklenemedi.

taskkill /im kiosk-server.exe /f >nul 2>&1
ping -n 2 127.0.0.1 >nul
start "" "%~dp0kiosk-server.exe"

rem Egitmen bilgisayari icin kisayol (USB ile masaustune kopyalanir)
(
echo [InternetShortcut]
echo URL=http://%COMPUTERNAME%:8765/?panel
) > "%~dp0Bedri Ayzet Panel.url"

cls
echo.
echo  ================================================================
echo   AG MODU ACIK
echo  ================================================================
echo.
echo   Egitmen bilgisayarinda Chrome veya Edge ile su adres acilir:
echo.
echo       http://%COMPUTERNAME%:8765/?panel
echo.
echo   Ad ile acilmazsa asagidaki IP adreslerinden biri kullanilir
echo   (ornek: http://192.168.0.50:8765/?panel):
echo.
for /f "tokens=2 delims=:" %%a in ('ipconfig ^| findstr /c:"IPv4"') do echo      %%a
echo.
echo   Kiosk klasorundeki "Bedri Ayzet Panel" kisayolunu USB ile
echo   egitmen bilgisayarinin masaustune kopyalayin.
echo.
echo   Not: Kiosk kablo ile modeme bagli olmalidir.
echo.
pause
