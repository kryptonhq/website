# Migration plan — kryptonhq.com

Moving the website out of `kryptonhq/runtime` into its own repo, and
turning it from a single-product docs site into a shared home for two
independent projects.

## Ground rule

**Runtime and Loupe are independent projects.** They share a name, a
licence and this domain — nothing else. Neither project's
documentation may describe itself in terms of the other, link into the
other's manual, or imply that one is a companion to the other. The
landing page presents both because it is the domain root; that is the
only surface where they appear together, and even there they are
described in parallel rather than as one story.

Enforce this on every content PR. It is the constraint most likely to
erode by accident.

## Current state

| Thing | Where it is | Notes |
| --- | --- | --- |
| Live site | `www.kryptonhq.com` | Vercel, apex 307s to `www` |
| Source | `kryptonhq/runtime` → `website/` | Hugo + Docsy |
| Build | `website/build.sh` | Installs Go + Hugo into `~/.local`, then `hugo --gc --minify` |
| Content | 25 Markdown files under `website/content/docs/` | All Runtime |
| Version badge | `hugo.yaml` → `params.kryptonVersion` | Rewritten by the `bump-version` workflow on every `v*` tag |
| Loupe | No web presence | README only |

There is also a stale Astro one-pager at `krypton/website`, on **GitLab**
(`git@gitlab.com:kryptonhq/website.git`), deployed to Cloudflare Pages
and linking to a dead `toolkit.kryptonhq.com`. It is not the live site
and is not part of this migration — archive or delete it separately so
nobody mistakes it for the source of truth.

## Target state

One repo, `kryptonhq/website` (already exists on GitHub, empty), built
with **Astro 7 + Starlight 0.41**.

```
/                          custom landing page (dark, not Starlight)
/runtime/                  Runtime docs
/runtime/getting-started/…
/loupe/                    Loupe docs
```

`starlight-sidebar-topics` gives each product its own sidebar and a
switcher, so the two manuals never merge into one tree.

### Why Astro + Starlight

Docsy is Bootstrap- and jQuery-based, and fighting it for a bespoke
landing page is expensive. Starlight gives sidebars, Pagefind search,
dark mode and MDX components out of the box, while `src/pages/index.astro`
takes over `/` completely — a static page always wins over Starlight's
catch-all route, so the landing page has no framework opinions imposed
on it at all.

## URL map

Runtime docs move from `/docs/*` to `/runtime/*`. Every old URL is
redirected permanently in `vercel.json`.

| Old | New |
| --- | --- |
| `/docs/` | `/runtime/` |
| `/docs/getting-started/*` | `/runtime/getting-started/*` |
| `/docs/concepts/*` | `/runtime/concepts/*` |
| `/docs/tutorials/*` | `/runtime/tutorials/*` |
| `/docs/operations/*` | `/runtime/operations/*` |
| `/docs/reference/*` | `/runtime/reference/*` |
| `/docs/roadmap/` | `/runtime/roadmap/` |
| `/docs/*` (catch-all) | `/runtime/*` |

The catch-all is last on purpose — Vercel matches in order, so the
specific rules win and the catch-all only picks up anything missed.

## Phases

### Phase 1 — scaffold and design ✅ done

- Astro + Starlight + `starlight-sidebar-topics`
- Design tokens (`src/styles/tokens.css`), Starlight re-skin
  (`src/styles/docs.css`), landing styles (`src/styles/landing.css`)
- Landing page at `/`
- Loupe one-page doc at `/loupe/`
- Runtime overview at `/runtime/` and `/runtime/getting-started/installation/`
- `vercel.json` with the redirect map

### Phase 2 — port the remaining Runtime docs

23 files still to move from `runtime/website/content/docs/`. Per file:

1. `.md` → `.mdx`, `_index.md` → `index.mdx`.
2. Front matter: drop `weight: N`, use `sidebar: { order: N }`. Keep
   `title` and `description`. Add `topic: runtime`.
3. Replace Docsy shortcodes:
   - `{{< version >}}` → the literal version, or an imported constant
   - `{{< version-bare >}}` → same, without the `v`
   - `{{% alert %}}` → `<Aside>` from `@astrojs/starlight/components`
