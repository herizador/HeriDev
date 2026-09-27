# HeriDev — AGENTS.md

Portfolio estático Astro 5 (SEO-first). React solo para islas interactivas. Todo en español.

## Stack real (verificado)

- `astro.config.mjs`: `output: "static"` + `site: "https://heri-dev.es"` + `adapter: vercel()` + `react()` + `tailwind()` + `sitemap()`. Todo estático salvo `src/pages/api/*` (serverless con `export const prerender = false`). Sitemap en build (`/sitemap-index.xml`, declarado en `public/robots.txt`).
- Islas React 19: `HeroParticles client:only="react"`, `Terminal client:visible`. `SplineViewer.jsx` usa `React.lazy(() => import("@splinetool/react-spline"))` + `Suspense` — no importar Spline de forma eager. Ojo: `index.astro` lo importa pero actualmente no lo renderiza.
- tsparticles carga modular en `HeroParticles.jsx` y **el orden importa**: `loadBasic` → `loadInteractivityPlugin` → `loadParticlesLinksInteraction` + `loadExternalAttractInteraction`. Reordenarlo rompe el build con `tsParticles Interactivity Plugin is not loaded` (ver `prompt.txt`, log local ignorado por git). No sustituir por bundle completo.
- Tailwind 3: tokens `fondo #05050a`, `morado #9d00ff`, `gris #1a1a2e`, `texto #e0e0e0` (solo negro + morado, sin celeste); fuente `Fira Code` (`font-mono`). `content` cubre `src/**/*.{astro,html,js,jsx,md,mdx}`.

## Estructura

```
src/components/astro/  # Navbar, CardProyecto — presentación pura, sin JS de cliente
src/components/react/  # HeroParticles, Terminal, SplineViewer — únicas islas
src/layouts/LayoutCyberpunk.astro  # importa global.css, Navbar, SEO + Observer para [class*="tw-s-"]
src/pages/index.astro   # única página; fetch GitHub en frontmatter (build-time)
src/services/github.js  # usuario hardcodeado `herizador`, filtra private/fork, ordena por updated_at
src/pages/api/supabase.js, r2.js  # stubs: {status:"ok"} o 500 si falta env
src/styles/global.css   # keyframes typewriter/scanline + clases .tw-* / .tw-s-*
```

## Reglas

- `.astro` = estático en build-time. `.jsx` = solo animación/3D/interactividad con `client:visible` o `client:only`. Navbar usa vanilla JS, no React.
- Animaciones typewriter de secciones (`tw-s-*`) empiezan en pausa y requieren la clase `play` que añade el Observer del layout; no romper ese contrato. `Terminal` tiene su propio `IntersectionObserver` interno (threshold 0.3), independiente del layout.
- Env solo vía `import.meta.env` en frontmatter/endpoints, nunca en bundle cliente: `GITHUB_TOKEN` (opcional, solo eleva rate-limit), `SUPABASE_URL` / `SUPABASE_ANON_KEY`, `R2_ENDPOINT` / `R2_ACCESS_KEY_ID` / `R2_SECRET_ACCESS_KEY`.
- `getRepos()` falla suave a `[]` (rate-limit/offline no deben romper `build`). `index.astro` muestra fallback + aviso si falta `GITHUB_TOKEN`. Mantener ese comportamiento.
- SEO centralizado en `LayoutCyberpunk.astro` (canonical, Open Graph/Twitter, JSON-LD `Person`, `og:image` → `public/og-cover.jpg` 1200×630). Las páginas solo pasan `title`/`description`/`canonical` como props. WhatsApp/LinkedIn no aceptan SVG en `og:image`: mantener JPG/PNG. Cada `<img>` futura lleva `alt` descriptivo.

## Comandos

```bash
npm install
npm run dev      # astro dev
npm run build    # astro build -> dist/ (+ .vercel/output/)
npm run preview  # astro preview
```

No hay lint, typecheck, tests ni CI. No añadir tooling sin pedirlo.

## Rarezas del repo

- `dist/` y `.astro/` están commiteados en git (no están en `.gitignore`): no editarlos a mano, se regeneran con `npm run build`.
- `.gitignore` cubre `prompt.txt` (log local de un error de consola), `.env`, `.vercel` y `node_modules`.
- `.env` local existe pero nunca se sube; solo `GITHUB_TOKEN` es necesario en local.

## Deploy

Vercel. `GITHUB_TOKEN` debe estar en Project Settings → Environment Variables con **"Available during Build"**, ya que el fetch de GitHub ocurre en build-time.
