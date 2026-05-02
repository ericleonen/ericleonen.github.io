// @ts-check
import { defineConfig } from 'astro/config';

import react from '@astrojs/react';
import icon from 'astro-icon';
import tailwindcss from '@tailwindcss/vite';

import sitemap from '@astrojs/sitemap';

// https://astro.build/config
export default defineConfig({
  integrations: [react(), icon(), sitemap()],
  output: "static",
  vite: {
    plugins: [tailwindcss()]
  },

  site: "https://ericleonen.github.io"
});