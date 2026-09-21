// js/aggregator.js — filtering, grouping, aggregation and number formatting.

export function applyFilters(rows, state, searchColumns) {
  const q = (state.__search || '').toLowerCase().trim();
  const dropdowns = Object.entries(state).filter(([k]) => k !== '__search');
  return rows.filter(r => {
    if (q) {
      const cols = searchColumns && searchColumns.length ? searchColumns : Object.keys(r);
      if (!cols.some(c => String(r[c] ?? '').toLowerCase().includes(q))) return false;
    }
    return dropdowns.every(([col, val]) => !val || String(r[col]) === String(val));
  });
}

export function computeValue(rows, agg = 'sum', column) {
  if (agg === 'count') return rows.length;
  const nums = rows.map(r => Number(r[column])).filter(n => !Number.isNaN(n));
  if (!nums.length) return 0;
  switch (agg) {
    case 'avg': return nums.reduce((a, b) => a + b, 0) / nums.length;
    case 'min': return Math.min(...nums);
    case 'max': return Math.max(...nums);
    default:    return nums.reduce((a, b) => a + b, 0); // sum
  }
}

export function aggregate(rows, { groupBy, agg = 'sum', column, topN, sort = 'value' }) {
  const groups = new Map();
  for (const r of rows) {
    const raw = r[groupBy];
    const key = raw === undefined || raw === null || raw === '' ? '(blank)' : raw;
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(r);
  }

  let entries = [...groups.entries()]
    .map(([label, grp]) => ({ label: String(label), grp, value: computeValue(grp, agg, column) }));

  if (sort === 'label') {
    const withTs = entries.map(e => ({ ...e, ts: Date.parse(e.label) }));
    if (withTs.every(e => !Number.isNaN(e.ts))) {       // date-like labels → chronological
      withTs.sort((a, b) => a.ts - b.ts);
      entries = withTs;
    } else {
      entries.sort((a, b) => a.label.localeCompare(b.label, undefined, { numeric: true }));
    }
  } else {
    entries.sort((a, b) => b.value - a.value);
  }

  if (topN && entries.length > topN) {                  // cap + merge remainder at ROW level
    const kept = entries.slice(0, topN);                // (correct for avg/min/max, not just sum)
    const otherRows = entries.slice(topN).flatMap(e => e.grp);
    kept.push({ label: 'Other', grp: otherRows, value: computeValue(otherRows, agg, column) });
    entries = kept;
  }

  return { labels: entries.map(e => e.label), values: entries.map(e => e.value) };
}

export function formatValue(v, format = 'number', currency = 'USD', locale) {
  const n = Number(v);
  if (Number.isNaN(n)) return String(v ?? '');
  if (format === 'currency')
    return new Intl.NumberFormat(locale, { style: 'currency', currency, maximumFractionDigits: 0 }).format(n);
  if (format === 'percent') return `${n.toFixed(1)}%`;
  return new Intl.NumberFormat(locale, { maximumFractionDigits: 2 }).format(n);
}
