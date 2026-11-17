(function initClusterAccess(root) {
  'use strict';

  // Browser-only access gate. Public verifier; no plaintext password or persistent unlock flag.
  const VERIFIER = Object.freeze({
    iterations: 600000,
    salt: 'bvVfqBcENiuRT+22n1eJfQ==',
    digest: 'bjB+GvxleP/kUbRhDhuJ2ZedYhhu8BYJiK3wcsURs3Q=',
  });
  let unlocked = false;
  let pending = false;
  let errorKey = '';
  let revision = 0;
  const t = key => root.translate?.(key) || key;
  const node = id => root.document?.getElementById(id);
  const bytes = value => Uint8Array.from(root.atob(value), character => character.charCodeAt(0));

  function render() {
    const gate = node('clusterAccessGate');
    if (!gate) return;
    gate.hidden = unlocked;
    const content = node('clusterContent');
    if (content) content.hidden = !unlocked;
    const tabs = node('clusterMainTabs');
    if (tabs) tabs.hidden = !unlocked;
    const lockButton = node('clusterLockButton');
    if (lockButton) { lockButton.hidden = !unlocked; lockButton.textContent = t('access.cluster.lock'); }
    gate.querySelectorAll('[data-i18n]').forEach(element => {
      element.textContent = t(element.getAttribute('data-i18n'));
    });
    const input = node('clusterPassword');
    if (input) {
      input.disabled = pending;
      input.setAttribute('aria-invalid', String(errorKey === 'access.cluster.invalid'));
      input.setAttribute('aria-label', t('access.cluster.password'));
    }
    const submit = node('clusterUnlockSubmit');
    if (submit) { submit.disabled = pending; submit.textContent = t(pending ? 'access.cluster.checking' : 'access.cluster.unlock'); }
    const error = node('clusterAccessError');
    if (error) { error.hidden = !errorKey; error.textContent = errorKey ? t(errorKey) : ''; }
    gate.setAttribute('aria-busy', String(pending));
  }

  async function unlock(password) {
    if (pending || unlocked) return unlocked;
    const attempt = ++revision;
    errorKey = '';
    if (typeof password !== 'string' || !password.length || password.length > 256) {
      errorKey = 'access.cluster.invalid'; render(); return false;
    }
    if (!root.crypto?.subtle || !root.TextEncoder) {
      errorKey = 'access.cluster.unavailable'; render(); return false;
    }
    pending = true; render();
    try {
      const passwordBytes = new root.TextEncoder().encode(password);
      const material = await root.crypto.subtle.importKey('raw', passwordBytes, 'PBKDF2', false, ['deriveBits']);
      passwordBytes.fill(0);
      const derived = new Uint8Array(await root.crypto.subtle.deriveBits({
        name: 'PBKDF2', hash: 'SHA-256', iterations: VERIFIER.iterations, salt: bytes(VERIFIER.salt),
      }, material, 256));
      const expected = bytes(VERIFIER.digest);
      let difference = derived.length ^ expected.length;
      for (let index = 0; index < expected.length; index += 1) difference |= derived[index] ^ expected[index];
      derived.fill(0);
      if (attempt !== revision) return false;
      unlocked = difference === 0;
      if (!unlocked) errorKey = 'access.cluster.invalid';
    } catch (error) {
      if (attempt === revision) errorKey = 'access.cluster.unavailable';
    } finally {
      pending = false; render();
    }
    if (unlocked) {
      root.ClusterAnalysis?.render?.();
      node('clusterMainTabs')?.querySelector('button')?.focus();
    }
    return unlocked;
  }

  function lock() {
    revision += 1;
    unlocked = false;
    errorKey = '';
    const input = node('clusterPassword');
    if (input) input.value = '';
    render();
    root.ClusterAnalysis?.render?.();
  }

  function initialize() {
    node('clusterAccessForm')?.addEventListener('submit', async event => {
      event.preventDefault();
      const input = node('clusterPassword');
      if (!input) return;
      const password = input.value;
      input.value = '';
      if (!await unlock(password)) input.focus();
    });
    node('clusterLockButton')?.addEventListener('click', () => {
      lock(); node('clusterPassword')?.focus();
    });
    render();
  }

  root.ClusterAccess = Object.freeze({ isUnlocked: () => unlocked, unlock, lock, render });
  if (root.document?.readyState === 'loading') root.document.addEventListener('DOMContentLoaded', initialize, { once: true });
  else initialize();
})(typeof window !== 'undefined' ? window : globalThis);
