(function (root, factory) {
  const messages = root.CoreBulgarian || (typeof require === 'function' ? require('./core-i18n-bg.js') : {});
  const api = factory(root, messages);
  root.CoreI18n = api;
  if (typeof module === 'object' && module.exports) module.exports = api;
})(typeof window !== 'undefined' ? window : globalThis, function (root, messages) {
  'use strict';

  const originals = new WeakMap();
  const attributeOriginals = new WeakMap();
  const normalize = (text) => String(text).replace(/\s+/g, ' ').trim();
  const language = () => root.document?.documentElement?.getAttribute('data-lang') === 'bg' ? 'bg' : 'en';
  const dictionary = new Map(Object.entries(messages).map(([en, bg]) => [normalize(en), bg]));

  function text(value, lang = language()) {
    if (typeof value !== 'string' || lang !== 'bg') return value;
    const source = normalize(value);
    const translated = dictionary.get(source);
    if (translated !== undefined) return value.replace(value.trim(), translated);
    const companyLabel = source.match(/^(.*) \((Agropolychim|Neochim|Solvay|LUKOIL|Heidelberg|Holcim|Biovet|Orgachim)\)$/);
    if (companyLabel) return `${text(companyLabel[1], lang)} (${text(companyLabel[2], lang)})`;
    const investment = source.match(/^Cumul\. Investment — (.*) \(M€\)$/);
    if (investment) return `Кумулативна инвестиция — ${text(investment[1], lang)} (млн. €)`;
    const priceSummary = source.match(/^(Low|Base|High) ROI_ETS values used now: (.*)\. Hover over the chart for exact annual values\.$/);
    if (priceSummary) return `${text(priceSummary[1], lang)} сценарий за ETS: ${priceSummary[2]}. Посочете графиката за точните годишни стойности.`;
    const duration = source.match(/^([<>]?\d+(?:\.\d+)?) (yr|yrs)( \(long-term\))?$/);
    if (duration) return `${duration[1]} год.${duration[3] ? ' (дългосрочно)' : ''}`;
    if (/^[+−-]?€[\d.,]+[MBk]$/.test(source)) return source.replace(/M$/, ' млн.').replace(/B$/, ' млрд.').replace(/k$/, ' хил.');
    if (/^[\d.,]+ kt$/.test(source)) return source.replace(/ kt$/, ' хил. т');
    if (/^€[\d.,]+\/tCO₂ \(break-even\)$/.test(source)) return source.replace('/tCO₂ (break-even)', '/т CO₂ (изплащане)');
    // Variable-bearing captions use explicit templates; identifiers and formulas stay intact.
    const patterns = [
      [/^TOTAL (\d{4}[–-]\d{4})$/, 'ОБЩО $1'],
      [/^Total: (.*)$/, 'Общо: $1'],
      [/^CBAM factor (.*)$/, 'Коефициент CBAM $1'],
      [/^CBAM-linked and EU ETS cost exposure · (.*)$/, 'Експозиция към разходи по CBAM и EU ETS · $1'],
      [/^Years from commissioning · sorted ascending · (.*)$/, 'Години от въвеждането в експлоатация · във възходящ ред · $1'],
      [/^Active pathway groups: (.*)$/, 'Активни технологични групи: $1'],
      [/^All pathway groups enabled\.$/, 'Всички технологични групи са включени.'],
      [/^Enabled pathways: (.*)$/, 'Включени технологични пътища: $1'],
      [/^(.+) selected$/, '$1 — избран сценарий'],
      [/^(.+) \| (Low|Base|High) scenario(.*)$/, '$1 | $2 сценарий$3'],
    ];
    for (const [pattern, replacement] of patterns) {
      if (pattern.test(source)) {
        const parts = source.match(pattern);
        let result = replacement;
        for (let index = 1; index < parts.length; index += 1) result = result.replace(`$${index}`, text(parts[index], lang));
        return result;
      }
    }
    for (const separator of [' · ', ' — ', ' | ', ': ']) {
      if (source.includes(separator)) return source.split(separator).map((part) => text(part, lang)).join(separator);
    }
    if (/Kt CO₂eq/.test(source)) return source.replace(/Kt CO₂eq/g, 'хил. т CO₂eq').replace('(official 2023)', '(официални, 2023)');
    return value;
  }

  function localizeNode(node) {
    const current = node.nodeValue;
    const saved = originals.get(node);
    const source = saved && current === saved.rendered ? saved.source : current;
    const rendered = text(source);
    originals.set(node, { source, rendered });
    if (rendered !== current) node.nodeValue = rendered;
  }

  function localizeAttributes(element) {
    let saved = attributeOriginals.get(element);
    if (!saved) { saved = {}; attributeOriginals.set(element, saved); }
    for (const name of ['title', 'aria-label', 'placeholder', 'alt']) {
      const current = element.getAttribute(name);
      if (!current || (name === 'aria-label' && element.hasAttribute('data-i18n-aria'))) continue;
      const previous = saved[name];
      const source = previous && current === previous.rendered ? previous.source : current;
      const rendered = text(source);
      saved[name] = { source, rendered };
      if (rendered !== current) element.setAttribute(name, rendered);
    }
  }

  function apply(target = root.document?.body) {
    if (!target) return;
    // Existing modules own their keyed translations. Never rewrite code or user inputs.
    function visit(node) {
      if (node.nodeType === 3) { localizeNode(node); return; }
      if (node.nodeType !== 1) return;
      if (['SCRIPT', 'STYLE', 'CODE', 'TEXTAREA', 'INPUT', 'CANVAS', 'SVG'].includes(node.tagName)) {
        if (node.tagName === 'INPUT') localizeAttributes(node);
        return;
      }
      localizeAttributes(node);
      if (node.hasAttribute('data-i18n') || node.closest?.('[data-core-i18n-ignore]')) return;
      for (const child of Array.from(node.childNodes)) visit(child);
    }
    visit(target);
  }

  function chartConfig(config) {
    function localize(value) {
      if (typeof value === 'string') return text(value);
      if (typeof value === 'function') {
        return function (...args) { return localize(value.apply(this, args)); };
      }
      if (Array.isArray(value)) return value.map(localize);
      if (value && typeof value === 'object') return Object.fromEntries(Object.entries(value).map(([key, item]) => [key, localize(item)]));
      return value;
    }
    const localized = localize(config);
    localized.options = { ...localized.options, locale: language() === 'bg' ? 'bg-BG' : 'en-US' };
    return localized;
  }

  function plotTraces(traces) {
    const localize = (value) => Array.isArray(value) ? value.map(localize) : typeof value === 'string' ? text(value) : value;
    // Translate display fields only. Plotly IDs and event metadata remain model keys.
    return traces.map((trace) => {
      const localized = { ...trace };
      for (const key of ['name', 'text', 'hovertext', 'customdata']) {
        if (key in trace) localized[key] = localize(trace[key]);
      }
      return localized;
    });
  }

  function observe() {
    if (!root.MutationObserver || !root.document?.body) return;
    const observer = new root.MutationObserver((records) => {
      const targets = new Set();
      for (const record of records) {
        if (record.type === 'characterData') targets.add(record.target.parentElement);
        else if (record.type === 'attributes') targets.add(record.target);
        else for (const node of record.addedNodes) targets.add(node.nodeType === 3 ? node.parentElement : node);
      }
      targets.forEach((target) => { if (target?.isConnected) apply(target); });
    });
    observer.observe(root.document.body, { childList: true, subtree: true, characterData: true, attributes: true, attributeFilter: ['title', 'aria-label', 'placeholder', 'alt'] });
    apply();
  }

  if (root.document?.readyState === 'loading') root.document.addEventListener('DOMContentLoaded', observe, { once: true });
  else observe();

  return Object.freeze({ text, apply, chartConfig, plotTraces, messages });
});
