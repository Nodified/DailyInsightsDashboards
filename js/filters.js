import { el, escapeHtml } from './util.js';

export function renderFilterBar(container, dashboard, rows, state, onChange) {
  container.innerHTML = '';
  const specs = dashboard.filters || [];
  const managed = new Set();

  for (const spec of specs) {
    if (spec.type === 'search') {
      const wrap = el(`<label class="filter search">
        <input type="search" placeholder="${escapeHtml(spec.placeholder || 'Search…')}"
               value="${escapeHtml(state.__search || '')}"></label>`);
      const input = wrap.querySelector('input');
      let timer;
      input.addEventListener('input', () => {
        clearTimeout(timer);
        timer = setTimeout(() => { state.__search = input.value; onChange(false); }, 200);
      });
      container.appendChild(wrap);
    } else if (spec.type === 'dropdown') {
      managed.add(spec.column);
      const values = (spec.values && spec.values.length
        ? spec.values // known dimensions up front
        : [...new Set(rows.map(r => r[spec.column]).filter(v => v !== '' && v != null))].sort()
      ).map(String);
      const selected = state[spec.column] != null ? String(state[spec.column]) : '';
      const opts = ['<option value="">All</option>'].concat(
        values.map(v => `<option value="${escapeHtml(v)}"${v === selected ? ' selected' : ''}>${escapeHtml(v)}</option>`));
      const wrap = el(`<label class="filter"><span>${escapeHtml(spec.label || spec.column)}</span>
        <select>${opts.join('')}</select></label>`);
      wrap.querySelector('select').addEventListener('change', e => {
        state[spec.column] = e.target.value;
        onChange(false);
      });
      container.appendChild(wrap);
    }
  }

  // Removable chips for filters applied via drill-down (?Column=Value)
  for (const [col, val] of Object.entries(state)) {
    if (col === '__search' || !val || managed.has(col)) continue;
    const chip = el(`<button class="chip" type="button">${escapeHtml(col)}: ${escapeHtml(String(val))} ✕</button>`);
    chip.addEventListener('click', () => { delete state[col]; onChange(true); });
    container.appendChild(chip);
  }
}
