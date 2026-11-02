// Lints the app's scripts as the browser runs them: one shared scope, in index.html order.
// Catches typos and names used before they exist anywhere (no-undef), unused or shadowed mistakes stay off.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { Linter } from 'eslint';
import globals from 'globals';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
const files = [...html.matchAll(/<script src="(js\/[^"]+)"/g)].map((m) => m[1]);
let src = '', map = [];
for (const f of files) {
  const text = fs.readFileSync(path.join(root, f), 'utf8').replace(/^"use strict";?\s*$/m, '');
  const start = src.split('\n').length;
  src += text + '\n';
  map.push({ f, start, end: src.split('\n').length });
}
const rules = { 'no-undef': 'error', 'no-dupe-keys': 'error', 'no-unreachable': 'error', 'no-self-assign': 'error', 'no-dupe-else-if': 'error', 'no-duplicate-case': 'error', 'use-isnan': 'error', 'valid-typeof': 'error', 'no-const-assign': 'error', 'no-func-assign': 'error' };
const lint = (code, file, g) => new Linter().verify(code, { languageOptions: { ecmaVersion: 2024, sourceType: 'script', globals: g } , rules }, { filename: file });
const out = [];
for (const m of lint('"use strict";\n' + src, 'app.js', { ...globals.browser })) {
  const line = m.line - 1, at = map.find((x) => line >= x.start && line < x.end);
  out.push(`${at ? at.f + ':' + (line - at.start + 1) : 'app.js:' + line}  ${m.message}`);
}
for (const f of ['sw.js']) for (const m of lint(fs.readFileSync(path.join(root, f), 'utf8'), f, { ...globals.serviceworker })) out.push(`${f}:${m.line}  ${m.message}`);
for (const f of ['share.html']) {
  const code = fs.readFileSync(path.join(root, f), 'utf8').match(/<script>([\s\S]*?)<\/script>/)[1];
  for (const m of lint(code, 'share.js', { ...globals.browser })) out.push(`${f} (script):${m.line}  ${m.message}`);
}
if (out.length) { console.error(out.join('\n')); console.error(`\n${out.length} problem(s)`); process.exit(1); }
console.log(`lint ok: ${files.length} scripts, sw.js, share.html`);
