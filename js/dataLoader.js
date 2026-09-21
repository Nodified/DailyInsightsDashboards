const cache = new Map();

export async function loadDataset(source) {
  if (cache.has(source)) return cache.get(source);
  const res = await fetch(`${source}?t=${Date.now()}`); // cache-bust: feeds update daily
  if (!res.ok) throw new Error(`Could not load ${source} (HTTP ${res.status})`);
  const text = await res.text();
  const ext = source.split('.').pop().toLowerCase();
  let rows;
  if (ext === 'csv') rows = parseDelimited(text, ',');
  else if (ext === 'tsv' || ext === 'tab' || ext === 'txt') rows = parseDelimited(text, '\t');
  else rows = flattenRows(JSON.parse(text));
  cache.set(source, rows);
  return rows;
}

function parseDelimited(text, delimiter) {
  const out = Papa.parse(text.trim(), {
    header: true, delimiter, skipEmptyLines: 'greedy', dynamicTyping: true
  });
  if (out.errors.length) console.warn('Parse warnings:', out.errors);
  return out.data;
}

// JSON: array of objects (or a single object). Nested attributes are flattened
// to dot-paths ("geo.country") so they work as labels/aggregation points
// exactly like CSV column headers.
function flattenRows(json) {
  return (Array.isArray(json) ? json : [json]).map(flattenObject);
}

function flattenObject(obj, prefix = '', out = {}) {
  for (const [key, val] of Object.entries(obj)) {
    const name = prefix ? `${prefix}.${key}` : key;
    if (val && typeof val === 'object' && !Array.isArray(val)) flattenObject(val, name, out);
    else if (Array.isArray(val))
      out[name] = val.every(x => x == null || typeof x !== 'object') ? val.join(' | ') : JSON.stringify(val);
    else out[name] = val;
  }
  return out;
}
