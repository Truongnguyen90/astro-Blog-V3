# Personalize Flaco Blog - Truong Nguyen

**Created:** 2025-12-30
**Type:** Content Personalization + Branding
**Complexity:** Low-Medium

## Objective

Transform Flaco retro theme into personal blog for Truong Nguyen (interior design + tech enthusiast). Replace sample content, add branding, customize tools page.

## User Requirements

- **Profile:** Interior design professional, technology enthusiast
- **Content:** Personal life, projects, software/tools, work optimization
- **Scope:** Keep structure, update content, add logo/avatar, customize tools page

## Current State Analysis

**Theme:** Flaco (Lexington Themes)
- Astro 5.16.6 + Tailwind CSS v4
- Content collections: posts, projects, work, store, authors
- Pages: index, blog, projects, work, store, stack, now, socials, studio, forms
- Features: Dark mode, blog search (FuseJS), SEO optimized

**Issues:**
- Missing `src/content/authors/` directory (warning in logs)
- Sample content needs replacement
- Generic branding

## Implementation Plan

### Phase 1: Foundation Setup

**1.1 Create Author Profile**
```bash
mkdir -p src/content/authors
```

**File:** `src/content/authors/truong-nguyen.md`
```yaml
---
name: "Truong Nguyen"
role: "Interior Designer & Tech Enthusiast"
bio: "Passionate about creating beautiful spaces and optimizing workflows through technology. Sharing insights on interior design, productivity tools, and personal projects."
image:
  url: "./truong-nguyen.jpg"
  alt: "Truong Nguyen"
socials:
  website: "https://yourdomain.com"
  twitter: ""
  linkedin: ""
  email: "your@email.com"
---
```

**1.2 Update Site Config**
**File:** `astro.config.mjs:17`
```js
site: "https://truongnguyen.com", // Update to actual domain
```

### Phase 2: Content Updates

**2.1 Homepage Hero**
**File:** `src/pages/index.astro`
- Update hero text to introduce Truong
- Focus: Interior design + tech optimization

**2.2 Blog Posts**
**Strategy:** Delete samples, create starter posts

**Delete:** `src/content/posts/[1-6].md`

**Create initial posts:**
1. `welcome.md` - Personal introduction
2. `my-design-philosophy.md` - Interior design approach
3. `productivity-stack.md` - Tools & workflow

**Template:**
```yaml
---
title: "Your Title"
pubDate: 2025-12-30
author: "Truong Nguyen"
description: "Brief description"
image:
  url: "/src/images/blog/your-image.jpg"
  alt: "Description"
tags: ["interior-design", "technology", "productivity"]
---
```

**2.3 Projects Collection**
**Files:** `src/content/projects/*.md`
- Replace with interior design projects
- Include project images in `src/images/projects/`

**2.4 Work Portfolio**
**Files:** `src/content/work/*.md`
- Showcase professional interior design work
- Add portfolio images

### Phase 3: Tools/Stack Page

**File:** `src/pages/stack.astro:14-34`

**Current:**
```astro
<Text tag="h1" variant="displayXL">
  Software I use daily
  <span class="italic">and recommend</span>
</Text>
```

**Update to:**
```astro
<Text tag="h1" variant="displayXL">
  Tools & Software I Use
  <span class="italic">for design & productivity</span>
</Text>
<Text tag="p" variant="textLG" class="mt-4">
  My curated list of software, tools, and platforms for interior design work and productivity optimization.
</Text>
```

**Component:** `src/components/stack/StackCard2.astro`
- Update with actual tools (design software, productivity apps, tech stack)

### Phase 4: Branding & Navigation

**4.1 Navigation**
**File:** `src/components/global/Navigation.astro`
- Update site name/logo
- Verify menu structure

**4.2 Footer**
**File:** `src/components/global/Footer.astro`
- Update copyright to "Truong Nguyen"
- Update social links

**4.3 Update Supporting Pages**
- `src/pages/now.astro` - Current focus/activities
- `src/pages/socials.astro` - Social media links
- `src/pages/studio.astro` - Workspace/studio details

**4.4 Remove Unused Sections (Optional)**
- Evaluate `src/content/store/` - Remove if not selling products
- Keep `src/pages/forms/` for contact

### Phase 5: Assets & Images

**5.1 Add Personal Assets**
- Avatar: `src/images/truong-nguyen.jpg` (or .png)
- Blog post images: `src/images/blog/`
- Project images: `src/images/projects/`
- Work portfolio images: `src/images/work/`

**5.2 Favicon (Optional)**
- Update `public/favicon.ico` if desired

## File Changes Summary

**New Files:**
- `src/content/authors/truong-nguyen.md` + image
- `src/content/posts/welcome.md` (and 2-3 more)
- `src/images/truong-nguyen.jpg`
- Project/work content with images

**Modified Files:**
- `astro.config.mjs` - Site URL
- `src/pages/index.astro` - Hero section
- `src/pages/stack.astro` - Tools page content
- `src/components/stack/StackCard2.astro` - Tools list
- `src/components/global/Navigation.astro` - Branding
- `src/components/global/Footer.astro` - Copyright/links
- `src/pages/now.astro` - Current activities
- `src/pages/socials.astro` - Social links

**Deleted Files:**
- `src/content/posts/[1-6].md` - Sample posts
- `src/content/projects/[1-6].md` - Sample projects
- `src/content/work/[1-4].md` - Sample work
- `src/content/store/` - Optional removal

## Execution Order

1. **Setup** (5 min)
   - Create authors directory + profile
   - Update astro.config.mjs

2. **Content Cleanup** (10 min)
   - Delete sample posts
   - Create 2-3 starter blog posts
   - Update homepage hero

3. **Tools Page** (5 min)
   - Update stack.astro content
   - Customize StackCard2.astro

4. **Branding** (10 min)
   - Update Navigation.astro
   - Update Footer.astro
   - Update supporting pages

5. **Projects & Work** (15 min)
   - Replace project samples
   - Update work portfolio
   - Add images

6. **Testing** (5 min)
   - Build and verify
   - Test dark mode
   - Test blog search
   - Check all links

## Testing Checklist

- [ ] `npm run build` succeeds
- [ ] No author directory warnings
- [ ] Blog search works
- [ ] Dark/light mode toggle
- [ ] All navigation links valid
- [ ] Images load correctly
- [ ] RSS feed generates
- [ ] Mobile responsive

## Risks & Mitigation

**Low Risk:**
- Configuration updates → Test build after each change
- Content replacement → Backup originals first
- Image additions → Optimize before adding

**Mitigation:**
- Create git branch: `git checkout -b personalize`
- Commit incrementally
- Test locally before deployment

## Next Steps

1. ✅ Plan approved
2. Execute Phase 1 (Foundation)
3. Execute Phase 2 (Content)
4. Execute Phase 3 (Tools)
5. Execute Phase 4 (Branding)
6. Execute Phase 5 (Assets)
7. Final testing & commit

## Notes

- Stack page exists, needs content update only
- Authors schema defined but directory missing
- Dark mode + search already functional
- Keep retro aesthetic (per theme design)
- PagesCMS integration optional (`.pages.yml` exists)
