@echo off
echo [STATILL] Iniciando aplicacion

:: Ruta relativa al ejecutable Node.js portable
set "NODE_EXE=NodeJS\node.exe"

:: Verifica que node existe
if not exist "%NODE_EXE%" (
  echo ❌ Error: No se encontró NodeJS\node.exe
  pause
  exit /b 1
)

:: Ejecuta Angular CLI desde node_modules
"%NODE_EXE%" node_modules/@angular/cli/bin/ng.js %*
