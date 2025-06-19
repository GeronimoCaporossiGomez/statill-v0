@echo off
:: -------------------------------
:: SE PUEDE UTILIZAR HASTA EN TU CASA PERO ES PRINCIPALMENTE PARA LA ESCUELA
:: Script de arranque de Statill
:: Usa Node.js portable y Angular CLI local
:: -------------------------------

:: Rutas al ejecutable de Node y Angular CLI
set "NODE_EXE=NodeJS\node.exe"
set "NPM_CLI=NodeJS\npm.cmd"
set "NG_CLI=node_modules\@angular\cli\bin\ng.js"

:: Mensaje inicial
echo [STATILL] 🚀 Iniciando entorno portable...

:: Verificar si Angular CLI está instalado (si falta node_modules o ng.js)
IF NOT EXIST %NG_CLI% (
    echo [STATILL] 📦 node_modules no encontrado. Instalando dependencias...
    %NPM_CLI% install
)

:: Ejecutar Angular
echo [STATILL] ✅ Ejecutando 'ng serve' con Node portable...
%NODE_EXE% %NG_CLI% serve

pause
