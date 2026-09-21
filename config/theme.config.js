export default {
  appName: 'Daily Insights',
  logo: 'assets/logo.svg',
  currency: 'AUD',
  locale: 'en-AU',
  defaultTheme: 'dark',
  themes: {
    light: {
      bg: '#f4f6fb', surface: '#ffffff', text: '#1f2937', muted: '#6b7280',
      border: '#e5e7eb', primary: '#2563eb',
      palette: ['#2563eb', '#16a34a', '#f59e0b', '#ef4444', '#8b5cf6', '#0ea5e9', '#ec4899']
    },
    dark: {
      bg: '#111827', surface: '#1f2937', text: '#f9fafb', muted: '#9ca3af',
      border: '#374151', primary: '#60a5fa',
      palette: ['#60a5fa', '#4ade80', '#fbbf24', '#f87171', '#a78bfa', '#38bdf8', '#f472b6']
    }
  }
};