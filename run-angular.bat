@echo off
:: Cambia esta ruta a donde esté tu node.exe local
set "NODE_EXE=NodeJS\node.exe"

:: Corre angular con node local
%NODE_EXE% node_modules/@angular/cli/bin/ng.js %*
