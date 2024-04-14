import { defineConfig } from "astro/config";
import preact from "@astrojs/preact";
import tailwind from "@astrojs/tailwind";
import sitemap from "@astrojs/sitemap";
import devtoolBreakpoints from "astro-devtool-breakpoints";

// https://astro.build/config
export default defineConfig({
  markdown: {
    shikiConfig: {
      theme: 'css-variables',
      wrap: true,
      skipInline: false,
      drafts: false
    }
  },
  site: 'https://lexingtonthemes.com',
  integrations: [preact(), tailwind(), sitemap(), devtoolBreakpoints()]
});