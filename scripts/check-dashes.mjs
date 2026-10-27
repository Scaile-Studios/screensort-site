// Fails if an em dash (U+2014) or en dash (U+2013) appears anywhere in site
// source, docs or config. House style: hyphens, colons or parentheses instead.
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, extname } from 'node:path';

const ROOTS = [
  'index.html', 'privacy', 'terms', 'support', 'src', 'scripts', 'public', 'README.md',
  'vite.config.js', 'vercel.json', 'wrangler.toml', 'package.json', '.gitignore', '.github',
];
const TEXT = new Set(['.html', '.js', '.mjs', '.css', '.md', '.txt', '.json', '.xml', '.toml', '.svg', '.yml', '.yaml', '']);
const DASHES = [[0x2014, 'em dash'], [0x2013, 'en dash']].map(([code, name]) => [String.fromCharCode(code), name]);
const bad = [];

function walk(path) {
  let st;
  try { st = statSync(path); } catch { return; }
  if (st.isDirectory()) return readdirSync(path).forEach((f) => walk(join(path, f)));
  if (!TEXT.has(extname(path))) return;
  readFileSync(path, 'utf8').split('\n').forEach((line, i) => {
    for (const [ch, name] of DASHES) {
      if (line.includes(ch)) bad.push(`${path}:${i + 1}: ${name}: ${line.trim().slice(0, 100)}`);
    }
  });
}

ROOTS.forEach(walk);
if (bad.length) {
  console.error(`Em or en dashes found (house style forbids them):\n${bad.join('\n')}`);
  process.exit(1);
}
console.log('check:dashes ok, no em or en dashes');
