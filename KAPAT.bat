@echo off
rem Kiosk tarayicisini ve yerel sunucuyu kapatir (bakim icin).
rem Not: Kiosk modundaki tarayicidan cikmak icin Alt+F4 de kullanilabilir.
taskkill /im kiosk-server.exe /f >nul 2>&1
echo Sunucu kapatildi. Tarayiciyi Alt+F4 ile kapatabilirsiniz.
ping -n 3 127.0.0.1 >nul
