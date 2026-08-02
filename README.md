# kryptonhq.com

Source for [www.kryptonhq.com](https://www.kryptonhq.com) — the landing
page and the documentation for two independent open-source projects:

- **[Krypton Runtime](https://github.com/kryptonhq/runtime)** — Kubernetes-native
  serving for AI agents, self-hosted LLMs and MCP servers. Docs at `/runtime/`.
- **[Loupe](https://github.com/kryptonhq/loupe)** — an open-source desktop
  client for Kubernetes. Docs at `/loupe/`.

> **The projects are independent.** They share a name, a licence and this
> domain. Documentation for one must not reference, link into, or
> describe itself in terms of the other. See [MIGRATION.md](MIGRATION.md).

Built with [Astro](https://astro.build) and
[Starlight](https://starlight.astro.build).

## Develop

```bash
npm install
npm run dev
```

Then open http://localhost:4321.

```bash
npm run build     # → dist/
npm run preview   # serve dist/ locally
```

## Layout

```
src/
  pages/index.astro          the landing page — not a Starlight route
  layouts/Landing.astro      shell for the landing page (dark, always)
  components/                Nav, Lattice, Terminal, Footer
  styles/
    tokens.css               palette, type, spacing — shared by both
    landing.css              landing page only
    docs.css                 re-skins Starlight with the tokens
  content/docs/
    runtime/                 → /runtime/*
    loupe/                   → /loupe/*
  content.config.ts          Starlight collection + topic schema
astro.config.mjs             site config, sidebar topics
vercel.json                  /docs/* → /runtime/* redirects
public/img/                  Loupe screenshots, brand avatar
```

## How the two products are themed

Everything colour-related resolves to `--kr-accent` and friends, defined
in `src/styles/tokens.css`. Runtime is indigo, Loupe is teal. A block
opts into a product's hue with a data attribute:

```html
<section data-product="loupe">…</section>
```

Docs pages retheme themselves in front matter, which cascades to
Starlight's own variables through `docs.css`:

```yaml
head:
  - tag: style
    content: |
      :root:root { --kr-accent: var(--kr-teal-400); … }
```

`:root:root` rather than `:root` so it outweighs the light-theme block
in `tokens.css` regardless of stylesheet order.

## Adding a docs page

1. Create `src/content/docs/<product>/<page>.mdx`:

   ```yaml
   ---
   title: My page
   description: One line, used for nav and SEO.
   sidebar:
     order: 5
   topic: runtime      # or loupe — must match a topic id in astro.config.mjs
   ---
   ```

2. If it is in a new directory, add that directory to the product's
   topic in `astro.config.mjs`. `autogenerate` throws on a directory
   that does not exist.

3. Link within a product with absolute paths (`/runtime/concepts/…`).
   Do not link across products.

## Deploy

Vercel, from `main`. `vercel.json` sets the build command, output
directory and the permanent redirects from the old Hugo URLs.