4. Rewrite internal links `/docs/…` → `/runtime/…`.
5. **Strip any reference to Loupe.** There were none in the Hugo
   content, and there should be none after the port either.
6. Restore the full sidebar in `astro.config.mjs` — the Concepts,
   Tutorials, Operations and Reference groups are commented out there
   because `autogenerate` throws on a directory that does not exist.

Note the Starlight ≥0.39 sidebar shape: a labelled group takes an
`items` array containing the autogenerate config, **not** an
`autogenerate` key beside the label.

```js
{ label: 'Concepts', items: [{ autogenerate: { directory: 'runtime/concepts' } }] }
```

### Phase 3 — cut over

1. Push this repo to `kryptonhq/website`.
2. Create a Vercel project pointed at it. Verify on the preview URL:
   landing, both docs roots, search, and a spot-check of redirects.
3. Move the `www.kryptonhq.com` and `kryptonhq.com` domains from the
   old Vercel project to the new one.
4. Watch for 404s for a day.
5. Only then: delete `website/` and `vercel.json` from
   `kryptonhq/runtime` in a follow-up PR, and update the README docs
   badge if the URL changed.

Keep the old project deployable until step 5 — that is the rollback.

### Phase 4 — follow-ups

- **Version badges.** `RUNTIME_VERSION` and `LOUPE_VERSION` are
  constants at the top of `src/pages/index.astro`, and the Runtime
  version is repeated in `runtime/getting-started/installation.mdx`.
  The old `bump-version` workflow rewrote `hugo.yaml` in the runtime
  repo; it now needs to open a PR against *this* repo instead. Until
  that is wired up, bump by hand at release time.
- **Loupe screenshots — regenerate the demo fixtures.** ⚠️ Tracked.
  `public/img/*.png` are copied from `loupe/docs/screenshots/`. They
  were captured against a cluster running Krypton Runtime, so the demo
  data lists `krypton-gateway`, `krypton-manager`, `krypton-system`
  and so on. On a site whose whole premise is that the two projects are
  independent, that is the coupling leaking back in visually.

  `services.png`, `secret-data.png` and `pod-yaml.png` were dropped for
  this reason. `node-detail.png` is clean and is the only screenshot in
  the Loupe docs. `pods.png` is knowingly still used as the Loupe
  section's hero on the landing page, because the section has no other
  strong visual — it is the one accepted exception.

  **To close this out:** change `src/dev/fixtures.ts` in the Loupe repo
  to neutral demo data (generic app names, no `krypton-*`), recapture
  the screenshots — ideally in dark theme, which would also stop the
  light-on-dark rectangle on the landing page — and re-copy them here.
  Then restore the services and secrets screenshots in the Loupe docs.
- **Runtime governance files.** Loupe has `CONTRIBUTING.md`,
  `GOVERNANCE.md`, `SECURITY.md` and a Code of Conduct; Runtime has
  none. The site deliberately makes no org-wide claim about DCO or
  Code of Conduct because it would only be true of one project. Worth
  fixing in the runtime repo.
- **Prettier.** `prettier-plugin-astro` is not installed, so
  `.astro` files are hand-formatted.
- **OG image.** Currently falls back to the brand avatar. A real
  1200×630 card would be better.

## Gotchas already hit

Recording these so they are not rediscovered.

- `starlight-sidebar-topics` **throws** if Starlight's own `sidebar` key
  is also set. Its published getting-started example shows both; that
  example is wrong for this version.
- Each topic needs an explicit `id` if any page sets `topic:` in front
  matter, or the build fails with "Failed to find the topic".
- `--sl-color-accent-low` must stay **opaque**. Starlight uses it as the
  *text* colour on the accent-filled current sidebar link, so a
  translucent value makes the label invisible.
- Astro collapses JSX-style whitespace: a line ending in text followed
  by a newline and then an element loses the space between them
  (`is` + `<code>` → `iskubectl`). Use `{' '}` at the line end.
- For the same reason, preformatted terminal content is passed to
  `Terminal.astro` as an HTML string, not through a slot — a slot loses
  the leading indentation on wrapped commands.
