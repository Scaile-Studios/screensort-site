# screensort-site

Marketing site for [screensort.app](https://screensort.app). Static output, built with Vite (vanilla JS, multi-page), deployable to Cloudflare Pages or Vercel.

## Build

| | |
|---|---|
| Install | `npm ci` |
| Build command | `npm run build` |
| Output directory | `dist` |
| Node | 20 or newer (built and tested with 22) |

`npm run build` first runs `check:dashes` (fails on any em dash or en dash in source, docs or config), then `vite build`. Everything in `dist/` is static: HTML, hashed JS/CSS in `dist/assets/`, images and the DMG.

## Develop

```sh
npm run dev        # http://localhost:5173
npm run preview    # serve the built dist/ on http://localhost:4174
npm run check:dashes
```

## Where things live

- `index.html`, `privacy/`, `terms/`, `support/`: the pages, registered in `vite.config.js`. `<!-- @partial name -->` and `{{KEY}}` are expanded at build time by the small plugin in `vite.config.js`, so shipped HTML is complete without JS.
- `src/site.config.js`: values that change between releases (download URL and badge, Mac App Store link and status, requirements, support email, legal entity and effective date). Change them there only.
- `src/partials.js`: shared markup (head tags, nav, footer, the hero demo first frame, the gallery, the smart folders grid) and the SVG icons.
- `src/samples.js`: the four sample captures and six category folders used by the hero demo, shared by the build and the client.
- `src/demo.js`: the live banner demo (capture animation, filename morph, inline rename, folder menu, drag and drop, Quick Look, Undo, auto-dismiss timer, Recent Renames).
- `src/gallery.js`: the 5-slide screenshot gallery and lightbox.
- `src/styles/main.css`: all styles.
- `public/img/mas-*.png`: the 2880x1800 App Store slides, plus `-1440` copies (made with `sips -Z 1440`) served to 1x screens through `srcset`.
- `public/favicon-32.png`, `public/apple-touch-icon.png`: made from `public/img/screensort-icon-squircle.png` with `sips -z`.

## Deploy

Cloudflare Pages: framework preset "None", build command `npm run build`, output directory `dist`. `wrangler.toml` holds the project name and output directory. `public/_headers` and `public/_redirects` are copied into `dist/` and applied by Pages.

Vercel: `vercel.json` sets the build command and output directory and mirrors the same redirects and download headers.

`public/CNAME` is `screensort.app` for hosts that read it.

## Release a new DMG

1. Build, sign, notarize and staple the DMG in the app repo (`xcrun stapler validate ScreenSort.dmg` should pass).
2. Copy it to `public/download/ScreenSort-<version>.dmg` and `git rm` the previous versioned DMG unless old links need to keep working.
3. Set `DOWNLOAD_URL`, `VERSION` and `DOWNLOAD_BADGE` in `src/site.config.js`.
4. Point both `/download/ScreenSort.dmg` and `/download/ScreenSort-preview.dmg` at the new file in `public/_redirects` and `vercel.json`.
5. Keep it under 25 MB (the Cloudflare Pages per-file limit).
6. `npm run build`, commit and push.

## Mac App Store launch

Set `MAS_URL` in `src/site.config.js` to the apps.apple.com listing and `MAS_STATUS` to the badge text (for example `Download on the`). The hero button links to `#mac-app-store` until then.
