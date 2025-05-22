@echo off
:: Forzar uso de Node local desde carpeta NodeJS
set "NODE_EXE=NodeJS\node.exe"

:: Ejecutar Angular CLI desde node_modules local
%NODE_EXE% node_modules/@angular/cli/bin/ng.js %*

