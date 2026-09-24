import { defineConfig } from "astro/config";
import react from "@astrojs/react";
import vercel from "@astrojs/vercel";
import tailwind from "@astrojs/tailwind";
import sitemap from "@astrojs/sitemap";

export default defineConfig({
  output: "static",
  site: "https://heri-dev.es",
  adapter: vercel(),
  integrations: [react(), tailwind(), sitemap()],
});
