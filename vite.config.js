import { resolve } from 'node:path';
import { defineConfig } from 'vite';
import { renderHtml } from './src/partials.js';

const root = import.meta.dirname;
const pages = ['index', 'privacy/index', 'terms/index', 'support/index'];

// Expands build-time partials and {{KEY}} config placeholders in every page, with
// links relative to the page ('./' on /index.html, '../' on /privacy/index.html).
const siteHtml = () => ({
  name: 'screensort-site-html',
  transformIndexHtml: {
    order: 'pre',
    handler: (html, ctx) => renderHtml(html, '../'.repeat(ctx.path.split('/').length - 2) || './'),
  },
});

export default defineConfig({
  // Relative asset URLs, so the build works at / (screensort.app) and under /screensort-site/ (GitHub Pages).
  base: './',
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
