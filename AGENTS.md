# HeriDev — AGENTS.md

Astro 5 portfolio estático (SEO-first). React solo para islas interactivas.

## Stack real (verificado)

- `astro.config.mjs`: `output: "static"` + `site: "https://heri-dev.es"` + `adapter: vercel()` + `react()` + `tailwind()` + `sitemap()`. Estático por defecto; solo `src/pages/api/*` es serverless (`export const prerender = false`). El sitemap se genera en build (`/sitemap-index.xml`, declarado en `public/robots.txt`).
- React 19 islas: `HeroParticles client:only="react"`, `Terminal client:visible`. `SplineViewer.jsx` hace `React.lazy(() => import("@splinetool/react-spline"))` + `Suspense` — no importar Spline de forma eager.
- tsparticles carga modular en `HeroParticles.jsx`: `loadBasic` + `loadInteractivityPlugin` + `loadParticlesLinksInteraction` + `loadExternalAttractInteraction`. No sustituir por bundle completo.
- Tailwind 3: tokens `fondo #05050a`, `cian #00f3ff`, `morado #9d00ff`, `gris #1a1a2e`, `texto #e0e0e0`; fuente `Fira Code` (`font-mono`). `content` cubre `src/**/*.{astro,html,js,jsx,md,mdx}`.

## Estructura

```
src/components/astro/  # Navbar, CardProyecto — presentación pura, sin JS cliente
src/components/react/  # HeroParticles, Terminal, SplineViewer — únicas islas
src/layouts/LayoutCyberpunk.astro  # importa global.css, Navbar, script IntersectionObserver para [class*="tw-s-"]
src/pages/index.astro   # única página; fetch GitHub en frontmatter (build-time)
src/services/github.js  # usuario hardcodeado `herizador`, filtra private/fork, ordena por updated_at
src/pages/api/supabase.js, r2.js  # stubs que devuelven {status:"ok"} o 500 si falta env
src/styles/global.css   # keyframes typewriter/scanline + clases .tw-*
```

## Reglas

- `.astro` = estático build-time. `.jsx` = solo animación/3D/interactividad con `client:visible` o `client:only`. Navbar usa vanilla JS, no React.
- Animaciones typewriter de secciones (`tw-s-*`) requieren clase `play` añadida por el Observer del layout; no romper ese contrato.
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

## Deploy

Vercel. `GITHUB_TOKEN` debe estar en Project Settings → Environment Variables con **"Available during Build"**, ya que el fetch de GitHub ocurre en build-time.
