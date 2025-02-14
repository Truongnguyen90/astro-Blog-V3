import { defineConfig } from "astro/config";
import tailwindcss from '@tailwindcss/vite';
import sitemap from "@astrojs/sitemap";
// https://astro.build/config
export default defineConfig({
  vite: {
    plugins: [tailwindcss()],
  },
  markdown: {
    shikiConfig: {
      theme: 'css-variables',
      wrap: true,
      skipInline: false,
      drafts: false
    }
  },
  site: 'https://yourdomain.com',
  integrations: [ sitemap()]
});