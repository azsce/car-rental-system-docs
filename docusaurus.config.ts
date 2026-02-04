import {themes as prismThemes} from 'prism-react-renderer';
import type {Config} from '@docusaurus/types';
import type * as Preset from '@docusaurus/preset-classic';

// This runs in Node.js - Don't use client-side code here (browser APIs, JSX...)

const config: Config = {
  title: 'Car Rental System Planning & Analysis',
  tagline: 'Comprehensive Requirements Engineering and System Design Documentation',
  favicon: 'img/favicon.svg',

  // Future flags, see https://docusaurus.io/docs/api/docusaurus-config#future
  future: {
    v4: true, // Improve compatibility with the upcoming Docusaurus v4
  },

  // Set the production url of your site here
  url: 'https://azsce.github.io',
  // Set the /<baseUrl>/ pathname under which your site is served
  // For GitHub pages deployment, it is often '/<projectName>/'
  baseUrl: '/car-rental-system-docs/',

  // GitHub pages deployment config.
  // If you aren't using GitHub pages, you don't need these.
  organizationName: 'azsce', // Usually your GitHub org/user name.
  projectName: 'car-rental-system-docs', // Usually your repo name.
  
  trailingSlash: false,
  
  onBrokenLinks: 'throw',
  
  // Enable Mermaid diagrams
  markdown: {
    mermaid: true,
  },
  
  themes: ['@docusaurus/theme-mermaid'],

  // Even if you don't use internationalization, you can use this field to set
  // useful metadata like html lang. For example, if your site is Chinese, you
  // may want to replace "en" with "zh-Hans".
  i18n: {
    defaultLocale: 'en',
    locales: ['en'],
  },

  presets: [
    [
      'classic',
      {
        docs: {
          sidebarPath: './sidebars.ts',
          routeBasePath: 'docs',
        },
        blog: false, // Disable blog for this documentation project
        theme: {
          customCss: './src/css/custom.css',
        },
      } satisfies Preset.Options,
    ],
  ],

  themeConfig: {
    // Replace with your project's social card
    image: 'img/social-card.svg',
    colorMode: {
      respectPrefersColorScheme: true,
    },
    navbar: {
      title: 'Car Rental Planning',
      logo: {
        alt: 'Car Rental Planning Logo',
        src: 'img/logo.svg',
      },
      items: [
        {
          type: 'docSidebar',
          sidebarId: 'docsSidebar',
          position: 'left',
          label: 'Documentation',
        },
        {
          to: '/docs/analysis/comparative-analysis',
          label: 'Analysis',
          position: 'left',
        },
        {
          to: '/docs/research',
          label: 'Research',
          position: 'left',
        },
        {
          to: '/docs/features',
          label: 'Features',
          position: 'left',
        },
        {
          to: '/docs/requirements',
          label: 'Requirements',
          position: 'left',
        },
        {
          href: 'https://github.com/azsce/car-rental-system-docs',
          label: 'GitHub',
          position: 'right',
        },
      ],
    },
    footer: {
      style: 'dark',
      links: [
        {
          title: 'Documentation',
          items: [
            {
              label: 'Introduction',
              to: '/docs/intro',
            },
            {
              label: 'Features',
              to: '/docs/features',
            },
            {
              label: 'Requirements',
              to: '/docs/requirements',
            },
          ],
        },
        {
          title: 'Analysis',
          items: [
            {
              label: 'Comparative Analysis',
              to: '/docs/analysis/comparative-analysis',
            },
            {
              label: 'BookCars',
              to: '/docs/analysis/bookcars/overview',
            },
            {
              label: 'FreeCar',
              to: '/docs/analysis/freecar/overview',
            },
          ],
        },
        {
          title: 'Research',
          items: [
            {
              label: 'Advanced Features',
              to: '/docs/research/advanced-features',
            },
            {
              label: 'AI Pricing',
              to: '/docs/research/market-trends/ai-pricing',
            },
            {
              label: 'UX Patterns',
              to: '/docs/research/best-practices/ux-patterns',
            },
          ],
        },
        {
          title: 'More',
          items: [
            {
              label: 'Stakeholders',
              to: '/docs/stakeholders/stakeholder-mapping',
            },
            {
              label: 'Workflows',
              to: '/docs/workflows',
            },
            {
              label: 'GitHub',
              href: 'https://github.com/azsce/car-rental-system-docs',
            },
          ],
        },
      ],
      copyright: `Copyright © ${new Date().getFullYear()} Car Rental System Documentation.`,
    },
    prism: {
      theme: prismThemes.github,
      darkTheme: prismThemes.dracula,
    },
  } satisfies Preset.ThemeConfig,
};

export default config;
