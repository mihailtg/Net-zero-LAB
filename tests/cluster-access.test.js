const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const { webcrypto, pbkdf2Sync, randomBytes } = require('node:crypto');
const source = fs.readFileSync(path.join(__dirname, '..', 'cluster-access.js'), 'utf8');
const fixturePassword = 'test-only-access-fixture';

function environment({ unsupported = false } = {}) {
  const salt = randomBytes(16);
  const fixture = { iterations: 1200, salt: salt.toString('base64'), digest: pbkdf2Sync(fixturePassword, salt, 1200, 32, 'sha256').toString('base64') };
  const nodes = new Map(); let language = 'en'; let renders = 0;
  for (const id of ['clusterAccessGate', 'clusterContent', 'clusterMainTabs', 'clusterLockButton', 'clusterPassword', 'clusterUnlockSubmit', 'clusterAccessError', 'clusterAccessForm']) {
    nodes.set(id, { id, hidden: false, disabled: false, value: '', textContent: '', attributes: {}, listeners: {},
      setAttribute(key, value) { this.attributes[key] = value; },
      getAttribute(key) { return this.attributes[key]; },
      querySelectorAll: () => [], querySelector: () => null, focus() { this.focused = true; },
      addEventListener(type, callback) { this.listeners[type] = callback; },
    });
  }
  const context = {
    crypto: unsupported ? undefined : webcrypto, TextEncoder, Uint8Array,
    atob: value => Buffer.from(value, 'base64').toString('binary'),
    document: { readyState: 'complete', getElementById: id => nodes.get(id) },
    translate: key => `${language}:${key}`,
    ClusterAnalysis: { render() { renders += 1; } },
    // Old client-side flags must never grant access, and credentials must not be persisted.
    localStorage: { getItem: () => 'true', setItem() { throw Error('Unexpected persistent access state'); } },
    sessionStorage: { getItem: () => 'true', setItem() { throw Error('Unexpected persistent access state'); } },
  };
  context.window = context; vm.createContext(context);
  vm.runInContext(source.replace(/const VERIFIER = Object\.freeze\(\{[\s\S]*?\}\);/, `const VERIFIER = Object.freeze(${JSON.stringify(fixture)});`), context);
  return { access: context.ClusterAccess, nodes, renders: () => renders, setLanguage(value) { language = value; } };
}

test('access starts locked even with old browser flags, and a fresh page starts locked again', () => {
  const { access, nodes } = environment();
  assert.equal(access.isUnlocked(), false);
  assert.equal(nodes.get('clusterAccessGate').hidden, false);
  assert.equal(nodes.get('clusterContent').hidden, true);
  assert.equal(nodes.get('clusterMainTabs').hidden, true);
  assert.equal(nodes.get('clusterLockButton').hidden, true);
  assert.equal(environment().access.isUnlocked(), false);
});

test('wrong, empty, case-changed and whitespace-modified passwords do not unlock the section', async () => {
  const { access, nodes, setLanguage } = environment();
  for (const value of ['', 'incorrect', fixturePassword.toUpperCase(), ` ${fixturePassword}`]) {
    assert.equal(await access.unlock(value), false);
    assert.equal(access.isUnlocked(), false);
    assert.equal(nodes.get('clusterContent').hidden, true);
  }
  assert.equal(nodes.get('clusterAccessError').textContent, 'en:access.cluster.invalid');
  setLanguage('bg'); access.render();
  assert.equal(nodes.get('clusterAccessError').textContent, 'bg:access.cluster.invalid');
});

test('successful form submission clears the password and unlocks only until explicitly locked or reloaded', async () => {
  const { access, nodes, renders } = environment();
  const input = nodes.get('clusterPassword'); input.value = fixturePassword;
  const submission = nodes.get('clusterAccessForm').listeners.submit({ preventDefault() {} });
  assert.equal(input.value, '');
  assert.equal(nodes.get('clusterUnlockSubmit').disabled, true);
  assert.equal(access.isUnlocked(), false);
  await submission;
  assert.equal(access.isUnlocked(), true);
  assert.equal(nodes.get('clusterContent').hidden, false);
  assert.equal(nodes.get('clusterAccessGate').hidden, true);
  assert.equal(nodes.get('clusterLockButton').hidden, false);
  assert.equal(renders(), 1);
  nodes.get('clusterLockButton').listeners.click();
  assert.equal(access.isUnlocked(), false);
  assert.equal(nodes.get('clusterContent').hidden, true);
  assert.equal(input.focused, true);
  assert.equal(environment().access.isUnlocked(), false);
});

test('locking while a password check is pending prevents the late result from reopening the section', async () => {
  const { access } = environment();
  const submission = access.unlock(fixturePassword);
  access.lock();
  assert.equal(await submission, false);
  assert.equal(access.isUnlocked(), false);
});

test('missing Web Crypto fails closed and explains that verification is unavailable', async () => {
  const { access, nodes } = environment({ unsupported: true });
  assert.equal(await access.unlock(fixturePassword), false);
  assert.equal(access.isUnlocked(), false);
  assert.equal(nodes.get('clusterContent').hidden, true);
  assert.equal(nodes.get('clusterAccessError').textContent, 'en:access.cluster.unavailable');
});

test('production verifier is salted PBKDF2 and the gate loads before the cluster UI', () => {
  const verifier = JSON.parse(source.match(/const VERIFIER = Object\.freeze\((\{[\s\S]*?\})\);/)[1]
    .replace(/(iterations|salt|digest):/g, '"$1":').replace(/'/g, '"').replace(/,\s*}/, '}'));
  assert.ok(verifier.iterations >= 600000);
  assert.equal(Buffer.from(verifier.salt, 'base64').length, 16);
  assert.equal(Buffer.from(verifier.digest, 'base64').length, 32);
  assert.doesNotMatch(source, /localStorage|sessionStorage|btoa\(/);
  const html = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');
  assert.ok(html.indexOf('src="cluster-access.js"') < html.indexOf('src="cluster-analysis.js"'));
  assert.match(html, /id="clusterContent" hidden/);
  assert.equal((html.match(/type="password"/g) || []).length, 1);
});
