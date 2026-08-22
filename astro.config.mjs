// @ts-check
import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';
import starlightSidebarTopics from 'starlight-sidebar-topics';

// Two products share one docs collection. `starlight-sidebar-topics`
// gives each its own sidebar and a switcher, so /runtime/ and /loupe/
// read as separate manuals rather than one merged tree.
//
// Note: Starlight's own `sidebar` key must stay unset — the plugin
// throws if both are configured.
export default defineConfig({
  site: 'https://www.kryptonhq.com',
  trailingSlash: 'always',
  integrations: [
    starlight({
      title: 'Krypton',
      description:
        'Documentation for Krypton Runtime and Loupe — two independent ' +
        'open-source projects for Kubernetes.',
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
          {
            id: 'loupe',
            label: 'Loupe',
            link: '/loupe/',
            icon: 'magnifier',
            items: [
              { label: 'Overview', link: '/loupe/' },
              {
                label: 'Release notes',
                // Ordered by each page's `sidebar.order`, newest first,
                // rather than by filename — which would put 0.1.0 above
                // 0.1.5 and bury the release anyone is looking for.
                items: [{ autogenerate: { directory: 'loupe/releases' } }],
              },
            ],
          },
        ]),
      ],
    }),
  ],
});
