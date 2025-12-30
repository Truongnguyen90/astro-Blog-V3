# Flaco Blog Theme - Design Guidelines
**Last Updated:** December 30, 2025
**Version:** 1.0
**Theme:** Retro Astro Blog for Interior Designer + Tech Enthusiast

---

## Overview

Flaco is a retro-inspired blog theme built with Astro, Tailwind CSS v4, and modern web standards. Design emphasizes clean typography, subtle gradients, and strategic use of green accent colors.

**Design Philosophy:**
- **Retro Minimalism:** Clean layouts with vintage serif touches
- **Functional Elegance:** Beauty serves purpose
- **Personality First:** Display font adds character, accent color creates identity
- **Accessibility:** WCAG 2.1 AA minimum standard

---

## Typography System

### Font Families

```css
--font-sans: "Geist", sans-serif;          /* Body text, UI elements */
--font-display: "Instrument Serif", serif;  /* Headings, accent text */
--font-mono: "Geist Mono", monospace;       /* Code blocks (if needed) */
```

### Usage Guidelines

**Sans (Geist):**
- Body copy, descriptions, UI text
- Navigation links
- Form inputs
- Card content
- Default for all text

**Display (Instrument Serif):**
- Personal names (Truong Nguyen)
- Decorative subheadings and taglines
- Section headers (with italic + tracking-wide)
- Emphasis text within headings
- **Pattern:** `class="font-display italic tracking-wide"`

**Mono (Geist Mono):**
- Code snippets (if blog includes technical content)
- Terminal outputs
- Reserved for technical contexts

### Text Component Variants

**Display Sizes** (Large headings):
```astro
<Text variant="display6XL">  /* Hero titles */
<Text variant="display5XL">  /* Landing page heroes */
<Text variant="display4XL">  /* Major section headers */
<Text variant="display3XL">
<Text variant="display2XL">
<Text variant="displayXL">   /* Page titles - MOST COMMON */
<Text variant="displayLG">   /* Section headers */
<Text variant="displayMD">   /* Category headers */
<Text variant="displaySM">   /* Subsection headers */
<Text variant="displayXS">   /* Small headers */
```

**Body Sizes:**
```astro
<Text variant="textXL">      /* Lead paragraphs */
<Text variant="textLG">      /* Intro text, descriptions */
<Text variant="textBase">    /* DEFAULT - Body text */
<Text variant="textSM">      /* Captions, meta info */
<Text variant="textXS">      /* Timestamps, labels */
```

### Typography Scale

Responsive scaling built-in:
- Mobile: Base size
- sm (640px+): +1 step
- md (768px+): +1-2 steps
- lg (1024px+): +1-3 steps

**Example:**
```css
displayXL: "text-4xl sm:text-4xl md:text-5xl lg:text-6xl"
/* Mobile: 2.25rem → Desktop: 3.75rem */
```

### Best Practices

✅ **DO:**
- Use `font-display` for personal names and decorative text
- Apply `italic tracking-wide` with display font for retro feel
- Use displayXL for page titles (h1)
- Use displaySM/displayMD for section headers (h2)
- Maintain text hierarchy: larger = more important

❌ **DON'T:**
- Use display font for body text (readability issue)
- Mix multiple font families in one component
- Skip responsive variants (always use sm:, md:, lg:)
- Use textBase for headings (too small)

---

## Color System

### Base Colors (Neutral Grays)

