import { resolve } from 'node:path';
import { defineConfig } from 'vite';
import { renderHtml } from './src/partials.js';

const root = import.meta.dirname;
const pages = ['index', 'privacy/index', 'terms/index', 'support/index'];

// Expands build-time partials and {{KEY}} config placeholders in every page.
const siteHtml = () => ({
  name: 'screensort-site-html',
  transformIndexHtml: { order: 'pre', handler: (html) => renderHtml(html) },
});

export default defineConfig({
  plugins: [siteHtml()],
  build: {
    outDir: 'dist',
    target: 'es2020',
    assetsInlineLimit: 0,
    rollupOptions: {
      input: Object.fromEntries(pages.map((p) => [p.replace('/index', '') || 'index', resolve(root, `${p}.html`)])),
    },
  },
});
