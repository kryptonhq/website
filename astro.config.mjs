// @ts-check
import { defineConfig, passthroughImageService } from 'astro/config';
import starlight from '@astrojs/starlight';
import starlightSidebarTopics from 'starlight-sidebar-topics';

// `starlight-sidebar-topics` gives each product its own sidebar and a
// switcher. Only Runtime is documented here now — Loupe's docs moved to
// loupe.kryptonhq.com — but the plugin stays so a second manual is one
// topic away rather than a sidebar rewrite.
//
// Note: Starlight's own `sidebar` key must stay unset — the plugin
// throws if both are configured.
export default defineConfig({
  site: 'https://www.kryptonhq.com',
  trailingSlash: 'always',

  // No image optimisation. Nothing here asks for it: the marks are SVG,
  // which Sharp passes through untouched, and the screenshots are served
  // straight out of public/ at the size they were captured. That left
  // Sharp being installed and invoked to do nothing.
  //
  // The no-op service keeps <Image /> and <Picture /> usable — they
  // still enforce dimensions and alt text — but performs no transform,
  // so builds do not depend on a native binary.
  image: {
    service: passthroughImageService(),
  },
  integrations: [
    starlight({
      title: 'Krypton',
      description:
        'Documentation for Krypton Runtime. Loupe is documented at ' +
        'loupe.kryptonhq.com.',
      logo: {
        light: './src/assets/mark-light.svg',
        dark: './src/assets/mark-dark.svg',
        replacesTitle: false,
      },
      favicon: '/favicon.svg',
      customCss: [
        '@fontsource-variable/archivo',
        '@fontsource-variable/jetbrains-mono',
        './src/styles/tokens.css',
        './src/styles/docs.css',
      ],
      social: [
        {
          icon: 'github',
          label: 'GitHub',
          href: 'https://github.com/kryptonhq',
        },
      ],
      editLink: {
        baseUrl: 'https://github.com/kryptonhq/website/edit/main/',
      },
      lastUpdated: true,
      plugins: [
        starlightSidebarTopics([
          {
            id: 'runtime',
            label: 'Runtime',
            link: '/runtime/',
            icon: 'server',
            // Concepts / Tutorials / Operations / Reference groups get
            // added as their directories arrive with the Hugo content
            // port — `autogenerate` throws on a directory that does not
            // exist yet. See MIGRATION.md, phase 2.
            items: [
              { label: 'Overview', link: '/runtime/' },
              {
                label: 'Getting started',
                items: [
                  { autogenerate: { directory: 'runtime/getting-started' } },
                ],
              },
            ],
          },
        ]),
      ],
    }),
  ],
});
