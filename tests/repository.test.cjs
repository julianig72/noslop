const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const read = file => fs.readFileSync(path.join(root, file), 'utf8');
const examples = fs.readdirSync(path.join(root, 'examples')).filter(file => file.endsWith('.html'));

test('marketplace and plugin metadata agree and point only to this fork', () => {
  const market = JSON.parse(read('.claude-plugin/marketplace.json'));
  const plugin = JSON.parse(read('plugins/noslop/.claude-plugin/plugin.json'));
  assert.equal(market.name, 'noslop');
  assert.equal(market.owner.name, 'julianig72');
  assert.equal(market.plugins.length, 1);
  for (const key of ['name', 'version', 'description', 'homepage', 'repository', 'license']) {
    assert.equal(market.plugins[0][key], plugin[key], key);
  }
  assert.equal(plugin.repository, 'https://github.com/julianig72/noslop');
  assert.equal(plugin.author.name, 'julianig72');
  assert.ok(fs.existsSync(path.resolve(root, market.plugins[0].source, '.claude-plugin/plugin.json')));
});

function localTarget(source, url) {
  if (/^(?:[a-z][a-z0-9+.-]*:|#|\/\/)/i.test(url)) return;
  const target = decodeURIComponent(url.split(/[?#]/)[0]);
  assert.ok(fs.existsSync(path.resolve(root, path.dirname(source), target)), `${source}: ${url}`);
}

test('documentation and HTML local links and resources resolve', () => {
  for (const file of ['README.md', 'ATTRIBUTIONS.md', 'plugins/noslop/skills/noslop/SKILL.md']) {
    for (const match of read(file).matchAll(/\[[^\]]*\]\(([^)]+)\)/g)) localTarget(file, match[1]);
  }
  for (const file of examples) {
    for (const match of read('examples/' + file).matchAll(/(?:src|href)="([^"]+)"/g)) localTarget('examples/' + file, match[1]);
  }
});

test('examples are standalone documents without the export host runtime', () => {
  assert.equal(examples.length, 9);
  for (const file of examples) {
    const text = read('examples/' + file);
    assert.match(text, /<html lang="en">/);
    assert.match(text, /name="viewport"/);
    assert.match(text, /charset="utf-8"/);
    assert.doesNotMatch(text, /__FRAME_PREAMBLE|frame-runtime|claude:viewport/);
    assert.doesNotMatch(text, /rubenhassid|substack|brightpath|Northwind|Robine/);
    assert.match(text, /Fictional demo/);
    for (const match of text.matchAll(/<script[^>]+src="([^"]+)"/g)) {
      assert.doesNotMatch(match[1], /^https?:/);
    }
  }
});

test('MIT notice is retained and documentation does not advertise nonexistent Pages hosting', () => {
  assert.match(read('LICENSE'), /Copyright \(c\) 2026 Ruben Hassid \(How to AI\)/);
  assert.match(read('LICENSE'), /Permission is hereby granted/);
  assert.doesNotMatch(read('README.md'), /github\.io/);
  assert.match(read('ATTRIBUTIONS.md'), /heydamir\/unslop/);
});
