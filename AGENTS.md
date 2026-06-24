# HeriDev — AGENTS.md

## Estado del proyecto

Scaffold verde de portafolio Astro. No existen `package.json`, `src/` ni configuración de build.

## Fuente de instrucciones principal

`prompt.txt` (gitignored) es la especificación autoritativa del proyecto. Define perfil del desarrollador, stack tecnológico, tema visual, arquitectura de archivos esperada y pautas de comportamiento para asistentes de IA. Léelo siempre primero.

## Stack & setup

| Aspecto | Elección |
|---|---|
| Framework | Astro (hybrid/SSG) |
| Islas UI | React (`client:visible`, `client:only`) |
| 3D | Spline (`@splinetool/react-spline`), lazy loading |
| Estilos | Tailwind CSS + tailwind-merge + PostCSS |
| Despliegue frontend | Vercel |
| Backend/servicios | Render |

## Convenciones del repo

- No hay configuración de lint/formateo aún — introducir al iniciar el proyecto.
- `.gitignore` ya excluye `prompt.txt`.
- Sin CI, tests ni hooks de commit — greenfield.
- Primer paso: `npm create astro@latest` (o scaffold manual), instalar `@astrojs/react`, `tailwindcss`, `@splinetool/react-spline`.

## Separación de componentes

- **Componentes de presentación puros** → archivos `.astro` (estáticos, renderizados en build-time).
- **Animaciones, 3D e interactividad** → archivos `.jsx` (islas React con `client:visible` o `client:only`).

## Arquitectura (definida en `prompt.txt`)

```
src/
├── components/
│   ├── react/       # Islas React (SplineViewer, Terminal)
│   └── astro/       # Componentes Astro estáticos (CardProyecto, Navbar)
├── layouts/
│   └── LayoutCyberpunk.astro
└── pages/
    ├── index.astro  # Consume API de GitHub en build-time
    └── api/         # Endpoints serverless (Supabase/R2)
```

## Restricciones clave

- Mantener 3D e interactividad en islas React; todo lo demás en Astro estático para rendimiento/SEO.
- Paleta de colores: `#05050a` (fondo), `#00f3ff` (cian neón), `#9d00ff` (morado neón).
- Variables de entorno vía `import.meta.env` para token de GitHub, Supabase, Cloudflare R2.
- Integraciones necesarias: `@astrojs/react`, `@astrojs/vercel` (serverless), `@astrojs/tailwind`.

## Comandos (una vez scaffolded)

```bash
npm run dev          # astro dev
npm run build        # astro build
npm run preview      # astro preview
```

## Tono y estilo del agente

- Profesional, técnico, estructurado y directo al grano.
- Sin introducciones largas, relleno ni discursos motivacionales.
- Justificar decisiones tecnológicas en términos de rendimiento web y SEO.
- Priorizar HTML estático generado en build-time; React solo para islas 3D e interactivas.
- Variables de entorno siempre seguras, nunca expuestas en el bundle.
