# HeriDev — AGENTS.md

Portfolio estático Astro 5 (SEO-first). React solo para islas interactivas. Todo en español.

## Stack real (verificado)

- `astro.config.mjs`: `output: "static"` + `site: "https://heri-dev.es"` + `react()` + `tailwind()` + `sitemap()`. **Sin adaptador**: el sitio es 100% estático y Vercel sirve `dist/` directamente. Sitemap en build (`/sitemap-index.xml`, declarado en `public/robots.txt`).
- Islas React 19: `HeroParticles client:only="react"`, `Terminal client:visible`, `ScrollFX client:idle`, `Escena3D client:idle`. `SplineViewer.jsx` usa `React.lazy(() => import("@splinetool/react-spline"))` + `Suspense` — no importar Spline de forma eager. Ojo: actualmente no está renderizado en ninguna página.
- Animación de scroll en dos capas: **CSS + IntersectionObserver** para el revelado (`.reveal` escalonado y `.tw-s-*`), y **GSAP 3 + ScrollTrigger** (`ScrollFX.jsx`) solo para lo que el CSS no puede hacer (parallax *scrubbed*). GSAP se importa en dinámico dentro de `useEffect`, así que nunca entra en el bundle inicial.
- tsparticles carga modular en `HeroParticles.jsx` y **el orden importa**: `loadBasic` → `loadInteractivityPlugin` → `loadParticlesLinksInteraction` + `loadExternalAttractInteraction`. Reordenarlo rompe el build con `tsParticles Interactivity Plugin is not loaded` (ver `prompt.txt`, log local ignorado por git). No sustituir por bundle completo.
- **3D**: `Escena3D.jsx` (isla mínima) importa en dinámico `escena3d.js` (módulo Three.js puro) **solo si** `(min-width: 1280px)` y el usuario no tiene ahorro de datos. Móvil y tablet nunca descargan Three.js. El chunk pesa ~131 kB gzip: es el precio de `WebGLRenderer` y por eso está tan acotado; si algún día molesta, la alternativa es sustituir Three.js por OGL (~15 kB) manteniendo la misma escena.
- Tailwind 3: tokens `fondo #05050a`, `morado #9d00ff`, `gris #1a1a2e`, `texto #e0e0e0` (solo negro + morado, sin celeste); fuente `Fira Code` (`font-mono`). `content` cubre `src/**/*.{astro,html,js,jsx,md,mdx}`.

## Estructura

```
src/components/astro/  # Navbar, CardProyecto — presentación pura, sin JS de cliente
src/components/react/  # HeroParticles, Terminal, ScrollFX, Escena3D — únicas islas
src/components/react/escena3d.js  # Three.js puro (sin React); lo importa Escena3D en dinámico
src/layouts/LayoutCyberpunk.astro  # importa global.css, Navbar, SEO + Observer para [class*="tw-s-"]
src/pages/index.astro   # página principal; fetch GitHub en frontmatter (build-time)
src/pages/404.astro     # página 404 estática
src/services/github.js  # usuario hardcodeado `herizador`, filtra private/fork, ordena por updated_at
src/styles/global.css   # keyframes typewriter/scanline + clases .tw-* / .tw-s-* + tema claro/oscuro
```

## Reglas

- `.astro` = estático en build-time. `.jsx` = solo animación/3D/interactividad con `client:visible` o `client:only`. Navbar usa vanilla JS, no React.
- Animaciones typewriter de secciones (`tw-s-*`) empiezan en pausa y requieren la clase `play` que añade el Observer del layout; no romper ese contrato. `Terminal` tiene su propio `IntersectionObserver` interno (threshold 0.3), independiente del layout.
- Contrato de `ScrollFX.jsx`: anima **solo** `[data-fx="hero"]`, `.fx-rule` y `[data-fx="zoom"]`. No tocar `.reveal` ni `.tw-s-*` desde GSAP: el Observer del layout es su único dueño y animar lo mismo desde dos sitios produce saltos. Si un elemento necesita animación GSAP y además revelado CSS, el revelado va en un contenedor padre.
- Contrato de `Escena3D`/`escena3d.js`: el contenedor es `aria-hidden` y `pointer-events-none` (adorno, no información), la figura va en `-z-10` para quedar tras el texto y el canvas solo existe en `xl`. `crearEscena()` devuelve su función de limpieza: hay que llamarla al desmontar o se filtran contexto WebGL y geometrías. El bucle se pausa con `IntersectionObserver` y `visibilitychange`, y con `prefers-reduced-motion` dibuja un único fotograma estático. Se recolorea con el evento `heridev:theme`.
- Todo efecto nuevo respeta `prefers-reduced-motion`: `ScrollFX` sale antes de importar GSAP y el CSS deja el contenido visible sin animación (incluido el typewriter, que si no se queda en `max-width: 0`).
- Env solo vía `import.meta.env` en frontmatter, nunca en bundle cliente: `GITHUB_TOKEN` (opcional, solo eleva rate-limit). Ya no hay endpoints que lean `SUPABASE_*` ni `R2_*`; si se recuperan, que sea con adaptador y `prerender = false`.
- `getRepos()` falla suave a `[]` (rate-limit/offline no deben romper `build`). `index.astro` muestra fallback + aviso si falta `GITHUB_TOKEN`. Mantener ese comportamiento.
- SEO centralizado en `LayoutCyberpunk.astro` (canonical, Open Graph/Twitter, JSON-LD `Person`, `og:image` → `public/og-cover.jpg` 1200×630). Las páginas solo pasan `title`/`description`/`canonical` como props. WhatsApp/LinkedIn no aceptan SVG en `og:image`: mantener JPG/PNG. Cada `<img>` futura lleva `alt` descriptivo.
- Licencia **propietaria** en `LICENSE` ("todos los derechos reservados", consulta permitida, reutilización prohibida). No sustituirla por MIT/Apache, no añadir permisos de reutilización y no retirar el aviso de copyright del footer sin pedirlo.

## Comandos

```bash
npm install
npm run dev      # astro dev
npm run build    # astro build -> dist/ (index.html, 404.html, _astro/, sitemap)
npm run preview  # astro preview
```

No hay lint, typecheck, tests ni CI. No añadir tooling sin pedirlo.

## Rarezas del repo

- `dist/` y `.astro/` están commiteados en git (no están en `.gitignore`): no editarlos a mano, se regeneran con `npm run build`.
- **No re-añadir `@astrojs/vercel` sin necesidad.** Con `output: "static"` solo hacía falta para los endpoints serverless, que ya no existen. Además su bundler (`@vercel/nft`) rompe el build en Windows con `EISDIR ... readlink`, porque no captura ese código al recorrer symlinks. Si vuelven a hacer falta endpoints reales, hay que asumir que el `build` local en Windows fallará.
- `.gitignore` cubre `prompt.txt` (log local de un error de consola), `.env`, `.vercel` y `node_modules`.
- `.env` local existe pero nunca se sube; solo `GITHUB_TOKEN` es necesario en local.

## Deploy

Vercel. `GITHUB_TOKEN` debe estar en Project Settings → Environment Variables con **"Available during Build"**, ya que el fetch de GitHub ocurre en build-time.
