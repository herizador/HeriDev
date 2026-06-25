# HeriDev — Portfolio Cyberpunk

Portfolio web personal de **Ismael Mateo Díaz Gutiérrez** (alias **HeriDev**).  
Desarrollador full-stack especializado en Java (Oracle Certified), con un stack moderno que abarca Astro, React, Tailwind CSS y Node.js.

El sitio funciona como carta de presentación profesional, exhibiendo proyectos destacados («Las Joyas de la Corona»), proyectos Java con certificaciones Oracle, y repositorios públicos de GitHub sincronizados en build-time. Todo envuelto en una estética **cyberpunk** con animaciones CSS tipo máquina de escribir, un canvas de partículas interactivo e integración opcional de modelos 3D vía Spline.

## Stack tecnológico

| Capa | Tecnología |
|---|---|
| Framework | **Astro 5** (hybrid output, static por defecto con funciones serverless) |
| Islas UI | **React 19** con `client:visible` / `client:only` para componentes interactivos |
| 3D | **Spline** (`@splinetool/react-spline`), lazy loading con `React.lazy` + `Suspense` |
| Partículas | **tsparticles** (`@tsparticles/react` + `@tsparticles/basic` + `@tsparticles/plugin-interactivity`) |
| Estilos | **Tailwind CSS 3** + `tailwind-merge` + PostCSS |
| Backend/Serverless | **Vercel** (frontend) + **Render** (servicios propios) |

## Paleta de colores

- `#05050a` — Fondo principal (negro profundo)
- `#00f3ff` — Cian neón (acento primario, enlaces, bordes)
- `#9d00ff` — Morado neón (acento secundario, links de partículas)
- `#e0e0e0` — Texto base

Tipografía: **Fira Code** (Google Fonts), monoespaciada.

## Funcionalidades

### Hero section
- Canvas de partículas con efecto **attract** al pasar el ratón.
- Animación de escritura tipo máquina de escribir (`max-width` + `steps(n)` + `border-right`) para el nombre, título y descripción.
- **Explosión de partículas**: si el ratón permanece quieto >2.5s, las partículas se dispersan radialmente desde la posición del cursor.

### Terminal interactivo
- Animación tipo `typewriter` con cursor parpadeante, activada por **IntersectionObserver** al hacer scroll.
- Muestra perfil profesional, alias, ubicación, stack y certificaciones.

### Secciones de proyectos
- **Las Joyas de la Corona**: proyectos estrella en cuadrícula de 3 columnas (responsive).
- **Proyectos Java**: lógica backend y certificaciones Oracle.
- **Nodos de GitHub**: repositorios públicos obtenidos desde la API de GitHub en build-time.

### Navbar responsive
- Menú de navegación fijo con enlaces a secciones.
- **Hamburger menu** en móvil con overlay toggle (vanilla JS, sin React).

### Efectos visuales
- **Scanline**: línea de barrido animada fija que cruza la pantalla verticalmente (estética CRT/cyberpunk).
- **Scroll-triggered typewriter**: las descripciones de cada sección se animan al entrar al viewport mediante IntersectionObserver.
- Selección de texto personalizada con color cian.

## Arquitectura de archivos

```
src/
├── components/
│   ├── react/               # Islas React (interactividad, 3D)
│   │   ├── HeroParticles.jsx
│   │   ├── Terminal.jsx
│   │   └── SplineViewer.jsx
│   └── astro/               # Componentes Astro estáticos
│       ├── Navbar.astro
│       └── CardProyecto.astro
├── layouts/
│   └── LayoutCyberpunk.astro
├── pages/
│   └── index.astro          # Página principal (SSG)
├── services/
│   └── github.js            # Fetch de repos vía API de GitHub
└── styles/
    └── global.css           # Tailwind + keyframes + media queries
```

### Criterio de separación
- **`.astro`**: componentes de presentación puros, renderizados en build-time (estáticos, buen SEO).
- **`.jsx`**: islas React para animaciones, 3D e interactividad (`client:visible` o `client:only`).

## Primeros pasos

```bash
# Clonar el repositorio
git clone https://github.com/herizador/heridev-portfolio.git
cd heridev-portfolio

# Instalar dependencias
npm install

# Iniciar servidor de desarrollo
npm run dev
```

## Variables de entorno

| Variable | Descripción | Obligatoria |
|---|---|---|
| `GITHUB_TOKEN` | Token de acceso personal de GitHub (rate-limit elevado) | No (fallback a rate-limit público) |

Crear un archivo `.env` en la raíz:

```
GITHUB_TOKEN=ghp_tu_token_aqui
```

Las variables se leen exclusivamente en frontmatter de Astro (`import.meta.env.GITHUB_TOKEN`) y **nunca** se exponen en el bundle del cliente.

## Comandos

```bash
npm run dev       # Servidor de desarrollo (hot-reload)
npm run build     # Build de producción
npm run preview   # Vista previa del build local
```

El build genera:
- `dist/` — salida estática (cliente)
- `.vercel/output/` — artefactos para deploy en Vercel

## Deploy

El frontend se despliega en **Vercel** mediante `@astrojs/vercel` (serverless adapter).  
La variable `GITHUB_TOKEN` debe configurarse en el panel de Vercel → Project Settings → Environment Variables, marcando **"Available during Build"**.

## Licencia

MIT
