@echo off
rem Bedri Ayzet Kiosk - AG MODUNU KAPAT: panel yalnizca bu bilgisayardan acilir.
cd /d "%~dp0"
net session >nul 2>&1
if errorlevel 1 (
  powershell -NoProfile -Command "Start-Process -FilePath '%~f0' -Verb RunAs"
  exit /b
)
if exist "%~dp0data\ag-acik" del "%~dp0data\ag-acik"
netsh advfirewall firewall delete rule name="Bedri Ayzet Kiosk" >nul 2>&1
taskkill /im kiosk-server.exe /f >nul 2>&1
ping -n 2 127.0.0.1 >nul
start "" "%~dp0kiosk-server.exe"
echo.
echo  Ag modu kapatildi. Panel artik yalnizca kiosktan acilir.
echo.
pause
