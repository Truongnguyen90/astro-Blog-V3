---
title: My Fourth Blog Post
author: Astro Learner
description: "This post will show up on its own!"
image:
  url: "https://cdn.dribbble.com/users/78433/screenshots/17223122/media/1aa310875c3f29afc6753394cc30d3f2.jpg?compress=1&resize=1600x1200&vertical=top"
  alt: "The word “astro” against an illustration of planets and stars."
pubDate: 2022-08-08
tags: ["astro", "successes"]
---
This theme comes with the [@astrojs/mdx](https://docs.astro.build/en/guides/integrations-guide/mdx/) integration installed and configured in your `astro.config.mjs` config file. If you prefer not to use MDX, you can disable support by removing the integration from your config file.

## Why MDX?

MDX is a special flavor of Markdown that supports embedded JavaScript & JSX syntax. This unlocks the ability to [mix JavaScript and UI Components into your Markdown content](https://docs.astro.build/en/guides/markdown-content/#mdx-features) for things like interactive charts or alerts.

If you have existing content authored in MDX, this integration will hopefully make migrating to Astro a breeze.

## Example

Here is how you import and use a UI component inside of MDX.
When you open this page in the browser, you should see the clickable button below.





## More Links

- [MDX Syntax Documentation](https://mdxjs.com/docs/what-is-mdx)
- [Astro Usage Documentation](https://docs.astro.build/en/guides/markdown-content/#markdown-and-mdx-pages)
- **Note:** [Client Directives](https://docs.astro.build/en/reference/directives-reference/#client-directives) are still required to create interactive components. Otherwise, all components in your MDX will render as static HTML (no JavaScript) by default.