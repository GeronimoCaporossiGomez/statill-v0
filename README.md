# 🚀 Statill

**Statill** es una plataforma digital desarrollada en Angular 19 que conecta comercios locales con compradores digitales. Ofrece una experiencia PWA moderna con login modal, sistema de fidelización, estadísticas, exploración por zona y un ecosistema premium para potenciar las ventas locales.

---

## ⚙️ Tecnologías utilizadas

| Herramienta            | Función principal                                  |
|------------------------|----------------------------------------------------|
| Angular 19             | Framework con componentes standalone               |
| SCSS modular           | Estilos escalables y responsive                    |
| Angular Router         | Navegación con carga perezosa (`loadComponent`)    |
| RxJS & Signals         | Estado reactivo moderno y eficiente                |
| localStorage           | Persistencia de sesión/local                       |
| Angular PWA            | Compatible con Android/iOS + instalación directa   |
| Animaciones Angular    | Transiciones suaves entre login/registro           |
| FormsModule            | Formularios reactivos integrados con `ngModel`     |

---

## 🧱 Estructura del proyecto

```bash
src/
├── app/
│   ├── auth/                  # Login/Registro como modal
│   ├── comercio/              # Módulo para locales: stock, ventas, fidelización
│   ├── perfil/                # Perfil de usuario final
│   ├── premium/               # Funcionalidades especiales con suscripción
│   ├── home/
│   │   └── landing/           # Página inicial e introductoria (standalone)
│   ├── shared/                # Pipes, servicios comunes, directivas
│   ├── core/                  # Interceptores, guards, configuración base
│   ├── app.routes.ts          # Rutas centralizadas (con `loadComponent`)
│   ├── app.config.ts          # Providers globales (animations, injectables)
├── assets/                    # Imágenes y recursos estáticos
├── styles.scss                # Estilos globales (fuentes, variables, resets)
├── main.ts                    # Bootstrap principal con animaciones
└── index.html
💡 Características clave
🧭 Mapa interactivo para buscar productos y locales por zona.

🧾 Escaneo de productos por parte de los comercios con sistema de stock.

🎯 Fidelización de clientes mediante puntos, beneficios y canales.

🛍️ Exploración libre como visitante o registro con beneficios.

📈 Panel estadístico con información útil para comercios.

🔐 Autenticación vía modal con animaciones suaves.

📲 Pensado para multiplataforma
100% responsive.

Instalación como Progressive Web App (PWA).

Preparado para ser empaquetado como aplicación nativa para Android/iOS.

🛠️ Instalación y ejecución
bash
Copy code
npm install
npm run start
📌 Estado del desarrollo
✔ Estructura base completa
✔ Landing funcional con modal animado
🔄 En desarrollo: explorador de comercios, sistema de fidelización
🔒 Próximo: lógica de autenticación real y conexión con backend

👨‍💻 Autores
Gerónimo Caporossi

Martín Adler