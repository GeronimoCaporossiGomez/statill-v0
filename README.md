# 📱 Statill

Statill es una aplicación web desarrollada con Angular (v17+) utilizando componentes standalone, signals y persistencia en `localStorage`. Su propósito es brindar a usuarios finales una experiencia fluida para:

- 🔎 Navegar comercios locales.
- 🛒 Comprar productos y acumular puntos.
- 📊 Visualizar estadísticas para comercios.

---

## 🧰 Tecnologías y herramientas

| Herramienta         | Descripción                                     |
|---------------------|-------------------------------------------------|
| Angular 17+         | Framework base con standalone components        |
| SCSS                | Estilos globales y modulares                    |
| Angular Router      | Ruteo con `loadComponent()`                     |
| Signals             | Estado reactivo moderno                         |
| localStorage        | Persistencia local                              |
| Angular PWA         | Instalación como app móvil o escritorio         |

---

## 📁 Estructura del proyecto

```bash
src/
├── app/
│   ├── auth/                  # Login, Registro
│   ├── comercio/              # Funciones para vendedores/comercios
│   ├── pages/                 # Vistas principales (landing, carrito, etc.)
│   ├── perfil/                # Perfil de usuario
│   ├── premium/               # Funcionalidades pagas
│   ├── shared/                # Pipes, servicios, componentes reutilizables
│   ├── app.component.ts
│   ├── app.component.html
│   ├── app.component.scss
│   ├── app.config.ts
│   ├── app.routes.ts
│   ├── app.config.server.ts
│   ├── app.routes.server.ts
├── assets/
├── main.ts
├── main.server.ts
├── server.ts
├── styles.scss
