// Fast checks that need no browser: every script parses, the service worker caches every app file,
// and index.html loads every script in order.
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const jsFiles = fs.readdirSync(path.join(root, 'js')).filter((f) => f.endsWith('.js')).sort();

test('every script parses', () => {
  for (const f of [...jsFiles.map((f) => 'js/' + f), 'sw.js']) execFileSync(process.execPath, ['--check', path.join(root, f)]);
  for (const f of fs.readdirSync(path.join(root, 'netlify/functions'))) execFileSync(process.execPath, ['--check', path.join(root, 'netlify/functions', f)]);
});

test('index.html loads every script, in order', () => {
  const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
  const srcs = [...html.matchAll(/<script src="js\/([^"]+)"/g)].map((m) => m[1]);
  assert.deepEqual(srcs, jsFiles);
});

test('the service worker caches every app file', () => {
  const sw = fs.readFileSync(path.join(root, 'sw.js'), 'utf8');
  for (const f of jsFiles) assert.ok(sw.includes("'js/" + f + "'"), 'sw.js is missing js/' + f);
  assert.ok(sw.includes("'css/app.css'"));
});

test('scripts share one scope without duplicate top-level names', () => {
  const seen = new Map();
  for (const f of jsFiles) {
    const src = fs.readFileSync(path.join(root, 'js', f), 'utf8');
    for (const m of src.matchAll(/^(?:const|let|function|async function)\s+([A-Za-z_$][\w$]*)/gm)) {
      assert.ok(!seen.has(m[1]), `${m[1]} is declared in both ${seen.get(m[1])} and ${f}`);
      seen.set(m[1], f);
    }
  }
});
