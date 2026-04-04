# Repository Guidelines

## Project Overview

**Inflated Dreams** is a single-page static website for a luxury balloon decoration business. It is a plain HTML/CSS/JS site with no build toolchain, bundler, or framework. Deployed via GitHub Pages (`.nojekyll` present).

## Project Structure & Module Organization

```
index.html        — Single-page app; all sections (nav, hero, about, services, gallery, contact, footer) live here
css/styles.css    — All styles; mobile-first, ~1300 lines with clear section comments
js/main.js        — All JavaScript; wrapped in an IIFE, organized by feature with block comments
images/           — Static assets (logo, gallery placeholders)
```

**Key architecture notes:**
- `css/styles.css` uses CSS custom properties (`--color-*`, `--font-*`, `--space-*`, etc.) as design tokens defined in `:root` — always use these variables, never hardcode colors or spacing.
- `js/main.js` uses a shared `trapFocus` / `releaseFocus` utility used by both the mobile menu and the lightbox — reuse it for any new modal/overlay.
- The contact form submits to [Web3Forms](https://web3forms.com/) (`https://api.web3forms.com/submit`) via `fetch`. The access key is embedded in a hidden form input in `index.html`.
- Gallery items are placeholder `<button>` elements with `data-index` and optional `data-type="video"` attributes. Actual images/videos are not yet populated.

## Development

No build step. Open `index.html` directly in a browser or serve locally:

```bash
npx serve .
# or
python3 -m http.server
```

There are no tests, linters, formatters, or pre-commit hooks configured.

## Coding Style & Naming Conventions

- **CSS**: BEM-style class names (`block__element--modifier`, e.g. `.service-card`, `.service-card-title`, `.nav-link--cta`). Add new component styles inside clearly commented section blocks.
- **JS**: ES6+, `'use strict'`, IIFE wrapper. Use the `$` / `$$` shorthand helpers defined at the top of `main.js`. Respect `prefersReducedMotion` for all animations.
- **HTML**: Semantic elements with ARIA labels on interactive and landmark elements. Maintain `role`, `aria-label`, and `aria-hidden` patterns already established.
- **Accessibility**: All modals/overlays must use `trapFocus` / `releaseFocus`. Interactive elements need `:focus-visible` styles (gold outline is the standard).

## Commit Conventions

Based on git history, commits use short imperative phrases:

```
hide form feedback
inital commit
```
