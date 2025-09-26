n# 📦 Statill – Ejecución con NodeJS Portable

Este archivo explica cómo ejecutar Statill en cualquier entorno **sin instalar Node.js ni Angular CLI globalmente**, utilizando el script `run-angular.bat` y una carpeta `NodeJS/` con Node portable.

---

## ▶️ Cómo ejecutar Statill localmente (NodeJS portable)

Este proyecto está preparado para ejecutarse en cualquier máquina sin necesidad de instalar Node.js ni Angular CLI de forma global.

### ✅ Requisitos

- Carpeta `NodeJS/` con Node portable (ya incluida en el repositorio local, **no se sube a Git**).
- Script `run-angular.bat` en la raíz del proyecto.

---

## 🚀 Pasos para correr el proyecto

1. **Instalación de dependencias**  
   La primera vez que corras el script, si `node_modules/` no está presente, se instalará automáticamente con:
   ```
   NodeJS\npm.cmd install
   ```

2. **Ejecución del proyecto**  
   Ejecutá:
   ```bat
   .\run-angular.bat
   ```
   Esto levantará el servidor de desarrollo en:
   ```
   http://localhost:4200
   ```

---

## 🛠 ¿Qué hace `run-angular.bat`?

El script `run-angular.bat`:

- Usa Node portable desde la carpeta `NodeJS/`.
- Verifica si `node_modules/@angular/cli/bin/ng.js` existe.
- Si no está instalado, corre `npm install` automáticamente.
- Luego ejecuta Angular CLI localmente con `ng serve`.

Esto asegura que el proyecto puede funcionar sin dependencias globales, ideal para entornos educativos o colaborativos donde no se puede instalar software globalmente.

---

## 🧑‍🤝‍🧑 Colaboradores

Si trabajás en equipo, configurá tu identidad local para este proyecto antes de hacer commit:

```bash
git config user.name "Tu Nombre"
git config user.email "tu@email.com"
```

Esto se guarda **solo en este repositorio**, y no afecta otros proyectos.

---

¡Listo para desarrollar! 🚀

$env:Path = "C:\Users\%USERNAME%\statill-v0\NodeJs;" + $env:Path

$env:Path = "D:\statill-v0\NodeJs;" + $env:Path