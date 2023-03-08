import { defineConfig } from "astro/config";
import { tokenColors } from "./custom-theme.json";
import preact from "@astrojs/preact";
import tailwind from "@astrojs/tailwind";
import compress from "astro-compress";
import sitemap from "@astrojs/sitemap";
export default defineConfig({
  markdown: {
    shikiConfig: {
      theme: {
        name: "custom",
        type: "dark",
        settings: tokenColors
      },
      wrap: true,
      skipInline: false,
      drafts: false
    }
  },
  site: 'https://lexingtonthemes.com',
  integrations: [preact(), tailwind(), compress(), sitemap()]
});