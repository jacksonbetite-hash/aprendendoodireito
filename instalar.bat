@echo off
REM Atalho para quem prefere clicar duas vezes em vez de abrir o PowerShell.
REM Ele apenas chama instalar.ps1 contornando a politica de execucao.
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0instalar.ps1"
pause
