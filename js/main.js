// js/main.js — hash router + render pipeline: load definition → load data → filter → render.
import config from '../config/theme.config.js';
import registry from '../dashboards/index.js';
import { initTheme, getTheme, onThemeChange } from './theme.js';
import { loadDataset } from './dataLoader.js';
import { applyFilters, computeValue, formatValue } from './aggregator.js';
import { renderFilterBar } from './filters.js';
import { renderChart, clearCharts } from './chartFactory.js';
import { el, escapeHtml } from './util.js';

// Preserved across re-renders of the same view (e.g. theme switch keeps filters)
let lastHash = null;
let lastState = null;
// Guards against stale async renders when navigating quickly
let renderSeq = 0;

initTheme();
buildNav();
onThemeChange(render);                      // live theme switch, no page reload
window.addEventListener('hashchange', render);
render();

function parseRoute() {
  const defaultId = registry.find(d => d.nav !== false).id;
  const hash = location.hash.slice(1) || `/${defaultId}`;
  const [path, query] = hash.split('?');
  const id = path.replace(/^\/+/, '');
  return { id: /^[\w-]+$/.test(id) ? id : null, params: new URLSearchParams(query || '') };
}

function buildNav() {
  const nav = document.getElementById('app-nav');
  nav.innerHTML = '';
  registry.filter(d => d.nav !== false)
    .forEach(d => nav.appendChild(el(`<a href="#/${d.id}">${escapeHtml(d.title)}</a>`)));
}

async function render() {
  const seq = ++renderSeq;
  const { id, params } = parseRoute();
  const status = document.getElementById('status');
  const filterBar = document.getElementById('filter-bar');
  const cardsEl = document.getElementById('cards');
  const chartsEl = document.getElementById('charts');
  filterBar.innerHTML = ''; cardsEl.innerHTML = ''; chartsEl.innerHTML = '';
  clearCharts();
  status.textContent = '';

  if (!id) { status.textContent = 'Dashboard not found.'; return; }
  document.querySelectorAll('#app-nav a')
    .forEach(a => a.classList.toggle('active', a.getAttribute('href') === `#/${id}`));

  let def;
  try {
    def = (await import(`../dashboards/${id}.js`)).default;
  } catch {
    if (seq === renderSeq) status.textContent = `No dashboard definition found for "${id}".`;
    return;
  }
  if (seq !== renderSeq) return;            // superseded by a newer navigation

  let rows;
  try {
    status.textContent = 'Loading data…';
    rows = await loadDataset(def.source);
  } catch (err) {
    if (seq === renderSeq) status.textContent = err.message;
    return;
  }
  if (seq !== renderSeq) return;            // superseded by a newer navigation

  // Filter state: search + dropdowns + drill-down context (?Column=Value).
  // Reused when re-rendering the same view, so theme switches keep your filters.
  const sameView = location.hash === lastHash && lastState;
  const state = sameView ? lastState : { __search: '' };
  if (!sameView) for (const [k, v] of params) state[k] = v;
  lastHash = location.hash;
  lastState = state;

  const searchSpec = (def.filters || []).find(f => f.type === 'search');

  const refresh = (rebuildBar) => {
    const visible = applyFilters(rows, state, searchSpec && searchSpec.columns);
    renderCards(def.cards || [], visible);
    chartsEl.innerHTML = '';
    clearCharts();
    (def.charts || []).forEach(spec =>
      renderChart(chartsEl, spec, visible, getTheme(), drilldown));
    status.textContent =
      `${visible.length.toLocaleString()} of ${rows.length.toLocaleString()} records`;
    if (rebuildBar) renderFilterBar(filterBar, def, rows, state, refresh);
  };

  renderFilterBar(filterBar, def, rows, state, refresh);
  refresh(false);

  function drilldown(targetId, column, value) {
    location.hash = `#/${targetId}?${encodeURIComponent(column)}=${encodeURIComponent(value)}`;
  }
}

function renderCards(cards, rows) {
  const container = document.getElementById('cards');
  container.innerHTML = '';
  for (const c of cards) {
    const value = computeValue(rows, c.agg || 'count', c.column);
    container.appendChild(el(`<div class="card">
      <span class="card-label">${escapeHtml(c.label)}</span>
      <span class="card-value">${formatValue(value, c.format, config.currency, config.locale)}</span>
    </div>`));
  }
}
