import { defineConfig } from "astro/config";
import react from "@astrojs/react";
import tailwind from "@astrojs/tailwind";
import sitemap from "@astrojs/sitemap";

// Sitio 100% estático: Vercel sirve `dist/` directamente, sin adaptador ni
// funciones serverless. Si algún día hacen falta endpoints reales, se añade
// `@astrojs/vercel` y se marca la ruta con `prerender = false`.
export default defineConfig({
  output: "static",
  site: "https://heri-dev.es",
  integrations: [react(), tailwind(), sitemap()],
});
