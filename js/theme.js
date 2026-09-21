// js/theme.js — applies branding + theme from config/theme.config.js.
import config from '../config/theme.config.js';

let current = config.defaultTheme;
let listener = null;

// main.js registers a callback here so theme switches re-render in place
// (no page reload, filters preserved).
export function onThemeChange(cb) {
  listener = cb;
}

export function initTheme() {
  let saved = null;
  try { saved = localStorage.getItem('theme'); } catch { /* private-mode browsers */ }
  current = saved && config.themes[saved] ? saved : config.defaultTheme;

  const switcher = document.getElementById('theme-switcher');
  switcher.innerHTML = Object.keys(config.themes)
    .map(t => `<option value="${t}">${t.charAt(0).toUpperCase()}${t.slice(1)}</option>`)
    .join('');
  switcher.value = current;
  switcher.addEventListener('change', () => {
    try { localStorage.setItem('theme', switcher.value); } catch {}
    current = switcher.value;
    apply();
    if (listener) listener();   // main.js re-renders charts in the new palette
  });

  document.getElementById('app-logo').src = config.logo;
  document.getElementById('app-title').textContent = config.appName;
  document.title = config.appName;
  apply();
}

function apply() {
  const t = config.themes[current];
  const map = {
    bg: '--bg', surface: '--surface', text: '--text',
    muted: '--muted', border: '--border', primary: '--primary'
  };
  for (const [k, cssVar] of Object.entries(map)) {
    document.documentElement.style.setProperty(cssVar, t[k]);
  }
}

export function getTheme() {
  return config.themes[current];
}