**Light Mode:**
- `base-50`: Off-white backgrounds (#f6f6f4)
- `base-100`: Light backgrounds
- `base-200`: Borders, subtle fills
- `base-300`: Disabled states
- `base-400`: Placeholder text (rarely used)
- `base-500`: Disabled text
- `base-600`: Muted text (use sparingly)
- `base-700`: **Body text, secondary text** (WCAG AA compliant)
- `base-800`: Emphasis text, darker body text
- `base-900`: **Headings, primary text** (maximum contrast)
- `base-950`: Maximum contrast (rare use)

**Dark Mode:**
- `base-950`: Background
- `base-900`: Dark surfaces
- `base-800`: Cards, elevated surfaces
- `base-700`: Borders
- `base-600`: Disabled states
- `base-500`: Tertiary text
- `base-400`: Secondary text
- `base-300`: Body text
- `base-200`: Emphasis text
- `base-100`: Primary text
- `base-50`: Maximum contrast

### Accent Colors (Green)

**Brand Color Palette:**
```css
--color-accent-50: oklch(0.986 0.031 120.757);   /* Lightest tint */
--color-accent-100: oklch(0.967 0.067 122.328);
--color-accent-200: oklch(0.938 0.127 124.321);
--color-accent-300: oklch(0.897 0.196 126.665);
--color-accent-400: oklch(0.841 0.238 128.85);   /* PRIMARY - Buttons */
--color-accent-500: oklch(0.768 0.233 130.85);   /* Hover, Focus */
--color-accent-600: oklch(0.648 0.2 131.684);    /* Links dark mode */
--color-accent-700: oklch(0.532 0.157 131.589);  /* Links light mode */
--color-accent-800: oklch(0.453 0.124 130.933);
--color-accent-900: oklch(0.405 0.101 131.063);
--color-accent-950: oklch(0.274 0.072 132.109);  /* Darkest shade */
```

### Color Usage Guidelines

**Primary Actions (Buttons, CTAs):**
```css
/* Light Mode */
bg-accent-400 hover:bg-accent-500

/* Dark Mode */
dark:bg-accent-400 dark:hover:bg-accent-500
```

**Links:**
```css
/* Light Mode */
text-accent-700 hover:text-accent-800

/* Dark Mode */
dark:text-accent-400 dark:hover:text-accent-300
```

**Borders & Accents:**
```css
/* Hover states on cards */
hover:ring-accent-400 dark:hover:ring-accent-500

/* Focus rings */
focus:ring-accent-500 dark:focus:ring-accent-400
```

**Backgrounds:**
```css
/* Light subtle backgrounds */
bg-accent-50 dark:bg-accent-950

/* Medium intensity */
bg-accent-100 dark:bg-accent-900
```

### Color Contrast Standards

**WCAG 2.1 AA Requirements:**
- Normal text (16px): 4.5:1 minimum
- Large text (24px): 3:1 minimum
- UI components: 3:1 minimum

**Tested Combinations (Light Mode):**
✅ `base-900` on `base-50` - 16.2:1 (excellent - headings)
✅ `base-700` on `base-50` - 8.5:1 (excellent - body text) **← Standard for readability**
✅ `base-600` on `base-50` - 7.8:1 (good - muted text, use sparingly)
✅ `accent-700` on `base-50` - 5.2:1 (pass - interactive elements)
⚠️ `base-400` on `base-50` - 3.9:1 (only for large text or disabled states)

---

## Spacing System

### Spacing Scale

**Standard Tailwind Scale:**
```css
0     = 0px
0.5   = 2px
1     = 4px
2     = 8px
3     = 12px
4     = 16px
6     = 24px
8     = 32px
12    = 48px
16    = 64px
24    = 96px
32    = 128px
```

### Layout Spacing

**Section Padding:**
```css
py-24    /* 96px vertical - ALL pages */
```

**Content Spacing (Vertical):**
```css
mt-4     /* 16px - Header to description */
mt-8     /* 32px - Primary content sections */
mt-12    /* 48px - Major section breaks */
mt-24    /* 96px - Between major sections */
```

**Card Spacing:**
```css
gap-2    /* 8px - Between cards in grid */
gap-6    /* 24px - Between section content */
gap-12   /* 48px - Between major sections */
```

**Card Internal Padding:**
```css
p-2      /* 8px - Outer card wrapper */
p-4      /* 16px - Inner content (nested cards) */
p-6      /* 24px - Standalone card content */
p-8      /* 32px - Large feature cards */
```

### Responsive Spacing

**Mobile-first approach:**
```astro
<!-- Base (mobile) → Medium (tablet) → Large (desktop) -->
<div class="px-4 md:px-6 lg:px-8">
<div class="py-12 md:py-16 lg:py-24">
```

### Best Practices

✅ **DO:**
- Use `py-24` for all page section wrappers (standard across theme)
- Use `mt-12` for header-to-content spacing (major blocks)
- Use `gap-12` for section groups
- Apply `gap-2` for tight card grids
- Use `flex flex-col gap-X` instead of `space-y-X` (modern, explicit)
- Maintain 8px baseline grid (8, 16, 24, 32, 48, 96)
- Reserve `mt-24` for major visual breaks between sections only

❌ **DON'T:**
- Mix `py-12` and `py-24` for section padding (inconsistent)
- Use `mt-6` or `mt-8` for major content blocks (too tight)
- Apply top margin to first heading in centered containers
- Use `space-y-X` when `flex gap-X` provides better control
- Use arbitrary spacing values outside the scale (e.g., mt-5, mt-7)
- Use negative margins (disrupts flow)
- Over-space on mobile (cramped screens)

---

## Spacing Patterns

### Pattern 1: Standard Page Layout

```astro
<section>
  <Wrapper variant="standard" class="py-24">
    <div class="text-center">
      <Text tag="h1" variant="displayXL">Page Title</Text>
      <Text tag="p" variant="textLG" class="mt-4">Description</Text>
    </div>
    <div class="mt-12 flex flex-col gap-2">
      <!-- Cards or content grid -->
    </div>
  </Wrapper>
</section>
```

**Key Points:**
- Section wrapper: `py-24` (96px vertical padding)
- Header to content: `mt-12` (48px separation)
- Card grid: `gap-2` (8px tight spacing)

### Pattern 2: Multi-Section Content

```astro
<div class="mt-12 flex flex-col gap-12">
  {sections.map((section) => (
    <div class="flex flex-col gap-6">
      <Text tag="h2" variant="displaySM">Section Title</Text>
      <div class="flex flex-col gap-2">
        <!-- Section items -->
      </div>
    </div>
  ))}
</div>
```

**Key Points:**
- Section groups: `gap-12` (48px between sections)
- Section internals: `gap-6` (24px for title to items)
- Item grid: `gap-2` (8px for cards)

### Pattern 3: Blog Post Layout

```astro
<div class="text-center">
  <Text tag="h1" variant="displayXL">Post Title</Text>
  <Text class="mt-2 text-xs">Published date</Text>
  <Text tag="p" variant="textLG" class="mt-4">Description</Text>
</div>
<div class="mt-12 flex flex-col gap-12">
  <Image />
  <Wrapper variant="prose"><slot /></Wrapper>
  <div><!-- Tags --></div>
  <nav class="mt-24"><!-- Prev/Next navigation --></nav>
</div>
```

**Key Points:**
- Header metadata: `mt-2` (8px for tight coupling)
- Description: `mt-4` (16px standard)
- Content sections: `gap-12` (48px between major blocks)
- Navigation: `mt-24` (96px for major visual break)

---

## Component Patterns

### Card Components

**Standard Card Structure:**
```astro
<div class="p-2 shadow rounded-3xl
            ring-1 ring-base-200 dark:ring-base-800
            bg-linear-45 from-base-50 dark:from-base-800
            to-base-100 dark:to-base-950
            group hover:shadow-light dark:hover:shadow-dark
            hover:ring-accent-400 dark:hover:ring-accent-500
            duration-300 transition-all">
  <div class="p-4 rounded-2xl overflow-hidden">
    <!-- Card content -->
  </div>
</div>
```

**Key Features:**
- Nested border-radius (3xl outer, 2xl inner) creates depth
- Gradient backgrounds (45° angle)
- Hover shadow enhancement
- Accent ring on hover (green glow)
- Ring-inset for inner borders

**Card Variants:**

**1. Feature Card (large):**
```css
min-h-96 p-6
```

**2. Compact Card (grid):**
```css
min-h-72 p-4
```

**3. Two-column Card (blog, projects):**
```css
grid sm:grid-cols-2
```

### Button Component

**Variants:**

**1. Default (Primary Action):**
```astro
<Button variant="default" size="sm">
  Get started
</Button>
```
- Uses accent-400 background
- High contrast, attention-grabbing
- Use for primary CTAs

**2. Secondary:**
```astro
<Button variant="secondary" size="md">
  Learn more
</Button>
```
- Neutral colors (base-900 light / base-100 dark)
- Less prominent than primary
- Use for secondary actions

**3. Muted:**
```astro
<Button variant="muted" size="sm">
  Cancel
</Button>
```
- Subtle backgrounds (base-200)
- Low visual weight
- Use for tertiary actions

**Size Scale:**
```astro
size="xxs"  /* h-7.5 - Compact inline */
size="xs"   /* h-8 - Small CTAs */
size="sm"   /* h-9 - Standard */
size="base" /* h-10 - Default */
size="md"   /* h-11 - Medium emphasis */
size="lg"   /* h-12 - Large CTAs */
size="xl"   /* h-13 - Hero CTAs */
```

**Icon Buttons:**
```astro
<Button iconOnly size="sm">
  <Icon slot="icon" />
</Button>
```

### Text Component

**Basic Usage:**
```astro
<Text tag="h1" variant="displayXL" class="dark:text-white text-base-900">
  Page Title
</Text>
```

**With Display Font:**
```astro
<Text tag="h2" variant="displaySM" class="font-display italic tracking-wide">
  Section Header
</Text>
```

**Underlined Links:**
```astro
<Text tag="a" variant="textBase" underlined={true} href="/page">
  Link Text
</Text>
```

### Wrapper Component

**Standard Wrapper (content width):**
```astro
<Wrapper variant="standard" class="py-24">
  <!-- Page content -->
</Wrapper>
```
- Max-width container
- Centered with responsive padding
- Use for all page sections

**Prose Wrapper (long-form content):**
```astro
<Wrapper variant="prose">
  <!-- Blog post content -->
</Wrapper>
```
- Optimized line length for readability
- Typography styling for markdown

---

## Shadow System

### Shadow Tokens

```css
--shadow: Default card shadow (light)
--shadow-light: Enhanced light mode shadow
--shadow-dark: Enhanced dark mode shadow
```

### Usage Pattern

**Cards:**
```css
shadow                              /* Default state */
hover:shadow-light                  /* Light mode hover */
dark:hover:shadow-dark              /* Dark mode hover */
```

**Elevated Components:**
```css
shadow-lg                           /* Navigation, modals */
```

### Custom Accent Glow

```css
--accent-glow: 0 0 0 3px oklch(0.768 0.233 130.85 / 0.2);
--accent-glow-dark: 0 0 0 3px oklch(0.841 0.238 128.85 / 0.25);
```

**Application:**
```css
focus:shadow-[var(--accent-glow)]
dark:focus:shadow-[var(--accent-glow-dark)]
```

---

## Neuromorphism Effects

### Overview

Neuromorphism (neumorphism) adds soft, extruded depth to UI elements through multi-layered shadows that mimic physical objects. This implementation maintains the retro aesthetic while enhancing visual depth.

**Key Principles:**
- Light source from top-left (standard neumorphism convention)
- Multiple layered shadows for realistic depth
- Subtle effects that enhance, don't overpower
- Accessibility-focused with improved contrast over traditional neumorphism
- Dark mode adaptation with reduced contrast

### Neuromorphism Tokens

**Light Mode - Extruded Appearance:**
```css
--neuro-shadow-light:
  -6px -6px 14px rgba(255, 255, 255, 0.9),
  6px 6px 14px rgba(0, 0, 0, 0.08),
  inset 0 0 0 0.5px rgba(255, 255, 255, 0.5);
```
- Top-left highlight: Bright white shadow (-6px -6px)
- Bottom-right shadow: Subtle dark shadow (6px 6px)
- Inner border: Soft white border for definition

**Light Mode - Inset/Pressed State:**
```css
--neuro-shadow-inset-light:
  inset -4px -4px 10px rgba(255, 255, 255, 0.8),
  inset 4px 4px 10px rgba(0, 0, 0, 0.08),
  0 1px 2px rgba(0, 0, 0, 0.05);
```
- Inverted shadows create pressed appearance
- Outer shadow adds subtle depth

**Light Mode - Hover Enhanced:**
```css
--neuro-shadow-hover-light:
  -8px -8px 18px rgba(255, 255, 255, 1),
  8px 8px 18px rgba(0, 0, 0, 0.12),
  inset 0 0 0 0.5px rgba(255, 255, 255, 0.6);
```
- Increased offset (8px vs 6px) for more depth
- Stronger shadows for emphasis

**Dark Mode - Subtle Appearance:**
```css
--neuro-shadow-dark:
  -4px -4px 10px rgba(255, 255, 255, 0.03),
  4px 4px 10px rgba(0, 0, 0, 0.4),
  inset 0 0 0 0.5px rgba(255, 255, 255, 0.05);
```
- Reduced white highlight for accessibility
- Stronger dark shadow for depth
- Subtle contrast to maintain readability

**Dark Mode - Inset State:**
```css
--neuro-shadow-inset-dark:
  inset -3px -3px 8px rgba(255, 255, 255, 0.02),
  inset 3px 3px 8px rgba(0, 0, 0, 0.5),
  0 1px 2px rgba(0, 0, 0, 0.3);
```

**Dark Mode - Hover Enhanced:**
```css
--neuro-shadow-hover-dark:
  -5px -5px 12px rgba(255, 255, 255, 0.05),
  5px 5px 12px rgba(0, 0, 0, 0.5),
  inset 0 0 0 0.5px rgba(255, 255, 255, 0.08);
```

### Gradient Tokens

**Light Mode Gradient:**
```css
--neuro-gradient-light: linear-gradient(135deg,
  rgba(255, 255, 255, 0.8) 0%,
  rgba(255, 255, 255, 0.4) 50%,
  rgba(0, 0, 0, 0.03) 100%);
```
- 135° diagonal for natural depth
- Fades from bright to subtle shadow

**Dark Mode Gradient:**
```css
--neuro-gradient-dark: linear-gradient(135deg,
  rgba(255, 255, 255, 0.03) 0%,
  rgba(255, 255, 255, 0.01) 50%,
  rgba(0, 0, 0, 0.2) 100%);
```

### Button Pressed State

**Light Mode:**
```css
--neuro-pressed-light:
  inset -2px -2px 6px rgba(255, 255, 255, 0.7),
  inset 2px 2px 6px rgba(0, 0, 0, 0.1);
```

**Dark Mode:**
```css
--neuro-pressed-dark:
  inset -2px -2px 6px rgba(255, 255, 255, 0.02),
  inset 2px 2px 6px rgba(0, 0, 0, 0.6);
```

### Usage Patterns

**Standard Card with Neuromorphism:**
```css
shadow-[var(--neuro-shadow-light)]
dark:shadow-[var(--neuro-shadow-dark)]
hover:shadow-[var(--neuro-shadow-hover-light)]
dark:hover:shadow-[var(--neuro-shadow-hover-dark)]
ring-1 ring-inset ring-white/40 dark:ring-white/5
duration-200 transition-all
```

**Button with Pressed State:**
```css
shadow-[var(--neuro-shadow-light)]
dark:shadow-[var(--neuro-shadow-dark)]
hover:shadow-[var(--neuro-shadow-hover-light)]
dark:hover:shadow-[var(--neuro-shadow-hover-dark)]
active:shadow-[var(--neuro-pressed-light)]
dark:active:shadow-[var(--neuro-pressed-dark)]
active:scale-[0.98]
```

**Input Field (Inset):**
```css
shadow-[var(--neuro-shadow-inset-light)]
dark:shadow-[var(--neuro-shadow-inset-dark)]
focus:shadow-[var(--neuro-shadow-light)]
dark:focus:shadow-[var(--neuro-shadow-dark)]
```

### Component Applications

**Applied to:**
- ✅ Buttons (all variants with pressed states)
- ✅ Blog cards
- ✅ Project cards (1 & 2)
- ✅ Work cards
- ✅ Stack cards (1 & 2)
- ✅ Social media cards
- ✅ Studio service cards

**Best Practices:**

✅ **DO:**
- Use on light/off-white backgrounds (#f6f6f4) for best effect
- Maintain subtle depth - don't overdo shadow intensity
- Apply consistent timing (duration-200) for smooth transitions
- Combine with accent color rings on hover
- Test in both light and dark modes

❌ **DON'T:**
- Use on dark backgrounds in light mode (won't be visible)
- Create excessive depth with large offsets (>10px)
- Mix neuromorphism with flat shadow styles
- Forget active/pressed states on interactive elements
- Sacrifice accessibility for aesthetic

### Accessibility Considerations

**Contrast Ratios:**
- Enhanced from traditional neumorphism
- Light mode: Maintains 4.5:1 minimum for text
- Dark mode: Reduced highlights prevent glare
- All text remains WCAG 2.1 AA compliant

**Interactive Feedback:**
- Hover states clearly visible
- Active/pressed states provide tactile feedback
- Focus states combine neuromorphism with accent glow
- Keyboard navigation fully supported

**Motion Preferences:**
```css
@media (prefers-reduced-motion: reduce) {
  * {
    transition-duration: 0.01ms !important;
  }
}
```

### Performance

**Optimizations:**
- CSS custom properties for efficient updates
- Hardware-accelerated transforms (scale)
- Minimal repaints with box-shadow only
- Fast transition timing (200ms)

**Browser Support:**
- Modern browsers with CSS custom properties
- Graceful degradation to flat shadows
- No JavaScript required

---

## Interactive States

### Hover States

**Cards:**
```css
hover:shadow-light dark:hover:shadow-dark
hover:ring-accent-400 dark:hover:ring-accent-500
```

**Buttons:**
```css
hover:bg-accent-500 dark:hover:bg-accent-500
```

**Links:**
```css
hover:text-accent-800 dark:hover:text-accent-300
```

**Icons:**
```css
group-hover:-rotate-45 duration-300
```

### Focus States

**Interactive Elements:**
```css
focus:outline-2
focus:outline-offset-4
focus:outline-accent-500
dark:focus:outline-accent-400
```

**Form Inputs:**
```css
focus:border-accent-500
focus:ring-accent-500
dark:focus:border-accent-400
dark:focus:ring-accent-400
```

### Active States

**Buttons:**
```css
active:scale-95 duration-100
```

**Links:**
```css
active:translate-y-px
```

### Disabled States

**Opacity reduction:**
```css
disabled:opacity-50
disabled:cursor-not-allowed
disabled:pointer-events-none
```

---

## Dark Mode Guidelines

### Implementation

**Theme Toggle:**
- Fixed position bottom-left
- Saves preference to localStorage
- Class-based dark mode (.dark)

**Color Mapping:**

**Backgrounds:**
```
Light: base-50, base-100
Dark: base-950, base-900, base-800
```

**Text:**
```
Light: base-900, base-600, base-400
Dark: base-100, base-300, base-400
```

**Borders:**
```
Light: base-200, base-300
Dark: base-700, base-800
```

**Accents:**
```
Light: accent-700 (text), accent-400 (bg)
Dark: accent-400 (text), accent-400 (bg)
```

### Transition

```css
duration-300                        /* Color transitions */
transition-colors                   /* Smooth theme switch */
```

### Testing Checklist

- [ ] All text legible in both modes
- [ ] Sufficient contrast maintained
- [ ] Accent colors visible
- [ ] Shadows appropriate intensity
- [ ] No flash of unstyled content (FOUC)

---

## Accessibility Standards

### Color Contrast

**Minimum Ratios (WCAG 2.1 AA):**
- Normal text: 4.5:1
- Large text (18pt+): 3:1
- UI components: 3:1

**Testing:**
Use browser DevTools or online contrast checkers

### Keyboard Navigation

**Focus Indicators:**
```css
focus-visible:outline-2
focus-visible:outline-offset-4
focus-visible:outline-accent-500
```

**Tab Order:**
- Logical flow (top to bottom, left to right)
- Skip links for long navigation
- Modal focus trapping

### Screen Readers

**ARIA Labels:**
```astro
<Button aria-label="Submit contact form">
  Submit
</Button>
```

**Semantic HTML:**
```astro
<nav role="navigation">
<main role="main">
<footer role="contentinfo">
```

**Screen Reader Only Text:**
```css
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  border: 0;
}
```

### Touch Targets

**Minimum Size:**
- 44x44px for all interactive elements
- 48x48px preferred for primary actions

**Implementation:**
```css
min-h-11 min-w-11                   /* 44px minimum */
size-12                             /* 48px preferred */
```

### Motion Preferences

**Respect user preferences:**
```css
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

---

## Animation Guidelines

### Timing Functions

```css
ease-in-out                         /* Default smooth */
ease-out                            /* Entering elements */
ease-in                             /* Exiting elements */
```

### Duration Scale

```css
duration-100                        /* 100ms - Instant feedback */
duration-200                        /* 200ms - Micro-interactions */
duration-300                        /* 300ms - DEFAULT - UI transitions */
duration-500                        /* 500ms - Emphasis animations */
```

### Common Animations

**Hover Lift:**
```css
hover:scale-105 duration-300
```

**Icon Rotation:**
```css
group-hover:-rotate-45 duration-300
```

**Fade In:**
```css
opacity-0 hover:opacity-100 duration-300
```

**Slide In:**
```css
translate-y-4 opacity-0
animate-in duration-300
```

### Performance

✅ **DO:**
- Use transform and opacity (GPU-accelerated)
- Apply will-change sparingly
- Limit simultaneous animations

❌ **DON'T:**
- Animate width/height (reflow)
- Use excessive blur (performance cost)
- Animate on scroll (janky)

---

## Responsive Design

### Breakpoints

```css
sm: 640px                           /* Tablets portrait */
md: 768px                           /* Tablets landscape */
lg: 1024px                          /* Desktop */
xl: 1280px                          /* Large desktop */
2xl: 1536px                         /* Extra large */
```

### Mobile-First Approach

**Base styles = Mobile:**
```css
px-4                                /* Mobile padding */
sm:px-6                             /* Tablet padding */
lg:px-8                             /* Desktop padding */
```

### Grid Layouts

**Responsive Grid:**
```astro
<div class="grid sm:grid-cols-2 lg:grid-cols-3 gap-2">
  <!-- Cards -->
</div>
```

**Two-Column Card:**
```astro
<div class="grid sm:grid-cols-2 gap-4">
  <div>Content</div>
  <div>Image</div>
</div>
```

### Content Width

**Wrapper max-width:**
```css
max-w-7xl mx-auto                   /* 1280px container */
```

### Testing Checklist

- [ ] Mobile (320px+): Content readable, touch targets adequate
- [ ] Tablet (768px+): Layout adapts, multi-column where appropriate
- [ ] Desktop (1024px+): Full features, optimal spacing
- [ ] Large desktop (1440px+): Content doesn't over-stretch

---

## Best Practices

### Component Creation

**1. Use Existing Components:**
- Text.astro for all typography
- Button.astro for all CTAs
- Wrapper.astro for page sections
- Card patterns for content blocks

**2. Maintain Consistency:**
- Follow spacing scale
- Use design tokens (colors, shadows)
- Apply standard hover/focus states
- Respect typography hierarchy

**3. Accessibility First:**
- Semantic HTML
- ARIA labels where needed
- Keyboard navigation support
- Color contrast compliance

### Code Organization

**File Structure:**
```
src/
├── components/
│   ├── fundations/
│   │   ├── elements/      /* Text, Button, Link */
│   │   ├── containers/    /* Wrapper */
│   │   └── icons/         /* Icon components */
│   ├── global/            /* Header, Footer, Nav */
│   ├── landing/           /* Home page sections */
│   └── [feature]/         /* Feature-specific */
├── layouts/
│   └── BaseLayout.astro   /* Main layout */
├── pages/
│   └── [routes].astro     /* Page routes */
└── styles/
    └── global.css         /* Theme tokens */
```

**Naming Conventions:**
- PascalCase for components (Hero.astro)
- kebab-case for pages (about-me.astro)
- camelCase for variables (sectionTitle)

### Performance

**Image Optimization:**
```astro
<Image
  src={image}
  alt="Description"
  width={800}
  height={600}
  loading="lazy"
/>
```

**Font Loading:**
- Preload critical fonts
- Use font-display: swap
- Subset fonts if possible

**CSS Optimization:**
- Tailwind purges unused styles
- Minimize custom CSS
- Use CSS variables for theming

---

## Common Patterns

### Page Header

```astro
<section>
  <Wrapper class="py-24">
    <div class="text-center">
      <Text
        tag="h1"
        variant="displayXL"
        class="dark:text-white text-base-900 text-balance"
      >
        Page Title
        <span class="italic tracking-wide font-display">
          tagline
        </span>
      </Text>
      <Text
        tag="p"
        variant="textLG"
        class="mt-4 dark:text-base-400 text-base-600 text-balance"
      >
        Description text
      </Text>
    </div>
  </Wrapper>
</section>
```

### Section with Cards

```astro
<Text
  tag="h2"
  variant="displayMD"
  class="italic tracking-wide font-display dark:text-white text-base-900"
>
  Section Title
</Text>
<div class="flex flex-col mt-6 gap-2">
  {items.map((item) => (
    <Card {...item} />
  ))}
</div>
```

### CTA Section

```astro
<div class="flex flex-col items-center gap-4 mt-12">
  <Text
    tag="p"
    variant="textLG"
    class="text-center dark:text-base-400 text-base-600"
  >
    Ready to get started?
  </Text>
  <Button
    isLink
    variant="default"
    size="md"
    href="/contact"
  >
    Contact me
  </Button>
</div>
```

---

## Resources

### Design Tools
- Figma: Component library
- Contrast checker: WebAIM Contrast Checker
- Typography: Type Scale calculator

### Development Tools
- Tailwind CSS docs: tailwindcss.com
- Astro docs: docs.astro.build
- OKLCH color picker: oklch.com

### Testing Tools
- Lighthouse: Performance & Accessibility
- axe DevTools: Accessibility testing
- BrowserStack: Cross-browser testing

---

## Changelog

### Version 1.3 (December 30, 2025)
- **Light Mode Contrast Improvements:**
  - Updated body/secondary text from `text-base-600` to `text-base-700`
  - Improved contrast ratio from 7.8:1 to 8.5:1 (excellent WCAG AAA)
  - Applied across 32 component files site-wide
  - Enhanced readability while maintaining visual hierarchy
  - Updated color usage guidelines with accessibility standards
  - Documented contrast ratios for all common color combinations
  - Fixed light mode readability issues reported by users

### Version 1.2 (December 30, 2025)
- **Spacing Consistency Audit & Fixes:**
  - Standardized all page sections to `py-24` (96px vertical padding)
  - Unified header-to-content spacing to `mt-12` (48px)
  - Replaced `space-y-X` with modern `flex flex-col gap-X` pattern
  - Added comprehensive spacing patterns section
  - Fixed 9 spacing inconsistencies across 11 files
  - Enhanced vertical rhythm and breathing room
  - Documented before/after comparisons in audit report
  - Reinforced 8px baseline grid adherence

### Version 1.1 (December 30, 2025)
- **Added Neuromorphism Effects:**
  - Created comprehensive neuromorphism token system
  - Implemented soft extruded shadows for cards and buttons
  - Added pressed/unpressed states for interactive elements
  - Optimized for both light and dark modes
  - Applied to all major components (buttons, cards, forms)
  - Maintained accessibility (WCAG 2.1 AA compliance)
  - Enhanced retro aesthetic with subtle depth

### Version 1.0 (December 30, 2025)
- Initial design system documentation
- Defined typography scale and usage
- Established color system with accent guidelines
- Documented component patterns
- Added accessibility standards
- Improved button variants (accent is now default)
- Enhanced section header hierarchy
- Added accent color hover states to cards

---

## Questions & Support

**For design questions:**
- Review this document first
- Check existing component implementations
- Test in both light and dark modes
- Ensure accessibility compliance

**When creating new components:**
1. Check if existing component can be extended
2. Follow established patterns
3. Use design tokens (colors, spacing, shadows)
4. Test responsive behavior
5. Verify accessibility

**Need clarification?**
Contact: Truong Nguyen
