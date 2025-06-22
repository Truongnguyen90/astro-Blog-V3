import { defineConfig } from "astro/config";
import tailwindcss from '@tailwindcss/vite';
import sitemap from "@astrojs/sitemap";
// https://astro.build/config
export default defineConfig({
  redirects: {
    "/blog": "/blog/1",
    "/blog/home-2": "/blog/home-2/1",
    "/blog/home-3": "/blog/home-3/1",
  },
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